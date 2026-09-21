# ClearHouse Task 33 — Integration (Challenge 21)

## Git

- Starting commit: `7901fa670f0d8640705c4eea3d9be473bd92d9ab` (`feat: implement authenticated websocket feed`)
- Working branch: `task-33`
- Final submission branch: `master`

## Challenge 21 test count

**4** organizer tests / **150/150** points.

| ID | Points | Focus |
|---|---|---|
| 21a-1 | 40 | WS book == REST depth; gapless seq |
| 21a-2 | 40 | `disconnectAll` → reconnect → resync |
| 21b-1 | 40 | API trades → netting + fee balance |
| 21c-1 | 30 | Seed + trading → API/DB/dashboard parity |

## Integration architecture (no duplicate engines)

Canonical matching: module singleton `src/services/matchingEngine.ts`.

| Consumer | Source |
|---|---|
| Order place/cancel/amend | `engine.placeOrder` / `cancel` / `amend` |
| REST depth | `GET /api/orders/book/:market/depth` → `engine.depth` |
| WS snapshot | `liveHub.snapshot("orderbook:"+mkt)` → `engine.depth` |
| Trade history | `engine.recordTrades` / `engine.recentTrades` |

## Mutation → delta publish boundary

Single boundary in `orderController`:

1. `bookBefore = engine.depth(market)`
2. mutate (`placeOrder` / `cancel` / `amend`)
3. `publishBookChange(market, bookBefore, engine.depth(market))`
4. `diffDepth` → one `liveHub.publish("orderbook:"+market, delta)` per changed level

No controller-level sequence. Hub assigns seq. Identical depth → no publish.

## Client live feed

Challenge 21 imports `LiveFeedClient` / `applyOrderBookDelta`. Those were not yet on `master` at Task 33 start; this branch lands the Challenge 17 client so 21a can exercise the real hub.

Reconnect: `liveHub.disconnectAll()` (1012) → client status `reconnecting` → new socket → subscribe → fresh snapshot → `live`.

## Challenge 21b — trades / netting / fees

Test-owned adapters (not server fee auto-charge):

- Trades from `GET /api/orders/trades` (canonical `tradeLog`)
- Obligation: buyer → seller, USD notional = `price * quantity` (exact BigInt)
- Maker/taker from `takerSide` + buy/sell accounts
- `netObligations` + `FeeEngine.processFill` in the test

## Challenge 21c — dashboard parity

- Seed: `01_initial_accounts.ts`
- Accounts: `GET /api/ledger/accounts`
- Trades: `GET /api/orders/trades?limit=10`
- Dashboard: `renderPortfolioSummary` / `renderAccountList` / `renderRecentTrades`
- DB check: `account_balances` totals vs `.asset-total` cards

## Exact files changed

| File | Role |
|---|---|
| `client/js/liveFeed.js` | LiveFeedClient + applyOrderBookDelta (Challenge 17/21a) |
| `client/js/dashboard.js` | Connection status + Challenge 20/21c renderers |
| `docs/clearhouse-task-33-integration.md` | This note |

Server wiring (`orderController`, `liveHub`, `marketFeed`, matching) already correct on the starting commit.

## Verification

| Check | Result |
|---|---|
| typecheck | PASS |
| Challenge 21 (4) | PASS |
| 21a-1 / 21a-2 / 21b-1 / 21c-1 | PASS |
| Challenge 17 / 18 / 03 | PASS |
| Challenge 14 / 16 | PASS |
| Challenge 20 / 12 / 11 | PASS |
| Challenge 04 / 02 / 05 / 09 / 13 | PASS |
| Challenge 01 / 06 / 07 / 08 / 10 / 15 / 19 | PASS |
| Challenge 00 / 00b / 00c / sanity | PASS |
| Full suite | **279 passed / 0 failed** |

## Suggested commit

```text
feat: integrate live trading data end to end
```

## Master workflow

```powershell
git switch master
git fetch origin
git pull --ff-only origin master
git merge --ff-only task-33
git push origin master
git push origin master:main
```
