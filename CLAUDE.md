# CLAUDE.md

Angular SPA for amazon-server: statistics now, server and scraper configuration later. Talks to the server only through
`/api` (dev: `proxy.conf.mjs`, prod: nginx), which adds `Authorization: Bearer <API_TOKEN>`.

## Commands

```bash
npm start                       # ng serve; API_URL and API_TOKEN from .env (gitignored)
npx ng build
npx ng lint
npx ng test --watch=false       # Vitest
npx prettier --write src tests  # before every commit
docker compose up -d --build    # nginx on 127.0.0.1:8081, env from .env
```

Tests: every component, service, store and helper gets a spec at the mirrored path (`src/app/core/layout/shell.ts` →
`tests/app/core/layout/shell.spec.ts`). Import tested code via `@app/*`, never relative paths into `src/`.

## Rules

- Before every commit, wait for the user's review; commit only after approval.
- Commit messages: short English sentence starting with a capitalised past-tense verb (`Added ...`). No attribution.
- UI text, code and error messages in English.
- In CLAUDE.md and code comments write only what to do, never why.
- Never put the API token in the bundle, `environment` files or browser storage.
- Pass all AXE checks and WCAG AA (focus management, contrast, ARIA).

## Architecture

- `src/app/core/`: app-wide pieces (`api/`, `layout/`). `shared/`: reusable components and pure helpers.
  `features/<name>/`: one lazy route per view.
- `src/app/types/`: every exported type; API DTOs in `api-dtos.ts`, copied from amazon-server with the same field
  names; others one file per topic (`poll-state.ts`). Code files declare no types.
- HTTP: one stateless `<Name>ApiService` per server area in `core/api/`, one method per endpoint.
- State: NgRx SignalStore. Shared state in root stores, view state in a store provided by the view component;
  components only read store signals and call store methods.
- Store loads via `apiLoad(Service, (api, range) => api.method(range))` from `core/api/api-load`.
- Periodic loading via `withPolling(() => (range) => load)` from `shared/polling`: every 60 s, paused while the tab is
  hidden.
- Each range-dependent panel has its own `RangePanel` (presets 1d, 7d, 30d, default 1d) and store; no global range.
  `from`/`to` as `toISOString()`, max 30 days.
- Time units (`MINUTE`, `HOUR`, `DAY`, `floorToHour`) from `shared/time-range`, sums via `sumBy`/`sumFields` from
  `shared/math/sum`.
- Pages set `host: { class: 'page' }`; error messages use the global `.error` class.
- Charts: hours up to 48 h, above that days in the browser time zone.

## Conventions

- Strict types, no `any` (use `unknown`); infer obvious types.
- Styles in `px`, never `rem` or `em`.
- Standalone functions as `const` arrows, never `function`; class members stay methods.
- A blank line between function body sections (declarations, guards, main step, `return`).
- No `standalone: true`, no explicit `OnPush` (defaults).
- `input()`, `output()`, `model()` for two-way binding, `computed()` for derived state, `linkedSignal()` for state
  synced from several sources. No `@HostBinding`/`@HostListener`: use `host`.
- Signals: `set`/`update`, never `mutate`. `effect()` only for side effects outside signals (DOM, storage, logging),
  never to copy state between signals.
- Observables: `toSignal()` or async pipe; a manual `subscribe()` needs `takeUntilDestroyed()`.
- File names kebab-case without type suffix (`shell.ts`, `stats-api-service.ts`), one component, service or store per
  file.
- `readonly` on inputs, outputs, queries and injected fields; `protected` on members used only by the template.
- Event handlers named after the action (`save()`), not the event (`onClick()`).
- Templates: `@if`/`@for`/`@switch`, `@for` tracks a stable id (`$index` only for static lists), `class`/`style`
  bindings (no `ngClass`/`ngStyle`), async pipe, no globals like `new Date()`. Logic beyond simple expressions in
  `computed()` or pipes. Import only the used directives and pipes, never `CommonModule`.
- Inline templates for small components; external template/style paths relative to the TS file.
- `NgOptimizedImage` for static images (not base64).
- Forms: Signal Forms (`@angular/forms/signals`), otherwise Reactive.
- `inject()`, not constructor injection; new singletons via `@Service`.
