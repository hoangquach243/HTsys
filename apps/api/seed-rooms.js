const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const propertyId = 'clouq2m1q00003b6w5z8s6xy9';

    // Room Types
    const rts = [
        { name: 'Standard Room', code: 'STD', basePrice: 500000, maxAdults: 2, maxChildren: 1 },
        { name: 'Deluxe Room', code: 'DLX', basePrice: 800000, maxAdults: 2, maxChildren: 2 },
        { name: 'Suite Room', code: 'SUI', basePrice: 1500000, maxAdults: 3, maxChildren: 2 },
    ];

    for (const rt of rts) {
        const createdRt = await prisma.roomType.upsert({
            where: { propertyId_code: { propertyId, code: rt.code } },
            update: rt,
            create: { ...rt, propertyId },
        });

        // Create Default Rate Plan
        await prisma.ratePlan.upsert({
            where: { id: 'rp-' + createdRt.id },
            update: { basePrice: rt.basePrice },
            create: {
                id: 'rp-' + createdRt.id,
                name: 'Giá mặc định',
                basePrice: rt.basePrice,
                isDefault: true,
                roomTypeId: createdRt.id,
            },
        });

        // Create Rooms
        for (let i = 1; i <= 3; i++) {
            const roomNumber = `${createdRt.code}-${100 + i}`;
            await prisma.room.upsert({
                where: { roomTypeId_roomNumber: { roomTypeId: createdRt.id, roomNumber } },
                update: {},
                create: {
                    roomNumber,
                    floor: '1',
                    status: 'AVAILABLE',
                    roomTypeId: createdRt.id,
                }
            });
        }
    }

    console.log('Seed completed rooms and rate plans');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
