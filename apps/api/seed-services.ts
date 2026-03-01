import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Services...');
    const propId = 'clouq2m1q00003b6w5z8s6xy9';
    await prisma.service.create({
        data: {
            name: 'Nước suối',
            price: 15000,
            group: 'Minibar',
            propertyId: propId,
            type: 'SERVICE'
        }
    });
    await prisma.service.create({
        data: {
            name: 'Giặt ủi',
            price: 50000,
            group: 'Dịch vụ',
            propertyId: propId,
            type: 'SERVICE'
        }
    });
    console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
