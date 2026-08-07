const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.leave_requests.findMany({ include: { employee: { include: { department: true } } } }).then(l => {
  console.log(JSON.stringify(l[0]?.employee, null, 2));
  prisma.$disconnect();
});
