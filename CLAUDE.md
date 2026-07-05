# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Approach
- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.

## Repository layout

Monorepo with two independent apps that talk over HTTP:

- `backend/` — Laravel 13 REST API (PHP 8.3+), MySQL, token auth via Sanctum.
- `frontend/` — Angular 21 SPA (standalone components, TypeScript 5, Tailwind CSS 4, Vitest).

There is no shared build. Each app is installed, run and tested from its own directory. `README.md` (root) is the full Ubuntu-from-scratch install guide for the whole stack.

## Commands

### Backend (`cd backend`)
- `composer dev` — runs server + queue worker + `pail` log tailer + vite concurrently (the normal dev entrypoint).
- `php artisan serve` — API only, at http://localhost:8000.
- `composer test` — clears config then runs `php artisan test` (PHPUnit).
- `php artisan test --filter=SomeTest` — run a single test class/method.
- `./vendor/bin/pint` — format/lint PHP (Laravel Pint). No trailing args needed; run before committing PHP.
- `php artisan migrate` / `php artisan migrate:fresh --seed` — apply migrations (seed via `DatabaseSeeder`).

### Frontend (`cd frontend`)
- `npm start` (`ng serve`) — dev server at http://localhost:4200.
- `npm run build` (`ng build`).
- `npm test` (`ng test`) — Vitest, not Karma/Jasmine.

## Architecture

### API surface
All routes live in `backend/routes/api.php` and are prefixed `/api`. They are split into two groups:
- **Public** (no auth): `auth/register`, `auth/login`, and read-only `GET` for `categorias`, `servicios`, `tutoriales`, `resenas`; plus `POST resenas` and `POST citas`.
- **Private** (`auth:sanctum` middleware): `auth/logout`, `pedidos` (index/store), `citas` index.

Controllers are thin and return `response()->json(...)` directly; there are no API Resource/Transformer classes or Form Request objects. Validation is inline in each controller action.

### Auth flow
Stateless bearer-token auth with Laravel Sanctum. `AuthController` issues a token via `createToken('auth_token')` on register/login and returns `{ message, user, token }`. `logout` deletes the current access token. The frontend stores the token in `localStorage` under `auth_token` (and the user under `user`), and redirects to `/inicio` when a token is present.

### Domain model
Business entities are named in Spanish (models, tables and columns):
- `Categoria` → has many `Servicio`.
- `Servicio` — bookable service; referenced by `Cita`.
- `Tutorial` — paid course; sold via `Pedido`/`PedidoItem` and unlocked via `AccesoTutorial`.
- `Pedido` + `PedidoItem` — order and line items; `PedidoController::store` wraps creation in a `DB::transaction` and computes `total` from tutorial `precio`.
- `Cita` — appointment; `timestamps` disabled, `estado` defaults to `pendiente`. Creating one sends `CitaReservada` mail to `info@makeupbyyona.com` (failures are logged, not fatal).
- `Resena` — review. `AccesoTutorial` — per-user tutorial access grant.

### Frontend structure
Angular standalone components (no NgModules). Routing in `src/app/app.routes.ts` maps top-level pages under `src/app/pages/` (inicio, sobre-mi, servicios, cursos, contacto, reservar-cita, login, registro, politica-privacidad); shared UI (navbar, footer, cookie-banner) under `src/app/shared/`. Providers are configured in `src/app/app.config.ts` (`provideHttpClient`, router with in-memory scrolling).

There is **no shared API service, HTTP interceptor, or route guard**. Components inject `HttpClient` and call the API directly. Note the inconsistency: `environment.ts` defines `apiUrl: 'http://localhost:8000/api'`, but some components (e.g. `pages/login/login.ts`) hardcode the full URL instead of using it — prefer `environment.apiUrl` for new code. Because there is no interceptor, calls to private endpoints must attach the `Authorization: Bearer <token>` header manually.

### CORS
`backend/config/cors.php` allows origin `http://localhost:4200` with `supports_credentials: true` for `api/*`. Update this when the frontend origin changes.
