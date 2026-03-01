'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function Page() {
    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader><CardTitle className="text-white text-base">Phân quyền</CardTitle></CardHeader>
            <CardContent>
                <p className="text-zinc-500 text-sm">Quản lý vai trò và quyền hạn: Admin, Manager, Receptionist, Housekeeping + Custom roles</p>
                <div className="mt-4 h-64 rounded-lg border border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 text-sm">Permission matrix sẽ được hiện thực ở đây</div>
            </CardContent>
        </Card>
    );
}
