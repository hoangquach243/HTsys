'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const settingsNav = [
    { label: 'Chung', href: '/dashboard/settings' },
    { label: 'Thông tin', href: '/dashboard/settings/info' },
    { label: 'Người dùng', href: '/dashboard/settings/users' },
    { label: 'Phân quyền', href: '/dashboard/settings/permissions' },
    { label: 'Quản lý nhãn', href: '/dashboard/settings/labels' },
    { label: 'Phân loại', href: '/dashboard/settings/categories' },
    { label: 'Nguồn', href: '/dashboard/settings/sources' },
    { label: 'PT Thanh toán', href: '/dashboard/settings/payment-methods' },
    { label: 'TK Ngân hàng', href: '/dashboard/settings/bank-accounts' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Cài đặt</h1>
            <div className="flex gap-6">
                {/* Settings Sidebar */}
                <nav className="w-56 shrink-0">
                    <div className="flex flex-col gap-1">
                        {settingsNav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'rounded-lg px-4 py-2.5 text-sm transition-colors',
                                    pathname === item.href
                                        ? 'bg-blue-600/10 text-blue-400 font-medium'
                                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Settings Content */}
                <div className="flex-1 min-w-0">{children}</div>
            </div>
        </div>
    );
}
