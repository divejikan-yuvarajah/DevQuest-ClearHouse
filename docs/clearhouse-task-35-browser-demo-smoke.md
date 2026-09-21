# ClearHouse Task 35 — Browser / Demo Smoke Verification

## Git

| Item | Value |
|---|---|
| Starting commit (Task 35 worktree base) | `44badd1be00c7c246d232155d355532f6393e217` (`fix: resolve final regression failures` — Task 34 on `master`) |
| Earlier session tip before Task 34 publish | `97ce8a755b2593af3584550b4e8192b38770bcfd` |
| Working branch | `task-35` (reset onto `master` after Task 34 landed mid-session) |
| Final submission branch | `master` |
| Official remote | `origin` → CodeCommit `5af51b5f-8b96-4c51-aef1-e5557702842b` |
| Pre-existing dirty/staged | Untracked `prompts/` only; no staged production files |
| Task 34 status | Published on `master` as `44badd1`; `docs/clearhouse-task-34-full-regression.md` present |

## Pre-smoke automated gates

| Gate | Result |
|---|---|
| `npm run typecheck` (pre-smoke / post-Task34 tip) | **PASS** |
| `npm test` (full suite, pre-smoke on green tip) | **279 passed / 0 failed** |

## Startup discovery (actual)

| Item | Actual |
|---|---|
| Start command | `npm start` → `tsx src/server.ts` |
| Port | `process.env.PORT` or **3001** |
| Dashboard | Express static `client/` at `http://127.0.0.1:3001/` |
| Separate static server | **Not required** after Task 35 fix |
| Env key names (no values) | `PORT`, `JWT_PRIVATE_KEY`, `HMAC_SECRET` (plus existing dotenv keys) |
| Database | SQLite `main.sqlite3` via Knex |
| Migrate | `npm run migrate` = `delete-db` then migrate (destructive) |
| Seed | `npm run seed` → Task 23 `01_initial_accounts.ts` (idempotent) |

## Demo DB strategy

- Inspected local `main.sqlite3` as disposable competition/demo DB.
- Restored tracked empty/baseline DB, then `npm run seed` (2 seed files).
- Did **not** run destructive migrate reset after confirming seed was sufficient.
- Did **not** commit DB or backups.

## Server startup (smoke)

- Command: `npm start`
- Result: clean start, `Server is running on port 3001`
- No uncaught exception / unhandled rejection in smoke window
- No secrets logged (structured request logs only: method/path/actor/status/duration)
- Graceful stop: terminated owning listen PID; port **3001 released**

## Health / ready / metrics

| Route | Result |
|---|---|
| `GET /health` | 200 `{"data":{"status":"ok"},"meta":{}}` |
| `GET /ready` | 200 `{"data":{"status":"ready"},"meta":{}}` |
| `GET /api/metrics` | 200 `application/json` (~1.4KB); no stack/secret |

## Dashboard load (HTTP assets)

| Asset | Result |
|---|---|
| `GET /` | 200 HTML |
| `/js/app.js`, `/js/dashboard.js`, `/js/liveFeed.js` | 200 |
| `/styles/dashboard.css` | 200 |
| Dashboard CSP | `script-src 'self'; style-src 'self'; connect-src 'self' ws: wss:` (API routes keep `default-src 'none'`) |

## Browser / viewport

| Item | Status |
|---|---|
| Controllable browser | **NOT AVAILABLE** (`browse` CLI not installed; package install disallowed) |
| Desktop/mobile layout | **NOT RUN** |
| Keyboard/a11y smoke | **NOT RUN** |
| Console/network in DevTools | **NOT RUN** |

See **MANUAL BROWSER CHECKS — NOT RUN** below.

## Login / auth (CLI)

- Disposable identity: seeded account `…0101` (Aurora Capital), role `operator` via `POST /api/auth/login`
- Valid login: **200**, access token issued (length recorded only; value not captured in note)
- Invalid order quantity `0`: controlled **400**; server remained healthy

## Accounts / portfolio / risk (CLI)

| Check | Result |
|---|---|
| `GET /api/ledger/accounts` | 6 accounts; traders Aurora / Beacon / Cascade / Delta / Evergreen present, `active` |
| Holdings | Exact integer-string `available` / `held` / `total` (e.g. USD/BTC for Aurora) |
| `GET /api/risk/accounts/:id/state` | 200 with limits/usage payload |

## Order book / trading smoke (CLI)

| Step | Result |
|---|---|
| Initial depth `SMOKE-1` | Empty then resting ask |
| Resting sell (Aurora) | 201; rests; trades=0 |
| Crossing buy (Beacon) | Match; trades=1; resting cleared for filled qty |
| Depth after | asks `[{price:"100",quantity:"2"}]` |
| Recent trades `?limit=10` | count=1, market `SMOKE-1`, exact price/qty |

## REST ↔ WebSocket parity (CLI `ws`)

| Check | Result |
|---|---|
| Subscribe `orderbook:SMOKE-1` | snapshot + `subscribed` |
| Snapshot asks/bids vs REST depth | **parity OK** |
| Delta after resting order on fresh market | **delta seq received** |
| Client close + reconnect + resubscribe | **fresh snapshot OK** |
| Server `disconnectAll` via HTTP | Not exposed (correct); in-process path covered by Challenge 21/18 tests |
| Forced disconnect method used in smoke | Client socket close + reopen (exercises reconnect/subscribe/snapshot) |

