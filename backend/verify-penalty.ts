import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const penalties = await prisma.charge.findMany({
    where: { type: 'PENALTY', description: { contains: 'Morosidad' } },
    orderBy: { createdAt: 'desc' },
    take: 1
  });

  if (penalties.length > 0) {
    console.log('SUCCESS! Penalty charge was generated automatically:');
    console.log(`Amount: $${penalties[0].amount}`);
    console.log(`Description: ${penalties[0].description}`);
  } else {
    console.log('No penalty charges found yet. Wait a few more seconds and retry...');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
