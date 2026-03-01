'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { RoomTypeModal } from './room-type-modal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export function RoomTypeTable({ propertyId = 'clouq2m1q00003b6w5z8s6xy9' }) {
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchRoomTypes = async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:3001/api/rooms/types?propertyId=${propertyId}`);
            const json = await res.json();
            setRoomTypes(json || []);
        } catch (error) {
            console.error("Failed to load room types", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoomTypes();
    }, [propertyId]);

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            const res = await fetch(`http://localhost:3001/api/rooms/types/${deletingId}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Lỗi server khi xóa');
            }
            await fetchRoomTypes();
            alert('Đã xóa loại phòng thành công!');
        } catch (err: any) {
            alert(`Lỗi: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Danh sách Loại phòng</h3>
                <Button onClick={() => { setEditingType(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Thêm loại phòng
                </Button>
            </div>
            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-900/50">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Mã (Code)</TableHead>
                                <TableHead className="text-zinc-400">Tên loại phòng</TableHead>
                                <TableHead className="text-zinc-400 text-center">Sức chứa</TableHead>
                                <TableHead className="text-zinc-400 text-right">Giá cơ bản / Cuối tuần</TableHead>
                                <TableHead className="text-zinc-400 text-center">Số lượng phòng</TableHead>
                                <TableHead className="text-zinc-400 text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow className="border-zinc-800"><TableCell colSpan={6} className="text-center text-zinc-500 py-8">Đang tải...</TableCell></TableRow>
                            ) : roomTypes.length === 0 ? (
                                <TableRow className="border-zinc-800"><TableCell colSpan={6} className="text-center text-zinc-500 py-8">Chưa có dữ liệu</TableCell></TableRow>
                            ) : roomTypes.map(rt => (
                                <TableRow key={rt.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                    <TableCell className="font-medium text-white">{rt.code}</TableCell>
                                    <TableCell className="text-zinc-300">
                                        <div className="flex flex-col">
                                            <span>{rt.name}</span>
                                            <span className="text-xs text-zinc-500">{rt.kind === 'DORM' ? 'Phòng Dorm' : 'Phòng Riêng'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center text-zinc-300">
                                        {rt.maxAdults} NL - {rt.maxChildren} TE - {rt.maxInfants} EB
                                    </TableCell>
                                    <TableCell className="text-right text-zinc-300">
                                        <div className="flex flex-col">
                                            <span>{rt.basePrice?.toLocaleString() || 0}</span>
                                            <span className="text-xs text-zinc-500">{rt.weekendPrice ? rt.weekendPrice.toLocaleString() : '-'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center text-zinc-300">{rt._count?.rooms || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingType(rt); setIsModalOpen(true); }} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeletingId(rt.id)} className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 ml-2">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <RoomTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                roomType={editingType}
                onSaved={fetchRoomTypes}
            />

            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Loại phòng này sẽ bị xóa. Nếu đang có các phòng thuộc loại phòng này thì việc xóa có thể thất bại bảo vệ dữ liệu.
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
