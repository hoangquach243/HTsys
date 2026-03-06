'use client';
import { useState, useEffect } from 'react';
import { Globe, Save, Eye, EyeOff, Plus, Trash2, ExternalLink, Settings, Image, Tag, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API_URL = 'http://localhost:3001';
const PROPERTY_ID = 'clouq2m1q00003b6w5z8s6xy9';

const defaultConfig = {
    slug: 'my-hotel',
    isPublished: false,
    hotelName: '',
    tagline: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    logoUrl: '',
    bannerUrl: '',
    primaryColor: '#2563eb',
    accentColor: '#10b981',
    amenities: ['Wifi miễn phí', 'Bãi đỗ xe', 'Bữa sáng'],
    promotions: [] as any[],
    googleMapsUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    metaTitle: '',
    metaDescription: '',
};

export default function WebsitePage() {
    const [config, setConfig] = useState(defaultConfig);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newAmenity, setNewAmenity] = useState('');
    const [newPromo, setNewPromo] = useState({ title: '', description: '', discount: '', validUntil: '' });

    useEffect(() => {
        fetch(`${API_URL}/api/website/config/${PROPERTY_ID}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    setConfig({
                        ...defaultConfig,
                        ...data,
                        amenities: Array.isArray(data.amenities) ? data.amenities : defaultConfig.amenities,
                        promotions: Array.isArray(data.promotions) ? data.promotions : defaultConfig.promotions
                    });
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await fetch(`${API_URL}/api/website/config/${PROPERTY_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            alert('Đã lưu cấu hình website thành công!');
        } catch {
            alert('Lỗi khi lưu cấu hình.');
        } finally {
            setSaving(false);
        }
    };

    const togglePublish = async () => {
        const updated = { ...config, isPublished: !config.isPublished };
        setConfig(updated);
        setSaving(true);
        try {
            await fetch(`${API_URL}/api/website/config/${PROPERTY_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-zinc-400">Đang tải cấu hình...</div>
            </div>
        );
    }

    const clientUrl = `http://localhost:3002`;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Globe className="w-6 h-6 text-blue-500" />
                        Quản lý Website Đặt phòng
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm">Cấu hình giao diện và nội dung trang clientpage của khách sạn</p>
                </div>
                <div className="flex items-center gap-3">
                    <a href={clientUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2">
                            <ExternalLink className="w-4 h-4" /> Xem website
                        </Button>
                    </a>
                    <Button
                        variant="outline"
                        onClick={togglePublish}
                        className={config.isPublished
                            ? 'bg-green-900/30 border-green-700 text-green-400 hover:bg-green-900/50 gap-2'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 gap-2'}
                    >
                        {config.isPublished ? <><Eye className="w-4 h-4" /> Đang công khai</> : <><EyeOff className="w-4 h-4" /> Chưa đăng</>}
                    </Button>
                    <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Save className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </div>
            </div>

            {/* Status Banner */}
            <div className={`rounded-xl p-4 border ${config.isPublished ? 'bg-green-900/20 border-green-800' : 'bg-yellow-900/20 border-yellow-800'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${config.isPublished ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                    <div>
                        <p className={`font-semibold text-sm ${config.isPublished ? 'text-green-400' : 'text-yellow-400'}`}>
                            {config.isPublished ? 'Website đang hoạt động' : 'Website chưa được đăng'}
                        </p>
                        <p className="text-zinc-500 text-xs">
                            {config.isPublished
                                ? `URL công khai: ${clientUrl} — Slug: /${config.slug}`
                                : 'Nhấn "Đang công khai" để website có thể được truy cập bởi khách hàng'}
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="info" className="space-y-4">
                <TabsList className="bg-zinc-900 border border-zinc-800">
                    <TabsTrigger value="info" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white gap-2">
                        <Info className="w-4 h-4" /> Thông tin
                    </TabsTrigger>
                    <TabsTrigger value="design" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white gap-2">
                        <Image className="w-4 h-4" /> Giao diện
                    </TabsTrigger>
                    <TabsTrigger value="promotions" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white gap-2">
                        <Tag className="w-4 h-4" /> Ưu đãi
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white gap-2">
                        <Settings className="w-4 h-4" /> SEO & Mạng xã hội
                    </TabsTrigger>
                </TabsList>

                {/* INFO TAB */}
                <TabsContent value="info">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="bg-zinc-950 border-zinc-800">
                            <CardHeader><CardTitle className="text-white text-base">Thông tin cơ bản</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Field label="Slug URL (dùng cho đường dẫn)" value={config.slug}
                                    onChange={v => setConfig({ ...config, slug: v.toLowerCase().replace(/\s+/g, '-') })}
                                    hint={`Website sẽ dùng slug: "${config.slug}"`} />
                                <Field label="Tên khách sạn" value={config.hotelName} onChange={v => setConfig({ ...config, hotelName: v })} />
                                <Field label="Khẩu hiệu (tagline)" value={config.tagline} onChange={v => setConfig({ ...config, tagline: v })} />
                                <Field label="Mô tả chi tiết" value={config.description} onChange={v => setConfig({ ...config, description: v })} multiline />
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-950 border-zinc-800">
                            <CardHeader><CardTitle className="text-white text-base">Liên hệ</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Field label="Địa chỉ" value={config.address} onChange={v => setConfig({ ...config, address: v })} />
                                <Field label="Số điện thoại" value={config.phone} onChange={v => setConfig({ ...config, phone: v })} />
                                <Field label="Email" value={config.email} onChange={v => setConfig({ ...config, email: v })} />
                                <Field label="Google Maps URL" value={config.googleMapsUrl} onChange={v => setConfig({ ...config, googleMapsUrl: v })} />
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-950 border-zinc-800 lg:col-span-2">
                            <CardHeader><CardTitle className="text-white text-base">Tiện ích</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(config.amenities || []).map((a, i) => (
                                        <span key={i} className="flex items-center gap-1 bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full text-sm">
                                            {a}
                                            <button onClick={() => setConfig({ ...config, amenities: (config.amenities || []).filter((_, idx) => idx !== i) })}
                                                className="text-zinc-500 hover:text-red-400 ml-1">×</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input value={newAmenity} onChange={e => setNewAmenity(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && newAmenity && (setConfig({ ...config, amenities: [...(config.amenities || []), newAmenity] }), setNewAmenity(''))}
                                        placeholder="Thêm tiện ích..." className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                                    <Button size="sm" variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-300" onClick={() => {
                                        if (newAmenity) { setConfig({ ...config, amenities: [...(config.amenities || []), newAmenity] }); setNewAmenity(''); }
                                    }}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* DESIGN TAB */}
                <TabsContent value="design">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="bg-zinc-950 border-zinc-800">
                            <CardHeader><CardTitle className="text-white text-base">Màu sắc</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-zinc-400 text-sm mb-2 block">Màu chủ đạo</label>
                                    <div className="flex items-center gap-3">
                                        <input type="color" value={config.primaryColor} onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                                            className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent" />
                                        <span className="text-zinc-300 font-mono text-sm">{config.primaryColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-zinc-400 text-sm mb-2 block">Màu nhấn</label>
                                    <div className="flex items-center gap-3">
                                        <input type="color" value={config.accentColor} onChange={e => setConfig({ ...config, accentColor: e.target.value })}
                                            className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent" />
                                        <span className="text-zinc-300 font-mono text-sm">{config.accentColor}</span>
                                    </div>
                                </div>
                                {/* Preview */}
                                <div className="rounded-xl p-4 space-y-2" style={{ background: config.primaryColor + '15' }}>
                                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Xem trước màu sắc</p>
                                    <button className="px-4 py-2 rounded-lg text-white text-sm font-semibold mr-2" style={{ background: config.primaryColor }}>
                                        Nút chính
                                    </button>
                                    <button className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: config.accentColor }}>
                                        Nút phụ
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-950 border-zinc-800">
                            <CardHeader><CardTitle className="text-white text-base">Hình ảnh</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Field label="URL Logo" value={config.logoUrl} onChange={v => setConfig({ ...config, logoUrl: v })} hint="Nhập URL hình ảnh logo" />
                                <Field label="URL Banner / Ảnh bìa" value={config.bannerUrl} onChange={v => setConfig({ ...config, bannerUrl: v })} hint="Ảnh nền trang hero (~1920x1080px)" />
                                {config.bannerUrl && (
                                    <div className="rounded-xl overflow-hidden h-32">
                                        <img src={config.bannerUrl} alt="Banner preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* PROMOTIONS TAB */}
                <TabsContent value="promotions">
                    <Card className="bg-zinc-950 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-white text-base">Ưu đãi & Khuyến mãi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Add promo form */}
                            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 space-y-3">
                                <p className="text-zinc-400 text-sm font-semibold">Thêm ưu đãi mới</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <input placeholder="Tên ưu đãi *" value={newPromo.title} onChange={e => setNewPromo({ ...newPromo, title: e.target.value })}
                                        className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                                    <textarea placeholder="Mô tả ưu đãi" value={newPromo.description} onChange={e => setNewPromo({ ...newPromo, description: e.target.value })} rows={2}
                                        className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none resize-none" />
                                    <div>
                                        <label className="text-zinc-500 text-xs mb-1 block">Giảm giá (%)</label>
                                        <input type="number" placeholder="Ví dụ: 20" value={newPromo.discount} onChange={e => setNewPromo({ ...newPromo, discount: e.target.value })}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-zinc-500 text-xs mb-1 block">Hạn sử dụng</label>
                                        <input type="date" value={newPromo.validUntil} onChange={e => setNewPromo({ ...newPromo, validUntil: e.target.value })}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                                    </div>
                                </div>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={() => {
                                    if (!newPromo.title) return;
                                    setConfig({ ...config, promotions: [...config.promotions, newPromo] });
                                    setNewPromo({ title: '', description: '', discount: '', validUntil: '' });
                                }}>
                                    <Plus className="w-4 h-4" /> Thêm ưu đãi
                                </Button>
                            </div>
                            {/* Promo list */}
                            <div className="space-y-3">
                                {config.promotions.length === 0 && (
                                    <p className="text-zinc-600 text-sm text-center py-4">Chưa có ưu đãi nào. Thêm ưu đãi đầu tiên!</p>
                                )}
                                {config.promotions.map((p: any, i: number) => (
                                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-start">
                                        <div>
                                            <p className="text-white font-semibold">{p.title} {p.discount && <span className="text-green-400 ml-2">-{p.discount}%</span>}</p>
                                            <p className="text-zinc-400 text-sm mt-1">{p.description}</p>
                                            {p.validUntil && <p className="text-zinc-600 text-xs mt-1">Hết hạn: {p.validUntil}</p>}
                                        </div>
                                        <button onClick={() => setConfig({ ...config, promotions: config.promotions.filter((_, idx) => idx !== i) })}
                                            className="text-zinc-600 hover:text-red-400 ml-4 mt-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SEO TAB */}
                <TabsContent value="seo">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="bg-zinc-950 border-zinc-800">
                            <CardHeader><CardTitle className="text-white text-base">Mạng xã hội</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Field label="Facebook URL" value={config.facebookUrl} onChange={v => setConfig({ ...config, facebookUrl: v })} />
                                <Field label="Instagram URL" value={config.instagramUrl} onChange={v => setConfig({ ...config, instagramUrl: v })} />
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-950 border-zinc-800">
                            <CardHeader><CardTitle className="text-white text-base">SEO</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Field label="Meta Title" value={config.metaTitle} onChange={v => setConfig({ ...config, metaTitle: v })} hint="Tiêu đề hiển thị trên Google" />
                                <Field label="Meta Description" value={config.metaDescription} onChange={v => setConfig({ ...config, metaDescription: v })} multiline hint="Mô tả ngắn hiển thị trên kết quả tìm kiếm" />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function Field({ label, value, onChange, hint, multiline }: {
    label: string; value: string; onChange: (v: string) => void; hint?: string; multiline?: boolean;
}) {
    const cls = "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600";
    return (
        <div>
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">{label}</label>
            {multiline
                ? <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3} className={cls + ' resize-none'} />
                : <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className={cls} />
            }
            {hint && <p className="text-zinc-600 text-xs mt-1">{hint}</p>}
        </div>
    );
}
