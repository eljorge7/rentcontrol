const { PrismaClient } = require('@prisma/client');
async function main() {
  const prisma = new PrismaClient({datasources: {db: {url: 'postgresql://rentadmin:admin123@localhost:5432/omnichat?schema=public'}}});
  await prisma.$executeRawUnsafe(`UPDATE "User" SET password = 'R@diotec' WHERE email = 'admin@omnichat.com' OR email = 'eljorge7@gmail.com'`);
  console.log("Passwords set to plaintext 'R@diotec'");
  await prisma.$disconnect();
}
main().catch(console.error);
