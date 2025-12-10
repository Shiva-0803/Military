import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Bases
    console.log('Seeding Bases...');
    const baseAlpha = await prisma.base.upsert({
        where: { name: 'Fort Alpha' },
        update: {},
        create: {
            name: 'Fort Alpha',
            location: 'Nevada, USA',
        },
    });

    const baseBravo = await prisma.base.upsert({
        where: { name: 'Outpost Bravo' },
        update: {},
        create: {
            name: 'Outpost Bravo',
            location: 'Helmand, Afghanistan',
        },
    });

    // 2. Create Asset Types
    console.log('Seeding Asset Types...');
    const m4Carbine = await prisma.assetType.upsert({
        where: { name: 'M4 Carbine' },
        update: {},
        create: {
            name: 'M4 Carbine',
            description: 'Standard issue assault rifle',
        },
    });

    const m1Abrams = await prisma.assetType.upsert({
        where: { name: 'M1 Abrams' },
        update: {},
        create: {
            name: 'M1 Abrams',
            description: 'Main Battle Tank',
        },
    });

    const ammo556 = await prisma.assetType.upsert({
        where: { name: '5.56mm Ammo Crate' },
        update: {},
        create: {
            name: '5.56mm Ammo Crate',
            description: 'Crate containing 1000 rounds',
        },
    });

    // 3. Create Users
    console.log('Seeding Users...');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // Admin
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password,
            role: Role.ADMIN,
        },
    });

    // Commander Alpha
    await prisma.user.upsert({
        where: { username: 'commander_alpha' },
        update: {},
        create: {
            username: 'commander_alpha',
            password,
            role: Role.BASE_COMMANDER,
            baseId: baseAlpha.id,
        },
    });

    // Logistics Alpha
    await prisma.user.upsert({
        where: { username: 'logistics_alpha' },
        update: {},
        create: {
            username: 'logistics_alpha',
            password,
            role: Role.LOGISTICS_OFFICER,
            baseId: baseAlpha.id,
        },
    });

    // Commander Bravo
    await prisma.user.upsert({
        where: { username: 'commander_bravo' },
        update: {},
        create: {
            username: 'commander_bravo',
            password,
            role: Role.BASE_COMMANDER,
            baseId: baseBravo.id,
        },
    });

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
