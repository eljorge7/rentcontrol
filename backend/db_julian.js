const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const t = await prisma.user.findFirst({ where: { name: 'Julian Hurtado' }});
  if(!t) return console.log("User not found");
  const tenant = await prisma.tenant.findFirst({ where: { userId: t.id }, include: { leases: { include: { charges: true } } }});
  if(!tenant) return console.log("Tenant not found");
  console.log(JSON.stringify(tenant.leases, null, 2));
}
run().finally(() => process.exit(0));
