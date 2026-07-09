const { Client } = require('ssh2');

const conn = new Client();
const config = {
  host: '137.184.155.133',
  port: 22,
  username: 'root',
  password: 'ELj@rge79137h'
};

const setupCommands = `
set -e

echo "Desplegando Uptime Kuma..."
mkdir -p /root/uptimekuma
cd /root/uptimekuma

cat << 'EOF' > docker-compose.yml
version: '3.8'
services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    volumes:
      - uptime-kuma-data:/app/data
    ports:
      - "3005:3001"
    restart: always

volumes:
  uptime-kuma-data:
EOF

docker compose up -d

echo "¡Uptime Kuma desplegado con éxito en el puerto 3005!"
`;

console.log('Conectando al VPS para instalar Uptime Kuma...');

conn.on('ready', () => {
  console.log('Autenticación exitosa. Ejecutando instalación...');
  conn.exec(setupCommands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Ejecución finalizada con código: ' + code);
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
