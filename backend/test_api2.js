const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const charges = await prisma.charge.findMany({});
  console.log("All charges:");
  console.dir(charges);

  const nelsonCharge = charges.find(c => c.id === 'e4b600d8-0b5c-42b7-a367-20ab96dbdcaf');
  if(nelsonCharge) console.log("Found explicitly!");
}
main();
