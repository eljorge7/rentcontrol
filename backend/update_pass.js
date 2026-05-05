const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient({datasources: {db: {url: 'postgresql://rentadmin:admin123@localhost:5432/rentcontrol?schema=public'}}});
async function main() {
  const hashedPassword = await bcrypt.hash('R@diotec', 10);
  await prisma.user.update({
    where: { email: 'jesus.hurtado@rentcontrol.com' },
    data: { password: hashedPassword }
  });
  console.log('Password updated');
}
main().finally(() => prisma.$disconnect());
