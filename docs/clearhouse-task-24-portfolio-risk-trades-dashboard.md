# ClearHouse Task 24 — Portfolio, Risk Usage, and Recent Trades Dashboard

## Git

- Starting commit: `ad7949b87bb17f342866b31e4cf53e89584b86aa` (`feat: complete operator dashboard`)
- Working branch: `task-24`
- Final submission branch: `master`
- Pre-existing dirty/staged state at Task 24 start: untracked `prompts/` only; clean tracked tree on `master`
- Concurrent working-tree Task 23 work also present (seed + `listAccounts` + repository helper + Task 23 note); **not** staged as Task 24

## Challenge 20 test count

**8** organizer tests / **160** available points (`config/scores.ts`).

| Slice | Tests | Points | Owner |
|---|---|---|---|
| 20a | 3 | 55 | Task 23 |
| 20b | 1 | 25 | Task 23 |
| 20c | 4 | 80 | **Task 24** |

## Exact 20c tests / exports / selectors

| Test | Export | Section | Key selectors / assertions |
|---|---|---|---|
| 20c-1 | `renderAccountList(doc, accounts, assets)` | `#accounts-view` | `[data-account-id]`, `[data-status]`, `[data-asset]`, empty → `data-state="empty"` |
| 20c-2 | `renderPortfolioSummary(doc, accounts, assets)` | `#summary-view` | `[data-summary="accounts"]`, `.asset-total[data-asset]`, `.amount`, `.holders` |
| 20c-3 | `renderRiskUsage(doc, state, limits)` | `#risk-usage-view` | `[data-meter="orders"|"exposure"]`, `.percent`, `progress`, `data-level` |
| 20c-4 | `renderRecentTrades(doc, trades)` | `#activity-view` | `[data-trade]`, `[data-notional]`, `time[datetime]`, empty → `data-state="empty"` |

## Account input shape

```ts
type Balance = { asset: string; available: string; held: string; total: string };
type Account = { id: string; type: string; name: string; status: string; balances: Balance[] };
type AssetMeta = { code: string; name: string; exponent: number };
```

## Account-list renderer (20c-1)

- Sort a **copy** by lowercase name, then `id` (matches API name-order oracle).
- One `[data-account-id]` row per account; name via `textContent`.
- Status badge: allowlisted classes (`active` / `closed` / unknown fallback); `data-status` = exact status string.
- Holdings: each `[data-asset]` text = `` `${asset} ${formatMinorUnits(total, exponent)}` ``.
- Empty balances: still render the account; optional “No holdings” note without `data-asset`.
- Empty accounts array → `data-state="empty"` with non-empty message.

## Holdings definition

Authoritative field: **`balance.total`** (already `available + held` from API/fixture). Never `available + held + total`.

## Exponent source

`assets` array argument → `Map<code, exponent>` via shared `exponentMap`. Reuses Task 22 `formatMinorUnits`. No duplicated hardcoded exponent tables.

## Status-badge mapping

| Status | Class |
|---|---|
| `active` | `status-badge status-active` |
| `closed` | `status-badge status-closed` |
| other | `status-badge status-unknown` |

## Portfolio account-count logic (20c-2)

`accounts.length` → `[data-summary="accounts"]` text. Counts every supplied account (not balance rows, not funded-only).

## Portfolio aggregation

1. For each account’s balances, `BigInt(total)` into `Map<asset, { total, holders }>`.
2. `holders` increments when `total !== 0n`.
3. Render one `.asset-total` per asset.
4. Do not mutate input arrays/objects.

## Exact BigInt strategy

All aggregation and notional use `BigInt` / integer strings. No `Number` / `parseFloat` for money. Risk **display percent** follows the organizer oracle (`Number((used * 100n) / limit)` after exact bigint ratio), matching Challenge 20c-3 expectations.

## Portfolio asset ordering

Lexical: `[...totals.keys()].sort()`.

## Risk payload (20c-3)

```ts
state  = { openOrderCount: number, committedExposure: string }
limits = { maxNotional: string, maxOpenOrders: number, maxPositionAbs: string }
```

Rendered meters only:

| Meter key | used | limit |
|---|---|---|
| `orders` | `openOrderCount` | `maxOpenOrders` |
| `exposure` | `committedExposure` | `maxNotional` |

`maxPositionAbs` is accepted in the limits object but not rendered (not asserted by 20c-3).

## Exact risk classification

Organizer percent oracle:

