'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    CheckSquare,
    Zap,
    ClipboardList,
    Link2,
    Wallet,
    BarChart3,
    ConciergeBell,
    Bike,
    Hotel,
    Users,
    Globe,
    Settings,
    FileText,
    FileBadge,
    UserCircle,
    HelpCircle,
    ChevronDown,
    ChevronLeft,
    PanelLeftClose,
    PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SubItem {
    label: string;
    href: string;
}

interface MenuItem {
    label: string;
    icon: React.ElementType;
    href?: string;
    children?: SubItem[];
}

const menuItems: MenuItem[] = [
    {
        label: 'Bảng điều khiển',
        icon: LayoutDashboard,
        href: '/dashboard',
    },
    {
        label: 'Lịch',
        icon: Calendar,
        children: [
            { label: 'Lịch phòng', href: '/dashboard/calendar' },
            { label: 'Lịch dọn phòng', href: '/dashboard/calendar/housekeeping' },
            { label: 'Lịch tháng', href: '/dashboard/calendar/monthly' },
            { label: 'Khách lưu trú', href: '/dashboard/calendar/guests' },
            { label: 'Chia sẻ lịch', href: '/dashboard/calendar/share' },
        ],
    },
    {
        label: 'Đặt phòng',
        icon: ClipboardList,
        href: '/dashboard/bookings',
    },
    {
        label: 'Quản lý kênh',
        icon: Link2,
        children: [
            { label: 'Hạn chế', href: '/dashboard/channel-manager/restrictions' },
            { label: 'Kênh', href: '/dashboard/channel-manager/channels' },
            { label: 'Tin nhắn', href: '/dashboard/channel-manager/messages' },
            { label: 'Quy tắc phân bổ', href: '/dashboard/channel-manager/allocation' },
            { label: 'Đánh giá', href: '/dashboard/channel-manager/reviews' },
            { label: 'Giá linh hoạt', href: '/dashboard/channel-manager/dynamic-pricing' },
            { label: 'Lịch sử', href: '/dashboard/channel-manager/history' },
        ],
    },
    {
        label: 'Tài chính',
        icon: Wallet,
        children: [
            { label: 'Công nợ', href: '/dashboard/finance/receivables' },
            { label: 'Phiếu thu', href: '/dashboard/finance/receipts' },
            { label: 'Chi phí', href: '/dashboard/finance/expenses' },
            { label: 'Chi phí định kỳ', href: '/dashboard/finance/recurring' },
        ],
    },
    {
        label: 'Báo cáo',
        icon: BarChart3,
        children: [
            { label: 'Doanh thu', href: '/dashboard/reports/revenue' },
            { label: 'Vận hành', href: '/dashboard/reports/operations' },
            { label: 'Thanh toán', href: '/dashboard/reports/payments' },
            { label: 'Dịch vụ', href: '/dashboard/reports/services' },
            { label: 'Hiệu suất', href: '/dashboard/reports/performance' },
            { label: 'Báo cáo tháng', href: '/dashboard/reports/monthly' },
        ],
    },
    {
        label: 'Dịch vụ',
        icon: ConciergeBell,
        href: '/dashboard/services',
    },
    {
        label: 'Thuê xe',
        icon: Bike,
        href: '/dashboard/rentals',
    },
    {
        label: 'Quản lý phòng',
        icon: Hotel,
        href: '/dashboard/rooms',
    },
    {
        label: 'Khách hàng',
        icon: Users,
        href: '/dashboard/customers',
    },
    {
        label: 'Website',
        icon: Globe,
        href: '/dashboard/website',
    },
    {
        label: 'Cài đặt',
        icon: Settings,
        children: [
            { label: 'Chung', href: '/dashboard/settings' },
            { label: 'Thông tin', href: '/dashboard/settings/info' },
            { label: 'Người dùng', href: '/dashboard/settings/users' },
            { label: 'Phân quyền', href: '/dashboard/settings/permissions' },
            { label: 'Quản lý nhãn', href: '/dashboard/settings/labels' },
            { label: 'Phân loại', href: '/dashboard/settings/categories' },
            { label: 'Nguồn', href: '/dashboard/settings/sources' },
            { label: 'PT Thanh toán', href: '/dashboard/settings/payment-methods' },
            { label: 'TK Ngân hàng', href: '/dashboard/settings/bank-accounts' },
            { label: 'Mẫu in ấn', href: '/dashboard/settings/templates' },
        ],
    },
    {
        label: 'Hóa đơn',
        icon: FileText,
        href: '/dashboard/invoices',
    },
    {
        label: 'Hóa đơn điện tử',
        icon: FileBadge,
        href: '/dashboard/e-invoices',
    },
    {
        label: 'Tài khoản',
        icon: UserCircle,
        href: '/dashboard/account',
    },
    {
        label: 'Trợ giúp',
        icon: HelpCircle,
        href: '/dashboard/help',
    },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    const toggleGroup = (label: string) => {
        setExpandedGroups((prev) =>
            prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
        );
    };

    const isActive = (href?: string) => {
        if (!href) return false;
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    const isGroupActive = (item: MenuItem) => {
        return item.children?.some((child) => pathname.startsWith(child.href));
    };

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen border-r border-zinc-800 bg-zinc-950 transition-all duration-300 flex flex-col',
                collapsed ? 'w-[68px]' : 'w-[260px]'
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
                {!collapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
                            <span className="text-sm font-bold text-white">HT</span>
                        </div>
                        <span className="text-lg font-semibold text-white">HTsys</span>
                    </Link>
                )}
                <button
                    onClick={onToggle}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
                </button>
            </div>

            {/* Menu */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 py-4 pb-24">
                <nav className="flex flex-col gap-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const hasChildren = !!item.children;
                        const active = hasChildren ? isGroupActive(item) : isActive(item.href);
                        const expanded = expandedGroups.includes(item.label) || (hasChildren && active);

                        if (collapsed) {
                            return (
                                <Tooltip key={item.label} delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        {hasChildren ? (
                                            <button
                                                className={cn(
                                                    'flex h-10 w-10 items-center justify-center rounded-lg mx-auto transition-colors',
                                                    active
                                                        ? 'bg-blue-600/20 text-blue-400'
                                                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                                )}
                                            >
                                                <Icon size={20} />
                                            </button>
                                        ) : (
                                            <Link
                                                href={item.href!}
                                                className={cn(
                                                    'flex h-10 w-10 items-center justify-center rounded-lg mx-auto transition-colors',
                                                    active
                                                        ? 'bg-blue-600/20 text-blue-400'
                                                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                                )}
                                            >
                                                <Icon size={20} />
                                            </Link>
                                        )}
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="bg-zinc-800 text-white border-zinc-700">
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return (
                            <div key={item.label}>
                                {hasChildren ? (
                                    <button
                                        onClick={() => toggleGroup(item.label)}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                            active
                                                ? 'bg-blue-600/10 text-blue-400'
                                                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                                        )}
                                    >
                                        <Icon size={20} />
                                        <span className="flex-1 text-left">{item.label}</span>
                                        <ChevronDown
                                            size={16}
                                            className={cn(
                                                'transition-transform duration-200',
                                                expanded ? 'rotate-180' : ''
                                            )}
                                        />
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href!}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                            active
                                                ? 'bg-blue-600/10 text-blue-400'
                                                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                                        )}
                                    >
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                    </Link>
                                )}

                                {/* Sub-items */}
                                {hasChildren && expanded && (
                                    <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l border-zinc-800 pl-4">
                                        {item.children!.map((child) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={cn(
                                                    'rounded-md px-3 py-2 text-sm transition-colors',
                                                    pathname === child.href
                                                        ? 'bg-blue-600/10 text-blue-400 font-medium'
                                                        : 'text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300'
                                                )}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Footer */}
            {!collapsed && (
                <div className="border-t border-zinc-800 px-4 py-3">
                    <p className="text-xs text-zinc-600">HTsys PMS v1.0</p>
                </div>
            )}
        </aside>
    );
}
