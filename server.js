const http = require('http');
const https = require('https');
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const options = {
    hostname: 'api.typesafe.ai',
    port: 443,
    path: url.pathname + url.search,
    method: req.method,
    headers: { ...req.headers, host: 'api.typesafe.ai' }
  };
  const proxy = https.request(options, (pres) => {
    res.writeHead(pres.statusCode, pres.headers);
    pres.pipe(res);
  });
  req.pipe(proxy);
  proxy.on('error', (e) => { res.writeHead(502, {'Content-Type':'text/plain'}); res.end('proxy error: ' + e.message); });
}).listen(PORT, () => console.log('fwd-proxy listening on ' + PORT));
