const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst({ where: { name: { contains: 'Julian Hurtado' } } });
  if (!tenant) return console.log('not found');
  
  console.log('Found tenant:', tenant.id);
  
  try {
    const res = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        requiresInvoice: true,
        rfc: 'HUCJ870112XX1',
        zipCode: '85000',
        taxRegimen: '626',
        taxDocumentUrl: 'http://test.com'
      }
    });
    console.log('Update success:', res);
  } catch(e) {
    console.error('Update failed:', e);
  }
}
main().finally(() => prisma.$disconnect());
