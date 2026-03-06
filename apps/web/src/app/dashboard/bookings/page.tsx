'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, SlidersHorizontal, Plus, MoreHorizontal, ConciergeBell } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const TEST_PROPERTY_ID = 'clouq2m1q00003b6w5z8s6xy9';

export default function BookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    // Modal state for adding services
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [selectedBookingForService, setSelectedBookingForService] = useState<any>(null);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [serviceForm, setServiceForm] = useState({ serviceId: '', quantity: 1, amount: 0 });

    const fetchBookings = async () => {
        try {
            setLoading(true);
            let url = `http://localhost:3001/api/bookings?limit=20`;
            if (search) url += `&search=${search}`;
            if (statusFilter) url += `&status=${statusFilter}`;

            const res = await fetch(url);
            const json = await res.json();
            setBookings(json.data || []);
        } catch (error) {
            console.error("Failed to load bookings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [search, statusFilter, refetchTrigger]);

    const fetchAvailableServices = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/services?propertyId=${TEST_PROPERTY_ID}&isActive=true`);
            const data = await res.json();
            setAvailableServices(data);
        } catch (error) {
            console.error("Failed to load services", error);
        }
    };

    const handleOpenServiceModal = (booking: any) => {
        setSelectedBookingForService(booking);
        setServiceForm({ serviceId: '', quantity: 1, amount: 0 });
        setIsServiceModalOpen(true);
        if (availableServices.length === 0) {
            fetchAvailableServices();
        }
    };

    const handleServiceSelect = (serviceId: string) => {
        const s = availableServices.find(x => x.id === serviceId);
        if (s) {
            setServiceForm(prev => ({ ...prev, serviceId, amount: s.price * prev.quantity }));
        }
    };

    const handleQuantityChange = (q: number) => {
        const qty = Math.max(1, q);
        const s = availableServices.find(x => x.id === serviceForm.serviceId);
        if (s) {
            setServiceForm(prev => ({ ...prev, quantity: qty, amount: s.price * qty }));
        } else {
            setServiceForm(prev => ({ ...prev, quantity: qty }));
        }
    };

    const handleAddService = async () => {
        if (!serviceForm.serviceId || !selectedBookingForService) return;
        try {
            const s = availableServices.find(x => x.id === serviceForm.serviceId);
            const payload = {
                bookingId: selectedBookingForService.id,
                serviceId: serviceForm.serviceId,
                quantity: serviceForm.quantity,
                unitPrice: s?.price || 0,
                amount: serviceForm.amount,
                note: ''
            };
            const res = await fetch(`http://localhost:3001/api/services/usages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success('Đã thêm dịch vụ vào đơn đặt phòng!');
                setIsServiceModalOpen(false);
                setRefetchTrigger(prev => prev + 1);
            } else {
                toast.error('Lỗi khi thêm dịch vụ');
            }
        } catch (error) {
            toast.error('Lỗi kết nối máy chủ');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return { bg: '#3B82F620', text: '#3B82F6', border: '#3B82F640', label: 'Mới' };
            case 'CONFIRMED': return { bg: '#8B5CF620', text: '#8B5CF6', border: '#8B5CF640', label: 'Đã xác nhận' };
            case 'CHECKED_IN': return { bg: '#10B98120', text: '#10B981', border: '#10B98140', label: 'Đang lưu trú' };
            case 'CHECKED_OUT': return { bg: '#6B728020', text: '#9CA3AF', border: '#4B5563', label: 'Đã trả phòng' };
            case 'CANCELLED': return { bg: '#EF444420', text: '#EF4444', border: '#EF444440', label: 'Đã hủy' };
            default: return { bg: '#3F3F46', text: '#fff', border: '#52525B', label: status };
        }
    };

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'UNPAID': return <Badge variant="outline" className="text-red-400 border-red-400/30">Chưa thanh toán</Badge>;
            case 'PARTIAL': return <Badge variant="outline" className="text-amber-400 border-amber-400/30">Lệch toán</Badge>;
            case 'PAID': return <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">Đã thanh toán</Badge>;
            default: return null;
        }
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Đặt phòng</h2>
                    <p className="text-zinc-400 mt-1">Quản lý tất cả danh sách đặt phòng và lưu trú tại cơ sở.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Tạo đặt phòng
                    </Button>
                </div>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-0">
                    <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1 w-full sm:max-w-xs">
                            <div className="relative w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                                <Input
                                    type="text"
                                    placeholder="Tìm mã ĐP, tên khách..."
                                    className="w-full bg-zinc-950 border-zinc-800 pl-9 text-white"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
                            {['', 'NEW', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].map(status => (
                                <Button
                                    key={status}
                                    variant={statusFilter === status ? 'default' : 'outline'}
                                    size="sm"
                                    className={statusFilter === status ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-transparent text-zinc-400 border-zinc-800'}
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status === '' ? 'Tất cả' : getStatusColor(status).label}
                                </Button>
                            ))}
                            <Button variant="outline" size="sm" className="bg-transparent border-zinc-800 text-zinc-300 ml-auto sm:ml-2">
                                <SlidersHorizontal className="h-4 w-4 mr-2" /> Bộ lọc
                            </Button>
                        </div>
                    </div>

                    <Table>
                        <TableHeader className="bg-zinc-950/50">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400 font-medium w-[100px]">Mã ĐP</TableHead>
                                <TableHead className="text-zinc-400 font-medium">Khách hàng</TableHead>
                                <TableHead className="text-zinc-400 font-medium">Lịch trình</TableHead>
                                <TableHead className="text-zinc-400 font-medium hidden md:table-cell">Phòng</TableHead>
                                <TableHead className="text-zinc-400 font-medium text-right">Tổng tiền</TableHead>
                                <TableHead className="text-zinc-400 font-medium text-center">Thanh toán</TableHead>
                                <TableHead className="text-zinc-400 font-medium text-center w-[130px]">Trạng thái</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow className="border-zinc-800">
                                    <TableCell colSpan={8} className="h-32 text-center text-zinc-500">Đang tải dữ liệu...</TableCell>
                                </TableRow>
                            ) : bookings.length === 0 ? (
                                <TableRow className="border-zinc-800">
                                    <TableCell colSpan={8} className="h-32 text-center text-zinc-500">Không tìm thấy đặt phòng nào</TableCell>
                                </TableRow>
                            ) : bookings.map((booking) => {
                                const statusInfo = getStatusColor(booking.status);
                                return (
                                    <TableRow key={booking.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}>
                                        <TableCell className="font-medium text-white">{booking.code}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-zinc-200 font-medium">{booking.guest?.name}</span>
                                                <span className="text-xs text-zinc-500">{booking.source || 'Walk-in'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span className="text-zinc-300">{format(new Date(booking.checkIn), 'dd/MM/yyyy')}</span>
                                                <span className="text-zinc-500">➜ {format(new Date(booking.checkOut), 'dd/MM/yyyy')} ({booking.nights} đêm)</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex flex-col">
                                                {booking.bookingRooms?.[0] ? (
                                                    <>
                                                        <span className="text-zinc-300 text-sm">{booking.bookingRooms[0].roomType?.name}</span>
                                                        <span className="text-xs text-zinc-500">Phòng: {booking.bookingRooms[0].room?.roomNumber || 'Chưa xếp'}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-zinc-500 italic">Chưa phân phòng</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-white">
                                            {booking.totalAmount?.toLocaleString('vi-VN')} ₫
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getPaymentBadge(booking.paymentStatus)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge style={{ backgroundColor: statusInfo.bg, color: statusInfo.text, borderColor: statusInfo.border }}>
                                                {statusInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={(e) => e.stopPropagation()}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                    <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); handleOpenServiceModal(booking); }}>
                                                        <ConciergeBell className="mr-2 h-4 w-4" /> Thêm Dịch vụ
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent >
            </Card >

            {/* Modal Thêm Dịch Vụ */}
            <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Thêm Dịch vụ / Phụ thu</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <span className="text-xs text-zinc-500 block uppercase">Đặt phòng</span>
                                <span className="font-bold text-white">{selectedBookingForService?.code}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-zinc-500 block uppercase">Khách hàng</span>
                                <span className="font-medium text-white">{selectedBookingForService?.guest?.name || 'Walk-in'}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Chọn Dịch vụ <span className="text-rose-500">*</span></label>
                            <UISelect value={serviceForm.serviceId} onValueChange={handleServiceSelect}>
                                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-200">
                                    <SelectValue placeholder="Chọn dịch vụ/phụ thu..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableServices.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name} - {s.price.toLocaleString('vi-VN')}₫/lần
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </UISelect>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Số lượng <span className="text-rose-500">*</span></label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={serviceForm.quantity}
                                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                    className="bg-zinc-900 border-zinc-800 text-zinc-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Thành tiền (VND)</label>
                                <Input
                                    readOnly
                                    value={serviceForm.amount.toLocaleString('vi-VN')}
                                    className="bg-zinc-900 border-zinc-800 font-bold text-emerald-400 cursor-not-allowed opacity-80"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800" onClick={() => setIsServiceModalOpen(false)}>Hủy</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!serviceForm.serviceId} onClick={handleAddService}>
                            Lưu Dịch Vụ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
