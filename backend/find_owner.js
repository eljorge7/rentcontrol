const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({datasources: {db: {url: 'postgresql://rentadmin:admin123@localhost:5432/rentcontrol?schema=public'}}});
async function main() {
  const user = await prisma.user.findFirst({where: {name: 'Jesús Hurtado Cota'}});
  console.log(user.email);
}
main().finally(() => prisma.$disconnect());
