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
  echo "--- Fixing .env file ---"
  cd /root/rentcontrol/backend
  touch .env
  # Add the database URL just in case
  echo 'DATABASE_URL="postgresql://admin:admin123@db:5432/rentcontrol?schema=public"' > .env
  
  cd /root/rentcontrol
  echo "--- Starting containers ---"
  docker compose up -d
  echo "--- Done! ---"
`;

console.log('Connecting to VPS to fix .env and start containers...');

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(setupCommands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
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
