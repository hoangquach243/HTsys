'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { RoomTable } from '@/components/rooms/room-table';
import { RoomTypeTable } from '@/components/rooms/room-type-table';

export default function RoomsPage() {
    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Quản lý Phòng</h2>
                    <p className="text-zinc-400 mt-1">
                        Quản lý danh sách phòng và loại phòng.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="room-types" className="w-full">
                <TabsList className="bg-zinc-900 border-zinc-800 p-1 rounded-lg">
                    <TabsTrigger value="room-types" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Loại phòng</TabsTrigger>
                    <TabsTrigger value="room-list" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Danh sách phòng</TabsTrigger>
                </TabsList>

                {/* LOẠI PHÒNG (CRUD) */}
                <TabsContent value="room-types" className="mt-6">
                    <RoomTypeTable />
                </TabsContent>

                {/* DANH SÁCH PHÒNG (CRUD) */}
                <TabsContent value="room-list" className="mt-6">
                    <RoomTable />
                </TabsContent>

            </Tabs>
        </div>
    );
}
