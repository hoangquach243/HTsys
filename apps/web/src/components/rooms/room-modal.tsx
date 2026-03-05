import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, X, Plus, Upload } from 'lucide-react';

export function RoomModal({ isOpen, onClose, room, roomTypes, onSaved }: any) {
    const [formData, setFormData] = useState({
        roomNumber: '',
        floor: '',
        area: '',
        status: 'AVAILABLE',
        notes: '',
        roomTypeId: '',
        photos: [] as string[],
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (room) {
            setFormData({
                roomNumber: room.roomNumber || '',
                floor: room.floor || '',
                area: room.area || '',
                status: room.status || 'AVAILABLE',
                notes: room.notes || '',
                roomTypeId: room.roomTypeId || '',
                photos: room.photos || [],
            });
        } else {
            setFormData({
                roomNumber: '',
                floor: '',
                area: '',
                status: 'AVAILABLE',
                notes: '',
                roomTypeId: roomTypes[0]?.id || '',
                photos: [],
            });
        }
    }, [room, isOpen, roomTypes]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setUploading(true);
        try {
            const file = e.target.files[0];
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const res = await fetch('http://localhost:3001/api/media/upload', {
                method: 'POST',
                body: formDataUpload,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setFormData(prev => ({ ...prev, photos: [...prev.photos, data.url] }));
        } catch (error) {
            console.error(error);
            alert('Lỗi khi tải ảnh lên');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = room
                ? `http://localhost:3001/api/rooms/${room.id}`
                : `http://localhost:3001/api/rooms`;

            const method = room ? 'PATCH' : 'POST';

            // Extract values
            const { roomTypeId, status, notes, photos, ...updateData } = formData;

            const payload = room
                ? { ...updateData, status, notes, photos }
                : {
                    roomNumber: formData.roomNumber,
                    floor: formData.floor,
                    area: formData.area,
                    roomTypeId: formData.roomTypeId,
                    photos
                };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.message || 'Có lỗi xảy ra');
                return;
            }

            onSaved();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Không thể lưu phòng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>{room ? 'Cập nhật Phòng' : 'Thêm Phòng'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label className="text-zinc-200">Tên/Số phòng</Label>
                        <Input
                            value={formData.roomNumber}
                            onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                            required
                            className="bg-zinc-900 border-zinc-800 text-white"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-zinc-200">Loại phòng</Label>
                        <Select value={formData.roomTypeId} onValueChange={v => setFormData({ ...formData, roomTypeId: v })} required>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectValue placeholder="Chọn loại phòng" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                {roomTypes.map((rt: any) => (
                                    <SelectItem key={rt.id} value={rt.id} className="hover:bg-zinc-800 cursor-pointer focus:bg-zinc-800 focus:text-white">{rt.name} ({rt.code})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Khu vực</Label>
                            <Input
                                value={formData.area}
                                onChange={e => setFormData({ ...formData, area: e.target.value })}
                                className="bg-zinc-900 border-zinc-800 text-white"
                                placeholder="Ví dụ: Khu A"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Tầng</Label>
                            <Input
                                value={formData.floor}
                                onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                    </div>
                    {room && ( // Only show status edit on update, usually creation is AVAILABLE
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Trạng thái</Label>
                            <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="AVAILABLE">Trống</SelectItem>
                                    <SelectItem value="OCCUPIED">Đang ở</SelectItem>
                                    <SelectItem value="CLEANING">Đang dọn</SelectItem>
                                    <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label className="text-zinc-200">Hình ảnh phòng</Label>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                            {formData.photos.map((url, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-md overflow-hidden border border-zinc-800">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))}
                                        className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="aspect-square rounded-md border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors disabled:opacity-50"
                            >
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-500" /> : <Plus className="w-5 h-5 text-zinc-500" />}
                                <span className="text-[10px] text-zinc-500 mt-1">{uploading ? 'Đang tải' : 'Thêm ảnh'}</span>
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-zinc-200">Ghi chú</Label>
                        <Input
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="bg-zinc-900 border-zinc-800 text-white"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} className="border-zinc-800 text-white hover:bg-zinc-800 hover:text-white">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? 'Đang lưu...' : (room ? 'Cập nhật' : 'Thêm mới')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
