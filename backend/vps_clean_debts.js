const { Client } = require('ssh2');

const conn = new Client();
const config = {
  host: '137.184.155.133',
  port: 22,
  username: 'root',
  password: 'ELj@rge79137h'
};

const commands = `
  echo "--- Cleaning up Orphaned Debts ---"
  docker exec -i rentcontrol-db psql -U admin -d rentcontrol -c "
    UPDATE \\"Charge\\" 
    SET status = 'CANCELLED' 
    FROM \\"Lease\\" 
    WHERE \\"Charge\\".\\"leaseId\\" = \\"Lease\\".\\"id\\" 
      AND \\"Lease\\".\\"status\\" = 'TERMINATED' 
      AND \\"Charge\\".\\"status\\" = 'PENDING';
  "
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
