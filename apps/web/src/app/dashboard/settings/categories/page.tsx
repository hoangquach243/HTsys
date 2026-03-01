'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
export default function Page() {
    const items = ['Khách lẻ', 'Đại lý', 'Doanh nghiệp'];
    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white text-base">Phân loại</CardTitle>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">+ Tạo phân loại</Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {items.map((i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 px-4 py-3">
                            <span className="text-sm text-white">{i}</span>
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">Chỉnh sửa</Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
