const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const nelson = await prisma.user.findFirst({ where: { name: { contains: 'Nelson', mode: 'insensitive' } } });
  console.log('Nelson found:', nelson?.name, 'ID:', nelson?.id);

  if (!nelson) return console.log('Nelson not found');

  const pendingCommissions = await prisma.commission.findMany({
    where: { managerId: nelson.id, status: 'PENDING' }
  });
  console.log('Pending commissions count:', pendingCommissions.length);

  try {
    const totalAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
    console.log('Total Amount:', totalAmount);

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
    console.log('Payroll created:', payroll.id);
  } catch (err) {
    console.error('ERROR during payroll creation:', err);
  }
}
main().finally(() => prisma.$disconnect());
