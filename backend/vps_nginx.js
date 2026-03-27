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
  echo "--- Configuring Nginx ---"
  
  rm -f /etc/nginx/sites-enabled/default

  cat << 'EOF' > /etc/nginx/sites-available/rentcontrol
server {
    listen 80;
    server_name radiotecpro.com www.radiotecpro.com 137.184.155.133;

    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.radiotecpro.com;
    return 301 https://radiotecpro.com/api$request_uri;
}
EOF

  ln -sf /etc/nginx/sites-available/rentcontrol /etc/nginx/sites-enabled/
  
  echo "--- Testing and Restarting Nginx ---"
  nginx -t
  systemctl restart nginx
  
  echo "--- Done Configuring Nginx! ---"
`;

console.log('Connecting to VPS to update Nginx to relative /api/ matching...');

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
