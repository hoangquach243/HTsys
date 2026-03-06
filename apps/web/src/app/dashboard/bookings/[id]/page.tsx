'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ArrowLeft, User, Phone, MapPin, Calendar, Clock, CreditCard, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchBookingDetails = async () => {
        try {
            const id = params.id as string;
            const res = await fetch(`http://localhost:3001/api/bookings/${id}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setBooking(data);
        } catch (error) {
            toast.error("Không thể tải thông tin đặt phòng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchBookingDetails();
        }
    }, [params.id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return { bg: '#3B82F620', text: '#3B82F6', border: '#3B82F640', label: 'Mới tạo' };
            case 'CONFIRMED': return { bg: '#8B5CF620', text: '#8B5CF6', border: '#8B5CF640', label: 'Đã xác nhận' };
            case 'CHECKED_IN': return { bg: '#10B98120', text: '#10B981', border: '#10B98140', label: 'Đang ở' };
            case 'CHECKED_OUT': return { bg: '#6B728020', text: '#9CA3AF', border: '#4B5563', label: 'Đã trả phòng' };
            case 'CANCELLED': return { bg: '#EF444420', text: '#EF4444', border: '#EF444440', label: 'Đã hủy' };
            default: return { bg: '#3F3F46', text: '#fff', border: '#52525B', label: status };
        }
    };

    const getPaymentStr = (status: string) => {
        switch (status) {
            case 'UNPAID': return 'Chưa thanh toán';
            case 'PARTIAL': return 'Đã cọc/Thanh toán một phần';
            case 'PAID': return 'Đã thanh toán đủ';
            default: return status;
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-zinc-400">Đang tải dữ liệu...</div>;
    }

    if (!booking) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl text-white font-bold mb-2">Không tìm thấy đơn đặt phòng</h2>
                <Button variant="outline" className="border-zinc-800 text-zinc-300 mt-4" onClick={() => router.push('/dashboard/bookings')}>Quay lại danh sách</Button>
            </div>
        );
    }

    const { guest, bookingRooms, payments, serviceUsages, vehicleRentals, tasks } = booking;
    const statusInfo = getStatusColor(booking.status);

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full max-w-6xl mx-auto">
            {/* Header / Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/bookings')} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight text-white">Chi tiết Đặt phòng</h2>
                            <Badge style={{ backgroundColor: statusInfo.bg, color: statusInfo.text, borderColor: statusInfo.border }}>
                                {statusInfo.label}
                            </Badge>
                        </div>
                        <p className="text-zinc-400 mt-1 flex items-center gap-2 text-sm">
                            <Tag className="w-4 h-4" /> {booking.code}
                            <span className="text-zinc-600">|</span>
                            <Clock className="w-4 h-4" /> Tạo lúc {format(new Date(booking.createdAt), "HH:mm - dd/MM/yyyy")}
                        </p>
                    </div>
                </div>
            </div>

            {booking.status === 'CANCELLED' && booking.cancellationReason && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5" />
                    <div>
                        <p className="font-semibold text-red-300">Đơn đã bị hủy</p>
                        <p className="text-sm mt-1">Lý do: {booking.cancellationReason}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: General Info */}
                <div className="space-y-6 md:col-span-2">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-3 border-b border-zinc-800/50">
                            <CardTitle className="text-white text-lg">Hành trình lưu trú</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Check-in</p>
                                <p className="text-white font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-emerald-400" />
                                    {format(new Date(booking.checkIn), "HH:mm, dd/MM/yyyy")}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Check-out</p>
                                <p className="text-white font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-rose-400" />
                                    {format(new Date(booking.checkOut), "HH:mm, dd/MM/yyyy")}
                                </p>
                            </div>
                            <div className="col-span-2 pt-2">
                                <p className="text-xs text-zinc-500 uppercase font-semibold mb-2">Thông tin phòng phân bổ</p>
                                {bookingRooms?.length > 0 ? bookingRooms.map((br: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center bg-zinc-950 p-3 rounded border border-zinc-800">
                                        <div>
                                            <p className="text-zinc-200 font-medium">{br.roomType?.name}</p>
                                            <p className="text-sm text-zinc-500">Phòng: <span className="text-amber-400 font-semibold">{br.room?.roomNumber || 'Chưa gán'}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-zinc-300 text-sm">{br.price?.toLocaleString()}đ / đêm</p>
                                        </div>
                                    </div>
                                )) : <p className="text-zinc-500 italic text-sm">Chưa có thông tin phòng</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-3 border-b border-zinc-800/50">
                            <CardTitle className="text-white text-lg flex justify-between items-center">
                                Các dịch vụ sử dụng
                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">{serviceUsages?.length || 0} mục</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ul className="divide-y divide-zinc-800 text-sm">
                                {serviceUsages?.length > 0 ? serviceUsages.map((svc: any) => (
                                    <li key={svc.id} className="p-4 flex justify-between items-center hover:bg-zinc-800/30 transition-colors">
                                        <div>
                                            <p className="text-white font-medium">{svc.service?.name || svc.customName || 'Dịch vụ lẻ'}</p>
                                            <p className="text-xs text-zinc-500 mt-1">Sử dụng lúc {format(new Date(svc.createdAt), "HH:mm dd/MM")} {svc.note && `- ${svc.note}`}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-zinc-300">{svc.quantity} x {svc.unitPrice?.toLocaleString()}đ</p>
                                            <p className="text-emerald-400 font-bold">{(svc.quantity * svc.unitPrice).toLocaleString()}đ</p>
                                        </div>
                                    </li>
                                )) : (
                                    <li className="p-6 text-center text-zinc-500">Khách chưa sử dụng dịch vụ phụ trợ nào.</li>
                                )}
                            </ul>
                        </CardContent>
                    </Card>

                    {vehicleRentals?.length > 0 && (
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="pb-3 border-b border-zinc-800/50">
                                <CardTitle className="text-white text-lg">Lịch sử thuê xe</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ul className="divide-y divide-zinc-800 text-sm">
                                    {vehicleRentals.map((rental: any) => (
                                        <li key={rental.id} className="p-4 flex justify-between items-center hover:bg-zinc-800/30">
                                            <div>
                                                <p className="text-white font-medium">Xe: <span className="text-blue-400">{rental.vehicle?.licensePlate || 'N/A'}</span></p>
                                                <p className="text-xs text-zinc-500 mt-1">{format(new Date(rental.startTime), "HH:mm dd/MM")} - {rental.endTime ? format(new Date(rental.endTime), "HH:mm dd/MM") : 'Chưa trả xe'}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className={rental.status === 'COMPLETED' ? "border-emerald-500/30 text-emerald-400" : "border-rose-500/30 text-rose-400"}>
                                                    {rental.status}
                                                </Badge>
                                                <p className="text-zinc-300 mt-1">{rental.totalAmount?.toLocaleString()}đ</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Guest & Payment Summary */}
                <div className="space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-3 border-b border-zinc-800/50">
                            <CardTitle className="text-white text-lg">Khách hàng</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex gap-3 items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                                    {(guest?.name || 'W')?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-bold">{guest?.name || 'Khách lẻ (Walk-in)'}</p>
                                    <p className="text-xs text-zinc-500">Nguồn: <span className="text-zinc-300 uppercase">{booking.source}</span></p>
                                </div>
                            </div>

                            <Separator className="bg-zinc-800" />

                            <div className="space-y-3 text-sm">
                                <div className="flex gap-2 items-center text-zinc-300">
                                    <Phone className="w-4 h-4 text-zinc-500" />
                                    {guest?.phone || 'Chưa cập nhật SĐT'}
                                </div>
                                <div className="flex gap-2 items-center text-zinc-300">
                                    <CreditCard className="w-4 h-4 text-zinc-500" />
                                    {guest?.idNumber || 'Chưa cập nhật CCCD/Hộ chiếu'}
                                </div>
                                <div className="flex gap-2 items-center text-zinc-300">
                                    <MapPin className="w-4 h-4 text-zinc-500" />
                                    {guest?.nationality || 'Chưa có thông tin quốc tịch'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-3 border-b border-zinc-800/50">
                            <CardTitle className="text-white text-lg">Tóm tắt thanh toán</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Trạng thái</span>
                                    <span className={`font-semibold ${booking.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>{getPaymentStr(booking.paymentStatus)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Tiền phòng ({booking.nights} đêm)</span>
                                    <span className="text-zinc-300">{(booking.totalAmount - (serviceUsages?.reduce((a: any, b: any) => a + (b.amount || 0), 0) || 0)).toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Tiền dịch vụ/phụ thu</span>
                                    <span className="text-zinc-300">{(serviceUsages?.reduce((a: any, b: any) => a + (b.amount || 0), 0) || 0).toLocaleString()}đ</span>
                                </div>
                            </div>

                            <Separator className="bg-zinc-800" />

                            <div className="flex justify-between items-center bg-zinc-950 p-3 rounded border border-zinc-800">
                                <span className="text-zinc-300 uppercase text-xs font-bold">Tổng số tiền</span>
                                <span className="text-rose-400 font-bold text-lg">{booking.totalAmount?.toLocaleString()} ₫</span>
                            </div>

                            <div className="flex justify-between items-center pl-2 pr-1">
                                <span className="text-zinc-400 text-sm">Khách đã trả</span>
                                <span className="text-emerald-400 font-medium">{booking.paidAmount?.toLocaleString()} ₫</span>
                            </div>

                            <div className="flex justify-between items-center pl-2 pr-1 pb-2">
                                <span className="text-zinc-400 text-sm font-semibold">Còn lại cần thu</span>
                                <span className="text-rose-300 font-bold">{Math.max(0, booking.totalAmount - booking.paidAmount).toLocaleString()} ₫</span>
                            </div>
                        </CardContent>
                    </Card>

                    {payments?.length > 0 && (
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader className="pb-3 border-b border-zinc-800/50">
                                <CardTitle className="text-white text-lg text-sm">Lịch sử thu tiền</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ul className="divide-y divide-zinc-800 text-sm">
                                    {payments.map((p: any) => (
                                        <li key={p.id} className="p-3">
                                            <div className="flex justify-between">
                                                <span className="text-zinc-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {p.amount?.toLocaleString()}đ</span>
                                                <span className="text-xs text-zinc-500">{format(new Date(p.paidAt), "dd/MM/yyyy HH:mm")}</span>
                                            </div>
                                            <div className="flex justify-between mt-1 text-xs">
                                                <span className="text-zinc-500 uppercase">{p.method}</span>
                                                <span className="text-zinc-400 truncate max-w-[120px]">{p.note || 'Không có ghi chú'}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
