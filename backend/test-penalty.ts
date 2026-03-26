import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find an active lease
  const lease = await prisma.lease.findFirst({
    where: { status: 'ACTIVE' }
  });

  if (!lease) {
    console.log('No active leases found to test.');
    return;
  }

  // Configure late fees
  await prisma.lease.update({
    where: { id: lease.id },
    data: { lateFeeAmount: 499.99, gracePeriodDays: 3 }
  });

  console.log(`Configured lease ${lease.id} with $499.99 late fee and 3 days grace.`);

  // Create an overdue charge (6 days ago -> 6 > 3 so it should trigger)
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 6);

  const charge = await prisma.charge.create({
    data: {
      leaseId: lease.id,
      amount: 5000,
      type: 'RENT',
      status: 'PENDING',
      dueDate: pastDate,
      description: 'TEST MOROSIDAD - Renta Vencida'
    }
  });

  console.log('Created overdue charge:', charge.id);
  console.log('The running backend cron should detect this within 1 minute.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
