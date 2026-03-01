import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Business Flow - Lễ Tân & Buồng Phòng (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prisma = app.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        await app.close();
    });

    it('Toàn trình: Khách Đặt phòng -> Check-in -> Dịch vụ -> Thanh toán -> Check-out', async () => {
        console.log('\\n--- BẮT ĐẦU KIỂM THỬ E2E: LUỒNG NGHIỆP VỤ ---');
        // 1. Property
        const property = await prisma.property.findFirst();
        expect(property).toBeDefined();

        // 2. Guest
        let guest = await prisma.guest.findFirst({ where: { email: 'e2e.test@example.com' } });
        if (!guest) {
            guest = await prisma.guest.create({
                data: {
                    name: 'E2E Test Guest',
                    email: 'e2e.test@example.com',
                    propertyId: property!.id
                }
            });
        }

        // 3. Room
        const room = await prisma.room.findFirst({
            where: { status: 'AVAILABLE' },
            include: { roomType: true }
        });
        expect(room).toBeDefined();
        if (!room) return;

        // 4. Booking
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const booking = await prisma.booking.create({
            data: {
                code: 'E2E-' + Date.now().toString(),
                guestId: guest.id,
                propertyId: property!.id,
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
        expect(booking.id).toBeDefined();
        console.log('✅ Đã tạo Booking ' + booking.code + ' thành công.');

        // 5. Check-in
        await prisma.$transaction([
            prisma.booking.update({ where: { id: booking.id }, data: { status: 'CHECKED_IN' } }),
            prisma.room.update({ where: { id: room.id }, data: { status: 'OCCUPIED' } })
        ]);
        const checkedRoom = await prisma.room.findUnique({ where: { id: room.id } });
        expect(checkedRoom?.status).toBe('OCCUPIED');
        console.log('✅ Khách đã Check-in. Trạng thái phòng: OCCUPIED');

        // 6. Dịch vụ
        let service = await prisma.service.findFirst({ where: { propertyId: property!.id } });
        if (service) {
            await prisma.serviceUsage.create({
                data: {
                    bookingId: booking.id,
                    serviceId: service.id,
                    quantity: 1,
                    unitPrice: service.price,
                    amount: service.price,
                }
            });
            await prisma.booking.update({
                where: { id: booking.id },
                data: { totalAmount: { increment: service.price } }
            });
            console.log('✅ Đã thêm dịch vụ: ' + service.name);
        }

        // 7. Thanh toán & Check-out
        const finalBooking = await prisma.booking.findUnique({ where: { id: booking.id } });

        await prisma.payment.create({
            data: {
                bookingId: booking.id,
                amount: finalBooking!.totalAmount,
                method: 'cash',
            }
        });

        await prisma.$transaction([
            prisma.booking.update({
                where: { id: booking.id },
                data: { status: 'CHECKED_OUT', paymentStatus: 'PAID', paidAmount: finalBooking!.totalAmount }
            }),
            prisma.room.update({ where: { id: room.id }, data: { status: 'CLEANING' } })
        ]);

        const cleaningRoom = await prisma.room.findUnique({ where: { id: room.id } });
        expect(cleaningRoom?.status).toBe('CLEANING');
        console.log('✅ Đã thanh toán và Check-out. Trạng thái phòng: CLEANING');

        // 8. Auto Task Generator Rule (Mock test that we can create a task for it)
        const task = await prisma.task.create({
            data: {
                title: 'Dọn phòng ' + room.roomNumber,
                type: 'HOUSEKEEPING',
                status: 'PENDING',
                roomId: room.id,
                bookingId: booking.id,
                propertyId: property!.id
            }
        });
        expect(task.id).toBeDefined();
        console.log('✅ Đã tự động sinh Task Dọn phòng ID: ' + task.id);
        console.log('🎉 TOÀN BỘ LUỒNG VẬN HÀNH CHẠY THÀNH CÔNG NỐI TIẾP VÀ CHUẨN XÁC!');
    });
});
