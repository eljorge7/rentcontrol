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
  echo "--- Testing connection ---"
  whoami

  echo "--- Updating package list and installing prerequisites ---"
  apt-get update -y
  apt-get install -y apt-transport-https ca-certificates curl software-properties-common git nginx

  if ! command -v docker &> /dev/null; then
    echo "--- Installing Docker ---"
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" -y
    apt-get update -y
    apt-get install -y docker-ce docker-compose-plugin
  else
    echo "--- Docker already installed ---"
  fi

  echo "--- Setting up project directory ---"
  mkdir -p /root/rentcontrol
  cd /root/rentcontrol

  echo "--- Cloning repository ---"
  if [ -d ".git" ]; then
    git fetch origin main
    git reset --hard origin/main
  else
    git clone https://github.com/eljorge7/rentcontrol.git .
  fi

  ls -la

  echo "--- Building and starting Docker containers ---"
  # Pull the latest changes directly and start containers
  docker compose pull || true
  docker compose build
  docker compose up -d

  echo "--- Setup Complete! ---"
`;

console.log('Connecting to VPS...');

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
