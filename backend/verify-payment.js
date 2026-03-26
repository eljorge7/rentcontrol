const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== VERIFICANDO ÚLTIMO PAGO ===");
  const latestPayment = await prisma.payment.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      charge: {
        include: {
          lease: {
            include: {
              tenant: true,
              unit: { include: { property: { include: { owner: true } } } }
            }
          }
        }
      },
      commission: {
        include: {
          platformEarning: true
        }
      }
    }
  });

  if (!latestPayment) {
    console.log("No se encontraron pagos recientes.");
    return;
  }

  console.log("\n1. PAGO REALIZADO:");
  console.log(`- Inquilino: ${latestPayment.charge.lease.tenant.name}`);
  console.log(`- Local: ${latestPayment.charge.lease.unit.name} (${latestPayment.charge.lease.unit.property.name})`);
  console.log(`- Monto Pagado: $${latestPayment.amount}`);
  console.log(`- Tipo de Cargo: ${latestPayment.charge.type}`);

  console.log("\n2. DISTRIBUCIÓN DEL DINERO:");
  if (latestPayment.commission) {
    const sysFee = latestPayment.commission.platformEarning?.amount || 0;
    const netG = latestPayment.commission.amount;
    const gross = sysFee + netG;
    const ownerRev = latestPayment.amount - gross;

    console.log(`- Comisión Bruta Gestor: $${gross}`);
    console.log(`- Ingreso Plataforma RentControl (Fee 15%): $${sysFee}`);
    console.log(`- Ingreso Neto Gestor: $${netG}`);
    console.log(`- Ingreso del Propietario: $${ownerRev}`);
    console.log(`- Estado Comisión de Gestor: ${latestPayment.commission.status}`);
  } else {
    console.log(`- No se generó comisión. El 100% va al Propietario: $${latestPayment.amount}`);
  }

  console.log("\n3. FACTURACIÓN Y TRIBUTACIÓN:");
  console.log(`- Requiere Factura el Inquilino?: ${latestPayment.charge.lease.tenant.requiresInvoice ? 'SÍ' : 'NO'}`);
  if (latestPayment.charge.lease.tenant.requiresInvoice) {
    console.log(`- RFC Registrado: ${latestPayment.charge.lease.tenant.rfc}`);
    console.log(`- Régimen Fiscal: ${latestPayment.charge.lease.tenant.taxRegimen}`);
    console.log(`- CP: ${latestPayment.charge.lease.tenant.zipCode}`);
    console.log(`- Archivo (CSF): ${latestPayment.charge.lease.tenant.taxDocumentUrl || 'Ninguno'}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
