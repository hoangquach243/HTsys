'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs as RadixTabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Save, PenSquare, X, Type, Code } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const propertyId = 'clouq2m1q00003b6w5z8s6xy9';

const DEFAULT_INVOICE_TEMPLATE = `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a56db; margin: 0;">HÓA ĐƠN THANH TOÁN</h1>
        <p style="margin: 5px 0;">Ngày in: {{printDate}}</p>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
        <div>
            <h3 style="margin-top: 0;">Thông tin Khách sạn</h3>
            <p><strong>Tên:</strong> {{propertyName}}</p>
            <p><strong>Hotline:</strong> {{propertyPhone}}</p>
            <p><strong>Địa chỉ:</strong> {{propertyAddress}}</p>
        </div>
        <div style="text-align: right;">
            <h3 style="margin-top: 0;">Thông tin Khách hàng</h3>
            <p><strong>Tên khách:</strong> {{guestName}}</p>
            <p><strong>SĐT:</strong> {{guestPhone}}</p>
            <p><strong>Mã Đặt phòng:</strong> {{bookingCode}}</p>
        </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
            <tr style="background-color: #f8fafc; text-align: left;">
                <th style="padding: 12px; border: 1px solid #e2e8f0;">Hạng mục</th>
                <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">SL</th>
                <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">Đơn giá</th>
                <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">Thành tiền</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">Tiền phòng ({{roomName}})</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">{{nights}} đêm</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">{{roomPrice}} đ</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">{{roomTotal}} đ</td>
            </tr>
            {{servicesList}}
        </tbody>
        <tfoot>
            <tr style="background-color: #f8fafc; font-weight: bold;">
                <td colspan="3" style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">TỔNG CỘNG:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; color: #ea580c;">{{grandTotal}} đ</td>
            </tr>
            <tr>
                <td colspan="3" style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">Đã thanh toán (Cọc):</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">{{paidAmount}} đ</td>
            </tr>
            <tr style="background-color: #f8fafc; font-weight: bold;">
                <td colspan="3" style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">CÒN LẠI CẦN THANH TOÁN:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; color: #b91c1c;">{{balanceDue}} đ</td>
            </tr>
        </tfoot>
    </table>

    <div style="display: flex; justify-content: space-between; margin-top: 50px;">
        <div style="text-align: center; width: 50%;">
            <p><strong>Khách hàng</strong></p>
            <p style="font-style: italic; color: #666; font-size: 12px;">(Ký & ghi rõ họ tên)</p>
        </div>
        <div style="text-align: center; width: 50%;">
            <p><strong>Lễ tân</strong></p>
            <p style="font-style: italic; color: #666; font-size: 12px;">(Ký & ghi rõ họ tên)</p>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 80px; font-size: 12px; color: #888;">
        <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
    </div>
</div>
`;

