const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000; // Use the specified port or default to 3000

let count = 0;
const clients = new Set();

function broadcastCount() {
  const message = JSON.stringify({ type: 'count', count });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

app.use(express.static('public'));

app.get('/count', (req, res) => {
  res.json({ count });
});

app.post('/count/increment', (req, res) => {
  count++;
  broadcastCount();
  saveCount();
  res.json({ success: true });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  clients.add(ws);

  ws.send(JSON.stringify({ type: 'count', count }));

  ws.on('close', () => {
    clients.delete(ws);
  });
});

function loadCount() {
  if (fs.existsSync('count.json')) {
    const data = fs.readFileSync('count.json', 'utf8');
    count = JSON.parse(data).count;
  }
}

function saveCount() {
  fs.writeFileSync('count.json', JSON.stringify({ count }), 'utf8');
}

loadCount();

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
