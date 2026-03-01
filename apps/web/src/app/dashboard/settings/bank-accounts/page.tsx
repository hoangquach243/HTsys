'use client';

import React, { useState } from 'react';
import { Landmark, Plus, Trash2, Edit, CreditCard, Star, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const MOCK_BANKS = [
    { id: '1', bankName: 'Vietcombank', accountNumber: '0123456789', accountName: 'CONG TY TNHH HT HOUSE', branch: 'Chi nhánh Đà Lạt', isDefault: true },
    { id: '2', bankName: 'Techcombank', accountNumber: '1903829102801', accountName: 'NGUYEN VAN A', branch: 'Hội sở', isDefault: false },
    { id: '3', bankName: 'MoMo', accountNumber: '0909123456', accountName: 'NGUYEN VAN A', branch: 'Ví Điện Tử', isDefault: false },
];

export default function BankAccountsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Landmark className="h-6 w-6 text-emerald-500" />
                        Tài khoản Nhận thanh toán
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">Cấu hình số tài khoản để in lên Thu/Chi, Hóa đơn và Mã QR thanh toán.</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm Số Tài Khoản
                </Button>
            </div>

            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-900/80 border-b border-zinc-800">
                        <TableRow className="hover:bg-transparent border-zinc-800">
                            <TableHead className="text-zinc-400 font-medium py-4">Ngân hàng / Ví</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">Chủ tài khoản</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">Số tài khoản</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">Chi nhánh</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4 text-center">Mặc định</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4 text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_BANKS.map(bank => (
                            <TableRow key={bank.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                                <TableCell className="font-semibold text-zinc-200">{bank.bankName}</TableCell>
                                <TableCell className="text-zinc-300 font-mono text-sm">{bank.accountName}</TableCell>
                                <TableCell>
                                    <code className="bg-zinc-950 px-2 py-1 rounded text-blue-400 border border-zinc-800 text-sm font-bold tracking-wider">
                                        {bank.accountNumber}
                                    </code>
                                </TableCell>
                                <TableCell className="text-zinc-400 text-sm">{bank.branch}</TableCell>
                                <TableCell className="text-center">
                                    {bank.isDefault && (
                                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-normal">
                                            <Star className="w-3 h-3 mr-1 fill-yellow-500" /> Chính
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Quick config tips */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-4">
                <Star className="h-6 w-6 text-blue-400 shrink-0" />
                <div className="space-y-1 text-sm text-blue-200">
                    <p className="font-semibold text-blue-300">Tính năng thanh toán tự động (VietQR)</p>
                    <p className="opacity-80">Số tài khoản được đánh dấu "Mặc định" sẽ được sử dụng để tạo mã QR Code động trên Hóa Đơn Khách Hàng và trong Trang Đặt Phòng Online.</p>
                </div>
            </div>
        </div>
    );
}
