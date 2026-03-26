const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const charges = await prisma.charge.findMany();
  console.log("Charges:", charges.map(c => ({ amount: c.amount, type: c.type, desc: c.description })));
  
  const leases = await prisma.lease.findMany();
  console.log("Leases:", leases.map(l => ({ id: l.id, rent: l.rentAmount })));
}
run().catch(console.error).finally(() => process.exit(0));
