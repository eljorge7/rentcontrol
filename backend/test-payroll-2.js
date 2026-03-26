const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const nelson = await prisma.user.findFirst({ where: { name: { contains: 'Nelson', mode: 'insensitive' } } });
  
  const pendingCommissions = await prisma.commission.findMany({
    where: { managerId: nelson.id, status: 'PENDING' }
  });
  console.log('Pending commissions:', pendingCommissions.length);
  if (pendingCommissions.length === 0) return;

  const totalAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);

  try {
    const payroll = await prisma.payroll.create({
      data: {
        managerId: nelson.id,
        totalAmount,
        status: 'PAID',
        commissions: {
          connect: pendingCommissions.map(c => ({ id: c.id }))
        }
      }
    });

    console.log('Created Payroll:', payroll.id);

    // Step 3: updateMany
    const updateResult = await prisma.commission.updateMany({
      where: { managerId: nelson.id, status: 'PENDING' },
      data: { status: 'PAID', payrollId: payroll.id }
    });
    console.log('Update result:', updateResult);

  } catch (err) {
    console.error('ERROR during updateMany:', err);
  }
}
main().finally(() => prisma.$disconnect());
