import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getFinancialSummary(propertyId: string, startDate?: string, endDate?: string) {
        const sDate = startDate ? new Date(startDate) : new Date(new Date().setDate(1)); // First day of month
        const eDate = endDate ? new Date(endDate) : new Date();

        // 1. Total Revenue (from paid bookings)
        const bookings = await this.prisma.booking.findMany({
            where: {
                propertyId,
                createdAt: { gte: sDate, lte: eDate },
            },
            select: { totalAmount: true, paidAmount: true }
        });

        const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
        const totalCollected = bookings.reduce((sum, b) => sum + b.paidAmount, 0);

        // 2. Total Expenses
        const expenses = await this.prisma.expense.findMany({
            where: {
                propertyId,
                date: { gte: sDate, lte: eDate }
            },
            select: { amount: true }
        });

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        return {
            period: { startDate: sDate, endDate: eDate },
            totalRevenue,
            totalCollected,
            totalExpenses,
            grossProfit: totalCollected - totalExpenses
        };
    }

    async getOperationalStats(propertyId: string, startDate?: string, endDate?: string) {
        const sDate = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
        const eDate = endDate ? new Date(endDate) : new Date();

        const bookings = await this.prisma.booking.findMany({
            where: {
                propertyId,
                checkIn: { gte: sDate, lte: eDate },
                status: { in: ['CHECKED_IN', 'CHECKED_OUT', 'CONFIRMED'] }
            },
            select: { nights: true, totalAmount: true }
        });

        // Approximate metrics
        const totalRoomNightsSold = bookings.reduce((sum, b) => sum + b.nights, 0);
        const totalRoomRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

        const totalRoomsCount = await this.prisma.room.count({ where: { roomType: { propertyId } } });

        const daysInPeriod = Math.max(1, Math.ceil((eDate.getTime() - sDate.getTime()) / (1000 * 3600 * 24)));
        const totalAvailableRoomNights = totalRoomsCount * daysInPeriod;

        const occupancyRate = totalAvailableRoomNights > 0 ? (totalRoomNightsSold / totalAvailableRoomNights) * 100 : 0;
        const adr = totalRoomNightsSold > 0 ? totalRoomRevenue / totalRoomNightsSold : 0;
        const revpar = adr * (occupancyRate / 100);

        return {
            period: { startDate: sDate, endDate: eDate },
            totalRoomsCount,
            totalRoomNightsSold,
            occupancyRate: Number(occupancyRate.toFixed(2)),
            adr: Number(adr.toFixed(0)),
            revpar: Number(revpar.toFixed(0))
        };
    }
}
