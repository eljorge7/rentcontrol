const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const expenses = await prisma.expense.findMany({ where: { description: { contains: 'google', mode: 'insensitive' } } }); 
  console.log('Expenses:', expenses); 
  const suppliers = await prisma.supplier.findMany({ where: { name: { contains: 'google', mode: 'insensitive' } } }); 
  console.log('Suppliers:', suppliers);
}

main().finally(() => prisma.$disconnect());
