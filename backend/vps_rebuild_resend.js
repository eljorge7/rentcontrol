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
  
  echo "--- Stopping Backend ---"
  docker compose stop backend || true
  
  echo "--- Rebuilding Backend ONLY ---"
  docker compose build --no-cache backend
  
  echo "--- Starting Backend Container ---"
  docker compose up -d backend
  
  echo "--- Backend Integration Complete ---"
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
