'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
export default function Page() {
    const sources = [
        { name: 'Walk-in', type: 'direct' }, { name: 'Điện thoại', type: 'direct' }, { name: 'Website', type: 'direct' },
        { name: 'Booking.com', type: 'ota' }, { name: 'Agoda', type: 'ota' }, { name: 'Traveloka', type: 'ota' }, { name: 'Airbnb', type: 'ota' },
    ];
    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white text-base">Nguồn đặt phòng</CardTitle>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">+ Thêm nguồn</Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {sources.map((s) => (
                        <div key={s.name} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-white">{s.name}</span>
                                <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">{s.type === 'ota' ? 'OTA' : 'Trực tiếp'}</Badge>
                            </div>
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">Chỉnh sửa</Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
