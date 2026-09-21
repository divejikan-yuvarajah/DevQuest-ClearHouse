# ClearHouse Realistic Demo Data

## Identity

| Field | Value |
| --- | --- |
| Starting commit | `69a22fcb54e5a273a355ff9193af3b744e1e95c9` |
| Branch | `master` (work in progress; dedicated `demo-data-polish` after approval) |
| Official final branch | `master` |

## Architecture (chosen approach)

Matching-engine books, risk state, trade history, and WebSocket deltas are **in-memory**.

Therefore demo data is split:

### A. Persistent Knex seed — `db/seeds/01_initial_accounts.ts`

- 7 funded trading institutions + house equity
- Exact BigInt minor-unit funding via `insertBalancedEntry`
- Idempotent (stable UUIDs; skip funding when postings exist)
- Holds / closed zero-balance account omitted: Challenge 20a-1 requires every asset account ≥2 funded assets; 20a-2 requires `available ≡` posting sum

### B. Process bootstrap — `src/demo/bootstrapDemoMarket.ts`

- Enabled only when `CLEARHOUSE_DEMO_MARKET=1` and `NODE_ENV !== "test"`
- Places real orders through `risk.tryAdmit` → `engine.placeOrder` → `recordTrades` → `publishBookChange`
- Builds intentional trades then a non-crossing resting BTC-USD book
- Never mutates engine maps directly

Launcher: `npm run demo-market` → `scripts/run-demo-market.ts`

Normal tests / `npm start` without the flag do **not** bootstrap the book.

## Files changed

- `db/seeds/01_initial_accounts.ts`
- `src/demo/bootstrapDemoMarket.ts` (new)
- `scripts/run-demo-market.ts` (new)
- `src/server.ts` (opt-in bootstrap hook)
- `package.json` (`demo-market` script only)
- `docs/clearhouse-realistic-demo-data.md` (this file)

No frontend hardcoding. No organizer test/config changes. No secrets.

## Demo accounts

| ID suffix | Name | Status | Assets (examples) |
| --- | --- | --- | --- |
| `…0001` | ClearHouse Demo Treasury | active (equity) | funding source |
| `…0101` | Atlas Capital | active | USD, BTC, EUR |
| `…0102` | Nova Securities | active | USD, BTC, JPY |
| `…0103` | Meridian Markets | active | USD, EUR, BHD |
| `…0104` | Orion Trading | active | USD, BTC, JPY |
| `…0105` | Vertex Financial | active | USD, EUR, BTC |
| `…0106` | Cobalt Partners | active | EUR, BHD, USD |
| `…0107` | Summit Brokerage | active | USD, JPY, BTC |

Closed zero-balance demo account: **skipped** (would fail Challenge 20a-1).

## Assets

Registry only: USD (2), EUR (2), JPY (0), BHD (3), BTC (8).

## Funding strategy

Per holding: balanced ledger entry

- trader `+amount`
- house equity `-amount`
- same asset on both legs
- projection `available = amount`, `held = 0`

## Double-entry

Challenge 20a-2 continues to enforce per-entry and per-asset zero sums and posting ≡ available.

## Idempotency

- Stable account UUIDs
- Skip new funding when postings exist for account+asset
- Market bootstrap skipped when book already has depth or already run in-process

## Risk profiles

Configured in bootstrap (in-memory): large `maxNotional` / `maxPositionAbs` so realistic BTC-USD sizes admit; varied `maxOpenOrders` so the orders meter shows low / medium / near-warning diversity. Thresholds 80% / 100% unchanged.

## Holds

**Skipped** — would break Challenge 20a-2 (`available` must equal posting sum).

## Demo market

`BTC-USD`

## Resting book (after bootstrap)

Bids ≈ 67050 … 66850 · Asks ≈ 67100 … 67300 (integer price strings). Quantities are BTC minor units (e.g. `50000000` = 0.5 BTC). Best bid &lt; best ask.

## Real trades

~9 crossing taker placements against earlier makers via the live matching engine. Canonical trade history + WebSocket book deltas follow normal paths. Fees/settlement not double-posted; only what the engine/controller path already does.

## Event sourcing

No fake event rows. Bootstrap uses the same in-memory match/publish path as HTTP order placement.

## WebSocket

`publishBookChange` → live hub `orderbook:BTC-USD`. REST depth and WS reconstruction remain Challenge 21’s contract.

## Dashboard data source

Accounts/portfolio from ledger API (seed). Book/trades/risk from live engine/API after `npm run demo-market`.

## How to run for judging

```bash
npm run migrate
npm run seed
npm run demo-market
```

Open `http://localhost:3001/`, sign in as a demo account (e.g. Atlas `a0000000-0000-4000-8000-000000000101`), market `BTC-USD`.

## Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| Challenge 02–05, 13 | PASS |
| Challenge 20 (20a-1…20c-4) | PASS |
| Challenge 21 | PASS |
| Challenge 08 / 16 / 17 / 18 | PASS |
| Full `npm test` | **31/31 files, 279/279 tests PASS** |
| `git diff --check` | clean |
| Browser dashboard | NOT RUN (no browser session in this pass) |
