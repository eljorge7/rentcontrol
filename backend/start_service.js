const { Client } = require('ssh2');

const conn = new Client();
const config = {
  host: '137.184.155.133',
  port: 22,
  username: 'root',
  password: 'ELj@rge79137h'
};

const setupCommands = `
echo "Encendiendo FacturaPro Frontend de nuevo..."
docker start facturapro-frontend
echo "Servicio encendido. Uptime Kuma debería mandar mensaje de recuperación."
`;

conn.on('ready', () => {
  conn.exec(setupCommands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('error', (err) => {
  console.error('Error de conexión:', err);
}).connect(config);
