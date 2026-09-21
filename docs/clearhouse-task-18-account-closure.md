# ClearHouse Task 18 — Account Closure

## Scope

Challenge 13 (10 tests):

- **13a** close only when every balance row is zero (or no rows); reject nonzero available/held
- **13b** closed accounts reject deposit / withdraw / hold; trade settlement rejects if any of four participants is closed
- **13c** closed registered accounts cannot place orders; unregistered IDs (`getStatus() === null`) still trade
- **13d** open-account ledger + hold/release regressions unchanged

## `closeAccount` (`accountsRepository.ts`)

Single Knex transaction:

1. Load account (missing → no-op, no phantom row)
2. Read all `account_balances` for the account
3. If any `BigInt(available) !== 0n` or `BigInt(held) !== 0n` → `AccountHasBalanceError`
4. Else set `status = "closed"`

Zero rows and exact-zero rows both allow closure. No auto-withdraw, no auto-cancel orders, no history deletion.

## `assertOpen`

Rejects only `status === "closed"`. Missing account (`null`) is **not** closed (Task 8 / Challenge 13c-2).

## Gates

| Path | Behavior |
|---|---|
| deposit / withdraw | `assertOpen` inside idempotent trx before mutation |
| hold | `assertOpen` inside hold transaction |
| release | unchanged (not required by 13b) |
| settleTrade | dedupe four account IDs; `assertOpen` each before any balance write |
| order place | `getStatus === "closed"` → `ACCOUNT_CLOSED` **before** risk admit / matching |

## HTTP

- Close: `ACCOUNT_HAS_BALANCE` on nonzero balances
- Closed ops: `ACCOUNT_CLOSED` via existing settlement/order controllers
