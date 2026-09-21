# ClearHouse Task 5 — HMAC signing and replay protection

**Start commit:** `099fa51` (`main`, Task 4 money)  
**Branch:** `main` (submission). Local `master` only differs by a reverted `delete-db` filename — not used for this task.  
**Prereqs retained:** Task 3 infra + Task 4 money/assets.

---

## Protocol

Five LF-separated fields (no trailing newline):

1. `METHOD` uppercased  
2. `path` verbatim (`req.originalUrl`)  
3. lowercase SHA-256 hex of UTF-8 `rawBody ?? ""`  
4. timestamp string as signed  
5. nonce  

Signature = lowercase hex HMAC-SHA256(secret, message). Window = **30_000 ms** inclusive both sides (`|ts-now| <= window`).

---

## Changes

| File | Change |
|---|---|
| `src/domain/signing.ts` | Real `sign`, `verifySignature`, `isWithinWindow` |
| `src/middleware/hmacAuth.ts` | Real verify; nonce only after success; retain until `signedTs + WINDOW` (sweep when `expiry < now`); missing secret → 503 `SERVER_MISCONFIGURED` |
| `client/js/signer.js` | Field separator `|` → `\n` (Challenge 0t) |
| `tests/task05-signing-extra.test.ts` | Oracle/tamper/window/replay extras |
| `docs/clearhouse-task-05-signing.md` | This note |

Protected organiser tests/config/`scripts.test` untouched. `.env` already had `HMAC_SECRET` (value not logged).

### Policy notes
- Verifier accepts uppercase hex as equivalent encoding; rejects wrong length / non-hex / trailing newline.
- Unsupported algorithm → `{ valid:false, reason:"UNSUPPORTED_ALGORITHM" }` (middleware surfaces that code at 401).
- Timestamp: nonnegative safe int or canonical digit string; rejects leading zeros, signs, whitespace.
- Nonce not consumed on failed verify (bad sig then good sig with same unused nonce succeeds).

### Task 22 handoff
Server/Challenge 1c use `X-Algorithm`. Challenge 12d / dashboard builder may expect `X-Signature-Algorithm`. Do **not** rename the server header. Later, send both if needed. Browser end-to-end signing is not claimed beyond Challenge 0t.

---

## Results

| Command | Exit | Outcome |
|---|---|---|
| `npm run typecheck` | 0 | pass |
| `challenge01 -t 1c` | 0 | **6/6** (real HMAC HTTP) |
| `challenge00` | 0 | **6/6** (Task 3 retained; 0b still mocks signing) |
| `challenge00b -t 0t` | 0 | **1/1** browser LF fix |
| `task05-signing-extra` | 0 | **5/5** |
| `challenge01 -t "1a\|1b\|1c"` | 0 | **16** foundation (1d still Task 6) |
| `_sanity` | 0 | **11/11** |
| Full `npm test` | 1 | **54 passed / 209 failed** (263); 4 files passed — JWT/ledger/etc. still stubbed |

Available scoring entries touched: Challenge 1c (~feature points) + Challenge 0t (bug). Not an earned official grade.

---

## Suggested Git (do not auto-run)

```powershell
git add -- src/domain/signing.ts src/middleware/hmacAuth.ts client/js/signer.js tests/task05-signing-extra.test.ts docs/clearhouse-task-05-signing.md
git commit -m "feat: implement HMAC request signing and replay protection"
git push origin main
git rev-parse --verify HEAD
git ls-remote origin refs/heads/main
```

**Next:** Task 6 — JWT session / refresh / roles.
