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
  echo "--- Stopping backend ---"
  cd /root/rentcontrol
  docker compose stop backend || true
  
  echo "--- Wiping Whatsapp Session Data ---"
  rm -rf /root/rentcontrol/backend/whatsapp-session/*
  rm -rf /root/rentcontrol/backend/.wwebjs_cache/*
  
  echo "--- Starting Backend ---"
  docker compose start backend
  
  echo "--- Hard Reset Complete ---"
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
