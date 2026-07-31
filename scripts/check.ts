import prisma from '../prismaClient';

async function main() {
  const profiles = await prisma.profiles.findMany({
    select: { email: true, role: true, verification_status: true }
  });
  console.log(profiles);
}

main()
  .catch(e => console.error(e))
  .then(() => prisma.$disconnect());
