const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const prisma = new PrismaClient();

async function test() {
  const lease = await prisma.lease.findFirst({
    include: {
      tenant: true,
      unit: { include: { property: { include: { owner: true } } } },
    }
  });

  if (!lease) return console.log('No lease found');
  
  console.log("Found lease:", lease.id);
  console.log("Unit:", lease.unit ? lease.unit.name : "null");
  console.log("Property:", lease.unit && lease.unit.property ? lease.unit.property.name : "null");
  console.log("Owner:", lease.unit && lease.unit.property && lease.unit.property.owner ? lease.unit.property.owner.name : "null");
  console.log("Tenant:", lease.tenant ? lease.tenant.name : "null");

  // Try generating PDF
  const doc = new PDFDocument({ margin: 50 });
  const output = fs.createWriteStream('./test.pdf');
  doc.pipe(output);

  doc.fontSize(20).text('Contrato de Arrendamiento', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(12)
     .text(`CONTRATO DE ARRENDAMIENTO QUE CELEBRAN POR UNA PARTE C. ${lease.unit.property.owner.name.toUpperCase()}, A QUIEN EN LO SUCESIVO SE LE DENOMINARA "EL ARRENDADOR".`, { align: 'justify' });
  
  doc.end();
  console.log("PDF generation test passed.");
}

test().catch(console.error).finally(() => prisma.$disconnect());
