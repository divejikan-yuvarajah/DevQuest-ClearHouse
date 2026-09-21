# ClearHouse Task 16 — Advanced Matching Completion

## Scope

Challenge 03 advanced groups:

- **3e** stop / stop-limit (dormant storage, last-trade triggers, cascades)
- **3f** amendment (qty decrease keeps FIFO; price/qty-up lose priority)
- **3g** cancel/fill and amend/fill races (sync per-market critical sections)
- **3h** determinism (sequence counter; full reset; no random/Date priority)
- **3i** sublinear insert cost (indexed binary heap)
- **3j** stateful/randomized model agreement

Tasks 14–15 GTC / IOC / FOK / POST_ONLY / STP behavior is preserved.

## Stops (`matchingEngine.ts`)

- Dormant stops live in `pendingStops` only — not on the active book, not in live registry, no BBO/depth effect.
- Trigger on **last trade price**: BUY when `last >= stopPrice`, SELL when `last <= stopPrice`.
- Plain stop → market (`price` cleared); market remainder never rests (IOC / no-price path).
- Stop-limit → limit at stored **limit** price (not stop or last trade).
- Multiple triggers: iterative drain in original submission order; removed on fire (once-only).
- Cascades: each activation may update last trade and re-scan from the front.
- `resetAllBooks()` clears books, registry, dormant stops, last trades, trade log, sequences, lock depths.

## Amendment (`matching.ts` + heap)

- Qty decrease, same price: mutate in place — O(1), exact queue/heap position kept.
- Price change or qty increase: remove + reinsert with new later `sequence`.
- Unknown / filled / cancelled → not found.
- Non-positive qty rejected at HTTP layer (CONFLICT); engine rejects `quantity <= filled`.
- Cumulative `filled` preserved; never reset.

## Concurrency

- All book mutations for a market run inside re-entrant `withMarketLock(market)`.
- Critical sections are fully synchronous (no `await` inside matching).
- Nested stop drain re-enters the same market lock safely.
- Cancel/amend re-check registry under the lock so a racing fill cannot double-consume.

## BookSide before → after

- **Before:** price-level `Map` + sorted `prices[]` (new-level insert via `splice` = O(levels)).
- **After:** indexed binary heap + `Map<orderId, index>`:
  - insert / remove-best / remove-by-id: O(log n)
  - best: O(1)
  - same-priority qty decrease: O(1)
  - `snapshot()`: defensive copies sorted canonical price-time (heap layout never exposed)
  - Bids: higher price, then earlier sequence; Asks: lower price, then earlier sequence

## Determinism

- Matching priority uses only price + monotonic `sequenceCounter`.
- Trade history appends in execution order.
- Same op sequence after `resetAllBooks()` yields identical trades and BBO.
