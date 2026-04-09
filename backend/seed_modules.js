const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Premium Modules...");

  // FacturaPro
  const fpApp = await prisma.softwareApp.upsert({
    where: { slug: 'facturapro' },
    update: {},
    create: {
      name: 'FacturaPro',
      slug: 'facturapro',
      description: 'Facturación Electrónica CFDI 4.0 con complementos de pago.',
      iconUrl: '/facturamente-logo.png',
      tiers: {
        create: [
          {
            name: 'Emprendedor',
            monthlyPrice: 299,
            annualPrice: 2990,
            monthlyStamps: 50,
            overageMarginPct: 0.1, // 10% tolerance is 5 invoices
            featuresJson: ['50 facturas mensuales', 'Catálogo de clientes', 'Reporte básico'],
            hasExpenseControl: false,
            hasApiAccess: false
          },
          {
            name: 'PyME',
            monthlyPrice: 699,
            annualPrice: 6990,
            monthlyStamps: 300,
            overageMarginPct: 0.1, 
            featuresJson: ['300 facturas mensuales', 'Módulo Web de Gastos', 'Conciliación contable'],
            hasExpenseControl: true,
            hasApiAccess: false
          },
          {
            name: 'Corporativo',
            monthlyPrice: 1499,
            annualPrice: 14990,
            monthlyStamps: 2000,
            overageMarginPct: 0.1,
            featuresJson: ['2000 facturas mensuales', 'Acceso a API M2M (B2B)', 'Multiusuario'],
            hasExpenseControl: true,
            hasApiAccess: true
          }
        ]
      }
    }
  });

  // OmniChat
  const ocApp = await prisma.softwareApp.upsert({
    where: { slug: 'omnichat' },
    update: {},
    create: {
      name: 'OmniChat M2M',
      slug: 'omnichat',
      description: 'CRM conversacional de múltiples canales de WhatsApp con bots IA.',
      iconUrl: '/omnichat-logo.png',
      tiers: {
        create: [
          {
            name: 'Agencia',
            monthlyPrice: 499,
            annualPrice: 4990,
            monthlyStamps: -1, // Ilimitado de mensajes, pero quizas de leads
            overageMarginPct: 0.0,
            featuresJson: ['Bandeja Compartida', 'Respuestas automáticas', 'Ilimitados prospectos'],
            hasExpenseControl: false,
            hasApiAccess: true
          }
        ]
      }
    }
  });

  console.log("Seeded successfully:", fpApp.slug, ocApp.slug);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
