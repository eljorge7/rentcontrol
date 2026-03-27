const { Client } = require('ssh2');
const conn = new Client();
const config = { host: '137.184.155.133', port: 22, username: 'root', password: 'ELj@rge79137h' };

const setupCommands = `
  set -e
  echo "--- Stopping backend container ---"
  cd /root/rentcontrol
  docker compose stop backend

  echo "--- Resetting DB and Seeding Admin ---"
  rm -rf /root/rentcontrol/backend/prisma/migrations/0_init_collaborative_roles
  docker run --rm --network rentcontrol_default \
    -e DATABASE_URL="postgresql://admin:admin123@db:5432/rentcontrol?schema=public" \
    -v /root/rentcontrol/backend/prisma:/app/prisma \
    rentcontrol-backend \
    sh -c "npx prisma migrate reset --force && node seed_admin.js"

  echo "--- Starting backend container ---"
  docker compose start backend
  
  echo "--- Reset Complete ---"
`;

console.log('Connecting to VPS to reset db and seed admin...');

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(setupCommands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => process.stdout.write(data))
      .stderr.on('data', (data) => process.stderr.write(data));
  });
}).connect(config);
