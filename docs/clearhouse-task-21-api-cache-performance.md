# ClearHouse Task 21 — API Design, Cache and Performance

## Git

- Starting commit: `bea005e` (`feat: add observability and operational controls`)
- Working branch: `task-21`
- Final submission branch: `master`
- Pre-existing dirty state: untracked `prompts/` only

## Challenge 11 contract

**7** organizer tests. `config/scores.ts` maps **90** points: 12+13+18+17+10+10+10.

Visible suite:

| ID | Focus |
|---|---|
| 11a-1 | Success `{ data, meta }` |
| 11a-2 | Error `{ error: { code, details } }` |
| 11b-1 | Config cache MISS → HIT |
| 11b-2 | Write invalidates; next read MISS + fresh |
| 11c-1 | `/api` ≡ `/api/v1` |
| 11c-2 | `/api/v2/...` → 404 + `error.code` |
| 11d-1 | `GET /api/assets` max latency < 200ms over 20 requests |

## 11a — Envelopes

Already satisfied by existing controllers; no double-wrapping.

Success families exercised: assets, health, assets/validate, ledger/accounts, ledger/trial-balance, orders/book.

Error families: assets/validate (non-string amount), ledger/entries (empty postings), risk/limits (empty body).

Pagination `meta` (e.g. ledger statement) left intact where present.

## 11b — Config cache

Route: `GET/PUT /api/config/:key`

- Source of truth: in-memory `Map` in `configController`
- Cache: existing `src/services/cache.ts`
- Key: `config:${key}`
- Cached value: `{ value: string }` (business payload only)
- TTL: 60_000 ms
- MISS: load store → `cache.set` → `x-cache: MISS`
- HIT: `cache.get` → `x-cache: HIT` (no store re-read)
- PUT: write store → `cache.invalidate(key)` → success
- Very next GET after PUT: MISS with updated value

## 11c — Versioning

Shared `apiRouter` mounted at:

1. `/api/v1` (first)
2. `/api` (second)

Same modules/controllers; no V1 duplicates. Auth/HMAC/RBAC/rate-limit/logging/metrics unchanged.

`/api/v2/assets` does not match `/api/v1`, reaches `/api` as `/v2/assets`, no route → app `notFound` → 404 `{ error: { code: "NOT_FOUND", details: [] } }`.

HMAC continues to sign the real request path (including `/api/v1/...`).

## 11d — Latency

- Route: `GET /api/assets`
- Budget: max < **200** ms over **20** measured requests (1 warm-up)
- Baseline failure: ~253 ms from intentional 250 ms busy-wait checksum
- Fix: O(n) deterministic checksum over `code:exponent` (no busy-wait)
- Final: well under budget (~0–3 ms per request in local run)

## Task 20 preserved

`/health`, `/ready`, `/api/metrics`, structured logging, login rate limit unchanged.

## Files changed

- `src/controller/configController.ts` — cache-backed GET/PUT
- `src/controller/assetsController.ts` — remove busy-wait checksum
- `src/server.ts` — mount shared router at `/api/v1` and `/api`
- `docs/clearhouse-task-21-api-cache-performance.md`

`src/services/cache.ts` unchanged.

## Suggested commit

`feat: unify API versioning and cache behavior`
