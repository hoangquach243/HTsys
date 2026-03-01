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

export default function TasksPage() {
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
                    <h2 className="text-3xl font-bold tracking-tight">Công việc</h2>
                    <p className="text-muted-foreground mt-1">
                        Quản lý các công việc dọn dẹp, bảo trì và phân công nhân viên.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <CalendarRange className="mr-2 h-4 w-4" />
                        Lịch công việc
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm công việc
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">Danh sách công việc</TabsTrigger>
                    <TabsTrigger value="automation">Tự động hóa (Auto)</TabsTrigger>
                    <TabsTrigger value="templates">Mẫu công việc (Templates)</TabsTrigger>
                </TabsList>

                {/* TAB: LIST */}
                <TabsContent value="list" className="space-y-4">
                    <div className="flex items-center space-x-2">
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

                    {/* TASKS TABS */}
                    <Tabs defaultValue="pending" className="mt-4">
                        <TabsList className="bg-zinc-900 border border-zinc-800">
                            <TabsTrigger value="pending" className="data-[state=active]:bg-zinc-800">Phòng cần dọn</TabsTrigger>
                            <TabsTrigger value="completed" className="data-[state=active]:bg-zinc-800">Phòng đã dọn</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending" className="mt-4">
                            <Card className="bg-zinc-950 border-zinc-800">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-zinc-800 hover:bg-transparent">
                                            <TableHead className="text-zinc-400">Thời gian tạo</TableHead>
                                            <TableHead className="text-zinc-400">Yêu cầu</TableHead>
                                            <TableHead className="text-zinc-400">Phòng</TableHead>
                                            <TableHead className="text-zinc-400">Loại</TableHead>
                                            <TableHead className="text-zinc-400">Trạng thái</TableHead>
                                            <TableHead className="text-right text-zinc-400">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tasks.filter(t => t.status !== 'COMPLETED').map((task) => (
                                            <TableRow key={task.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                                <TableCell className="text-zinc-400 text-sm">
                                                    {format(new Date(task.createdAt), "HH:mm dd/MM")}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium text-zinc-100 block">{task.title}</span>
                                                    {task.description && <span className="text-xs text-zinc-500 block max-w-[250px] truncate">{task.description}</span>}
                                                </TableCell>
                                                <TableCell>
                                                    {task.roomId ? <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 pointer-events-none">P. {task.room?.roomNumber || task.roomId.substring(0, 4)}</Badge> : '-'}
                                                </TableCell>
                                                <TableCell>{getTypeBadge(task.type)}</TableCell>
                                                <TableCell>{getStatusBadge(task.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" className="bg-emerald-600/10 text-emerald-500 border-emerald-600/20 hover:bg-emerald-600 hover:text-white" onClick={() => handleCompleteTask(task.id)}>
                                                        <Check className="w-4 h-4 mr-1" />
                                                        Đã dọn xong
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {tasks.filter(t => t.status !== 'COMPLETED').length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-zinc-500 text-sm">Không có phòng nào cần dọn</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>

                        <TabsContent value="completed" className="mt-4">
                            <Card className="bg-zinc-950 border-zinc-800">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-zinc-800 hover:bg-transparent">
                                            <TableHead className="text-zinc-400">Thời gian dọn xong</TableHead>
                                            <TableHead className="text-zinc-400">Yêu cầu</TableHead>
                                            <TableHead className="text-zinc-400">Phòng</TableHead>
                                            <TableHead className="text-zinc-400">Loại</TableHead>
                                            <TableHead className="text-zinc-400">Trạng thái</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tasks.filter(t => t.status === 'COMPLETED').map((task) => (
                                            <TableRow key={task.id} className="border-zinc-800 hover:bg-zinc-900/50 opacity-70">
                                                <TableCell className="text-zinc-400 text-sm">
                                                    {task.updatedAt ? format(new Date(task.updatedAt), "HH:mm dd/MM") : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium text-zinc-300 block line-through">{task.title}</span>
                                                </TableCell>
                                                <TableCell>
                                                    {task.roomId ? <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-500 pointer-events-none">P. {task.room?.roomNumber || task.roomId.substring(0, 4)}</Badge> : '-'}
                                                </TableCell>
                                                <TableCell>{getTypeBadge(task.type)}</TableCell>
                                                <TableCell>{getStatusBadge(task.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {tasks.filter(t => t.status === 'COMPLETED').length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-zinc-500 text-sm">Chưa có phòng nào dọn xong hôm nay</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                {/* TAB: AUTOMATION */}
                <TabsContent value="automation" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quy tắc Tự động tạo việc dọn dẹp</CardTitle>
                            <CardDescription>
                                Thiết lập hệ thống tự động sinh ra các công việc (Task) khi có sự kiện từ PMS.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <p className="font-medium">Khi khách Check-out</p>
                                    <p className="text-sm text-muted-foreground">Tự động tạo task "Dọn phòng trả" và chuyển trạng thái phòng thành "Đang dọn dẹp" (Cleaning).</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Đang bật</Badge>
                                    <Button variant="outline" size="sm">
                                        <Settings2 className="w-4 h-4 mr-2" />
                                        Cấu hình
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <p className="font-medium">Khi phòng có khách lưu trú qua đêm (Dọn hằng ngày)</p>
                                    <p className="text-sm text-muted-foreground">Tự động sinh task dọn phòng lúc 8:00 sáng mỗi ngày.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Đang bật</Badge>
                                    <Button variant="outline" size="sm">
                                        <Settings2 className="w-4 h-4 mr-2" />
                                        Cấu hình
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-dashed text-muted-foreground rounded-lg bg-zinc-50/5 dark:bg-zinc-900/50">
                                <div className="space-y-1">
                                    <p className="font-medium">Sau khi dọn xong (Task Hoàn thành)</p>
                                    <p className="text-sm">Chuyển trạng thái phòng từ "Cleaning" sang "Available".</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline">Tắt</Badge>
                                    <Button variant="outline" size="sm">
                                        <Settings2 className="w-4 h-4 mr-2" />
                                        Cấu hình
                                    </Button>
                                </div>
                            </div>

                            <Button className="w-full mt-4" variant="secondary">
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm quy tắc tự động hóa mới
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: TEMPLATES */}
                <TabsContent value="templates" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-muted-foreground">
                            Sử dụng các mẫu (Templates) dựng sẵn để tạo nhanh công việc gồm nhiều bước con (Subtasks).
                        </p>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo mẫu công việc
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mockTemplates.map((tpl) => (
                            <Card key={tpl.id} className="hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        {getTypeBadge(tpl.type)}
                                        {tpl.active ? (
                                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Active</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-zinc-500/10 text-zinc-500">Draft</Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg mt-2">{tpl.name}</CardTitle>
                                    <CardDescription>Bao gồm {tpl.subtasks} subtasks</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="w-full">Dùng mẫu</Button>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
