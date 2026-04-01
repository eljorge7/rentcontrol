fetch('http://localhost:3001/integrations/omnichat/identify/6421644126', { headers: { 'x-api-key': 'SUPER_SECRET_KEY_123' } })
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
