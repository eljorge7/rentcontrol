const { Client } = require('ssh2');

const conn = new Client();
const config = {
  host: '137.184.155.133',
  port: 22,
  username: 'root',
  password: 'ELj@rge79137h'
};

const commands = `
  set -e
  echo "--- Fetching Updates ---"
  cd /root/rentcontrol
  git stash
  git pull origin main
  
  echo "--- Shutting down backend safely to release WhatsApp Locks ---"
  docker compose stop backend || true
  
  echo "--- Destroying lingering Chromium Locks just in case ---"
  rm -f /root/rentcontrol/backend/whatsapp-session/session/SingletonLock
  rm -f /root/rentcontrol/backend/whatsapp-session/session/SingletonCookie
  rm -f /root/rentcontrol/backend/whatsapp-session/session/Default/SingletonLock
  rm -f /root/rentcontrol/backend/whatsapp-session/session/Default/SingletonCookie
  
  echo "--- Rebuilding Backend AND Frontend ---"
  docker compose build --no-cache backend frontend
  
  echo "--- Starting Containers ---"
  docker compose up -d backend frontend

  echo "--- Applying Database Migrations (DB Push) ---"
  # Esperar unos segundos para que Node.js inicie
  sleep 5
  docker exec -i rentcontrol-backend npx prisma db push --accept-data-loss
  
  echo "--- Production Deployment Complete ---"
  docker logs rentcontrol-backend | grep -i "whatsapp web autenticado" || true
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
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
  console.error('Connection error:', err);
}).connect(config);
