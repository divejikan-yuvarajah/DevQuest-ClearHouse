# ClearHouse Task 3 — Core infrastructure bug fixes

**Starting commit:** `dd22a8510e9bae8608ddb3e9d14cc4a36c54e8aa`  
**Branch:** `main` (submission target `origin/main`)  
**Working tree at start:** clean except untracked `prompts/ClearHouse_Cursor_Prompt_Task_04.md`  
**Prerequisites:** Tasks 1–2 setup verified (deps, `.env`, `main.sqlite3`, typecheck/sanity previously green)

---

## Corrections

### 0a — Role guard (`src/middleware/rbac.ts`)
- **Cause:** `requireRole` rejected when `principal.role === role` (inverted).
- **Fix:** Reject when `!principal || principal.role !== role`; matching role calls `next()`.
- **Test:** Challenge 0a-1. Missing principal still 403 FORBIDDEN; anonymous balance behaviour unchanged via `requireOwnAccount`.

### 0b — Nonce replay (`src/middleware/hmacAuth.ts`)
- **Cause:** Accepted nonces stored with `now - SIGNATURE_WINDOW_MS` (already expired), so `sweepExpired` cleared them before a replay check.
- **Fix:** Store expiry as `now + 2 * SIGNATURE_WINDOW_MS`. Ordering preserved: headers → sweep → window → replay check → verify → record only after success → `next()`.
- **Window reasoning:** A typical ±window acceptance means a request accepted with a future-skewed timestamp can still be replayed until that timestamp ages out (~two windows from receipt). Retention uses the shared `SIGNATURE_WINDOW_MS` constant (not a second hard-coded 30000). `isWithinWindow` / crypto remain stubs — **Task 5** must re-verify end-to-end HMAC; Challenge 0b mocks signing in the test file only.
- **Test:** Challenge 0b-1.

### 0c — Async errors (`src/middleware/asyncHandler.ts`)
- **Cause:** Handler promise was not caught; rejections became unhandled.
- **Fix:** `try { Promise.resolve(handler(...)).catch(next) } catch { next(error) }` so sync throws and async rejections both reach Express `next`. Resolved handlers do not get an automatic extra `next()`.
- **Test:** Challenge 0c-1.

### 0d / 0g — HTTP status enum (`src/enums/httpStatus.ts`)
- **Cause:** Swapped 401/403; wrong 412/501/503 (and NOT_IMPLEMENTED).
- **Fix:** All existing members mapped to standard literals (see enum file).
- **Tests:** Challenge 0d-1; Challenge 0g-1.

### 0e — CSP header (`src/middleware/securityHeaders.ts`)
- **Cause:** Misspelled `Content-Security-Policyy`.
- **Fix:** Correct header name; policy still `default-src 'none'`; `Referrer-Policy` unchanged.
- **Test:** Challenge 0e-1.

### 0f — Cache invalidate (`src/services/cache.ts`)
- **Cause:** `invalidate` called `store.get` instead of delete.
- **Fix:** `store.delete(key)`. TTL `* 1000` and expired-entry retention left for **Task 7**.
- **Test:** Challenge 0f-1.

---

## Verification table

| Command | Scope | Exit | Result |
|---|---|---|---|
| `npm test challenge00.test.ts` (before) | 0a–0f | 1 | 0 passed / 6 failed |
| `npm test -- … -t "Challenge 0g"` (before) | 0g | 1 | 1 failed / 23 skipped |
| `npm run typecheck` (after) | app+tests | 0 | pass |
| `npm test challenge00.test.ts` (after) | 0a–0f | 0 | **6/6 passed** |
| `npm test -- … -t "Challenge 0g"` (after) | 0g | 0 | **1 passed** / 23 not exercised |
| `npm test _sanity.test.ts` (after) | setup | 0 | **11/11 passed** |
| `npm test` (full suite) | all | 1 | **21 passed / 229 failed** (250 total); 2 files passed / 23 failed — expected unfinished challenges; no Task-3-focused regression observed (`challenge00` green). Detail: `docs/task03-full-suite.log` (gitignored `*.log`) |

**Available scoring entries addressed (not awarded score):** Challenge 00 part 1 ≈ 200 bug points (0a–0f) + Challenge 0g ≈ 15 bug points in `config/scores.ts`.

Challenge 01 HMAC/auth integration still stubbed — mocked 0b ≠ production signing security.

---

## Compatibility preserved

- Missing principal on admin-only routes → 403 FORBIDDEN (not 401).
- `attachPrincipal` / `requireOwnAccount` anonymous semantics unchanged.
- Generic `requireRole(Role)` — no account-ID special cases.
- CSP not loosened; cache public API unchanged except real delete.
- Protected: `tests/`, `config/`, `vitest.config.ts`, `scripts.test` untouched by this task.

---

## Files changed by Task 3

1. `src/enums/httpStatus.ts`
2. `src/middleware/rbac.ts`
3. `src/middleware/hmacAuth.ts`
4. `src/middleware/asyncHandler.ts`
5. `src/middleware/securityHeaders.ts`
6. `src/services/cache.ts`
7. `docs/clearhouse-task-03-infrastructure.md` (this file)

---

## Outstanding work

- **Task 4:** asset exponents / money arithmetic  
- **Task 5:** real HMAC sign/verify/window  
- **Task 6:** session tokens / refresh  
- **Task 7:** cache TTL units + expired cleanup; other 00b/00c shared-state bugs  
- **Task 8–9:** account/idempotency helpers; broader security headers/payloads  

---

## Suggested Git (CodeCommit `origin/main` — do not auto-run)

```powershell
npm run typecheck
npm test challenge00.test.ts
npm test -- challenge00b.test.ts -t "Challenge 0g"
git add -- src/enums/httpStatus.ts src/middleware/rbac.ts src/middleware/hmacAuth.ts src/middleware/asyncHandler.ts src/middleware/securityHeaders.ts src/services/cache.ts docs/clearhouse-task-03-infrastructure.md
git diff --cached --check
git commit -m "fix: correct ClearHouse core infrastructure bugs"
git push -u origin main
git rev-parse --verify HEAD
git ls-remote origin refs/heads/main
```
