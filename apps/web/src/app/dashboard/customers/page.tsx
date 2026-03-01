'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Mail,
    Phone,
    Star,
    History,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function CustomersPage() {
    const [guests, setGuests] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<any>(null);
    const [guestHistory, setGuestHistory] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        idNumber: '', // CCCD
    });

    const fetchGuests = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/guests?propertyId=clouq2m1q00003b6w5z8s6xy9`);
            const data = await res.json();
            setGuests(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchGuests();
    }, []);

    const filteredGuests = guests.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.phone && g.phone.includes(searchQuery)) ||
        (g.email && g.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (g.idNumber && g.idNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleAddGuest = async () => {
        if (!formData.name || !formData.phone) {
            alert('Vui lòng nhập Tên và Số điện thoại!');
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/api/guests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    propertyId: 'clouq2m1q00003b6w5z8s6xy9'
                })
            });

            if (res.ok) {
                alert('Đã thêm khách hàng!');
                setIsAddModalOpen(false);
                setFormData({ name: '', phone: '', email: '', idNumber: '' });
                fetchGuests();
            } else {
                const err = await res.json();
                alert('Lỗi: ' + err.message);
            }
        } catch (error) {
            alert('Lỗi mạng!');
        }
    };

    const handleEditClick = (guest: any) => {
        setSelectedGuest(guest);
        setFormData({
            name: guest.name || '',
            phone: guest.phone || '',
            email: guest.email || '',
            idNumber: guest.idNumber || '',
        });
        setIsEditModalOpen(true);
    };

    const handleEditGuest = async () => {
        if (!selectedGuest) return;

        if (!formData.name || !formData.phone) {
            alert('Vui lòng nhập Tên và Số điện thoại!');
            return;
        }

        try {
            const res = await fetch(`http://localhost:3001/api/guests/${selectedGuest.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    idNumber: formData.idNumber
                })
            });

            if (res.ok) {
                alert('Đã cập nhật thông tin khách hàng!');
                setIsEditModalOpen(false);
                fetchGuests();
            } else {
                const err = await res.json();
                alert('Lỗi: ' + err.message);
            }
        } catch (error) {
            alert('Lỗi mạng!');
        }
    };

    const handleViewHistory = async (guest: any) => {
        try {
            const res = await fetch(`http://localhost:3001/api/guests/${guest.id}`);
            const data = await res.json();
            setSelectedGuest(data);
            setGuestHistory(data.bookings || []);
            setIsHistoryModalOpen(true);
        } catch (error) {
            alert('Lỗi khi tải lịch sử khách hàng');
        }
    };

    const handleDeleteGuest = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/guests/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchGuests();
                alert('Đã xóa thành công');
            } else {
                alert('Không thể xóa khách hàng này');
            }
        } catch (error) {
            alert('Lỗi mạng');
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Khách hàng</h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Hồ sơ CRM, lịch sử lưu trú, phân loại VIP và thẻ (tags) khách hàng.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm khách hàng
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-3 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Tìm kiếm tên, số điện thoại, CCCD, email..."
                        className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Tổng số khách</span>
                    <span className="text-2xl font-bold text-white mt-1">{guests.length}</span>
                </div>
            </div>

            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
                <Table>
                    <TableHeader className="bg-zinc-900/80 border-b border-zinc-800">
                        <TableRow className="hover:bg-transparent border-zinc-800">
                            <TableHead className="text-zinc-400 font-medium py-4">Khách hàng</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">Liên hệ</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">CCCD/Passport</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4 text-center">Số đơn đặt</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">Phân loại</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4 text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredGuests.length > 0 ? filteredGuests.map((guest) => {
                            const bookingsCount = guest._count?.bookings || 0;
                            const isVip = bookingsCount >= 3;

                            return (
                                <TableRow key={guest.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 cursor-pointer" onClick={() => handleViewHistory(guest)}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-300 uppercase">
                                                {guest.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-zinc-100">{guest.name}</span>
                                                    {isVip && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
                                                </div>
                                                <span className="text-xs text-zinc-500">{guest.id.substring(0, 10)}...</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                                <Phone className="h-3 w-3 text-zinc-500" />
                                                {guest.phone || '-'}
                                            </div>
                                            {guest.email && (
                                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                    <Mail className="h-3 w-3 text-zinc-500" />
                                                    {guest.email}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-zinc-300 font-mono tracking-wider">{guest.idNumber || '-'}</span>
                                    </TableCell>
                                    <TableCell className="text-center text-zinc-200 font-medium">{bookingsCount}</TableCell>
                                    <TableCell>
                                        {isVip ? (
                                            <Badge variant="outline" className="border-yellow-600/50 bg-yellow-500/10 text-yellow-500">Khách VIP</Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-zinc-700 bg-zinc-800 text-zinc-400">Khách thường</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={(e) => e.stopPropagation()}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                                <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleViewHistory(guest); }}>
                                                    <History className="mr-2 h-4 w-4" /> Xem lịch sử
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleEditClick(guest); }}>
                                                    Chỉnh sửa hồ sơ
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-zinc-800" />
                                                <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleDeleteGuest(guest.id); }}>
                                                    Xóa khách hàng
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                                    Không có khách hàng nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add Guest Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle>Thêm khách hàng mới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Tên khách hàng *</label>
                            <Input
                                placeholder="VD: Nguyễn Văn A"
                                className="bg-zinc-900 border-zinc-800"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Số CCCD / Passport</label>
                            <Input
                                placeholder="Nhập số CCCD"
                                className="bg-zinc-900 border-zinc-800 font-mono"
                                value={formData.idNumber}
                                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Số điện thoại *</label>
                            <Input
                                placeholder="VD: 0987654321"
                                className="bg-zinc-900 border-zinc-800"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Email</label>
                            <Input
                                placeholder="VD: email@example.com"
                                className="bg-zinc-900 border-zinc-800"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddGuest}>Lưu khách hàng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Guest Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa hồ sơ khách hàng</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Tên khách hàng *</label>
                            <Input
                                placeholder="VD: Nguyễn Văn A"
                                className="bg-zinc-900 border-zinc-800"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Số CCCD / Passport</label>
                            <Input
                                placeholder="Nhập số CCCD"
                                className="bg-zinc-900 border-zinc-800 font-mono"
                                value={formData.idNumber}
                                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Số điện thoại *</label>
                            <Input
                                placeholder="VD: 0987654321"
                                className="bg-zinc-900 border-zinc-800"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Email</label>
                            <Input
                                placeholder="VD: email@example.com"
                                className="bg-zinc-900 border-zinc-800"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleEditGuest}>Cập nhật lại</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View History Modal */}
            <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Lịch sử Đặt phòng: {selectedGuest?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
                        {guestHistory.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500">Khách hàng này chưa có đơn đặt phòng nào.</div>
                        ) : (
                            <div className="space-y-4">
                                {guestHistory.map((booking: any) => (
                                    <div key={booking.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-blue-400">{booking.code}</h4>
                                                <p className="text-xs text-zinc-500">Nguồn: <span className="uppercase">{booking.source}</span></p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                                                    {booking.status}
                                                </Badge>
                                                <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                                                    {booking.paymentStatus}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                            <div className="bg-zinc-950 rounded p-2">
                                                <span className="block text-xs uppercase text-zinc-500 mb-1">Thời gian</span>
                                                <div className="text-zinc-300">
                                                    {format(new Date(booking.checkIn), "dd/MM/yyyy")} &rarr; {format(new Date(booking.checkOut), "dd/MM/yyyy")}
                                                </div>
                                            </div>
                                            <div className="bg-zinc-950 rounded p-2 text-right">
                                                <span className="block text-xs uppercase text-zinc-500 mb-1">Tổng tiền</span>
                                                <div className="text-orange-400 font-bold">
                                                    {booking.totalAmount?.toLocaleString('vi-VN')} VND
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
