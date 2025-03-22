const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

let users = [];
let messages = [];

app.post('/login', (req, res) => {
  const { phone, password } = req.body;
  const user = users.find(u => u.phone === phone && u.password === password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false });
  }
});

app.post('/register', (req, res) => {
  const newUser = req.body;
  users.push(newUser);
  res.json({ success: true });
});

app.post('/api/content', (req, res) => {
  messages.push(req.body);
  res.json({ success: true });
});

io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('chat message', (msg) => {
    messages.push(msg);
    io.emit('chat message', msg);
  });
});

http.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Frontend JavaScript (public/script.js)
document.body.style.backgroundImage = `url('https://source.unsplash.com/random/1920x1080')`;
setInterval(() => {
  document.body.style.backgroundImage = `url('https://source.unsplash.com/random/1920x1080?sig=${Math.random()}')`;
}, 10000);

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData))
  });
  const result = await response.json();
  if (result.success) alert('Kirish muvaffaqiyatli!');
  else alert('Xatolik!');
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData))
  });
  alert('Ro‘yxatdan o‘tildi!');
});

async function sendChat() {
  const input = document.getElementById('chatInput').value;
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: input })
  });
  const result = await response.json();
  document.getElementById('chatOutput').innerText = result.response;
}
