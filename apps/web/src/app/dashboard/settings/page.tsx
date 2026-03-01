'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white text-base">Nhận / Trả phòng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-zinc-400 block mb-2">Giờ nhận phòng</label>
                            <input type="time" defaultValue="14:00" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-zinc-400 block mb-2">Giờ trả phòng</label>
                            <input type="time" defaultValue="12:00" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked id="requirePay" className="rounded border-zinc-600" />
                        <label htmlFor="requirePay" className="text-sm text-zinc-300">Yêu cầu thanh toán trước khi trả phòng</label>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="hourlyBooking" className="rounded border-zinc-600" />
                        <label htmlFor="hourlyBooking" className="text-sm text-zinc-300">Cho phép đặt phòng theo giờ</label>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white text-base">Lịch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-zinc-400 block mb-2">Màu sự kiện</label>
                            <select className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white">
                                <option>Trạng thái nhận phòng</option>
                                <option>Nguồn đặt phòng</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-zinc-400 block mb-2">Khoảng thời gian mặc định</label>
                            <select className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white">
                                <option>Tuần</option>
                                <option>Tháng</option>
                                <option>Năm</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
