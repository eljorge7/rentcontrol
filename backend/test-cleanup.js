const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  try {
    const badCommissions = await prisma.commission.findMany({
      where: {
        payment: {
          charge: { 
            type: { in: ['DEPOSIT', 'DEPOSITO'] }
          }
        }
      }
    });
    console.log('Bad commissions found:', badCommissions.length);
    let count = 0;
    for(let c of badCommissions) {
      await prisma.commission.delete({ where: { id: c.id } });
      count++;
    }
    console.log(`Deleted ${count} invalid commissions.`);
  } catch(e) {
    console.log("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
clean();
