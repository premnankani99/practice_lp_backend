import prisma from './prismaClient';
async function test() {
    try {
        const p = await prisma.profiles.findMany({
            where: { is_deleted: false, email_verified: true }
        });
        console.log('Success:', p.length);
    } catch(e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
