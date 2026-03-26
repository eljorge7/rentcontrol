const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const words = ['Nelson'];
  console.log("Searching for Nelson...");

  const users = await prisma.user.findMany({ where: { name: { contains: 'Nelson', mode: 'insensitive' } } });
  if (users.length > 0) console.log("Found in Users:", users);

  const tenants = await prisma.tenant.findMany({ where: { name: { contains: 'Nelson', mode: 'insensitive' } } });
  if (tenants.length > 0) console.log("Found in Tenants:", tenants);

  const properties = await prisma.property.findMany({ where: { name: { contains: 'Nelson', mode: 'insensitive' } } });
  if (properties.length > 0) console.log("Found in Properties:", properties);

  const units = await prisma.unit.findMany({ where: { name: { contains: 'Nelson', mode: 'insensitive' } } });
  if (units.length > 0) console.log("Found in Units:", units);
  
  const suppliers = await prisma.supplier.findMany({ where: { name: { contains: 'Nelson', mode: 'insensitive' } } });
  if (suppliers.length > 0) console.log("Found in Suppliers:", suppliers);
}
main().finally(() => prisma.$disconnect());