```
used <= 0        → 0%
limit <= 0       → 100%   (when used > 0)
else             → Number((used * 100n) / limit)  // truncating integer division
```

Level:

```
percent >= 100 → data-level="danger"
percent >= 80  → data-level="warning"
else           → data-level="ok"
```

## 80% / 100% boundary proof

- 79/100 → ok; 80/100 → warning; 99/100 → warning; 100/100 → danger; >100 → danger.
- Classification uses the integer percent above (same as test), not float `used/limit`.

## Zero / missing limit behavior

Matches oracle: `used > 0 && limit <= 0` → 100% → danger. `used <= 0` → 0% → ok. No `NaN` / `Infinity`.

## Risk meter DOM / accessibility

- Container `[data-meter]` + `data-level`
- `.percent` text `${percent}%`
- `<progress max=100 value=min(percent,100)>` with `aria-label`
- Static label text; state not color-only (`data-level` + percent text)
- `markReady` clears prior children/classes on rerender

## Trade input / data source (20c-4)

```ts
{ market, buyOrderId, sellOrderId, price: string, quantity: string, timestampMs: number }
```

Browser wiring (`app.js`): `GET /api/orders/trades?limit=10` → `response.data`. Unit tests call the renderer directly with fixtures.

## Timestamp sort

Copy → annotate original index → sort by `timestampMs` descending, then original index descending on ties → take first 10.

## Max-10 behavior

Sort **all** trades first, then `slice(0, 10)`. Never cap before sort.

## Exact notional formula

```
notional = BigInt(price) * BigInt(quantity)
```

Displayed as the **raw integer string** in `[data-notional]` (organizer does **not** apply `formatMinorUnits` here).

## Notional asset / exponent

Notional is the exact price×quantity product string; no quote-asset exponent formatting in 20c-4.

## No-trades state

`data-state="empty"`, message `"No recent trades"`, prior rows cleared via `setStatus`.

## XSS / safe DOM

`document.createElement` + `textContent` only for untrusted strings. Status classes allowlisted. No `innerHTML`. Challenge 20c-1 asserts zero `<img>` nodes under XSS-ish names.

## Loading / empty / ready / error

Reuses Task 22 `setStatus` / `markReady` (`aria-busy`, `role="alert"` on error). `app.js` sets section-local loading/error for accounts, summary, activity, and risk-usage.

## Exact files changed (Task 24)

| File | Change |
|---|---|
| `client/js/dashboard.js` | Implement `renderAccountList`, `renderPortfolioSummary`, `renderRiskUsage`, `renderRecentTrades` |
| `client/js/app.js` | Risk-usage loading/error section states alongside existing overview wiring |
| `client/styles/dashboard.css` | Status badges, portfolio cards, meters, recent trades |
| `docs/clearhouse-task-24-portfolio-risk-trades-dashboard.md` | This note |

Unchanged by Task 24: `signer.js`, `liveFeed.js`, tests, config, package files, migrations.

Also present in working tree but **Task 23** (not Task 24):

- `db/seeds/01_initial_accounts.ts`
- `src/controller/ledgerController.ts`
- `src/repositories/accountsRepository.ts`
- `docs/clearhouse-task-23-demo-seed-accounts-api.md`

## Verification results

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| 20c-1 | PASS |
| 20c-2 | PASS |
| 20c-3 | PASS |
| 20c-4 | PASS |
| Full Challenge 20 (8) | PASS (with Task 23 work present in tree) |
| Challenge 12 | PASS (16) |
| Challenge 11 | PASS |
| Challenge 05 | PASS |
| Challenge 03 | PASS (24) |
| Challenge 13 | PASS (10) |
| Signing regressions | N/A (signer / signed-body path unchanged) |
| `_sanity` | PASS (11) |
| Full `npm test` | 209 passed / 70 failed — failures are later challenges (Swagger, live feed, fees, events, etc.) |
| Browser smoke | NOT RUN |

## Protected-file confirmation

No changes to organizer tests, `config/`, `package.json` / lockfile, `.env`, `.gitignore`, migrations, knexfile, Vitest/TS config, grading scripts, or `signer.js` / `liveFeed.js`.

## Suggested commit

```text
feat: add portfolio risk and recent trades dashboard
```

Stage only Task 24 paths (see final report Git commands). Commit Task 23 separately if not already on `master`.

## Master merge / push workflow

```powershell
git switch master
git fetch origin
git pull --ff-only origin master
git merge --ff-only task-24
git push origin master
git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

## Next

Task 25 — Challenge 19: OpenAPI / Swagger documentation.
