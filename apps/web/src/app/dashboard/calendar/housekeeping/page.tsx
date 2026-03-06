'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Search, Filter, MoreHorizontal, Settings2, CalendarRange, Clock, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

const mockTemplates = [
    { id: 'TPL-1', name: 'Dọn phòng tiêu chuẩn', type: 'HOUSEKEEPING', subtasks: 5, active: true },
    { id: 'TPL-2', name: 'Bảo trì định kỳ máy lạnh', type: 'MAINTENANCE', subtasks: 8, active: true },
    { id: 'TPL-3', name: 'Dọn phòng sau sửa chữa', type: 'HOUSEKEEPING', subtasks: 4, active: false },
];

export default function HousekeepingPage() {
    const [activeTab, setActiveTab] = useState('list');
    const [tasks, setTasks] = useState<any[]>([]);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/tasks?propertyId=clouq2m1q00003b6w5z8s6xy9`);
            const json = await res.json();
            setTasks(Array.isArray(json) ? json : (json.data || []));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCompleteTask = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:3001/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'COMPLETED' })
            });
            if (res.ok) fetchTasks();
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string, color: string }> = {
            PENDING: { label: 'Cần dọn', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
            IN_PROGRESS: { label: 'Đang dọn', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
            COMPLETED: { label: 'Đã dọn xong', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
        };
        const s = statusMap[status] || statusMap.PENDING;
        return <Badge variant="outline" className={s.color}>{s.label}</Badge>;
    };

    const getTypeBadge = (type: string) => {
        const typeMap: Record<string, { label: string, color: string }> = {
            HOUSEKEEPING: { label: 'Dọn dẹp', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
            MAINTENANCE: { label: 'Bảo trì', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
            OTHER: { label: 'Khác', color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' },
        };
        const t = typeMap[type] || typeMap.OTHER;
        return <Badge variant="outline" className={t.color}>{t.label}</Badge>;
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Lịch dọn phòng</h2>
                    <p className="text-muted-foreground mt-1">
                        Quản lý các công việc dọn dẹp buồng phòng hằng ngày và khi khách trả phòng.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm lịch dọn
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-2 mb-6 mt-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tìm kiếm công việc phòng..." className="pl-8" />
                </div>
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Loại công việc" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        <SelectItem value="housekeeping">Dọn dẹp</SelectItem>
                        <SelectItem value="maintenance">Bảo trì</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="in_progress">Đang làm</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="today">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Hôm nay</SelectItem>
                        <SelectItem value="tomorrow">Ngày mai</SelectItem>
                        <SelectItem value="this_week">Tuần này</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CỘT TRÁI: CẦN DỌN */}
                <div className="space-y-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-md p-3 flex justify-between items-center">
                        <h3 className="font-semibold text-zinc-100 flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-amber-500" /> Cần dọn dẹp
                        </h3>
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 border hover:bg-amber-500/20">
                            {tasks.filter(t => t.status !== 'COMPLETED').length} công việc
                        </Badge>
                    </div>

                    <Card className="bg-zinc-950 border-zinc-800">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-400">Yêu cầu</TableHead>
                                    <TableHead className="text-zinc-400">Phòng</TableHead>
                                    <TableHead className="text-right text-zinc-400">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.filter(t => t.status !== 'COMPLETED').map((task) => (
                                    <TableRow key={task.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                        <TableCell>
                                            <span className="font-medium text-zinc-100 block">{task.title}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-zinc-500 flex items-center"><Clock className="w-3 h-3 mr-1" /> {format(new Date(task.createdAt), "HH:mm")}</span>
                                                {getTypeBadge(task.type)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {task.roomId ? <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 pointer-events-none text-sm px-2 py-1">P. {task.room?.roomNumber || task.roomId.substring(0, 4)}</Badge> : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" className="bg-emerald-600/10 text-emerald-500 border-emerald-600/20 hover:bg-emerald-600 hover:text-white" onClick={() => handleCompleteTask(task.id)}>
                                                <Check className="w-4 h-4 mr-1" />
                                                Hoàn thành
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {tasks.filter(t => t.status !== 'COMPLETED').length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-12 text-zinc-500 text-sm flex flex-col items-center justify-center">
                                            <CheckSquare className="w-8 h-8 mb-2 opacity-20" />
                                            Tuyệt vời! Bạn không còn phòng nào cần dọn lúc này.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>

                {/* CỘT PHẢI: ĐÃ DỌN */}
                <div className="space-y-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-md p-3 flex justify-between items-center">
                        <h3 className="font-semibold text-zinc-100 flex items-center">
                            <CheckSquare className="w-4 h-4 mr-2 text-emerald-500" /> Đã hoàn thành
                        </h3>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 border hover:bg-emerald-500/20">
                            {tasks.filter(t => t.status === 'COMPLETED').length} công việc
                        </Badge>
                    </div>

                    <Card className="bg-zinc-950 border-zinc-800">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-400">Yêu cầu</TableHead>
                                    <TableHead className="text-zinc-400">Phòng</TableHead>
                                    <TableHead className="text-zinc-400">Hoàn thành lúc</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.filter(t => t.status === 'COMPLETED').map((task) => (
                                    <TableRow key={task.id} className="border-zinc-800 hover:bg-zinc-900/50 opacity-60">
                                        <TableCell>
                                            <span className="font-medium text-zinc-300 block line-through">{task.title}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getTypeBadge(task.type)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {task.roomId ? <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-500 pointer-events-none text-sm px-2 py-1">P. {task.room?.roomNumber || task.roomId.substring(0, 4)}</Badge> : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-zinc-400 text-sm flex items-center"><Check className="w-3 h-3 mr-1 text-emerald-500" /> {task.updatedAt ? format(new Date(task.updatedAt), "HH:mm") : '-'}</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {tasks.filter(t => t.status === 'COMPLETED').length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-12 text-zinc-500 text-sm">Chưa có phòng nào dọn xong hôm nay</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </div>
    );
}
