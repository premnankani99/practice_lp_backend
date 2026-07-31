import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_leave_portal';

async function test() {
  const url = 'http://localhost:5000/api/leaves/compoff/request';
  const token = jwt.sign({ id: 'f94ce166-51d2-4309-8d76-bc30e37a0d4c', role: 'employee' }, JWT_SECRET);
  console.log('Token:', token);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        total_days: 1,
        reason: "Worked on sunday",
        workedDates: ["2026-06-30"]
      })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
  } catch (err) {
    console.error(err);
  }
}

test();
