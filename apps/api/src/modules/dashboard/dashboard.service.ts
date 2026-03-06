import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getDashboardSummary(propertyId: string, startDate?: string, endDate?: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const targetEndDate = endDate ? new Date(endDate) : new Date(today);
        targetEndDate.setHours(23, 59, 59, 999);

        const targetStartDate = startDate ? new Date(startDate) : new Date(targetEndDate);
        if (!startDate) {
            targetStartDate.setDate(targetEndDate.getDate() - 29); // Default to last 30 days including today
        }
        targetStartDate.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Calculate exact total days covered in filter
        const diffTime = Math.abs(targetEndDate.getTime() - targetStartDate.getTime());
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Fetch bookings for the dynamic date range
        const recentBookings = await this.prisma.booking.findMany({
            where: {
                propertyId,
                createdAt: { gte: targetStartDate, lte: targetEndDate },
                status: {
                    in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']
                }
            },
            include: {
                serviceUsages: true,
                bookingRooms: true,
            }
        });

        // 1. Calculate main KPIs
        let totalRevenue = 0;
        let roomRevenue = 0;
        let serviceRevenue = 0;
        let totalBookings = recentBookings.length;
        let totalRoomsInSystem = await this.prisma.room.count({ where: { roomType: { propertyId } } });
        // Assume total days of available nights = totalDays * totalRooms
        let availableNights = totalRoomsInSystem * totalDays;
        let soldNights = 0;

        // Daily chart data
        const dailyDataMap = new Map();
        for (let i = 0; i < totalDays; i++) {
            const d = new Date(targetStartDate);
            d.setDate(d.getDate() + i);
            const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            dailyDataMap.set(dateStr, { date: dateStr, revenue: 0, occupancy: 0, soldNights: 0 });
        }

        recentBookings.forEach(b => {
            const createdStr = `${b.createdAt.getDate().toString().padStart(2, '0')}/${(b.createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
            const sRev = b.serviceUsages ? b.serviceUsages.reduce((sum, su) => sum + su.amount, 0) : 0;
            const rRev = b.totalAmount - sRev;

            totalRevenue += b.totalAmount;
            roomRevenue += rRev;
            serviceRevenue += sRev;

            // Calculate nights
            let nights = 0;
            if (b.checkIn && b.checkOut) {
                const diffTime = Math.abs(b.checkOut.getTime() - b.checkIn.getTime());
                nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                soldNights += nights;
            }

            const dayData = dailyDataMap.get(createdStr);
            if (dayData) {
                dayData.revenue += b.totalAmount;
                dayData.soldNights += nights; // Add to day map calculation
            }
        });

        const chartData = Array.from(dailyDataMap.values()).map(d => ({
            ...d,
            occupancy: totalRoomsInSystem > 0 ? ((d.soldNights / totalRoomsInSystem) * 100).toFixed(1) : 0
        }));

        let occupancyRate = availableNights > 0 ? (soldNights / availableNights) * 100 : 0;
        let adr = soldNights > 0 ? roomRevenue / soldNights : 0;
        let revPar = availableNights > 0 ? roomRevenue / availableNights : 0;

        // Fetch cancellation rate
        const cancelledBookings = await this.prisma.booking.count({
            where: {
                propertyId,
                createdAt: { gte: targetStartDate, lte: targetEndDate },
                status: 'CANCELLED'
            }
        });
        const cancellationRate = totalBookings > 0 ? (cancelledBookings / (totalBookings + cancelledBookings)) * 100 : 0;

        // Determine tabs count
        // unassigned -> NEW
        // arriving -> CONFIRMED & checkInAt == today
        // departing -> CHECKED_IN & checkOutAt == today
        // inhouse -> CHECKED_IN
        // upcoming -> CONFIRMED & checkInAt > today

        const tabsBookings = await this.prisma.booking.findMany({
            where: {
                propertyId,
                status: {
                    in: ['NEW', 'CONFIRMED', 'CHECKED_IN']
                }
            },
            include: {
                guest: true,
                bookingRooms: {
                    include: {
                        room: true
                    }
                }
            }
        });

        let unassignedCount = 0;
        let arrivingCount = 0;
        let departingCount = 0;
        let inhouseCount = 0;
        let upcomingCount = 0;
        let newCount = 0;

        const tableData: any[] = [];

        tabsBookings.forEach(b => {
            const isCheckInToday = b.checkIn && b.checkIn.getTime() >= today.getTime() && b.checkIn.getTime() < tomorrow.getTime();
            const isCheckOutToday = b.checkOut && b.checkOut.getTime() >= today.getTime() && b.checkOut.getTime() < tomorrow.getTime();
            const isFutureCheckIn = b.checkIn && b.checkIn.getTime() >= tomorrow.getTime();

            let tabType = [];

            if (b.status === 'NEW') {
                newCount++;
                unassignedCount++;
                tabType.push('new', 'unassigned');
            } else if (b.status === 'CONFIRMED') {
                if (isCheckInToday) {
                    arrivingCount++;
                    tabType.push('arriving');
                }
                if (isFutureCheckIn) {
                    upcomingCount++;
                    tabType.push('upcoming');
                }
                if (!b.bookingRooms || b.bookingRooms.length === 0) {
                    unassignedCount++;
                    tabType.push('unassigned');
                }
            } else if (b.status === 'CHECKED_IN') {
                inhouseCount++;
                tabType.push('inhouse');
                if (isCheckOutToday) {
                    departingCount++;
                    tabType.push('departing');
                }
            }

            tableData.push({
                id: b.id,
                code: b.code,
                rooms: b.bookingRooms.map(br => br.room?.roomNumber).filter(Boolean).join(', '),
                guestName: b.guest ? b.guest.name : 'Chưa có thông tin',
                source: b.source || 'Walk-in',
                nights: b.checkIn && b.checkOut ? Math.ceil(Math.abs(b.checkOut.getTime() - b.checkIn.getTime()) / (1000 * 3600 * 24)) : 0,
                checkIn: b.checkIn,
                checkOut: b.checkOut,
                totalAmount: b.totalAmount,
                tabs: tabType
            });
        });

        const kpiCards = [
            { label: 'Tổng doanh thu', value: totalRevenue, icon: 'CreditCard', trend: '+12.5%', color: 'from-blue-500 to-blue-600' },
            { label: 'Tỷ lệ lấp đầy', value: `${occupancyRate.toFixed(1)}%`, icon: 'BarChart3', trend: '+5.2%', color: 'from-emerald-500 to-emerald-600' },
            { label: 'RevPAR', value: revPar, icon: 'DollarSign', trend: '+8.3%', color: 'from-violet-500 to-violet-600' },
        ];

        const subKpis = [
            { label: 'Doanh thu phòng', value: roomRevenue },
            { label: 'Doanh thu dịch vụ', value: serviceRevenue },
            { label: 'Giá phòng TB (ADR)', value: adr },
            { label: 'SL Đặt phòng', value: totalBookings },
            { label: 'Đêm đã bán', value: soldNights },
            { label: 'Tỷ lệ hủy', value: `${cancellationRate.toFixed(1)}%` },
        ];

        const roomStatusTabs = [
            { key: 'unassigned', label: 'Chưa xếp phòng', count: unassignedCount },
            { key: 'arriving', label: 'Sắp nhận phòng', count: arrivingCount },
            { key: 'departing', label: 'Sắp trả phòng', count: departingCount },
            { key: 'inhouse', label: 'Đang lưu trú', count: inhouseCount },
            { key: 'upcoming', label: 'Khách sẽ đến', count: upcomingCount },
            { key: 'new', label: 'Đặt mới', count: newCount },
        ];

        return {
            kpiCards,
            subKpis,
            chartData,
            roomStatusTabs,
            tableData
        };
    }
}
