const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const rawTenants = await prisma.tenant.findMany({
      where: { name: { contains: 'Nelson', mode: 'insensitive' } },
      include: {
        leases: {
          include: {
            charges: {
              include: {
                payments: {
                  include: { invoice: true }
                }
              }
            }
          }
        }
      }
    });

    console.dir(rawTenants, { depth: null });
  } catch (error) {
    console.error(error);
  }
}

main().finally(() => prisma.$disconnect());
