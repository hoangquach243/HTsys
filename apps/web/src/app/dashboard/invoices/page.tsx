'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FileText, Printer, Download, CreditCard, Clock, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InvoicesPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/bookings?limit=50&propertyId=clouq2m1q00003b6w5z8s6xy9');
            const data = await res.json();
            setBookings(data.data || []);
        } catch (error) {
            console.error("Failed to load invoices", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoiceDetails = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:3001/api/bookings/${id}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedInvoice(data);
            }
        } catch (error) {
            console.error("Failed to load invoice details", error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-theme(spacing.16))]">
            {/* INVOICE LIST */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4 overflow-hidden">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-orange-400" /> Quản lý Hóa đơn
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">Danh sách hóa đơn thanh toán từ Đặt phòng</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center text-zinc-500 py-10">Đang tải dữ liệu...</div>
                    ) : (
                        bookings.map(booking => (
                            <Card
                                key={booking.id}
                                className={`cursor-pointer transition-colors border-zinc-800 ${selectedInvoice?.id === booking.id ? 'bg-zinc-800 border-orange-500/50' : 'bg-zinc-950 hover:bg-zinc-900'}`}
                                onClick={() => fetchInvoiceDetails(booking.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-white text-sm">HĐ: {booking.code}</div>
                                        <div className={`text-xs px-2 py-0.5 rounded-full ${booking.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' :
                                                booking.paymentStatus === 'PARTIAL' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                            {booking.paymentStatus === 'PAID' ? 'Đã thu' : booking.paymentStatus === 'PARTIAL' ? 'Thu 1 phần' : 'Chưa thu'}
                                        </div>
                                    </div>
                                    <div className="text-sm text-zinc-300">Khách: {booking.guest?.name || 'Walk-in'}</div>
                                    <div className="text-xs text-zinc-500 mt-1 flex justify-between items-center">
                                        <span>{format(new Date(booking.createdAt), 'dd/MM/yyyy')}</span>
                                        <span className="font-semibold text-zinc-200">{booking.totalAmount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* INVOICE DETAILS (PDF / PRINT VIEW) */}
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                {selectedInvoice ? (
                    <>
                        <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center no-print">
                            <h2 className="text-lg font-bold text-white">Chi tiết Hóa đơn #{selectedInvoice.code}</h2>
                            <div className="flex gap-2">
                                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white" onClick={handlePrint}>
                                    <Printer className="w-4 h-4 mr-2" /> In hóa đơn
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white text-zinc-900 print:p-0 print:overflow-visible mx-4 my-4 rounded-lg shadow-inner print:shadow-none print:m-0 id-print-container">
                            {/* Invoice Header */}
                            <div className="flex justify-between items-start border-b-2 border-zinc-200 pb-6 mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-zinc-800 uppercase tracking-wider mb-2">HÓA ĐƠN</h1>
                                    <div className="text-sm text-zinc-500">
                                        <div>Mã số: <strong>{selectedInvoice.code}</strong></div>
                                        <div>Ngày lập: {format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-bold text-orange-600 mb-1">GOHOST SYSTEM</h2>
                                    <div className="text-sm text-zinc-600">
                                        <div>Số 1, Đường Lê Duẩn, Quận 1</div>
                                        <div>Thành phố Hồ Chí Minh, Việt Nam</div>
                                        <div>SĐT: 0123.456.789</div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-zinc-400 mb-2">Thông tin Khách hàng</h3>
                                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                        <div className="font-bold text-lg text-zinc-800 mb-1">{selectedInvoice.guest?.name}</div>
                                        <div className="text-sm flex items-center gap-2 text-zinc-600 mb-1"><CreditCard className="w-3 h-3" /> CCCD/CMND: {selectedInvoice.guest?.idNumber || 'Không có'}</div>
                                        <div className="text-sm flex items-center gap-2 text-zinc-600 mb-1"><Clock className="w-3 h-3" /> SĐT: {selectedInvoice.guest?.phone || 'Không có'}</div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-zinc-400 mb-2">Chi tiết Lưu trú</h3>
                                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Nhận phòng:</span>
                                            <strong className="text-zinc-800">{format(new Date(selectedInvoice.checkIn), 'dd/MM/yyyy HH:mm')}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Trả phòng:</span>
                                            <strong className="text-zinc-800">{format(new Date(selectedInvoice.checkOut), 'dd/MM/yyyy HH:mm')}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Số lượng:</span>
                                            <strong className="text-zinc-800">{selectedInvoice.adults} người lớn, {selectedInvoice.children} trẻ em</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Room Charges Table */}
                            <h3 className="text-sm font-bold uppercase text-zinc-800 mb-3 border-b pb-2">1. Chi phí Tiền phòng</h3>
                            <table className="w-full mb-8 text-sm">
                                <thead className="bg-zinc-100 text-zinc-600">
                                    <tr>
                                        <th className="py-2 px-3 text-left rounded-tl-lg">Phòng</th>
                                        <th className="py-2 px-3 text-center">Số ngày</th>
                                        <th className="py-2 px-3 text-right">Đơn giá/ngày</th>
                                        <th className="py-2 px-3 text-right rounded-tr-lg">Thành tiền (VND)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoice.bookingRooms?.length > 0 ? selectedInvoice.bookingRooms.map((br: any) => {
                                        const roomNights = Math.max(1, Math.ceil((new Date(br.checkOut).getTime() - new Date(br.checkIn).getTime()) / (1000 * 3600 * 24)));
                                        return (
                                            <tr key={br.id} className="border-b border-zinc-100">
                                                <td className="py-3 px-3">
                                                    <div className="font-bold text-zinc-800">{br.room?.roomNumber || br.room?.name || 'Chưa gán phòng'}</div>
                                                    <div className="text-xs text-zinc-500">{br.roomType?.name}</div>
                                                </td>
                                                <td className="py-3 px-3 text-center">{roomNights} đêm</td>
                                                <td className="py-3 px-3 text-right">{br.price.toLocaleString('vi-VN')}</td>
                                                <td className="py-3 px-3 text-right font-semibold text-zinc-800">{(br.price * roomNights).toLocaleString('vi-VN')}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td className="py-3 px-3">Phòng tiêu chuẩn</td>
                                            <td className="py-3 px-3 text-center">{selectedInvoice.nights || 1} đêm</td>
                                            <td className="py-3 px-3 text-right">0</td>
                                            <td className="py-3 px-3 text-right font-semibold">0</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Service Charges Table */}
                            <h3 className="text-sm font-bold uppercase text-zinc-800 mb-3 border-b pb-2">2. Chi phí Dịch vụ Bổ sung</h3>
                            <table className="w-full mb-8 text-sm">
                                <thead className="bg-zinc-100 text-zinc-600">
                                    <tr>
                                        <th className="py-2 px-3 text-left rounded-tl-lg">Tên dịch vụ</th>
                                        <th className="py-2 px-3 text-center">SL</th>
                                        <th className="py-2 px-3 text-right">Đơn giá</th>
                                        <th className="py-2 px-3 text-right rounded-tr-lg">Thành tiền (VND)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoice.serviceUsages?.length > 0 ? selectedInvoice.serviceUsages.map((usage: any) => (
                                        <tr key={usage.id} className="border-b border-zinc-100">
                                            <td className="py-3 px-3 font-medium text-zinc-800">{usage.service?.name}</td>
                                            <td className="py-3 px-3 text-center">{usage.quantity}</td>
                                            <td className="py-3 px-3 text-right">{usage.unitPrice.toLocaleString('vi-VN')}</td>
                                            <td className="py-3 px-3 text-right font-semibold text-zinc-800">{usage.amount.toLocaleString('vi-VN')}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="py-4 px-3 text-center text-zinc-500 italic">Không sử dụng dịch vụ bổ sung nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Payment History Table */}
                            <h3 className="text-sm font-bold uppercase text-zinc-800 mb-3 border-b pb-2">3. Lịch sử Thanh toán</h3>
                            <table className="w-full mb-8 text-sm">
                                <thead className="bg-zinc-100 text-zinc-600">
                                    <tr>
                                        <th className="py-2 px-3 text-left rounded-tl-lg">Thời gian</th>
                                        <th className="py-2 px-3 text-left">Phương thức</th>
                                        <th className="py-2 px-3 text-right rounded-tr-lg">Số tiền (VND)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoice.payments?.length > 0 ? selectedInvoice.payments.map((payment: any) => (
                                        <tr key={payment.id} className="border-b border-zinc-100">
                                            <td className="py-3 px-3 text-zinc-700">{format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                                            <td className="py-3 px-3 text-zinc-700 uppercase font-medium">{payment.method}</td>
                                            <td className="py-3 px-3 text-right font-semibold text-emerald-600">{payment.amount.toLocaleString('vi-VN')}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="py-4 px-3 text-center text-zinc-500 italic text-sm">Chưa có giao dịch thanh toán nào được ghi nhận.</td>
                                        </tr>
                                    )}
                                    {/* Display manual advance payment if passed as paidAmount without tracking in Payments table */}
                                    {selectedInvoice.paidAmount > 0 && (!selectedInvoice.payments || selectedInvoice.payments.length === 0) && (
                                        <tr className="border-b border-zinc-100">
                                            <td className="py-3 px-3 text-zinc-700">{format(new Date(selectedInvoice.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                                            <td className="py-3 px-3 text-zinc-700 font-medium">Khách trả trước / Cọc</td>
                                            <td className="py-3 px-3 text-right font-semibold text-emerald-600">{selectedInvoice.paidAmount.toLocaleString('vi-VN')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Summary Totals */}
                            <div className="flex justify-end mt-8">
                                <div className="w-full md:w-1/2 lg:w-1/3 space-y-3 border-t-2 border-zinc-200 pt-4">
                                    <div className="flex justify-between text-zinc-600">
                                        <span>Tổng cấu thành:</span>
                                        <strong>{selectedInvoice.totalAmount.toLocaleString('vi-VN')} VND</strong>
                                    </div>
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Đã thanh toán:</span>
                                        <strong>{selectedInvoice.paidAmount.toLocaleString('vi-VN')} VND</strong>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-orange-600 border-t border-zinc-200 pt-3">
                                        <span>CẦN THANH TOÁN:</span>
                                        <span>{Math.max(0, selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString('vi-VN')} VND</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 pt-8 border-t border-zinc-200 text-center text-sm text-zinc-500">
                                Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!<br />
                                Xin chào và hẹn gặp lại.
                            </div>
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                @media print {
                                    body * { visibility: hidden; }
                                    .id-print-container, .id-print-container * { visibility: visible; }
                                    .id-print-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; box-shadow: none; }
                                }
                            `}} />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <p>Chọn một hóa đơn bên trái để xem chi tiết</p>
                    </div>
                )}
            </div>
        </div>
    );
}
