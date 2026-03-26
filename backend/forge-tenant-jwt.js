const http = require('http');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst({ where: { name: { contains: 'Julian Hurtado' } }, include: { user: true } });
  if(!tenant || !tenant.user) return console.log('Tenant or User not found!');

  const user = tenant.user;
  const payload = { email: user.email, sub: user.id, role: user.role, name: user.name };
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
    path: '/tenants/' + tenant.id,
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
