const { Client } = require('ssh2');

const conn = new Client();
const config = {
  host: '137.184.155.133',
  port: 22,
  username: 'root',
  password: 'ELj@rge79137h'
};

const commands = `
  echo "--- Deleting Chromium Lock Files ---"
  rm -f /root/rentcontrol/backend/whatsapp-session/session/SingletonLock
  rm -f /root/rentcontrol/backend/whatsapp-session/session/SingletonCookie
  rm -f /root/rentcontrol/backend/whatsapp-session/session/Default/SingletonLock
  rm -f /root/rentcontrol/backend/whatsapp-session/session/Default/SingletonCookie
  
  echo "--- Restarting Backend Container ---"
  cd /root/rentcontrol
  docker compose restart backend
  
  echo "--- Waiting for Backend to Initialize ---"
  sleep 10
  docker logs rentcontrol-backend --tail 50
  
  echo "--- WhatsApp Fix Complete ---"
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
