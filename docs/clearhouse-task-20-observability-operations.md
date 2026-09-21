# ClearHouse Task 20 — Observability and Operations

## Git

- Starting commit: `53dfe51` (`feat: implement reconciliation and legacy migration`)
- Working branch: `task-20`
- Final submission branch: `master`
- Pre-existing dirty state: untracked `prompts/` only

## Challenge 10 contract

**8** organizer tests. `config/scores.ts` maps **100** points (10+8+7+25+20+15+10+5).

## `/health` (liveness)

- Always HTTP **200** while the process is up.
- No database probe.
- Body: `{ data: { status: "ok" }, meta: {} }` — no env/paths/secrets.

## `/ready` (readiness)

- Probe: `await db.raw("SELECT 1")` on the shared Knex handle.
- Reachable → **200** `{ data: { status: "ready" }, meta: {} }`.
- Unreachable → **503** `{ error: { code: "NOT_READY", details: [] } }` (not 500; no SQL/stack/path leak).
- No cached ready latch; each request re-probes.

## Structured logging (`src/middleware/logging.ts`)

On `res` `finish`, one JSON line via `console.log(JSON.stringify(record))`.

Organizer-required fields: `method`, `path`, `status`, `durationMs` (also emit `timestamp`, `actor`).

Allowlist only — never log body, rawBody, passwords, tokens, Authorization, cookies, or full headers.

Duration: `Math.max(0, Date.now() - startedAt)` at finish.

## Metrics (`src/services/metrics.ts` — already instrumented)

- Process-local counters via `metrics.requestTimer` on every response finish.
- `GET /api/metrics` → `{ data: metrics.snapshot(), meta: {} }` including `data.totalRequests`.
- Reflects real prior traffic; not hardcoded.
- `/api/metrics` itself is counted (test asserts `totalRequests >= 2` after two `/health` calls).

## Login rate limit (`src/middleware/rateLimit.ts`)

Already scoped in `server.ts` to `/api/auth` only:

| Item | Value |
|---|---|
| Key | `login:${req.ip}` |
| Limit | **10** |
| Window | **60_000** ms |
| Algorithm | Fixed window; lazy expiry via `Date.now()` |

- Exceeded → **429**, `Retry-After: Math.max(1, Math.ceil(remainingMs / 1000))`, `{ error: { code: "RATE_LIMITED", details: [] } }`.
- After window expiry, bucket resets; next request reaches the login handler.
- Expired keys reset on access (no long-lived cleanup timers).
- `/health`, `/ready`, `/api/metrics` are not rate-limited.

## Middleware order

Unchanged from Tasks 5/9: security headers → JSON+rawBody → rejectDeepJson → metrics timer → CORS → principal → structured logging → ops routes → `/api` (auth limiter on auth only) → errors.

## Files changed

- `src/controller/opsController.ts`
- `src/middleware/logging.ts`
- `src/middleware/rateLimit.ts`
- `docs/clearhouse-task-20-observability-operations.md`

`src/server.ts` and `src/services/metrics.ts` unchanged (already wired).

## Suggested commit

`feat: add observability and operational controls`
