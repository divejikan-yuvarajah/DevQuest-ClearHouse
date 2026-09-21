# ClearHouse Task 13 — Atomic trade settlement (Challenge 04c)

**Starting commit:** `08eeeb0` (Task 12 on master)  
**Working branch:** `task-13`  
**Official submission:** `master` (not committed/pushed until review)

---

## `settleTrade()` summary

Single Knex transaction that:

1. Loads balances into a map keyed by `(accountId, asset)` (overlap-safe).
2. Validates seller asset `held >= quantity` and buyer cash `held >= cashAmount`.
3. Consumes those holds; credits buyer asset `available` and seller cash `available`.
4. Writes each unique balance row once.
5. Posts one balanced multi-asset ledger entry via `insertBalancedEntry(trx, …)`.

Does **not** call `postEntry()` (separate transaction) or public `release()`.

### Balance effects

| Leg | Effect |
|---|---|
| Seller traded asset | `held -= quantity` |
| Buyer traded asset | `available += quantity` |
| Buyer cash | `held -= cashAmount` |
| Seller cash | `available += cashAmount` |

### Ledger postings

| Account | Asset | Amount |
|---|---|---|
| Buyer asset | traded asset | `+quantity` |
| Seller asset | traded asset | `-quantity` |
| Seller cash | cash asset | `+cashAmount` |
| Buyer cash | cash asset | `-cashAmount` |

Insufficient held → `InsufficientHeldError` → HTTP 409; full rollback.

---

## Files changed

- `src/repositories/settlementRepository.ts`
- `docs/clearhouse-task-13-atomic-settlement.md`

---

## Verification

| Command | Exit | Result |
|---|---|---|
| typecheck | 0 | pass |
| Challenge 4c | 0 | **2/2** |
| Challenge 04 full | 0 | **9/9** |
| challenge02 | 0 | **8/8** |
| Challenge 0m / 0w | 0 | pass |
| challenge01 | 0 | **23/23** |
| challenge00 | 0 | **6/6** |
| `_sanity` | 0 | **11/11** |
| `git diff --check` | 0 | clean |
| full `npm test` | 1 | **160 passed / 119 failed** — later challenges still stubbed |
