'use client';

import React, { useState } from 'react';
import {
    Globe, Link as LinkIcon, Plus, Settings, AlertCircle, RefreshCcw,
    CheckCircle2, XCircle, Clock, Save, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Mock Data
const mockChannels = [
    { id: 'CH-001', name: 'Booking.com', type: 'booking_com', isActive: true, hotelId: '123456', lastSync: '10 phút trước', status: 'connected' },
    { id: 'CH-002', name: 'Agoda', type: 'agoda', isActive: true, hotelId: 'AG-9876', lastSync: '1 giờ trước', status: 'connected' },
    { id: 'CH-003', name: 'Traveloka', type: 'traveloka', isActive: false, hotelId: '', lastSync: 'Chưa đồng bộ', status: 'disconnected' },
    { id: 'CH-004', name: 'Expedia', type: 'expedia', isActive: false, hotelId: '', lastSync: 'Chưa đồng bộ', status: 'disconnected' },
];

const mockMappings = [
    { id: 'MAP-001', internalRoomType: 'Phòng Standard (STD)', externalId: 'BOOKING-ROOM-101', channel: 'Booking.com', ratePlan: 'Standard Rate' },
    { id: 'MAP-002', internalRoomType: 'Phòng Standard (STD)', externalId: 'AGODA-STD', channel: 'Agoda', ratePlan: 'Retail' },
    { id: 'MAP-003', internalRoomType: 'Phòng Deluxe (DLX)', externalId: 'BOOKING-ROOM-102', channel: 'Booking.com', ratePlan: 'Non-Refundable' },
];

const mockLogs = [
    { id: 'LOG-001', time: '10 phút trước', channel: 'Booking.com', action: 'Đồng bộ giá & quỹ phòng', status: 'SUCCESS', details: 'Cập nhật thành công 30 ngày tới' },
    { id: 'LOG-002', time: '15 phút trước', channel: 'Agoda', action: 'Nhận Booking mới (BK-4829)', status: 'SUCCESS', details: 'Khách: John Doe | STD x 2 đêm' },
    { id: 'LOG-003', time: '2 giờ trước', channel: 'Booking.com', action: 'Đồng bộ giá & quỹ phòng', status: 'FAILED', details: 'Lỗi API: Rate ID không hợp lệ cho Deluxe' },
];

export default function ChannelManagerPage() {
    const [activeTab, setActiveTab] = useState('overview');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'disconnected': return <XCircle className="h-4 w-4 text-zinc-500" />;
            case 'error': return <AlertCircle className="h-4 w-4 text-rose-500" />;
            default: return <Clock className="h-4 w-4 text-zinc-500" />;
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Globe className="h-6 w-6 text-blue-500" />
                        Quản lý Kênh Phân Phối (Channel Manager)
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Kết nối, đồng bộ giá, quỹ phòng và nhận booking tự động từ các OTA (Booking.com, Agoda...).
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Đồng bộ toàn bộ
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-zinc-900/50 border border-zinc-800">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800">
                        Tổng quan & Kết nối
                    </TabsTrigger>
                    <TabsTrigger value="mappings" className="data-[state=active]:bg-zinc-800">
                        Map Hạng Phòng & Giá
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="data-[state=active]:bg-zinc-800">
                        Lịch sử Đồng bộ
                    </TabsTrigger>
                </TabsList>

                {/* TAB: OVERVIEW / KẾT NỐI */}
                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockChannels.map((channel) => (
                            <Card key={channel.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
                                <div className={`h-1.5 w-full ${channel.isActive ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                                {channel.name}
                                            </CardTitle>
                                            <CardDescription className="text-zinc-500 mt-1">
                                                Hotel ID: {channel.hotelId || 'Chưa thiết lập'}
                                            </CardDescription>
                                        </div>
                                        {getStatusIcon(channel.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-3 text-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-zinc-400">Trạng thái:</span>
                                        {channel.isActive ? (
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-normal">Đã kết nối</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-800 font-normal">Chưa kết nối</Badge>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-400">Đồng bộ cuối:</span>
                                        <span className="text-zinc-300">{channel.lastSync}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-3 border-t border-zinc-800/60 bg-zinc-900/50">
                                    {channel.isActive ? (
                                        <Button variant="outline" className="w-full bg-zinc-950 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Cấu hình
                                        </Button>
                                    ) : (
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                            <LinkIcon className="h-4 w-4 mr-2" />
                                            Kết nối ngay
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* TAB: MAPPINGS */}
                <TabsContent value="mappings">
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80">
                            <h3 className="font-semibold text-white">Bản đồ liên kết hạng phòng (Room Mappings)</h3>
                            <Button size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">
                                <Plus className="h-4 w-4 mr-2" /> Thêm Mapping
                            </Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-zinc-800">
                                    <TableHead className="text-zinc-400 font-medium py-4">Kênh (OTA)</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Hạng phòng nội bộ</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Room ID trên OTA</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Mã giá (Rate Plan)</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4 text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockMappings.map(map => (
                                    <TableRow key={map.id} className="border-b border-zinc-800/60">
                                        <TableCell>
                                            <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                                                {map.channel}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-blue-400">{map.internalRoomType}</TableCell>
                                        <TableCell>
                                            <code className="bg-zinc-950 px-2 py-1 rounded text-zinc-300 border border-zinc-800 text-xs text-mono">
                                                {map.externalId}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-zinc-400 text-sm">{map.ratePlan}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* TAB: LOGS */}
                <TabsContent value="logs">
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-900/80">
                                <TableRow className="hover:bg-transparent border-zinc-800">
                                    <TableHead className="text-zinc-400 font-medium py-4">Thời gian</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Kênh</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Hành động</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Trạng thái</TableHead>
                                    <TableHead className="text-zinc-400 font-medium py-4">Chi tiết</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockLogs.map(log => (
                                    <TableRow key={log.id} className="border-b border-zinc-800/60">
                                        <TableCell className="text-zinc-400 text-sm whitespace-nowrap">{log.time}</TableCell>
                                        <TableCell className="font-medium text-zinc-200">{log.channel}</TableCell>
                                        <TableCell className="text-zinc-300 text-sm">{log.action}</TableCell>
                                        <TableCell>
                                            {log.status === 'SUCCESS' ? (
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-normal">Thành công</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-normal">Thất bại</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-zinc-400 text-sm">{log.details}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
