# ClearHouse Task 9 — Input validation and baseline security

**Start commit:** `3464e2b` (Task 8 on master)  
**Working branch:** `task-09`  
**Official submission branch:** `master` → `origin/master`

---

## Official Task 9 coverage

| Test | Location | Defect | Fix |
|---|---|---|---|
| **0p-1** | `orderController.create` | `"0"` matched digit regex | reject quantity/price `<= 0n` before risk/engine |
| **0q-1** | `riskController.setLimits` | only `typeof === "number"` | require finite integer `>= 0`; standard envelope |
| **0r-1** | `marketDataController.parseTrades` | `BigInt("abc")` / `BigInt("1.5")` threw | integer-string gate before BigInt |
| **0s-1** | `server.statusOf` | always 500 | map parse/body-parser client errors to 400 |
| **7d-1** | `express.json` limit | `100mb` accepted 2MB body | limit `1mb` → 413 |
| **7d-2** | missing depth guard | 1000-level nest accepted | `rejectDeepJson` (max depth 64) → 400 |
| **7e-1** | `securityHeaders` / Express | missing nosniff/DENY; powered-by | headers + `app.disable("x-powered-by")` |
| **7e-2** | error handler | already generic | preserved (no stack/path) |

Out of scope: Challenge 7a–7c mass-assignment/pollution rewrites; later market-data aggregation features.

---

## Changed files

| File | Change |
|---|---|
| `src/controller/orderController.ts` | positive quantity/price(/stopPrice) before engine |
| `src/controller/riskController.ts` | integer `maxOpenOrders >= 0`; envelope |
| `src/controller/marketDataController.ts` | strict integer strings for trades |
| `src/server.ts` | disable powered-by; 1mb limit; statusOf; depth middleware |
| `src/middleware/securityHeaders.ts` | nosniff + DENY |
| `src/middleware/rejectDeepJson.ts` | iterative depth guard (new) |
| `docs/clearhouse-task-09-input-security.md` | this note |
| `tests/task09-input-security-extra.test.ts` | participant extras (optional) |

HMAC `verify` / `rawBody` capture preserved. Organiser tests/config untouched.

---

## Verification

| Command | Exit | Result |
|---|---|---|
| `npm run typecheck` | 0 | pass |
| `00b -t 0p\|0q\|0r\|0s` | 0 | **4 passed** |
| `07 -t 7d\|7e` | 0 | **4 passed** |
| `task09-input-security-extra` | 0 | **3 passed** |
| `challenge00` / `challenge01` / `_sanity` | 0 | **40 passed** |
| Prior `0g–0o` / `0w–0z` smoke | 0 | all green |
