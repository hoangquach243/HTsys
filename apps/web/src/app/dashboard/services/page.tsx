'use client';

import React, { useState } from 'react';
import {
    Search, Filter, Plus, MoreHorizontal, ConciergeBell, Tag, Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Mock data
const mockServices = [
    { id: 'SRV-001', code: 'MINI-WATER', name: 'Nước suối Dasani', group: 'Minibar', price: 15000, pricingMode: 'FIXED', type: 'SERVICE', isActive: true },
    { id: 'SRV-002', code: 'MINI-COKE', name: 'Coca Cola', group: 'Minibar', price: 20000, pricingMode: 'FIXED', type: 'SERVICE', isActive: true },
    { id: 'SRV-003', code: 'LD-WASH', name: 'Giặt sấy (kg)', group: 'Giặt ủi', price: 30000, pricingMode: 'FIXED', type: 'SERVICE', isActive: true },
    { id: 'SRV-004', code: 'BKF-BUFFET', name: 'Buffet Sáng', group: 'F&B', price: 150000, pricingMode: 'PER_PERSON_NIGHT', type: 'SERVICE', isActive: true },
    { id: 'SRV-005', code: 'EXT-BED', name: 'Giường phụ (Extra Bed)', group: 'Phụ thu', price: 300000, pricingMode: 'PER_NIGHT', type: 'SURCHARGE', isActive: true },
    { id: 'SRV-006', code: 'LATE-CO', name: 'Check-out trễ (1H)', group: 'Phụ thu', price: 50000, pricingMode: 'FIXED', type: 'SURCHARGE', isActive: false },
    { id: 'SRV-007', code: 'TRANS-APT', name: 'Đưa đón sân bay', group: 'Vận chuyển', price: 350000, pricingMode: 'FIXED', type: 'SERVICE', isActive: true },
];

export default function ServicesPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredServices = mockServices.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.group.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getPricingModeLabel = (mode: string) => {
        const modes: Record<string, string> = {
            'FIXED': 'Cố định/Lần',
            'PER_NIGHT': 'Theo đêm lưu trú',
            'PER_PERSON': 'Theo số khách',
            'PER_PERSON_NIGHT': 'Khách/Đêm',
        };
        return modes[mode] || mode;
    };

    const getTypeColor = (type: string) => {
        if (type === 'SURCHARGE') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Dịch vụ & Phụ thu</h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Quản lý các loại hình dịch vụ bán kèm và chính sách phụ thu cho khách sạn.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm mới
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <ConciergeBell className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Tổng dịch vụ</span>
                    </div>
                    <span className="text-2xl font-bold text-white">45</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <Tag className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Phụ thu (Surcharge)</span>
                    </div>
                    <span className="text-2xl font-bold text-rose-400">8</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <Coins className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Doanh thu tháng này</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-400">12.5tr</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Tìm theo tên, mã hoặc nhóm dịch vụ..."
                        className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px] bg-zinc-950 border-zinc-800 text-zinc-300">
                        <SelectValue placeholder="Phân loại" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả phân loại</SelectItem>
                        <SelectItem value="service">Dịch vụ (Add-on)</SelectItem>
                        <SelectItem value="surcharge">Phụ thu (Surcharge)</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="all_group">
                    <SelectTrigger className="w-[180px] bg-zinc-950 border-zinc-800 text-zinc-300">
                        <SelectValue placeholder="Nhóm" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all_group">Tất cả nhóm</SelectItem>
                        <SelectItem value="minibar">Minibar</SelectItem>
                        <SelectItem value="fb">F&B</SelectItem>
                        <SelectItem value="laundry">Giặt ủi</SelectItem>
                        <SelectItem value="transport">Vận chuyển</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            {/* Data Table */}
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
                <Table>
                    <TableHeader className="bg-zinc-900/80 border-b border-zinc-800">
                        <TableRow className="hover:bg-transparent border-zinc-800">
                            <TableHead className="text-zinc-400 font-medium py-4">Mã</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">Tên dịch vụ</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">Nhóm</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">Phân loại</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4 text-right">Đơn giá</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">Cách tính</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4 text-center">Trạng thái</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4 text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredServices.length > 0 ? filteredServices.map((service) => (
                            <TableRow key={service.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                                <TableCell className="text-zinc-300 font-medium">{service.code}</TableCell>
                                <TableCell className="font-semibold text-zinc-100">{service.name}</TableCell>
                                <TableCell className="text-zinc-400">{service.group}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getTypeColor(service.type)}>
                                        {service.type === 'SERVICE' ? 'Dịch vụ' : 'Phụ thu'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-zinc-100 font-medium">
                                    {service.price.toLocaleString('vi-VN')}₫
                                </TableCell>
                                <TableCell className="text-zinc-400 text-sm">
                                    {getPricingModeLabel(service.pricingMode)}
                                </TableCell>
                                <TableCell className="text-center">
                                    {service.isActive ? (
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-normal">Đang bán</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 font-normal">Tạm ngưng</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                            <DropdownMenuItem className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                                                Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                                                {service.isActive ? 'Tạm ngưng bán' : 'Mở bán lại'}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-zinc-800" />
                                            <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300 cursor-pointer">
                                                Xóa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-zinc-500">
                                    Không tìm thấy dịch vụ/phụ thu nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
