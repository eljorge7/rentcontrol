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

cat << 'EOF' > /root/scripts/majia_backup.sh
#!/bin/bash
# MAJIA OS - Automated Local Backups
# Generado por Antigravity

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")
BACKUP_DIR="/root/backups"

echo "Iniciando respaldo de bases de datos: $TIMESTAMP"

# 1. Respaldo de OmniChat
echo "Respaldando OmniChat..."
docker exec -i omnichat-db pg_dump -U admin omnichat | gzip > "$BACKUP_DIR/omnichat_$TIMESTAMP.sql.gz"

# 2. Respaldo de FacturaPro
echo "Respaldando FacturaPro..."
docker exec -i facturapro-db pg_dump -U postgres facturapro | gzip > "$BACKUP_DIR/facturapro_$TIMESTAMP.sql.gz"

# 3. Respaldo de RentControl
echo "Respaldando RentControl..."
docker exec -i rentcontrol-db pg_dump -U admin rentcontrol | gzip > "$BACKUP_DIR/rentcontrol_$TIMESTAMP.sql.gz"

echo "Respaldos completados exitosamente."

# 4. Politica de Retencion: Eliminar respaldos mas antiguos de 7 dias
echo "Limpiando respaldos antiguos (>7 dias)..."
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -exec rm {} \\;

echo "Proceso finalizado."
EOF

chmod +x /root/scripts/majia_backup.sh
echo "Ejecutando respaldo de prueba ahora mismo..."
/root/scripts/majia_backup.sh

echo "Contenido de la carpeta de respaldos:"
ls -lh /root/backups
`;

console.log('Conectando al VPS para configurar respaldos locales...');

conn.on('ready', () => {
  console.log('Autenticación exitosa. Ejecutando configuración...');
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
