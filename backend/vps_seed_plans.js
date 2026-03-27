const { Client } = require('ssh2');

const conn = new Client();
const config = {
  host: '137.184.155.133',
  port: 22,
  username: 'root',
  password: 'ELj@rge79137h'
};

const scriptContent = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Network Profiles (Internet Plans)...');
  await prisma.networkProfile.createMany({
    data: [
      { name: 'Plan Básico', downloadSpeed: 20, uploadSpeed: 5, price: 349 },
      { name: 'Plan Familiar', downloadSpeed: 50, uploadSpeed: 20, price: 499 },
      { name: 'Plan Gamer Pro', downloadSpeed: 100, uploadSpeed: 50, price: 799 }
    ]
  });

  console.log('Seeding Management Plans (SaaS)...');
  await prisma.managementPlan.createMany({
    data: [
      { name: 'SaaS Básico', description: 'Acceso a plataforma para autogestión', commission: 0, fixedFee: 499, maxProperties: 2 },
      { name: 'SaaS Pro', description: 'Plataforma + Webhooks ilimitados', commission: 0, fixedFee: 999, maxProperties: 10 },
      { name: 'Gestión Delegada (Agencia)', description: 'Nosotros operamos, tú descansas', commission: 10, fixedFee: 0, maxProperties: 50 }
    ]
  });

  console.log('Seed completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
`;

const setupCommands = `
  cd /root/rentcontrol/backend
  cat << 'EOF' > seed_plans.js
${scriptContent}
EOF
  docker cp seed_plans.js rentcontrol-backend:/app/seed_plans.js
  docker exec rentcontrol-backend node seed_plans.js
`;

console.log('Connecting to VPS to seed plans...');

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(setupCommands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('error', (err) => {
  console.error('Connection error:', err);
}).connect(config);