const DEFAULT_DEPOSIT_TEMPLATE = `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #10b981; margin: 0;">PHIẾU XÁC NHẬN ĐẶT CỌC</h1>
        <p style="margin: 5px 0;">Ngày in: {{printDate}}</p>
    </div>
    
    <div style="border: 2px dashed #10b981; padding: 20px; border-radius: 8px; margin-bottom: 30px; background-color: #f0fdf4;">
        <h2 style="text-align: center; margin-top: 0; color: #047857;">SỐ TIỀN CỌC: {{paidAmount}} VND</h2>
        <p style="text-align: center; font-style: italic; margin-bottom: 0;">(Bằng chữ: {{paidAmountText}})</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 48%;">
            <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Thông tin Khách sạn</h3>
            <p><strong>Tên:</strong> {{propertyName}}</p>
            <p><strong>Hotline:</strong> {{propertyPhone}}</p>
            <p><strong>Địa chỉ:</strong> {{propertyAddress}}</p>
        </div>
        <div style="width: 48%;">
            <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Thông tin Khách hàng</h3>
            <p><strong>Tên khách:</strong> {{guestName}}</p>
            <p><strong>Số điện thoại:</strong> {{guestPhone}}</p>
        </div>
    </div>

    <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Chi tiết Đặt phòng (Mã: {{bookingCode}})</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tbody>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; width: 30%;"><strong>Phòng:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{roomName}}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Nhận phòng:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{checkInDate}} ({{checkInTime}})</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Trả phòng:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{{checkOutDate}} ({{checkOutTime}})</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Tổng tiền tạm tính:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">{{grandTotal}} VND</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #b91c1c;"><strong>Số tiền còn phải thu:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #b91c1c;">{{balanceDue}} VND</td>
            </tr>
        </tbody>
    </table>

    <div style="display: flex; justify-content: space-between; margin-top: 50px;">
        <div style="text-align: center; width: 50%;">
            <p><strong>Khách hàng</strong></p>
            <p style="font-style: italic; color: #666; font-size: 12px;">(Ký & ghi rõ họ tên)</p>
        </div>
        <div style="text-align: center; width: 50%;">
            <p><strong>Đại diện Khách sạn</strong></p>
            <p style="font-style: italic; color: #666; font-size: 12px;">(Ký & ghi rõ họ tên)</p>
        </div>
    </div>
</div>
`;

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<{ id?: string, type: string, content: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingType, setViewingType] = useState('invoice');

    // Modal Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editorContent, setEditorContent] = useState('');
    const [editorMode, setEditorMode] = useState<'word' | 'html'>('word');
    const [isSaving, setIsSaving] = useState(false);

    // Quick Reference block
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/settings/print-templates?propertyId=${propertyId}`);
            const data = await res.json();
            setTemplates(data || []);
        } catch (error) {
            console.error("Error fetching templates", error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentTemplateContent = (type: string) => {
        const tpl = templates.find((t: any) => t.type === type);
        if (tpl) return tpl.content;
        return type === 'invoice' ? DEFAULT_INVOICE_TEMPLATE : DEFAULT_DEPOSIT_TEMPLATE;
    };

    const openEditModal = () => {
        setEditorContent(getCurrentTemplateContent(viewingType));
        setEditorMode('word');
        setIsEditModalOpen(true);
    };

    // Keep editor ref synced when in word mode
    useEffect(() => {
        if (editorMode === 'word' && editorRef.current && editorRef.current.innerHTML !== editorContent) {
            editorRef.current.innerHTML = editorContent;
        }
    }, [editorContent, editorMode]);

    const handleWordInput = () => {
        if (editorRef.current) {
            setEditorContent(editorRef.current.innerHTML);
        }
    };

    const execCommand = (cmd: string, arg?: string) => {
        document.execCommand(cmd, false, arg);
        handleWordInput();
        editorRef.current?.focus();
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                propertyId,
                name: viewingType === 'invoice' ? 'Hóa đơn thanh toán' : 'Phiếu đặt cọc',
                type: viewingType,
                content: editorContent
            };

            const res = await fetch('http://localhost:3001/api/settings/print-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Đã lưu mẫu in thành công!");
                setIsEditModalOpen(false);
                fetchData();
            } else {
                const err = await res.json();
                alert("Lỗi khi lưu: " + err.message);
            }
        } catch (error) {
            alert("Lỗi mạng khi lưu");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-blue-500" />
                        Mẫu In ấn
                    </h1>
                    <p className="text-zinc-400 mt-1">Quản lý mẫu in Hóa đơn và Phiếu đặt cọc của bạn.</p>
                </div>
                <Button onClick={openEditModal} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                    <PenSquare className="w-4 h-4 mr-2" />
                    Chỉnh sửa mẫu này
                </Button>
            </div>

            <Card className="bg-zinc-950 border-zinc-900 shadow">
                <CardHeader className="pb-4 border-b border-zinc-900">
                    <RadixTabs value={viewingType} onValueChange={setViewingType} className="w-full">
                        <TabsList className="bg-zinc-900 grid w-[400px] grid-cols-2">
                            <TabsTrigger value="invoice" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Hóa Đơn</TabsTrigger>
                            <TabsTrigger value="deposit" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Phiếu Đặt Cọc</TabsTrigger>
                        </TabsList>
                    </RadixTabs>
                </CardHeader>
                <CardContent className="pt-6 relative">
                    <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 flex justify-center custom-scrollbar max-h-[700px] overflow-auto">
                        <div
                            className="bg-white p-8 shadow-md rounded pointer-events-none opacity-90"
                            style={{ width: '210mm', minHeight: '297mm', transform: 'scale(0.85)', transformOrigin: 'top center' }}
                            dangerouslySetInnerHTML={{ __html: getCurrentTemplateContent(viewingType) }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* FULL SCREEN EDIT MODAL */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="!max-w-[100vw] !w-screen !h-[100dvh] !m-0 flex flex-col !p-0 gap-0 border-none !rounded-none overflow-hidden bg-zinc-950 duration-0 animate-none">
                    <DialogHeader className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex-shrink-0 flex flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl">
                                Chỉnh sửa Mẫu {viewingType === 'invoice' ? 'Hóa đơn' : 'Phiếu đặt cọc'}
                            </DialogTitle>
                            <div className="text-xs text-zinc-500 mt-1 flex gap-2 w-full max-w-[800px] flex-wrap">
                                <strong>Biến hợp lệ:</strong>
                                <span className="bg-zinc-800 px-1 py-0.5 rounded text-blue-400">{'{{propertyName}}'}</span>
                                <span className="bg-zinc-800 px-1 py-0.5 rounded text-blue-400">{'{{guestName}}'}</span>
                                <span className="bg-zinc-800 px-1 py-0.5 rounded text-blue-400">{'{{bookingCode}}'}</span>
                                <span className="bg-zinc-800 px-1 py-0.5 rounded text-blue-400">{'{{grandTotal}}'}</span>
                                <span className="bg-zinc-800 px-1 py-0.5 rounded text-blue-400">{'{{paidAmount}}'}</span>
                                <span className="bg-zinc-800 px-1 py-0.5 rounded text-blue-400">{'{{roomName}}'}</span>
                                <span className="bg-zinc-800 px-1 py-0.5 rounded text-blue-400">{'{{checkInDate}}'}</span>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Split View */}
                    <div className="flex-1 grid grid-cols-2 min-h-0 bg-zinc-950">
                        {/* Editor Side */}
                        <div className="flex flex-col border-r border-zinc-800 min-h-0 h-full">
                            <div className="flex items-center gap-2 p-2 border-b border-zinc-800 bg-zinc-900/50">
                                <Button
                                    variant={editorMode === 'word' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setEditorMode('word')}
                                    className={editorMode === 'word' ? "bg-zinc-800 text-white" : "text-zinc-400"}
                                >
                                    <Type className="w-4 h-4 mr-2" /> Word (Trực quan)
                                </Button>
                                <Button
                                    variant={editorMode === 'html' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setEditorMode('html')}
                                    className={editorMode === 'html' ? "bg-zinc-800 text-white" : "text-zinc-400"}
                                >
                                    <Code className="w-4 h-4 mr-2" /> HTML
                                </Button>
                            </div>

                            <div className="flex-1 min-h-0 custom-scrollbar relative bg-[#1e1e1e]">
                                {editorMode === 'word' ? (
                                    <div className="flex flex-col h-full bg-white text-black">
                                        <div className="bg-zinc-100 border-b p-2 flex gap-1 flex-wrap sticky top-0 z-10 shadow-sm">
                                            <Button type="button" variant="outline" size="sm" onClick={() => execCommand('bold')} className="h-8 w-8 p-0"><b>B</b></Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => execCommand('italic')} className="h-8 w-8 p-0"><i>I</i></Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => execCommand('underline')} className="h-8 w-8 p-0"><u>U</u></Button>
                                            <div className="w-px h-6 bg-zinc-300 mx-1 self-center" />
                                            <Button type="button" variant="outline" size="sm" onClick={() => execCommand('justifyLeft')} className="h-8 px-2 font-mono">L</Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => execCommand('justifyCenter')} className="h-8 px-2 font-mono">C</Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => execCommand('justifyRight')} className="h-8 px-2 font-mono">R</Button>
                                            <div className="w-px h-6 bg-zinc-300 mx-1 self-center" />
                                            <Button type="button" variant="outline" size="sm" onClick={() => execCommand('insertOrderedList')} className="h-8 px-2">1.</Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => execCommand('insertUnorderedList')} className="h-8 px-2">•</Button>
                                            <div className="w-px h-6 bg-zinc-300 mx-1 self-center" />
                                            {/* Thêm style để hiển thị tốt */}
                                            <style>{`
                                                .editor-canvas table {
                                                    border-collapse: collapse;
                                                    width: 100%;
                                                }
                                                .editor-canvas td, .editor-canvas th {
                                                    border: 1px dashed #ccc;
                                                    padding: 4px;
                                                }
                                            `}</style>
                                        </div>
                                        <div
                                            ref={editorRef}
                                            className="flex-1 p-6 overflow-y-auto editor-canvas focus:outline-none"
                                            contentEditable
                                            onInput={handleWordInput}
                                        />
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full h-full p-6 bg-[#1e1e1e] text-[13px] text-[#d4d4d4] font-mono resize-none focus:outline-none custom-scrollbar leading-relaxed"
                                        value={editorContent}
                                        onChange={(e) => setEditorContent(e.target.value)}
                                        placeholder="<!-- Nhập HTML template -->"
                                        spellCheck={false}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Preview Side */}
                        <div className="flex flex-col min-h-0 bg-zinc-900 h-full relative">
                            <div className="absolute top-0 inset-x-0 h-10 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 flex items-center px-4 justify-between z-10 shadow-sm">
                                <span className="text-xs font-semibold text-zinc-400 tracking-wider">XEM TRƯỚC (LIVE PREVIEW)</span>
                                <span className="text-xs bg-black/50 text-zinc-500 px-2 rounded-sm border border-zinc-700">A4 Format</span>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pt-14 pb-8 flex justify-center w-full">
                                <div
                                    className="bg-white text-black p-8 shadow-2xl rounded-sm"
                                    style={{
                                        width: '210mm',
                                        minHeight: '297mm',
                                        pointerEvents: 'none',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: editorContent }}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-zinc-800 bg-zinc-900 flex-shrink-0 flex sm:justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditModalOpen(false)}
                            className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 shrink-0"
                            disabled={isSaving}
                        >
                            <X className="w-4 h-4 mr-2" /> Hủy
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                        >
                            {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
                            {!isSaving && <Save className="w-4 h-4 ml-2" />}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
