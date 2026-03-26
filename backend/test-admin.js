const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    console.log('Admin Email:', admin.email);
  } catch (err) { } finally { await prisma.$disconnect(); }
}
check();
