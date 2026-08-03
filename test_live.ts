const urlLogin = 'https://practice-lp-backend.onrender.com/api/auth/login';
const urlVerified = 'https://practice-lp-backend.onrender.com/api/admin/verified';
fetch(urlLogin, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'premnankani99@gmail.com', password: 'password123' })
}).then(r => r.json()).then(data => {
    fetch(urlVerified, {
        headers: { 'Authorization': `Bearer ${data.token}` }
    }).then(r => r.json()).then(console.log);
}).catch(console.error);
