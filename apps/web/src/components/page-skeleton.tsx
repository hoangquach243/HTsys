'use client';
import { Card, CardContent } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

interface PageSkeletonProps {
    title: string;
    description: string;
    icon: LucideIcon;
}

export function PageSkeleton({ title, description, icon: Icon }: PageSkeletonProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                <p className="text-sm text-zinc-500 mt-1">{description}</p>
            </div>
            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 mb-4">
                            <Icon size={32} className="text-zinc-500" />
                        </div>
                        <p className="text-zinc-400 text-sm">Module này sẽ được hiện thực trong các phase tiếp theo</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
