# ClearHouse Task 19 — Reconciliation and Legacy Migration

## Scope

Challenge 09 visible tests (4):

- **9a-1 / 9a-2** — trial balance per asset sums to `0` (empty ledger → `byAsset` empty, `balanced: true`)
- **9b-1 / 9b-2** — idempotent non-destructive `normalized_name` backfill; rollback drops derived column only

`config/scores.ts` maps these to **45** published points (`45/100`). Overview remainder (daily per-market report, PIT export under concurrency, dirty-dataset quarantine) is **not** in the visible suite.

## 9a — Trial balance

Task 10 `trialBalance()` already satisfies 9a — no ledger changes in Task 19.

- Group postings by asset; each asset sum must be `0n` (BigInt, no cross-asset netting).
- Empty ledger: `balanced: true`, `byAsset: {}`.

## 9b — Migration `db/migrations/20260101000005_backfill_normalized_account_names.ts`

| Item | Value |
|---|---|
| Table | `accounts` |
| PK | `id` |
| Source | `name` (preserved exactly) |
| Derived | `normalized_name` |
| Rule | `name.trim().toLowerCase()` |

### `up`

1. Add `normalized_name` only if missing (`hasColumn` → idempotent schema).
2. For each row by `id`: set `normalized_name = normalize(name)` from **source** (never from derived).

### `down`

1. Drop `normalized_name` if present.
2. **Do not** copy normalized values back into `name`.

Rerunning `up` after success recomputes the same derived values from unchanged `name` — no progressive corruption.
