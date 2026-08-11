const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;
const STATIC_DIR = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let requestUrl = req.url.split('?')[0];
  let filePath = path.join(STATIC_DIR, requestUrl === '/' ? 'index.html' : requestUrl);
  
  if (!fs.existsSync(filePath)) {
    filePath = path.join(STATIC_DIR, 'index.html');
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500);
      res.end('Error del servidor: ' + error.code);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=========================================`);
  console.log(` ¡EL SERVIDOR ESTÁ CORRIENDO PERFECTAMENTE!`);
  console.log(` -> Abre: http://localhost:${PORT}`);
  console.log(`=========================================\n`);
});
