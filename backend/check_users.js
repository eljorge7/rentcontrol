const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({ where: { role: 'TENANT' } });
  const tenants = await prisma.tenant.findMany();
  
  // Find users without a corresponding tenant
  const orphanUsers = users.filter(u => !tenants.some(t => t.email === u.email || t.userId === u.id));
  
  console.log("Orphan Users found:", orphanUsers.length);
  orphanUsers.forEach(u => console.log(" -", u.email, u.name));
  
  process.exit(0);
}
check().catch(console.error);
