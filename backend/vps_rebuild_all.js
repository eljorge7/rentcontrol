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
  
  echo "--- Fixing existing Localhost Image URLs in Database ---"
  # Attempt to patch the existing photos strings to use the production URL
  docker exec -i rentcontrol-db psql -U admin -d rentcontrol -c "
    UPDATE \\"Property\\" SET photos = REPLACE(photos, 'http://localhost:3001', 'https://radiotecpro.com/api') WHERE photos LIKE '%localhost%';
    UPDATE \\"Unit\\" SET photos = REPLACE(photos, 'http://localhost:3001', 'https://radiotecpro.com/api') WHERE photos LIKE '%localhost%';
  " || echo "Database patch failed or nothing to patch, continuing..."

  echo "--- Rebuilding Backend AND Frontend ---"
  docker compose up --build -d backend
  docker compose up --build -d frontend
  
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
