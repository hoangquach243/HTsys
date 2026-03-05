'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Plus, Search, Filter, Download, DollarSign, ArrowUpRight, FolderOpen, MoreHorizontal, FileEdit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isOpen, setIsOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [categoryForm, setCategoryForm] = useState({ id: '', name: '' });
    const propertyId = 'clouq2m1q00003b6w5z8s6xy9';

    const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        id: '',
        title: '',
        category: '',
        newCategoryName: '',
        amount: '',
        description: '',
        code: ''
    });

    useEffect(() => {
        fetchExpenses();
        fetchCategories();
    }, []);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/finance/expenses?propertyId=${propertyId}`);
            const data = await res.json();
            setExpenses(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error("Failed to load expenses", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/settings/categories?propertyId=${propertyId}`);
            const data = await res.json();
            setCategories(Array.isArray(data) ? data.filter((c: any) => c.type === 'expense') : []);
        } catch (error) {
            console.error("Failed to load categories", error);
        }
    };

    const handleCreateExpense = async () => {
        let finalCategory = formData.category;

        if (formData.category === 'new' && formData.newCategoryName.trim()) {
            try {
                const catRes = await fetch('http://localhost:3001/api/settings/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.newCategoryName.trim(),
                        type: 'expense',
                        propertyId
                    })
                });
                if (!catRes.ok) {
                    const err = await catRes.json();
                    toast.error(err.message || "Không thể tạo danh mục mới");
                    return;
                }
                const newCat = await catRes.json();
                finalCategory = newCat.name;
            } catch (error) {
                console.error("Could not create Category", error);
                toast.error("Lỗi khi tạo danh mục mới");
                return;
            }
        }

        try {
            const isEditing = !!formData.id;
            const url = isEditing
                ? `http://localhost:3001/api/finance/expenses/${formData.id}`
                : 'http://localhost:3001/api/finance/expenses';
            const method = isEditing ? 'PATCH' : 'POST';

            const expenseRes = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    code: formData.code || undefined,
                    category: finalCategory,
                    amount: Number(formData.amount),
                    description: formData.description,
                    propertyId
                })
            });

            if (!expenseRes.ok) {
                const errData = await expenseRes.json();
                toast.error(errData.message || (isEditing ? "Không thể cập nhật phiếu chi" : "Không thể tạo phiếu chi"));
                console.error("Expense operation error:", errData);
                return;
            }

            toast.success(isEditing ? "Cập nhật phiếu chi thành công!" : "Tạo phiếu chi thành công!");
            setIsOpen(false);
            setFormData({ id: '', title: '', category: '', newCategoryName: '', amount: '', description: '', code: '' });
            fetchExpenses();
            fetchCategories(); // Refresh categories in case a new one was added
        } catch (error) {
            toast.error("Lỗi kết nối máy chủ");
            console.error("Failed to save expense", error);
        }
    };

    const handleEditExpense = (expense: any) => {
        setFormData({
            id: expense.id,
            title: expense.title || '',
            category: expense.category || '',
            newCategoryName: '',
            amount: expense.amount ? expense.amount.toString() : '',
            description: expense.description || '',
            code: expense.code || ''
        });
        setIsOpen(true);
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa phiếu chi này? Hành động này không thể hoàn tác.')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/finance/expenses/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('Xóa phiếu chi thành công');
                fetchExpenses();
            } else {
                toast.error('Lỗi khi xóa phiếu chi');
            }
        } catch (error) {
            toast.error('Lỗi kết nối máy chủ');
            console.error("Failed to delete expense", error);
        }
    };

    const handleBatchDeleteExpenses = async () => {
        if (!selectedExpenses.length) return;
        if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedExpenses.length} phiếu chi đã chọn? Hành động này không thể hoàn tác.`)) return;

        try {
            const promises = selectedExpenses.map(id => fetch(`http://localhost:3001/api/finance/expenses/${id}`, { method: 'DELETE' }));
            const results = await Promise.all(promises);
            const success = results.every(res => res.ok);

            if (success) {
                toast.success(`Đã xóa thành công ${selectedExpenses.length} phiếu chi`);
                setSelectedExpenses([]);
                fetchExpenses();
            } else {
                toast.error("Một số phiếu chi không thể xóa");
                fetchExpenses();
            }
        } catch (error) {
            toast.error("Lỗi kết nối máy chủ");
            console.error(error);
        }
    };

    const handleSaveCategory = async () => {
        try {
            if (categoryForm.id) {
                const patchRes = await fetch(`http://localhost:3001/api/settings/categories/${categoryForm.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: categoryForm.name.trim() })
                });
                if (!patchRes.ok) throw new Error(await patchRes.text());
            } else {
                const postRes = await fetch('http://localhost:3001/api/settings/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: categoryForm.name.trim(),
                        type: 'expense',
                        propertyId
                    })
                });
                if (!postRes.ok) throw new Error(await postRes.text());
            }
            toast.success("Lưu danh mục thành công!");
            setIsCategoryOpen(false);
            setCategoryForm({ id: '', name: '' });
            fetchCategories();
        } catch (error) {
            console.error("Failed to save category", error);
            toast.error("Không thể lưu danh mục. Vui lòng thử lại!");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
        try {
            await fetch(`http://localhost:3001/api/settings/categories/${id}`, {
                method: 'DELETE'
            });
            fetchCategories();
            fetchExpenses();
        } catch (error) {
            console.error("Failed to delete category", error);
        }
    };

    const handleBatchDeleteCategories = async () => {
        if (!selectedCategories.length) return;
        if (!confirm(`Bạn có chắc muốn xóa ${selectedCategories.length} danh mục đã chọn?`)) return;
        try {
            const promises = selectedCategories.map(id => fetch(`http://localhost:3001/api/settings/categories/${id}`, { method: 'DELETE' }));
            const results = await Promise.all(promises);
            const success = results.every(res => res.ok);
            if (success) {
                toast.success(`Đã xóa thành công ${selectedCategories.length} danh mục`);
                setSelectedCategories([]);
                fetchCategories();
                fetchExpenses();
            } else {
                toast.error("Một số danh mục không thể xóa");
                fetchCategories();
            }
        } catch (error) {
            toast.error("Lỗi kết nối máy chủ");
            console.error(error);
        }
    };

    const filteredData = expenses.filter(e => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            e.code?.toLowerCase().includes(term) ||
            e.title?.toLowerCase().includes(term) ||
            e.category?.toLowerCase().includes(term) ||
            e.description?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-rose-500" /> Quản lý Chi phí (Phiếu chi)
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">Ghi nhận các khoản chi xuất khỏi quỹ tiền tệ</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {selectedExpenses.length > 0 && (
                        <Button className="bg-red-900/40 hover:bg-red-900/80 text-red-500 border border-red-900/30 whitespace-nowrap" onClick={handleBatchDeleteExpenses}>
                            <Trash className="w-4 h-4 mr-2" /> Xóa ({selectedExpenses.length})
                        </Button>
                    )}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Tìm kiếm phiếu chi..."
                            className="pl-9 bg-zinc-950 border-zinc-800 text-white w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Dialog open={isOpen} onOpenChange={(open) => {
                        setIsOpen(open);
                        if (!open) setFormData({ id: '', title: '', category: '', newCategoryName: '', amount: '', description: '', code: '' });
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-rose-600 hover:bg-rose-700 text-white">
                                <Plus className="w-4 h-4 mr-2" /> Tạo phiếu chi
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{formData.id ? 'Sửa Phiếu Chi' : 'Tạo Phiếu Chi Mới'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400">Mã phiếu chi</label>
                                        <Input
                                            placeholder="Tự động nếu để trống"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="bg-zinc-900 border-zinc-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400">Số tiền (VND) <span className="text-rose-500">*</span></label>
                                        <Input
                                            type="number"
                                            placeholder="VD: 500000"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="bg-zinc-900 border-zinc-800 font-bold text-rose-400"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Tên khoản chi <span className="text-rose-500">*</span></label>
                                    <Input
                                        placeholder="VD: Chi trả tiền điện tháng 03"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Danh mục <span className="text-rose-500">*</span></label>
                                    <select
                                        className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-md text-sm outline-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Chọn danh mục...</option>
                                        {categories.map((c: any) => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                        <option value="new">+  Tạo danh mục mới</option>
                                    </select>
                                </div>

                                {formData.category === 'new' && (
                                    <div className="space-y-2 pl-4 border-l-2 border-rose-500">
                                        <label className="text-xs font-medium text-zinc-400">Tên Tên Danh mục Mới</label>
                                        <Input
                                            placeholder="VD: Chi trả nhà cung cấp, Điện nước..."
                                            value={formData.newCategoryName}
                                            onChange={(e) => setFormData({ ...formData, newCategoryName: e.target.value })}
                                            className="bg-zinc-900 border-zinc-800"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Ghi chú thêm</label>
                                    <Input
                                        placeholder="Mô tả nếu cần..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" className="border-zinc-800" onClick={() => setIsOpen(false)}>Hủy</Button>
                                <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleCreateExpense} disabled={!formData.title || !formData.amount || (!formData.category && !formData.newCategoryName)}>
                                    {formData.id ? 'Cập nhật' : 'Tạo phiếu chi'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="expenses" className="space-y-4">
                <TabsList className="bg-zinc-950 border border-zinc-800 p-1">
                    <TabsTrigger value="expenses" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-rose-400">
                        Phiếu chi
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-rose-400">
                        Danh mục chi phí
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="expenses" className="space-y-4 mt-0">
                    <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-900/50 text-zinc-400 text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-3 w-10">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-rose-500 cursor-pointer"
                                                checked={filteredData.length > 0 && selectedExpenses.length === filteredData.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedExpenses(filteredData.map(d => d.id));
                                                    else setSelectedExpenses([]);
                                                }}
                                            />
                                        </th>
                                        <th className="px-4 py-3 font-medium">M Mã Phiếu</th>
                                        <th className="px-4 py-3 font-medium">Tên khoản chi</th>
                                        <th className="px-4 py-3 font-medium">Danh mục</th>
                                        <th className="px-4 py-3 font-medium text-right">Số tiền (VND)</th>
                                        <th className="px-4 py-3 font-medium">Nhân viên chi</th>
                                        <th className="px-4 py-3 font-medium">Thời gian</th>
                                        <th className="px-4 py-3 font-medium">Ghi chú</th>
                                        <th className="px-4 py-3 font-medium text-right w-[100px]">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">Đang tải biểu dữ liệu...</td>
                                        </tr>
                                    ) : filteredData.length > 0 ? (
                                        filteredData.map(e => (
                                            <tr key={e.id} className="hover:bg-zinc-900/30 transition-colors group">
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-rose-500 cursor-pointer"
                                                        checked={selectedExpenses.includes(e.id)}
                                                        onChange={(event) => {
                                                            if (event.target.checked) {
                                                                setSelectedExpenses(prev => [...prev, e.id]);
                                                            } else {
                                                                setSelectedExpenses(prev => prev.filter(id => id !== e.id));
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-mono text-white text-xs bg-zinc-800 px-2 py-1 rounded inline-block">
                                                        {e.code || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-zinc-200">{e.title || 'Khoản chi không tên'}</td>
                                                <td className="px-4 py-3">
                                                    <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-xs font-medium border border-rose-500/20">
                                                        {e.category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-rose-500">
                                                    - {e.amount.toLocaleString('vi-VN')}
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    {e.createdBy?.name || 'Hệ thống'}
                                                </td>
                                                <td className="px-4 py-3 text-zinc-400 text-xs">
                                                    {format(new Date(e.date), 'dd/MM/yyyy HH:mm')}
                                                </td>
                                                <td className="px-4 py-3 text-xs max-w-[200px] truncate" title={e.description}>
                                                    {e.description || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer" onClick={() => handleEditExpense(e)}>
                                                                <FileEdit className="mr-2 h-4 w-4" />
                                                                <span>Chỉnh sửa</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-zinc-800" />
                                                            <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer" onClick={() => handleDeleteExpense(e.id)}>
                                                                <Trash className="mr-2 h-4 w-4" />
                                                                <span>Xóa</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">Chưa có khoản chi nào được ghi nhận.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4 mt-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-white flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-zinc-400" /> Cấu hình danh mục chi phí
                        </h2>
                        <div className="flex gap-2">
                            {selectedCategories.length > 0 && (
                                <Button className="bg-red-900/40 hover:bg-red-900/80 text-red-500 border border-red-900/30 whitespace-nowrap" onClick={handleBatchDeleteCategories}>
                                    <Trash className="w-4 h-4 mr-2" /> Xóa ({selectedCategories.length})
                                </Button>
                            )}
                            <Button className="bg-zinc-800 hover:bg-zinc-700 text-white" onClick={() => { setCategoryForm({ id: '', name: '' }); setIsCategoryOpen(true); }}>
                                <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
                            </Button>
                        </div>
                    </div>

                    <Card className="bg-zinc-950 border-zinc-800">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-900/50 text-zinc-400 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-rose-500 cursor-pointer"
                                            checked={categories.length > 0 && selectedCategories.length === categories.length}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedCategories(categories.map(c => c.id));
                                                else setSelectedCategories([]);
                                            }}
                                        />
                                    </th>
                                    <th className="px-4 py-3 font-medium">Tên danh mục</th>
                                    <th className="px-4 py-3 font-medium text-right">Phân loại hệ thống</th>
                                    <th className="px-4 py-3 font-medium text-right w-[100px]">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                                {categories.map(c => (
                                    <tr key={c.id} className="hover:bg-zinc-900/30">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-rose-500 cursor-pointer"
                                                checked={selectedCategories.includes(c.id)}
                                                onChange={(event) => {
                                                    if (event.target.checked) {
                                                        setSelectedCategories(prev => [...prev, c.id]);
                                                    } else {
                                                        setSelectedCategories(prev => prev.filter(id => id !== c.id));
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">Expense</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                    <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer" onClick={() => { setCategoryForm({ id: c.id, name: c.name }); setIsCategoryOpen(true); }}>
                                                        <FileEdit className="mr-2 h-4 w-4" />
                                                        <span>Chỉnh sửa</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                    <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer" onClick={() => handleDeleteCategory(c.id)}>
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        <span>Xóa</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">Chưa có cấu hình danh mục nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Category Dialog */}
            <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>{categoryForm.id ? 'Sửa' : 'Thêm'} Danh Mục Chi Phí</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Tên danh mục <span className="text-rose-500">*</span></label>
                            <Input
                                placeholder="VD: Lương nhân viên, Điện nước..."
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                className="bg-zinc-900 border-zinc-800"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-zinc-800" onClick={() => setIsCategoryOpen(false)}>Hủy</Button>
                        <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleSaveCategory} disabled={!categoryForm.name.trim()}>
                            Lưu ngay
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
