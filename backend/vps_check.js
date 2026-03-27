const { Client } = require('ssh2');
const conn = new Client();
const config = { host: '137.184.155.133', port: 22, username: 'root', password: 'ELj@rge79137h' };

const commands = `
  echo "--- NGINX STATUS ---"
  curl -I https://api.radiotecpro.com/ || true
  
  echo "--- BACKEND LOGS ---"
  docker logs rentcontrol-backend --tail 50
  
  echo "--- CHECKING SEEDED DATA ---"
  docker exec rentcontrol-db psql -U admin -d rentcontrol -c "SELECT count(*) FROM \\"Plan\\";" || true
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end()).on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
  });
}).connect(config);
