const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const tenants = await prisma.tenant.findMany({ include: { leases: { include: { unit: true } } } });
  console.log(JSON.stringify(tenants, null, 2));
}

test().catch(console.error).finally(() => prisma.$disconnect());
