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
- `deploy/` — Nginx site, systemd units and `deploy.sh` for the production server (makeupbyyona.es). See `deploy/README.md`.

There is no shared build. Each app is installed, run and tested from its own directory. `README.md` (root) is the Ubuntu-from-scratch install guide for local development; `deploy/README.md` covers production.

## Commands

### Backend (`cd backend`)
- `composer dev` — runs server + queue worker + `pail` log tailer + vite concurrently (the normal dev entrypoint).
- `php artisan serve` — API only, at http://localhost:8000.
- `composer test` — clears config then runs `php artisan test` (PHPUnit, sqlite in-memory).
- `php artisan test --filter=SomeTest` — run a single test class/method.
- `./vendor/bin/pint` — format/lint PHP (Laravel Pint). Run before committing PHP.
- `php artisan migrate` / `php artisan migrate:fresh --seed` — apply migrations (seed via `DatabaseSeeder`).

### Frontend (`cd frontend`)
- `npm start` (`ng serve`) — dev server at http://localhost:4200.
- `npm run build` (`ng build`) — production build; swaps `environment.ts` for `environment.prod.ts` via `fileReplacements`.
- `npm test` (`ng test`) — Vitest, not Karma/Jasmine.

## Architecture

### API surface
All routes live in `backend/routes/api.php` and are prefixed `/api`.

- **Public, read-only**: `GET` for `categorias`, `servicios`, `tutoriales`, `resenas`.
- **Public, write** (rate limited): `POST resenas`, `POST citas`, `POST contacto`.
- **Auth** (rate limited via `throttle:login`): `auth/register`, `auth/login`, `auth/forgot-password`, `auth/reset-password`.
- **Private** (`auth:sanctum`): `auth/me`, `auth/logout`, `pedidos` (index/store), `citas` index, `mis-cursos`.
- **Webhook**: `POST webhooks/stripe`, excluded from `throttle:api` so Stripe retries never hit a 429.

Controllers are thin and return `response()->json(...)` directly; there are no API Resource classes or Form Request objects. Validation is inline in each controller action.

**Guard trap**: the default auth guard is `web` (session), so on a route *without* `auth:sanctum` middleware, `$request->user()` returns `null` even when a valid Bearer token is present. Public routes that need the optional user (`TutorialController::show`, `ResenaController::store`, `CitaController::store`) must use `auth('sanctum')->user()`. Covered by `tests/Feature/RutasPublicasTest.php`.

### Rate limiting
The Laravel 11+ `api` group ships without throttling, so the limiters are defined in `AppServiceProvider::configureRateLimiting()` and applied in `bootstrap/app.php` (`throttleApi('api')`) plus per-route: `login` (5/min by IP *and* by email), `correo` (3/min, for endpoints that send mail), `escritura-publica` (10/min).

### Auth flow
Stateless bearer-token auth with Laravel Sanctum. `AuthController` issues a token on register/login and returns `{ message, user, token }`. Tokens expire (`SANCTUM_TOKEN_EXPIRATION`, 30 days by default) and `sanctum:prune-expired` runs daily from `routes/console.php`.

Password recovery uses Laravel's `Password` broker. `User::sendPasswordResetNotification` is overridden so the link points at the Angular route `/restablecer-password?token=...&email=...` instead of a Laravel web route. `forgot-password` always returns the same message whether or not the account exists, to avoid user enumeration.

On the frontend, `shared/auth.service.ts` owns the session as signals (`estaAutenticado`, `usuario`, `nombre`) and is the only place that touches `localStorage`. `shared/auth.interceptor.ts` attaches the Bearer token to same-API requests and, on a 401, clears the session and redirects to `/login?motivo=sesion-caducada`.

### Payments
`PedidoController::store` validates the cart, rejects tutorials without a `stripe_price_id` (503) or already owned by the buyer (409), creates the `Pedido` + `PedidoItem` rows inside a transaction, then asks `App\Services\PasarelaPago` for a Checkout URL. The gateway call is deliberately outside the transaction (network I/O); if it throws, the order is marked `cancelado` rather than left dangling as `pendiente`.

`PasarelaPago` is an interface bound to `StripePasarelaPago` in `AppServiceProvider`, which exists so tests can swap in a fake instead of calling Stripe.

`StripeWebhookController` verifies the signature, records `event.id` in `stripe_webhook_events` (unique index = idempotency against Stripe's retries), then handles `checkout.session.completed` (grant access), `checkout.session.expired` (cancel) and `charge.refunded` (revoke access). It refuses to run at all if `STRIPE_WEBHOOK_SECRET` is unset.

### Domain model
Business entities are named in Spanish (models, tables and columns):
- `Categoria` → has many `Servicio` and `Tutorial`.
- `Servicio` — bookable service; referenced by `Cita`.
- `Tutorial` — paid course; `video_url` and `stripe_price_id` are `$hidden` and only revealed to buyers. Sold via `Pedido`/`PedidoItem`, unlocked via `AccesoTutorial`.
- `Pedido` + `PedidoItem` — order and line items.
- `Cita` — appointment; `timestamps` disabled, `estado` defaults to `pendiente`. Creating one mails `config('mail.contacto_destino')` (failures are logged, not fatal).
- `Resena` — review, `aprobada` defaults to false. `AccesoTutorial` — per-user tutorial access grant.

Note: the `remember_tokens` table and the `hotmart_*` columns on `tutoriales` are leftovers from earlier iterations and are not read by any code.

### Frontend structure
Angular standalone components (no NgModules). Routing in `src/app/app.routes.ts`; pages under `src/app/pages/`, shared services and UI under `src/app/shared/`, route guards under `src/app/guards/`. Providers in `src/app/app.config.ts` (`provideHttpClient(withInterceptors([authInterceptor]))`, router with in-memory scrolling).

Always build URLs from `environment.apiUrl` — never hardcode `http://localhost:8000`. In production `apiUrl` is the relative `/api`, because Nginx serves the SPA and the API from the same origin.

Scroll position is handled solely by the router's `withInMemoryScrolling`; do not add a manual `window.scrollTo` on `NavigationEnd`, it defeats back-button restoration.

The Google Translate widget is injected on demand by `shared/translation.service.ts` when a non-Spanish language is selected. It is deliberately not in `index.html`: loading it on every visit was render-blocking and set third-party cookies before the consent banner appeared.

### CORS
`backend/config/cors.php` reads `CORS_ALLOWED_ORIGINS` (comma-separated) and falls back to the local `ng serve` ports. `supports_credentials` is false — auth is Bearer-token, not cookie-based — and there are no wildcard origin patterns.
