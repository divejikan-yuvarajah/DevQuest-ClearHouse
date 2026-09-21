# ClearHouse Task 28 — Exact Fee and Rebate Engine

## Git

- Starting commit: `a42c0449386640829623042aae6ec0d2af22bdd7` (`feat: implement exact market data aggregation`)
- Working branch: `task-28`
- Final submission branch: `master`
- Pre-existing dirty state: untracked `prompts/ClearHouse_Cursor_Prompt_Task_*.md` only

## Challenge 16 contract (200 pts)

**8** organizer tests:

| ID | Points | Focus |
|---|---|---|
| 16a-1 | 30 | Exact integer fee oracle, notionals beyond 2^53, rebates mirror fees |
| 16a-2 | 25 | Half-even rounding both directions and for rebates |
| 16b-1 | 45 | Per-account pre-fill trailing volume tiers vs independent oracle |
| 16b-2 | 15 | Exactly one window old expires; one ms younger remains |
| 16c-1 | 30 | Balanced ledger entries; fee account nets to fees collected |
| 16d-1 | 20 | Fill-id idempotency; no volume/tier/clock mutation on redelivery |
| 16e-1 | 25 | 200,000 fills priced exactly and quickly (`elapsed < 4000`) |
| 16f-1 | 10 | Invalid schedules/options/fills throw `RangeError` |

## Public API

```ts
new FeeEngine(schedule: readonly FeeTier[], options: FeeOptions)
processFill(fill: FeeFill): FeeResult
trailingVolume(account: string, atMs: number): bigint
```

### Schedule / tier

- `FeeTier { minVolume, makerBps, takerBps }`
- `FeeOptions { feeAccount, windowMs }`
- Rates are integer basis points; negative = rebate
- Schedule must be non-empty, start at `minVolume === 0n`, strictly increasing `minVolume`
- Copied at construction (caller mutation cannot alter engine schedule)

### Fill / result

- `FeeFill { fillId, timestampMs, makerAccount, takerAccount, asset, notional }`
- `FeeResult { fillId, makerFee, takerFee, entries }`
- `LedgerEntry { entryId, lines: [{ account, asset, amount }] }`

### Rate representation

- Denominator: `10_000n` (basis points)
- Formula: `sign(bps) * halfEven(|notional * bps| / 10_000)`
- Notional source: `fill.notional` (exact bigint)

### Half-even

For non-negative `x`, positive `d`:

1. `up = (2x + d) / (2d)`
2. Tie when `(2x) % (2d) === d`
3. If tie and `up` odd → `up - 1`; else `up`
4. Negative rates apply the same magnitude then negate (rebate)

Examples (50 bps): `100 → 0`, `300 → 2`, `500 → 2`.

## Trailing volume

- Metric: sum of `notional` for prior fills where the account was maker **or** taker
- Window predicate: keep `timestampMs > atMs - windowMs` (exactly one window old expires)
- Pre-fill rule: current fill is **not** included when selecting its own tiers
- After fees/entries: append current notional to **both** maker and taker rolling histories
- Maker and taker select tiers independently from their own pre-fill volumes
- Threshold: highest tier with `minVolume <= volume`

### Rolling-state structure

Per account:

```ts
{ points: { timestampMs, notional }[], head: number, total: bigint }
```

- Expire by advancing `head` and subtracting from `total` (amortized O(1))
- Append pushes and adds to `total`
- Occasional compaction when dead prefix is large
- Complexity: ~O(1) amortized per fill + O(tiers) tier scan; overall near-linear for 200k

## Clock

- Monotonic fill timestamps for first-time fills (`timestampMs >= last`)
- `Date.now()` is never used
- Clock advances only after a successful first-time process
- Duplicate short-circuit happens **before** timestamp validation

## Ledger posting

- Fee asset: `fill.asset` (not assumed USD)
- Fee account: `options.feeAccount`
- One entry per non-zero side: `` `${fillId}:maker` `` / `` `${fillId}:taker` ``
- Positive fee `F`: participant `-F`, fee account `+F`
- Rebate `R` (negative fee): participant `-R` (= credit), fee account `+R` (= debit of fee account)
- Zero fees omit entries
- Entries are returned on the result (in-memory balanced postings; no second ledger / no DB fee tables)

## Idempotency

- Key: `fillId`
- Redelivery returns the **original stored** `FeeResult`
- No fee recalc, volume change, tier change, ledger append, or clock advance

## Validation (`RangeError`)

Constructor:

- empty schedule
- schedule not starting at 0
- non-strictly-increasing / duplicate thresholds
- `windowMs <= 0` (also non-finite / non-integer)
- empty `feeAccount`

`processFill` (after duplicate check):

- `notional <= 0`
- empty maker/taker
- maker === taker
- timestamp regression

## Files changed

- `src/domain/fees.ts` (implemented)
- `docs/clearhouse-task-28-fee-rebate-engine.md` (this note)

Protected / unchanged: organizer tests, `config/`, package files, migrations, seeds, ledger repository, matching, HTTP/OpenAPI, Task 29+.

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| Challenge 16a | PASS |
| Challenge 16b | PASS |
| Challenge 16c | PASS |
| Challenge 16d | PASS |
| Challenge 16e | PASS (~677–737ms / 200k fills, limit 4000ms) |
| Challenge 16f | PASS |
| Full Challenge 16 | **8/8 PASS** |
| Challenges 02/03/04/05/13/08/11/19/20/12/06/09/10/01/_sanity | **161/161 PASS** |
| Full `npm test` | 252 passed; 27 failed = Task 29+ stubs (Challenge 21 LiveFeed etc.), not Task 28 |

## Suggested commit

```text
feat: implement exact fee and rebate engine
```

## Master merge/push (after approval only)

```bash
git switch master
git fetch origin
git pull --ff-only origin master
git merge --ff-only task-28
git push origin master
git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

Never push the final competition submission to `main`; organisers require `master`.
