const http = require('http');
const jwt = require('jsonwebtoken'); // we must install or just require if it's there
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if(!admin) return console.log('Admin not found!');

  const payload = { email: admin.email, sub: admin.id, role: admin.role, name: admin.name };
  const token = jwt.sign(payload, 'super_secret_key_rentcontrol', { expiresIn: '7d' });

  const patchPayload = JSON.stringify({
    requiresInvoice: true,
    rfc: "HUCJ870112XX1",
    taxRegimen: "626",
    zipCode: "85000",
    taxDocumentUrl: null
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/users/my-profile/tax',
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(patchPayload),
      'Authorization': 'Bearer ' + token
    }
  }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log('STATUS:', res.statusCode);
      console.log('BODY:', body);
    });
  });
  
  req.write(patchPayload);
  req.end();
}
main();
