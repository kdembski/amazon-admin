# amazon-admin

Admin panel for amazon-server.

## Environment

`.env` (LF line endings):

```
API_URL=http://<server-host>:5001
API_TOKEN=<API_TOKEN of amazon-server>
```

On the amazon-server host: `API_URL=http://host.docker.internal:5001`.

## Development

```bash
npm ci
npm start
```

## Deployment

```bash
docker compose up -d --build
tailscale serve --bg 8080
```
