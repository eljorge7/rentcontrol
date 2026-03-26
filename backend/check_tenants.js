const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const tenants = await prisma.tenant.findMany({
    include: {
      owner: { select: { name: true } }
    }
  });
  console.log(JSON.stringify(tenants, null, 2));
  await prisma.$disconnect();
}

main().catch(e => console.error(e));
