# ClearHouse Task 1 — Repository audit and implementation map

**Audit time:** read-only inspection of the current CodeCommit checkout.  
**No packages installed, no DB reset, no server start, no challenge suite run.**

---

## 1. Current state

| Item | Value |
|---|---|
| Branch | Local `main` |
| HEAD | `1bc32c21607a251a7827dd3b05b2cb130d800af7` (“Initial Commit”) |
| Working tree | Dirty: untracked `prompts/` (pre-existing) + this audit’s `docs/`. No staged changes. |
| Upstream | `origin` → CodeCommit `…/5af51b5f-8b96-4c51-aef1-e5557702842b` (fetch/push; credentials not printed) |
| Tracking mismatch | Local `main` currently tracks **`origin/master`** (remote `HEAD` → `master`). **User confirmed submission destination: `origin/main`.** First verified push should be `git push -u origin main` (creates/updates remote `main`); do not rename or delete `master` unless the assessment requires it. |
| Detached HEAD / conflicts | None |
| Runtime on host | Node `v24.10.0`, npm `11.6.1` (engines: `>=18.19`; guide prefers 20/22 — 24 is newer; Task 2 must validate native `sqlite3`/`bcrypt` bindings) |
| Local artifacts | **Absent:** `.env`, `package-lock.json`, `node_modules/`, `main.sqlite3`, `main.sqlite` |
| AGENTS.md / Challenges.md in workspace | Not present (README points to external DevQuest guide) |
| Reference commit (historical) | `36bfeaf…` — **not** used as reset target; facts verified against this checkout |

---

## 2. Observed structure and scripts

**Stack (preserve):** TypeScript ESM, Express, Knex, SQLite, Vitest, plain browser client under `client/`.

**Layout:**
- `src/` — `server.ts` (exports HTTP **server**, not bare app), routes → controllers → domain / repositories / services / middleware
- `db/` — `db-config.ts`, 6 migrations, 2 seeds (`00_noop.ts` used by tests; `01_initial_accounts.ts` is a no-op for Task 23)
- `tests/` — `_sanity` + `challenge00`…`challenge21` (+ `00b`/`00c`); `setup.ts` registers tsx; `testBase.ts` sets `NODE_ENV=test` and default HMAC secret
- `config/` — scoring, buildspec, grading helpers (**do not run** `config/result.ts`)
- `client/` — `index.html`, `js/{app,dashboard,signer,liveFeed}.js`, `styles/dashboard.css`

**Scripts (`package.json`):**
| Script | Behaviour |
|---|---|
| `start` / `start-dev` | `tsx` / watch on `src/server.ts` |
| `migrate` | **Destructive:** `delete-db` then `migrate:latest` |
| `delete-db` | `del-cli main.sqlite` ← **mismatch** with knex `main.sqlite3` |
| `seed` | knex seed:run (demo seed still empty) |
| `typecheck` | `tsc` app + `tests/tsconfig.json` |
| `test` | `vitest` (`watch: false`, JUnit → `test-results.xml`) — **protected** |

**Dev DB:** `knexfile.js` → `./main.sqlite3`. Test DB: `:memory:` with `pool: { min: 1, max: 1 }`.

**Startup:** `startLiveHub(server)` catches hub constructor failure and continues without WS — unimplemented hub is **not** a startup blocker.

**Env usage (names only):** `PORT` (default 3001), `NODE_ENV`, `HMAC_SECRET` (required for non-test signed `/api/secure` routes; tests fall back to a default). Sanity also requires `.env` keys `PORT` and `JWT_PRIVATE_KEY` (session JWT helpers are still stubs).

---

## 3. Protected boundaries

Do **not** edit: `tests/**`, `config/**`, `vitest.config.ts`, `package.json` `scripts.test`.

Inherited test scaffolding (leave intact): `tests/setup.ts`, `tests/testBase.ts` (`NODE_ENV=test`, HMAC default, request timeouts, migrate rollback+seed `00_noop` only).

No baseline application fixes observed beyond starter defects; only untracked `prompts/` outside this audit deliverable.

---

## 4. Challenge → file → task coverage map

