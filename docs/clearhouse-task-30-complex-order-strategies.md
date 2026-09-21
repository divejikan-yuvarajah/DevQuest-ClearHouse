# ClearHouse Task 30 — Complex Order Strategy State Machines

## Git
- Starting commit: `875aa20` (master tip with Task 29 netting)
- Working branch: `task-30`
- Final branch: `master`

## Challenge 15 (200 pts, 8 tests)
15a OCO, 15b Bracket, 15c Iceberg, 15d Trailing, 15e idempotency/cancel, 15f RangeError validation.

## API
`StrategyEngine`: `submit`, `onFill`, `onMarketPrice`, `cancel`, `stopLevel`
Child IDs: `${parentId}:${role}`. Fill idempotency via `fillId`. Quantities/prices are bigint.

## Files
- `src/domain/strategyOrders.ts`
- `docs/clearhouse-task-30-complex-order-strategies.md`

## Verification
- typecheck PASS
- Challenge 15 8/8 PASS

## Suggested commit
feat: implement complex order strategy state machines
