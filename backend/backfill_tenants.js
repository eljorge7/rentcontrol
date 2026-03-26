const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function backfillTenants() {
  const tenants = await prisma.tenant.findMany({
    where: { userId: null }
  });

  console.log(`Found ${tenants.length} tenants without a User account.`);

  for (const tenant of tenants) {
    const hashedPassword = await bcrypt.hash('RentControl2026', 10);
    const user = await prisma.user.create({
      data: {
        email: tenant.email,
        name: tenant.name,
        password: hashedPassword,
        role: 'TENANT',
      }
    });

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { userId: user.id }
    });

    console.log(`Generated login account for: ${tenant.name} (${tenant.email})`);
  }

  console.log('Done mapping existing tenants.');
}

backfillTenants()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  });
