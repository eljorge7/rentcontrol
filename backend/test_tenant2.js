
async function test() {
  try {
    const res = await fetch('http://localhost:3001/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Prueba Fetch",
        email: "prueba_fetch@correo.com",
        ownerId: "0b157bf0-df4f-4d9f-aef6-8ff4d37d4f9b"
      })
    });
    const data = await res.text();
    console.log("STATUS:", res.status);
    console.log("DATA:", data);
  } catch (err) {
    console.log("ERROR:", err.message);
  }
}

test();
