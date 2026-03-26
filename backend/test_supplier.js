const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  
  try {
    const res = await prisma.supplier.create({
      data: {
        name: "Test Name",
        contactName: "",
        phone: "",
        email: "",
        category: "PLUMBING",
        managerId: adminUser ? adminUser.id : undefined
      }
    });
    console.log("Success:", res);
  } catch (e) {
    console.error("Prisma Error:", e);
  }
}

main().finally(() => prisma.$disconnect());
