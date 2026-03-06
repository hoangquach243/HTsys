import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto, CreateExpenseDto, UpdateExpenseDto } from './dto/finance.dto';

@Injectable()
export class FinanceService {
    constructor(private prisma: PrismaService) { }

    // ===== PAYMENTS (Incoming) =====

    findAllPayments(propertyId: string, startDate?: string, endDate?: string) {
        const where: any = {
            booking: { propertyId }
        };

        if (startDate && endDate) {
            where.paidAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        return this.prisma.payment.findMany({
            where,
            include: {
                booking: {
                    select: {
                        code: true,
                        guest: { select: { name: true } },
                        bookingRooms: {
                            select: {
                                room: { select: { roomNumber: true } }
                            }
                        }
                    }
                },
                staff: { select: { name: true } }
            },
            orderBy: { paidAt: 'desc' }
        });
    }

    createPayment(dto: CreatePaymentDto) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Create payment
            const payment = await tx.payment.create({
                data: {
                    amount: dto.amount,
                    method: dto.method || 'cash',
                    note: dto.note,
                    bookingId: dto.bookingId,
                    staffId: dto.staffId
                }
            });

            // 2. Update booking paidAmount & paymentStatus
            const booking = await tx.booking.findUnique({ where: { id: dto.bookingId } });
            if (booking) {
                const newPaidAmount = booking.paidAmount + dto.amount;
                let newStatus = booking.paymentStatus;
                if (newPaidAmount >= booking.totalAmount) {
                    newStatus = 'PAID';
                } else if (newPaidAmount > 0) {
                    newStatus = 'PARTIAL';
                }

                await tx.booking.update({
                    where: { id: dto.bookingId },
                    data: {
                        paidAmount: newPaidAmount,
                        paymentStatus: newStatus
                    }
                });
            }

            return payment;
        });
    }

    // ===== RECEIVABLES (Công nợ) =====

    getReceivables(propertyId: string, startDate?: string, endDate?: string) {
        const where: any = {
            propertyId,
            paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
            status: { notIn: ['CANCELLED', 'NO_SHOW'] }
        };

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        return this.prisma.booking.findMany({
            where,
            include: {
                guest: { select: { name: true } },
                createdBy: { select: { name: true } },
                bookingRooms: {
                    select: {
                        room: { select: { roomNumber: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // ===== EXPENSES (Outgoing) =====

    findAllExpenses(propertyId: string, startDate?: string, endDate?: string) {
        const where: any = { propertyId };

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        return (this.prisma.expense as any).findMany({
            where,
            include: {
                createdBy: { select: { name: true } }
            },
            orderBy: { date: 'desc' }
        });
    }

    createExpense(dto: CreateExpenseDto) {
        return (this.prisma.expense as any).create({
            data: {
                code: dto.code || `PC-${Date.now().toString().slice(-6)}`,
                title: dto.title,
                category: dto.category,
                description: dto.description,
                amount: dto.amount,
                date: dto.date ? new Date(dto.date) : new Date(),
                isRecurring: dto.isRecurring || false,
                recurringInterval: dto.recurringInterval,
                recurringEndDate: dto.recurringEndDate ? new Date(dto.recurringEndDate) : null,
                propertyId: dto.propertyId,
                createdById: dto.createdById
            }
        });
    }

    updateExpense(id: string, dto: UpdateExpenseDto) {
        const data: any = { ...dto };
        if (dto.date) data.date = new Date(dto.date);
        if (dto.recurringEndDate) data.recurringEndDate = new Date(dto.recurringEndDate);

        return this.prisma.expense.update({
            where: { id },
            data
        });
    }

    deleteExpense(id: string) {
        return this.prisma.expense.delete({ where: { id } });
    }
}
