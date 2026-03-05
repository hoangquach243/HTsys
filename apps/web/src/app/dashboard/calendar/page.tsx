'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Layers, Plus } from 'lucide-react';
import { format, addDays, subDays, startOfDay, differenceInDays, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BookingModal } from '@/components/bookings/booking-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CalendarPage() {
    const [startDate, setStartDate] = useState(startOfDay(new Date()));
    const daysToShow = 14;
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

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
    const [isEditingBooking, setIsEditingBooking] = useState(false);

    // Services State
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [bookingServices, setBookingServices] = useState<any[]>([]);
    const [newService, setNewService] = useState({ serviceId: '', quantity: 1, unitPrice: 0, customName: '' });
    const [serviceToRemove, setServiceToRemove] = useState<{ id: string; amount: number } | null>(null);

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

                // Fetch available services
                const servicesRes = await fetch(`http://localhost:3001/api/services?propertyId=clouq2m1q00003b6w5z8s6xy9`);
                if (servicesRes.ok) {
                    const servData = await servicesRes.json();
                    setAvailableServices(Array.isArray(servData) ? servData : servData.data || []);
                }
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
        setIsEditingBooking(false);
        const bookingDate = new Date(booking.checkIn);
        setEditBookingData({
            checkIn: format(bookingDate, "yyyy-MM-dd'T'HH:mm"),
            checkOut: format(new Date(booking.checkOut), "yyyy-MM-dd'T'HH:mm"),
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            totalAmount: booking.totalAmount
        });

        // Load services for this booking
        fetch(`http://localhost:3001/api/services/usages/${booking.id}`)
            .then(res => res.json())
            .then(data => {
                setBookingServices(Array.isArray(data) ? data : data.data || []);
            })
            .catch(console.error);
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

    const handleCheckout = async () => {
        if (!selectedBooking) return;

        try {
            const now = new Date();
            const checkInDate = new Date(selectedBooking.checkIn);

            // Calculate nights stayed up to now
            let calcNights = Math.ceil((now.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
            calcNights = Math.max(1, calcNights); // At least 1 night

            // Calculate original room rate
            const origCheckOut = new Date(selectedBooking.checkOut);
            const origNights = Math.max(1, differenceInDays(origCheckOut, checkInDate));
            const servicesSum = bookingServices.reduce((a, b) => a + b.amount, 0);
            const origRoomTotal = Math.max(0, Number(selectedBooking.totalAmount || 0) - servicesSum);
            const roomRate = origRoomTotal / origNights;

            // Recalculate new total
            const newTotal = (roomRate * calcNights) + servicesSum;

            const payload = {
                status: 'CHECKED_OUT',
                checkOut: now.toISOString(),
                totalAmount: newTotal
            };

            const res = await fetch(`http://localhost:3001/api/bookings/${selectedBooking.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSelectedBooking(null);
                refreshData();
                alert(`Đã Check-out thành công. Hệ thống chốt số đêm thực tế là ${calcNights} đêm.`);
            } else {
                const err = await res.json();
                alert("Lỗi khi Check-out: " + err.message);
            }
        } catch (error) {
            alert("Lỗi mạng khi Check-out");
        }
    };

    const handleDeleteBooking = async () => {
        if (!selectedBooking) return;
        if (!window.confirm("Bạn có chắc chắn muốn xóa đơn đặt phòng này? Hành động này không thể hoàn tác.")) return;

        try {
            const res = await fetch(`http://localhost:3001/api/bookings/${selectedBooking.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setSelectedBooking(null);
                refreshData();
                alert("Đã xóa Đặt phòng thành công");
            } else {
                const err = await res.json();
                alert("Lỗi khi xóa: " + err.message);
            }
        } catch (error) {
            alert("Lỗi mạng khi xóa");
        }
    };

    const handlePrint = async (type: string) => {
        try {
            const res = await fetch(`http://localhost:3001/api/settings/print-templates/type/${type}?propertyId=clouq2m1q00003b6w5z8s6xy9`);
            const templateData = await res.json();

            if (!templateData || !templateData.content) {
                alert("Mẫu in chưa được cấu hình. Vui lòng vào Cài đặt -> Mẫu in ấn.");
                return;
            }

            let content = templateData.content;

            const today = new Date();
            const formatVND = (val: number) => val.toLocaleString('vi-VN');

            content = content.replace(/{{printDate}}/g, format(today, 'dd/MM/yyyy HH:mm'));
            content = content.replace(/{{propertyName}}/g, "GoHost Clone System");
            content = content.replace(/{{propertyPhone}}/g, "0123.456.789");
            content = content.replace(/{{propertyAddress}}/g, "Hanoi, Vietnam");

            content = content.replace(/{{guestName}}/g, selectedBooking.guest?.name || 'Khách vãng lai');
            content = content.replace(/{{guestPhone}}/g, selectedBooking.guest?.phone || '...');
            content = content.replace(/{{bookingCode}}/g, selectedBooking.code);

            const roomName = selectedBooking.room?.roomNumber || '...';
            content = content.replace(/{{roomName}}/g, roomName);
            content = content.replace(/{{checkInDate}}/g, format(new Date(selectedBooking.checkIn), 'dd/MM/yyyy'));
            content = content.replace(/{{checkInTime}}/g, format(new Date(selectedBooking.checkIn), 'HH:mm'));
            content = content.replace(/{{checkOutDate}}/g, format(new Date(selectedBooking.checkOut), 'dd/MM/yyyy'));
            content = content.replace(/{{checkOutTime}}/g, format(new Date(selectedBooking.checkOut), 'HH:mm'));

            const nights = Math.max(1, differenceInDays(new Date(selectedBooking.checkOut), new Date(selectedBooking.checkIn)));
            content = content.replace(/{{nights}}/g, nights.toString());

            const roomTotal = Math.max(0, Number(selectedBooking.totalAmount || 0) - bookingServices.reduce((a, b) => a + b.amount, 0));
            content = content.replace(/{{roomPrice}}/g, formatVND(roomTotal / nights));
            content = content.replace(/{{roomTotal}}/g, formatVND(roomTotal));

            let servicesHtml = '';
            for (const s of bookingServices) {
                servicesHtml += `
            <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${s.service?.name}</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">${s.quantity}</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">${formatVND(s.unitPrice)} đ</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">${formatVND(s.amount)} đ</td>
            </tr>`;
            }
            content = content.replace(/{{servicesList}}/g, servicesHtml);

            const total = Number(selectedBooking.totalAmount || 0);
            const paid = selectedBooking.paymentStatus === 'PAID' ? total : 0;
            const balance = total - paid;

            content = content.replace(/{{grandTotal}}/g, formatVND(total));
            content = content.replace(/{{paidAmount}}/g, formatVND(paid));
            content = content.replace(/{{paidAmountText}}/g, paid > 0 ? "... đồng" : "Không có");
            content = content.replace(/{{balanceDue}}/g, formatVND(balance));

            const printWindow = window.open('', '', 'width=800,height=800');
            if (printWindow) {
                printWindow.document.write(content);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi mạng khi tải mẫu in");
        }
    };

    const handleAddServiceUsage = async () => {
        if (!newService.serviceId) {
            alert("Vui lòng chọn một dịch vụ");
            return;
        }

        let serviceIdToUse = newService.serviceId;

        if (newService.serviceId === 'NEW_SERVICE') {
            if (!newService.customName) {
                alert("Vui lòng nhập tên dịch vụ mới");
                return;
            }
            try {
                const res = await fetch(`http://localhost:3001/api/services`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: newService.customName,
                        price: newService.unitPrice,
                        propertyId: 'clouq2m1q00003b6w5z8s6xy9',
                        type: 'SERVICE'
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    setAvailableServices([...availableServices, data]);
                    serviceIdToUse = data.id;
                } else {
                    alert('Lỗi tạo dịch vụ');
                    return;
                }
            } catch (e) {
                alert('Lỗi mạng khi tạo dịch vụ');
                return;
            }
        }

        // Check if service already exists in bookingServices
        const existingUsage = bookingServices.find(s => s.serviceId === serviceIdToUse && s.unitPrice === newService.unitPrice);
        if (existingUsage) {
            handleUpdateServiceQuantity(existingUsage.id, existingUsage.quantity + newService.quantity, existingUsage.unitPrice, existingUsage.amount);
            setNewService({ serviceId: '', quantity: 1, unitPrice: 0, customName: '' });
            return;
        }

        const amount = newService.unitPrice * newService.quantity;

        try {
            const res = await fetch(`http://localhost:3001/api/services/usages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: selectedBooking.id,
                    serviceId: serviceIdToUse,
                    quantity: newService.quantity,
                    unitPrice: newService.unitPrice,
                    amount: amount,
                    note: 'Thêm từ Lịch'
                })
            });

            if (res.ok) {
                // Update booking total
                const patchRes = await fetch(`http://localhost:3001/api/bookings/${selectedBooking.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        totalAmount: Number(editBookingData.totalAmount) + amount
                    })
                });

                if (patchRes.ok) {
                    setEditBookingData({ ...editBookingData, totalAmount: Number(editBookingData.totalAmount) + amount });

                    // Reload usages
                    const usagesRes = await fetch(`http://localhost:3001/api/services/usages/${selectedBooking.id}`);
                    const newUsages = await usagesRes.json();
                    setBookingServices(Array.isArray(newUsages) ? newUsages : newUsages.data || []);

                    setNewService({ serviceId: '', quantity: 1, unitPrice: 0, customName: '' });
                    refreshData();
                    alert("Đã thêm dịch vụ");
                }
            } else {
                alert("Lỗi khi thêm dịch vụ");
            }
        } catch (error) {
            alert("Lỗi mạng");
        }
    };

    const handleRemoveServiceUsage = async (usageId: string, usageAmount: number) => {
        try {
            const res = await fetch(`http://localhost:3001/api/services/usages/${usageId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                const patchRes = await fetch(`http://localhost:3001/api/bookings/${selectedBooking.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        totalAmount: Number(editBookingData.totalAmount) - usageAmount
                    })
                });

                if (patchRes.ok) {
                    setEditBookingData({ ...editBookingData, totalAmount: Number(editBookingData.totalAmount) - usageAmount });
                    setBookingServices(bookingServices.filter(s => s.id !== usageId));
                    refreshData();
                }
            } else {
                alert("Lỗi khi xóa dịch vụ");
            }
        } catch (error) {
            alert("Lỗi mạng");
        }
    };

    const handleUpdateServiceQuantity = async (usageId: string, newQuantity: number, unitPrice: number, oldAmount: number) => {
        if (newQuantity < 1) return;
        const newAmount = newQuantity * unitPrice;
        const diffAmount = newAmount - oldAmount;

        try {
            // Update the usage
            const res = await fetch(`http://localhost:3001/api/services/usages/${usageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQuantity, amount: newAmount })
            });

            if (res.ok) {
                // Update booking total
                const patchRes = await fetch(`http://localhost:3001/api/bookings/${selectedBooking.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        totalAmount: Number(editBookingData.totalAmount) + diffAmount
                    })
                });

                if (patchRes.ok) {
                    setEditBookingData({ ...editBookingData, totalAmount: Number(editBookingData.totalAmount) + diffAmount });
                    setBookingServices(bookingServices.map(s => s.id === usageId ? { ...s, quantity: newQuantity, amount: newAmount } : s));
                    refreshData();
                }
            } else {
                alert("Lỗi khi cập nhật số lượng");
            }
        } catch (error) {
            alert("Lỗi mạng");
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
                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="px-4 text-sm font-medium text-white flex items-center gap-2 w-[240px] justify-center hover:bg-zinc-800 rounded-none h-9">
                                    <CalendarIcon className="h-4 w-4 text-zinc-500" />
                                    {format(startDate, 'dd/MM/yyyy')} - {format(addDays(startDate, daysToShow - 1), 'dd/MM/yyyy')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800 text-zinc-100" align="center">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => {
                                        if (date) {
                                            setStartDate(startOfDay(date));
                                            setIsDatePickerOpen(false);
                                        }
                                    }}
                                    initialFocus
                                    className="bg-zinc-950 text-zinc-100"
                                />
                            </PopoverContent>
                        </Popover>
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

                    {/* Outer Scroll Container */}
                    <div className="flex-1 overflow-auto flex flex-col relative custom-scrollbar">
                        <div className="flex flex-col min-w-max relative flex-1">
                            {/* Header: Dates */}
                            <div className="flex border-b border-zinc-800 w-full sticky top-0 z-40 bg-zinc-950">
                                {/* Corner cell */}
                                <div className="w-48 flex-shrink-0 border-r border-zinc-800 p-3 bg-zinc-900 flex items-center justify-between sticky left-0 z-50">
                                    <span className="text-sm font-medium text-zinc-400">Phòng</span>
                                    <Filter className="h-4 w-4 text-zinc-500" />
                                </div>
                                {/* Dates row */}
                                <div className="flex-1 flex">
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
                            <div className="flex-1 flex relative">
                                {/* Y-Axis: Rooms */}
                                <div className="w-48 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 sticky left-0 z-30">
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
            {
                selectedBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
                        <Card className="w-full max-w-lg bg-zinc-950 border-zinc-800 p-6 flex flex-col gap-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <h2 className="text-lg font-bold text-white">Quản lý Đặt phòng</h2>
                                <button onClick={() => setSelectedBooking(null)} className="text-zinc-400 hover:text-white">&times;</button>
                            </div>

                            <Tabs defaultValue="info" className="w-full text-sm">
                                <TabsList className="grid w-full grid-cols-2 bg-zinc-900 mb-4 h-9 p-1">
                                    <TabsTrigger value="info" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">Thông tin chung</TabsTrigger>
                                    <TabsTrigger value="services" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">Dịch vụ bổ sung</TabsTrigger>
                                </TabsList>
                                <TabsContent value="info" className="mt-0 focus-visible:outline-none">
                                    <fieldset disabled={!isEditingBooking} className="border-none p-0 m-0 min-w-0 w-full space-y-4">
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
                                            <label className="block text-xs text-zinc-500 uppercase mb-1">Cơ cấu Doanh thu</label>
                                            <div className="bg-zinc-900 border border-zinc-800 rounded p-3 text-sm flex flex-col gap-2">
                                                <div className="flex justify-between items-center text-zinc-400">
                                                    <span>Tiền phòng:</span>
                                                    <span className="text-zinc-200">{(Number(editBookingData.totalAmount || 0) - bookingServices.reduce((a, b) => a + b.amount, 0)).toLocaleString('vi-VN')} VND</span>
                                                </div>
                                                <div className="flex justify-between items-center text-zinc-400">
                                                    <span>Tiền dịch vụ:</span>
                                                    <span className="text-zinc-200">{bookingServices.reduce((a, b) => a + b.amount, 0).toLocaleString('vi-VN')} VND</span>
                                                </div>
                                                <div className="flex justify-between items-center border-t border-zinc-800 pt-2 mt-1">
                                                    <span className="text-zinc-300 uppercase text-xs">Tổng thu khách (VND):</span>
                                                    <input
                                                        type="number"
                                                        className="w-32 bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded p-1 text-right text-white font-bold text-orange-400 outline-none"
                                                        value={editBookingData.totalAmount}
                                                        onChange={e => setEditBookingData({ ...editBookingData, totalAmount: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>
                                </TabsContent>

                                <TabsContent value="services" className="mt-0 focus-visible:outline-none">
                                    <fieldset disabled={!isEditingBooking} className="border-none p-0 m-0 min-w-0 w-full space-y-4">
                                        <div className="flex gap-2 flex-wrap mb-2">
                                            <select
                                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded p-2 text-white text-sm min-w-40"
                                                value={newService.serviceId}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (val === 'NEW_SERVICE') {
                                                        setNewService(prev => ({ ...prev, serviceId: val, unitPrice: 0, customName: '' }));
                                                    } else {
                                                        const srv = availableServices.find((s: any) => s.id === val);
                                                        setNewService(prev => ({ ...prev, serviceId: val, unitPrice: srv ? srv.price : 0, customName: '' }));
                                                    }
                                                }}
                                            >
                                                <option value="">-- Chọn dịch vụ --</option>
                                                {availableServices.map((s: any) => (
                                                    <option key={s.id} value={s.id}>{s.name} ({s.price.toLocaleString()} VND)</option>
                                                ))}
                                                <option value="NEW_SERVICE">+ Tạo dịch vụ tùy chỉnh</option>
                                            </select>

                                            {newService.serviceId === 'NEW_SERVICE' && (
                                                <input
                                                    type="text"
                                                    className="w-full sm:w-auto flex-1 bg-zinc-900 border border-zinc-800 rounded p-2 text-white text-sm"
                                                    value={newService.customName}
                                                    onChange={e => setNewService({ ...newService, customName: e.target.value })}
                                                    placeholder="Tên dịch vụ mới"
                                                />
                                            )}

                                            <input
                                                type="number"
                                                min="0"
                                                className="w-28 bg-zinc-900 border border-zinc-800 rounded p-2 text-right text-white text-sm"
                                                value={newService.unitPrice}
                                                onChange={e => setNewService({ ...newService, unitPrice: Number(e.target.value) })}
                                                placeholder="Đơn giá"
                                            />
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-16 bg-zinc-900 border border-zinc-800 rounded p-2 text-center text-white text-sm"
                                                value={newService.quantity}
                                                onChange={e => setNewService({ ...newService, quantity: Number(e.target.value) })}
                                                placeholder="SL"
                                            />
                                            <Button onClick={handleAddServiceUsage} className="bg-blue-600 hover:bg-blue-700 text-white px-3 flex-shrink-0"><Plus className="w-4 h-4" /></Button>
                                        </div>
                                        <div className="border border-zinc-800 rounded overflow-hidden">
                                            <table className="w-full text-sm text-left text-zinc-300">
                                                <thead className="bg-zinc-900 text-xs text-zinc-400">
                                                    <tr>
                                                        <th className="px-3 py-2 font-medium">Dịch vụ</th>
                                                        <th className="px-3 py-2 font-medium text-center">SL</th>
                                                        <th className="px-3 py-2 font-medium text-right">Tổng (VND)</th>
                                                        <th className="px-3 py-2"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bookingServices.length > 0 ? bookingServices.map(usage => (
                                                        <tr key={usage.id} className="border-b border-zinc-800/50 bg-zinc-950/50 hover:bg-zinc-900/50">
                                                            <td className="px-3 py-2 text-white">{usage.service?.name}
                                                                {usage.unitPrice !== usage.service?.price && <span className="text-xs text-zinc-500 block">({usage.unitPrice.toLocaleString()} đ/sp)</span>}
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    className="w-16 bg-zinc-950 border border-zinc-800 rounded p-1 text-center text-white text-xs outline-none focus:border-zinc-500"
                                                                    value={usage.quantity}
                                                                    onChange={e => handleUpdateServiceQuantity(usage.id, Number(e.target.value), usage.unitPrice, usage.amount)}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2 text-right">{usage.amount.toLocaleString()}</td>
                                                            <td className="px-3 py-2 text-right">
                                                                <button className="text-zinc-500 hover:text-red-400" onClick={() => setServiceToRemove({ id: usage.id, amount: usage.amount })}>&times;</button>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan={4} className="px-3 py-6 text-center text-zinc-500 text-xs">Chưa có dịch vụ nào</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex flex-col gap-1 text-right pt-3 border-t border-zinc-800">
                                            <div className="text-xs text-zinc-400">Tiền phòng: <span className="text-zinc-200">{(Number(editBookingData.totalAmount || 0) - bookingServices.reduce((a, b) => a + b.amount, 0)).toLocaleString('vi-VN')}</span> VND</div>
                                            <div className="text-xs text-zinc-400">Tiền dịch vụ: <span className="text-zinc-200">{bookingServices.reduce((a, b) => a + b.amount, 0).toLocaleString('vi-VN')}</span> VND</div>
                                            <div className="text-sm pt-2 mt-1 border-t border-zinc-800/50">
                                                <span className="text-zinc-400 uppercase mr-2 text-xs">Tổng thu khách:</span>
                                                <span className="font-bold text-orange-400">{Number(editBookingData.totalAmount || 0).toLocaleString('vi-VN')} VND</span>
                                            </div>
                                        </div>
                                    </fieldset>
                                </TabsContent>
                            </Tabs>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-zinc-800 mt-2">
                                <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white" onClick={() => setSelectedBooking(null)}>Đóng</Button>

                                <div className="flex flex-wrap gap-2 items-center">
                                    {!isEditingBooking ? (
                                        <>
                                            <Button variant="outline" className="border-teal-900/50 text-teal-400 hover:bg-teal-900/20" onClick={() => handlePrint('invoice')}>
                                                In Hóa đơn
                                            </Button>

                                            <Button variant="outline" className="border-teal-900/50 text-teal-400 hover:bg-teal-900/20" onClick={() => handlePrint('deposit')}>
                                                In Phiếu đặt cọc
                                            </Button>

                                            <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white" onClick={(e) => { e.preventDefault(); setIsEditingBooking(true); }}>
                                                Chỉnh sửa
                                            </Button>

                                            {(editBookingData.status === 'CHECKED_IN') && (
                                                <Button variant="outline" className="text-violet-400 border-violet-900/50 hover:bg-violet-900/20" onClick={() => handleRequestCleaning()}>
                                                    Yêu cầu Dọn phòng
                                                </Button>
                                            )}

                                            {(editBookingData.status === 'NEW' || editBookingData.status === 'CONFIRMED') && (
                                                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleSaveBookingEdit('CHECKED_IN')}>
                                                    Check-in
                                                </Button>
                                            )}

                                            {editBookingData.paymentStatus !== 'PAID' && editBookingData.status !== 'CANCELLED' && (
                                                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleSaveBookingEdit(undefined, 'PAID')}>
                                                    Xác nhận thu tiền
                                                </Button>
                                            )}

                                            {editBookingData.status === 'CHECKED_IN' && (
                                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCheckout}>
                                                    Check-out trả phòng
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="outline" className="border-red-900/50 text-red-400 hover:bg-red-900/20" onClick={() => handleDeleteBooking()}>
                                                Xóa đơn
                                            </Button>
                                            <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white" onClick={() => setIsEditingBooking(false)}>Hủy</Button>
                                            <Button variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700" onClick={() => handleSaveBookingEdit()}>Lưu thay đổi</Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                )
            }

            {/* Service Removal Alert Dialog */}
            <AlertDialog open={!!serviceToRemove} onOpenChange={(open) => !open && setServiceToRemove(null)}>
                <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa dịch vụ</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Bạn có chắc chắn muốn xóa dịch vụ này khỏi Đặt phòng? Việc này không thể hoàn tác và doanh thu sẽ tự động được cập nhật.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white">Thoát</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                            if (serviceToRemove) {
                                handleRemoveServiceUsage(serviceToRemove.id, serviceToRemove.amount);
                                setServiceToRemove(null);
                            }
                        }}>
                            Xác nhận xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
