# ClearHouse Task 4 — Exact money arithmetic and asset registry

**Starting commit:** `2d7bfd35a082b5f29c81d3984077b74dd64ada4a` (Task 3 infra fixes)  
**Branch:** `main` → submission `origin/main`  
**Preserved:** Task 2 setup + Task 3 middleware/enum/cache invalidate

---

## Changed files

| File | Role |
|---|---|
| `src/domain/assets.ts` | Correct exponents; exact lookup; defensive copies |
| `src/domain/money.ts` | Full money domain (no stubs) |
| `tests/task04-money-extra.test.ts` | Participant supplemental coverage |
| `docs/clearhouse-task-04-money.md` | This note |

Controller unchanged — already maps `MoneyError`/`AssetError` to 400.

---

## Asset precision

| Code | Exponent |
|---|---:|
| USD | 2 |
| EUR | 2 |
| JPY | 0 |
| BHD | 3 |
| BTC | 8 |

**Lookup:** `getAsset` / `isKnownAsset` use the **exact** registry key (no case/trim normalisation). They agree for every string input (Challenge 0x-2). Non-string → `isKnownAsset` false; `getAsset` throws `AssetError`.

**Copies:** `getAsset` and `listAssets` return fresh objects/arrays. Mutating returned data does not alter the registry (0x-1). Not frozen (assignment must succeed).

**Task 7 note:** Asset copy isolation + consistent lookup completed here; do not rework. Cache TTL/cleanup and risk-registry bugs remain Task 7.

---

## Money exports

- **`parseAmount`:** Primitive string only; canonical `0` or `[1-9][0-9]*`; range `0..2^63-1`; character-scan validation (avoids JS `$`/trailing-newline regex quirk); no float/Number/BigInt-as-validator. Minor units — never re-scaled by exponent.
- **`serialiseAmount`:** `{ amount: toString(), asset }` including minus for internal negatives.
- **`add` / `sub` / `compare`:** Matching assets required (`ASSET_MISMATCH`); exact bigint; compare returns `-1|0|1`.
- **`isNegative`:** `amount < 0n`.
- **`fromDecimal`:** Nonnegative string; optional `.` + ≥1 digit; fraction length ≤ exponent; JPY forbids `.`; pad then scale; external max after scaling. Design choice where tests underspecify: no signs, no leading integer zeros, no `1.` / `.5`.
- **`toDecimal`:** Signed fixed-exponent string; exponent 0 has no point; always exact fractional width when exponent > 0. Nonnegative `fromDecimal` does **not** round-trip negative `toDecimal` outputs by design.
- **`divideWithRounding`:** Magnitude half rules; HALF_UP away from zero on ties; HALF_EVEN to even truncated quotient; `remainder = dividend - quotient * divisor` (reconstruction identity). Default HALF_EVEN.
- **`applyRate`:** `product = amount * numerator`, then same division; residual is numerator-scale, not a ledger posting unit by itself.

---

## Verification

| Command | Exit | Result |
|---|---|---|
| `npm run typecheck` | 0 | pass (after unused-const fix) |
| `challenge01 -t "1a\|1b"` | 0 | **10 passed** / 13 not exercised |
| `challenge00b -t 0h` | 0 | **1 passed** |
| `challenge00c -t 0x` | 0 | **2 passed** |
| `task04-money-extra` | 0 | **8 passed** |
| `challenge00` | 0 | **6/6** (Task 3 retained) |
| `0g\|0v` | 0 | **2 passed** |
| `_sanity` | 0 | **11/11** |
| Full `npm test` | 1 | **42 passed / 216 failed** (258); 3 files passed / 23 failed — HMAC/session/features still stubbed |

Challenge 1c/1d (HMAC/session) **not** in scope — still fail until Tasks 5–6.

---

## Suggested Git (do not auto-run)

```powershell
git add -- src/domain/assets.ts src/domain/money.ts tests/task04-money-extra.test.ts docs/clearhouse-task-04-money.md
git commit -m "feat: implement exact money arithmetic and asset validation"
git push origin main
git rev-parse --verify HEAD
git ls-remote origin refs/heads/main
```

**Next:** Task 5 — HMAC request signing and verification.
