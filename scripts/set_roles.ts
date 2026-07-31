import prisma from '../prismaClient';

async function main() {
  const admins = [
    'gyanani.harish@gmail.com',
    'qapil.sharma1702@gmail.com',
    'kamlani.vijay@gmail.com'
  ];
  const hr = 'kanjaniprerna1@gmail.com';

  console.log("Updating roles in the database...");

  // 1. Set everyone else to employee
  const resEmployees = await prisma.profiles.updateMany({
    where: {
      email: {
        notIn: [...admins, hr]
      }
    },
    data: { role: 'employee' }
  });
  console.log(`Updated ${resEmployees.count} users to 'employee'.`);

  // 2. Set admins
  const resAdmins = await prisma.profiles.updateMany({
    where: {
      email: {
        in: admins
      }
    },
    data: { role: 'admin' }
  });
  console.log(`Updated ${resAdmins.count} users to 'admin'.`);

  // 3. Set HR
  const resHr = await prisma.profiles.updateMany({
    where: {
      email: hr
    },
    data: { role: 'hr' }
  });
  console.log(`Updated ${resHr.count} users to 'hr'.`);

  console.log("All roles have been set successfully!");
}

main()
  .catch(e => console.error(e))
  .then(() => prisma.$disconnect());
