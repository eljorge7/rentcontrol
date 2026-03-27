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
  echo "--- Enlarging Nginx Upload Limit ---"
  
  # Inject client_max_body_size into the top of the server block
  sed -i 's/server {/server {\\n    client_max_body_size 50M;/g' /etc/nginx/sites-available/rentcontrol
  
  nginx -t
  systemctl reload nginx
  
  echo "--- Fetching Updates and Rebuilding Frontend ---"
  cd /root/rentcontrol
  git stash
  git pull origin main
  
  docker compose build --no-cache frontend
  docker compose up -d frontend
  
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
