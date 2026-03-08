import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up existing data...');
    // Delete existing data to prevent duplicates
    await prisma.vehicle.deleteMany();
    await prisma.visitorLog.deleteMany();
    await prisma.otp.deleteMany();
    await prisma.user.deleteMany();
    await prisma.flat.deleteMany();
    await prisma.society.deleteMany();

    console.log('Seeding data...');

    // Create Superadmin
    const superadmin = await prisma.user.create({
        data: {
            email: 'superadmin@mancom.com',
            password: 'password123', // In real app should be hashed
            name: 'Super Admin',
            phone: '+910000000000',
            role: 'SUPERADMIN',
        },
    });
    console.log(`Created Superadmin: ${superadmin.email}`);

    const apartments = [
        { name: 'Prestige Lakeside Habitat', city: 'Bangalore' },
        { name: 'Sobha City', city: 'Gurgaon' },
        { name: 'Lodha Bellezza', city: 'Hyderabad' },
    ];

    for (let apt of apartments) {
        const society = await prisma.society.create({
            data: {
                name: apt.name,
                city: apt.city,
                address: `${apt.name} Main Road, ${apt.city}`,
            },
        });

        console.log(`Created Society: ${society.name}`);

        // Create 3 Admins
        for (let i = 1; i <= 3; i++) {
            await prisma.user.create({
                data: {
                    email: `admin${i}@${society.name.replace(/\s+/g, '').toLowerCase()}.com`,
                    password: 'password123',
                    name: `${society.name} Admin ${i}`,
                    phone: `+91${i}00000000${society.id.substring(0, 2)}`,
                    role: 'ADMIN',
                    societyId: society.id,
                }
            });
        }

        // Create 400 Users (and 400 flats)
        console.log(`Creating 400 users for ${society.name}...`);

        // Process in batches so we don't hold too much memory / query limits
        const BATCH_SIZE = 100;
        for (let b = 0; b < 400; b += BATCH_SIZE) {
            const flatPromises = [];
            for (let i = 0; i < BATCH_SIZE; i++) {
                const flatNumber = `Block-${String.fromCharCode(65 + (Math.floor((b + i) / 100)) % 26)}-${(b + i + 1)}`;
                flatPromises.push(
                    prisma.flat.create({
                        data: {
                            number: flatNumber,
                            societyId: society.id,
                        }
                    })
                );
            }

            const createdFlats = await Promise.all(flatPromises);

            const userPromises = createdFlats.map((flat, index) => {
                const globalIndex = b + index;
                return prisma.user.create({
                    data: {
                        email: `user${globalIndex}@${society.name.replace(/\s+/g, '').toLowerCase()}.com`,
                        password: 'password123',
                        name: `User ${globalIndex} of ${society.name}`,
                        phone: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
                        role: 'USER',
                        societyId: society.id,
                        flatId: flat.id,
                    }
                });
            });
            await Promise.all(userPromises);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
