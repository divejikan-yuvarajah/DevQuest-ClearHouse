# ClearHouse Task 15 — Matching Execution Policies

## Scope

Challenge 03b only:

- **IOC** — match crossing liquidity immediately; never rest remainder (including zero-fill and market IOC)
- **FOK** — all-or-nothing via non-mutating preflight; reject with `insufficient_liquidity_for_fill_or_kill`
- **POST_ONLY** — reject before mutation if would cross; reason `would_cross`
- **STP** — cancel same-account resting makers, continue aggressor; reason `self_trade_prevention`

Task 14 GTC price-time behavior is preserved. Stops / amend / races / perf / stateful model remain Task 16.

## IOC (`src/domain/matching.ts`)

- Same match loop as GTC (maker price, FIFO, best-first sweep).
- `mayRest` excludes `IOC` (and `FOK`): unfilled remainder never joins the book.
- Market IOC (`price` undefined) crosses all opposite liquidity best-first, then discards remainder.
- IOC remainder is **not** emitted as an STP cancellation.

## FOK preflight

- Before matching: `opposite.availableLiquidity(limit, incoming.accountId)`.
- Limit BUY: asks with `price <= limit`; Limit SELL: bids with `price >= limit`.
- Market FOK (`limit` undefined): all opposite levels until exhausted.
- Same-account resting quantity is skipped (would be STP’d) but later eligible makers still count.
- Fail: empty trades/cancellations, no `filled`/queue/registry mutation, rejection `insufficient_liquidity_for_fill_or_kill`.
- Success: normal match loop; never rests.

## POST_ONLY

- Checked first; if best opposite crosses incoming limit → reject with zero trades/cancellations.
- Non-crossing POST_ONLY rests via Task 14 GTC path (not converted to IOC/GTC-match-on-cross).
- Controller `willRest` includes POST_ONLY; rejected POST_ONLY rolls back its own risk reservation.

## STP

- Before trade: if `maker.accountId === incoming.accountId` → remove maker, push cancellation, continue.
- Multiple same-account makers cancelled in encounter order.
- Engine registry deletes cancelled maker IDs in `applyResultToRegistry`.
- Controller releases each STP maker’s existing risk reservation via `takeReservation` + `releaseRisk` (same as DELETE cancel). Does **not** invent Challenge 05 rules or release the aggressor unless rejection/lifecycle already requires it.

## Contracts

- `Cancellation.reason = "self_trade_prevention"`
- `rejectionReason = "would_cross" | "insufficient_liquidity_for_fill_or_kill"`
