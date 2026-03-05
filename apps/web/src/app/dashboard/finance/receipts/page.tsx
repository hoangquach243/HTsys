'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { CreditCard, Search, Filter, Download, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ReceiptsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/finance/payments?propertyId=clouq2m1q00003b6w5z8s6xy9');
            const data = await res.json();
            setPayments(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error("Failed to load payments", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(p => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            p.booking?.code?.toLowerCase().includes(term) ||
            p.booking?.guest?.name?.toLowerCase().includes(term) ||
            p.note?.toLowerCase().includes(term)
        );
    });

    const getRoomsString = (bookingRooms: any[]) => {
        if (!bookingRooms || bookingRooms.length === 0) return 'Chưa gán';
        return bookingRooms.map(br => br.room?.roomNumber || 'Trống').join(', ');
    };

    const getMethodDisplay = (method: string) => {
        const mm = method.toLowerCase();
        if (mm === 'cash') return <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-xs font-medium">Tiền mặt</span>;
        if (mm === 'transfer') return <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded text-xs font-medium">Chuyển khoản</span>;
        if (mm === 'card') return <span className="text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded text-xs font-medium">Thẻ từ</span>;
        return <span className="text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded text-xs font-medium uppercase">{method}</span>;
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-emerald-500" /> Danh sách Phiếu Thu
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">Danh sách những lần nhận tiền vào (tiền cọc, thanh toán)</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Tìm mã Booking, tên khách..."
                            className="pl-9 bg-zinc-950 border-zinc-800 text-white w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800">
                        <Filter className="w-4 h-4 mr-2" /> Lọc
                    </Button>
                    <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800">
                        <Download className="w-4 h-4 mr-2" /> Xuất Excel
                    </Button>
                </div>
            </div>

            <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-900/50 text-zinc-400 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 font-medium">Mã Booking</th>
                                <th className="px-4 py-3 font-medium">Phòng</th>
                                <th className="px-4 py-3 font-medium">Khách hàng</th>
                                <th className="px-4 py-3 font-medium text-right">Số tiền (VND)</th>
                                <th className="px-4 py-3 font-medium text-right">Quy đổi</th>
                                <th className="px-4 py-3 font-medium">Phương thức</th>
                                <th className="px-4 py-3 font-medium">Ngày thanh toán</th>
                                <th className="px-4 py-3 font-medium">Nhân viên</th>
                                <th className="px-4 py-3 font-medium">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">Đang tải biểu dữ liệu phiếu thu...</td>
                                </tr>
                            ) : filteredPayments.length > 0 ? (
                                filteredPayments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-zinc-900/30 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-white flex items-center gap-1 cursor-pointer group-hover:text-emerald-400 transition-colors">
                                                {payment.booking?.code || 'N/A'}
                                                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{getRoomsString(payment.booking?.bookingRooms)}</td>
                                        <td className="px-4 py-3">{payment.booking?.guest?.name || 'Walk-in'}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                                            {payment.amount.toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-3 text-right text-zinc-500">
                                            {payment.amount.toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getMethodDisplay(payment.method)}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400 text-xs">
                                            {format(new Date(payment.paidAt), 'dd/MM/yyyy HH:mm')}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {payment.staff?.name || 'Hệ thống'}
                                        </td>
                                        <td className="px-4 py-3 text-xs max-w-[200px] truncate" title={payment.note}>
                                            {payment.note || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">Không tìm thấy giao dịch nào phù hợp.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
