const http = require('http');
const https = require('https');
const PORT = process.env.PORT || 3000;
// Whitelisted target hosts; selectable via X-Target-Host header.
const TARGETS = new Set(['api.typesafe.ai', 'api.perplexity.ai']);
function resolveTarget(req) {
  const h = (req.headers['x-target-host'] || '').toLowerCase();
  return TARGETS.has(h) ? h : null;
}
http.createServer((req, res) => {
  const host = resolveTarget(req);
  if (!host) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('unsupported target (whitelist: ' + Array.from(TARGETS).join(', ') + ')');
  }
  const url = new URL(req.url, 'http://localhost');
  const options = {
    hostname: host,
    port: 443,
    path: url.pathname + url.search,
    method: req.method,
    headers: { ...req.headers, host }
  };
  const proxy = https.request(options, (pres) => {
    res.writeHead(pres.statusCode, pres.headers);
    pres.pipe(res);
  });
  req.pipe(proxy);
  proxy.on('error', (e) => { res.writeHead(502, { 'Content-Type': 'text/plain' }); res.end('proxy error: ' + e.message); });
}).listen(PORT, () => console.log('fwd-proxy listening on ' + PORT));
