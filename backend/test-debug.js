const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function trace() {
  const owner = await prisma.user.findFirst({ where: { email: 'eljorge7@gmail.com' } });
  if (!owner) return console.log('Owner eljorge7@gmail.com not found');

  const payments = await prisma.payment.findMany({
    where: {
      ownerPayoutId: null,
      charge: { lease: { unit: { property: { ownerId: owner.id } } } }
    },
    include: { commission: true, charge: true }
  });
  
  console.log(`Transactions for ${owner.name}:`);
  payments.forEach(p => {
    console.log(`Payment ID: ${p.id} | Amount: $${p.amount} | Charge Type: ${p.charge.type} | Date: ${p.date.toDateString()}`);
    if (p.commission) {
      const totalCom = p.commission.amount + p.commission.systemFee;
      console.log(`  -> Commission: +$${p.commission.amount} (Manager) + $${p.commission.systemFee} (System) = $${totalCom} Total`);
    } else {
      console.log(`  -> No Commission generated.`);
    }
  });
}
trace().finally(() => prisma.$disconnect());
