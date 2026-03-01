'use client';

import React, { useState } from 'react';
import {
    Download, Calendar as CalendarIcon, Filter,
    TrendingUp, TrendingDown, DollarSign, Users,
    Activity, Building, Wallet, CreditCard,
    PieChart, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, ComposedChart
} from 'recharts';

// Mock Data
const mockFinancialData = [
    { date: 'Tháng 6', revenue: 120, expense: 40, profit: 80 },
    { date: 'Tháng 7', revenue: 150, expense: 50, profit: 100 },
    { date: 'Tháng 8', revenue: 180, expense: 60, profit: 120 },
    { date: 'Tháng 9', revenue: 140, expense: 45, profit: 95 },
    { date: 'Tháng 10', revenue: 160, expense: 55, profit: 105 },
    { date: 'Tháng 11', revenue: 200, expense: 65, profit: 135 },
];

const mockOperationalData = [
    { date: '01/11', occ: 45, adr: 600, revpar: 270 },
    { date: '05/11', occ: 60, adr: 650, revpar: 390 },
    { date: '10/11', occ: 75, adr: 700, revpar: 525 },
    { date: '15/11', occ: 85, adr: 750, revpar: 637 },
    { date: '20/11', occ: 90, adr: 800, revpar: 720 },
    { date: '25/11', occ: 95, adr: 850, revpar: 807 },
    { date: '30/11', occ: 88, adr: 750, revpar: 660 },
];

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState('this_month');

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl text-sm">
                    <p className="font-medium text-zinc-100 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-zinc-400">{entry.name}:</span>
                            <span className="font-semibold text-zinc-100">
                                {entry.name.includes('%') || entry.name.includes('Lấp đầy')
                                    ? `${entry.value}%`
                                    : entry.name.includes('ADR') || entry.name.includes('RevPAR')
                                        ? `${entry.value}k`
                                        : `${entry.value}tr`}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Báo cáo & Thống kê</h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Phân tích thông minh các chỉ số tài chính và hoạt động kinh doanh (Business Intelligence).
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[180px] bg-zinc-950 border-zinc-800 text-zinc-300">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Thời gian" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800">
                            <SelectItem value="this_month">Tháng này</SelectItem>
                            <SelectItem value="last_month">Tháng trước</SelectItem>
                            <SelectItem value="this_quarter">Quý này</SelectItem>
                            <SelectItem value="this_year">Năm nay</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Download className="mr-2 h-4 w-4" />
                        Xuất báo cáo
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="financial" className="space-y-6">
                <TabsList className="bg-zinc-900/50 border border-zinc-800 h-12 p-1">
                    <TabsTrigger value="financial" className="data-[state=active]:bg-zinc-800 h-full px-6">
                        <Wallet className="w-4 h-4 mr-2" />
                        Báo cáo Tài chính
                    </TabsTrigger>
                    <TabsTrigger value="operational" className="data-[state=active]:bg-zinc-800 h-full px-6">
                        <Activity className="w-4 h-4 mr-2" />
                        Báo cáo Hoạt động (KPIs)
                    </TabsTrigger>
                </TabsList>

                {/* TAB: BÁO CÁO TÀI CHÍNH */}
                <TabsContent value="financial" className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm border-zinc-800 font-medium text-zinc-400">Tổng doanh thu</CardTitle>
                                <DollarSign className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-500">200,000,000₫</div>
                                <p className="text-xs text-emerald-400/80 flex items-center mt-1">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +15.2% so với kỳ trước
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Tổng thực thu</CardTitle>
                                <CreditCard className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-500">185,000,000₫</div>
                                <p className="text-xs text-zinc-500 mt-1">Chưa thu: 15,000,000₫</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Tổng chi phí</CardTitle>
                                <TrendingDown className="h-4 w-4 text-rose-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-rose-500">65,000,000₫</div>
                                <p className="text-xs text-rose-400/80 flex items-center mt-1">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +5.4% so với kỳ trước
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden bg-zinc-900 border-zinc-700">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-indigo-300">Lợi nhuận gộp</CardTitle>
                                <PieChart className="h-4 w-4 text-indigo-400" />
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="text-2xl font-bold text-white">135,000,000₫</div>
                                <p className="text-xs text-indigo-300 mt-1">Tỷ suất lợi nhuận: 67.5%</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Financial Chart */}
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-lg text-white font-medium">Biểu đồ Phân tích Dòng tiền</CardTitle>
                            <CardDescription className="text-zinc-500">So sánh doanh thu, chi phí và lợi nhuận theo các tháng gần nhất (Triệu VNĐ)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockFinancialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="expense" name="Chi phí" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                                        <Line type="monotone" dataKey="profit" name="Lợi nhuận" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: BÁO CÁO HOẠT ĐỘNG (KPI) */}
                <TabsContent value="operational" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Công suất phòng</CardTitle>
                                <Building className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">82.5%</div>
                                <p className="text-xs text-zinc-500 mt-1">245 đêm bán được / 297 tổng số</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Giá ADR (Trung bình)</CardTitle>
                                <BarChart3 className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">765,000₫</div>
                                <p className="text-xs text-emerald-400 mt-1 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +8.0%
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">RevPAR</CardTitle>
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-500">631,125₫</div>
                                <p className="text-xs text-emerald-400 mt-1 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +12.5%
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400">Số khách đến</CardTitle>
                                <Users className="h-4 w-4 text-violet-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">528</div>
                                <p className="text-xs text-zinc-500 mt-1">Thời gian lưu trú TB: 1.8 ngày</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-lg text-white font-medium">Biểu đồ Hiệu suất Hoạt động (KPIs)</CardTitle>
                            <CardDescription className="text-zinc-500">Mối tương quan giữa Tỷ lệ lấp đầy, Tiền phòng bình quân (ADR) và Doanh thu trên mỗi phòng (RevPAR)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={mockOperationalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                                        <Bar yAxisId="right" dataKey="occ" name="Tỷ lệ lấp đầy (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} opacity={0.6} />
                                        <Line yAxisId="left" type="monotone" dataKey="adr" name="ADR (Nghìn VND)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        <Line yAxisId="left" type="monotone" dataKey="revpar" name="RevPAR (Nghìn VND)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
