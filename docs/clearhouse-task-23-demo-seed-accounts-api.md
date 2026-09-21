# ClearHouse Task 23 — Demo Seed Funding and Accounts API

## Git

- Starting commit: `ad7949b` (`feat: complete operator dashboard`)
- Working branch: `task-23`
- Final submission branch: `master`
- Pre-existing dirty state: untracked `prompts/` only (preserved)

## Challenge 20 contract

**8** organizer tests / **160** points.

### Task 23 scope (80 pts)

| ID | Points | Focus |
|---|---|---|
| 20a-1 | 15 | ≥5 funded `asset` accounts, ≥2 known assets each |
| 20a-2 | 25 | Double-entry funding; trial balance 0/asset; postings ≡ available |
| 20a-3 | 15 | Second seed run is a no-op |
| 20b-1 | 25 | `GET /api/ledger/accounts` lists all accounts + balances by name |

### Task 24 scope (do not implement here)

| ID | Points | Focus |
|---|---|---|
| 20c-1..4 | 20+25+20+15 | Dashboard renderers |

## Demo seed file

`db/seeds/01_initial_accounts.ts`

## Demo account design

| Role | Type | Stable ID | Name |
|---|---|---|---|
| House / funding source | `equity` | `a0000000-0000-4000-8000-000000000001` | ClearHouse Demo Treasury |
| Trader 1 | `asset` | `…0101` | Aurora Capital |
| Trader 2 | `asset` | `…0102` | Beacon Markets |
| Trader 3 | `asset` | `…0103` | Cascade Securities |
| Trader 4 | `asset` | `…0104` | Delta Desk |
| Trader 5 | `asset` | `…0105` | Evergreen Trading |

All traders `status: active`. Unique nonblank names. Each holds ≥2 of `{USD,EUR,JPY,BHD,BTC}` with positive available and `held = 0`.

## Funding model

Per holding: one balanced ledger entry via Task 10 `insertBalancedEntry(trx, …)`:

- trading account: `+amount` (debit / asset increase)
- house equity: `-amount` (credit)

Same asset on both legs. No cross-asset netting.

House has postings but no `account_balances` rows (projection only maintained for funded traders).

## Stored balance projection

`insertBalancedEntry` does **not** update `account_balances`. After each new funding entry the seed writes:

`available = funded amount`, `held = "0"`

for the trading account+asset only. On re-seed, if postings already exist, available is re-derived as the posting sum and written only when drifted.

## Trial balance

Every entry balances per asset; ledger-wide sum per asset is `0n`.

## Idempotency

- Stable deterministic UUIDs (not name-based dedupe).
- Skip account insert when ID exists (no rename/status churn).
- Skip new ledger entry when a posting already exists for trading account+asset.
- No truncate / delete / rebuild / `INSERT OR REPLACE`.
- Single Knex transaction; uses seed-supplied `knex` only (no global DB singleton).

## Partial state

Missing account → create. Missing funding posting → fund. Existing funding → leave ledger alone; optionally repair projection to posting sum.

## Non-demo data

Only the six deterministic IDs above are ensured. Unrelated accounts/ledger history are untouched.

## Accounts API

`GET /api/ledger/accounts` (existing ledger router; also under `/api/v1` via Task 21).

Response:

```json
{ "data": [ { "id", "type", "name", "status", "balances": [ { "asset", "available", "held", "total" } ] } ], "meta": {} }
```

- Sort: `name.toLowerCase()` ASC, then `id`.
- Balances: by `asset` ASC; `total = available + held` as integer strings.
- Accounts with no balance rows → `balances: []`.
- Auth/RBAC unchanged (same route family as before).

## Implementation files

- `db/seeds/01_initial_accounts.ts`
- `src/repositories/accountsRepository.ts` (`listAccountsWithBalances`)
- `src/controller/ledgerController.ts` (`listAccounts`)
- `docs/clearhouse-task-23-demo-seed-accounts-api.md`

## Results (local)

- Typecheck: PASS
- Challenge 20a: 3/3 PASS
- Challenge 20b: 1/1 PASS
- Full Challenge 20: 4/4 Task-23 tests PASS; 20c-1..4 FAIL (`render*` not implemented — Task 24)
- Challenge 02 / 09 / 13 / 0n|0o / 11 / 12 / 10 / 05–00 / sanity: PASS
- Full suite: remaining failures are future stubs (06, 08, 14–19, 21, and Challenge 20c)

## Protected files

Unchanged except designated demo seed: no test/config/package/migration/.env edits.
No Challenge 20c dashboard client work included.

## Suggested commit

`feat: add idempotent demo funding and accounts API`
