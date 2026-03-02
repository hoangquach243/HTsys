'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { FileWarning, Search, Filter, Download, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ReceivablesPage() {
    const [receivables, setReceivables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReceivables();
    }, []);

    const fetchReceivables = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/finance/receivables?propertyId=clouq2m1q00003b6w5z8s6xy9');
            const data = await res.json();
            setReceivables(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error("Failed to load receivables", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = receivables.filter(r => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            r.code?.toLowerCase().includes(term) ||
            r.guest?.name?.toLowerCase().includes(term) ||
            r.source?.toLowerCase().includes(term) ||
            r.otaCode?.toLowerCase().includes(term)
        );
    });

    const getStatusDisplay = (status: string) => {
        if (status === 'UNPAID') return <span className="text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded text-xs font-medium border border-orange-500/20">Chưa thu</span>;
        if (status === 'PARTIAL') return <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded text-xs font-medium border border-blue-500/20">Thu 1 phần</span>;
        return <span className="text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded text-xs font-medium uppercase">{status}</span>;
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
                        <FileWarning className="w-6 h-6 text-orange-500" /> Quản lý Công nợ
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">Danh sách các khoản tiền chưa thanh toán từ khách hàng / đối tác</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Tìm mã Booking, tên khách, OTA Code..."
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
                                <th className="px-4 py-3 font-medium">Mã đặt phòng</th>
                                <th className="px-4 py-3 font-medium">Nguồn</th>
                                <th className="px-4 py-3 font-medium">Tên khách hàng</th>
                                <th className="px-4 py-3 font-medium text-right">Số tiền (Công nợ)</th>
                                <th className="px-4 py-3 font-medium">Trạng thái</th>
                                <th className="px-4 py-3 font-medium">OTA code</th>
                                <th className="px-4 py-3 font-medium">Ghi chú</th>
                                <th className="px-4 py-3 font-medium">Ngày tạo</th>
                                <th className="px-4 py-3 font-medium">Người tạo</th>
                                <th className="px-4 py-3 font-medium">Ngày thanh toán</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center text-zinc-500">Đang tải dữ liệu công nợ...</td>
                                </tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map(r => {
                                    const debtAmount = Math.max(0, r.totalAmount - r.paidAmount);
                                    return (
                                        <tr key={r.id} className="hover:bg-zinc-900/30 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-white flex items-center gap-1 cursor-pointer group-hover:text-amber-400 transition-colors">
                                                    {r.code || 'N/A'}
                                                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs uppercase text-zinc-400 font-medium">{r.source || 'Walk-in'}</td>
                                            <td className="px-4 py-3 font-medium text-zinc-200">{r.guest?.name || 'Walk-in'}</td>
                                            <td className="px-4 py-3 text-right font-bold text-orange-400">
                                                {debtAmount.toLocaleString('vi-VN')} ₫
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusDisplay(r.paymentStatus)}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-zinc-400 font-mono">
                                                {r.otaCode || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-xs max-w-[150px] truncate" title={r.notes}>
                                                {r.notes || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-400 text-xs">
                                                {format(new Date(r.createdAt), 'dd/MM/yyyy')}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {r.createdBy?.name || 'Hệ thống'}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-500 font-mono text-center">
                                                _
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center text-zinc-500">Không tìm thấy công nợ nào. Tuyệt vời!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
