# mail.tm proxy

Routes `api.mail.tm` calls through a VPS instead of Vercel's shared IPs, which
mail.tm rate-limits because many "temp email" clones hit it from there.

## Setup on a VPS (any $4-6/mo box — Hetzner, DigitalOcean, Oracle free tier)

1. Install Node.js (18+) and Caddy (for free TLS):
   ```
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
   sudo apt-get install -y nodejs caddy
   ```

2. Copy this folder to the VPS, e.g. `/opt/mailtm-proxy/`.

3. Generate a random secret and put it in `mailtm-proxy.service`:
   ```
   openssl rand -hex 32
   ```
   Replace `REPLACE_WITH_RANDOM_SECRET` in `mailtm-proxy.service` with it.

4. Install and start the service:
   ```
   sudo cp mailtm-proxy.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now mailtm-proxy
   ```

5. Point Caddy at it for TLS (edit `/etc/caddy/Caddyfile`):
   ```
   mailproxy.yourdomain.com {
       reverse_proxy localhost:8787
   }
   ```
   Then `sudo systemctl reload caddy`. (Needs a DNS A record for that subdomain pointing at the VPS.)

## Configure Vercel

In your Vercel project's environment variables, add:

```
MAIL_API_BASE_URL=https://mailproxy.yourdomain.com
MAIL_PROXY_SECRET=<the same random secret from step 3>
```

Redeploy. The app's three API routes (`generate`, `messages`, `message`) will
now call your VPS, which forwards to `api.mail.tm` using the VPS's IP.

## Notes

- Without `MAIL_API_BASE_URL` set, the app falls back to calling
  `api.mail.tm` directly — local dev needs no proxy setup.
- The `X-Proxy-Secret` header check stops strangers from finding and abusing
  your proxy if they discover the URL.
