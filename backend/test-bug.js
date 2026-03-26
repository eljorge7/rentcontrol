const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const managers = await prisma.user.findMany({ where: { role: 'MANAGER' } });
    console.log('Managers:', managers.length);

    const eventTypes = await prisma.eventType.findMany();
    console.log('Event types:', eventTypes.length);

    // Try creating one just to be sure
    const newEvent = await prisma.eventType.create({
      data: {
        name: 'Test Event ' + Date.now(),
        basePrice: 150
      }
    });
    console.log('Created Event:', newEvent.id);

  } catch (err) {
    console.error('Prisma Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
check();
