You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Project

Angular SPA for amazon-server: statistics now, server and scraper configuration later. Talks to the server only
through `/api` (dev: `proxy.conf.mjs`, prod: nginx), which adds `Authorization: Bearer <API_TOKEN>`.

### Commands

```bash
npm start                        # ng serve; /api proxied to API_URL with API_TOKEN, both read from .env (gitignored)
npx ng test --watch=false        # Vitest
npx ng lint
npx prettier --write src tests  # format before committing
docker compose up -d --build     # production: nginx on 127.0.0.1:8081, env from .env (see README)
npx ng build
```

### Layout

- `src/app/core/`: app-wide pieces (`api/` clients and DTOs, `layout/` shell).
- `src/app/shared/`: reusable components and pure helpers (time range, polling, charts, stat tile).
- `src/app/features/<name>/`: one lazy route per view.
- `src/app/types/`: every exported type and interface of the app (API DTOs in `api-dtos.ts`, others in one file per
  topic, e.g. `poll-state.ts`); code files hold no type declarations.
- `tests/`: unit tests, mirroring `src/` (`src/app/core/layout/shell.ts` → `tests/app/core/layout/shell.spec.ts`);
  import tested code through the `@app/*` alias (`src/app/*`), never through relative paths into `src/`.

### Rules

- Before every commit, stop and wait for the user to review the changes; commit only after their approval.
- Commit messages: short English sentence starting with a capitalised past-tense verb (`Added ...`, `Fixed ...`).
  No `Co-Authored-By` or other attribution.
- Separate the sections of a function body (declarations, guard clauses, the main step, the final `return`) with one
  blank line.
- Write standalone functions as `const` arrow functions (`export const poll = <T>(...) => { ... }`), never with the
  `function` keyword; class members stay methods.
- UI text in Polish; code, identifiers and error messages in English.
- Never put the API token in the bundle, `environment` files or browser storage.
- State: NgRx SignalStore (`@ngrx/signals`). Shared state in `providedIn: 'root'` stores, view state in a store provided
  by the view component; components only read store signals and call store methods. Periodic loading goes through
  `withPolling(() => (range) => load)` from `shared/polling`.
- HTTP clients: one stateless `<Name>ApiService` per server area in `core/api/` (`stats-api-service.ts`), one method per endpoint.
- Copy API DTOs from amazon-server into `types/api-dtos.ts` with the same field names.
- Query `from`/`to` as `Date.toISOString()`; ranges at most 30 days.
- Poll every 60 s, paused while the tab is hidden.
- Charts: hours for ranges up to 48 h, days in the browser time zone above.
- Every new component, service, store and helper gets a `.spec.ts` under `tests/` at the path mirroring `src/`.
