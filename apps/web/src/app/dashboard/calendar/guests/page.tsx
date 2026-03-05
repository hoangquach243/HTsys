'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format, subDays, addDays, isWithinInterval, startOfDay, isBefore, isAfter, endOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BookUser, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, Users } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const propertyId = 'clouq2m1q00003b6w5z8s6xy9';

export default function GuestsPage() {
    const defaultTomorrow = addDays(new Date(), 1);
    const [selectedDate, setSelectedDate] = useState<Date>(defaultTomorrow);
    const [rooms, setRooms] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Mặc định luôn là: hqua, hôm nay, ngày được chọn (có thể là ngày mai, hoặc xa hơn)
    const yesterday = startOfDay(subDays(new Date(), 1));
    const today = startOfDay(new Date());

    useEffect(() => {
        fetchData();
    }, [selectedDate, sortOrder]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Find min and max date among yesterday, today, selectedDate to define fetch window
            const dates = [yesterday, today, startOfDay(selectedDate)];
            const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
            const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

            // Fetch rooms
            const roomsRes = await fetch(`http://localhost:3001/api/rooms?propertyId=${propertyId}&limit=1000&sortOrder=${sortOrder}`);
            const roomsData = await roomsRes.json();

            // Adjust to API response format
            if (roomsData.data) {
                setRooms(roomsData.data);
            } else {
                setRooms(Array.isArray(roomsData) ? roomsData : []);
            }

            // Fetch bookings overlapping with the dates
            // limit=1000 to get all
            const sdIso = minDate.toISOString();
            const edIso = maxDate.toISOString();
            const bookingsRes = await fetch(`http://localhost:3001/api/bookings?propertyId=${propertyId}&limit=1000&startDate=${sdIso}&endDate=${edIso}`);
            const bookingsData = await bookingsRes.json();

            if (bookingsData.data) {
                setBookings(bookingsData.data);
            } else {
                setBookings(Array.isArray(bookingsData) ? bookingsData : []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const isBookingInDate = (booking: any, dateToCheck: Date) => {
        // Bookings are typically start from checkIn 14:00 to checkOut 12:00
        // A guest is staying on a `dateToCheck` (from 0:00 to 23:59) if:
        // checkIn is before or equal to the end of that date
        // AND checkOut is after or equal to the start of that date (meaning they leave on that day or later)
        // Usually, if they leave exactly on dateToCheck, they are considered staying that morning. 
        // But if we want strictly staying overnight, we might exclude checkOut == dateToCheck.
        // Let's use simple overlap: dateToCheck is between checkIn and checkOut.

        const cIn = startOfDay(new Date(booking.checkIn));
        const cOut = startOfDay(new Date(booking.checkOut));
        const target = startOfDay(dateToCheck);

        if (booking.status === 'CANCELLED' || booking.status === 'NO_SHOW') return false;

        // The guest is present on `target` day if they checked in on or before target, 
        // and checkout is strictly after target (they stay the night), 
        // OR if checkout is on target day (they was there in the morning).
        // Standard view: display if target >= cIn && target <= cOut.
        if (target >= cIn && target <= cOut) {
            return true;
        }
        return false;
    };

    const getBookingForRoomDate = (roomId: string, date: Date) => {
        // Find booking that has this room and covers the date
        return bookings.find(b => {
            const hasRoom = b.bookingRooms?.some((br: any) => br.roomId === roomId);
            if (!hasRoom) return false;
            return isBookingInDate(b, date);
        });
    };

    const StatusBadge = ({ booking, date }: { booking: any, date: Date }) => {
        if (!booking) return <div className="text-zinc-600 text-sm italic">- Trống -</div>;

        const cIn = startOfDay(new Date(booking.checkIn));
        const cOut = startOfDay(new Date(booking.checkOut));
        const target = startOfDay(date);

        const isCheckInDay = target.getTime() === cIn.getTime();
        const isCheckOutDay = target.getTime() === cOut.getTime();
        const guestName = booking.guest?.name || 'Khách lẻ';

        return (
            <div className={cn(
                "p-2 rounded border text-xs flex flex-col gap-1 w-full",
                isCheckOutDay ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                    isCheckInDay ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                        "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            )}>
                <span className="font-semibold text-white truncate" title={guestName}>{guestName}</span>
                <span className="opacity-80">
                    {isCheckOutDay ? 'Khách trả phòng' : isCheckInDay ? 'Khách đến' : 'Đang lưu trú'}
                </span>
                <span className="opacity-60 hidden sm:inline-block truncate">{booking.code}</span>
            </div>
        );
    };

    const targetDateLabel = format(selectedDate, 'dd/MM/yyyy');

    // Sort logic locally if API doesn't fully support sort on included relations.
    // The API /rooms returns rooms ordered by createdAt by default or by room name. 
    // We already passed sortOrder to the API.

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-emerald-500" />
                        Danh sách Khách lưu trú
                    </h1>
                    <p className="text-zinc-400 mt-1">Theo dõi trạng thái phòng của hôm qua, hôm nay và ngày tùy chọn.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                        <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800 text-white">
                            <SelectValue placeholder="Sắp xếp" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="asc">Sắp xếp tên tăng dần (A-Z)</SelectItem>
                            <SelectItem value="desc">Sắp xếp tên giảm dần (Z-A)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300">
                        <Download className="w-4 h-4 mr-2" />
                        Xuất Excel
                    </Button>
                </div>
            </div>

            <Card className="bg-zinc-950 border-zinc-900">
                <CardContent className="p-0">
                    <div className="overflow-x-auto rounded-lg border border-zinc-900 custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                    <th className="p-4 text-sm font-medium text-zinc-300 w-[20%] border-r border-zinc-800">
                                        LOẠI - PHÒNG
                                    </th>
                                    <th className="p-4 text-sm font-medium text-zinc-300 w-[26%] border-r border-zinc-800">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-400 uppercase text-xs font-bold mb-1 tracking-wider">Hôm qua</span>
                                            <span className="text-white bg-zinc-800/80 px-2 py-1 rounded inline-block w-max">
                                                {format(yesterday, 'dd/MM/yyyy')}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="p-4 text-sm font-medium text-zinc-300 w-[26%] border-r border-zinc-800">
                                        <div className="flex flex-col">
                                            <span className="text-emerald-400 uppercase text-xs font-bold mb-1 tracking-wider">Hôm nay</span>
                                            <span className="text-white bg-emerald-500/20 px-2 py-1 rounded inline-block w-max">
                                                {format(today, 'dd/MM/yyyy')}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="p-4 text-sm font-medium text-zinc-300 w-[28%]">
                                        <div className="flex flex-col">
                                            <span className="text-blue-400 uppercase text-xs font-bold mb-1 tracking-wider flex items-center justify-between">
                                                Ngày chọn (Mặc định NT)
                                            </span>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className={cn(
                                                        "w-full justify-start text-left font-normal bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white h-8 mt-1",
                                                        !selectedDate && "text-muted-foreground"
                                                    )}>
                                                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-400" />
                                                        {selectedDate ? format(selectedDate, "dd/MM/yyyy (EEEE)", { locale: vi }) : <span>Chọn ngày</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800">
                                                    <Calendar
                                                        mode="single"
                                                        selected={selectedDate}
                                                        onSelect={(d) => d && setSelectedDate(d)}
                                                        initialFocus
                                                        className="bg-zinc-900 text-white"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-zinc-500">
                                            <div className="animate-pulse flex flex-col items-center">
                                                <div className="h-8 w-8 rounded-full border-4 border-t-blue-500 border-zinc-800 animate-spin mb-4" />
                                                Đang tải dữ liệu phòng và khách...
                                            </div>
                                        </td>
                                    </tr>
                                ) : rooms.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-zinc-500">
                                            Chưa có phòng nào hoặc bị lỗi.
                                        </td>
                                    </tr>
                                ) : (
                                    [...rooms]
                                        .sort((a, b) => {
                                            const nameA = a.name || a.roomNumber || '';
                                            const nameB = b.name || b.roomNumber || '';
                                            return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
                                        })
                                        .map((room) => {
                                            const bYest = getBookingForRoomDate(room.id, yesterday);
                                            const bTod = getBookingForRoomDate(room.id, today);
                                            const bSel = getBookingForRoomDate(room.id, selectedDate);

                                            return (
                                                <tr key={room.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                                                    <td className="p-4 align-top border-r border-zinc-800/50">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                                                                <BookUser size={18} />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-white">{room.name}</div>
                                                                <div className="text-xs text-zinc-500">{room.roomType?.name || '---'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-top border-r border-zinc-800/50">
                                                        <StatusBadge booking={bYest} date={yesterday} />
                                                    </td>
                                                    <td className="p-4 align-top border-r border-zinc-800/50 bg-emerald-950/5">
                                                        <StatusBadge booking={bTod} date={today} />
                                                    </td>
                                                    <td className="p-4 align-top bg-blue-950/5">
                                                        <StatusBadge booking={bSel} date={selectedDate} />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
