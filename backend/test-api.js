const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testApi() {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) { console.log('No admin found'); return; }

    const payload = { sub: admin.id, email: admin.email, role: admin.role, userId: admin.id }; // Nest Auth Strategy often expects userId instead of sub! 
    const secret = process.env.JWT_SECRET || 'super_secret_key_rentcontrol'; 
    const token = jwt.sign(payload, secret);
    
    console.log("Generated Token:", token.substring(0, 10));
    const headers = { Authorization: `Bearer ${token}` };

    const mgrRes = await fetch('http://localhost:3001/users/managers', { headers });
    if (!mgrRes.ok) console.error('Managers Fail:', await mgrRes.text());
    else { const mgrData = await mgrRes.json(); console.log('Managers OK:', mgrData.length); }

    const evtRes = await fetch('http://localhost:3001/event-types', { headers });
    if (!evtRes.ok) console.error('Events Fail:', await evtRes.text());
    else { const evtData = await evtRes.json(); console.log('Events OK:', evtData.length); }

  } catch (err) {
    console.log("Script failed", err.message);
  } finally { await prisma.$disconnect(); }
}
testApi();
