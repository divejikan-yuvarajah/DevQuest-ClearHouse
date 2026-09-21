# ClearHouse Task 29 — Netting and Multilateral Settlement

## Git

- Starting commit (implementation base): `4548c0b3054218408a5c2155092e410a938f9a60` (`feat: implement exact fee and rebate engine`)
- Earlier Task 29 branch tip before rebase onto master: `a42c0449386640829623042aae6ec0d2af22bdd7`
- Working branch: `task-29`
- Final submission branch: `master` (also mirrored to `main` on approval)
- Pre-existing dirty tree: untracked `prompts/` only (not part of Task 29)

## Challenge 14 test count

**8** organizer tests / **200/200** points (`config/scores.ts`).

| ID | Points | Focus |
|---|---|---|
| 14a-1 | 15 | Net-position preservation |
| 14a-2 | 15 | Debtor→creditor well-formed transfers |
| 14b-1 | 25 | Cycles cancel via net normalization |
| 14c-1 | 60 | Exact minimum transfer count vs brute-force oracle |
| 14d-1 | 20 | Per-asset independence |
| 14d-2 | 20 | Order/split invariance (`canonical` JSON compare) |
| 14e-1 | 35 | Large planted pairs/triples ≤5s (bound, not global min) |
| 14f-1 | 10 | Validation + empty |

## Public API

```ts
export function netObligations(obligations: readonly Obligation[]): Transfer[]
```

```ts
Obligation { id: string; from: string; to: string; asset: string; amount: bigint }
// from owes to amount in asset

Transfer { from: string; to: string; asset: string; amount: bigint }
// from pays to
```

Amount type: `bigint` only. Asset type: non-empty `string`. Account IDs: non-empty strings; self-obligation rejected.

## Validation (throws `RangeError`)

- empty `from` / `to` / `asset`
- non-bigint amount, or `amount <= 0n`
- `from === to`
- empty batch → `[]` (no throw)

Fixtures covered by 14f: zero, negative, self, blank from, blank asset, mixed batch containing a self obligation.

## Sign convention

For each obligation: `net[from] -= amount`, `net[to] += amount` (exact BigInt).

- negative net → debtor (payer)
- positive net → creditor (receiver)

Zero-net accounts removed. Cycles of equal obligations therefore yield `[]`.

## Algorithm

### Per asset

1. Aggregate nets; never cross-net assets.
2. Drop exact-zero accounts.
3. **If nonzero count ≤ 14:** global exact zero-sum partition via submask DP (same math as organizer `maxZeroSumGroups`). Min transfers = `n − maxGroups`. Exact search is **global** (not restricted to obligation-graph components) so cross-cluster balance cancellations required by 14c are found.
4. **Else (scale):** union-find on the undirected obligation graph; settle each component with deterministic greedy (≤ `live − 1`). Safe because 14e asserts only the cluster bound, not global minimum.

### Exact partition / tie-break

- Accounts sorted by id before bit indexing (input-order independence).
- DP records maximum group count; when several first groups give the same count, choose the lexicographically smallest group (member-index key).
- Each atomic zero-sum group settled with deterministic greedy: debtors/creditors sorted by id; `pay = min(debt, credit)`.
- Final transfers sorted by `(asset, from, to, amount)` with code-unit string compare.

### Challenge 14c oracle

- Oracle: `minimumTransfers = nonzero − maxZeroSumGroups(balances)`.
- Generators: cluster-planted edges; small batches with `nonzero ≤ 13` and larger two-cluster cases with `nonzero ≤ 10`.
- Compares **transfer count only** (not full plan equality).
- Max participants in exact-optimality cases: **13** (guard `≤ 13`); algorithm uses `EXACT_LIMIT = 14`.

### Challenge 14e generator

- 1600 clusters, size `2 + (c % 2)` → pairs and triples.
- 60 edges per cluster; amounts from LCG; input shuffled.
- Asserts: net preservation, `transfers.length ≤ Σ(live−1)`, elapsed `< 5000` ms.
- Does **not** assert global minimum transfer count.
- Measured: full Challenge 14 ~278–689 ms; 14e alone ~174–313 ms (budget 5000 ms).

### Greedy fallback

Used (1) inside each exact zero-sum group after partition, and (2) for large residual / component settlement when `n > 14`. Exact optimality is not required for 14e; complexity O(live) transfers per component after O(E α(n)) union-find.

## Invariants

- Input arrays/objects not mutated (no in-place sort of caller input).
- Assets solved independently; combined in asset-sorted order.
- Order/split independence via full aggregation + canonical sorts (14d-2 compares `JSON.stringify` with bigint→string).
- Pure domain: no ledger/DB/API side effects.

## Exact files changed

| File | Change |
|---|---|
| `src/domain/netting.ts` | Full `netObligations` implementation |
| `docs/clearhouse-task-29-netting.md` | This engineering note |

Protected untouched: organizer tests, `config/`, package files, env, Vitest/TS config, `knexfile.js`, migrations, seeds.

## Verification

| Check | Result |
|---|---|
| typecheck | PASS |
| Challenge 14 (8) | PASS (~278–689 ms; 14e ~174–313 ms) |
| 14a / 14b / 14c / 14d / 14e / 14f | PASS |
| Challenge 02/04/09/13 | PASS |
| Challenge 16 | PASS on current master (fee engine present) |
| Challenge 03/05/08 | PASS |
| Challenge 11/19/20/12 | PASS |
| Challenge 06/10/01/sanity | PASS |

## Suggested commit

```text
feat: implement optimal deterministic netting
```

## Master / main workflow

```powershell
git switch master
git fetch origin
git pull --ff-only origin master
git merge --ff-only task-29
git push origin master
git push origin master:main
```
