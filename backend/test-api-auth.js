const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) return console.log('Admin not found');

  const token = jwt.sign({ userId: admin.id, email: admin.email, role: admin.role }, 'super_secret_key_rentcontrol');

  const nelson = await prisma.user.findFirst({ where: { name: { contains: 'Nelson', mode: 'insensitive' } } });

  console.log('Testing endpoint for Nelson:', nelson.id);

  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch('http://localhost:3001/commissions/payout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ managerId: nelson.id })
    });
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', text);
  } catch (err) {
    console.log('HTTP ERROR:', err.message);
  }
}
main().finally(() => prisma.$disconnect());
