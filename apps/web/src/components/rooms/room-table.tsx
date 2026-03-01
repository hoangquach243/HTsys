'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { RoomModal } from './room-modal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export function RoomTable({ propertyId = 'clouq2m1q00003b6w5z8s6xy9' }) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [roomsRes, typesRes] = await Promise.all([
                fetch(`http://localhost:3001/api/rooms?propertyId=${propertyId}`),
                fetch(`http://localhost:3001/api/rooms/types?propertyId=${propertyId}`)
            ]);

            setRooms(await roomsRes.json());
            setRoomTypes(await typesRes.json());
        } catch (error) {
            console.error("Failed to load rooms", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [propertyId]);

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            const res = await fetch(`http://localhost:3001/api/rooms/${deletingId}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Lỗi server khi xóa');
            }
            await fetchData();
            alert('Đã xóa phòng thành công!');
        } catch (err: any) {
            alert(`Lỗi: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">Trống</Badge>;
            case 'OCCUPIED': return <Badge variant="outline" className="text-blue-400 border-blue-400/30">Đang ở</Badge>;
            case 'CLEANING': return <Badge variant="outline" className="text-orange-400 border-orange-400/30">Đang dọn</Badge>;
            case 'MAINTENANCE': return <Badge variant="outline" className="text-red-400 border-red-400/30">Bảo trì</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Danh sách Phòng</h3>
                <Button onClick={() => { setEditingRoom(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Thêm phòng mới
                </Button>
            </div>
            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-900/50">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Số phòng</TableHead>
                                <TableHead className="text-zinc-400">Loại phòng</TableHead>
                                <TableHead className="text-zinc-400">Khu vực</TableHead>
                                <TableHead className="text-zinc-400">Tầng</TableHead>
                                <TableHead className="text-zinc-400">Trạng thái</TableHead>
                                <TableHead className="text-zinc-400">Ghi chú</TableHead>
                                <TableHead className="text-zinc-400 text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow className="border-zinc-800"><TableCell colSpan={7} className="text-center text-zinc-500 py-8">Đang tải...</TableCell></TableRow>
                            ) : rooms.length === 0 ? (
                                <TableRow className="border-zinc-800"><TableCell colSpan={7} className="text-center text-zinc-500 py-8">Chưa có dữ liệu</TableCell></TableRow>
                            ) : rooms.map(room => (
                                <TableRow key={room.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                    <TableCell className="font-bold text-white text-lg">{room.roomNumber}</TableCell>
                                    <TableCell className="text-zinc-300 font-medium">
                                        <div className="flex flex-col">
                                            <span>{room.roomType?.name}</span>
                                            <span className="text-xs text-zinc-500">{room.roomType?.code}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-300">{room.area || '-'}</TableCell>
                                    <TableCell className="text-zinc-300">{room.floor || '-'}</TableCell>
                                    <TableCell>{getStatusBadge(room.status)}</TableCell>
                                    <TableCell className="text-zinc-400 text-sm max-w-[200px] truncate" title={room.notes}>{room.notes || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingRoom(room); setIsModalOpen(true); }} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeletingId(room.id)} className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 ml-2">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <RoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                room={editingRoom}
                roomTypes={roomTypes}
                onSaved={fetchData}
            />

            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Hành động này không thể hoàn tác. Dữ liệu phòng sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-zinc-800 text-white hover:bg-zinc-800 hover:text-white">Thoát</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Xác nhận Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
