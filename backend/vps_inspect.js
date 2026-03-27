const { Client } = require('ssh2');
const conn = new Client();
const config = { host: '137.184.155.133', port: 22, username: 'root', password: 'ELj@rge79137h' };

const commands = `
  docker run --rm rentcontrol-backend ls -la /app
  echo "--- DIST FOLDER ---"
  docker run --rm rentcontrol-backend ls -la /app/dist || true
  echo "--- PACKAGE.JSON SCRIPTS ---"
  docker run --rm rentcontrol-backend cat /app/package.json | grep start:prod || true
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end()).on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
  });
}).connect(config);
