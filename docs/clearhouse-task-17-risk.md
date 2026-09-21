# ClearHouse Task 17 — Pre-Trade Risk and Limits

## Scope

Challenge 05 visible tests (7):

- **5a** notional / open orders / position / cancel release
- **5b** notional precedes open-order when both violate
- **5c** concurrent joint position limit (exactly one of two parallel admits)
- **5d** kill switch blocks new orders; cancel still works (admin RBAC unchanged)

`config/scores.ts` maps those seven tests to **90** published points, with comment `90/140` — remaining overview points (margin / mark-to-market / below-maintenance) are **not** in the visible suite.

## Rules (`src/domain/risk.ts`)

Deterministic precedence (hard-coded order):

1. **MAX_NOTIONAL** — `price * quantity > maxNotional` (BigInt; equality allowed)
2. **MAX_OPEN_ORDERS** — only if `willRest`; `openOrderCount >= maxOpenOrders`
3. **MAX_POSITION** — only if `willRest`; `|committedExposure ± quantity| > maxPositionAbs`

`committedExposure` is signed net resting buy qty minus resting sell qty.

`willRest` (controller): priced and not IOC/FOK — GTC/POST_ONLY limits may rest; market/IOC/FOK do not.

## Atomic admit (`riskRegistry.tryAdmit`)

Sync critical section (no await inside):

1. Kill switch → `KILL_SWITCH_ENGAGED`
2. `firstViolatedRule` → reject with zero mutation
3. Else `reserve` + `registerReservation`

Parallel HTTP handlers serialize on this sync section after their awaits, so joint limits cannot double-admit.

## Lifecycle

| Event | Risk action |
|---|---|
| Explicit cancel success | `releaseReservation` (take-once) |
| STP maker cancel | release that maker only |
| Maker fully filled (gone from book) | release maker reservation |
| Incoming rejected (POST_ONLY/FOK/…) | release provisional if reserved |
| Incoming fully filled / not live | release (unless still tracked as dormant stop via `marketOf`) |
| Dormant stop-limit with price | reservation kept while `marketOf` finds pending stop |

Reservations are take-once — duplicate release is a no-op (no negative open-order count via double free).

## Kill switch

- Checked inside `tryAdmit` before matching.
- Route remains `requireRole("admin")`.
- Cancel / release paths do not consult kill switch.
- `resetAll()` clears kill flag with limits/state/reservations.
