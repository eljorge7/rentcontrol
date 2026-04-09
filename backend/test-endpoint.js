async function test() {
  try {
    const res = await fetch('http://localhost:3005/api/v1/settings', {
      headers: { 'Authorization': 'Bearer test' }
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch(e) { console.error(e); }
}
test();
