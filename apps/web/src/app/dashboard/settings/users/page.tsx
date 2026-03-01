'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SettingsUsersPage() {
    const users = [
        { name: 'Admin', email: 'admin@hthouse.vn', role: 'ADMIN', active: true },
        { name: 'Lễ tân Hoa', email: 'hoa@hthouse.vn', role: 'RECEPTIONIST', active: true },
        { name: 'Quản lý Minh', email: 'minh@hthouse.vn', role: 'MANAGER', active: true },
    ];

    const roleLabels: Record<string, string> = {
        ADMIN: 'Quản trị viên',
        MANAGER: 'Quản lý',
        RECEPTIONIST: 'Lễ tân',
        HOUSEKEEPING: 'Buồng phòng',
    };

    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white text-base">Người dùng</CardTitle>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">+ Mời người dùng</Button>
            </CardHeader>
            <CardContent>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="py-3 px-4 text-left text-zinc-500 font-medium">Tên</th>
                            <th className="py-3 px-4 text-left text-zinc-500 font-medium">Email</th>
                            <th className="py-3 px-4 text-left text-zinc-500 font-medium">Vai trò</th>
                            <th className="py-3 px-4 text-left text-zinc-500 font-medium">Trạng thái</th>
                            <th className="py-3 px-4 text-right text-zinc-500 font-medium">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.email} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                                <td className="py-3 px-4 text-white">{u.name}</td>
                                <td className="py-3 px-4 text-zinc-400">{u.email}</td>
                                <td className="py-3 px-4"><Badge variant="outline" className="border-zinc-700 text-zinc-300">{roleLabels[u.role]}</Badge></td>
                                <td className="py-3 px-4"><Badge className="bg-emerald-500/20 text-emerald-400">Hoạt động</Badge></td>
                                <td className="py-3 px-4 text-right"><Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">Chỉnh sửa</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
