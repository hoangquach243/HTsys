import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto, CreateServiceUsageDto } from './dto/services.dto';

@Injectable()
export class ServicesService {
    constructor(private prisma: PrismaService) { }

    // ===== SERVICES CATALOG =====

    findAll(propertyId: string, query?: any) {
        const where: any = { propertyId };

        if (query?.isActive !== undefined) {
            where.isActive = query.isActive === 'true';
        }
        if (query?.type) where.type = query.type;
        if (query?.group) where.group = query.group;

        return this.prisma.service.findMany({
            where,
            orderBy: { name: 'asc' }
        });
    }

    async findById(id: string) {
        const service = await this.prisma.service.findUnique({ where: { id } });
        if (!service) throw new NotFoundException('Service not found');
        return service;
    }

    create(dto: CreateServiceDto) {
        return this.prisma.service.create({
            data: dto
        });
    }

    async update(id: string, dto: UpdateServiceDto) {
        await this.findById(id);
        return this.prisma.service.update({
            where: { id },
            data: dto
        });
    }

    async delete(id: string) {
        await this.findById(id);
        return this.prisma.service.delete({ where: { id } });
    }

    // ===== SERVICE USAGES (in Bookings) =====

    async addServiceToBooking(dto: CreateServiceUsageDto) {
        return this.prisma.$transaction(async (tx) => {
            const data: any = { ...dto };
            if (dto.date) data.date = new Date(dto.date);

            const usage = await tx.serviceUsage.create({ data });

            // Cập nhật tổng tiền Booking
            const booking = await tx.booking.findUnique({ where: { id: dto.bookingId } });
            if (booking) {
                let newStatus = booking.paymentStatus;
                const newTotal = booking.totalAmount + dto.amount;

                if (booking.paidAmount >= newTotal && newTotal > 0) newStatus = 'PAID';
                else if (booking.paidAmount > 0) newStatus = 'PARTIAL';
                else newStatus = 'UNPAID';

                await tx.booking.update({
                    where: { id: dto.bookingId },
                    data: { totalAmount: newTotal, paymentStatus: newStatus }
                });
            }
            return usage;
        });
    }

    async removeServiceFromBooking(usageId: string) {
        return this.prisma.$transaction(async (tx) => {
            const usage = await tx.serviceUsage.findUnique({ where: { id: usageId } });
            if (!usage) return null;

            await tx.serviceUsage.delete({ where: { id: usageId } });

            // Hoàn lại tiền cho booking
            const booking = await tx.booking.findUnique({ where: { id: usage.bookingId } });
            if (booking) {
                let newStatus = booking.paymentStatus;
                const newTotal = Math.max(0, booking.totalAmount - usage.amount);

                if (booking.paidAmount >= newTotal && newTotal > 0) newStatus = 'PAID';
                else if (booking.paidAmount > 0) newStatus = 'PARTIAL';
                else newStatus = 'UNPAID';

                await tx.booking.update({
                    where: { id: usage.bookingId },
                    data: { totalAmount: newTotal, paymentStatus: newStatus }
                });
            }
            return usage;
        });
    }

    async getBookingServices(bookingId: string) {
        return this.prisma.serviceUsage.findMany({
            where: { bookingId },
            include: { service: true },
            orderBy: { date: 'desc' }
        });
    }

    async updateServiceUsage(usageId: string, quantity: number, amount: number) {
        return this.prisma.$transaction(async (tx) => {
            const oldUsage = await tx.serviceUsage.findUnique({ where: { id: usageId } });
            if (!oldUsage) throw new Error("Usage not found");

            const diff = amount - oldUsage.amount;

            const usage = await tx.serviceUsage.update({
                where: { id: usageId },
                data: { quantity, amount }
            });

            if (diff !== 0) {
                const booking = await tx.booking.findUnique({ where: { id: usage.bookingId } });
                if (booking) {
                    let newStatus = booking.paymentStatus;
                    const newTotal = Math.max(0, booking.totalAmount + diff);

                    if (booking.paidAmount >= newTotal && newTotal > 0) newStatus = 'PAID';
                    else if (booking.paidAmount > 0) newStatus = 'PARTIAL';
                    else newStatus = 'UNPAID';

                    await tx.booking.update({
                        where: { id: usage.bookingId },
                        data: { totalAmount: newTotal, paymentStatus: newStatus }
                    });
                }
            }
            return usage;
        });
    }
}
