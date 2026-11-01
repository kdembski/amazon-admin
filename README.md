# amazon-admin

Admin panel for amazon-server: activity, log and scraper statistics. Angular SPA served by nginx, which proxies
`/api/` to amazon-server and adds the API token, so the token never reaches the browser.

## Development

Create `.env` (gitignored) and run the dev server:

```
API_URL=http://<server-host>:5001
API_TOKEN=<API_TOKEN of amazon-server>
```

```bash
npm ci
npm start   # http://localhost:4200
```

## Deployment

On a host in the same tailnet as the browser:

1. Create `.env` as above, with Unix line endings (LF). Docker keeps a trailing `\r` in the values, which breaks
   the nginx config. On the amazon-server host itself use `API_URL=http://host.docker.internal:5001`.
2. Build and start:

   ```bash
   docker compose up -d --build
   ```

3. Publish the panel in the tailnet (HTTPS at `https://<host>.<tailnet>.ts.net`):

   ```bash
   tailscale serve --bg 8080
   ```

The container listens on `127.0.0.1:8080` only. Never publish it on `0.0.0.0`: Docker bypasses `ufw`, and anyone
reaching the port would use the API with your token.
