# ClearHouse Task 10 — Double-Entry Ledger (Challenge 02)

**Base:** `origin/master` @ `4904189` (Tasks 1–9)  
**Working branch:** `task-10`  
**Official submission branch:** `master` → `origin/master` (not committed/pushed until review)

---

## Behaviours implemented

| Area | Behaviour |
|---|---|
| `assertBalanced` | Per-asset BigInt sums; nonzero → `UnbalancedEntryError` |
| `reversePostings` | Exact negate; new array |
| `isDebitNormal` | asset/expense debit-normal |
| `insertBalancedEntry` | Assert → insert entry + postings on supplied executor |
| `postEntry` | Knex transaction around insert |
| `reverseEntry` | Append-only compensating entry; `reversal_of_entry_id` |
| `deriveBalance` | Exact BigInt sum; `asOfEntryId` via entry `seq`; optional `asOf` timestamp |
| `trialBalance` | All postings grouped by asset |
| `statementPage` | Keyset on posting `seq`; `limit+1` cursor |

Controller/routes/API envelopes unchanged. Migrations untouched.

---

## Verification

| Command | Exit | Result |
|---|---|---|
| `npm run typecheck` | 0 | pass |
| `npm test challenge02.test.ts` | 0 | **8/8** |
| `npm test challenge01.test.ts` | 0 | **23/23** |
| `npm test challenge00.test.ts` | 0 | **6/6** |
| `npm test _sanity.test.ts` | 0 | **11/11** |
| `git diff --check` | 0 | clean |

Tests / config / package / migrations: **unchanged**.

---

## Files changed

- `src/domain/ledger.ts`
- `src/repositories/ledgerRepository.ts`
- `docs/clearhouse-task-10-ledger.md` (this note)
