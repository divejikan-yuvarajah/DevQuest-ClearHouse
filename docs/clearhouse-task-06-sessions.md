# ClearHouse Task 6 — Session tokens and refresh family revocation

**Start commit:** `8e9d3bb` (`main`, Task 5 HMAC)  
**Branch:** `main` → `origin/main`  
**Prereqs:** Tasks 3–5 retained (infra, money, HMAC)

---

## Changed files

| File | Change |
|---|---|
| `src/domain/session.ts` | JWT HS256 issue / verify / rotate / reset |
| `src/controller/authController.ts` | Blank/body validation; config → 503 |
| `src/middleware/rbac.ts` | Clear `req.principal` on missing/invalid bearer |
| `src/repositories/ledgerRepository.ts` | Minimal `deriveBalance` sum (needed for 1d ownership OK path) |
| `tests/task06-session-extra.test.ts` | Family/reuse/role extras |
| `docs/clearhouse-task-06-sessions.md` | This note |

Protected organiser tests/config/`scripts.test` unchanged.

---

## Session design

| Choice | Value |
|---|---|
| Algorithm | HS256 pinned (verify allowlist); `JWT_PRIVATE_KEY` as opaque shared secret |
| Access TTL | 15 minutes |
| Refresh TTL | 7 days |
| Claims | `sub`, `role`, `tokenUse` (`access`\|`refresh`), `sid` (family), `jti`, `iat`, `exp` |
| Families | In-memory map; independent logins = independent families |
| Access after refresh | Prior access remains valid until expiry **unless** family revoked |
| Reuse of stale refresh JTI | Mark family `revoked`, throw `RefreshReuseError`; later refresh/access for that family fail |
| Missing JWT key | `SessionConfigError` → HTTP **503** `SERVER_MISCONFIGURED` |

Login remains assessment bootstrap `{ accountId, role }` — no password/ledger registration required.

Anonymous balance access preserved (`requireOwnAccount` no-ops without principal). Invalid bearer cleared (no stale principal).

**deriveBalance:** exact posting sum (0 when empty) so Challenge 1d ownership positives can return 200. Full ledger (balanced postings, as-of, trial balance) remains **Task 10**.

---

## Results

| Command | Exit | Outcome |
|---|---|---|
| `npm run typecheck` | 0 | pass |
| `challenge01 -t 1d` | 0 | **7/7** |
| `challenge00` | 0 | **6/6** |
| `task06-session-extra` | 0 | **6/6** |
| `challenge01` (full) | 0 | **23/23** — Challenge 01 complete |
| `_sanity` | 0 | **11/11** |
| Full `npm test` | 1 | **68 passed / 201 failed** (269); 6 files passed — later challenges still stubbed |

---

## Suggested Git (do not auto-run)

```powershell
git add -- src/domain/session.ts src/controller/authController.ts src/middleware/rbac.ts src/repositories/ledgerRepository.ts tests/task06-session-extra.test.ts docs/clearhouse-task-06-sessions.md
git commit -m "feat: implement session tokens and refresh family revocation"
git push origin main
git rev-parse --verify HEAD
git ls-remote origin refs/heads/main
```

**Next:** Task 7 — cache TTL/cleanup, risk registry, matching helpers (asset registry already done in Task 4).
