const { Client } = require('ssh2');

const conn = new Client();
const config = {
  host: '137.184.155.133',
  port: 22,
  username: 'root',
  password: 'ELj@rge79137h'
};

const commands = `
  echo "--- Docker PS ---"
  docker ps
  
  echo "--- Port 3000 Status ---"
  lsof -i :3000 || netstat -tulpn | grep 3000 || echo "Port 3000 is free"
  
  echo "--- PM2 Status ---"
  pm2 status || echo "PM2 not installed"
`;

console.log('Connecting to VPS to inspect processes...');

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
