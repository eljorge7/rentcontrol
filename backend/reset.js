const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const nelson = await prisma.user.findFirst({ where: { name: { contains: 'Nelson', mode: 'insensitive' } } });
  
  // Set all of Nelson's commissions back to PENDING and payrollId to null
  await prisma.commission.updateMany({
    where: { managerId: nelson.id },
    data: { status: 'PENDING', payrollId: null }
  });

  // Delete all payrolls for Nelson
  await prisma.payroll.deleteMany({
    where: { managerId: nelson.id }
  });

  console.log('Reset complete!');
}
main().finally(() => prisma.$disconnect());
