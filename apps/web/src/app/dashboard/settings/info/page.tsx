'use client';

import React, { useState } from 'react';
import { Building2, Save, Upload, MapPin, Phone, Mail, Clock, Globe, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsInfoPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">Thông tin Cơ sở gốc</h3>
                    <p className="text-sm text-zinc-400">Quản lý thông tin hiển thị, liên hệ và chính sách cơ bản của khách sạn.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Lưu Thay Đổi
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-zinc-900 border border-zinc-800">
                    <TabsTrigger value="general" className="data-[state=active]:bg-zinc-800">Thông tin chung</TabsTrigger>
                    <TabsTrigger value="policies" className="data-[state=active]:bg-zinc-800">Chính sách & Giờ giấc</TabsTrigger>
                    <TabsTrigger value="regional" className="data-[state=active]:bg-zinc-800">Khu vực & Tiền tệ</TabsTrigger>
                </TabsList>

                {/* GENERAL INFO */}
                <TabsContent value="general" className="mt-6 space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-500" />
                                Chi tiết Cơ sở
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-zinc-300">Tên Khách sạn / Homestay</Label>
                                        <Input id="name" defaultValue="HT House Đà Lạt" className="bg-zinc-950 border-zinc-800 text-white" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone" className="text-zinc-300">Số điện thoại liên hệ</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                            <Input id="phone" defaultValue="0909123456" className="pl-9 bg-zinc-950 border-zinc-800 text-white" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-zinc-300">Email công ty</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                            <Input id="email" type="email" defaultValue="info@hthouse.vn" className="pl-9 bg-zinc-950 border-zinc-800 text-white" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="address" className="text-zinc-300">Địa chỉ</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                            <Input id="address" defaultValue="123 Nguyễn Chí Thanh, Phường 1, Đà Lạt" className="pl-9 bg-zinc-950 border-zinc-800 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-64 flex flex-col gap-2">
                                    <Label className="text-zinc-300">Logo Khách sạn</Label>
                                    <div className="border-2 border-dashed border-zinc-700 rounded-xl h-48 flex flex-col items-center justify-center bg-zinc-950/50 hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                                        <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="h-6 w-6 text-zinc-400" />
                                        </div>
                                        <span className="text-sm text-zinc-400 font-medium">Tải ảnh lên (Max 2MB)</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* POLICIES */}
                <TabsContent value="policies" className="mt-6 space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-emerald-500" />
                                Cấu hình Thời gian & Nhận phòng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="checkIn" className="text-zinc-300">Giờ Check-in Tiêu chuẩn</Label>
                                        <Input id="checkIn" type="time" defaultValue="14:00" className="bg-zinc-950 border-zinc-800 text-white w-full md:w-1/2" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="checkOut" className="text-zinc-300">Giờ Check-out Tiêu chuẩn</Label>
                                        <Input id="checkOut" type="time" defaultValue="12:00" className="bg-zinc-950 border-zinc-800 text-white w-full md:w-1/2" />
                                    </div>
                                </div>

                                <div className="space-y-6 border border-zinc-800 rounded-xl p-5 bg-zinc-950/50">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-zinc-200 text-base">Cho phép Tính tiền linh hoạt (Theo giờ)</Label>
                                            <p className="text-sm text-zinc-500">Kích hoạt bảng giá linh hoạt ngoài tính ngày.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-zinc-200 text-base">Yêu cầu thanh toán trước khi Check-out</Label>
                                            <p className="text-sm text-zinc-500">Cảnh báo nếu Check-out mà Booking còn công nợ ròng.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* REGIONAL */}
                <TabsContent value="regional" className="mt-6 space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-500" />
                                Khu vực & Cấu hình Giao diện
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label className="text-zinc-300">Múi giờ (Timezone)</Label>
                                    <Select defaultValue="Asia/Ho_Chi_Minh">
                                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                                            <SelectValue placeholder="Chọn múi giờ" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</SelectItem>
                                            <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-zinc-300">Đơn vị tiền tệ mặc định</Label>
                                    <Select defaultValue="VND">
                                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                                            <SelectValue placeholder="Chọn tiền tệ" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="VND">VND - Việt Nam Đồng</SelectItem>
                                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-zinc-300">Màu hiển thị trên Sơ đồ phòng</Label>
                                    <Select defaultValue="status">
                                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                                            <SelectValue placeholder="Chọn chế độ màu" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="status">Theo Trạng thái (Nhận phòng, Đã đặt...)</SelectItem>
                                            <SelectItem value="source">Theo Nguồn (Agoda, Booking, Trực tiếp...)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-zinc-300">Chế độ xem Mặc định (Lịch biểu)</Label>
                                    <Select defaultValue="month">
                                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                                            <SelectValue placeholder="Chọn ngày mặc định" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="week">1 Tuần (7 Ngày)</SelectItem>
                                            <SelectItem value="month">1 Tháng (30 Ngày)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
