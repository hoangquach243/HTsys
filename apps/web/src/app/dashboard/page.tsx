'use client';

import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    BarChart3,
    DollarSign,
    ClipboardList,
    Moon,
    TrendingUp,
    Info,
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
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart
} from 'recharts';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const iconMap: any = {
    CreditCard: CreditCard,
    BarChart3: BarChart3,
    DollarSign: DollarSign,
};

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Default 30 days range
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date()
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // Hardcoded propertyId for now
                let url = `http://localhost:3001/api/dashboard/summary?propertyId=clouq2m1q00003b6w5z8s6xy9`;

                if (dateRange?.from) {
                    url += `&startDate=${dateRange.from.toISOString()}`;
                }
                if (dateRange?.to) {
                    url += `&endDate=${dateRange.to.toISOString()}`;
                }

                const res = await fetch(url);
                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [dateRange]);

    if (loading && !data) {
        return <div className="p-8 text-center text-zinc-400">Đang tải bảng điều khiển...</div>;
    }

    if (!data) {
        return <div className="p-8 text-center text-red-400">Không thể tải dữ liệu</div>;
    }

    return (
        <TooltipProvider delayDuration={0}>
            <div className="space-y-6 flex flex-col h-full">
                {/* Page Title & Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Bảng điều khiển</h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            Tổng quan hoạt động kinh doanh {dateRange?.from && dateRange?.to ? `từ ${format(dateRange.from, 'dd/MM/yyyy')} đến ${format(dateRange.to, 'dd/MM/yyyy')}` : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DateRangePicker
                            date={dateRange}
                            setDate={setDateRange}
                            className="w-full sm:w-auto"
                        />
                    </div>
                </div>

                {loading && data && (
                    <div className="absolute inset-0 z-50 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="text-white text-sm">Đang tải lại...</span>
                    </div>
                )}

                {/* Main KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.kpiCards.map((kpi: any) => {
                        const Icon = iconMap[kpi.icon] || ClipboardList;
                        return (
                            <Card key={kpi.label} className="bg-zinc-900 border-zinc-800 overflow-hidden relative">
                                <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-5`} />
                                <CardContent className="p-6 relative">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-zinc-400">{kpi.label}</p>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="h-4 w-4 text-zinc-500 hover:text-zinc-300" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                                                        <p>{kpi.label === 'Tổng doanh thu' ? 'Toàn bộ khoản tiền khách đã trả bao gồm tiền phòng và dịch vụ' : kpi.label === 'Tỷ lệ lấp đầy' ? 'Phần trăm số đêm bán được trên tổng số khả dụng' : 'Doanh thu phòng trung bình chia cho mỗi phòng khả dụng'}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <p className="text-3xl font-bold text-white mt-2">
                                                {typeof kpi.value === 'number' && kpi.label !== 'Tỷ lệ lấp đầy'
                                                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(kpi.value)
                                                    : kpi.value
                                                }
                                            </p>
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
                    {data.subKpis.map((kpi: any) => (
                        <Card key={kpi.label} className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs text-zinc-500">{kpi.label}</p>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3 w-3 text-zinc-600 hover:text-zinc-400" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-zinc-800 text-white border-zinc-700 text-xs">
                                            <p>Chỉ số chi tiết cho: {kpi.label}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <p className="text-lg font-semibold text-white">
                                    {typeof kpi.value === 'number' && !kpi.label.includes('SL') && !kpi.label.includes('Đêm') && !kpi.label.includes('Tỷ lệ')
                                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(kpi.value)
                                        : kpi.value
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Revenue Chart */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            Biểu đồ Hoạt động
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-zinc-500 hover:text-zinc-300" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                                    <p>Tương quan giữa Doanh thu và Tỷ lệ lấp đầy theo ngày</p>
                                </TooltipContent>
                            </Tooltip>
                        </CardTitle>
                        <CardDescription>
                            Xu hướng kinh doanh trong khoảng thời gian đã chọn
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={data.chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}tr`} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                    <RechartsTooltip
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
                            <div className="border-b border-zinc-800 px-4 flex overflow-x-auto">
                                <TabsList className="bg-transparent h-12 gap-0 flex-shrink-0">
                                    {data.roomStatusTabs.map((tab: any) => (
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

                            {data.roomStatusTabs.map((tab: any) => (
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
                                    <div className="border border-zinc-800 rounded-lg overflow-hidden max-w-full overflow-x-auto">
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
                                                {data.tableData.filter((b: any) => b.tabs.includes(tab.key)).map((b: any) => (
                                                    <TableRow key={b.id} className="border-zinc-800 hover:bg-zinc-800/30">
                                                        <TableCell className="font-medium text-blue-400">{b.code}</TableCell>
                                                        <TableCell className="text-zinc-300">{b.rooms || 'Chưa xếp'}</TableCell>
                                                        <TableCell className="text-zinc-100">{b.guestName}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="border-zinc-700 text-zinc-300">{b.source}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-zinc-300">{b.nights}</TableCell>
                                                        <TableCell className="text-zinc-300">{b.checkIn ? format(new Date(b.checkIn), 'dd/MM/yyyy HH:mm') : '-'}</TableCell>
                                                        <TableCell className="text-zinc-300">{b.checkOut ? format(new Date(b.checkOut), 'dd/MM/yyyy HH:mm') : '-'}</TableCell>
                                                        <TableCell className="text-right text-white font-medium">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.totalAmount)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {data.tableData.filter((b: any) => b.tabs.includes(tab.key)).length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={8} className="text-center text-zinc-500 py-6">
                                                            Không có dữ liệu
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
}
