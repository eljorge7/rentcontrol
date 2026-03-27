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
  echo "--- Entering Project Directory ---"
  cd /root/rentcontrol
  
  echo "--- Fetching and Resetting Git ---"
  git fetch origin main
  git reset --hard origin/main
  
  echo "--- Rebuilding Frontend ---"
  # Clean build to avoid Docker caching issues
  docker compose build --no-cache frontend
  
  echo "--- Restarting Container ---"
  docker compose up -d frontend
  
  echo "--- Cleaning up unused images ---"
  docker image prune -f
  
  echo "--- Verifying Container Status ---"
  docker ps | grep rentcontrol-frontend
  
  echo "--- Deployment Complete ---"
`;

console.log('Connecting to VPS to automate deployment...');

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code);
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
