const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const managerId = 'd758a7c8-12c0-4b4c-8a39-5e05d7ad6f76'; // Nelson
  
  try {
    const pendingCommissions = await prisma.commission.findMany({
      where: { managerId, status: 'PENDING' }
    });

    if (pendingCommissions.length === 0) {
      console.log('No pending commissions.');
      return;
    }

    const totalAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);

    console.log("Creating payroll...");
    const payroll = await prisma.payroll.create({
      data: {
        managerId,
        totalAmount,
        status: 'PAID',
        commissions: {
          connect: pendingCommissions.map(c => ({ id: c.id }))
        }
      }
    });

    console.log("Success payroll:", payroll.id);

    console.log("Updating commissions to PAID...");
    const rr = await prisma.commission.updateMany({
      where: { managerId, status: 'PENDING' },
      data: { status: 'PAID', payrollId: payroll.id }
    });
    console.log("Updated rows:", rr);

  } catch(e) {
    console.error("FATAL ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
