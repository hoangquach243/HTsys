import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly prisma: PrismaService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-flow')
  async runTestFlow() {
    console.log('--- Bắt đầu Kiểm thử Luồng nghiệp vụ Hành trình Khách hàng ---');
    const logs: string[] = [];
    const pushLog = (msg: string) => { console.log(msg); logs.push(msg); };

    try {
      // 1. Lấy hoặc tạo khách sạn mặc định
      let property = await this.prisma.property.findFirst();
      if (!property) {
        property = await this.prisma.property.create({
          data: {
            name: 'GoHost Test Hotel',
            email: 'contact@gohost.test',
            phone: '0123456789',
            address: '123 Test Street'
          }
        });
      }

      // 1.5 Lấy hoặc tạo phòng trống
      let roomType = await this.prisma.roomType.findFirst({ where: { propertyId: property.id } });
      if (!roomType) {
        roomType = await this.prisma.roomType.create({
          data: {
            name: 'Standard Room',
            code: 'STD',
            propertyId: property.id,
            basePrice: 500000,
            maxAdults: 2
          }
        });
      }

      let dbRoom = await this.prisma.room.findFirst({ where: { roomTypeId: roomType.id } });
      if (!dbRoom) {
        dbRoom = await this.prisma.room.create({
          data: {
            roomNumber: '101',
            roomTypeId: roomType.id,
            status: 'AVAILABLE'
          }
        });
      } else {
        await this.prisma.room.update({ where: { id: dbRoom.id }, data: { status: 'AVAILABLE' } });
      }

      // 1.8 Tạo loại dịch vụ (service)
      let dbService = await this.prisma.service.findFirst({ where: { propertyId: property.id } });
      if (!dbService) {
        dbService = await this.prisma.service.create({
          data: {
            name: 'Ăn Sáng',
            propertyId: property.id,
            price: 50000
          }
        });
      }

      // 2. Lấy hoặc tạo khách hàng
      pushLog('[1/7] Khởi tạo dữ liệu / Tìm khách hàng...');
      let guest = await this.prisma.guest.findFirst({ where: { email: 'john.doe.test@example.com' } });
      if (!guest) {
        guest = await this.prisma.guest.create({
          data: {
            name: 'John Doe Test',
            email: 'john.doe.test@example.com',
            phone: '0901234567',
            propertyId: property.id
          }
        });
      }

      // 3. Tìm loại phòng và phân phòng trống
      const room = await this.prisma.room.findFirst({
        where: { status: 'AVAILABLE' },
        include: { roomType: true }
      });
      if (!room) throw new Error("Không có phòng trống AVAILABLE.");

      // 4. Tạo chức năng Booking mới
      const roomCode = room.roomNumber;
      const roomTypeName = room.roomType.name;
      pushLog('[2/7] Tạo Booking mới cho phòng ' + roomCode + ' (' + roomTypeName + ')...');
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const booking = await this.prisma.booking.create({
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
      pushLog('✅ Đã tạo Booking: ' + booking.code + ' với tổng tiền: ' + booking.totalAmount);

      // 5. Khách Check-in
      pushLog('[3/7] Khách Check-in...');
      await this.prisma.$transaction([
        this.prisma.booking.update({ where: { id: booking.id }, data: { status: 'CHECKED_IN' } }),
        this.prisma.room.update({ where: { id: room.id }, data: { status: 'OCCUPIED' } })
      ]);
      pushLog('✅ Đã Check-in thành công. Trạng thái phòng: OCCUPIED');

      // 6. Dịch vụ
      pushLog('[4/7] Khách gọi Dịch vụ...');
      let service = await this.prisma.service.findFirst({ where: { propertyId: property.id } });
      if (service) {
        await this.prisma.serviceUsage.create({
          data: {
            bookingId: booking.id,
            serviceId: service.id,
            quantity: 2,
            unitPrice: service.price,
            amount: service.price * 2,
            note: "Thêm khách qua đêm"
          }
        });
        await this.prisma.booking.update({
          where: { id: booking.id },
          data: { totalAmount: { increment: service.price * 2 } }
        });
        pushLog('✅ Đã thêm dịch vụ: ' + service.name + ' (x2). Cộng ' + (service.price * 2) + ' vào bill.');
      }

      // 7. Thanh toán
      pushLog('[5/7] Xử lý Thanh toán...');
      const updatedBooking = await this.prisma.booking.findUnique({ where: { id: booking.id } });
      const amountToPay = updatedBooking!.totalAmount;

      await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: amountToPay,
          method: 'transfer',
          note: 'Chuyển khoản thanh toán toàn bộ'
        }
      });
      const bookingPaid = await this.prisma.booking.update({
        where: { id: booking.id },
        data: { paidAmount: amountToPay, paymentStatus: 'PAID' }
      });
      pushLog('✅ Đã thu tiền thành công: ' + bookingPaid.paidAmount + '. Trạng thái: PAID');

      // 8. Check-out
      pushLog('[6/7] Khách Check-out...');
      await this.prisma.$transaction([
        this.prisma.booking.update({ where: { id: booking.id }, data: { status: 'CHECKED_OUT' } }),
        this.prisma.room.update({ where: { id: room.id }, data: { status: 'CLEANING' } })
      ]);
      pushLog('✅ Đã Check-out. Phòng chuyển sang trạng thái Dọn dẹp (CLEANING).');

      // 9. Task Buồng phòng
      pushLog('[7/7] Tự động hóa - Sinh công việc buồng phòng...');
      const task = await this.prisma.task.create({
        data: {
          title: 'Dọn phòng ' + roomCode + ' sau Check-out',
          type: 'HOUSEKEEPING',
          status: 'PENDING',
          roomId: room.id,
          bookingId: booking.id,
          propertyId: property.id
        }
      });
      pushLog('✅ Đã tạo Task tự động: "' + task.title + '" (ID: ' + task.id + ')');

      pushLog('\n🎉 LUỒNG NGHIỆP VỤ HOẠT ĐỘNG HOÀN HẢO! Kết nối CSDL và các Bảng Logic đã được chứng minh.');
      return { success: true, logs: logs };

    } catch (error: any) {
      console.error("❌ Lỗi trong quá trình giả lập:", error);
      return { success: false, error: error.message };
    }
  }
}