## Unauthorized / invalid / versioning

| Check | Result |
|---|---|
| `GET /api/secure/...` without HMAC | **401** |
| `POST /api/ledger/accounts/:id/close` without admin (earlier smoke log) | **403** |
| Note | Many read/order routes are intentionally unauthenticated per current contracts; unauth smoke used HMAC-protected + RBAC-protected paths |
| Invalid order qty | **400** standard error |
| `/api` vs `/api/v1` assets | Identical body |
| `/api/v2/assets` | **404** clean |

## OpenAPI / Swagger / headers

| Check | Result |
|---|---|
| `GET /api/openapi.json` | 200; OpenAPI **3.0.3**; paths present |
| `GET /api/docs` | 200 HTML referencing swagger |
| API security headers | CSP `default-src 'none'`; `X-Content-Type-Options: nosniff`; `X-Frame-Options: DENY`; `Referrer-Policy: no-referrer` |

## Logout / reload

| Check | Result |
|---|---|
| Logout UI | **Not present** — not invented in Task 35 |
| Reload / hard refresh | **NOT RUN** (browser unavailable) |

## Defects found (smoke-reproducible)

1. **Dashboard not served over HTTP** — Express had no `client/` static mount → blank/`file://` unsuitable for modules/fetch/WS.
2. **Dashboard CSP too strict for first-party UI** — API `default-src 'none'` blocked scripts/styles if applied to HTML; need dashboard-scoped CSP allowing `'self'` scripts/styles and `ws:`/`wss:`.
3. **Demo login required HMAC only** — JWT login existed server-side but client did not call `/api/auth/login` or attach Bearer / open `LiveFeedClient` on `orderbook:${market}`.

## Fixes made (smallest production)

| File | Fix |
|---|---|
| `src/server.ts` | Serve `client/` via `express.static` with `DASHBOARD_CSP` |
| `client/js/app.js` | JWT login → Bearer fetches; start `LiveFeedClient` on `orderbook:${market}` |
| `client/index.html` | HMAC secret optional for JWT demo login |

No organizer tests/config/deps changed. No settlement/risk rule changes in the Task 35 commit set.

## Owning challenge regressions after fixes

| Suite | Result |
|---|---|
| typecheck (post-fix) | **PASS** |
| Full `npm test` with `NODE_ENV=test` | **279 passed / 0 failed** |
| Note | One interrupted run hit `EADDRINUSE :3001` while a smoke server was still bound; after releasing the port, suite passed clean |

## Protected-file confirmation

- `tests/` untouched
- `config/` / `config/scores.ts` untouched
- `vitest.config.ts` untouched
- package.json / lock / deps untouched
- No grading upload (`config/result.ts` **not** executed)
- No `.env` contents printed; no JWT/HMAC secrets recorded
- No DB backup committed; `main.sqlite3` restored / not staged
- No Task 36 artifacts

## `git diff --check`

Clean (no whitespace errors) on Task 35 production + doc files.

## Suggested commit

```text
fix: resolve final demo smoke issues
```

(If docs-only were present: `docs: record browser and demo smoke verification`.)

## Master merge/push workflow (after approval)

```powershell
git add -- docs/clearhouse-task-35-browser-demo-smoke.md
git add -- src/server.ts
git add -- client/js/app.js
git add -- client/index.html
git diff --cached --check
git diff --cached --name-only
git commit -m "fix: resolve final demo smoke issues"
git switch master
git fetch origin
git pull --ff-only origin master
git merge --ff-only task-35
npm run typecheck
npm test
git push origin master
git rev-parse HEAD
git ls-remote origin refs/heads/master
```

Never force-push. Organisers require `master`.

## Next

Task 36 — final submission verification / hand-off only.

---

## MANUAL BROWSER CHECKS — NOT RUN

No controllable browser was available in this environment. Operator should open `http://127.0.0.1:3001/` after `npm run seed` + `npm start` and verify:

1. Hard refresh; confirm no blank screen, no module 404, no CSP block of `/js/*` or CSS.
2. Console clean before interaction (no uncaught errors, failed imports, BigInt crashes).
3. Sign in with seeded Aurora account id + role operator (HMAC optional); confirm live status reaches healthy.
4. Account list / portfolio / risk meters / initial book render without `[object Object]`.
5. Place resting then crossing orders via API or any existing UI; confirm live book updates and recent trades (max 10, newest first).
6. Force WebSocket drop (DevTools → Network → WS → close); confirm stale/reconnecting UI then recovery with fresh snapshot matching REST depth.
7. Reload once; no duplicate rows/listeners/sockets.
8. Open `/api/docs`; confirm Swagger loads; confirm API CSP remains strict on `/api/*`.
9. Desktop + narrow viewport: primary sections usable; connection status visible.
10. Tab through primary controls; focus visible enough to operate.

Mark each step PASS/FAIL in the submission hand-off if browser becomes available before Task 36.
