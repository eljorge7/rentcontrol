import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando Módulos en el Motor...');

  // 1. Crear FacturaPro
  const facturapro = await prisma.softwareApp.upsert({
    where: { slug: 'facturapro' },
    update: {},
    create: {
      name: 'FacturaPro',
      slug: 'facturapro',
      description: 'Facturación Electrónica CFDI 4.0 automatizada con módulo de gastos.',
      iconUrl: 'factura_icon.png',
      tiers: {
        create: [
          {
            name: 'Emprendedor',
            monthlyPrice: 199,
            annualPrice: 1990,
            monthlyStamps: 50,
            featuresJson: ['Buzón Fiscal Basico', 'Soporte Email'],
            hasExpenseControl: false,
            hasApiAccess: false,
          },
          {
            name: 'PyME',
            monthlyPrice: 499,
            annualPrice: 4990,
            monthlyStamps: 300,
            featuresJson: ['Buzón Fiscal', 'Panel de Gastos Premium', 'Soporte Prioritario'],
            hasExpenseControl: true,
            hasApiAccess: false,
          },
          {
            name: 'Corporativo',
            monthlyPrice: 999,
            annualPrice: 9990,
            monthlyStamps: -1,
            featuresJson: ['Todo Ilimitado', 'Buzón Fiscal', 'API'],
            hasExpenseControl: true,
            hasApiAccess: true,
          }
        ]
      }
    }
  });

  console.log('App lista:', facturapro.name);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
