const { Client } = require('pg');
const client = new Client({connectionString: 'postgresql://rentadmin:admin123@localhost:5432/omnichat?schema=public'});
async function main() {
  await client.connect();
  const res = await client.query('SELECT email FROM "User"');
  console.log(res.rows);
  await client.end();
}
main().catch(console.error);
