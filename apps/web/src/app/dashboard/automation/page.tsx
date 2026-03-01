'use client';

import React, { useState } from 'react';
import {
    Mail, Zap, Plus, Settings, MessageSquare, Clock, Send, MoreHorizontal,
    Workflow, Filter, Search
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

// Mock Data
const mockTemplates = [
    { id: 'TPL-001', name: 'Xác nhận đặt phòng', subject: 'Xác nhận đặt phòng tại GoHost', trigger: 'booking_confirmed', isActive: true, lastUpdated: '2023-11-01' },
    { id: 'TPL-002', name: 'Nhắc nhở chuẩn bị Check-in', subject: 'Chào mừng bạn đến với GoHost! (Ngày mai)', trigger: 'check_in_reminder', isActive: true, lastUpdated: '2023-11-05' },
    { id: 'TPL-003', name: 'Thư cảm ơn sau Check-out', subject: 'Cảm ơn bạn đã lưu trú tại GoHost', trigger: 'check_out_thanks', isActive: true, lastUpdated: '2023-10-20' },
    { id: 'TPL-004', name: 'Hủy phòng do quá hạn thanh toán', subject: 'Thông báo hủy phòng tự động', trigger: 'payment_overdue', isActive: false, lastUpdated: '2023-11-10' },
];

const mockFlows = [
    { id: 'FLW-001', name: 'Quy trình đặt phòng mới', triggerEvent: 'Khi có Booking Mới', conditions: 'Trạng thái = CONFIRMED', actions: 'Gửi Email [Xác nhận đặt phòng]', isActive: true },
    { id: 'FLW-002', name: 'Nhắc lịch Check-in', triggerEvent: 'Trước Check-in 1 ngày', conditions: 'Không có', actions: 'Gửi Email [Nhắc nhở chuẩn bị Check-in]', isActive: true },
    { id: 'FLW-003', name: 'Xin đánh giá (Review)', triggerEvent: 'Sau Check-out 2 ngày', conditions: 'Khách hàng VIP', actions: 'Gửi Email [Thư cảm ơn sau Check-out]', isActive: false },
];

export default function AutomationPage() {
    const [activeTab, setActiveTab] = useState('flows');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTemplates = mockTemplates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFlows = mockFlows.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.triggerEvent.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Zap className="h-6 w-6 text-yellow-500" />
                        Tự động hóa (Automation)
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Quản lý các kịch bản gửi Email/Tin nhắn tự động để tương tác với khách hàng.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900">
                        <Settings className="mr-2 h-4 w-4" />
                        Cài đặt SMTP
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo {activeTab === 'flows' ? 'Quy trình' : 'Biểu mẫu'}
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <Send className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Email đã gửi (Tháng này)</span>
                    </div>
                    <span className="text-2xl font-bold text-white">1,248</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <Workflow className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-medium uppercase tracking-wider">Quy trình đang bật</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-500">2 / 3</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium uppercase tracking-wider">Mẫu Email (Templates)</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-400">4</span>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-zinc-900/50 border border-zinc-800">
                    <TabsTrigger value="flows" className="data-[state=active]:bg-zinc-800">
                        <Workflow className="w-4 h-4 mr-2" />
                        Quy trình tự động (Flows)
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="data-[state=active]:bg-zinc-800">
                        <Mail className="w-4 h-4 mr-2" />
                        Mẫu Email (Templates)
                    </TabsTrigger>
                </TabsList>

                <div className="flex items-center space-x-3 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Tìm kiếm tên..."
                            className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-200 focus-visible:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>

                {/* TAB: FLOWS */}
                <TabsContent value="flows">
                    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
                        <Table>
                            <TableHeader className="bg-zinc-900/80 border-b border-zinc-800">
                                <TableRow className="hover:bg-transparent border-zinc-800">
                                    <TableHead className="text-zinc-400 font-medium py-4">Tên quy trình</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Sự kiện kích hoạt (Trigger)</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Điều kiện thực thi</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Hành động (Action)</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4 text-center">Trạng thái</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4 text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFlows.map((flow) => (
                                    <TableRow key={flow.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                                        <TableCell className="font-medium text-white">{flow.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 whitespace-nowrap">
                                                <Zap className="mr-1.5 h-3 w-3" />
                                                {flow.triggerEvent}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-400 text-sm whitespace-nowrap">{flow.conditions}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm text-zinc-300 whitespace-nowrap">
                                                <Mail className="h-3 w-3 text-zinc-500 mr-1.5" />
                                                {flow.actions}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {flow.isActive ? (
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-normal">Đang Bật</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 font-normal">Tạm Dừng</Badge>
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
                                                        Chỉnh sửa quy trình
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                                                        {flow.isActive ? 'Tạm dừng' : 'Bật quy trình'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                    <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300 cursor-pointer">
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredFlows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                                            Không có quy trình nào khớp.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* TAB: TEMPLATES */}
                <TabsContent value="templates">
                    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
                        <Table>
                            <TableHeader className="bg-zinc-900/80 border-b border-zinc-800">
                                <TableRow className="hover:bg-transparent border-zinc-800">
                                    <TableHead className="text-zinc-400 font-medium py-4">Tên biểu mẫu</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Tiêu đề Gửi đi (Subject)</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Mã nội bộ</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4 text-center">Trạng thái</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4 text-right">Lần cuối cập nhật</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4 text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTemplates.map((template) => (
                                    <TableRow key={template.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                                        <TableCell className="font-semibold text-zinc-100">{template.name}</TableCell>
                                        <TableCell className="text-zinc-300 text-sm truncate max-w-[250px]">{template.subject}</TableCell>
                                        <TableCell>
                                            <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-xs">
                                                {template.trigger}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {template.isActive ? (
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-normal">Kích hoạt</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 font-normal">Trưởng hợp ngoại lệ</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-zinc-500 text-sm">
                                            {template.lastUpdated}
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
                                                        Chỉnh sửa nội dung
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                                                        Gửi mẫu thử nghiệm
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredTemplates.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                                            Không có mẫu Email nào khớp.
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
