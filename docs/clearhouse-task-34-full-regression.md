# ClearHouse Task 34 — Full Regression & Production Repair

## Identity

| Field | Value |
| --- | --- |
| Task34 starting commit | `97ce8a755b2593af3584550b4e8192b38770bcfd` |
| Working branch | `task-34` |
| Official final branch | `master` |
| Official remote | `origin` → CodeCommit `5af51b5f-8b96-4c51-aef1-e5557702842b` |
| Node | `v24.10.0` |
| npm | `11.6.1` |

## Pre-existing dirty / staged state at start

- Untracked only: `prompts/ClearHouse_Cursor_Prompt_Task_*.md` (10–35)
- No staged production changes
- Task 33 integration commit `29d51a1` is an ancestor of starting HEAD (Task 33 represented on `master`)

## Protected files (Task34 delta)

```text
git diff 97ce8a755b2593af3584550b4e8192b38770bcfd -- tests config vitest.config.ts package.json package-lock.json
→ empty
```

No organizer tests, config, Vitest config, package scripts, or lockfile changes.

Grading upload (`config/result.ts`) was **not** executed. No score was guessed.

## Baseline

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS (exit 0) |
| `npm test _sanity.test.ts` | PASS — 11/11 |
| `npm test` (baseline) | FAIL — **1 failed / 278 passed** (31 files: 1 failed / 30 passed) |

### Baseline failure matrix

| Test | Assertion / symptom | Failure type | First wrong layer | Owner | Focused repro | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Challenge 4a-4 | `Response timeout of 4000ms exceeded` on `/api/settlement/holds` under 100-way concurrency | concurrency / lifecycle (full-suite only) | Settlement hold path stampeding SQLite single-connection pool | Challenge 04 | Passes alone (~687ms); fails in full `npm test` | **FIXED** |

All other Challenges 00/00b/00c and 01–21 passed in the baseline full suite.

## Root cause (4a-4)

- Test DB uses SQLite `:memory:` with **pool `{ min: 1, max: 1 }`** (`knexfile.js`).
- `hold()` opened a **new Knex transaction per request**.
- 100 concurrent holds queued on the single connection; under full-suite CPU contention each txn slowed enough that later HTTP calls exceeded the fixed **4000ms** superagent response timeout in `tests/testBase.ts`.
- Isolated Challenge 04 stayed fast enough to pass — classic full-suite-only contention.

Invariant violated: concurrent holds against a finite available balance must each complete with 200 or 409 **without hanging**, yielding exactly `available` successes.

## Fix

File: `src/repositories/settlementRepository.ts`

1. Added per-`accountId+asset` **`withBalanceGate`** promise chain so same-balance mutations never stampede.
2. Reworked **`hold` / `release`** to run under that gate **without** a nested Knex transaction (safe because the gate serializes same-key writers and the pool is single-connection).

Did **not**: raise timeouts, reduce concurrency, freeze seeds, or touch tests/config.

## Verification after fix

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test challenge04.test.ts` | PASS — 9/9 (4a-4 ~486ms in full suite) |
| `npm test` (final mandatory) | PASS — **31/31 files, 279/279 tests** |
| `git diff --check` | clean |

## Final known-status matrix

| Suite | Status |
| --- | --- |
| typecheck | PASS |
| `_sanity` | PASS |
| Challenge 00 | PASS |
| Challenge 00b | PASS |
| Challenge 00c | PASS |
| Challenge 01 | PASS |
| Challenge 02 | PASS |
| Challenge 03 | PASS |
| Challenge 04 | PASS |
| Challenge 05 | PASS |
| Challenge 06 | PASS |
| Challenge 07 | PASS |
| Challenge 08 | PASS |
| Challenge 09 | PASS |
| Challenge 10 | PASS |
| Challenge 11 | PASS |
| Challenge 12 | PASS |
| Challenge 13 | PASS |
| Challenge 14 | PASS |
| Challenge 15 | PASS |
| Challenge 16 | PASS |
| Challenge 17 | PASS |
| Challenge 18 | PASS |
| Challenge 19 | PASS |
| Challenge 20 | PASS |
| Challenge 21 | PASS |

Property/random, OpenAPI, WS, dashboard: no remaining failures after the hold fix.

## Property / concurrency / performance / lifecycle notes

| Category | Encountered? | Notes |
| --- | --- | --- |
| Property/random | No failing seeds after fix | Baseline had no property failures |
| Concurrency | **Yes** | 4a-4 SQLite pool stampede → serialized via `withBalanceGate` |
| Performance | Related | Same root cause; no timeout increases |
| Open handles | None observed | Suite exits cleanly |
| Flaky | 4a-4 was environment-sensitive | Stable after serialization (full suite green) |

## Exact Task34 changed files

- `src/repositories/settlementRepository.ts` — hold/release serialization
- `docs/clearhouse-task-34-full-regression.md` — this note

## Suggested commit

```text
fix: resolve final regression failures
```

## Master merge/push workflow (after approval)

```bash
git status -sb
git branch --show-current
git diff --check
git diff --stat
git diff --name-only

git add -- docs/clearhouse-task-34-full-regression.md
git add -- src/repositories/settlementRepository.ts

git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached

git commit -m "fix: resolve final regression failures"

git switch master
git fetch origin
git pull --ff-only origin master
git merge --ff-only task-34

npm run typecheck
npm test
git diff --check
git status -sb

git push origin master

git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

Organisers require **`master`**. Do not treat `main` as the sole final submission branch.
