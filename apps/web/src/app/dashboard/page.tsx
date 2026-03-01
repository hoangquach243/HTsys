'use client';

import React from 'react';
import {
    CreditCard,
    BarChart3,
    DollarSign,
    ClipboardList,
    Moon,
    TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    BarChart,
    Bar,
    Line,
    LineChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart
} from 'recharts';

// Mock data for dashboard
const kpiCards = [
    { label: 'Tổng doanh thu', value: '12.50 triệu', icon: CreditCard, trend: '+12.5%', color: 'from-blue-500 to-blue-600' },
    { label: 'Tỷ lệ lấp đầy', value: '75.0%', icon: BarChart3, trend: '+5.2%', color: 'from-emerald-500 to-emerald-600' },
    { label: 'RevPAR', value: '625.0 nghìn', icon: DollarSign, trend: '+8.3%', color: 'from-violet-500 to-violet-600' },
];

const subKpis = [
    { label: 'Doanh thu phòng', value: '10.80 triệu' },
    { label: 'Doanh thu dịch vụ', value: '1.70 triệu' },
    { label: 'Giá phòng TB (ADR)', value: '720.0 nghìn' },
    { label: 'SL Đặt phòng', value: '18' },
    { label: 'Đêm đã bán', value: '45' },
    { label: 'Tỷ lệ hủy', value: '5.6%' },
];

const roomStatusTabs = [
    { key: 'unassigned', label: 'Chưa xếp phòng', count: 2 },
    { key: 'arriving', label: 'Sắp nhận phòng', count: 3 },
    { key: 'departing', label: 'Sắp trả phòng', count: 1 },
    { key: 'inhouse', label: 'Đang lưu trú', count: 4 },
    { key: 'upcoming', label: 'Khách sẽ đến', count: 5 },
    { key: 'new', label: 'Đặt mới', count: 2 },
];

const mockChartData = [
    { date: '01/11', revenue: 4500000, occupancy: 65 },
    { date: '05/11', revenue: 5200000, occupancy: 70 },
    { date: '10/11', revenue: 4800000, occupancy: 68 },
    { date: '15/11', revenue: 6100000, occupancy: 85 },
    { date: '20/11', revenue: 5900000, occupancy: 80 },
    { date: '25/11', revenue: 7500000, occupancy: 95 },
    { date: '30/11', revenue: 6800000, occupancy: 88 },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-white">Bảng điều khiển</h1>
                <p className="text-sm text-zinc-500 mt-1">Tổng quan hoạt động kinh doanh</p>
            </div>

            {/* Main KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {kpiCards.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <Card key={kpi.label} className="bg-zinc-900 border-zinc-800 overflow-hidden relative">
                            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-5`} />
                            <CardContent className="p-6 relative">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-zinc-400">{kpi.label}</p>
                                        <p className="text-3xl font-bold text-white mt-2">{kpi.value}</p>
                                        <div className="flex items-center gap-1 mt-2">
                                            <TrendingUp size={14} className="text-emerald-400" />
                                            <span className="text-sm text-emerald-400">{kpi.trend}</span>
                                        </div>
                                    </div>
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg`}>
                                        <Icon size={24} className="text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Sub KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {subKpis.map((kpi) => (
                    <Card key={kpi.label} className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-4">
                            <p className="text-xs text-zinc-500">{kpi.label}</p>
                            <p className="text-lg font-semibold text-white mt-1">{kpi.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Revenue Chart */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white text-base">
                        Doanh thu và Tỷ lệ lấp đầy (30 ngày qua)
                    </CardTitle>
                    <CardDescription>
                        Xu hướng kinh doanh tháng này
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={mockChartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}tr`} />
                                <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="revenue" name="Doanh thu (VNĐ)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Line yAxisId="right" type="monotone" dataKey="occupancy" name="Tỷ lệ lấp đầy (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Room Status Tabs */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-0">
                    <Tabs defaultValue="unassigned">
                        <div className="border-b border-zinc-800 px-4">
                            <TabsList className="bg-transparent h-12 gap-0">
                                {roomStatusTabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.key}
                                        value={tab.key}
                                        className="data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 rounded-none text-zinc-400 px-4 h-12"
                                    >
                                        {tab.label}
                                        <Badge variant="secondary" className="ml-2 bg-zinc-800 text-zinc-300 text-xs">
                                            {tab.count}
                                        </Badge>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {roomStatusTabs.map((tab) => (
                            <TabsContent key={tab.key} value={tab.key} className="p-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative flex-1 max-w-sm">
                                        <Input
                                            type="text"
                                            placeholder="Tìm kiếm mã đặt phòng, tên khách..."
                                            className="w-full border-zinc-800 bg-zinc-950 text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="border border-zinc-800 rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-zinc-900/50">
                                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                                <TableHead className="text-zinc-400">Mã ĐP</TableHead>
                                                <TableHead className="text-zinc-400">Phòng</TableHead>
                                                <TableHead className="text-zinc-400">Họ và tên</TableHead>
                                                <TableHead className="text-zinc-400">Nguồn</TableHead>
                                                <TableHead className="text-zinc-400">Số đêm</TableHead>
                                                <TableHead className="text-zinc-400">Nhận phòng</TableHead>
                                                <TableHead className="text-zinc-400">Trả phòng</TableHead>
                                                <TableHead className="text-zinc-400 text-right">Tổng cộng</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow className="border-zinc-800 hover:bg-zinc-800/30">
                                                <TableCell className="font-medium text-blue-400">BK-001</TableCell>
                                                <TableCell className="text-zinc-300">A.301</TableCell>
                                                <TableCell className="text-zinc-100">Nguyễn Văn An</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-zinc-700 text-zinc-300">Walk-in</Badge>
                                                </TableCell>
                                                <TableCell className="text-zinc-300">1</TableCell>
                                                <TableCell className="text-zinc-300">28/02/2026</TableCell>
                                                <TableCell className="text-zinc-300">01/03/2026</TableCell>
                                                <TableCell className="text-right text-white font-medium">800,000₫</TableCell>
                                            </TableRow>
                                            <TableRow className="border-zinc-800 hover:bg-zinc-800/30">
                                                <TableCell className="font-medium text-blue-400">BK-002</TableCell>
                                                <TableCell className="text-zinc-300">B.201</TableCell>
                                                <TableCell className="text-zinc-100">Trần Thị Bình</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10">Agoda</Badge>
                                                </TableCell>
                                                <TableCell className="text-zinc-300">1</TableCell>
                                                <TableCell className="text-zinc-300">01/03/2026</TableCell>
                                                <TableCell className="text-zinc-300">02/03/2026</TableCell>
                                                <TableCell className="text-right text-white font-medium">500,000₫</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
