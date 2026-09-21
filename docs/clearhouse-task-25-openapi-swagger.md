# ClearHouse Task 25 — OpenAPI / Swagger UI

## Git

- Starting commit (branch base / current `master`): `74ca996` (`feat: add event sourcing and deterministic replay`)
- Earlier Task 24 tip before Task 26 landed: `be837e1`
- Working branch: `task-25`
- Final submission branch: `master`
- Pre-existing working-tree state: untracked `prompts/ClearHouse_Cursor_Prompt_Task_*.md`; Task 25 WIP restored as uncommitted OpenAPI/docs changes on top of `74ca996`

## Challenge 19 contract (185 pts)

**10** organizer tests:

| ID | Points | Focus |
|---|---|---|
| 19a-1 | 10 | `GET /api/openapi.json` OpenAPI 3 + title/version/servers |
| 19a-2 | 20 | Real Swagger Parser validation of every `$ref` |
| 19b-1 | 25 | Exact path coverage of runtime OPERATIONS |
| 19b-2 | 15 | No undocumented phantom routes |
| 19b-3 | 20 | summary (≥2 words, not path), tag, unique operationId, 2xx, path params |
| 19b-4 | 15 | Shared `ErrorEnvelope` on 4xx/5xx for `/api/*` (except `/echo`) |
| 19c-1 | 30 | Request schemas + enums + integer-string amounts + `Idempotency-Key` |
| 19c-2 | 25 | Response schemas match live `GET /api/assets` and depth |
| 19d-1 | 10 | HTML Swagger UI pointing at `/api/openapi.json` |
| 19d-2 | 15 | Docs-only CSP with `script-src`/`style-src`; others stay `default-src 'none'` |

185-point map matches `config/scores.ts` Challenge 19 entries (read-only).

## Route inventory method

1. Read `tests/challenge19.test.ts` OPERATIONS + DOC_ROUTES arrays (authoritative coverage list).
2. Cross-check mounted routers under `src/routes/` and `src/server.ts` (`apiRouter` on `/api` and `/api/v1`, ops routes for `/health`, `/ready`, `/api/metrics`).
3. Convert Express `:param` → OpenAPI `{param}`; never put query strings in path keys.
4. Document `/api/...` path family only — Task 21 `/api/v1` remains a runtime alias (not duplicated in OpenAPI).
5. Include operational probes and event-sourcing routes that appear in OPERATIONS; exclude `/api/v2` and any future-only endpoints.

## OpenAPI

- Version: `3.0.3`
- `info.title`: ClearHouse API
- `info.version`: `1.0.0`
- `servers`: `[{ url: "/", description: "Current host" }]`
- Runtime OPERATIONS count: **40**
- Documented business ops: **40**
- Also documented (DOC_ROUTES): `GET /api/openapi.json`, `GET /api/docs`
- `/api` vs `/api/v1`: document `/api` only; v1 alias is runtime-only
- Exclusions: no `/api/v2`, no Task 30 strategy-order fields, no secret examples
- `operationId` strategy: unique verb+resource names (`listAssets`, `placeOrder`, `depositFunds`, …)
- Tags: Auth, Assets, Secure, Ledger, Orders, Settlement, Risk, Events, Market Data, Config, Operations, Documentation
- Path params: `in: path`, `required: true`, name matches `{param}`
- Query params: only real controller filters (`asset`, `asOf`, `asOfEntry`, `limit`, `cursor`, …)
- Header: `Idempotency-Key` required on `POST /api/settlement/deposits` and `POST /api/settlement/withdrawals`

## Schemas

- Money: string patterns `^[0-9]+$` (unsigned amounts/prices/qty) and `^-?[0-9]+$` (signed ledger posting amounts)
- Enums from source: `side` buy|sell; `timeInForce` FOK|GTC|IOC|POST_ONLY; ledger `type` asset|equity|expense|liability|revenue; roles admin|operator
- Shared `#/components/schemas/ErrorEnvelope` → `{ error: { code: string, details: array } }`
- Success JSON ops use Task 21 envelope `{ data, meta }`
- Sampled live schema checks: `GET /api/assets`, `GET /api/orders/book/{market}/depth`

## Swagger UI

- `GET /api/openapi.json` returns the OpenAPI object at the root (not `{ data, meta }`)
- `GET /api/docs` returns static HTML (`<!doctype html>`, charset, viewport, `#swagger-ui`)
- Asset source: CDN `swagger-ui-dist@5.11.0` from `https://unpkg.com` (no new packages)
- Docs-only CSP (route-local `res.setHeader` in `docsController.ui`):
  - `default-src 'none'`
  - `script-src https://unpkg.com 'unsafe-inline'`
  - `style-src https://unpkg.com 'unsafe-inline'`
  - `img-src 'self' data:`
  - `connect-src 'self'`
  - `font-src https://unpkg.com`
- Global `securityHeaders` unchanged: `default-src 'none'` (no script-src) on normal routes
- Other headers preserved: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`

## Files changed (Task 25)

- `src/openapi/document.ts` (new)
- `src/controller/docsController.ts`
- `docs/clearhouse-task-25-openapi-swagger.md`

Not changed: `src/server.ts` (docs already mounted), `src/middleware/securityHeaders.ts`, package files, tests, config, migrations, seeds.

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| Challenge 19a | PASS (2/2) |
| Challenge 19b | PASS (4/4) |
| Challenge 19c | PASS (2/2) |
| Challenge 19d | PASS (2/2) |
| Full Challenge 19 | PASS (10/10) |
| Challenge 11 | PASS |
| Challenge 7e (security) | PASS |
| Challenge 10 | PASS |
| Challenge 01 | PASS |
| Challenge 12 | PASS |
| Challenge 20 | PASS |
| Challenges 13, 09, 05–02, sanity | PASS |
| Full `npm test` | 226 passed; 53 failed = Task 27+ stubs (fees/etc.), not Task 25 |
| `git diff --check` | clean |

## Protected-file confirmation

Unchanged: organizer tests, `config/`, package manifests, `.env`, `.gitignore`, migrations, seeds, `knexfile.js`, TS/Vitest config, grading scripts.

## Suggested commit

```text
feat: document API with OpenAPI and Swagger UI
```

## Master merge/push (after approval only)

```bash
git switch master
git fetch origin
git pull --ff-only origin master
git merge --ff-only task-25
git push origin master
git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

Never push the final competition submission to `main` unless explicitly requested; organisers require `master`.
