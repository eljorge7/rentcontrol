const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const owners = await prisma.user.findMany({ where: { role: 'OWNER' } });
    console.log(`Found ${owners.length} owners in DB.`);
    owners.forEach(o => console.log(`- ${o.name} (Manager: ${o.managerId})`));
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
check();
