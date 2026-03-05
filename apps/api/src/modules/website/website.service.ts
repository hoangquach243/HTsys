import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WebsiteService {
    constructor(private readonly prisma: PrismaService) { }

    async getConfig(propertyId: string) {
        return (this.prisma as any).websiteConfig.findUnique({ where: { propertyId } });
    }

    async upsertConfig(propertyId: string, dto: any) {
        const { slug, ...rest } = dto;
        return (this.prisma as any).websiteConfig.upsert({
            where: { propertyId },
            update: dto,
            create: {
                propertyId,
                slug: slug || ('prop-' + propertyId.slice(0, 16)),
                ...rest,
            },
        });
    }

    // ---- Public Endpoints (no auth) ----

    async getPublicConfig(slug: string) {
        const config = await (this.prisma as any).websiteConfig.findUnique({
            where: { slug },
            include: {
                property: {
                    select: { name: true, phone: true, address: true, checkInTime: true, checkOutTime: true },
                },
            },
        });
        if (!config || !config.isPublished) throw new NotFoundException('Website not found or not published');
        return config;
    }

    async getPublicRoomTypes(slug: string) {
        const config = await (this.prisma as any).websiteConfig.findUnique({ where: { slug } });
        if (!config || !config.isPublished) throw new NotFoundException('Website not found');

        return this.prisma.roomType.findMany({
            where: { propertyId: config.propertyId },
            include: {
                rooms: { select: { id: true, roomNumber: true, floor: true, status: true } },
                ratePlans: { select: { id: true, name: true, basePrice: true, weekendPrice: true, isDefault: true } },
            },
            orderBy: { name: 'asc' },
        });
    }

    async getAvailability(slug: string, checkIn: string, checkOut: string) {
        const config = await (this.prisma as any).websiteConfig.findUnique({ where: { slug } });
        if (!config || !config.isPublished) throw new NotFoundException('Website not found');

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        const bookedRoomIds = await this.prisma.bookingRoom.findMany({
            where: {
                booking: {
                    propertyId: config.propertyId,
                    status: { in: ['NEW', 'CONFIRMED', 'CHECKED_IN'] },
                    checkIn: { lt: checkOutDate },
                    checkOut: { gt: checkInDate },
                },
            },
            select: { roomId: true },
        });

        const bookedSet = new Set(bookedRoomIds.filter(b => b.roomId).map((b: any) => b.roomId));

        const roomTypes = await this.prisma.roomType.findMany({
            where: { propertyId: config.propertyId },
            include: {
                rooms: true,
                ratePlans: { select: { id: true, name: true, basePrice: true, isDefault: true } },
            },
        });

        return roomTypes.map(rt => {
            const available = (rt as any).rooms.filter((r: any) => !bookedSet.has(r.id) && r.status === 'CLEAN');
            return {
                ...rt,
                availableRooms: available,
                availableCount: available.length,
            };
        });
    }

    async createPublicBooking(slug: string, dto: any) {
        const config = await (this.prisma as any).websiteConfig.findUnique({ where: { slug } });
        if (!config || !config.isPublished) throw new NotFoundException('Website not found');

        const { guestName, guestPhone, guestEmail, roomTypeId, checkIn, checkOut, notes } = dto;

        // Upsert guest
        let guest = await this.prisma.guest.findFirst({
            where: { phone: guestPhone, propertyId: config.propertyId },
        });

        if (!guest) {
            guest = await this.prisma.guest.create({
                data: {
                    name: guestName,
                    phone: guestPhone,
                    email: guestEmail || null,
                    propertyId: config.propertyId,
                },
            });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)));

        const roomType = await this.prisma.roomType.findFirst({
            where: { id: roomTypeId },
            include: { ratePlans: { where: { isDefault: true } } },
        });
        const basePrice = roomType?.ratePlans?.[0]?.basePrice ?? roomType?.basePrice ?? 0;
        const totalAmount = Number(basePrice) * nights;

        const code = 'WEB-' + Date.now().toString(36).toUpperCase();

        const booking = await this.prisma.booking.create({
            data: {
                code,
                propertyId: config.propertyId,
                guestId: guest.id,
                source: 'WEBSITE',
                checkIn: checkInDate,
                checkOut: checkOutDate,
                totalAmount,
                notes: notes || null,
                bookingRooms: {
                    create: [{
                        roomTypeId,
                        price: basePrice,
                        checkIn: checkInDate,
                        checkOut: checkOutDate,
                    }],
                },
            },
        });

        return { success: true, bookingCode: booking.code, totalAmount };
    }
}
