const { PrismaClient } = require('@prisma/client');
async function run() {
  const prisma = new PrismaClient();
  const tenants = await prisma.tenant.findMany({
    orderBy: { id: 'desc' },
    take: 3
  });
  console.log("=== ÚLTIMOS 3 INQUILINOS EN RENTCONTROL ===");
  console.log(tenants);
  await prisma.$disconnect();
}
run();
