# ClearHouse Task 27 — Market Data and Time

## Git

- Starting commit: `74ca9962b69c46524ce14e897acccda8131e56eb` (`feat: add event sourcing and deterministic replay`)
- Working branch: `task-27`
- Final submission branch: `master`
- Pre-existing dirty state: Task 25 WIP kept aside; untracked `prompts/` only on clean branch

## Challenge 08 test count

**9** organizer tests / **80/80** points (`config/scores.ts`).

| ID | Focus |
|---|---|
| 8a-1 | Sequence open/close |
| 8a-2 | High/low property |
| 8a-3 | Multi-resolution oracle (1m/5m/1h/1d) |
| 8b-1 | Hierarchical roll-up |
| 8c-1 | Gap fill |
| 8d-1 | Exact VWAP via HTTP |
| 8d-2 | Empty VWAP |
| 8e-1 | Candles HTTP |
| 8f-1 | Late-arriving rebucket |

## Trade / Candle / VWAP models

```ts
Trade  = { sequence: number, price: bigint, quantity: bigint, timestampMs: number }
Candle = { bucketStartMs, open, high, low, close, volume: bigint, tradeCount: number }
VWAP   = { price: bigint, remainder: bigint }
```

## Bucket formula

```ts
Math.floor(timestampMs / resolutionMs) * resolutionMs
```

UTC milliseconds only. Inclusive start via floor; trade at exact next bucket start begins the next candle.

## Open / close / high / low / volume

Per-bucket accumulator:

- **open** = price of minimum `sequence`
- **close** = price of maximum `sequence`
- **high** / **low** = exact BigInt extrema (seeded from first trade)
- **volume** = Σ `quantity`
- **tradeCount** = trades in bucket

Input arrays are not mutated; array order does not determine open/close.

## Multi-resolution / hierarchy

One `aggregateCandles(trades, resolutionMs)` for all resolutions.

`rollUp(minuteCandles)`: sort by bucket; open=first.open, close=last.close, high/low extrema, volume/tradeCount sums.

## Gap fill

Between first and last known buckets only: missing candles use previous close for OHLC, volume `0n`, tradeCount `0`. No leading/trailing extension; no `Date.now`.

## VWAP

```
weightedSum = Σ(price * quantity)
price = weightedSum / totalVolume
remainder = weightedSum % totalVolume
```

Empty → `{ price: 0n, remainder: 0n }`.

## Late arrival

Timestamp → bucket; sequence → open/close inside that bucket. Same aggregator at every resolution.

## HTTP

Existing routes unchanged:

- `POST /api/market-data/candles`
- `POST /api/market-data/vwap`

Task 9 / Challenge 0r preserved (`INTEGER` regex → 400 for `"abc"` / `"1.5"`). BigInt fields serialized as strings in `{ data, meta }`. OpenAPI untouched.

## Exact files changed

| File | Change |
|---|---|
| `src/domain/marketData.ts` | Implement `bucketStart`, `aggregateCandles`, `fillGaps`, `rollUp`, `vwap` |
| `docs/clearhouse-task-27-market-data-time.md` | This note |

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| Challenge 08 (9) | PASS |
| Challenge 0r | PASS |
| Challenge 03 / 11 / 12 / 20 / 06 | PASS |
| Challenge 19 | FAIL (Task 25 OpenAPI — out of scope) |
| Full suite | 225 passed / 54 failed (later tasks) |

## Suggested commit

```text
feat: implement exact market data aggregation
```

## Master workflow

```powershell
git switch master
git fetch origin
git pull --ff-only origin master
git merge --ff-only task-27
git push origin master
```
