import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function VehicleModal({ isOpen, onClose, vehicle, onSaved }: any) {
    const [formData, setFormData] = useState({
        plateNumber: '',
        name: '',
        provider: '',
        type: 'SCOOTER',
        dailyPrice: '',
        status: 'AVAILABLE',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (vehicle) {
            setFormData({
                plateNumber: vehicle.plateNumber || '',
                name: vehicle.name || '',
                provider: vehicle.provider || '',
                type: vehicle.type || 'SCOOTER',
                dailyPrice: vehicle.dailyPrice?.toString() || '',
                status: vehicle.status || 'AVAILABLE',
            });
        } else {
            setFormData({
                plateNumber: '',
                name: '',
                provider: '',
                type: 'SCOOTER',
                dailyPrice: '',
                status: 'AVAILABLE',
            });
        }
    }, [vehicle, isOpen]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = vehicle
                ? `http://localhost:3001/api/rentals/vehicles/${vehicle.id}`
                : `http://localhost:3001/api/rentals/vehicles?propertyId=clouq2m1q00003b6w5z8s6xy9`;

            const method = vehicle ? 'PATCH' : 'POST';

            const payload = {
                ...formData,
                dailyPrice: parseFloat(formData.dailyPrice) || 0,
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save vehicle');

            onSaved();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Lỗi khi lưu thông tin xe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>{vehicle ? 'Cập nhật Xe' : 'Thêm Xe mới'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Biển số xe</Label>
                            <Input
                                value={formData.plateNumber}
                                onChange={e => setFormData({ ...formData, plateNumber: e.target.value })}
                                placeholder="29A-123.45"
                                required
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Nhà cung cấp</Label>
                            <Input
                                value={formData.provider}
                                onChange={e => setFormData({ ...formData, provider: e.target.value })}
                                placeholder="Nội bộ / Tên đối tác"
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-zinc-200">Tên xe / Hãng xe</Label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Honda Vision 2023"
                            required
                            className="bg-zinc-900 border-zinc-800 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Loại xe</Label>
                            <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="SCOOTER text-white">Xe tay ga</SelectItem>
                                    <SelectItem value="MANUAL text-white">Xe số</SelectItem>
                                    <SelectItem value="OTHER text-white">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Giá thuê/ngày</Label>
                            <Input
                                type="number"
                                value={formData.dailyPrice}
                                onChange={e => setFormData({ ...formData, dailyPrice: e.target.value })}
                                placeholder="150000"
                                required
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-zinc-200">Trạng thái</Label>
                        <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="AVAILABLE text-white">Sẵn sàng</SelectItem>
                                <SelectItem value="RENTED text-white">Đang cho thuê</SelectItem>
                                <SelectItem value="MAINTENANCE text-white">Bảo trì</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="border-zinc-800 text-white hover:bg-zinc-800">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? 'Đang lưu...' : (vehicle ? 'Cập nhật' : 'Thêm mới')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
