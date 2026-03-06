'use client';
import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, MapPin, Phone, Mail, Star, ChevronDown, Menu, X, CheckCircle, Clock, Wifi, Car, Coffee, Dumbbell, Waves, Utensils } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SLUG = process.env.NEXT_PUBLIC_HOTEL_SLUG || 'my-hotel';

const AMENITY_ICONS: Record<string, any> = {
  'Wifi miễn phí': Wifi,
  'Bãi đỗ xe': Car,
  'Bữa sáng': Coffee,
  'Gym': Dumbbell,
  'Hồ bơi': Waves,
  'Nhà hàng': Utensils,
};

export default function HomePage() {
  const [config, setConfig] = useState<any>(null);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Booking form state
  const [checkIn, setCheckIn] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [availability, setAvailability] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // Booking modal state
  const [bookingRoom, setBookingRoom] = useState<any>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cfgRes, roomsRes] = await Promise.all([
          fetch(`${API_URL}/api/public/${SLUG}`, { cache: 'no-store' }),
          fetch(`${API_URL}/api/public/${SLUG}/rooms`, { cache: 'no-store' }),
        ]);
        if (cfgRes.ok) setConfig(await cfgRes.json());
        if (roomsRes.ok) setRoomTypes(await roomsRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const searchAvailability = async () => {
    setSearching(true);
    setSearched(false);
    try {
      const res = await fetch(`${API_URL}/api/public/${SLUG}/availability?checkIn=${checkIn}&checkOut=${checkOut}`, { cache: 'no-store' });
      if (res.ok) {
        setAvailability(await res.json());
        setSearched(true);
        document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const submitBooking = async () => {
    if (!guestName || !guestPhone || !bookingRoom) return;
    setBooking(true);
    try {
      const res = await fetch(`${API_URL}/api/public/${SLUG}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName, guestPhone, guestEmail, notes,
          roomTypeId: bookingRoom.id,
          checkIn, checkOut,
        }),
      });
      if (res.ok) {
        setBookingResult(await res.json());
        setBookingRoom(null);
      } else {
        alert('Đặt phòng thất bại. Vui lòng thử lại.');
      }
    } catch (e) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setBooking(false);
    }
  };

  const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)));

  const primaryColor = config?.primaryColor || '#2563eb';
  const accentColor = config?.accentColor || '#10b981';
  const hotelName = config?.hotelName || config?.property?.name || 'Khách sạn của chúng tôi';
  const tagline = config?.tagline || 'Nơi nghỉ ngơi lý tưởng cho bạn';
  const description = config?.description || 'Chào mừng bạn đến với không gian nghỉ dưỡng tuyệt vời của chúng tôi.';
  let amenities: string[] = ['Wifi miễn phí', 'Bãi đỗ xe', 'Bữa sáng', 'Gym'];
  if (config?.amenities) {
    try {
      amenities = typeof config.amenities === 'string' ? JSON.parse(config.amenities) : config.amenities;
    } catch (e) { }
  }
  let promotions: any[] = [];
  if (config?.promotions) {
    try {
      promotions = typeof config.promotions === 'string' ? JSON.parse(config.promotions) : config.promotions;
    } catch (e) { }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <span className="text-xl font-bold" style={{ color: primaryColor }}>{hotelName}</span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#hero" className="hover:text-gray-900 transition-colors">Trang chủ</a>
            <a href="#rooms" className="hover:text-gray-900 transition-colors">Phòng</a>
            <a href="#amenities" className="hover:text-gray-900 transition-colors">Tiện ích</a>
            {promotions.length > 0 && <a href="#promotions" className="hover:text-gray-900 transition-colors">Ưu đãi</a>}
            <a href="#contact" className="hover:text-gray-900 transition-colors">Liên hệ</a>
          </div>
          <a href="#booking" className="hidden md:block px-5 py-2 rounded-full text-white text-sm font-semibold transition-all hover:opacity-90 shadow" style={{ background: primaryColor }}>
            Đặt phòng ngay
          </a>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 text-sm font-medium text-gray-700">
            {['Trang chủ', 'Phòng', 'Tiện ích', 'Liên hệ'].map(item => (
              <a key={item} href={`#${item === 'Trang chủ' ? 'hero' : item === 'Phòng' ? 'rooms' : item === 'Tiện ích' ? 'amenities' : 'contact'}`}
                className="block hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>{item}</a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{
          background: config?.bannerUrl
            ? `url(${config.bannerUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
        }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-xl">{hotelName}</h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8 font-light">{tagline}</p>
          <a href="#booking" className="inline-block px-10 py-4 rounded-full text-white font-bold text-lg shadow-xl transition-all hover:scale-105"
            style={{ background: accentColor }}>
            Đặt phòng ngay
          </a>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/60">
          <ChevronDown className="w-8 h-8" />
        </div>
      </section>

      {/* SEARCH / BOOKING BAR */}
      <section id="booking" className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Kiểm tra phòng trống</h2>
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Nhận phòng</label>
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 font-medium"
                style={{ '--tw-ring-color': primaryColor } as any} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Trả phòng</label>
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 font-medium"
                style={{ '--tw-ring-color': primaryColor } as any} />
            </div>
            <button onClick={searchAvailability} disabled={searching}
              className="px-8 py-3 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 disabled:opacity-60 shrink-0 shadow"
              style={{ background: primaryColor }}>
              {searching ? 'Đang tìm...' : 'Tìm phòng'}
            </button>
          </div>
          {searched && (
            <p className="text-center text-sm text-gray-500 mt-3">
              Hiển thị phòng trống từ <strong>{format(new Date(checkIn), 'dd/MM/yyyy')}</strong> đến <strong>{format(new Date(checkOut), 'dd/MM/yyyy')}</strong> ({nights} đêm)
            </p>
          )}
        </div>
      </section>

      {/* ROOMS */}
      <section id="rooms" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Danh sách phòng</h2>
          <p className="text-center text-gray-500 mb-12">Chọn loại phòng phù hợp với nhu cầu của bạn</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(searched ? availability : roomTypes).map((rt: any) => {
              const price = rt.ratePlans?.[0]?.basePrice ?? rt.basePrice ?? 0;
              const isAvail = !searched || (rt.availableCount ?? 1) > 0;
              // Extract photos from rooms belonging to this room type
              const allRoomPhotos = rt.rooms?.flatMap((r: any) => r.photos || []) || [];
              const photos = allRoomPhotos.length > 0 ? [allRoomPhotos[0]] : [];

              return (
                <div key={rt.id} className={`rounded-2xl border overflow-hidden shadow-md hover:shadow-xl transition-all bg-white group ${!isAvail ? 'opacity-60 grayscale-[30%]' : ''}`}>
                  <div className="h-56 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryColor}22, ${accentColor}33)` }}>
                    {photos.length > 0 ? (
                      <img src={photos[0]} alt={rt.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                        <span className="text-6xl drop-shadow-md">🛏️</span>
                      </div>
                    )}

                    {searched && (
                      <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm ${isAvail ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
                        {isAvail ? `Còn ${rt.availableCount} phòng` : 'Hết phòng'}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{rt.name}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{rt.description || 'Phòng tiện nghi, thoải mái với đầy đủ tiện ích.'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>👤 {rt.maxAdults} người lớn</span>
                      {rt.maxChildren > 0 && <span>👧 {rt.maxChildren} trẻ em</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-extrabold" style={{ color: primaryColor }}>
                          {Number(price).toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-xs text-gray-400 ml-1">/đêm</span>
                      </div>
                      {isAvail ? (
                        <button onClick={() => setBookingRoom(rt)}
                          className="px-4 py-2 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
                          style={{ background: accentColor }}>
                          Đặt ngay
                        </button>
                      ) : (
                        <span className="px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-sm font-semibold">Hết phòng</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Về chúng tôi</h2>
          <p className="text-gray-600 text-lg leading-relaxed">{description}</p>
        </div>
      </section>

      {/* AMENITIES */}
      <section id="amenities" className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Tiện ích khách sạn</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {amenities.map((amenity: string) => {
              const Icon = AMENITY_ICONS[amenity] || CheckCircle;
              return (
                <div key={amenity} className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ background: `${primaryColor}15` }}>
                    <Icon className="w-7 h-7" style={{ color: primaryColor }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 text-center">{amenity}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROMOTIONS */}
      {promotions.length > 0 && (
        <section id="promotions" className="py-16 px-4" style={{ background: `${primaryColor}08` }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Ưu đãi đặc biệt</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promotions.map((promo: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md border-l-4" style={{ borderColor: accentColor }}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">{promo.title}</h3>
                    {promo.discount && (
                      <span className="px-3 py-1 rounded-full text-white text-sm font-bold" style={{ background: accentColor }}>
                        -{promo.discount}%
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{promo.description}</p>
                  {promo.validUntil && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>Đến hết {format(new Date(promo.validUntil), 'dd/MM/yyyy')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Liên hệ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {config?.phone && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600">
                  <Phone className="w-5 h-5" />
                </div>
                <p className="text-gray-300">{config.phone}</p>
              </div>
            )}
            {config?.email && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600">
                  <Mail className="w-5 h-5" />
                </div>
                <p className="text-gray-300">{config.email}</p>
              </div>
            )}
            {config?.address && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="text-gray-300">{config.address}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-gray-500 py-6 text-center text-sm">
        <p>© {new Date().getFullYear()} {hotelName}. All rights reserved.</p>
      </footer>

      {/* BOOKING MODAL */}
      {bookingRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setBookingRoom(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Thông tin đặt phòng</h3>
              <button onClick={() => setBookingRoom(null)} className="text-gray-400 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
              <p><strong>Phòng:</strong> {bookingRoom.name}</p>
              <p><strong>Nhận phòng:</strong> {format(new Date(checkIn), 'dd/MM/yyyy')}</p>
              <p><strong>Trả phòng:</strong> {format(new Date(checkOut), 'dd/MM/yyyy')} ({nights} đêm)</p>
              <p className="text-lg font-bold mt-2" style={{ color: primaryColor }}>
                Tổng: {((bookingRoom.ratePlans?.[0]?.basePrice ?? bookingRoom.basePrice ?? 0) * nights).toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Họ và tên *" value={guestName} onChange={e => setGuestName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none text-gray-800" />
              <input type="tel" placeholder="Số điện thoại *" value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none text-gray-800" />
              <input type="email" placeholder="Email (tuỳ chọn)" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none text-gray-800" />
              <textarea placeholder="Ghi chú (tuỳ chọn)" value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none text-gray-800 resize-none" />
            </div>
            <button onClick={submitBooking} disabled={booking || !guestName || !guestPhone}
              className="w-full py-3 rounded-xl text-white font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: primaryColor }}>
              {booking ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
            </button>
          </div>
        </div>
      )}

      {/* BOOKING SUCCESS MODAL */}
      {bookingResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Đặt phòng thành công!</h3>
            <p className="text-gray-500 text-sm">Mã đặt phòng của bạn là:</p>
            <div className="bg-gray-50 border rounded-xl py-4">
              <p className="text-2xl font-extrabold text-blue-600">{bookingResult.bookingCode}</p>
            </div>
            <p className="text-sm text-gray-500">Chúng tôi sẽ liên hệ với bạn để xác nhận. Cảm ơn bạn đã đặt phòng!</p>
            <button onClick={() => setBookingResult(null)}
              className="w-full py-3 rounded-xl text-white font-bold"
              style={{ background: primaryColor }}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
