'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Users, Building, Search, Star, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';

const MOCK_ROOMS = [
    {
        id: 'R-001',
        name: 'Deluxe Ocean View',
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
        price: 1500000,
        originalPrice: 2000000,
        capacity: '2 Người lớn • 1 Trẻ em',
        size: '35m²',
        bed: '1 Giường King',
        amenities: ['Ban công hướng biển', 'Bồn tắm', 'Minibar miễn phí', 'WIFI tốc độ cao'],
        available: 3
    },
    {
        id: 'R-002',
        name: 'Premium Suite Dlx',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
        price: 2800000,
        originalPrice: null,
        capacity: '3 Người lớn • 1 Trẻ em',
        size: '55m²',
        bed: '1 King + 1 Đơn',
        amenities: ['Phòng khách riêng', 'Ban công lớn', 'Máy pha cà phê', 'WIFI tốc độ cao'],
        available: 1
    },
    {
        id: 'R-003',
        name: 'Standard Queen',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
        price: 850000,
        originalPrice: 1000000,
        capacity: '2 Người lớn',
        size: '25m²',
        bed: '1 Giường Queen',
        amenities: ['Cửa sổ thành phố', 'Vòi sen', 'WIFI tốc độ cao'],
        available: 5
    }
];

export default function BookingEngine() {
    const [date, setDate] = useState<{ from: Date; to: Date | undefined }>({
        from: new Date(),
        to: addDays(new Date(), 2),
    });
    const [isSearching, setIsSearching] = useState(false);
    const [guests, setGuests] = useState({ adults: 2, children: 0 });

    const handleSearch = () => {
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 800); // simulate API call
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            {/* Navbar */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            GoHost Hotel
                        </span>
                    </div>
                    <nav className="hidden md:flex flex-1 justify-center space-x-8 text-sm font-medium text-zinc-600">
                        <a href="#" className="hover:text-blue-600 transition-colors">Trang chủ</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Loại phòng</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Dịch vụ</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Liên hệ</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="hidden sm:flex" asChild>
                            <a href="/dashboard">Cổng Nhân Viên</a>
                        </Button>
                        <select className="bg-transparent text-sm font-medium text-zinc-600 cursor-pointer outline-none">
                            <option value="vi">VND</option>
                            <option value="en">USD</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1542314831-c6a4d14b8fc4?w=1920&q=80"
                        alt="Luxury Hotel"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-md">
                        Nghỉ Dưỡng Đẳng Cấp
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-100 mb-12 max-w-2xl mx-auto drop-shadow">
                        Trải nghiệm không gian sang trọng, dịch vụ hoàn hảo và những khoảnh khắc khó quên tại GoHost Hotel.
                    </p>

                    {/* Search Bar */}
                    <div className="bg-white p-3 md:p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3">
                        {/* Date Picker */}
                        <div className="flex-1">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full h-14 justify-start text-left font-normal bg-zinc-50 border-zinc-200 hover:bg-zinc-100 rounded-xl px-4">
                                        <CalendarIcon className="mr-3 h-5 w-5 text-zinc-500" />
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider leading-none">Ngày Nhận - Trả</span>
                                            <span className="text-zinc-900 leading-none">
                                                {date?.from ? (
                                                    date.to ? (
                                                        <>{format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}</>
                                                    ) : (
                                                        format(date.from, "dd/MM/yyyy")
                                                    )
                                                ) : (
                                                    <span>Chọn ngày</span>
                                                )}
                                            </span>
                                        </div>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date as any}
                                        onSelect={setDate as any}
                                        numberOfMonths={2}
                                        locale={vi}
                                        disabled={(day) => day < new Date(new Date().setHours(0, 0, 0, 0))}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Guests Picker (Mock dropdown) */}
                        <div className="flex-1 md:max-w-[280px]">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full h-14 justify-start text-left font-normal bg-zinc-50 border-zinc-200 hover:bg-zinc-100 rounded-xl px-4">
                                        <Users className="mr-3 h-5 w-5 text-zinc-500" />
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider leading-none">Số lượng khách</span>
                                            <span className="text-zinc-900 leading-none">
                                                {guests.adults} Người lớn, {guests.children} Trẻ em
                                            </span>
                                        </div>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Người lớn</span>
                                            <div className="flex gap-3 items-center">
                                                <Button variant="outline" size="icon" onClick={() => setGuests(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}>-</Button>
                                                <span>{guests.adults}</span>
                                                <Button variant="outline" size="icon" onClick={() => setGuests(prev => ({ ...prev, adults: prev.adults + 1 }))}>+</Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Trẻ em</span>
                                            <div className="flex gap-3 items-center">
                                                <Button variant="outline" size="icon" onClick={() => setGuests(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}>-</Button>
                                                <span>{guests.children}</span>
                                                <Button variant="outline" size="icon" onClick={() => setGuests(prev => ({ ...prev, children: prev.children + 1 }))}>+</Button>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Search Button */}
                        <Button
                            className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-semibold shadow-lg shadow-blue-600/20"
                            onClick={handleSearch}
                            disabled={isSearching}
                        >
                            {isSearching ? 'Đang tìm...' : 'TÌM PHÒNG'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Room Results Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-zinc-900">
                        {isSearching ? 'Đang tìm phòng trống...' : 'Phòng trống hôm nay'}
                    </h2>
                    <p className="text-zinc-500 md:block hidden">
                        Hiển thị giá cho {guests.adults} Người lớn, {date.to ? Math.round((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24)) : 1} đêm
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_ROOMS.map(room => (
                        <Card key={room.id} className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group rounded-2xl">
                            {/* Image */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={room.image}
                                    alt={room.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                {room.originalPrice && (
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 text-xs">Phòng Xả Kho</Badge>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 text-white">
                                    <h3 className="text-2xl font-bold">{room.name}</h3>
                                    <p className="text-sm opacity-90 flex items-center gap-2 mt-1">
                                        <span>{room.size}</span> • <span>{room.bed}</span>
                                    </p>
                                </div>
                            </div>

                            <CardContent className="p-6 bg-white">
                                {/* Amenities */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {room.amenities.slice(0, 3).map(am => (
                                        <span key={am} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-100 text-zinc-600 text-xs font-medium">
                                            <Check className="h-3 w-3 text-emerald-500" /> {am}
                                        </span>
                                    ))}
                                    {room.amenities.length > 3 && (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded bg-zinc-100 text-zinc-500 text-xs font-medium">
                                            +{room.amenities.length - 3} nữa
                                        </span>
                                    )}
                                </div>

                                {/* Price & Action */}
                                <div className="flex items-end justify-between mt-auto">
                                    <div>
                                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Giá mỗi đêm từ</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-zinc-900">
                                                {room.price.toLocaleString('vi-VN')}₫
                                            </span>
                                            {room.originalPrice && (
                                                <span className="text-sm text-zinc-400 line-through">
                                                    {room.originalPrice.toLocaleString('vi-VN')}₫
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-rose-500 mt-1 font-medium">Chỉ còn {room.available} phòng</p>
                                    </div>
                                    <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-6 group">
                                        Chọn phòng
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-zinc-900 text-zinc-400 py-12 mt-12 border-t border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <Building className="h-6 w-6 text-zinc-500" />
                        <span className="text-xl font-bold text-zinc-100">GoHost Hotel</span>
                    </div>
                    <p className="text-sm">© 2026 GoHost Clone. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