| Challenge / file | Category | Primary implementation surfaces | Dependencies | Key invariants | Stub / defect evidence | Later task |
|---|---|---|---|---|---|---|
| `_sanity.test.ts` | Setup (unscored) | env, deps, migrate, `/api/assets`, 404 envelope | Node≥18.19, `.env`, `main.sqlite3`, install | 11 checks; one requires local `main.sqlite3` | Env files missing until Task 2 | **2** |
| `challenge00` 0a–0f | Bug | `rbac`, `hmacAuth`, `asyncHandler`, `httpStatus`, `securityHeaders`, `cache` | — | Role guard, nonce replay, async→next, 401/403, CSP name, invalidate | Working-looking defects (inverted role check, swapped status codes, CSP typo, invalidate no-op, nonce expiry stored in past) | **3** |
| `challenge00b` 0g–0v | Bug | `httpStatus`, `assets`, `cache` TTL, `riskRegistry`, `matchingEngine`, settlement balance helpers/controller, accounts, ledger create, order/risk/MD validation, `signer.js`, `index.html`/`app.js`, `delete-db` | money/registry for some | Standard status literals; asset exponents; TTL ms; take-once reservation; kill-switch reset; isolated limits; cancel not-found; empty book null prices; total=avail+held; asset required; write both cols; idempotency body hash; assertOpen null≠closed; create validation; zero qty/price; dashboard DOM IDs; delete-db filename | Confirmed script mismatch `main.sqlite` vs `main.sqlite3` (0v); many planted bugs in “working” code | **3–8, 22** (0v → **2**) |
| `challenge00c` 0w–0z | Bug | `withIdempotency` races; asset mutability; BigInt balances; cache expiry cleanup; risk state privacy | settlement repo, assets, cache, risk | Concurrent idempotency once; registry freeze; >2^53 exact; lazy TTL delete; private empty risk state | Defects / shared-state issues in shipped helpers | **7–8** |
| `challenge01` | Feature (+ HMAC/auth) | `money.ts`, `assets`, `signing`, `hmacAuth`, `session`, RBAC routes | assets exponents | BigInt internal; string amounts at JSON; half-even/up; HMAC window/nonce/algo; tokens/roles/tenant | All money/signing/session = `NotImplementedError` | **4–6** |
| `challenge02` | Feature | `ledger.ts`, `ledgerRepository`, ledger routes | money | Balanced per asset; append-only + reverse; as-of; statement pages | Stub repo/domain | **10** |
| `challenge03` | Feature | `matching.ts`, `orderBook.ts`, `matchingEngine`, order controller | risk later | Price-time priority; TIF; **3j** stateful randomized book vs reference | Domain matching/book stubs; engine cancel/bestPrices defects | **14–16** |
| `challenge04` | Feature | `settlement` domain/repo/controller | ledger, BigInt balances | Holds/releases; deposits/withdrawals; idempotency; atomic settleTrade | Stub hold/release/deposit/withdraw/settleTrade; balance total bug; writeBalance partial update | **11–13** |
| `challenge05` | Feature | `risk.ts`, `riskRegistry`, risk routes | matching | Reservations, limits, kill switch | Domain risk stubs; registry take/reset/limits bugs | **17** |
| `challenge06` | Feature | `events.ts`, event repo/controller | ledger | Hash chain, replay, balance JSON | Stubs | **26** |
| `challenge07` | Feature/security | controllers + middleware | — | Injection, mass-assign, pollution, 413, headers, no stack leak | Partial headers; error handler thin | **9** |
| `challenge08` | Feature | `marketData.ts`, market-data routes | — | OHLCV, rollup, gaps, VWAP | Stubs | **27** |
| `challenge09` | Feature | trialBalance, migration `…05_backfill…` | ledger | TB=0; migration up/down idempotent | Stub trialBalance; migration present | **19** |
| `challenge10` | Feature | `opsController`, `logging`, `rateLimit`, `metrics` | — | health/ready/metrics; JSON logs; 429 | Controllers + TODOs stubbed | **20** |
| `challenge11` | Feature | cache usage, config routes, API shape | cache | Cache invalidation on writes; config get/put | config controller stubs; cache bugs | **21** |
| `challenge12` | Feature | `dashboard.js`, `signer.js`, HTML/CSS | HMAC message shape | Render/XSS/states; **12d** browser signing payload; formatMinorUnits; a11y | Signer joins with `\|` vs server `\n` (0t/12d); DOM id mismatch `market-input` vs `market-name` (0u) | **22, 24** |
| `challenge13` | Feature | `closeAccount`, ledger | balances zero | Closure rules | Stub closeAccount; assertOpen treats null as closed | **18** |
| `challenge14` | Feature | `netting.ts` | settlement | Multilateral net | Stub | **29** |
| `challenge15` | Feature | `strategyOrders.ts` | matching | OCO/bracket/iceberg/trailing | Stub StrategyEngine | **30** |
| `challenge16` | Feature | `fees.ts` | ledger | Exact fees, tiers, idempotency, scale | Stub FeeEngine | **28** |
| `challenge17` | Feature | `liveFeed.js` + hub publish | WS | Live dashboard updates | Client present; hub unimplemented | **32** |
| `challenge18` | Feature | `wsHub.ts`, `liveHub.ts`, `diffDepth` | session verify | Auth WS, seq, heartbeat, fan-out | Hub methods throw; liveHub swallows | **31** |
| `challenge19` | Feature | `docsController` | — | OpenAPI + Swagger UI | Stubs | **25** |
| `challenge20` | Feature | seed `01_…`, accounts list API, dashboard demo | ledger/settlement | Funded demo accounts | Seed no-op; `listAccounts` throws | **23–24** |
| `challenge21` | Feature | cross-cutting | many | Integration paths | Depends on prior features | **33** |

