# amazon-admin

Admin panel for amazon-server with scraping and scraper statistics.

Views:

- Overview: scraped items, ad changes, anomalies.
- Scrapers: status, attempts, captcha, HTTP 503, transfer, wasted requests.

## Stack

- Angular 22 (standalone, signals), Angular Material
- NgRx SignalStore
- Chart.js (`ng2-charts`), `date-fns`
- `vitest`, ESLint (`angular-eslint`), Prettier
- nginx, Docker / Docker Compose

## Running

Create `.env` (LF line endings):

| Variable    | Description                                                                         |
| ----------- | ----------------------------------------------------------------------------------- |
| `API_URL`   | amazon-server URL; on the server host in Docker: `http://host.docker.internal:5001` |
| `API_TOKEN` | `API_TOKEN` of amazon-server                                                        |

Locally (`proxy.conf.mjs` reads `.env`):

```bash
npm ci
npm start
```

Docker (nginx on `127.0.0.1:8081`, published through Tailscale):

```bash
docker compose up -d --build
tailscale serve --bg 8081
```

Build, lint and tests:

```bash
npx ng build
npx ng lint
npx ng test --watch=false
```
