'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bike, Plus, Calendar, User, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { RentalModal } from '@/components/rentals/rental-modal';

const PROPERTY_ID = 'clouq2m1q00003b6w5z8s6xy9';

export default function RentalsPage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [rentals, setRentals] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Modal states
    const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
    const [viewingRental, setViewingRental] = useState<any>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [vRes, rRes, bRes] = await Promise.all([
                fetch(`http://localhost:3001/api/rentals/vehicles?propertyId=${PROPERTY_ID}`),
                fetch(`http://localhost:3001/api/rentals?propertyId=${PROPERTY_ID}`),
                fetch(`http://localhost:3001/api/bookings?propertyId=${PROPERTY_ID}`)
            ]);

            setVehicles(await vRes.json());
            setRentals(await rRes.json());
            setBookings(await bRes.json());
        } catch (error) {
            console.error("Failed to load rental data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateRentalStatus = async (id: string, status: string) => {
        try {
            await fetch(`http://localhost:3001/api/rentals/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchData();
        } catch (e) { alert('Lỗi khi cập nhật trạng thái'); }
    };

    const recordPickup = async (id: string) => {
        try {
            await fetch(`http://localhost:3001/api/rentals/${id}/pickup`, { method: 'POST' });
            fetchData();
        } catch (e) { alert('Lỗi khi ghi nhận nhận xe'); }
    };

    const recordReturn = async (id: string) => {
        try {
            await fetch(`http://localhost:3001/api/rentals/${id}/return`, { method: 'POST' });
            fetchData();
        } catch (e) { alert('Lỗi khi ghi nhận trả xe'); }
    };

    if (!mounted) return null;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Bike className="w-8 h-8 text-emerald-500" />
                        Quản lý Thuê xe
                    </h2>
                    <p className="text-zinc-400 mt-1">
                        Ghi nhận các đơn thuê xe từ đối tác hoặc xe nội bộ.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => { setViewingRental(null); setIsRentalModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/10">
                        <Plus className="mr-2 h-4 w-4" /> Tạo đơn thuê mới
                    </Button>
                </div>
            </div>

            {/* RENTALS LIST */}
            <div className="mt-6">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-900/50">
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-400">Khách hàng</TableHead>
                                    <TableHead className="text-zinc-400">Phương tiện</TableHead>
                                    <TableHead className="text-zinc-400">Thời gian dự kiến</TableHead>
                                    <TableHead className="text-zinc-400">Thực tế / Đã thuê</TableHead>
                                    <TableHead className="text-zinc-400">Tiền thuê</TableHead>
                                    <TableHead className="text-zinc-400">Trạng thái</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow className="border-zinc-800"><TableCell colSpan={7} className="text-center py-8 text-zinc-500">Đang tải...</TableCell></TableRow>
                                ) : rentals.length === 0 ? (
                                    <TableRow className="border-zinc-800"><TableCell colSpan={7} className="text-center py-8 text-zinc-500">Chưa có đơn thuê nào</TableCell></TableRow>
                                ) : rentals.map(r => {
                                    const rentedHours = r.actualPickupTime ? Math.floor((Date.now() - new Date(r.actualPickupTime).getTime()) / (1000 * 60 * 60)) : 0;
                                    const rentedDays = Math.ceil(rentedHours / 24) || 0;

                                    return (
                                        <TableRow key={r.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-white">{r.guestName || r.booking?.guest?.name}</span>
                                                    <span className="text-xs text-zinc-500">{r.guestPhone || r.booking?.guest?.phone}</span>
                                                    {r.booking && (
                                                        <Badge variant="outline" className="w-fit mt-1 text-[10px] bg-blue-500/10 text-blue-400 border-blue-400/20">
                                                            P.{r.booking.bookingRooms?.[0]?.room?.roomNumber}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-zinc-200 font-medium">{r.vehicleName || r.vehicle?.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono text-zinc-500">{r.plateNumber || r.vehicle?.plateNumber}</span>
                                                        {(r.provider || r.vehicle?.provider) && (
                                                            <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1 rounded">
                                                                {r.provider || r.vehicle?.provider}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs text-zinc-300">
                                                    <div className="flex items-center gap-1 opacity-60"><Clock className="w-3 h-3" /> {format(new Date(r.startTime), 'dd/MM HH:mm')}</div>
                                                    <div className="flex items-center gap-1 opacity-60"><Clock className="w-3 h-3 " /> {format(new Date(r.endTime), 'dd/MM HH:mm')}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-1">
                                                    {r.actualPickupTime && (
                                                        <div className="flex items-center gap-1 text-blue-400"><CheckCircle2 className="w-3 h-3" /> Nhận: {format(new Date(r.actualPickupTime), 'dd/MM HH:mm')}</div>
                                                    )}
                                                    {r.actualReturnTime && (
                                                        <div className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Trả: {format(new Date(r.actualReturnTime), 'dd/MM HH:mm')}</div>
                                                    )}
                                                    {r.actualPickupTime && !r.actualReturnTime && (
                                                        <div className="text-[10px] text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded w-fit italic">
                                                            Đã thuê: {rentedHours} giờ (~{rentedDays} ngày)
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-emerald-400">{r.totalAmount.toLocaleString()}đ</div>
                                                <div className="text-[10px] text-zinc-500">({r.pricePerDay.toLocaleString()}đ/ngày)</div>
                                            </TableCell>
                                            <TableCell>
                                                {r.status === 'ACTIVE' && (
                                                    <Badge className={r.actualPickupTime ? "bg-blue-600" : "bg-zinc-700"}>
                                                        {r.actualPickupTime ? "Đang sử dụng" : "Chờ nhận xe"}
                                                    </Badge>
                                                )}
                                                {r.status === 'COMPLETED' && <Badge className="bg-emerald-600">Đã trả xe</Badge>}
                                                {r.status === 'CANCELLED' && <Badge variant="destructive">Đã hủy</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {r.status === 'ACTIVE' && (
                                                    <div className="flex justify-end gap-1">
                                                        {!r.actualPickupTime ? (
                                                            <Button size="sm" onClick={() => recordPickup(r.id)} className="h-8 bg-blue-600 hover:bg-blue-700">
                                                                Giao xe
                                                            </Button>
                                                        ) : (
                                                            <Button size="sm" onClick={() => recordReturn(r.id)} className="h-8 bg-emerald-600 hover:bg-emerald-700">
                                                                Nhận lại xe
                                                            </Button>
                                                        )}
                                                        <Button size="sm" variant="ghost" onClick={() => updateRentalStatus(r.id, 'CANCELLED')} className="h-8 text-zinc-500 hover:text-red-400">
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <RentalModal
                isOpen={isRentalModalOpen}
                onClose={() => setIsRentalModalOpen(false)}
                rental={viewingRental}
                vehicles={vehicles}
                bookings={bookings}
                onSaved={fetchData}
            />
        </div>
    );
}
