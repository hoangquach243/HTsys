'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <TooltipProvider delayDuration={0}>
            <div className="min-h-screen bg-zinc-950 text-white">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
                <div
                    className={cn(
                        'transition-all duration-300',
                        sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'
                    )}
                >
                    <Header />
                    <main className="p-6">{children}</main>
                </div>
            </div>
        </TooltipProvider>
    );
}
