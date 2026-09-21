# ClearHouse Task 14 — Basic Order Book and Core Matching

## Scope

Challenge 03 foundational matching only:

- **3a** price-time priority (maker price, bid/ask ordering, FIFO, multi-level sweep)
- **3c** core invariants (never crossed, no overfill, exact `min` trade qty, no zero trades)
- **3d** cancellation (exact remove, FIFO peers preserved, second cancel not found, live registry)

Tasks 15–16 cover IOC/FOK/POST_ONLY/STP, stops, amend, races, performance, and stateful model. Those capabilities already exist from earlier matching work and are preserved; Task 14 documents and hardens the GTC core.

## Structures

### `BookSide` (`src/domain/orderBook.ts`)

- Price-level `Map` + sorted `prices` index (best-first).
- **Bids:** `betterPrice = (a, b) => a > b` (highest first).
- **Asks:** `betterPrice = (a, b) => a < b` (lowest first).
- **FIFO:** within a level, orders are a queue; `insert` appends; `best`/`removeFront` operate on the head.
- `removeById` splices one order and drops empty levels without reordering peers.
- `snapshot` returns shallow copies so callers cannot mutate book state through the array.
- `remainingQuantity(order) = quantity - filled` (BigInt only).

### Matching (`src/domain/matching.ts`)

Crossing:

- BUY crosses when `incoming.price >= bestAsk.price`
- SELL crosses when `incoming.price <= bestBid.price`
- Market (no price) always crosses while opposite liquidity exists

Execution:

- Trade price = resting maker `best.price`
- `tradeQty = min(incomingRemaining, makerRemaining)`; never emit `tradeQty <= 0`
- BUY trade: `buyOrderId = incoming`, `sellOrderId = maker`
- SELL trade: `buyOrderId = maker`, `sellOrderId = incoming`
- Partial maker: increment `filled`, keep price and FIFO position
- Full maker: `removeFront` immediately
- GTC remainder: rest with **original** `quantity` and cumulative `filled` (not quantity rewritten to remainder)
- Fully filled incoming: do not rest

### Engine registry (`src/services/matchingEngine.ts`)

- Per-market books; buys on bids, sells on asks
- Registry tracks live resting (and pending-stop) order locations only
- Full maker fills drop registry entries; cancel removes book + registry
- Empty book: `bestBid` / `bestAsk` are `null` (Task 7)

## Out of Task 14 scope (preserved, not reworked here)

IOC, FOK, POST_ONLY, self-trade prevention, stops/stop-limit, amend, concurrency races, dedicated 100k perf paths, Challenge 3j stateful specials.
