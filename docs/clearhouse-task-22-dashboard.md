# ClearHouse Task 22 — Operator Dashboard

## Git

- Starting commit: `c862fb2` (`feat: unify API versioning and cache behavior`)
- Working branch: `task-22`
- Final submission branch: `master`
- Pre-existing dirty state: untracked `prompts/` only

## Challenge 12 contract

**16** organizer tests. `config/scores.ts` maps **130** points:

| ID | Points | Focus |
|---|---|---|
| 12a-1..3 | 10+10+10 | Balance / book / risk render |
| 12b-1 | 20 | XSS-safe text rendering |
| 12c-1..5 | 2×5 | loading / empty / ready / error |
| 12d-1..2 | 10+10 | Client HMAC request builder |
| 12e-1..2 | 12+8 | `formatMinorUnits` |
| 12f-1..2 | 12+8 | Book sort / deep-book cap |
| 12g-1 | 10 | aria-busy, role=alert, table a11y |

## Balance view (`renderBalance`)

- Section: `#balance-view`
- Empty → `data-state="empty"`, no `<table>`, non-empty message
- Non-empty → `data-state="ready"`, semantic `<table>` with caption + 4 `th[scope=col]`
- Cells via `createElement` + `textContent` only
- Displays API-provided `available` / `held` / `total` as exact strings (no floating-point; no browser-side recalculation — Challenge 12a supplies `total`)

## XSS

All API-derived strings (asset, prices, quantities, exposure, status messages) use `textContent`.
No `innerHTML` / `insertAdjacentHTML` / `document.write`.

## Order book (`renderOrderBook`)

- Section: `#orderbook-view`
- Empty both sides → empty state (no `.bids` / `.asks`)
- One-sided book → `ready` with that side only
- Sort copies of input with BigInt-safe compare (invalid prices sort after valid; never throw)
- Bids high→low, asks low→high
- First visible row gets `.best`
- Cap 10 levels/side; overflow → `.more` with `+N more`
- Row text: `{price} x {quantity}`

## Risk (`renderRiskState`)

- Section: `#risk-view`
- Renders `openOrderCount` and `committedExposure` as text
- Marks `ready`; clears prior `role=alert` / `aria-busy`

## States (`setStatus`)

| State | `data-state` | `aria-busy` | `role` |
|---|---|---|---|
| loading | loading | true | removed |
| error | error | false | alert |
| empty/ready/other | set | false | removed |

## Money (`formatMinorUnits`)

- Input: integer string (`/^-?\d+$/`) + exponent integer 0..18
- Exact BigInt arithmetic; leading zeros accepted; `-0` → unsigned zero
- Malformed amount/exponent → `RangeError`

## Signing (`buildSignedRequestInit`)

- Stringify body once (or leave `rawBody` undefined for bodyless GET)
- Pass `{ method, path, rawBody, timestamp, nonce }` to injected signer
- Headers: `X-Signature`, `X-Signature-Algorithm` + `X-Algorithm` (both `HMAC-SHA256`), `X-Timestamp`, `X-Nonce`
- Reuses Task 5 `createHmacSigner` (LF-joined METHOD/path/bodyDigest/timestamp/nonce)

## Files changed

- `client/js/dashboard.js` — Challenge 12 implementations
- `docs/clearhouse-task-22-dashboard.md`

`client/js/signer.js` unchanged (Task 5 already correct).

## Suggested commit

`feat: complete operator dashboard`
