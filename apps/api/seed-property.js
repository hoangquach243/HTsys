const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    let property = await prisma.property.findFirst();
    if (!property) {
        property = await prisma.property.create({
            data: {
                id: 'clouq2m1q00003b6w5z8s6xy9',
                name: 'My Awesome Hotel',
                phone: '0123456789',
                email: 'hello@awesomehotel.com',
                address: '123 Fake Street, City, Country',
            }
        });
        console.log('Created Property:', property);
    } else {
        console.log('Property exists:', property);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