**Bug-scored tests embedded outside challenge00\*:** scoring names are driven by JUnit describe chains in the listed files; Challenge 00 parts also live in `00b`/`00c`. Treat official tests as behavioural spec.

**Suggested dependency order (implementation):** Task 2 setup → 3 core infra bugs → 4 money → 5 HMAC → 6 tokens → 7–9 shared-state/account/input → 10 ledger → 11–13 settlement → 14–17 matching/risk → 18–21 ops/API → 22–25 UI/docs/seed → 26–32 events/MD/fees/netting/strategies/WS → 33–36 integration/regression/demo/submit.

---

## 5. Static scoring totals (available points — not earned)

From `config/scores.ts` in this checkout:

| Bucket | Entries | Points |
|---|---|---|
| Bugs | **45** | **922** |
| Features | **193** | **2737** |
| Combined raw | 238 | 3659 |

Guide weights bug vs feature categories separately — do not convert raw totals into a single % without the grading formula. **No tests were run; these are not earned scores.**

---

## 6. Verified defects vs hypotheses

### Verified (location → current → expected → test)

1. **`package.json` `delete-db`** deletes `main.sqlite`; knex uses `main.sqlite3` → Challenge **0v** → **Task 2** (allowed fix).
2. **`httpStatus.ts`:** `UNAUTHORIZED=403`, `FORBIDDEN=401`, plus wrong `PRECONDITION_FAILED`/`SERVICE_UNAVAILABLE`/`NOT_IMPLEMENTED` → 0d/0g → Task 3.
3. **`rbac.requireRole`:** rejects when `role ===` required (and when missing principal with wrong branch) → should accept matching role → 0a → Task 3.
4. **`securityHeaders`:** sets `Content-Security-Policyy` → CSP → 0e → Task 3.
5. **`cache.invalidate`:** reads entry, does not delete → 0f → Task 3/7.
6. **`cache.set`:** `ttlMs * 1000` treats ms as seconds → 0i → Task 7.
7. **`hmacAuth`:** stores nonce expiry as `now - WINDOW` (past) so sweep can clear before replay check → 0b → Task 3/5.
8. **`asyncHandler`:** does not `.catch` → rejected promises may not reach `next` → 0c → Task 3.
9. **`assets.ts`:** BHD exponent 2 (expect 3), BTC 6 (expect 8) → 0h → Task 4.
10. **`settlementController.balanceToJson`:** `total = available` only → 0l-1 → Task 8.
11. **`getBalance`:** defaults missing `asset` query to `"USD"` instead of 400 → 0l-2 → Task 8.
12. **`writeBalance`:** update path omits `held` → 0l-3 → Task 8.
13. **`readBalance`:** `BigInt(Number(...))` loses precision >2^53 → 0y → Task 8.
14. **`withIdempotency`:** no pre-check / weak race handling; conflict path may not compare hash → 0m/0w → Task 8.
15. **`assertOpen`:** `status === null` treated as closed → 0n-1 → Task 8.
16. **`createAccount` validation:** `(!ACCOUNT_TYPES.has(type) && name.trim() === "")` allows bad types with non-blank names; no `status: active`; accounts.name unique in migration vs 0o-3 expecting shared names → 0n-2/0o → Task 8 (migration uniqueness may need care).
17. **`riskRegistry`:** `takeReservation` does not delete; `resetAll` omits kill switch; `getLimits` falls through to another account’s limits → 0j → Task 7.
18. **`matchingEngine.cancel`:** unknown id → `{ found: true, … }`; `bestPrices` returns `"0"` not `null` → 0k → Task 7.
19. **`client/js/signer.js`:** message joined with `|` not `\n` → 0t / 12d → Task 22.
20. **Dashboard DOM:** `app.js` uses `market-input`; `index.html` has `market-name` → 0u → Task 22.

### Missing features (explicit `NotImplementedError` / TODO)

