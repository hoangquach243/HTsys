import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export function RentalModal({ isOpen, onClose, rental, vehicles, bookings, onSaved }: any) {
    const [formData, setFormData] = useState({
        vehicleId: '',
        vehicleName: '',
        plateNumber: '',
        type: 'SCOOTER',
        provider: '',
        bookingId: '',
        guestName: '',
        guestPhone: '',
        startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(Date.now() + 86400000), "yyyy-MM-dd'T'HH:mm"),
        pricePerDay: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (rental) {
            setFormData({
                vehicleId: rental.vehicleId || '',
                vehicleName: rental.vehicleName || rental.vehicle?.name || '',
                plateNumber: rental.plateNumber || rental.vehicle?.plateNumber || '',
                type: rental.type || rental.vehicle?.type || 'SCOOTER',
                provider: rental.provider || rental.vehicle?.provider || '',
                bookingId: rental.bookingId || '',
                guestName: rental.guestName || '',
                guestPhone: rental.guestPhone || '',
                startTime: format(new Date(rental.startTime), "yyyy-MM-dd'T'HH:mm"),
                endTime: format(new Date(rental.endTime), "yyyy-MM-dd'T'HH:mm"),
                pricePerDay: rental.pricePerDay?.toString() || '',
                notes: rental.notes || '',
            });
        } else {
            setFormData({
                vehicleId: '',
                vehicleName: '',
                plateNumber: '',
                type: 'SCOOTER',
                provider: '',
                bookingId: '',
                guestName: '',
                guestPhone: '',
                startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                endTime: format(new Date(Date.now() + 86400000), "yyyy-MM-dd'T'HH:mm"),
                pricePerDay: '',
                notes: '',
            });
        }
    }, [rental, isOpen]);

    // Auto-fill guest name from booking
    useEffect(() => {
        if (formData.bookingId) {
            const bookingsList = Array.isArray(bookings.data) ? bookings.data : (Array.isArray(bookings) ? bookings : []);
            const b = bookingsList.find((x: any) => x.id === formData.bookingId);
            if (b) {
                setFormData(prev => ({
                    ...prev,
                    guestName: b.guest?.name || '',
                    guestPhone: b.guest?.phone || ''
                }));
            }
        }
    }, [formData.bookingId, bookings]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = rental
                ? `http://localhost:3001/api/rentals/${rental.id}?propertyId=clouq2m1q00003b6w5z8s6xy9`
                : `http://localhost:3001/api/rentals?propertyId=clouq2m1q00003b6w5z8s6xy9`;

            const payload = {
                vehicleId: (formData.vehicleId && formData.vehicleId !== 'none') ? formData.vehicleId : null,
                bookingId: (formData.bookingId && formData.bookingId !== 'none') ? formData.bookingId : null,
                vehicleName: formData.vehicleName,
                plateNumber: formData.plateNumber,
                type: formData.type,
                provider: formData.provider,
                guestName: formData.guestName,
                guestPhone: formData.guestPhone,
                pricePerDay: parseFloat(formData.pricePerDay) || 0,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
                notes: formData.notes,
            };

            const res = await fetch(url, {
                method: rental ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errData.message || 'Failed to save rental');
            }

            onSaved();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(`Lỗi khi lưu đơn thuê xe: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>{rental ? 'Chi tiết Đơn thuê' : 'Tạo Đơn thuê xe'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Gán với Đặt phòng (tùy chọn)</Label>
                            <Select value={formData.bookingId} onValueChange={v => setFormData({ ...formData, bookingId: v })}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectValue placeholder="Chọn đơn đặt phòng" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="none">Không gán</SelectItem>
                                    {(Array.isArray(bookings.data) ? bookings.data : (Array.isArray(bookings) ? bookings : [])).map((b: any) => (
                                        <SelectItem key={b.id} value={b.id}>
                                            {b.guest?.name} - {b.bookingRooms?.[0]?.roomType?.name} (P.{b.bookingRooms?.[0]?.room?.roomNumber})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Loại xe</Label>
                            <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="SCOOTER">Xe tay ga</SelectItem>
                                    <SelectItem value="MANUAL">Xe số</SelectItem>
                                    <SelectItem value="OTHER">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Tên xe / Hãng xe</Label>
                            <Input
                                value={formData.vehicleName}
                                onChange={e => setFormData({ ...formData, vehicleName: e.target.value })}
                                placeholder="Honda Vision..."
                                required
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Biển số xe</Label>
                            <Input
                                value={formData.plateNumber}
                                onChange={e => setFormData({ ...formData, plateNumber: e.target.value })}
                                placeholder="29A-123.45"
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-zinc-200">Nhà cung cấp (Bên thứ 3)</Label>
                        <Input
                            value={formData.provider}
                            onChange={e => setFormData({ ...formData, provider: e.target.value })}
                            placeholder="Tên đối tác gọi xe..."
                            className="bg-zinc-900 border-zinc-800 text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Tên khách hàng</Label>
                            <Input
                                value={formData.guestName}
                                onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                required
                                disabled={!!formData.bookingId && formData.bookingId !== 'none'}
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Số điện thoại</Label>
                            <Input
                                value={formData.guestPhone}
                                onChange={e => setFormData({ ...formData, guestPhone: e.target.value })}
                                disabled={!!formData.bookingId && formData.bookingId !== 'none'}
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Bắt đầu từ</Label>
                            <Input
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                required
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Kết thúc lúc</Label>
                            <Input
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                required
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-zinc-200">Giá thỏa thuận (/ngày)</Label>
                        <Input
                            type="number"
                            value={formData.pricePerDay}
                            onChange={e => setFormData({ ...formData, pricePerDay: e.target.value })}
                            required
                            className="bg-zinc-900 border-zinc-800 text-white font-bold text-lg text-emerald-400"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-zinc-200">Ghi chú</Label>
                        <Input
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Ghi chú thêm..."
                            className="bg-zinc-900 border-zinc-800 text-white"
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="border-zinc-800 text-white hover:bg-zinc-800">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]">
                            {loading ? 'Đang lưu...' : (rental ? 'Lưu thay đổi' : 'Xác nhận Thuê')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
