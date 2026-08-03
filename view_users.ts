import prisma from './prismaClient';

async function main() {
    const users = await prisma.profiles.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            full_name: true,
            verification_status: true
        }
    });
    console.table(users);
    await prisma.$disconnect();
}

main().catch(console.error);
