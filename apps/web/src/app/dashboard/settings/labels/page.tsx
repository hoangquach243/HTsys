'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Page() {
    const labels = [
        { name: 'VIP', color: '#EF4444' },
        { name: 'Khách quen', color: '#3B82F6' },
        { name: 'Đoàn', color: '#10B981' },
        { name: 'Cần chú ý', color: '#F59E0B' },
    ];
    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white text-base">Quản lý nhãn</CardTitle>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">+ Tạo nhãn</Button>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-3">
                    {labels.map((l) => (
                        <Badge key={l.name} style={{ backgroundColor: l.color + '20', color: l.color, borderColor: l.color + '40' }} variant="outline" className="px-4 py-2 text-sm cursor-pointer hover:opacity-80">{l.name}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
