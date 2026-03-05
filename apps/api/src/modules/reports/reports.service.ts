import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    private getDateRange(period?: string) {
        const endDate = new Date();
        const startDate = new Date();

        if (period === '7days') {
            startDate.setDate(endDate.getDate() - 7);
        } else if (period === '30days') {
            startDate.setDate(endDate.getDate() - 30);
        } else if (period === 'lastMonth') {
            startDate.setMonth(endDate.getMonth() - 1);
            startDate.setDate(1);
            endDate.setDate(0); // last day of last month
        } else if (period === 'thisYear') {
            startDate.setMonth(0, 1);
        } else {
            // thisMonth default
            startDate.setDate(1);
        }

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate };
    }

    async getRevenueReport(propertyId: string, period?: string) {
        const { startDate, endDate } = this.getDateRange(period);

        const bookings = await this.prisma.booking.findMany({
            where: {
                propertyId,
                createdAt: { gte: startDate, lte: endDate },
                status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] }
            },
            include: {
                serviceUsages: {
                    select: { amount: true }
                }
            }
        });

        const dayDataMap = new Map();
        let totalRoom = 0;
        let totalServices = 0;
        let totalRevenue = 0;
        let totalCollected = 0;

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            dayDataMap.set(dateStr, { date: dateStr, total: 0, room: 0, services: 0 });
        }

        bookings.forEach(b => {
            const createdStr = `${b.createdAt.getDate().toString().padStart(2, '0')}/${(b.createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
            const dayData = dayDataMap.get(createdStr);

            const sRev = b.serviceUsages ? b.serviceUsages.reduce((sum: number, s: any) => sum + s.amount, 0) : 0;
            const rRev = b.totalAmount - sRev; // rough estimate if services included in total

            totalRoom += rRev;
            totalServices += sRev;
            totalRevenue += b.totalAmount;
            totalCollected += b.paidAmount;

            if (dayData) {
                dayData.room += rRev;
                dayData.services += sRev;
                dayData.total += b.totalAmount;
            }
        });

        // Minibar, f&b, etc. approximations for pie based on service names
        const serviceUsages = await this.prisma.serviceUsage.findMany({
            where: { booking: { propertyId, createdAt: { gte: startDate, lte: endDate } } },
            include: { service: true }
        });

        const catMap = new Map();
        serviceUsages.forEach(su => {
            const catName = su.service?.group ? 'Dịch vụ phân loại' : (su.service?.name || 'Khác');
            catMap.set(catName, (catMap.get(catName) || 0) + su.amount);
        });

        const pieData = [
            { name: 'Tiền phòng', value: totalRoom, color: '#3b82f6' }
        ];

        const colors = ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];
        let cIdx = 0;
        catMap.forEach((val, key) => {
            pieData.push({ name: key, value: val, color: colors[cIdx % colors.length] });
            cIdx++;
        });

        return {
            kpi: {
                totalRevenue,
                roomRevenue: totalRoom,
                serviceRevenue: totalServices,
                totalCollected
            },
            data: Array.from(dayDataMap.values()),
            pieData
        };
    }

    async getOperationsReport(propertyId: string, period?: string) {
        let { startDate, endDate } = this.getDateRange(period);
        if (period === 'next7days') {
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setDate(endDate.getDate() + 7);
            endDate.setHours(23, 59, 59, 999);
        }

        const bookings = await this.prisma.booking.findMany({
            where: { propertyId, status: { not: 'CANCELLED' } }
        });

        const totalRoomsAvailable = await this.prisma.room.count({ where: { roomType: { propertyId } } });

        const dayDataMap = new Map();
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
            dayDataMap.set(dateStr, { date: dateStr, d: new Date(d).getTime(), occ: 0, checkIn: 0, checkOut: 0, empty: totalRoomsAvailable });
        }

        let totalCheckIn = 0;
        let totalCheckOut = 0;
        let totalOccupiedNights = 0;

        bookings.forEach(b => {
            const cIn = new Date(b.checkIn).setHours(0, 0, 0, 0);
            const cOut = new Date(b.checkOut).setHours(0, 0, 0, 0);

            dayDataMap.forEach((dayData) => {
                if (dayData.d === cIn) {
                    dayData.checkIn++;
                    if (dayData.d >= startDate.getTime() && dayData.d <= endDate.getTime()) totalCheckIn++;
                }
                if (dayData.d === cOut) {
                    dayData.checkOut++;
                    if (dayData.d >= startDate.getTime() && dayData.d <= endDate.getTime()) totalCheckOut++;
                }
                if (dayData.d >= cIn && dayData.d < cOut) {
                    dayData.empty--;
                    dayData.occ = totalRoomsAvailable > 0 ? Math.round(((totalRoomsAvailable - dayData.empty) / totalRoomsAvailable) * 100) : 0;
                    if (dayData.d >= startDate.getTime() && dayData.d <= endDate.getTime()) totalOccupiedNights++;
                }
            });
        });

        const daysCount = dayDataMap.size;
        const avgOcc = totalRoomsAvailable > 0 && daysCount > 0 ? Math.round((totalOccupiedNights / (totalRoomsAvailable * daysCount)) * 100) : 0;

        return {
            kpi: {
                avgOcc,
                totalCheckIn,
                totalCheckOut,
                cleanPercent: 100 // Mocked clean
            },
            data: Array.from(dayDataMap.values()).map(({ d, ...rest }) => rest)
        };
    }

    async getPaymentsReport(propertyId: string, period?: string) {
        const { startDate, endDate } = this.getDateRange(period);

        const payments = await this.prisma.payment.findMany({
            where: {
                booking: { propertyId },
                createdAt: { gte: startDate, lte: endDate }
            }
        });

        let totalBank = 0;
        let totalCash = 0;
        let totalCard = 0;

        const dayDataMap = new Map();
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
            dayDataMap.set(dateStr, { date: dateStr, bank: 0, cash: 0, card: 0 });
        }

        payments.forEach(p => {
            const dateStr = `${p.createdAt.getDate()}/${p.createdAt.getMonth() + 1}`;
            const dayData = dayDataMap.get(dateStr);

            let pType = 'cash';
            if (p.method === 'BANK_TRANSFER') { pType = 'bank'; totalBank += p.amount; }
            else if (p.method === 'CARD') { pType = 'card'; totalCard += p.amount; }
            else { totalCash += p.amount; }

            if (dayData) {
                dayData[pType] += p.amount;
            }
        });

        // Unpaid
        const unpaidBookings = await this.prisma.booking.findMany({
            where: { propertyId, createdAt: { gte: startDate, lte: endDate } }
        });
        const totalDebt = unpaidBookings.reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

        return {
            kpi: {
                bank: totalBank,
                cash: totalCash,
                card: totalCard,
                debt: totalDebt
            },
            data: Array.from(dayDataMap.values())
        };
    }

    async getServicesReport(propertyId: string, period?: string) {
        const { startDate, endDate } = this.getDateRange(period);

        const services = await this.prisma.serviceUsage.findMany({
            where: { booking: { propertyId }, createdAt: { gte: startDate, lte: endDate } },
            include: { service: true }
        });

        let totalRev = 0;
        let totalQty = 0;
        const itemMap = new Map();
        const trendMap = new Map();

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            trendMap.set(`${d.getDate()}/${d.getMonth() + 1}`, { time: `${d.getDate()}/${d.getMonth() + 1}`, services: 0 });
        }

        services.forEach(su => {
            totalRev += su.amount;
            totalQty += su.quantity;

            if (su.service) {
                const i = itemMap.get(su.service.id);
                if (i) {
                    i.count += su.quantity;
                    i.revenue += su.amount;
                } else {
                    itemMap.set(su.service.id, { name: su.service.name, count: su.quantity, revenue: su.amount });
                }
            }

            const dateStr = `${su.createdAt.getDate()}/${su.createdAt.getMonth() + 1}`;
            if (trendMap.has(dateStr)) trendMap.get(dateStr).services += su.amount;
        });

        const sortedItems = Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue);
        const topRev = sortedItems[0] || { name: 'N/A', revenue: 0 };

        const sortedByCnt = Array.from(itemMap.values()).sort((a, b) => b.count - a.count);
        const topCnt = sortedByCnt[0] || { name: 'N/A', count: 0 };

        return {
            kpi: {
                totalRev,
                totalQty,
                topRev,
                topCnt
            },
            data: sortedItems.slice(0, 10),
            trendData: Array.from(trendMap.values())
        };
    }

    async getPerformanceReport(propertyId: string, period?: string) {
        const { startDate, endDate } = this.getDateRange(period);

        const bookings = await this.prisma.booking.findMany({
            where: { propertyId, checkIn: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } }
        });

        const totalRooms = await this.prisma.room.count({ where: { roomType: { propertyId } } });

        let totalRev = 0;
        let totalNightsSold = 0;
        let totalGuests = 0;

        const dayDataMap = new Map();
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
            dayDataMap.set(dateStr, { date: dateStr, d: new Date(d).getTime(), adr: 0, revpar: 0, rev: 0, occNights: 0 });
        }

        bookings.forEach(b => {
            totalRev += b.totalAmount;
            totalNightsSold += b.nights;
            totalGuests++;

            const cIn = new Date(b.checkIn).setHours(0, 0, 0, 0);
            const dailyRev = b.nights > 0 ? b.totalAmount / b.nights : b.totalAmount;

            dayDataMap.forEach(day => {
                if (day.d >= cIn && day.d < new Date(b.checkOut).getTime()) {
                    day.occNights++;
                    day.rev += dailyRev;
                }
            });
        });

        dayDataMap.forEach(day => {
            day.adr = day.occNights > 0 ? Math.round(day.rev / day.occNights) : 0;
            day.revpar = totalRooms > 0 ? Math.round(day.rev / totalRooms) : 0;
        });

        const daysStr = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
        const totalAvailable = totalRooms * daysStr;

        const occ = totalAvailable > 0 ? Math.round((totalNightsSold / totalAvailable) * 100) : 0;
        const adr = totalNightsSold > 0 ? Math.round(totalRev / totalNightsSold) : 0;
        const revpar = adr * (occ / 100);
        const alos = totalGuests > 0 ? Number((totalNightsSold / totalGuests).toFixed(1)) : 0;

        return {
            kpi: { adr, revpar, occ, alos },
            data: Array.from(dayDataMap.values()).map(({ d, rev, occNights, ...rest }) => rest)
        };
    }

    async getMonthlyReport(propertyId: string, year: string) {
        const targetYear = parseInt(year);

        const bookings = await this.prisma.booking.findMany({
            where: { propertyId, status: { not: 'CANCELLED' } },
            include: { serviceUsages: true }
        });

        const months = Array.from({ length: 12 }, (_, i) => ({
            monthStr: `Thg ${i + 1}`, monthIdx: i,
            revRoom: 0, revServ: 0, totalRevCurr: 0,
            totalRevPrev: 0,
            nightsSold: 0
        }));

        const prevYear = targetYear - 1;

        bookings.forEach(b => {
            const bYear = b.checkIn.getFullYear();
            const bMonth = b.checkIn.getMonth();

            const sRev = b.serviceUsages.reduce((acc: number, s: any) => acc + s.amount, 0);
            const rRev = b.totalAmount - sRev;

            if (bYear === targetYear) {
                months[bMonth].revRoom += rRev;
                months[bMonth].revServ += sRev;
                months[bMonth].totalRevCurr += b.totalAmount;
                months[bMonth].nightsSold += b.nights;
            } else if (bYear === prevYear) {
                months[bMonth].totalRevPrev += b.totalAmount;
            }
        });

        const totalRooms = await this.prisma.room.count({ where: { roomType: { propertyId } } });

        const data = months.map(m => ({
            month: m.monthStr,
            [prevYear.toString()]: m.totalRevPrev,
            [targetYear.toString()]: m.totalRevCurr
        }));

        const yearData = months.map(m => {
            const daysInM = new Date(targetYear, m.monthIdx + 1, 0).getDate();
            const totalAvail = totalRooms * daysInM;
            const occValue = totalAvail > 0 ? Math.round((m.nightsSold / totalAvail) * 100) : 0;
            const gross = Math.round(m.totalRevCurr * 0.6); // mockup gross profit

            return {
                month: m.monthIdx + 1,
                totalRev: m.totalRevCurr,
                roomRev: m.revRoom,
                servRev: m.revServ,
                nights: m.nightsSold,
                occ: occValue,
                gross
            };
        });

        return { data, yearData };
    }
}
