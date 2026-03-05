import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/bookings.dto';

@Injectable()
export class BookingsService {
    constructor(private prisma: PrismaService) { }

    async findAll(propertyId: string, query?: any) {
        const {
            status, paymentStatus, source, search, startDate, endDate,
            page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc'
        } = query || {};

        const where: any = { propertyId };

        if (status) where.status = status;
        if (paymentStatus) where.paymentStatus = paymentStatus;
        if (source) where.source = source;

        // Date range filtering
        if (startDate && endDate) {
            where.AND = [
                { checkIn: { lte: new Date(endDate) } },
                { checkOut: { gte: new Date(startDate) } }
            ];
        } else if (startDate) {
            where.checkOut = { gte: new Date(startDate) };
        } else if (endDate) {
            where.checkIn = { lte: new Date(endDate) };
        }

        // Fulltext search on booking code or guest name/phone
        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { guest: { name: { contains: search, mode: 'insensitive' } } },
                { guest: { phone: { contains: search, mode: 'insensitive' } } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const [total, data] = await Promise.all([
            this.prisma.booking.count({ where }),
            this.prisma.booking.findMany({
                where,
                skip,
                take,
                include: {
                    guest: true,
                    bookingRooms: {
                        include: { roomType: true, room: true }
                    },
                    payments: true
                },
                orderBy: { [sortBy]: sortOrder }
            })
        ]);

        return {
            data,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        };
    }

    async findById(id: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                guest: true,
                bookingRooms: {
                    include: { roomType: true, room: true }
                },
                payments: true,
                serviceUsages: {
                    include: { service: true }
                }
            }
        });

        if (!booking) throw new NotFoundException('Booking not found');
        return booking;
    }

    private async validateNoOverlap(rooms: { roomId?: string; checkIn: Date; checkOut: Date }[], excludeBookingId?: string) {
        // 1. Check internal overlap within the payload
        for (let i = 0; i < rooms.length; i++) {
            for (let j = i + 1; j < rooms.length; j++) {
                const r1 = rooms[i];
                const r2 = rooms[j];
                if (r1.roomId && r1.roomId === r2.roomId) {
                    if (r1.checkIn < r2.checkOut && r1.checkOut > r2.checkIn) {
                        throw new BadRequestException(`Yêu cầu không hợp lệ: Phòng đang bị chọn trùng lặp trong cùng một khoảng thời gian.`);
                    }
                }
            }
        }

        // 2. Check overlap with database
        for (const room of rooms) {
            if (!room.roomId) continue;

            const overlappingRoom = await this.prisma.bookingRoom.findFirst({
                where: {
                    roomId: room.roomId,
                    ...(excludeBookingId ? { bookingId: { not: excludeBookingId } } : {}),
                    booking: {
                        status: { notIn: ['CANCELLED', 'NO_SHOW'] }
                    },
                    AND: [
                        { checkIn: { lt: room.checkOut } },
                        { checkOut: { gt: room.checkIn } }
                    ]
                },
                include: {
                    room: true,
                    booking: true
                }
            });

            if (overlappingRoom) {
                const startStr = overlappingRoom.checkIn.toISOString().slice(0, 10);
                const endStr = overlappingRoom.checkOut.toISOString().slice(0, 10);
                throw new BadRequestException(`Phòng ${overlappingRoom.room?.roomNumber || room.roomId} đã có đơn đặt phòng (${overlappingRoom.booking.code}) trong khoảng thời gian từ ${startStr} đến ${endStr}`);
            }
        }
    }

    async create(userId: string, dto: CreateBookingDto) {
        // Validate overlapping
        const roomsToValidate = dto.rooms?.map(r => ({
            roomId: r.roomId,
            checkIn: new Date(r.checkIn),
            checkOut: new Date(r.checkOut)
        })) || [];

        await this.validateNoOverlap(roomsToValidate);

        // Generate a unique code like BK-123456
        const code = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Auto calculate nights if not provided
        const nights = dto.nights || Math.ceil((new Date(dto.checkOut).getTime() - new Date(dto.checkIn).getTime()) / (1000 * 3600 * 24));

        return this.prisma.booking.create({
            data: {
                code,
                status: 'NEW',
                source: dto.source || 'walk-in',
                checkIn: new Date(dto.checkIn),
                checkOut: new Date(dto.checkOut),
                nights,
                adults: dto.adults || 1,
                children: dto.children || 0,
                infants: dto.infants || 0,
                totalAmount: dto.totalAmount || 0,
                notes: dto.notes,
                guestId: dto.guestId,
                propertyId: dto.propertyId,
                createdById: userId,
                bookingRooms: {
                    create: dto.rooms?.map(r => ({
                        roomTypeId: r.roomTypeId,
                        roomId: r.roomId,
                        price: r.price,
                        checkIn: new Date(r.checkIn),
                        checkOut: new Date(r.checkOut)
                    })) || []
                }
            },
            include: {
                guest: true,
                bookingRooms: true
            }
        });
    }

    async update(id: string, dto: UpdateBookingDto) {
        const existing = await this.findById(id); // Ensure exists

        const data: any = { ...dto };
        if (dto.checkIn) data.checkIn = new Date(dto.checkIn);
        if (dto.checkOut) data.checkOut = new Date(dto.checkOut);

        // Validation check for overlapping if dates change
        if (data.checkIn || data.checkOut) {
            const checkIn = data.checkIn || existing.checkIn;
            const checkOut = data.checkOut || existing.checkOut;

            const roomsToValidate = existing.bookingRooms.map(br => ({
                roomId: br.roomId || undefined,
                checkIn: checkIn,
                checkOut: checkOut
            }));

            await this.validateNoOverlap(roomsToValidate, id);
        }

        return this.prisma.$transaction(async (tx) => {
            const updatedBooking = await tx.booking.update({
                where: { id },
                data,
                include: { guest: true, bookingRooms: true }
            });

            // Sync dates to BookingRooms if the overall booking dates changed
            if (data.checkIn || data.checkOut) {
                await tx.bookingRoom.updateMany({
                    where: { bookingId: id },
                    data: {
                        checkIn: data.checkIn || undefined,
                        checkOut: data.checkOut || undefined
                    }
                });
            }

            // Auto-create Housekeeping Task when checked-out
            if (data.status === 'CHECKED_OUT' && existing.status !== 'CHECKED_OUT') {
                for (const br of existing.bookingRooms) {
                    if (br.roomId) {
                        await tx.task.create({
                            data: {
                                title: 'Dọn sạch',
                                type: 'HOUSEKEEPING',
                                status: 'PENDING',
                                roomId: br.roomId,
                                bookingId: id,
                                propertyId: existing.propertyId,
                                description: `Khách check-out phòng ${br.room?.roomNumber || br.roomId}. Cần dọn sạch để đón khách mới.`,
                            }
                        });
                    }
                }
            }

            return updatedBooking;
        });
    }

    async addPayment(bookingId: string, amount: number, method: string, note?: string, staffId?: string) {
        const booking = await this.findById(bookingId);

        const payment = await this.prisma.payment.create({
            data: {
                amount,
                method,
                note,
                bookingId,
                staffId
            }
        });

        const newPaidAmount = booking.paidAmount + amount;
        const paymentStatus = newPaidAmount >= booking.totalAmount ? 'PAID' : 'PARTIAL';

        // Update booking paid amount and status
        await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                paidAmount: newPaidAmount,
                paymentStatus
            }
        });

        return payment;
    }

    async delete(id: string) {
        await this.findById(id); // Ensure exists
        return this.prisma.booking.delete({ where: { id } });
    }
}
