const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

function startServer(canvas, port = 3000, getRound = () => null) {
  const page = fs.readFileSync(path.join(__dirname, 'public', 'overlay.html'));
  const server = http.createServer((req, res) => {
    if (req.url === '/status') {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ ...canvas.snapshot(), round: getRound() }));
    } else if (req.url === '/' || req.url === '/overlay') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(page);
    } else { res.writeHead(404); res.end('Not found'); }
  });
  const wss = new WebSocketServer({ server });
  wss.on('connection', socket => socket.send(JSON.stringify({ ...canvas.snapshot(), round: getRound() })));
  const broadcast = data => {
    const message = JSON.stringify(data);
    for (const socket of wss.clients) if (socket.readyState === WebSocket.OPEN) socket.send(message);
  };
  server.listen(port, () => console.log(`ChatCanvas overlay: http://localhost:${port}/overlay`));
  return { server, broadcast };
}

module.exports = { startServer };
