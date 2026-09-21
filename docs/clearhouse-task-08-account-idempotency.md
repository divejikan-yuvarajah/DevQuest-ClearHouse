# ClearHouse Task 8 — Account balances, idempotency, account helpers

**Start commit:** `1165d06` (Tasks through 7 on master)  
**Working branch:** `task-08`  
**Official submission branch:** `master` → `origin/master`  
**Dirty at start:** untracked Task 08 prompt only

---

## Official Task 8 coverage

| Test | Source | Defect | Fix |
|---|---|---|---|
| Challenge **0l-1** | `balanceToJson` | `total` was `available` only | `total = available + held` |
| Challenge **0l-2** | `getBalance` | defaulted missing asset to `"USD"` | require `asset` query → 400 |
| Challenge **0l-3** | `writeBalance` | update wrote `available` only | update both columns |
| Challenge **0m-1** | `withIdempotency` | ran op before replay; no hash check on conflict | load-before-run; hash compare; conflict on mismatch |
| Challenge **0n-1** | `assertOpen` | `status === null` treated as closed | reject only `"closed"` |
| Challenge **0n-2** | `createAccount` | DB default `pending` | insert `status: "active"` |
| Challenge **0o-1/2** | `createAccount` | invalid type AND blank name (AND bug) | reject if either invalid |
| Challenge **0o-3** | accounts migration | `name` UNIQUE blocked duplicates | remove UNIQUE on `name` |
| Challenge **0w-1** | `withIdempotency` | concurrent callers all ran `operation` | process-local single-flight map |
| Challenge **0y-1** | `readBalance` | `BigInt(Number(...))` lost precision | `BigInt(row.available/held)` |

Out of scope (later tasks): `hold` / `release` / `deposit` / `withdraw` / `settleTrade` / `closeAccount`.

---

## Changed files

| File | Change |
|---|---|
| `src/repositories/settlementRepository.ts` | BigInt-safe read; write both cols; hash-checked durable + single-flight idempotency |
| `src/repositories/accountsRepository.ts` | `assertOpen` ignores missing accounts |
| `src/controller/settlementController.ts` | total = available+held; require asset |
| `src/controller/ledgerController.ts` | OR validation; status `active` |
| `db/migrations/20260101000001_create_ledger_tables.ts` | drop UNIQUE on `accounts.name` (required by 0o-3) |
| `docs/clearhouse-task-08-account-idempotency.md` | this note |
| `tests/task08-account-idempotency-extra.test.ts` | participant extras |

Protected organiser `tests/challenge*`, `config/`, `vitest.config.ts` — **not modified**.

### Migration note

Challenge **0o-3** asserts two CREATED accounts may share a display name. The original migration marked `name` UNIQUE, which caused 500 on the second insert. Editing the create-table migration is the smallest fix that matches the contract (tests rebuild schema via migrate). No new UNIQUE/name-rejection logic was added in the controller.

---

## Verification

| Command | Exit | Result |
|---|---|---|
| `npm run typecheck` | 0 | pass |
| `00b -t 0l\|0m\|0n\|0o` | 0 | **9 passed** / 15 skipped |
| `00c -t 0w\|0y` | 0 | **2 passed** / 4 skipped |
| `task08-account-idempotency-extra` | 0 | **4 passed** |
| `00b -t 0g\|0h\|0i\|0j\|0k` | 0 | **8 passed** (prior Tasks 3–7) |
| `00c -t 0x\|0z` | 0 | **4 passed** |
| `challenge00` | 0 | **6/6** |
| `challenge01` | 0 | **23/23** |
| `_sanity` | 0 | **11/11** |

Settlement mutations (`hold`/`deposit`/…) remain stubbed for later tasks.

---

## Policies

- No organiser test edits
- Settlement mutation APIs left as `NotImplementedError`
- Idempotency single-flight is process-local (acceptable for single-process SQLite challenge)
- Official push target remains `origin/master` after merge
