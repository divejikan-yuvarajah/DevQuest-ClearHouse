# ClearHouse Task 12 — Idempotent deposits and withdrawals (Challenge 04b)

**Base:** `origin/master` @ `f78ba27`  
**Working branch:** `task-12`  
**Official submission:** `master` (not committed/pushed until review)

---

## Scope

| Item | Status |
|---|---|
| `deposit()` via `withIdempotency` | done |
| `withdraw()` via `withIdempotency` | done |
| Hold/release (needed for 4a + 4b-3; was still stubbed) | done |
| `settleTrade()` / Challenge 4c | **not** implemented (Task 13) |

---

## Behaviours

- **Deposit:** `available += amount`, `held` unchanged; wrapped by existing `withIdempotency()`.
- **Withdraw:** `available -= amount` only if `amount <= available`; never touches `held`; insufficient → `InsufficientAvailableError`.
- **Replay:** same key+body → single mutation, stored response returned (single-flight + durable row).
- **Conflict:** same key, different body → `IdempotencyConflictError` → HTTP 409.
- **Hold/release:** transactional `applyHold` / `applyRelease` for Challenge 4a regression.

---

## Files changed

- `src/domain/settlement.ts`
- `src/repositories/settlementRepository.ts`
- `docs/clearhouse-task-12-deposit-withdraw-idempotency.md`

Controller unchanged (already wired).

---

## Verification

| Command | Exit | Result |
|---|---|---|
| typecheck | 0 | pass |
| Challenge 4b | 0 | **3/3** |
| Challenge 4a | 0 | **4/4** |
| 4a\|4b | 0 | **7/7** |
| Challenge 0m | 0 | **1/1** |
| Challenge 0w | 0 | **1/1** |
| challenge02 | 0 | **8/8** |
| challenge01 | 0 | **23/23** |
| challenge00 | 0 | **6/6** |
| `_sanity` | 0 | **11/11** |
| `git diff --check` | 0 | clean |
| full `npm test` | 1 | **158 passed / 121 failed** — later challenges stubbed; Challenge **4c** expected fail (Task 13) |
