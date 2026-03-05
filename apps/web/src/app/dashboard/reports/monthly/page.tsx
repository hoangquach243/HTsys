'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, CalendarDays, LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// static data removed

const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function MonthlyReportPage() {
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [data, setData] = useState<any[]>([]);
    const [yearData, setYearData] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/reports/monthly?propertyId=clouq2m1q00003b6w5z8s6xy9&year=${year}`);
                const json = await res.json();
                if (json.data) setData(json.data);
                if (json.yearData) setYearData(json.yearData);
            } catch (err) {
                console.error("Error fetching monthly report", err);
            }
        };
        fetchData();
    }, [year]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-teal-500" />
                        Báo cáo Tổng hợp Tháng
                    </h1>
                    <p className="text-zinc-400 mt-1">So sánh tổng quan kinh doanh giữa các năm theo lũy kế tháng.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[120px] bg-zinc-900 border-zinc-800 text-white">
                            <SelectValue placeholder="Năm" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300">
                        <Download className="w-4 h-4 mr-2" />
                        Xuất Excel (Toàn bộ)
                    </Button>
                </div>
            </div>

            <Card className="bg-zinc-950 border-zinc-900 shadow-lg mb-6">
                <CardHeader className="border-b border-zinc-800/50 pb-4">
                    <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                        <LineChartIcon className="w-5 h-5 text-zinc-400" />
                        Biến động Doanh Thu (2025 vs 2026)
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="month" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                                    formatter={(value: any) => value > 0 ? formatVND(value as number) : ['Chưa có', '']}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" dataKey={(parseInt(year) - 1).toString()} name={`Năm ${(parseInt(year) - 1)}`} stroke="#52525b" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                                <Line type="monotone" dataKey={year} name={`Năm ${year}`} stroke="#10b981" strokeWidth={4} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card className="bg-zinc-950 border-zinc-900 shadow-lg">
                <CardHeader className="border-b border-zinc-800/50 pb-4">
                    <CardTitle className="text-lg font-semibold text-white">Bảng thống kê Chi tiết KQKD 2026</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto rounded-b-lg">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-900">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-zinc-300 w-48 border-r border-zinc-800">CÁC CHỈ TIÊU</th>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                        <th key={m} className="px-4 py-4 font-semibold text-zinc-300 text-right">Tháng {m}</th>
                                    ))}
                                    <th className="px-6 py-4 font-bold text-white text-right bg-zinc-800/50">TỔNG/TB</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800 text-zinc-400">
                                <tr className="hover:bg-zinc-900/30">
                                    <td className="px-6 py-4 font-medium text-white border-r border-zinc-800">1. Tổng Doanh Thu</td>
                                    {yearData.map((m: any) => <td key={m.month} className="px-4 py-4 text-right">{m.totalRev > 0 ? formatVND(m.totalRev) : '-'}</td>)}
                                    <td className="px-6 py-4 font-bold text-white text-right bg-zinc-800/50">{formatVND(yearData.reduce((acc, m) => acc + m.totalRev, 0))}</td>
                                </tr>
                                <tr className="hover:bg-zinc-900/30 text-xs">
                                    <td className="px-6 py-2 pl-12 border-r border-zinc-800">• Tiền phòng</td>
                                    {yearData.map((m: any) => <td key={m.month} className="px-4 py-2 text-right">{m.roomRev > 0 ? formatVND(m.roomRev) : '-'}</td>)}
                                    <td className="px-6 py-2 text-right bg-zinc-800/50">{formatVND(yearData.reduce((acc, m) => acc + m.roomRev, 0))}</td>
                                </tr>
                                <tr className="hover:bg-zinc-900/30 text-xs text-zinc-400 border-b border-zinc-800">
                                    <td className="px-6 py-2 pl-12 border-r border-zinc-800 pb-4">• Dịch vụ</td>
                                    {yearData.map((m: any) => <td key={m.month} className="px-4 py-2 text-right pb-4">{m.servRev > 0 ? formatVND(m.servRev) : '-'}</td>)}
                                    <td className="px-6 py-2 text-right bg-zinc-800/50 pb-4">{formatVND(yearData.reduce((acc, m) => acc + m.servRev, 0))}</td>
                                </tr>

                                <tr className="hover:bg-zinc-900/30">
                                    <td className="px-6 py-4 font-medium text-white border-r border-zinc-800">2. Số Đêm Phòng</td>
                                    {yearData.map((m: any) => <td key={m.month} className="px-4 py-4 text-right">{m.nights > 0 ? m.nights : '-'}</td>)}
                                    <td className="px-6 py-4 font-bold text-white text-right bg-zinc-800/50">{yearData.reduce((acc, m) => acc + m.nights, 0)}</td>
                                </tr>

                                <tr className="hover:bg-zinc-900/30">
                                    <td className="px-6 py-4 font-medium text-white border-r border-zinc-800">3. OCC (%)</td>
                                    {yearData.map((m: any) => <td key={m.month} className="px-4 py-4 text-right text-emerald-400">{m.occ > 0 ? m.occ + '%' : '-'}</td>)}
                                    <td className="px-6 py-4 font-bold text-emerald-400 text-right bg-zinc-800/50">
                                        {yearData.filter(m => m.occ > 0).length > 0 ? Math.round(yearData.reduce((acc, m) => acc + m.occ, 0) / yearData.filter(m => m.occ > 0).length) + '%' : '-'}
                                    </td>
                                </tr>

                                <tr className="hover:bg-zinc-900/30">
                                    <td className="px-6 py-4 font-medium text-white border-r border-zinc-800">4. Lợi nhuận gộp (Est.)</td>
                                    {yearData.map((m: any) => <td key={m.month} className="px-4 py-4 text-right">{m.gross > 0 ? `${Math.round(m.gross / 1000000)}M` : '-'}</td>)}
                                    <td className="px-6 py-4 font-bold text-amber-500 text-right bg-zinc-800/50">{formatVND(yearData.reduce((acc, m) => acc + m.gross, 0))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
