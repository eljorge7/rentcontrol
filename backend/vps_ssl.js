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
  echo "--- Installing Certbot (Let's Encrypt) ---"
  apt-get update -y
  apt-get install -y certbot python3-certbot-nginx

  echo "--- Requesting SSL Certificates ---"
  # We use the webroot plugin or nginx plugin. The nginx plugin automatically reconfigures the nginx files!
  certbot --nginx -d radiotecpro.com -d www.radiotecpro.com -d api.radiotecpro.com --non-interactive --agree-tos -m contacto@radiotecpro.com --redirect

  echo "--- Reloading Nginx ---"
  systemctl reload nginx

  echo "--- HTTPS Configuration Complete! ---"
`;

console.log('Connecting to VPS to configure HTTPS/SSL...');

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
