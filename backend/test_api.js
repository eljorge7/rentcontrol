(async function() {
  try {
    const res = await fetch("http://localhost:3001/network-profiles/public");
    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Data:", data.substring(0, 200));
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
})();
