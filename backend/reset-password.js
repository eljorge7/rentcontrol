const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log("=== RESETEANDO PASSWORD DEL OWNER ===");
  const hashedPassword = await bcrypt.hash('RentControl2026', 10);
  
  const owner = await prisma.user.update({
    where: { email: 'owner@rentcontrol.com' },
    data: { password: hashedPassword }
  });

  console.log(`Password for ${owner.email} has been reset to: RentControl2026`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
