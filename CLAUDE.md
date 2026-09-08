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
- **Public, write** (rate limited): `POST resenas`, `POST citas`, `POST contacto`, `POST pedidos` (guest checkout is allowed, see Payments).
- **Auth** (rate limited via `throttle:login`): `auth/register`, `auth/login`, `auth/forgot-password`, `auth/reset-password`.
- **Private** (`auth:sanctum`): `auth/me`, `auth/logout`, `pedidos` index, `citas` index, `mis-cursos`.
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
`POST /api/pedidos` is **public**. With a session it reads the buyer via `auth('sanctum')`; without one it requires `nombre` + `email` and the account is created later, in the webhook, once payment is confirmed — so an abandoned checkout never leaves a ghost user whose email would read as "already registered".

`PedidoController::store` validates the cart, rejects tutorials with no Stripe price for the current amount (503) or already owned with a live grant (409), then creates `Pedido` + `PedidoItem` in a transaction. `pedidos.user_id` is nullable for that reason, with `email_cliente`/`nombre_cliente` alongside. The gateway call sits outside the transaction (network I/O); if it throws, the order is marked `cancelado` rather than left dangling as `pendiente`.

`PasarelaPago` is an interface bound to `StripePasarelaPago` in `AppServiceProvider`, so tests can swap in a fake instead of calling Stripe.

**Time-boxed pricing**: `tutoriales` carries `precio` (base) plus `precio_oferta` and an `oferta_inicio`/`oferta_fin` window. Stripe cannot change a price's amount, so each amount needs its own price object — hence `stripe_price_id` *and* `stripe_price_id_oferta`. `Tutorial::tieneOfertaActiva()` compares against **server** time and `stripePriceIdEfectivo()` picks the price that gets charged; the frontend only displays what the API returns. The API appends `precio_efectivo`, `oferta_activa` and `oferta_segundos_restantes` — a duration, not a deadline, so the countdown never depends on the visitor's clock.

`StripeWebhookController` verifies the signature, records `event.id` in `stripe_webhook_events` (unique index = idempotency against Stripe's retries), then handles `checkout.session.completed`, `checkout.session.expired` (cancel) and `charge.refunded` (revoke access). It refuses to run at all if `STRIPE_WEBHOOK_SECRET` is unset.

`App\Services\AltaDeCompra` is everything that happens once payment lands: create the account if the purchase was a guest one (random password, never emailed — the receipt carries a password-reset link instead), grant the accesses with their expiry, and send `JustificanteCompra` to the buyer with the business mailbox in CC. It lives outside the webhook so it can be tested without signing Stripe payloads.

### Access expiry
`accesos_tutorial.expira_en` holds the end of access; `null` means unlimited, which is what grants issued before this feature have and must keep. Duration comes from `tutoriales.duracion_acceso_meses` (6 by default).

Enforcement is server-side in two places: `AccesoTutorial::scopeVigentes()` gates `TutorialController::show`, and `AccesoTutorialController::index` returns expired courses flagged (`acceso_vigente: false`) with `video_url` nulled — showing them is more honest than making them vanish. Any copy that promises lifetime access is therefore wrong; `deploy/README.md` lists where it lived.

`cursos:avisar-caducidad` (scheduled daily at 10:00 Europe/Madrid) mails `AccesoPorCaducar` when a grant is 30 days from expiring, and stamps `aviso_expiracion_enviado_en` so it never repeats. `--simular` lists who would be mailed without sending.

### Domain model
Business entities are named in Spanish (models, tables and columns):
- `Categoria` → has many `Servicio` and `Tutorial`.
- `Servicio` — bookable service; referenced by `Cita`.
- `Tutorial` — paid course; `video_url` and `stripe_price_id` are `$hidden` and only revealed to buyers. Sold via `Pedido`/`PedidoItem`, unlocked via `AccesoTutorial`.
- `Pedido` + `PedidoItem` — order and line items.
- `Cita` — appointment; `timestamps` disabled, `estado` defaults to `pendiente`. Creating one mails `config('mail.contacto_destino')` (failures are logged, not fatal).
- `Resena` — review, `aprobada` defaults to false. `AccesoTutorial` — per-user tutorial access grant.

Note: the `remember_tokens` table is a leftover from an earlier iteration and is not read by any code — auth goes through Sanctum.

### Frontend structure
Angular standalone components (no NgModules). Routing in `src/app/app.routes.ts`; pages under `src/app/pages/`, shared services and UI under `src/app/shared/`, route guards under `src/app/guards/`. Providers in `src/app/app.config.ts` (`provideHttpClient(withInterceptors([authInterceptor]))`, router with in-memory scrolling).

`shared/cursos.service.ts` owns the catalogue and the purchase call (guest or authenticated) and is the only place that formats prices. `shared/contador-oferta/` is the countdown: it takes the seconds the API reports and decrements locally.

A route with `data: { sinLayout: true }` renders without navbar or footer — `app.ts` reads it and `app.html` hides both. `/oferta` is the Instagram ad landing and uses it: a closed funnel with no links out before the purchase. It is `Disallow`ed in `robots.txt` so it does not compete with `/cursos`.

Always build URLs from `environment.apiUrl` — never hardcode `http://localhost:8000`. In production `apiUrl` is the relative `/api`, because Nginx serves the SPA and the API from the same origin.

Scroll position is handled solely by the router's `withInMemoryScrolling`; do not add a manual `window.scrollTo` on `NavigationEnd`, it defeats back-button restoration.

The Google Translate widget is injected on demand by `shared/translation.service.ts` when a non-Spanish language is selected. It is deliberately not in `index.html`: loading it on every visit was render-blocking and set third-party cookies before the consent banner appeared.

**Media policy**: the photography and hero video are the point of this site. They are served at full quality and are never deferred — do not add `loading="lazy"`, poster placeholders that stand in for the video, or connection-based skipping. `decoding="async"` and `fetchpriority="high"` are fine (they change scheduling, not output). If bytes need cutting, add alternative formats as extra `<source>` entries (WebM/AVIF) with the originals as fallback rather than recompressing them; see `deploy/README.md`.

### CORS
`backend/config/cors.php` reads `CORS_ALLOWED_ORIGINS` (comma-separated) and falls back to the local `ng serve` ports. `supports_credentials` is false — auth is Bearer-token, not cookie-based — and there are no wildcard origin patterns.
