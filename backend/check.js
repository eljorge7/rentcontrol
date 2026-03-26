const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const nelson = await prisma.user.findFirst({ where: { name: { contains: 'Nelson', mode: 'insensitive' } } });
  
  const pendingCommissions = await prisma.commission.findMany({
    where: { managerId: nelson.id, status: 'PENDING' }
  });
  console.log('Pending commissions for Nelson:', pendingCommissions.length);

  const testPayrolls = await prisma.payroll.findMany({
    where: { managerId: nelson.id }
  });
  console.log('Payrolls for Nelson:', testPayrolls.length);
}
main().finally(() => prisma.$disconnect());
