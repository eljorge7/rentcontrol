const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!user) return console.log('not found');
  console.log('Found user:', user.id);
  
  try {
    const res = await prisma.user.update({
      where: { id: user.id },
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
