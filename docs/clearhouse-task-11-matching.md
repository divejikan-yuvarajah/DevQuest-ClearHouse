# ClearHouse Task 11 — Matching Engine (Challenge 03)

**Note:** The shipped `prompts/ClearHouse_Cursor_Prompt_Task_11.md` file describes Challenge 04a holds; this Task 11 delivery follows the operator instruction to implement **Challenge 03 matching** against `tests/challenge03.test.ts`.

**Base:** `origin/master` @ `e2d671a` (Task 10)  
**Working branch:** `task-11`  
**Not committed/pushed** (awaiting review)

---

## Behaviours

| Area | Implementation |
|---|---|
| Price-time priority | Level map + FIFO queues; trade at maker price |
| Sweeping | Ascending ask / descending bid walk |
| IOC / FOK / POST_ONLY | Match rules + reject codes |
| Self-trade prevention | Cancel resting same-account, continue |
| Stops | Pending queue; trigger on last trade; stop→market, stop_limit→limit |
| Amend | Qty↓ keeps queue; price↑/qty↑ loses priority |
| Concurrency | Sync engine ops → cancel XOR fill |
| Performance | O(levels) insert via price index |
| Risk gate | Minimal `firstViolatedRule` / `reserve` / `release` so HTTP place works |

---

## Files changed

- `src/domain/orderBook.ts`
- `src/domain/matching.ts`
- `src/domain/risk.ts`
- `src/services/matchingEngine.ts`
- `docs/clearhouse-task-11-matching.md` (this note)

---

## Verification

| Command | Exit | Result |
|---|---|---|
| `npm run typecheck` | 0 | pass |
| `npm test challenge03.test.ts` | 0 | **24/24** |
| `npm test challenge02.test.ts` | 0 | **8/8** |
| `npm test challenge01.test.ts` | 0 | **23/23** |
| `npm test challenge00.test.ts` | 0 | **6/6** |
| `npm test _sanity.test.ts` | 0 | **11/11** |
| `git diff --check` | 0 | clean |

Tests / config / package / migrations: **unchanged**.
