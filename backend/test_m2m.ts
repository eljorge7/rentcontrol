const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("Creando datos de prueba para facturar...");
  
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) return;

  await prisma.tenant.update({ where: { id: tenant.id }, data: { requiresInvoice: true, rfc: 'XAXX010101000' } });

  let lease = await prisma.lease.findFirst({ where: { tenantId: tenant.id } });
  if (!lease) {
      lease = await prisma.lease.create({
          data: {
              tenantId: tenant.id,
              unitId: (await prisma.unit.findFirst()).id,
              startDate: new Date(),
              endDate: new Date(),
              rentAmount: 1000,
              paymentDay: 1,
              status: 'ACTIVE'
          }
      });
  }

  const charge = await prisma.charge.create({
    data: {
       leaseId: lease.id,
       amount: 1160,
       status: 'PENDING',
       type: 'RENT',
       description: 'Prueba M2M Factura',
       date: new Date(),
       dueDate: new Date()
    }
  });

  const payment = await prisma.payment.create({
    data: {
       chargeId: charge.id,
       amount: 1160,
       date: new Date(),
       method: 'STRIPE'
    }
  });

  console.log("Pago Registrado: ", payment.id);
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
