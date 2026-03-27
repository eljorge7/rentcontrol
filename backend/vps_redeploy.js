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
  
  echo "--- Rebuilding Frontend ---"
  # We already rebuilt the backend previously, so we just build frontend
  docker compose build --no-cache frontend
  
  echo "--- Starting Containers ---"
  docker compose up -d backend frontend
  
  echo "--- Production Deployment Complete ---"
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
