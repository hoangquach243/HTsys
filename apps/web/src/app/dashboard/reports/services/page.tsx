'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calendar as CalendarIcon, ConciergeBell, Coffee, Wine, Bath, Utensils } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

// static data removed

const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function ServicesReportPage() {
    const [period, setPeriod] = useState('7days');
    const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
    const [data, setData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [kpi, setKpi] = useState({ totalRev: 0, totalQty: 0, topRev: { name: 'N/A', revenue: 0 }, topCnt: { name: 'N/A', count: 0 } });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                let url = `http://localhost:3001/api/reports/services?propertyId=clouq2m1q00003b6w5z8s6xy9&period=${period}`;
                if (period === 'custom' && customDateRange?.from && customDateRange?.to) {
                    url += `&startDate=${format(customDateRange.from, 'yyyy-MM-dd')}&endDate=${format(customDateRange.to, 'yyyy-MM-dd')}`;
                } else if (period === 'custom') {
                    return;
                }
                const res = await fetch(url);
                const json = await res.json();
                if (json.data) setData(json.data);
                if (json.trendData) setTrendData(json.trendData);
                if (json.kpi) setKpi(json.kpi);
            } catch (err) {
                console.error("Error fetching services report", err);
            }
        };
        fetchData();
    }, [period, customDateRange]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ConciergeBell className="w-6 h-6 text-pink-500" />
                        Báo cáo Dịch vụ
                    </h1>
                    <p className="text-zinc-400 mt-1">Sản phẩm bán chạy và xu hướng sử dụng Minibar, F&B.</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-end">
                    {period === 'custom' && (
                        <div className="flex items-center gap-2">
                            <DateRangePicker date={customDateRange} setDate={setCustomDateRange} />
                        </div>
                    )}
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[160px] bg-zinc-900 border-zinc-800 text-white">
                            <CalendarIcon className="w-4 h-4 mr-2 text-zinc-400" />
                            <SelectValue placeholder="Chọn thời gian" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="7days">7 ngày qua</SelectItem>
                            <SelectItem value="30days">30 ngày qua</SelectItem>
                            <SelectItem value="thisMonth">Tháng này</SelectItem>
                            <SelectItem value="custom">Tùy chỉnh...</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300">
                        <Download className="w-4 h-4 mr-2" />
                        Xuất báo cáo
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">DT Dịch Vụ</p>
                                <h3 className="text-3xl font-bold text-pink-400 mt-2">{formatVND(kpi.totalRev)}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
                                <ConciergeBell className="w-5 h-5 text-pink-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Tổng sản phẩm</p>
                                <h3 className="text-3xl font-bold text-white mt-2">{kpi.totalQty} <span className="text-lg font-normal text-zinc-500">sp</span></h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <Coffee className="w-5 h-5 text-orange-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Top T.Thu</p>
                                <h3 className="text-xl font-bold text-white mt-1 pt-1">{kpi.topRev.name}</h3>
                                <p className="text-xs text-zinc-500 mt-1">{formatVND(kpi.topRev.revenue)}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <Utensils className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Top Số lượng</p>
                                <h3 className="text-xl font-bold text-white mt-1 pt-1">{kpi.topCnt.name}</h3>
                                <p className="text-xs text-zinc-500 mt-1">{kpi.topCnt.count} lượt khách mua</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Wine className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-zinc-950 border-zinc-900 shadow-lg">
                    <CardHeader className="border-b border-zinc-800/50 pb-4">
                        <CardTitle className="text-lg font-semibold text-white">Top Dịch vụ (Theo Doanh thu)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                    <XAxis type="number" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                                    <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={13} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#27272a' }}
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                                        formatter={(value: any) => [formatVND(value as number), 'Doanh thu']}
                                    />
                                    <Bar dataKey="revenue" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={24}>
                                        <LabelList dataKey="revenue" position="right" formatter={(v: any) => `${(v as number) / 1000000}M`} fill="#a1a1aa" fontSize={11} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-950 border-zinc-900 shadow-lg">
                    <CardHeader className="border-b border-zinc-800/50 pb-4">
                        <CardTitle className="text-lg font-semibold text-white">Xu hướng tiêu thụ Dịch vụ (7 ngày)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="time" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                                    <Tooltip
                                        cursor={{ fill: '#27272a' }}
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                                        formatter={(value: any) => [formatVND(value as number), 'Doanh thu']}
                                    />
                                    <Bar dataKey="services" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
