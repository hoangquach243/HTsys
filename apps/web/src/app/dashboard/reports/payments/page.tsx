'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calendar as CalendarIcon, HandCoins, Building2, SmartphoneNfc, FileX2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// static data removed

const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function PaymentsReportPage() {
    const [period, setPeriod] = useState('thisMonth');
    const [data, setData] = useState<any[]>([]);
    const [kpi, setKpi] = useState({ bank: 0, cash: 0, card: 0, debt: 0 });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/reports/payments?propertyId=clouq2m1q00003b6w5z8s6xy9&period=${period}`);
                const json = await res.json();
                if (json.data) setData(json.data);
                if (json.kpi) setKpi(json.kpi);
            } catch (err) {
                console.error("Error fetching payments report", err);
            }
        };
        fetchData();
    }, [period]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <HandCoins className="w-6 h-6 text-amber-500" />
                        Báo cáo Thanh toán
                    </h1>
                    <p className="text-zinc-400 mt-1">Phân tích dòng tiền theo phương thức thanh toán.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[160px] bg-zinc-900 border-zinc-800 text-white">
                            <CalendarIcon className="w-4 h-4 mr-2 text-zinc-400" />
                            <SelectValue placeholder="Chọn thời gian" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="7days">7 ngày qua</SelectItem>
                            <SelectItem value="thisMonth">Tháng này</SelectItem>
                            <SelectItem value="lastMonth">Tháng trước</SelectItem>
                            <SelectItem value="thisYear">Năm nay</SelectItem>
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
                <Card className="bg-emerald-950/20 border-emerald-900/50 hover:bg-emerald-900/20 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-emerald-400 uppercase tracking-wider">Chuyển khoản</p>
                                <h3 className="text-2xl font-bold text-white mt-2">{formatVND(kpi.bank)}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-950/20 border-blue-900/50 hover:bg-blue-900/20 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-blue-400 uppercase tracking-wider">Tiền mặt</p>
                                <h3 className="text-2xl font-bold text-white mt-2">{formatVND(kpi.cash)}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <HandCoins className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-purple-950/20 border-purple-900/50 hover:bg-purple-900/20 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-purple-400 uppercase tracking-wider">Thẻ VISA/Master</p>
                                <h3 className="text-2xl font-bold text-white mt-2">{formatVND(kpi.card)}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                <SmartphoneNfc className="w-5 h-5 text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-rose-950/20 border-rose-900/50 hover:bg-rose-900/20 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-rose-400 uppercase tracking-wider">Công nợ (Chưa thu)</p>
                                <h3 className="text-2xl font-bold text-rose-200 mt-2">{formatVND(kpi.debt)}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                                <FileX2 className="w-5 h-5 text-rose-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-zinc-950 border-zinc-900 shadow-lg">
                <CardHeader className="border-b border-zinc-800/50 pb-4">
                    <CardTitle className="text-lg font-semibold text-white">Xu hướng Phương thức thanh toán (Tháng)</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBank" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCard" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#c084fc" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}M`} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                                    formatter={(value: any) => [formatVND(value as number), '']}
                                />
                                <Area type="monotone" dataKey="bank" name="Chuyển khoản" stroke="#10b981" fillOpacity={1} fill="url(#colorBank)" stackId="1" />
                                <Area type="monotone" dataKey="card" name="Thẻ VISA/Master" stroke="#c084fc" fillOpacity={1} fill="url(#colorCard)" stackId="1" />
                                <Area type="monotone" dataKey="cash" name="Tiền mặt" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCash)" stackId="1" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
