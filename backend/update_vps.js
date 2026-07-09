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

echo "Descargando actualizaciones de la Landing Page..."
cd /root/rentcontrol
git pull origin main

echo "Reconstruyendo el Frontend..."
docker compose build frontend
docker compose up -d frontend

echo "¡Frontend actualizado con éxito!"
`;

console.log('Conectando al VPS para actualizar la Landing Page...');

conn.on('ready', () => {
  console.log('Autenticación exitosa. Ejecutando actualización...');
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
