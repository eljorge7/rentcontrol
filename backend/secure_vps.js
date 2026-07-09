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

# Asegurar OmniChat
echo "1. Asegurando OmniChat..."
cd /root/omnichat-pro

OMNICHAT_DB_PASS=$(openssl rand -hex 12)
docker exec -i omnichat-db psql -U admin -d omnichat -c "ALTER USER admin WITH PASSWORD '$OMNICHAT_DB_PASS';"
sed -i "s/POSTGRES_PASSWORD: omnichatpassword/POSTGRES_PASSWORD: $OMNICHAT_DB_PASS/" docker-compose.prod.yml
sed -i "s/- \\"5433:5432\\"/- \\"127.0.0.1:5433:5432\\"/" docker-compose.prod.yml
sed -i "s/postgresql:\\/\\/admin:omnichatpassword@omnichat-db/postgresql:\\/\\/admin:$OMNICHAT_DB_PASS@omnichat-db/" docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d

# Asegurar FacturaPro
echo "2. Asegurando FacturaPro..."
cd /root/FacturaPro

FACTURAPRO_DB_PASS=$(openssl rand -hex 12)
docker exec -i facturapro-db psql -U postgres -d facturapro -c "ALTER USER postgres WITH PASSWORD '$FACTURAPRO_DB_PASS';"
sed -i "s/DB_PASSWORD=postgres/DB_PASSWORD=$FACTURAPRO_DB_PASS/" backend/.env || true
sed -i "s/POSTGRES_PASSWORD: \\\${DB_PASSWORD:-postgres}/POSTGRES_PASSWORD: \\\${DB_PASSWORD:-$FACTURAPRO_DB_PASS}/" docker-compose.yml || true
docker compose up -d

# Asegurar RentControl
echo "3. Asegurando RentControl..."
cd /root/rentcontrol

RENTCONTROL_DB_PASS=$(openssl rand -hex 12)
docker exec -i rentcontrol-db psql -U admin -d rentcontrol -c "ALTER USER admin WITH PASSWORD '$RENTCONTROL_DB_PASS';"
sed -i "s/POSTGRES_PASSWORD=admin123/POSTGRES_PASSWORD=$RENTCONTROL_DB_PASS/" backend/.env || true
sed -i "s/POSTGRES_PASSWORD: \\\${POSTGRES_PASSWORD:-admin123}/POSTGRES_PASSWORD: \\\${POSTGRES_PASSWORD:-$RENTCONTROL_DB_PASS}/" docker-compose.yml || true
docker compose up -d

echo "=== SECRETS ==="
echo "OMNICHAT_DB_PASS=$OMNICHAT_DB_PASS"
echo "FACTURAPRO_DB_PASS=$FACTURAPRO_DB_PASS"
echo "RENTCONTROL_DB_PASS=$RENTCONTROL_DB_PASS"
echo "==============="
`;

console.log('Conectando al VPS para rotación de contraseñas...');

conn.on('ready', () => {
  console.log('Autenticación exitosa. Ejecutando scripts de seguridad...');
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
