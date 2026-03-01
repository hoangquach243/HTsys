'use client';

import React, { useState } from 'react';
import {
    Search, Filter, Plus, ArrowUpRight, ArrowDownRight,
    Wallet, CreditCard, Receipt, FileText, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Mock data
const mockPayments = [
    { id: 'PMT-1001', bookingCode: 'BK-001', guest: 'Nguyễn Văn An', amount: 800000, method: 'MoMo', date: '2023-11-20 14:30', staff: 'Reception 1' },
    { id: 'PMT-1002', bookingCode: 'BK-002', guest: 'Trần Thị Bình', amount: 500000, method: 'Thẻ tín dụng', date: '2023-11-20 15:15', staff: 'Reception 2' },
    { id: 'PMT-1003', bookingCode: 'BK-003', guest: 'Lê Hoàng Tâm', amount: 1500000, method: 'Chuyển khoản', date: '2023-11-21 09:00', staff: 'Reception 1' },
    { id: 'PMT-1004', bookingCode: 'BK-004', guest: 'Phạm Quang Minh', amount: 1200000, method: 'Tiền mặt', date: '2023-11-21 11:45', staff: 'Reception 2' },
];

const mockExpenses = [
    { id: 'EXP-101', category: 'Lương & Thưởng', description: 'Lương nhân viên T10', amount: 45000000, date: '2023-11-05', recurring: false },
    { id: 'EXP-102', category: 'Điện nước', description: 'Tiền điện tháng 10', amount: 12500000, date: '2023-11-10', recurring: false },
    { id: 'EXP-103', category: 'Giặt ủi', description: 'Thanh toán công ty giặt ủi', amount: 4200000, date: '2023-11-15', recurring: false },
    { id: 'EXP-104', category: 'Bảo trì', description: 'Sửa 2 máy lạnh hỏng', amount: 1500000, date: '2023-11-18', recurring: false },
    { id: 'EXP-105', category: 'Phần mềm', description: 'Phí duy trì GoHost CLone', amount: 500000, date: '2023-11-01', recurring: true },
];

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState('payments');
    const [searchQuery, setSearchQuery] = useState('');

    const getMethodColor = (method: string) => {
        const methods: Record<string, string> = {
            'Tiền mặt': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            'Chuyển khoản': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            'Thẻ tín dụng': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
            'MoMo': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
        };
        return methods[method] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Tài chính</h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Quản lý phiếu thu, phiếu chi, công nợ và sổ quỹ tiền mặt.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900">
                        <Download className="mr-2 h-4 w-4" />
                        Xuất báo cáo
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo phiếu thu/chi
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <Wallet className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Tồn quỹ hiện tại</span>
                    </div>
                    <span className="text-2xl font-bold text-white">35,400,000₫</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-medium uppercase tracking-wider">Tổng thu (Tháng)</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-500">128,500,000₫</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <ArrowUpRight className="h-4 w-4 text-rose-500" />
                        <span className="text-xs font-medium uppercase tracking-wider">Tổng chi (Tháng)</span>
                    </div>
                    <span className="text-2xl font-bold text-rose-500">63,700,000₫</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <FileText className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-medium uppercase tracking-wider">Lợi nhuận gộp</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-400">64,800,000₫</span>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-zinc-900/50 border border-zinc-800">
                    <TabsTrigger value="payments" className="data-[state=active]:bg-zinc-800">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Khoản thu (Payments)
                    </TabsTrigger>
                    <TabsTrigger value="expenses" className="data-[state=active]:bg-zinc-800">
                        <Receipt className="w-4 h-4 mr-2" />
                        Khoản chi (Expenses)
                    </TabsTrigger>
                </TabsList>

                <div className="flex items-center space-x-3 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Tìm kiếm..."
                            className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-200 focus-visible:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select defaultValue="this_month">
                        <SelectTrigger className="w-[180px] bg-zinc-950 border-zinc-800 text-zinc-300">
                            <SelectValue placeholder="Thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this_month">Tháng này</SelectItem>
                            <SelectItem value="last_month">Tháng trước</SelectItem>
                            <SelectItem value="this_year">Năm nay</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" className="bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>

                {/* TAB: PAYMENTS */}
                <TabsContent value="payments">
                    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
                        <Table>
                            <TableHeader className="bg-zinc-900/80 border-b border-zinc-800">
                                <TableRow className="hover:bg-transparent border-zinc-800">
                                    <TableHead className="text-zinc-400 font-medium py-4">Mã giao dịch</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Mã Đặt Phòng</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Khách hàng</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4 text-right">Số tiền (VNĐ)</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Phương thức</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Thời gian</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Nhân viên</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockPayments.filter(p =>
                                    p.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    p.guest.toLowerCase().includes(searchQuery.toLowerCase())
                                ).map((pmt) => (
                                    <TableRow key={pmt.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                                        <TableCell className="text-zinc-400 text-sm">{pmt.id}</TableCell>
                                        <TableCell className="font-medium text-blue-400">{pmt.bookingCode}</TableCell>
                                        <TableCell className="text-zinc-100">{pmt.guest}</TableCell>
                                        <TableCell className="text-right text-emerald-400 font-bold whitespace-nowrap">
                                            +{pmt.amount.toLocaleString('vi-VN')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getMethodColor(pmt.method)}>
                                                {pmt.method}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-400 text-sm">{pmt.date}</TableCell>
                                        <TableCell className="text-zinc-400 text-sm">{pmt.staff}</TableCell>
                                    </TableRow>
                                ))}
                                {mockPayments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                                            Không có khoản thu nào.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* TAB: EXPENSES */}
                <TabsContent value="expenses">
                    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
                        <Table>
                            <TableHeader className="bg-zinc-900/80 border-b border-zinc-800">
                                <TableRow className="hover:bg-transparent border-zinc-800">
                                    <TableHead className="text-zinc-400 font-medium py-4">Mã chi</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Hạng mục</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Nội dung</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4 text-right">Số tiền (VNĐ)</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Ngày chi</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4 text-center">Định kỳ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockExpenses.filter(e =>
                                    e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    e.description.toLowerCase().includes(searchQuery.toLowerCase())
                                ).map((exp) => (
                                    <TableRow key={exp.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                                        <TableCell className="text-zinc-400 text-sm">{exp.id}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-zinc-800 text-zinc-200 border-zinc-700">
                                                {exp.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-300">{exp.description}</TableCell>
                                        <TableCell className="text-right text-rose-400 font-bold whitespace-nowrap">
                                            -{exp.amount.toLocaleString('vi-VN')}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 text-sm">{exp.date}</TableCell>
                                        <TableCell className="text-center">
                                            {exp.recurring ? (
                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Có</Badge>
                                            ) : (
                                                <span className="text-zinc-600">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {mockExpenses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                                            Không có khoản chi nào.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