Money, signing, session tokens, ledger domain/repo, settlement mutations, matching domain/book insert, risk domain, market data, events, fees, netting, strategies, ops health/ready/metrics, config, docs/OpenAPI, WS hub, `listAccounts`, stops in engine, logging/rateLimit TODOs (Challenge 10).

### Environment / setup (not code bugs)

Missing `.env`, lockfile, `node_modules`, `main.sqlite3`. Node 24 may need confirmation for native modules.

### Hypotheses (need Task 2+ test runs)

- Exact failure modes for Challenge 7 payload limits / error disclosure.
- Whether accounts.name unique constraint blocks 0o-3 until migration adjusted (inspect migration vs test carefully before changing schema).
- Full property-test counterexamples for matching 3j and money 1a/1b.

---

## 7. Key contracts (implementation constraints)

- **Money:** BigInt internally; JSON amount **strings**; asset exponents; parse/serialise round-trip; rounding conserves value (`divideWithRounding` / `applyRate`).
- **Ledger:** balanced postings **per asset**; trial balance zero; reversals; as-of derive; statement pagination.
- **Settlement:** available/held/total consistency; atomic hold/deposit/withdraw/settle; idempotency key + body hash; SQLite single-connection discipline in tests.
- **Matching:** price-time priority; order lifecycle; book uncrossed; DB rollback ≠ automatic in-memory book restore (`resetAllBooks` in tests).
- **Risk:** reservations once; per-account limits; kill switch cleared on reset.
- **API envelopes:** `{ data, meta }` success; `{ error: { code, details } }` errors; permission codes as tests assert (after status enum fix).
- **HMAC:** METHOD/path/bodyDigest/timestamp/nonce joined with **newlines**; window + nonce replay; algorithm check.
- **Snapshots/WS:** per-topic sequences; reconnect/resync; browser DOM IDs; signing payload shape (12d).
- **Perf / property:** retain seeds/counterexamples; do not hardcode generators’ inputs into production.

---

## 8. Task 2 exact scope

| Concern | Finding | Task 2 action |
|---|---|---|
| `delete-db` filename | Mismatch confirmed | Change only to `del-cli main.sqlite3` |
| `.env` | Absent | Create demo-only `PORT=3001`, random `JWT_PRIVATE_KEY`, and `HMAC_SECRET` (signed routes need it outside test) — never print values |
| Lockfile / install | Absent | `npm install`; keep generated `package-lock.json`; validate native modules load |
| Node | v24.10.0 | Prefer existing compatible runtime; if sqlite3/bcrypt fail, try Node 22 before changing deps |
| `main.sqlite3` | Absent | After fix: `npm run migrate` then `npm run seed` (seed success ≠ demo funding) |
| Sanity | 11 tests | Expect typecheck + all sanity green after setup; DB file check requires migrate |
| Protected | tests/config/vitest/test script | Do not modify |
| liveHub | Tolerates missing hub | Not a setup blocker |
| Browser | Live Server + relative `/api/…` fetches | Record if not runnable; client expects same-origin API |
| Failure handling | Stop on migrate/install failure; do not loop destructive migrate; backup only if a real DB exists (none now) | |

---

## 9. Highest-priority next implementation tasks

1. **Task 2** — install, `.env`, fix `delete-db`, migrate/seed, typecheck + `_sanity`, focused 00/01/0v baseline.  
2. **Task 3** — Challenge 00 core infra bugs (status codes, RBAC, asyncHandler, CSP, HMAC nonce storage, cache invalidate).  
3. **Task 4–6** — money/assets, HMAC signing, session/RBAC end-to-end.  
4. Then registry/cache/shared-state and account/idempotency helpers (Tasks 7–8) before ledger/settlement features.

---

## 10. Uncertainties

- Official Challenges Markdown / guide not in this checkout (external URL only).
- Node 24 vs recommended 20/22 for native addons — unproven until install.
- User confirmed push target is `origin/main` (local still tracks `origin/master` until upstream is updated on first push).
- Whether any teammate work lands on the remote before Task 2 push — recheck remotes before publishing.
- **Explicit:** **no tests were executed during this audit**; defect list for planted bugs is from static reading against test assertions, not from a green/red run.

---

## Suggested Git (do not auto-run)

If typecheck is unavailable until Task 2 installs deps, defer commit of this note until then, or commit docs-only after acknowledging typecheck was not run.

```powershell
npm run typecheck
git add -- docs/clearhouse-task-01-audit.md
git diff --cached --check
git diff --cached --stat
git commit -m "docs: map ClearHouse challenges and setup requirements"
git push origin main
git rev-parse --verify HEAD
git ls-remote origin refs/heads/main
```
