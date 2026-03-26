const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  try {
    const res = await prisma.user.delete({ where: { email: 'julian.hurtado@gmail.com' } });
    console.log("Deleted orphan user:", res.email);
  } catch (err) {
    if (err.code === 'P2025') console.log("User already deleted.");
    else console.error(err);
  }
}
clean().finally(() => process.exit(0));
