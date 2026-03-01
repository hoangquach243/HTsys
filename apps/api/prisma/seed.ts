import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Property
  const property = await prisma.property.create({
    data: {
      name: 'HT House Đà Lạt',
      phone: '0909123456',
      email: 'info@hthouse.vn',
      address: '123 Nguyễn Chí Thanh, Phường 1, TP. Đà Lạt, Lâm Đồng',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      timezone: 'Asia/Ho_Chi_Minh',
      currency: 'VND',
    },
  });
  console.log(`✅ Property: ${property.name}`);

  // 2. Create Users
  const passwordHash = await bcryptjs.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@hthouse.vn',
      passwordHash,
      role: 'ADMIN',
      propertyId: property.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Lễ tân Hoa',
      email: 'hoa@hthouse.vn',
      passwordHash,
      role: 'RECEPTIONIST',
      propertyId: property.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Quản lý Minh',
      email: 'minh@hthouse.vn',
      passwordHash,
      role: 'MANAGER',
      propertyId: property.id,
    },
  });
  console.log('✅ Users: admin, receptionist, manager');

  // 3. Create Room Types
  const deluxeA = await prisma.roomType.create({
    data: {
      name: 'CN1_Deluxe A',
      code: 'RT001',
      kind: 'ROOM',
      description: 'Phòng Deluxe hướng hồ, view đẹp',
      maxAdults: 2,
      maxChildren: 1,
      maxInfants: 1,
      basePrice: 800000,
      weekendPrice: 1000000,
      amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony'],
      isActive: true,
      propertyId: property.id,
    },
  });

  const standardB = await prisma.roomType.create({
    data: {
      name: 'CN2_Standard B',
      code: 'RT002',
      kind: 'ROOM',
      description: 'Phòng Standard ấm cúng',
      maxAdults: 2,
      maxChildren: 1,
      maxInfants: 0,
      basePrice: 500000,
      weekendPrice: 650000,
      amenities: ['WiFi', 'AC', 'TV'],
      isActive: true,
      propertyId: property.id,
    },
  });

  const dormC = await prisma.roomType.create({
    data: {
      name: 'CN3_Dorm C',
      code: 'RT003',
      kind: 'DORM',
      description: 'Phòng Dorm giường tầng',
      maxAdults: 1,
      maxChildren: 0,
      maxInfants: 0,
      basePrice: 200000,
      weekendPrice: 250000,
      amenities: ['WiFi', 'Locker'],
      isActive: true,
      propertyId: property.id,
    },
  });
  console.log('✅ Room Types: Deluxe A, Standard B, Dorm C');

  // 4. Create Rooms
  const roomsData = [
    { roomNumber: 'A.301', floor: '3', roomTypeId: deluxeA.id },
    { roomNumber: 'A.302', floor: '3', roomTypeId: deluxeA.id },
    { roomNumber: 'A.303', floor: '3', roomTypeId: deluxeA.id },
    { roomNumber: 'B.201', floor: '2', roomTypeId: standardB.id },
    { roomNumber: 'B.202', floor: '2', roomTypeId: standardB.id },
    { roomNumber: 'B.203', floor: '2', roomTypeId: standardB.id },
    { roomNumber: 'C.101', floor: '1', roomTypeId: dormC.id },
    { roomNumber: 'C.102', floor: '1', roomTypeId: dormC.id },
  ];
  await prisma.room.createMany({ data: roomsData });
  console.log(`✅ Rooms: ${roomsData.length} rooms created`);

  // 5. Create Rate Plans
  await prisma.ratePlan.createMany({
    data: [
      { name: 'Giá tiêu chuẩn', basePrice: 800000, weekendPrice: 1000000, isDefault: true, roomTypeId: deluxeA.id },
      { name: 'Giá khuyến mãi', basePrice: 650000, weekendPrice: 850000, isDefault: false, roomTypeId: deluxeA.id },
      { name: 'Giá tiêu chuẩn', basePrice: 500000, weekendPrice: 650000, isDefault: true, roomTypeId: standardB.id },
      { name: 'Giá tiêu chuẩn', basePrice: 200000, weekendPrice: 250000, isDefault: true, roomTypeId: dormC.id },
    ],
  });
  console.log('✅ Rate Plans created');

  // 6. Create Booking Sources
  await prisma.bookingSource.createMany({
    data: [
      { name: 'Walk-in', type: 'direct', propertyId: property.id },
      { name: 'Điện thoại', type: 'direct', propertyId: property.id },
      { name: 'Website', type: 'direct', propertyId: property.id },
      { name: 'Booking.com', type: 'ota', propertyId: property.id },
      { name: 'Agoda', type: 'ota', propertyId: property.id },
      { name: 'Traveloka', type: 'ota', propertyId: property.id },
      { name: 'Airbnb', type: 'ota', propertyId: property.id },
    ],
  });
  console.log('✅ Booking Sources created');

  // 7. Create Payment Methods
  await prisma.paymentMethod.createMany({
    data: [
      { name: 'Tiền mặt', propertyId: property.id },
      { name: 'Chuyển khoản', propertyId: property.id },
      { name: 'Thẻ tín dụng', propertyId: property.id },
      { name: 'MoMo', propertyId: property.id },
      { name: 'VNPay', propertyId: property.id },
    ],
  });
  console.log('✅ Payment Methods created');

  // 8. Create Labels
  await prisma.label.createMany({
    data: [
      { name: 'VIP', color: '#EF4444', propertyId: property.id },
      { name: 'Khách quen', color: '#3B82F6', propertyId: property.id },
      { name: 'Đoàn', color: '#10B981', propertyId: property.id },
      { name: 'Cần chú ý', color: '#F59E0B', propertyId: property.id },
    ],
  });
  console.log('✅ Labels created');

  // 9. Create Categories
  await prisma.category.createMany({
    data: [
      { name: 'Khách lẻ', type: 'guest', propertyId: property.id },
      { name: 'Đại lý', type: 'guest', propertyId: property.id },
      { name: 'Doanh nghiệp', type: 'guest', propertyId: property.id },
    ],
  });
  console.log('✅ Categories created');

  // 10. Create Services
  await prisma.service.createMany({
    data: [
      { name: 'Bữa sáng', code: 'DV001', group: 'Ăn uống', price: 80000, pricingMode: 'PER_PERSON', type: 'SERVICE', propertyId: property.id },
      { name: 'Giặt ủi', code: 'DV002', group: 'Giặt ủi', price: 50000, pricingMode: 'FIXED', type: 'SERVICE', propertyId: property.id },
      { name: 'Đưa đón sân bay', code: 'DV003', group: 'Vận chuyển', price: 300000, pricingMode: 'FIXED', type: 'SERVICE', propertyId: property.id },
      { name: 'Phụ thu giường thêm', code: 'PT001', group: 'Phụ thu', price: 200000, pricingMode: 'PER_NIGHT', type: 'SURCHARGE', propertyId: property.id },
      { name: 'Phụ thu check-in sớm', code: 'PT002', group: 'Phụ thu', price: 150000, pricingMode: 'FIXED', type: 'SURCHARGE', propertyId: property.id },
    ],
  });
  console.log('✅ Services created');

  // 11. Create Sample Guests
  const guest1 = await prisma.guest.create({
    data: {
      name: 'Nguyễn Văn An',
      phone: '0912345678',
      email: 'an.nguyen@gmail.com',
      nationality: 'VN',
      gender: 'MALE',
      propertyId: property.id,
    },
  });

  const guest2 = await prisma.guest.create({
    data: {
      name: 'Trần Thị Bình',
      phone: '0987654321',
      email: 'binh.tran@gmail.com',
      nationality: 'VN',
      gender: 'FEMALE',
      propertyId: property.id,
    },
  });
  console.log('✅ Sample Guests created');

  // 12. Create Sample Bookings
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(now);
  dayAfter.setDate(dayAfter.getDate() + 2);

  await prisma.booking.create({
    data: {
      code: 'BK-001',
      status: 'CHECKED_IN',
      paymentStatus: 'PAID',
      source: 'Walk-in',
      checkIn: now,
      checkOut: tomorrow,
      nights: 1,
      adults: 2,
      totalAmount: 800000,
      paidAmount: 800000,
      guestId: guest1.id,
      propertyId: property.id,
      createdById: admin.id,
      bookingRooms: {
        create: {
          roomId: (await prisma.room.findFirst({ where: { roomNumber: 'A.301' } }))!.id,
          roomTypeId: deluxeA.id,
          checkIn: now,
          checkOut: tomorrow,
          price: 800000,
        },
      },
    },
  });

  await prisma.booking.create({
    data: {
      code: 'BK-002',
      status: 'NEW',
      paymentStatus: 'UNPAID',
      source: 'Agoda',
      otaCode: 'AGD-12345678',
      checkIn: tomorrow,
      checkOut: dayAfter,
      nights: 1,
      adults: 2,
      totalAmount: 500000,
      paidAmount: 0,
      guestId: guest2.id,
      propertyId: property.id,
      createdById: admin.id,
      bookingRooms: {
        create: {
          roomId: (await prisma.room.findFirst({ where: { roomNumber: 'B.201' } }))!.id,
          roomTypeId: standardB.id,
          checkIn: tomorrow,
          checkOut: dayAfter,
          price: 500000,
        },
      },
    },
  });
  console.log('✅ Sample Bookings created');

  // 13. Create Bank Account
  await prisma.bankAccount.create({
    data: {
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountName: 'HT House',
      branch: 'Chi nhánh Đà Lạt',
      isDefault: true,
      propertyId: property.id,
    },
  });
  console.log('✅ Bank Account created');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
