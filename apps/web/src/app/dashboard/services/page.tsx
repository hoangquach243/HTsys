'use client';

import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Plus, MoreHorizontal, ConciergeBell, Tag, Coins, Trash, FileEdit, RefreshCw
} from 'lucide-react';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function ServicesPage() {
    const propertyId = 'clouq2m1q00003b6w5z8s6xy9';

    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterGroup, setFilterGroup] = useState('all_group');

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        code: '',
        group: '',
        price: '',
        pricingMode: 'FIXED',
        type: 'SERVICE',
        description: '',
        isActive: true,
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/services?propertyId=${propertyId}`);
            const data = await res.json();
            setServices(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error("Failed to fetch services", error);
            toast.error("Lỗi khi tải danh sách dịch vụ");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveService = async () => {
        if (!formData.name || !formData.price || !formData.group) {
            toast.error("Vui lòng điền đầy đủ Tên, Giá và Nhóm dịch vụ!");
            return;
        }

        try {
            const isEditing = !!formData.id;
            const url = isEditing
                ? `http://localhost:3001/api/services/${formData.id}`
                : 'http://localhost:3001/api/services';
            const method = isEditing ? 'PATCH' : 'POST';

            const payload = {
                name: formData.name,
                code: formData.code || undefined,
                group: formData.group,
                price: Number(formData.price),
                pricingMode: formData.pricingMode,
                type: formData.type,
                description: formData.description,
                isActive: formData.isActive,
                propertyId
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                toast.error(errData.message || (isEditing ? "Lỗi cập nhật dịch vụ" : "Lỗi tạo dịch vụ"));
                return;
            }

            toast.success(isEditing ? "Cập nhật dịch vụ thành công!" : "Tạo dịch vụ thành công!");
            setIsDialogOpen(false);
            fetchServices();
        } catch (error) {
            toast.error("Lỗi kết nối đến máy chủ");
            console.error(error);
        }
    };

    const handleDeleteService = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ/phụ thu này?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/services/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Xóa dịch vụ thành công');
                fetchServices();
            } else {
                toast.error('Lỗi khi xóa dịch vụ');
            }
        } catch (error) {
            toast.error('Lỗi kết nối máy chủ');
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`http://localhost:3001/api/services/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (res.ok) {
                toast.success(currentStatus ? 'Đã tạm ngưng bán dịch vụ' : 'Đã mở bán dịch vụ');
                fetchServices();
            } else {
                toast.error('Có lỗi xảy ra');
            }
        } catch (error) {
            toast.error('Lỗi kết nối máy chủ');
        }
    };

    const openEditDialog = (service: any) => {
        setFormData({
            id: service.id,
            name: service.name || '',
            code: service.code || '',
            group: service.group || '',
            price: service.price ? service.price.toString() : '0',
            pricingMode: service.pricingMode || 'FIXED',
            type: service.type || 'SERVICE',
            description: service.description || '',
            isActive: service.isActive ?? true,
        });
        setIsDialogOpen(true);
    };

    const openCreateDialog = () => {
        setFormData({
            id: '',
            name: '',
            code: '',
            group: '',
            price: '',
            pricingMode: 'FIXED',
            type: 'SERVICE',
            description: '',
            isActive: true,
        });
        setIsDialogOpen(true);
    };

    // Filtering
    const filteredServices = services.filter(s => {
        // Search text
        const matchSearch =
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (s.group && s.group.toLowerCase().includes(searchQuery.toLowerCase()));

        // Filter Type
        const matchType = filterType === 'all' || s.type.toLowerCase() === filterType.toLowerCase();

        // Filter Group
        const matchGroup = filterGroup === 'all_group' || (s.group && s.group.toLowerCase() === filterGroup.toLowerCase());

        return matchSearch && matchType && matchGroup;
    });

    const getPricingModeLabel = (mode: string) => {
        const modes: Record<string, string> = {
            'FIXED': 'Cố định/Lần',
            'PER_NIGHT': 'Theo đêm lưu trú',
            'PER_PERSON': 'Theo số khách',
            'PER_PERSON_NIGHT': 'Khách/Đêm',
        };
        return modes[mode] || mode;
    };

    const getTypeColor = (type: string) => {
        if (type === 'SURCHARGE') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    };

    // Quick Stats
    const totalServices = services.length;
    const totalSurcharges = services.filter(s => s.type === 'SURCHARGE').length;
    // (We mock revenue as it usually involves aggregating BookingServices)

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-800 pb-5 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <ConciergeBell className="w-8 h-8 text-blue-500" /> Dịch vụ & Phụ thu
                    </h2>
                    <p className="text-zinc-400 mt-2 text-sm">
                        Quản lý các loại hình dịch vụ bán kèm và chính sách phụ thu cho khách sạn.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20" onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm mới
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <ConciergeBell className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Tổng dịch vụ/phụ thu</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{totalServices}</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <Tag className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Phụ thu (Surcharge)</span>
                    </div>
                    <span className="text-2xl font-bold text-rose-400">{totalSurcharges}</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                        <Coins className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Đang bán (Active)</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-400">{services.filter(s => s.isActive).length}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-3 mb-6">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Tìm theo tên, mã hoặc nhóm dịch vụ..."
                        className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-200 focus-visible:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-[180px] bg-zinc-950 border-zinc-800 text-zinc-300">
                        <SelectValue placeholder="Phân loại" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả phân loại</SelectItem>
                        <SelectItem value="service">Dịch vụ (Add-on)</SelectItem>
                        <SelectItem value="surcharge">Phụ thu (Surcharge)</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterGroup} onValueChange={setFilterGroup}>
                    <SelectTrigger className="w-full md:w-[180px] bg-zinc-950 border-zinc-800 text-zinc-300">
                        <SelectValue placeholder="Nhóm" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all_group">Tất cả nhóm</SelectItem>
                        {/* Unique groups extracted from current properties */}
                        {Array.from(new Set(services.map(s => s.group).filter(Boolean))).map(group => (
                            <SelectItem key={group as string} value={group as string}>{String(group)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Data Table */}
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
                <Table>
                    <TableHeader className="bg-zinc-900/80 border-b border-zinc-800 text-xs uppercase">
                        <TableRow className="hover:bg-transparent border-zinc-800">
                            <TableHead className="text-zinc-400 font-medium py-4">Mã</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">Tên dịch vụ</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">Nhóm</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">Phân loại</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4 text-right">Đơn giá</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4">Cách tính</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4 text-center">Trạng thái</TableHead>
                            <TableHead className="text-zinc-400 font-medium py-4 text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-zinc-500">
                                    Đang tải dữ liệu...
                                </TableCell>
                            </TableRow>
                        ) : filteredServices.length > 0 ? filteredServices.map((service) => (
                            <TableRow key={service.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/60 transition-colors">
                                <TableCell className="text-zinc-300">
                                    <span className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded">{service.code || '-'}</span>
                                </TableCell>
                                <TableCell className="font-semibold text-zinc-100">{service.name}</TableCell>
                                <TableCell className="text-zinc-400 text-sm">{service.group}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getTypeColor(service.type)}>
                                        {service.type === 'SERVICE' ? 'Dịch vụ' : 'Phụ thu'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium text-emerald-400">
                                    {service.price.toLocaleString('vi-VN')}₫
                                </TableCell>
                                <TableCell className="text-zinc-400 text-sm">
                                    {getPricingModeLabel(service.pricingMode)}
                                </TableCell>
                                <TableCell className="text-center">
                                    {service.isActive ? (
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-normal">Đang bán</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 font-normal">Tạm ngưng</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer" onClick={() => openEditDialog(service)}>
                                                <FileEdit className="mr-2 h-4 w-4" /> Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer" onClick={() => handleToggleActive(service.id, service.isActive)}>
                                                <RefreshCw className="mr-2 h-4 w-4" /> {service.isActive ? 'Tạm ngưng bán' : 'Mở bán lại'}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-zinc-800" />
                                            <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer" onClick={() => handleDeleteService(service.id)}>
                                                <Trash className="mr-2 h-4 w-4" /> Xóa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-zinc-500">
                                    Không tìm thấy dịch vụ/phụ thu nào phù hợp.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog For Updating / Creating */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>{formData.id ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ / Phụ Thu'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Khân loại <span className="text-rose-500">*</span></label>
                                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                        <SelectValue placeholder="Chọn loại" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SERVICE">Dịch vụ (Add-on)</SelectItem>
                                        <SelectItem value="SURCHARGE">Phụ thu (Surcharge)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Cách tính giá <span className="text-rose-500">*</span></label>
                                <Select value={formData.pricingMode} onValueChange={(val) => setFormData({ ...formData, pricingMode: val })}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                        <SelectValue placeholder="Cách tính" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FIXED">Cố định / Lần</SelectItem>
                                        <SelectItem value="PER_NIGHT">Theo đêm lưu trú</SelectItem>
                                        <SelectItem value="PER_PERSON">Theo số lượng khách</SelectItem>
                                        <SelectItem value="PER_PERSON_NIGHT">Theo Khách / Đêm</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Tên dịch vụ/phụ thu <span className="text-rose-500">*</span></label>
                            <Input
                                placeholder="VD: Nước suối, Giường phụ v.v..."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-zinc-900 border-zinc-800"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Mã (Không bắt buộc)</label>
                                <Input
                                    placeholder="VD: MINI-WATER"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800 font-mono text-sm uppercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Đơn giá (VND) <span className="text-rose-500">*</span></label>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Nhóm dịch vụ <span className="text-rose-500">*</span></label>
                            <Input
                                placeholder="VD: Minibar, F&B, Vận chuyển..."
                                value={formData.group}
                                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                                className="bg-zinc-900 border-zinc-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Mô tả thêm</label>
                            <Input
                                placeholder="Chi tiết dịch vụ..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="bg-zinc-900 border-zinc-800"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-zinc-800" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveService}>
                            {formData.id ? 'Lưu thay đổi' : 'Tạo mới'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
