const WebSocket = require('ws');
const net = require('net');
const http = require('http');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const targetHost = config.adapter.server.host;
const targetPort = config.adapter.server.port;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Eaglercraft Proxy is Running!');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  const tcp = net.connect(targetPort, targetHost);

  ws.on('message', (data) => {
    if (tcp.writable) tcp.write(Buffer.from(data));
  });

  tcp.on('data', (data) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(data);
  });

  ws.on('close', () => tcp.destroy());
  tcp.on('close', () => ws.close());
  tcp.on('error', () => ws.close());
  ws.on('error', () => tcp.destroy());
});

const port = process.env.PORT || 10000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Proxy listening on port ${port} -> ${targetHost}:${targetPort}`);
});
