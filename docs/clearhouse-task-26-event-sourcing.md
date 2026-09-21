# ClearHouse Task 26 — Event Sourcing and Deterministic Replay

## Git

- Starting commit: `be837e1b2ae4ee9f5cc82d7f4f0687a9343f3f54` (`feat: add portfolio risk and recent trades dashboard`)
- Working branch: `task-26`
- Final submission branch: `master`
- Pre-existing dirty state: untracked `prompts/` only

## Challenge 06 test count

**7** organizer tests.

## Score map (READ-ONLY `config/scores.ts`)

Challenge 06 is scored **89/100** in `config/scores.ts`. The overview’s “100” includes uncovered scope (other domains / large-scale replay). Visible tests:

| ID | Points |
|---|---|
| 6a-1 | 12 |
| 6a-2 | 16 |
| 6b-1 | 13 |
| 6b-2 | 13 |
| 6b-3 | 11 |
| 6c-1 | 15 |
| 6d-1 | 9 |
| **Total** | **89** |

No invented 11th feature.

## Event model / table

Table `events` (migration `20260101000004_create_events_table.ts`):

| Column | Role |
|---|---|
| `seq` | INTEGER PK autoincrement; gapless sequence starting at **1** |
| `type` | e.g. `deposited` |
| `account_id` | account |
| `asset` | asset code |
| `amount` | integer minor-unit **string** |
| `hash` | current event hash |
| `prev_hash` | predecessor hash or SQL `NULL` (genesis) |
| `created_at` | informational only; **not** hashed |

Snapshots: `event_snapshots(up_to_seq PK, balances_json)`.

Domain type `StoredEvent`: `{ seq, type, accountId, asset, amount, hash, prevHash }`.

## Sequence semantics

- First event: `seq = 1`
- Next: `(last.seq ?? 0) + 1`
- Assigned inside a single Knex transaction with predecessor lookup + hash + insert (`eventRepository.append`)

## Hash algorithm

- **SHA-256**, lowercase hex (`node:crypto` `createHash`)
- Canonical material (UTF-8, LF-joined):

```text
{prevHash or ""}
{seq}
{type}
{accountId}
{asset}
{amount}
```

- Stored `hash` is **not** part of the material
- Genesis predecessor: **`null`** in storage / verification; empty string in hash material

## Append transaction design

`eventRepository.append` already:

1. begins transaction
2. reads latest event
3. computes `nextSeq` / `prevHash`
4. `computeHash(...)`
5. inserts row
6. returns inserted domain event

No in-memory sequence counter.

## Chain verification

`verifyChain`:

1. sort copy by `seq` ascending
2. expected predecessor starts as `null`
3. for each event: check `prevHash === expectedPrev`
4. recompute content hash; compare to stored `hash`
5. on first failure → `{ valid: false, firstBrokenSeq: event.seq }`
6. else `{ valid: true, firstBrokenSeq: null }`

Tamper test updates `amount` only → content hash mismatch → reports that event’s `seq`.

## Deposit integration

Challenge 06 uses **`POST /api/events/deposits`** (`eventController.recordDeposit`), not the settlement deposit path.

- Validates integer-string amount
- Appends `type: "deposited"`
- Returns `{ seq, hash }`

Settlement Task 12 idempotency path is untouched. Event deposits are the tested projection source.

## Projection / pure reducer

- `Balances = Map<string, bigint>` keyed `${accountId}:${asset}`
- `replay(events, startingBalances?)`:
  - copies starting map
  - dedupes by **`seq`** (first wins)
  - sorts by `seq`
  - applies `deposited` with `BigInt(amount)` sums
  - no DB, no time, no mutation of inputs
- `balancesToJson` / `balancesFromJson` for snapshot storage and HTTP

## Snapshot + state-at-sequence

- Snapshot stores balances through `upToSeq` inclusive
- Tail: `seq > up_to_seq` then filter `seq <= atSeq`
- No double-application of snapshot boundary event
- Full rebuild: `replay(listAll)` from empty map

## Exact files changed

| File | Change |
|---|---|
| `src/domain/events.ts` | Implement `computeHash`, `replay`, `verifyChain`, `balancesToJson`, `balancesFromJson` |
| `docs/clearhouse-task-26-event-sourcing.md` | This note |

Unchanged: repository, controller, routes, migration, seeds, settlement, OpenAPI, config, tests.

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| Challenge 6a | PASS |
| Challenge 6b | PASS |
| Challenge 6c | PASS |
| Challenge 6d | PASS |
| Full Challenge 06 (7) | PASS |

Deposit/idempotency and broader regressions recorded in the Task 26 completion report.

## Suggested commit

```text
feat: add event sourcing and deterministic replay
```

## Master workflow

```powershell
git switch master
git fetch origin
git pull --ff-only origin master
git merge --ff-only task-26
git push origin master
```

## Next

Task 27+ (market data / later challenges) — out of scope.
