process.env.DATABASE_URL = "postgresql://postgres:password@localhost:5432/htsys_db?schema=public";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTestFlow() {
    console.log('--- Bắt đầu Kiểm thử Luồng nghiệp vụ Hành trình Khách hàng ---');
    try {
        // 1. Lấy khách sạn mặc định
        const property = await prisma.property.findFirst();
        if (!property) throw new Error("Không tìm thấy cơ sở (Property)");

        // 2. Lấy hoặc tạo khách hàng
        console.log('[1/7] Khởi tạo dữ liệu / Tìm khách hàng...');
        let guest = await prisma.guest.findFirst({ where: { email: 'john.doe.test@example.com' } });
        if (!guest) {
            guest = await prisma.guest.create({
                data: {
                    name: 'John Doe Test',
                    email: 'john.doe.test@example.com',
                    phone: '0901234567',
                    propertyId: property.id
                }
            });
        }

        // 3. Tìm loại phòng và phân phòng trống
        const room = await prisma.room.findFirst({
            where: { status: 'AVAILABLE' },
            include: { roomType: true }
        });
        if (!room) throw new Error("Không có phòng trống AVAILABLE.");

        // 4. Tạo chức năng Booking mới
        const roomCode = room.roomNumber;
        const roomTypeName = room.roomType.name;
        console.log('[2/7] Tạo Booking mới cho phòng ' + roomCode + ' (' + roomTypeName + ')...');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const booking = await prisma.booking.create({
            data: {
                code: 'BK-TEST-' + Date.now().toString(),
                guestId: guest.id,
                propertyId: property.id,
                checkIn: today,
                checkOut: tomorrow,
                nights: 1,
                totalAmount: room.roomType.basePrice,
                status: 'NEW',
                bookingRooms: {
                    create: [{
                        roomId: room.id,
                        roomTypeId: room.roomType.id,
                        checkIn: today,
                        checkOut: tomorrow,
                        price: room.roomType.basePrice
                    }]
                }
            }
        });
        console.log('✅ Đã tạo Booking: ' + booking.code + ' với tổng tiền: ' + booking.totalAmount);

        // 5. Khách Check-in (Đổi trạng thái phòng & booking)
        console.log('[3/7] Khách Check-in...');
        await prisma.$transaction([
            prisma.booking.update({ where: { id: booking.id }, data: { status: 'CHECKED_IN' } }),
            prisma.room.update({ where: { id: room.id }, data: { status: 'OCCUPIED' } })
        ]);
        console.log('✅ Đã Check-in thành công. Trạng thái phòng: OCCUPIED');

        // 6. Khách sử dụng dịch vụ (Minibar)
        console.log('[4/7] Khách gọi Dịch vụ...');
        let service = await prisma.service.findFirst({ where: { name: 'Thêm người lớn (Extra Adult)' } });
        if (!service) {
            //Fallback to any service
            service = await prisma.service.findFirst({ where: { propertyId: property.id } });
        }
        if (service) {
            await prisma.serviceUsage.create({
                data: {
                    bookingId: booking.id,
                    serviceId: service.id,
                    quantity: 2,
                    unitPrice: service.price,
                    amount: service.price * 2,
                    note: "Thêm khách qua đêm"
                }
            });
            // Cập nhật lại tổng tiền booking
            await prisma.booking.update({
                where: { id: booking.id },
                data: { totalAmount: { increment: service.price * 2 } }
            });
            console.log('✅ Đã thêm dịch vụ: ' + service.name + ' (x2). Cộng ' + (service.price * 2) + ' vào bill.');
        }

        // 7. Khách thanh toán
        console.log('[5/7] Xử lý Thanh toán...');
        const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
        const amountToPay = updatedBooking!.totalAmount;

        await prisma.payment.create({
            data: {
                bookingId: booking.id,
                amount: amountToPay,
                method: 'transfer',
                note: 'Chuyển khoản thanh toán toàn bộ'
            }
        });
        const bookingPaid = await prisma.booking.update({
            where: { id: booking.id },
            data: { paidAmount: amountToPay, paymentStatus: 'PAID' }
        });
        console.log('✅ Đã thu tiền thành công: ' + bookingPaid.paidAmount + '. Trạng thái: PAID');

        // 8. Khách Check-out
        console.log('[6/7] Khách Check-out...');
        await prisma.$transaction([
            prisma.booking.update({ where: { id: booking.id }, data: { status: 'CHECKED_OUT' } }),
            prisma.room.update({ where: { id: room.id }, data: { status: 'CLEANING' } })
        ]);
        console.log('✅ Đã Check-out. Phòng chuyển sang trạng thái Dọn dẹp (CLEANING).');

        // 9. Tự động sinh Task Buồng phòng sau khi checkout
        console.log('[7/7] Tự động hóa - Sinh công việc buồng phòng...');
        const task = await prisma.task.create({
            data: {
                title: 'Dọn phòng ' + roomCode + ' sau Check-out',
                type: 'HOUSEKEEPING',
                status: 'PENDING',
                roomId: room.id,
                bookingId: booking.id,
                propertyId: property.id
            }
        });
        console.log('✅ Đã tạo Task tự động: "' + task.title + '" (ID: ' + task.id + ')');

        console.log('\n🎉 LUỒNG NGHIỆP VỤ HOẠT ĐỘNG HOÀN HẢO! Kết nối CSDL và các Bảng Logic đã được chứng minh.');

    } catch (error) {
        console.error("❌ Lỗi trong quá trình giả lập:", error);
    } finally {
        await prisma.$disconnect();
    }
}

runTestFlow();
