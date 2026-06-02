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
  console.log('Borrando Management Plans antiguos...');
  await prisma.managementPlan.deleteMany({});

  console.log('Insertando nuevos Management Plans (Estrategia Hibrida)...');
  await prisma.managementPlan.createMany({
    data: [
      { name: 'SaaS Inicial', description: 'Acceso a la plataforma MAJIA OS para que tú mismo administres.', commission: 0, fixedFee: 649, maxProperties: 5 },
      { name: 'SaaS Pro', description: 'Acceso a la plataforma MAJIA OS para que tú mismo administres (Volumen alto).', commission: 0, fixedFee: 849, maxProperties: 11 },
      { name: 'Gestión Completa (Inicial)', description: 'Nuestros gestores se encargan de la cobranza y mantenimiento de tus propiedades.', commission: 4, fixedFee: 1699, maxProperties: 5 },
      { name: 'Gestión Completa (Pro)', description: 'Nuestros gestores se encargan de la cobranza y mantenimiento (Volumen alto).', commission: 3.5, fixedFee: 2899, maxProperties: 11 }
    ]
  });

  console.log('Update completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
`;

const setupCommands = `
  cd /root/RentControl/backend
  cat << 'EOF' > update_plans.js
${scriptContent}
EOF
  docker cp update_plans.js rentcontrol-backend:/app/update_plans.js
  docker exec rentcontrol-backend node update_plans.js
`;

console.log('Connecting to VPS to update RentControl plans...');

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
