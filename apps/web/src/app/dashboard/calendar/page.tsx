'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Layers, Plus } from 'lucide-react';
import { format, addDays, subDays, startOfDay, differenceInDays, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BookingModal } from '@/components/bookings/booking-modal';

export default function CalendarPage() {
    const [startDate, setStartDate] = useState(startOfDay(new Date()));
    const daysToShow = 14;

    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Drag-to-book State
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ roomId: string, roomTypeId: string, roomName: string, date: Date } | null>(null);
    const [dragCurrent, setDragCurrent] = useState<Date | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any>(null);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [editBookingData, setEditBookingData] = useState<any>({});

    // Compute date range
    const dates = useMemo(() => {
        return Array.from({ length: daysToShow }).map((_, i) => addDays(startDate, i));
    }, [startDate, daysToShow]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Room Types (including rooms). Dropped hardcoded propertyId to view all mock data.
                const typesRes = await fetch(`http://localhost:3001/api/rooms/types`);
                const typesData = await typesRes.json();

                // Fetch Bookings within window
                const endDate = addDays(startDate, daysToShow);
                const bookingsRes = await fetch(`http://localhost:3001/api/bookings?limit=100&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
                const bookingsData = await bookingsRes.json();

                setRoomTypes(Array.isArray(typesData) ? typesData : typesData.data || []);
                setBookings(bookingsData.data || []);
            } catch (error) {
                console.error("Failed to load calendar data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [startDate]);

    // Global drag cancel
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                setDragStart(null);
                setDragCurrent(null);
            }
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDragging]);

    // Drag Handlers
    const handleCellMouseDown = (room: any, type: any, date: Date, e: React.MouseEvent) => {
        e.preventDefault(); // prevent text selection
        setIsDragging(true);
        setDragStart({ roomId: room.id, roomTypeId: type.id, roomName: `${type.name} - ${room.roomNumber}`, date });
        setDragCurrent(date);
    };

    const handleCellMouseEnter = (room: any, date: Date) => {
        if (isDragging && dragStart?.roomId === room.id) {
            setDragCurrent(date);
        }
    };

    const handleCellMouseUp = (room: any, type: any, date: Date) => {
        if (isDragging && dragStart) {
            if (dragStart.roomId === room.id) {
                const sDate = dragStart.date <= date ? dragStart.date : date;
                const eDate = dragStart.date <= date ? date : dragStart.date;

                setModalData({
                    roomId: room.id,
                    roomTypeId: type.id,
                    roomName: `${type.name} - ${room.roomNumber}`,
                    checkIn: sDate,
                    checkOut: addDays(eDate, 1) // default checkout next day
                });
                setIsModalOpen(true);
            }
            setIsDragging(false);
            setDragStart(null);
            setDragCurrent(null);
        }
    };

    const refreshData = () => {
        // Trigger fetch again by forcing re-evaluation or just fetching manually
        setStartDate(new Date(startDate));
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
            case 'CONFIRMED': return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
            case 'CHECKED_IN': return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
            case 'CHECKED_OUT': return 'bg-zinc-500/20 border-zinc-500/30 text-zinc-400';
            case 'CANCELLED': return 'bg-red-500/20 border-red-500/30 text-red-400';
            default: return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
        }
    };

    const handlePrevious = () => setStartDate(subDays(startDate, 7));
    const handleNext = () => setStartDate(addDays(startDate, 7));
    const handleToday = () => setStartDate(startOfDay(new Date()));

    const handleSelectBooking = (booking: any) => {
        setEditBookingData({
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            checkIn: format(new Date(booking.checkIn), "yyyy-MM-dd'T'HH:mm"),
            checkOut: format(new Date(booking.checkOut), "yyyy-MM-dd'T'HH:mm"),
            totalAmount: booking.totalAmount
        });
        setSelectedBooking(booking);
    };

    const handleSaveBookingEdit = async (actionStatus?: string, actionPayment?: string) => {
        try {
            const payload = {
                status: actionStatus || editBookingData.status,
                paymentStatus: actionPayment || editBookingData.paymentStatus,
                checkIn: new Date(editBookingData.checkIn).toISOString(),
                checkOut: new Date(editBookingData.checkOut).toISOString(),
                totalAmount: Number(editBookingData.totalAmount)
            };
            const res = await fetch(`http://localhost:3001/api/bookings/${selectedBooking.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSelectedBooking(null);
                refreshData();
                alert("Đã cập nhật Đặt phòng thành công");
            } else {
                const err = await res.json();
                alert("Lỗi khi cập nhật: " + err.message);
            }
        } catch (error) {
            alert("Lỗi mạng khi cập nhật");
        }
    };

    const handleRequestCleaning = async () => {
        if (!selectedBooking || !selectedBooking.bookingRooms?.length) return;
        const roomId = selectedBooking.bookingRooms[0].roomId;
        try {
            const payload = {
                title: 'Dọn sơ',
                type: 'HOUSEKEEPING',
                status: 'PENDING',
                roomId: roomId,
                bookingId: selectedBooking.id,
                propertyId: 'clouq2m1q00003b6w5z8s6xy9',
                description: `Yêu cầu dọn sơ phòng ${selectedBooking.bookingRooms[0].room?.roomNumber || roomId} đang có khách lưu trú.`
            };
            const res = await fetch(`http://localhost:3001/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Đã gửi yêu cầu dọn phòng thành công!");
                setSelectedBooking(null);
            } else {
                const err = await res.json();
                alert("Lỗi khi gửi yêu cầu. " + err.message);
            }
        } catch (error) {
            alert("Lỗi mạng khi gửi yêu cầu.");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Lịch phòng</h1>
                    <p className="text-sm text-zinc-400">Timeline kéo thả và quản lý phòng trực quan.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800" onClick={handleToday}>
                        Hôm nay
                    </Button>
                    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md">
                        <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-9 w-9 text-zinc-400 hover:text-white rounded-none border-r border-zinc-800">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="px-4 text-sm font-medium text-white flex items-center gap-2 w-[240px] justify-center">
                            <CalendarIcon className="h-4 w-4 text-zinc-500" />
                            {format(startDate, 'dd/MM/yyyy')} - {format(addDays(startDate, daysToShow - 1), 'dd/MM/yyyy')}
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleNext} className="h-9 w-9 text-zinc-400 hover:text-white rounded-none border-l border-zinc-800">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="flex-1 bg-zinc-950 border-zinc-800 overflow-hidden flex flex-col items-stretch">
                <CardContent className="p-0 flex-1 flex flex-col relative h-full">
                    {loading && (
                        <div className="absolute inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-zinc-400">Đang tải dữ liệu lịch...</span>
                        </div>
                    )}

                    {/* Header: Dates */}
                    <div className="flex border-b border-zinc-800 w-full">
                        {/* Corner cell */}
                        <div className="w-48 flex-shrink-0 border-r border-zinc-800 p-3 bg-zinc-900 flex items-center justify-between">
                            <span className="text-sm font-medium text-zinc-400">Phòng</span>
                            <Filter className="h-4 w-4 text-zinc-500" />
                        </div>
                        {/* Dates row */}
                        <div className="flex-1 flex overflow-hidden">
                            {dates.map((date, i) => (
                                <div key={i} className={`flex-1 min-w-[80px] flex flex-col items-center justify-center p-2 border-r border-zinc-800 ${isSameDay(date, new Date()) ? 'bg-blue-500/10' : ''}`}>
                                    <span className="text-xs font-medium text-zinc-500 uppercase">{format(date, 'eee', { locale: vi })}</span>
                                    <span className={`text-lg font-bold ${isSameDay(date, new Date()) ? 'text-blue-400' : 'text-zinc-200'}`}>
                                        {format(date, 'dd')}
                                    </span>
                                    <span className="text-xs text-zinc-600 truncate max-w-full">{format(date, 'MM/yyyy')}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Grid Body */}
                    <div className="flex-1 overflow-y-auto flex">
                        {/* Y-Axis: Rooms */}
                        <div className="w-48 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/30">
                            {roomTypes.map(type => (
                                <div key={type.id}>
                                    <div className="p-2 h-[38px] bg-zinc-800/50 border-b border-zinc-800 flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                                        <span className="text-xs font-medium text-zinc-300 truncate" title={type.name}>{type.name}</span>
                                    </div>
                                    {type.rooms?.map((room: any) => (
                                        <div key={room.id} className="h-16 border-b border-zinc-800 p-3 flex flex-col justify-center relative group">
                                            <span className="text-sm font-medium text-white">{room.roomNumber}</span>
                                            <span className="text-xs text-zinc-500">Tầng {room.floor}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Grid & Bookings */}
                        <div className="flex-1 relative overflow-hidden flex flex-col">
                            {/* Grid Lines Overlay */}
                            <div className="absolute inset-0 flex pointer-events-none z-0">
                                {dates.map((date, i) => (
                                    <div key={i} className={`flex-1 min-w-[80px] border-r border-zinc-800/50 ${isSameDay(date, new Date()) ? 'bg-blue-500/5' : ''}`}></div>
                                ))}
                            </div>

                            {/* Room Rows & Booking Render*/}
                            {roomTypes.map(type => (
                                <div key={type.id} className="relative z-10 flex flex-col">
                                    {/* Type Header Row Spacer */}
                                    <div className="h-[38px] border-b border-zinc-800/50 bg-zinc-900/10 w-full flex">
                                        {/* Grey out the row corresponding to the category header */}
                                    </div>

                                    {/* Actual Room Rows */}
                                    {type.rooms?.map((room: any) => {
                                        // Find bookings for this room
                                        const roomBookings = bookings.filter(b => b.bookingRooms?.some((br: any) => br.roomId === room.id));

                                        // Calculate drag overlay bounds if active on this room
                                        let dragStyle = {};
                                        let showDrag = false;
                                        if (isDragging && dragStart && dragStart.roomId === room.id && dragCurrent) {
                                            const sDate = dragStart.date <= dragCurrent ? dragStart.date : dragCurrent;
                                            const eDate = dragStart.date <= dragCurrent ? dragCurrent : dragStart.date;

                                            const msPerDay = 1000 * 60 * 60 * 24;
                                            const startOffsetDays = (sDate.getTime() - startDate.getTime()) / msPerDay;
                                            // Make drag visual range include +1 day for visual clarity when dragging entire cells
                                            const durationDays = (eDate.getTime() - sDate.getTime()) / msPerDay + 1;

                                            const drawStartDay = Math.max(0, startOffsetDays);
                                            const drawEndDay = Math.min(daysToShow, startOffsetDays + durationDays);
                                            const drawWidth = drawEndDay - drawStartDay;

                                            const leftPercent = (drawStartDay / daysToShow) * 100;
                                            const widthPercent = (drawWidth / daysToShow) * 100;

                                            if (drawWidth > 0) {
                                                showDrag = true;
                                                dragStyle = {
                                                    left: `${leftPercent}%`,
                                                    width: `calc(${widthPercent}%)`
                                                };
                                            }
                                        }

                                        return (
                                            <div key={room.id} className="h-16 border-b border-zinc-800 flex w-full relative transition-colors select-none">
                                                {/* Rendering bookings as absolute blocks */}
                                                {roomBookings.map(booking => {
                                                    const checkIn = new Date(booking.checkIn);
                                                    const checkOut = new Date(booking.checkOut);

                                                    // Calculate if booking overlaps the current view
                                                    if (checkOut <= startDate || checkIn >= addDays(startDate, daysToShow)) return null;

                                                    const msPerDay = 1000 * 60 * 60 * 24;
                                                    // Fractional days since timeline start
                                                    const startOffsetDays = (checkIn.getTime() - startDate.getTime()) / msPerDay;
                                                    const durationDays = (checkOut.getTime() - checkIn.getTime()) / msPerDay;

                                                    // Clamp to view limits
                                                    const drawStartDay = Math.max(0, startOffsetDays);
                                                    const drawEndDay = Math.min(daysToShow, startOffsetDays + durationDays);
                                                    const drawWidth = Math.max(0, drawEndDay - drawStartDay);

                                                    const leftPercent = (drawStartDay / daysToShow) * 100;
                                                    const widthPercent = (drawWidth / daysToShow) * 100;

                                                    return (
                                                        <div
                                                            key={booking.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSelectBooking(booking);
                                                            }}
                                                            className={`absolute top-2 bottom-2 rounded-md border p-1.5 overflow-hidden flex flex-col cursor-pointer hover:brightness-110 shadow-sm transition-all z-20 ${getStatusColor(booking.status)}`}
                                                            style={{
                                                                left: `${leftPercent}%`,
                                                                width: `calc(${widthPercent}%)`, // Exact exact fractional width
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-center whitespace-nowrap">
                                                                <span className="text-xs font-bold truncate max-w-full">{booking.guest?.name || 'Walk-in'}</span>
                                                                <span className="text-[10px] opacity-70 ml-1 flex-shrink-0">{booking.nights}N</span>
                                                            </div>
                                                            <span className="text-[10px] truncate opacity-80 mt-auto">{booking.code}</span>
                                                        </div>
                                                    );
                                                })}

                                                {/* Drag Selection Overlay */}
                                                {showDrag && (
                                                    <div
                                                        className="absolute top-1 bottom-1 bg-blue-500/30 border-2 border-dashed border-blue-400/50 rounded pointer-events-none z-10 opacity-70"
                                                        style={dragStyle}
                                                    />
                                                )}

                                                {/* Empty Cells for interaction (Add Booking) */}
                                                {dates.map((date, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 min-w-[80px] h-full flex items-center justify-center hover:bg-zinc-800/40 cursor-crosshair transition-all z-10 border-r border-transparent"
                                                        onMouseDown={(e) => handleCellMouseDown(room, type, date, e)}
                                                        onMouseEnter={() => handleCellMouseEnter(room, date)}
                                                        onMouseUp={() => handleCellMouseUp(room, type, date)}
                                                    >
                                                        {/* Visual helper dots can be placed here if needed */}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    refreshData();
                }}
                initialData={modalData}
            />

            {/* View/Edit Details Dialog */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
                    <Card className="w-full max-w-lg bg-zinc-950 border-zinc-800 p-6 flex flex-col gap-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                            <h2 className="text-lg font-bold text-white">Quản lý Đặt phòng</h2>
                            <button onClick={() => setSelectedBooking(null)} className="text-zinc-400 hover:text-white">&times;</button>
                        </div>

                        <div className="space-y-4 text-sm text-zinc-300">
                            <div>
                                <p><strong className="text-zinc-100">Mã Booking:</strong> {selectedBooking.code}</p>
                                <p><strong className="text-zinc-100">Khách hàng:</strong> {selectedBooking.guest?.name || 'Walk-in'} ({selectedBooking.guest?.phone || 'Chưa cập nhật'})</p>
                                <p><strong className="text-zinc-100">Nguồn:</strong> <span className="uppercase">{selectedBooking.source}</span></p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-zinc-500 uppercase mb-1">Nhận phòng</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white [color-scheme:dark]"
                                        value={editBookingData.checkIn}
                                        onChange={e => setEditBookingData({ ...editBookingData, checkIn: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 uppercase mb-1">Trả phòng</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white [color-scheme:dark]"
                                        value={editBookingData.checkOut}
                                        onChange={e => setEditBookingData({ ...editBookingData, checkOut: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-zinc-500 uppercase mb-1">Trạng thái</label>
                                    <select
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white"
                                        value={editBookingData.status}
                                        onChange={e => setEditBookingData({ ...editBookingData, status: e.target.value })}
                                    >
                                        <option value="NEW">Mới</option>
                                        <option value="CONFIRMED">Xác nhận</option>
                                        <option value="CHECKED_IN">Đang ở</option>
                                        <option value="CHECKED_OUT">Đã rời đi</option>
                                        <option value="CANCELLED">Hủy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 uppercase mb-1">Thanh toán</label>
                                    <select
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white"
                                        value={editBookingData.paymentStatus}
                                        onChange={e => setEditBookingData({ ...editBookingData, paymentStatus: e.target.value })}
                                    >
                                        <option value="PENDING">Chưa thanh toán</option>
                                        <option value="PARTIAL">Một phần</option>
                                        <option value="PAID">Đã thanh toán</option>
                                        <option value="REFUNDED">Hoàn tiền</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-500 uppercase mb-1">Tổng tiền (VND)</label>
                                <input
                                    type="number"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-bold text-orange-400"
                                    value={editBookingData.totalAmount}
                                    onChange={e => setEditBookingData({ ...editBookingData, totalAmount: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-zinc-800 mt-2">
                                <Button variant="outline" className="mr-auto border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white" onClick={() => setSelectedBooking(null)}>Đóng</Button>

                                {(editBookingData.status === 'CHECKED_IN') && (
                                    <Button variant="outline" className="text-violet-400 border-violet-900/50 hover:bg-violet-900/20" onClick={() => handleRequestCleaning()}>
                                        Yêu cầu Dọn phòng
                                    </Button>
                                )}

                                <Button variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700" onClick={() => handleSaveBookingEdit()}>Lưu</Button>

                                {(editBookingData.status === 'NEW' || editBookingData.status === 'CONFIRMED') && (
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleSaveBookingEdit('CHECKED_IN')}>
                                        Check-in
                                    </Button>
                                )}

                                {editBookingData.status === 'CHECKED_IN' && (
                                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleSaveBookingEdit('CHECKED_OUT', 'PAID')}>
                                        Thu tiền nốt & Check-out
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
