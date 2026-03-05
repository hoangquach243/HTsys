import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function RoomTypeModal({ isOpen, onClose, roomType, onSaved }: any) {
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        kind: "ROOM",
        description: "",
        maxAdults: 2,
        maxChildren: 1,
        maxInfants: 0,
        basePrice: 0,
        weekendPrice: 0,
        photos: [] as string[],
    });
    const [loading, setLoading] = useState(false);
    const [photoInput, setPhotoInput] = useState("");

    useEffect(() => {
        if (roomType) {
            setFormData({
                name: roomType.name || "",
                code: roomType.code || "",
                kind: roomType.kind || "ROOM",
                description: roomType.description || "",
                maxAdults: roomType.maxAdults || 2,
                maxChildren: roomType.maxChildren || 1,
                maxInfants: roomType.maxInfants || 0,
                basePrice: roomType.basePrice || 0,
                weekendPrice: roomType.weekendPrice || 0,
                photos: roomType.photos || [],
            });
        } else {
            setFormData({
                name: "",
                code: "",
                kind: "ROOM",
                description: "",
                maxAdults: 2,
                maxChildren: 1,
                maxInfants: 0,
                basePrice: 0,
                weekendPrice: 0,
                photos: [],
            });
        }
    }, [roomType, isOpen]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = roomType
                ? `http://localhost:3001/api/rooms/types/${roomType.id}`
                : `http://localhost:3001/api/rooms/types`;

            const method = roomType ? "PATCH" : "POST";

            // Avoid sending propertyId during PATCH because it's not in the DTO
            const payload = roomType
                ? { ...formData }
                : { ...formData, propertyId: "clouq2m1q00003b6w5z8s6xy9" };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.message || "Có lỗi xảy ra");
                return;
            }

            onSaved();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Không thể lưu loại phòng");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>
                        {roomType ? "Cập nhật Loại phòng" : "Thêm Loại phòng"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Tên loại phòng</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Kiểu phòng</Label>
                            <Select
                                value={formData.kind}
                                onValueChange={(v) => setFormData({ ...formData, kind: v })}
                            >
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectValue placeholder="Chọn kiểu" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="ROOM">Phòng riêng</SelectItem>
                                    <SelectItem value="DORM">Phòng Dorm</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-zinc-200">Mô tả</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="bg-zinc-900 border-zinc-800 text-white resize-none"
                            placeholder="Mô tả về loại phòng..."
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Người lớn</Label>
                            <Input
                                type="number"
                                min="1"
                                value={formData.maxAdults}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        maxAdults: parseInt(e.target.value) || 1,
                                    })
                                }
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Trẻ em</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.maxChildren}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        maxChildren: parseInt(e.target.value) || 0,
                                    })
                                }
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Em bé (Infant)</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.maxInfants}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        maxInfants: parseInt(e.target.value) || 0,
                                    })
                                }
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Giá cơ bản (VND)</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.basePrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        basePrice: parseFloat(e.target.value) || 0,
                                    })
                                }
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-zinc-200">Giá cuối tuần (VND)</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.weekendPrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        weekendPrice: parseFloat(e.target.value) || 0,
                                    })
                                }
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-zinc-200">Hình ảnh loại phòng (URL)</Label>
                        <div className="flex gap-2">
                            <Input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={photoInput}
                                onChange={(e) => setPhotoInput(e.target.value)}
                                className="bg-zinc-900 border-zinc-800 text-white flex-1"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    if (photoInput && !formData.photos.includes(photoInput)) {
                                        setFormData(prev => ({ ...prev, photos: [...prev.photos, photoInput] }));
                                        setPhotoInput('');
                                    }
                                }}
                            >
                                Thêm
                            </Button>
                        </div>
                        {formData.photos.length > 0 && (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                                {formData.photos.map((url, idx) => (
                                    <div key={idx} className="relative group border border-zinc-800 rounded-md overflow-hidden aspect-video">
                                        <img src={url} alt={`Room ${idx}`} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        <button
                                            type="button"
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter(p => p !== url) }))}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-zinc-800 text-white hover:bg-zinc-800 hover:text-white"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? "Đang lưu..." : roomType ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
