const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const plans = await prisma.managementPlan.findMany();
    console.log("--- MANAGEMENT PLANS ---");
    console.log(JSON.stringify(plans, null, 2));

    const eventTypes = await prisma.eventType.findMany();
    console.log("--- EVENT TYPES ---");
    console.log(JSON.stringify(eventTypes, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
