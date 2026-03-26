const http = require('http');

async function main() {
  const loginData = JSON.stringify({ email: 'julian.hurtado@gmail.com', password: 'RentControl2026' });

  const loginReq = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
  }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', async () => {
      const response = JSON.parse(body);
      const token = response.access_token;
      console.log('Got token:', token ? 'YES' : 'NO');
      
      const payload = JSON.stringify({
        requiresInvoice: true,
        rfc: "HUCJ870112XX1",
        taxRegimen: "626",
        zipCode: "85000",
        taxDocumentUrl: null
      });

      const patchReq = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/tenants/eeb8cfd0-c923-4633-b848-9486eb2020a0',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'Authorization': 'Bearer ' + token
        }
      }, patchRes => {
        let patchBody = '';
        patchRes.on('data', d => patchBody += d);
        patchRes.on('end', () => {
          console.log('PATCH response code:', patchRes.statusCode);
          console.log('PATCH response body:', patchBody);
        });
      });
      patchReq.write(payload);
      patchReq.end();
    });
  });
  
  loginReq.write(loginData);
  loginReq.end();
}
main();
