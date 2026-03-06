'use client';

import React from 'react';
import { Bell, Search, Globe, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function Header() {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl px-6">
            <div className="flex-1"></div>
        </header>
    );

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl px-6">
            {/* Search */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm đặt phòng, khách hàng..."
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
                {/* Language */}
                <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                    <Globe size={16} />
                    <span>VI</span>
                </button>

                {/* Notifications */}
                <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                    <Bell size={18} />
                    <Badge className="absolute -right-0.5 -top-0.5 h-5 min-w-5 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white border-2 border-zinc-950">
                        3
                    </Badge>
                </button>

                {/* User */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-800 transition-colors">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xs font-semibold">
                                    AD
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-medium text-white">Admin</span>
                                <span className="text-xs text-zinc-500">HT House</span>
                            </div>
                            <ChevronDown size={14} className="text-zinc-500 hidden md:block" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-48 bg-zinc-900 border-zinc-800 text-zinc-300"
                    >
                        <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer">
                            Tài khoản
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer">
                            Cài đặt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer text-red-400">
                            Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
