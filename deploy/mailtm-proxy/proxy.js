// Minimal reverse proxy for api.mail.tm.
// Run this on a VPS so outbound requests use that VPS's IP instead of
// Vercel's shared serverless IPs, which mail.tm rate-limits heavily.
//
// Usage: PROXY_SECRET=<random-string> PORT=8787 node proxy.js

const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 8787;
const PROXY_SECRET = process.env.PROXY_SECRET;
const UPSTREAM_HOST = 'api.mail.tm';

if (!PROXY_SECRET) {
  console.error('PROXY_SECRET env var is required');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.headers['x-proxy-secret'] !== PROXY_SECRET) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'unauthorized' }));
    return;
  }

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const body = Buffer.concat(chunks);

    const upstreamReq = https.request(
      {
        host: UPSTREAM_HOST,
        path: req.url,
        method: req.method,
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
          'Authorization': req.headers['authorization'] || undefined,
          'Content-Length': body.length,
        },
      },
      (upstreamRes) => {
        res.writeHead(upstreamRes.statusCode, upstreamRes.headers);
        upstreamRes.pipe(res);
      }
    );

    upstreamReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'upstream request failed', detail: err.message }));
    });

    upstreamReq.end(body);
  });
});

server.listen(PORT, () => {
  console.log(`mail.tm proxy listening on :${PORT}`);
});
