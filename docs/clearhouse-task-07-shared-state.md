# ClearHouse Task 7 — Shared-state, cache expiry, risk/matching isolation

**Start commit:** `393f40c` (Task 6 sessions)  
**Working branch:** `task-07`  
**Official submission branch:** `master` → `origin/master` (earlier `main` wording is outdated)  
**Dirty at start:** none (only untracked Task 07 prompt)

---

## Official Task 7 coverage (current checkout)

| Test | Source | Defect | Fix |
|---|---|---|---|
| Challenge **0i** TTL | `cache.set` | `ttlMs * 1000` treated ms as seconds | `expiresAt = now + ttlMs` |
| Challenge **0z-1** cleanup | `cache.get` | expired entry left in map | `store.delete` on expiry |
| Challenge **0f** (Task 3) | `cache.invalidate` | already correct | preserved |
| Challenge **0h/0x** | `assets.ts` | already Task 4 | verified, no edit |
| Challenge **0j-1** | `takeReservation` | get without delete | delete then return |
| Challenge **0j-2** | `resetAll` | kill switch not cleared | `killSwitchEngaged = false` |
| Challenge **0j-3** | `getLimits` | fell through to another account’s limits | defaults / per-account copies |
| Challenge **0z-2** | `getState` | shared `EMPTY_STATE` reference | return fresh empty / copies |
| Challenge **0k-1** | `cancel` | unknown id `found: true` | `found: false` |
| Challenge **0k-2** | `bestPrices` | empty book `"0"` | `null` |

Out of scope (later tasks): **0w** idempotency races, **0y** BigInt balances (Task 8).

---

## Changed files

| File | Change |
|---|---|
| `src/services/cache.ts` | ms TTL; delete on expired get |
| `src/services/riskRegistry.ts` | isolated limits/state; take-once reservation; kill-switch reset |
| `src/services/matchingEngine.ts` | cancel not-found; empty book null prices |
| `tests/task07-shared-state-extra.test.ts` | participant extras |
| `docs/clearhouse-task-07-shared-state.md` | this note |

`src/domain/assets.ts` — **unchanged** (Task 4 retained).

Protected `tests/` (organiser), `config/`, `vitest.config.ts`, `scripts.test` — **not modified**.

---

## Verification

| Command | Exit | Result |
|---|---|---|
| `npm run typecheck` | 0 | pass |
| `00b -t 0h\|0i\|0j\|0k` | 0 | **7 passed** / 17 not exercised |
| `00c -t 0x\|0z` | 0 | **4 passed** / 2 not exercised |
| `task07-shared-state-extra` | 0 | **3 passed** (participant) |
| `challenge00` | 0 | **6/6** |
| `challenge01` | 0 | **23/23** |
| `_sanity` | 0 | **11/11** |
| Full `npm test` | 1 | **80 passed / 192 failed** (272); 7 files passed — later features still stubbed |

---

## Policies

- Cache: expired when `expiresAt <= now`; cleanup on read; falsy values (`0`, `false`) remain valid hits.
- Risk: DEFAULT_LIMITS never shared by reference; per-account copies on get/set.
- Matching: Task 7 only empty/cancel helpers — full matching remains later tasks.

---

## Suggested Git (do not auto-run)

```powershell
git add -- src/services/cache.ts src/services/riskRegistry.ts src/services/matchingEngine.ts tests/task07-shared-state-extra.test.ts docs/clearhouse-task-07-shared-state.md
git commit -m "fix: isolate shared state and correct cache expiry"
git switch master
git pull --ff-only origin master
git merge --ff-only task-07
git push origin master
git rev-parse --verify HEAD
git ls-remote origin refs/heads/master
```

**Next:** Task 8 — account/balance/idempotency helper bugs (0l–0o, 0w, 0y).
