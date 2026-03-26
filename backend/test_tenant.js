const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Revisando los Tenants que contienen 'Sebastian'...");
  const tenants = await prisma.tenant.findMany({
    where: { name: { contains: 'ebastian' } },
    include: {
      leases: {
        include: { unit: { include: { property: true } } }
      },
      user: true
    }
  });
  console.log(JSON.stringify(tenants, null, 2));
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
