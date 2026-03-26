const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const wisp = await prisma.networkProfile.findMany();
  const saas = await prisma.managementPlan.findMany();
  
  console.log("WISP Plans:", JSON.stringify(wisp, null, 2));
  console.log("SaaS Plans:", JSON.stringify(saas, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
