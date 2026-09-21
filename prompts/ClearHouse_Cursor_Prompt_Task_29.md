# ClearHouse — Complete Enhanced Cursor Prompt for Task 29

**Task:** Challenge 14 — Netting and Multilateral Settlement  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-29`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 29 purpose

Task 29 implements the full **Challenge 14 — Netting and Multilateral Settlement**.

The netting engine receives bilateral obligations such as:

```text
A owes B 40 USD
B owes C 25 USD
...
```

and must replace them with a deterministic set of net transfers that:

- preserves every account's exact final net position;
- treats every asset independently;
- eliminates cycles naturally through netting;
- allows only net debtors to pay;
- allows only net creditors to receive;
- minimizes the number of transfers, not merely the total amount;
- returns exactly the same output regardless of obligation input order;
- returns exactly the same output if one obligation is split into several smaller obligations;
- scales to the organizer's large batches containing thousands of planted pairs/triples;
- rejects invalid input with `RangeError`;
- returns no transfers for an empty batch.

This is an **algorithmic domain task**.

Do not automatically turn net transfers into balance movements or ledger entries unless `tests/challenge14.test.ts` explicitly says so. The published Challenge 14 contract is about computing the transfer plan. Actual final integration belongs later.

The current CodeCommit checkout and `tests/challenge14.test.ts` are authoritative.

---

# Published Challenge 14 contract — 200 points

## 14a — Net positions are preserved — 30 pts

### 14a-1 — 15 pts

Applying the returned transfer plan must reproduce **every account's original net position exactly, per asset**.

For one obligation:

```text
from owes to amount
```

the original net effect is conceptually:

```text
from: -amount
to:   +amount
```

for that asset.

The netted transfers must reproduce the same vector of account/asset effects.

Use exact integer arithmetic.

Do not compare only global totals.

### 14a-2 — 15 pts

Returned transfers must be well formed.

Only:

- net debtors pay;
- net creditors receive.

A net creditor must not appear as a payer merely because that can still mathematically settle the batch.

A net debtor must not appear as a receiver.

Transfer amounts must be valid according to the exact organizer contract.

---

## 14b — Cycles cancel — 25 pts

### 14b-1 — 25 pts

A cycle of equal obligations of **any length** contributes no transfer.

Example conceptually:

```text
A -> B : 50
B -> C : 50
C -> A : 50
```

Every participant has zero net position.

Expected net transfer plan:

```text
[]
```

Do not settle each bilateral edge physically.

Net positions are the source for the final plan.

---

## 14c — Minimum number of transfers — 60 pts

### 14c-1 — 60 pts

The number of output transfers must equal the organizer's **brute-force minimum** on generated cases with planted zero-sum groups.

This is stricter than ordinary debtor-creditor greedy matching.

A standard largest-debtor/largest-creditor or two-pointer settlement:

- preserves balances;
- is fast;
- often uses few transfers;

but **does not always achieve the global minimum number of transfers**.

Do not assume `nonzeroParticipants - 1` is always optimal.

Read the brute-force oracle and generated case sizes before choosing the algorithm.

---

## 14d — Assets and ordering — 40 pts

### 14d-1 — 20 pts

Assets are netted independently.

For a batch containing USD + BTC + EUR obligations:

- compute each asset's participant net positions separately;
- no transfer may offset one asset against another;
- combined output must equal the canonical combination of the independently netted asset results.

No cross-asset cancellation.

### 14d-2 — 20 pts

The result must be **identical** for:

- any permutation of the input obligation list;
- any splitting of an obligation into equivalent smaller obligations.

This is an exact deterministic-output requirement, not merely "same net effect."

Therefore:

1. normalize inputs into aggregate per-account/per-asset net positions;
2. discard original input ordering as an algorithmic signal;
3. use deterministic canonical ordering and deterministic tie-breakers;
4. do not derive transfer order from Map insertion order caused by input order.

---

## 14e — Scale — 35 pts

### 14e-1 — 35 pts

A large batch with **thousands of planted pairs and triples** must be netted correctly within the organizer's time budget.

This creates an important algorithm-design requirement:

- exact brute force on all participants is not scalable;
- naive subset search over thousands of balances is impossible;
- naive O(n²) or exponential work on the entire large set may fail.

Read the large-batch generator.

Exploit mathematically valid structure rather than hardcoding visible fixture values.

Use a hybrid algorithm where appropriate:

- normalization first;
- cheap exact zero-sum decomposition;
- exact search on small residual components;
- deterministic scalable settlement for large structures only in a way that still satisfies the organizer's exact transfer-count requirement.

The current test determines the acceptable strategy.

---

## 14f — Input validation — 10 pts

### 14f-1 — 10 pts

Invalid obligations throw `RangeError`.

An empty batch returns an empty transfer plan.

Read every invalid fixture in the organizer test before coding.

Do not silently coerce malformed values.

---

# Challenge 14 score map

```text
14a = 30
14b = 25
14c = 60
14d = 40
14e = 35
14f = 10
----------------
Total = 200
```

These are available points only, not an earned-score claim.

---

# Core net-position model

The first stage should normally be pure normalization.

For every valid obligation of one asset:

```text
payer/from net   -= amount
receiver/to net  += amount
```

After processing all obligations:

- negative net = debtor;
- positive net = creditor;
- zero = settled / irrelevant.

The exact sign convention may be represented the other way in current source/tests. Read the current types and use the organizer's expected semantics.

The important invariant is:

```text
Σ accountNet(asset) = 0
```

for every asset independently.

Do not use JavaScript floating point.

Use the exact integer type required by the organizer, typically BigInt.

---

# Why normalization is essential for 14d-2

These two inputs are economically identical:

```text
A -> B : 100
```

and:

```text
A -> B : 40
A -> B : 60
```

They must yield the **same exact netting output**.

Likewise any permutation of the input array must produce identical output.

Therefore the algorithm must not use:

- original obligation sequence;
- original edge count;
- original edge IDs;
- arbitrary insertion order

as a final-output decision signal, unless the organizer test explicitly defines otherwise.

Canonical net positions must drive the plan.

---

# Minimum-transfer theory relevant to Task 29

For one asset, after removing zero-net accounts, let there be `n` nonzero balances.

A valid settlement can always be produced greedily, but the minimum-transfer problem is equivalent to maximizing the number of disjoint zero-sum participant groups.

If the nonzero balances can be partitioned into `g` zero-sum groups, and each group contains `k_i` participants, that group can generally be settled in at most:

```text
k_i - 1
```

transfers.

Across all groups:

```text
minimum transfers = n - maximumZeroSumGroupCount
```

for the standard debt-settlement formulation.

This is why an arbitrary debtor-creditor greedy algorithm can miss the optimum.

Finding the maximum zero-sum partition is combinatorial/NP-hard in the general case, so **do not brute-force thousands of participants**.

Read Challenge 14c and 14e's generator structure and use a correct hybrid strategy.

---

# Algorithm strategy requirement

Cursor must inspect the test generator before deciding.

A strong general strategy may include:

1. validate input;
2. aggregate exact net balance per `(asset, account)`;
3. remove zero balances;
4. process each asset independently;
5. put accounts into a canonical deterministic order;
6. identify trivially exact zero-sum groups cheaply:
   - exact opposite pairs;
   - organizer-relevant structured groups;
   - other safe decomposition revealed by the generator;
7. solve small residual groups/components with an exact minimum-transfer search;
8. never run exponential search on the entire large-scale batch;
9. generate deterministic transfers within each chosen zero-sum group;
10. globally sort transfers canonically.

This is a design direction, **not permission to hardcode the organizer generator**.

If the actual tests use a different structure, implement against the test contract.

---

# Exact small-case search

For the small cases used by Challenge 14c's brute-force oracle, a standard exact debt-settlement DFS/backtracking with memoization may be suitable.

A known pattern:

- work on a canonical array of nonzero balances;
- recursively settle the first nonzero balance against compatible opposite-sign balances;
- mutate/restore a local working copy;
- skip equivalent duplicate states;
- memoize canonical remaining state;
- track minimum number of transactions.

However, Challenge 14d-2 requires the **actual output plan** to be deterministic, not just the minimum count.

If using exact search:

- store/reconstruct a canonical optimal plan;
- when multiple plans have the same minimum count, choose a deterministic lexicographically defined plan according to the current test's expected canonical ordering or a stable rule that the tests accept;
- do not let recursion branch order depend on original input order.

Read the organizer comparison carefully:
it may compare only transfer count for 14c but exact output for permutation/splitting cases.

---

# Large-case strategy warning

Do not apply subset DP over `2^n` for thousands of participants.

Do not apply pairwise 3SUM-style O(n²) over tens of thousands unless the test size proves it is acceptable.

Do not use factorial permutation search.

Read Challenge 14e's generator.

If the large generator creates independent zero-sum structures that can be separated by a cheap invariant or component representation, exploit that mathematically.

If exact minimum count is not asserted in 14e, do not spend exponential work there unnecessarily.

If exact minimum count **is** asserted in 14e, the generator necessarily contains exploitable structure—identify it from the test, then implement a general structural algorithm rather than fixture constants.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 29

Copy the complete block below into Cursor Agent mode.

````text
Act as my senior TypeScript algorithms engineer, fintech clearing/netting engineer, exact-arithmetic reviewer, and performance engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 29 ONLY: implement Challenge 14 — Netting and Multilateral Settlement — completely and correctly.

Preserve all completed Tasks 1–28.

Your implementation must:
- preserve every account's net position per asset;
- allow only net debtors to pay and net creditors to receive;
- eliminate zero-net cycles;
- produce the minimum number of transfers where Challenge 14 requires exact optimality;
- net assets independently;
- produce exactly deterministic output regardless of input order or obligation splitting;
- scale to the organizer's large batch;
- throw RangeError for invalid obligations;
- return [] for empty input.

Do not stop at a plan. Inspect, implement, run official tests/regressions, create the Task 29 engineering note, and show reviewed Git commands.

Do not automatically commit, merge, or push.

============================================================
A. REPOSITORY / SUBMISSION CONTEXT
============================================================

Working directory:

C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b

Official remote:

origin

Official CodeCommit repository:

https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b

OFFICIAL FINAL SUBMISSION BRANCH:

master

Task branch:

task-29

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–28;
- work on task-29;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT TASK 29 SCOPE
============================================================

IMPLEMENT:

Challenge 14a:
- exact net-position preservation;
- well-formed transfers;
- debtors-only pay;
- creditors-only receive.

Challenge 14b:
- exact cancellation of zero-net cycles.

Challenge 14c:
- minimum transfer count against brute-force oracle.

Challenge 14d:
- independent assets;
- deterministic output;
- input-order invariance;
- obligation-splitting invariance.

Challenge 14e:
- large-batch scale.

Challenge 14f:
- RangeError validation;
- empty batch.

PRESERVE:
- Challenge 02 ledger;
- Challenge 04 settlement;
- Challenge 09 reconciliation;
- Challenge 13 account status;
- Challenge 16 fee engine;
- exact financial arithmetic.

DO NOT IMPLEMENT:
- Task 30 Challenge 15 complex strategy orders;
- Task 31 WebSocket server;
- Task 32 live client;
- Task 33 final integration;
- automatic physical settlement of the returned plan unless challenge14 explicitly requires it.

============================================================
C. STRICT ORGANIZER / FILE RULES
============================================================

Do NOT modify any organizer test.

Do NOT add new test files.

Do NOT modify:

- config/
- config/scores.ts
- package.json
- package-lock.json
- .env
- .gitignore
- tsconfig files
- vitest.config.ts
- knexfile.js
- migrations
- seeds
- grading/result-upload scripts

Do NOT:
- reduce brute-force comparison sizes;
- weaken minimum-transfer assertion;
- lower large-batch size;
- increase organizer timeouts;
- freeze property/random generators.

Do NOT add source logic checking:
- NODE_ENV === "test";
- VITEST;
- challenge14 filename;
- known planted group values;
- known account IDs;
- known batch size;
- visible input permutations.

Do NOT use:
- Number(amount);
- parseFloat(amount);
- floating-point balances.

Use the exact integer representation from current Challenge 14 source/test.

No destructive Git:
- no reset --hard;
- no clean -fd;
- no force-push;
- no history rewrite.

============================================================
D. GIT PRE-FLIGHT
============================================================

Run:

Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"

git status --short
git status -sb
git branch --show-current
git branch --list
git rev-parse --verify HEAD
git remote -v
git log -15 --oneline --decorate
git diff --stat
git diff --cached --stat

Confirm:
- origin = official CodeCommit remote;
- master = official final submission branch.

Verify Task 28 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-28 exists:

git log --oneline --decorate --max-count=10 task-28

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-29

If task-29 already exists:

git branch --list task-29
git log --oneline --decorate --max-count=10 task-29

Do not delete/recreate blindly.

Record:
- starting commit;
- current branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
E. VERIFY PREREQUISITES
============================================================

Read if present:

- docs/clearhouse-task-04-money.md
- docs/clearhouse-task-10-ledger.md
- docs/clearhouse-task-13-atomic-settlement.md
- docs/clearhouse-task-19-reconciliation-migration.md
- docs/clearhouse-task-28-fee-rebate-engine.md

Verify source, not only notes.

Challenge 14 should normally be a pure domain algorithm and should not need to mutate:
- balances;
- ledger;
- DB.

Before editing run:

npm run typecheck
npm test challenge02.test.ts
npm test challenge04.test.ts

Record baseline failures.

============================================================
F. READ CHALLENGE 14 COMPLETELY
============================================================

Read:

tests/challenge14.test.ts

from first line to last line.

Read:

config/scores.ts

READ ONLY.

Build an exact matrix:

test
| points
| imported function/export
| Obligation type
| Transfer type
| amount type
| validation expectations
| exact output comparison
| generator size/structure
| performance threshold
| current failure

Record:
- exact Challenge 14 test count;
- exact exported function/class names;
- Obligation fields;
- Transfer fields;
- asset type;
- amount type;
- account-ID constraints;
- whether self-obligations are valid/ignored/invalid;
- whether zero amounts are invalid;
- whether negative amounts are invalid;
- whether empty/blank asset invalid;
- exact canonical output ordering asserted;
- whether output amount is bigint or string;
- whether 14c compares count only or exact plan;
- exact small-case participant bounds;
- exact planted zero-sum generator structure;
- exact 14e batch size;
- exact time threshold;
- whether 14e asserts minimum count or only correctness;
- all invalid cases.

DO NOT GUESS.

============================================================
G. DISCOVER CURRENT NETTING SOURCE
============================================================

Search:

rg -n "netting|Netting|obligation|Obligation|transfer|Transfer|netObligations|minimumTransfers|multilateral|settleNet" src tests

PowerShell fallback:

Get-ChildItem -Recurse src,tests -File |
  Select-String -Pattern "netting|Netting|obligation|Obligation|transfer|Transfer|netObligations|minimumTransfers|multilateral|settleNet"

Read every actual Challenge 14 stub/source file completely.

Potential examples only:
- src/domain/netting.ts
- src/services/nettingEngine.ts

Use actual current paths.

Write down public signatures before changing anything.

============================================================
H. RUN TASK 29 BASELINE
============================================================

Run:

npm test challenge14.test.ts

If labels exist:

npm test challenge14.test.ts -t "Challenge 14a"
npm test challenge14.test.ts -t "Challenge 14b"
npm test challenge14.test.ts -t "Challenge 14c"
npm test challenge14.test.ts -t "Challenge 14d"
npm test challenge14.test.ts -t "Challenge 14e"
npm test challenge14.test.ts -t "Challenge 14f"

Use actual labels.

Record:
- exact executed count;
- pass/fail;
- randomized/property seed/path if present;
- brute-force mismatch details;
- large-batch duration.

Filtered-out tests are NOT passed.

============================================================
I. VALIDATE BEFORE NETTING
============================================================

Read Challenge 14f exactly.

Every invalid obligation must throw RangeError.

Validation must occur before any externally visible mutation.

Prefer a pure function with no external mutation anyway.

Possible invalid cases MAY include:
- missing/blank payer;
- missing/blank receiver;
- invalid asset;
- zero amount;
- negative amount;
- malformed amount;
- same payer/receiver.

These are examples only.

Implement exact test contract.

Do not silently:
- drop malformed rows;
- absolute-value negative amounts;
- convert empty to zero;
- coerce decimals.

============================================================
J. EMPTY INPUT
============================================================

Challenge 14f requires:

empty obligation list -> []

Return the exact expected collection type.

Do not throw.

Do not fabricate a transfer.

============================================================
K. INPUT IMMUTABILITY
============================================================

Do not mutate:
- input obligation array;
- obligation objects.

Do not sort caller array in place.

If canonical sorting is needed:
copy first.

Challenge 14d may reuse equivalent fixtures.

============================================================
L. NORMALIZE EACH ASSET INDEPENDENTLY
============================================================

First build exact net positions.

Conceptually for obligation:

from -> to, amount A, asset X

update:

net[X][from] -= A
net[X][to]   += A

Use current sign convention consistently.

Do NOT combine assets.

Recommended logical structure:

Map<asset, Map<accountId, bigint>>

or exact current equivalent.

Do not use concatenated `"asset|account"` keys if IDs may contain delimiter characters unless current contract guarantees safety.

============================================================
M. BIGINT ONLY
============================================================

Net positions, obligations and transfers may exceed 2^53.

Use BigInt if current domain amount is bigint.

Never:
- Number(amount);
- parseFloat;
- Math.abs(BigInt);
- floating point.

For absolute BigInt:

value < 0n ? -value : value

Do not use Math.abs.

============================================================
N. REMOVE ZERO NET POSITIONS
============================================================

After aggregation:

discard accounts whose net position is exactly zero.

They:
- owe nothing;
- receive nothing;
- should not appear in output.

This naturally cancels cycles.

Do not preserve original bilateral edges for zero-net accounts merely because they appeared in input.

============================================================
O. CYCLE CANCELLATION — 14b
============================================================

For an equal cycle:

A -> B X
B -> C X
...
Z -> A X

all net positions become zero.

Output for that asset must be empty.

Do not implement a special graph-cycle detector if normalization already solves it.

The challenge says cycle of any length.

Net-position aggregation is the robust general solution.

============================================================
P. ORIGINAL EDGE GRAPH IS NOT THE FINAL PLAN
============================================================

Do not merely:
- merge duplicate bilateral edges;
- cancel reciprocal A->B and B->A;
- return remaining original edges.

That can preserve unnecessary cycles and fail minimum transfer count.

The final plan must be computed from participant net positions.

============================================================
Q. DEBTOR / CREDITOR CLASSIFICATION
============================================================

After normalization define consistently:

negative net -> debtor
positive net -> creditor

or the opposite if current source uses reversed sign.

Returned transfers must always flow:
debtor -> creditor.

Do not create:
creditor -> debtor
with a negative amount.

Transfer amount should be positive if that is current contract.

============================================================
R. NET POSITION PRESERVATION — 14a-1
============================================================

For each asset, applying returned transfers should reproduce every account's original net.

Reason through:

outputNet[from] -= amount
outputNet[to] += amount

Then:

outputNet(account, asset) === inputNet(account, asset)

for every account.

Do not validate only:
sum(output) = 0.

Per-account equality is required.

============================================================
S. WELL-FORMED TRANSFERS — 14a-2
============================================================

Read exact assertions.

Likely every transfer must:
- have nonblank from/to/asset;
- have positive amount;
- have distinct from/to;
- reference a net debtor as from;
- reference a net creditor as to;
- not exceed remaining need.

Follow current Transfer type.

Do not emit zero transfers.

============================================================
T. DETERMINISTIC ASSET ORDER
============================================================

Input order must not affect output.

Use a canonical deterministic asset ordering according to test.

Likely lexical ordering, but READ TEST.

Do not rely on first-seen order from input.

If test compares output array deeply:
asset group ordering matters.

============================================================
U. DETERMINISTIC ACCOUNT ORDER
============================================================

Canonicalize participant ordering.

Use the exact comparator expected/accepted by test:
- lexical account ID;
- another stable current rule.

Do not use:
- object insertion order;
- original obligation order.

When values tie, account ID should generally be the deterministic tie-breaker if current test permits.

============================================================
V. OBLIGATION SPLITTING INVARIANCE — 14d-2
============================================================

These must yield identical final output:

A->B 100

versus

A->B 20
A->B 30
A->B 50

Normalization achieves identical net vectors.

No later stage may inspect original edge count/size to choose a different plan.

Do not use original obligation IDs as tie-breakers.

============================================================
W. INPUT PERMUTATION INVARIANCE — 14d-2
============================================================

Any permutation of the input obligations must yield exactly identical output.

Avoid:
- Set/Map order based on first encounter;
- recursion order derived from input;
- "first debtor seen";
- "first creditor seen".

Sort canonical state before search/settlement.

============================================================
X. MULTI-ASSET INDEPENDENCE — 14d-1
============================================================

Run the single-asset algorithm independently for each asset.

Combining USD obligations must not influence:
- BTC participant grouping;
- EUR transfer choices;
- tie-breakers within another asset.

Then concatenate results using canonical asset/transfer ordering.

Do not cross-net economic values.

============================================================
Y. MINIMUM TRANSFER COUNT IS NOT SIMPLE GREEDY
============================================================

Challenge 14c compares against a brute-force minimum.

A naive settlement:

while debtor & creditor:
    pay min(debt, credit)

can be nonoptimal in transaction count.

Do not declare Task 29 complete merely because all balances settle.

Read the oracle and find counterexamples if baseline greedy exists.

============================================================
Z. EXACT OPTIMALITY MODEL
============================================================

For one asset, after removing zeros:

let balances b1...bn sum to zero.

The transaction-count optimum corresponds to maximizing the number of disjoint zero-sum groups.

If the optimal partition has g zero-sum groups:

minimum transfers is generally:

n - g

for the standard debt-settlement model.

Use this insight to understand the brute-force oracle.

Do NOT assume all participants form one group requiring n-1 transfers.

============================================================
AA. SMALL-CASE EXACT SEARCH
============================================================

Read 14c generator's maximum nonzero participant count.

If small enough, use an exact search.

A standard exact DFS/backtracking approach can settle the first nonzero balance against opposite-sign candidates.

Conceptually:

solve(state):
    canonicalize/remove zeros
    choose first nonzero i
    best = infinity
    for each j > i with opposite sign:
        transfer appropriate amount between i/j
        recurse
        restore
        best = min(best, 1 + child)

Optimization:
- memoize canonical remaining state;
- skip duplicate equivalent candidate balances;
- prioritize exact cancellation;
- branch-and-bound.

BUT output must also be deterministic.

Store/reconstruct a canonical optimal plan.

============================================================
AB. EXACT-CANCELLATION PRUNING
============================================================

In standard debt-settlement DFS, if matching the first balance with an opposite balance cancels it exactly, that branch is often a strong pruning opportunity.

Use only mathematically valid pruning.

Do not prune alternatives if doing so could miss another equal-count plan needed by deterministic output contract, unless exact count only matters and final canonical plan is separately generated.

Read tests.

============================================================
AC. MEMOIZATION KEY
============================================================

Memo key must represent the remaining mathematical state, not input history.

Potential canonical representation:
- sorted account+balance state;
- sorted balance multiset if identities are irrelevant to count.

For reconstructing deterministic plans, identities do matter.

Separate:
- count-state optimization;
- plan reconstruction

if useful.

Do not JSON.stringify BigInt directly without conversion.

Use deterministic bigint string encoding.

============================================================
AD. SKIP EQUIVALENT BALANCE BRANCHES
============================================================

If two candidate counterparties have equal balances, exploring both may produce equivalent count states.

Use a Set of tried balance values where safe.

Do not collapse different account identities when exact output selection requires one specific canonical account; branch count optimization and plan reconstruction may need separation.

============================================================
AE. CANONICAL OPTIMAL PLAN
============================================================

If multiple minimum-count plans exist, Challenge 14d requires deterministic output.

Read whether tests require one exact plan or only invariance across equivalent inputs.

A robust deterministic rule:

- define transfer canonical key from asset/from/to/amount;
- among equal-minimum plans choose lexicographically smallest normalized transfer list according to current field comparator.

Do not assume this exact rule is organizer-required; it is a strong way to make output stable if tests only require self-consistency across permutations/splits.

Do not choose based on recursion accident.

============================================================
AF. PLAN COMPARISON COST
============================================================

For small exact cases, comparing canonical plan arrays is acceptable.

Do not carry giant plan copies through large-scale search.

Use exact search only where participant count is small.

============================================================
AG. GENERAL PROBLEM IS COMBINATORIAL
============================================================

Do not run exact subset/DFS over thousands of participants.

Minimum transaction settlement is combinatorial in general.

Challenge 14e's large generator must contain exploitable structure or may not assert global minimum.

READ THE TEST.

Document the discovered generator structure without hardcoding specific random values.

============================================================
AH. LARGE-BATCH GENERATOR ANALYSIS — 14e
============================================================

Inspect:
- number of obligations;
- number of participants;
- how planted pairs are constructed;
- how planted triples are constructed;
- whether groups use disjoint account sets;
- whether group sums are independently zero;
- whether original graph components expose groups;
- whether output count is asserted;
- whether only net preservation/well-formedness is asserted;
- benchmark threshold.

Do this before choosing the scale algorithm.

============================================================
AI. STRUCTURAL DECOMPOSITION
============================================================

If large generator creates independent/disconnected obligation groups and test permits using graph structure:

you may:
1. normalize duplicate/split edges;
2. form deterministic components from the obligation-account graph;
3. prove each component's per-asset net sum is zero;
4. solve each component independently;
5. combine canonical results.

However, 14d-2 splitting invariance means decomposition must not change when a single obligation is split.

A graph edge split between same accounts preserves components, so that can remain invariant.

Input order must still be ignored.

Do not use components if the organizer generator cross-connects groups or if exact output test makes original graph irrelevant.

============================================================
AJ. ZERO-SUM GROUP DECOMPOSITION
============================================================

If the generator plants zero-sum balance groups that can be recovered from normalized balances cheaply:

recover them using a general mathematical rule.

Possible safe cheap cases:
- exact opposite pairs using a value map;
- test-defined structured triples if discoverable without fixture constants.

Do not blindly run O(n²) 3SUM over huge n until checking test size/time.

Do not hardcode generated ranges or account naming patterns.

============================================================
AK. OPPOSITE PAIRS
============================================================

An exact pair:

+x and -x

forms its own zero-sum group.

Settles in exactly one transfer.

Pair extraction can be implemented efficiently with maps keyed by exact BigInt value.

For deterministic pairing:
sort/canonicalize account IDs before pairing equal-value duplicates.

This is a mathematically general optimization.

Do not let pairing order depend on input.

============================================================
AL. TRIPLES
============================================================

A zero-sum triple can settle in two transfers.

General detection of arbitrary triples can be O(n²), so inspect 14e.

If the large generator specifically exposes a more efficient structure:
use that.

If participant count after pair removal is small enough:
exact search can find triples automatically.

Do not add a quadratic global triple finder blindly.

============================================================
AM. COMPONENT-FIRST HYBRID
============================================================

A strong scalable architecture, IF consistent with tests, is:

per asset:
1. normalize balances;
2. deterministic graph/component decomposition if safe and invariant;
3. solve very small components exactly;
4. extract trivial exact pairs;
5. solve manageable residual components with exact DFS;
6. use a proven organizer-compatible scalable method for genuinely large residuals;
7. canonicalize transfers.

The exact thresholds should be based on algorithm safety, not hidden test constants.

Do not write:
if n === 5000 then special case.

============================================================
AN. GREEDY FALLBACK
============================================================

A deterministic debtor-creditor greedy algorithm is acceptable only where the current organizer test does NOT require exact minimum count for that residual.

It must still:
- preserve nets;
- debtors pay creditors;
- be deterministic;
- use exact arithmetic.

Do not use greedy as the only algorithm for Challenge 14c.

============================================================
AO. DETERMINISTIC GREEDY IF USED
============================================================

If used for a permitted large residual:

sort debtors/creditors using a canonical rule.

Possible:
- magnitude descending, then account ID;
or
- account ID.

Read output invariance tests.

Every time balances change, data structure/order must remain deterministic.

Do not use random heap tie ordering.

============================================================
AP. PRIORITY QUEUE WITHOUT DEPENDENCY
============================================================

If large greedy matching needs max debtor/creditor:
use current dependencies only.

Do not install a heap package.

A sorted array may be enough if one-time sorted with linear pointers, depending on settlement approach.

Do not repeatedly sort all nodes after each transfer.

============================================================
AQ. SIMPLE TWO-POINTER SETTLEMENT
============================================================

Given a chosen zero-sum group:

separate canonical debtors and creditors.

A deterministic two-pointer settlement can settle a group in at most:

participants - 1

transfers.

For a group that is known to be indivisible in the optimal zero-sum partition, that count is optimal for that group.

Do not claim global optimality unless group decomposition is exact.

============================================================
AR. TRANSFER AMOUNT
============================================================

Transfer amount is the exact amount needed to reduce either:
- debtor remaining debt to zero;
- creditor remaining receivable to zero.

Conceptually:

amount = min(abs(debtorRemaining), creditorRemaining)

Use BigInt.

Never emit zero.

Update exact remainders.

============================================================
AS. NO OVERPAYMENT
============================================================

A transfer must never:
- make debtor become net creditor;
- make creditor become net debtor.

Settle one side to zero on every normal debtor-creditor payment.

This guarantees progress.

============================================================
AT. PROGRESS / NO INFINITE LOOP
============================================================

Every emitted transfer must zero at least one remaining side if using min(debt, credit).

Ensure pointers/indices advance.

Do not leave a 0 balance at current pointer.

No sleep/retry loops.

============================================================
AU. CANONICAL TRANSFER SORT
============================================================

After generating all asset transfers, sort final output by the exact canonical rule accepted by test.

Possible stable hierarchy:
1. asset;
2. from account;
3. to account;
4. amount.

Do not assume; read test.

If exact plan reconstruction already has required order, still ensure equivalent inputs produce identical order.

============================================================
AV. DO NOT MERGE TRANSFERS INCORRECTLY
============================================================

If two generated transfers have same:
- asset;
- from;
- to

you may be tempted to merge them.

Read exact output/minimum contract.

Merging same-direction same-party transfers reduces count and preserves nets, so a minimum plan should generally not contain duplicates.

A canonical post-merge may be valid, but ensure:
- it does not hide a bug in group generation;
- amount stays exact;
- no zero result.

If test expects exact plan fields only, merging is sensible.

============================================================
AW. ZERO-SUM ASSET
============================================================

If all accounts for one asset net to zero:

emit nothing for that asset.

Do not include a zero transfer or placeholder.

This includes pure cycles.

============================================================
AX. SINGLE NONZERO IMPOSSIBLE STATE
============================================================

A valid obligation batch for one asset should have net sum zero, so one nonzero participant cannot occur.

If internal normalization yields nonzero global sum:
that indicates a bug or malformed internal state.

Do not silently fabricate a clearing account unless current test explicitly defines one.

============================================================
AY. SELF OBLIGATIONS
============================================================

Read validation.

If:

A owes A 10 USD

is valid, it has zero net effect and can be ignored after validation.

If organizer requires RangeError:
throw.

Do not guess.

============================================================
AZ. DUPLICATE OBLIGATIONS
============================================================

Multiple identical obligations are valid unless test says otherwise.

They aggregate exactly.

Do not dedupe them as duplicate events.

Splitting invariance depends on summing all pieces.

============================================================
BA. RECIPROCAL OBLIGATIONS
============================================================

A->B 10
B->A 10

net to zero.

Return no transfer.

Do not preserve one edge arbitrarily.

============================================================
BB. MULTI-ASSET SAME ACCOUNTS
============================================================

A may be:
- USD debtor;
- BTC creditor.

That is valid.

Do not classify an account globally as debtor or creditor across assets.

Classification is per asset.

============================================================
BC. AMOUNT SERIALIZATION
============================================================

Read direct domain test type.

If Transfer.amount is bigint:
keep bigint.

Do not stringify solely for convenience.

If amount is a string by contract:
validate strict integer grammar and produce exact string.

No Number bridge.

============================================================
BD. ACCOUNT IDENTIFIER COMPARATOR
============================================================

Use deterministic comparison compatible with current IDs.

If IDs are arbitrary strings:
use a simple stable code-unit lexical comparator if test uses `.sort()` semantics.

Avoid localeCompare if locale-dependent behavior could vary and test uses raw lexical comparator.

Read test.

============================================================
BE. ASSET COMPARATOR
============================================================

Same rule:
use the exact test comparator.

Do not rely on locale.

============================================================
BF. PLAN KEY / MEMO KEY
============================================================

If comparing plans lexicographically:
create deterministic encoded tuples.

Do not use ambiguous concatenation without separators/escaping if IDs can contain delimiters.

Prefer tuple comparison function over concatenated string when practical.

============================================================
BG. EXACT SEARCH STATE MUTATION
============================================================

For performance, local mutable arrays during DFS are acceptable if:
- state is restored exactly;
- caller inputs are untouched;
- memo keys are canonical;
- no shared global contamination between calls.

Do not reuse mutable search buffers across assets/calls unless fully reset.

============================================================
BH. MEMOIZATION SCOPE
============================================================

Memo should be local to one canonical subproblem or safely keyed by full state.

Do not keep an unbounded global memo across unrelated calls that:
- leaks memory;
- depends on account IDs from previous calls;
- corrupts deterministic plan reconstruction.

Challenge 14e may call repeatedly.

============================================================
BI. SYMMETRY PRUNING
============================================================

Use safe symmetry pruning:
- skip counterparties with identical remaining balance values after trying one.

But if deterministic plan identities matter, make sure plan reconstruction still chooses canonical participant.

Count optimization can use balance-only symmetry; final plan selection may require identities.

============================================================
BJ. LOWER BOUNDS
============================================================

For branch-and-bound exact search, useful lower bounds may come from:
- each transaction can settle at most one new participant except final closure;
- current nonzero count.

Only use a mathematically safe bound.

Do not prune a potentially optimal plan.

============================================================
BK. EXACT GROUP PARTITION OPTION
============================================================

Another possible exact small-n approach:

maximize the count of disjoint zero-sum subsets via subset DP.

This can be effective for very small n but is O(2^n).

Read 14c sizes before using it.

Do not apply subset DP to the large benchmark.

============================================================
BL. PERFORMANCE MEASUREMENT
============================================================

Record actual 14e organizer test timing if reported.

Do not:
- change timeout;
- reduce input;
- skip minimum checks.

If 14e fails time:
identify asymptotic bottleneck.

Do not sacrifice exact BigInt or determinism for speed.

============================================================
BM. NO DEBUG LOGGING IN HOT LOOPS
============================================================

Do not console.log:
- every obligation;
- every DFS state;
- every large-batch transfer.

Thousands/exponential cases will become slow.

Use final summary only.

============================================================
BN. NO JSON BIGINT IN HOT MEMO IF AVOIDABLE
============================================================

`JSON.stringify` cannot serialize BigInt directly.

If memoizing:
use a compact deterministic string representation or structured Map keys strategy.

Do not repeatedly deep-clone huge state.

============================================================
BO. INVALID AMOUNT GRAMMAR
============================================================

If current obligation amount enters as string:
use strict integer grammar.

Reject:
- decimal fraction;
- exponent notation;
- blank/whitespace;
- malformed sign

according to test.

Then BigInt.

Do not use parseInt.

============================================================
BP. RANGEERROR TYPE
============================================================

Challenge 14f explicitly requires RangeError.

Throw RangeError for organizer-defined invalid obligations.

Do not return:
{ error: ... }

This is a domain test unless current route exists.

Do not use generic Error where RangeError is asserted.

============================================================
BQ. VALIDATION BEFORE NORMALIZATION
============================================================

Validate every obligation before trusting its amount/account/asset.

Do not partially aggregate some rows then throw after modifying external/shared state.

Pure local maps can simply be discarded on throw.

No global cache.

============================================================
BR. NO DATABASE / LEDGER SIDE EFFECT BY DEFAULT
============================================================

Challenge 14's published contract is transfer-plan computation.

Do not:
- withdraw balances;
- call settleTrade;
- create ledger entries;
- create DB tables.

Unless the organizer test explicitly tests a settlement executor in Challenge 14, keep the algorithm pure.

Task 33 can integrate later.

============================================================
BS. IF A SETTLEMENT EXECUTOR EXISTS
============================================================

If challenge14 source/test explicitly includes a function to apply returned transfers:
read exact contract.

Do not invent it.

If required:
- preserve account closure rules;
- exact balances;
- atomicity;
- ledger entries

using earlier helpers.

But do not broaden Task 29 unless test requires.

============================================================
BT. OPENAPI / HTTP
============================================================

If no Challenge 14 HTTP route exists:
do not add one.

Do not modify Task 25 OpenAPI.

If an existing netting route stub is explicitly tested:
implement only exact required integration and keep Challenge 19 accurate.

No speculative API.

============================================================
BU. NO MIGRATIONS
============================================================

Do not modify database migrations for a pure netting algorithm.

Do not add a netting table.

Do not modify seeds.

============================================================
BV. EXPECTED TASK 29 FILE SCOPE
============================================================

Primary:
- actual Challenge 14 netting domain/engine source discovered from current repo.

Potential examples only:
- src/domain/netting.ts
- src/services/nettingEngine.ts

Create/update:

docs/clearhouse-task-29-netting.md

Normally do NOT change:
- ledger repository;
- settlement repository;
- server/routes;
- OpenAPI;
- matching;
- fee engine;
- client;
- database.

Do NOT add tests.

============================================================
BW. REQUIRED VERIFICATION — CHALLENGE 14
============================================================

After implementation:

npm run typecheck

Primary gate:

npm test challenge14.test.ts

If current labels exist:

npm test challenge14.test.ts -t "Challenge 14a"
npm test challenge14.test.ts -t "Challenge 14b"
npm test challenge14.test.ts -t "Challenge 14c"
npm test challenge14.test.ts -t "Challenge 14d"
npm test challenge14.test.ts -t "Challenge 14e"
npm test challenge14.test.ts -t "Challenge 14f"

Use actual labels.

Record:
- exact count;
- random/property seed/path;
- brute-force optimality result;
- large-batch time.

============================================================
BX. LEDGER / SETTLEMENT REGRESSION
============================================================

Run:

npm test challenge02.test.ts
npm test challenge04.test.ts
npm test challenge09.test.ts

Task 29 should not modify these systems.

============================================================
BY. ACCOUNT / FEE REGRESSION
============================================================

Run:

npm test challenge13.test.ts
npm test challenge16.test.ts

Do not regress account closure or fees.

============================================================
BZ. MATCHING / RISK / MARKET REGRESSION
============================================================

Run:

npm test challenge03.test.ts
npm test challenge05.test.ts
npm test challenge08.test.ts

Pure netting should not affect these.

============================================================
CA. API / DOC / DEMO REGRESSION
============================================================

Run:

npm test challenge11.test.ts
npm test challenge19.test.ts
npm test challenge20.test.ts
npm test challenge12.test.ts

No API/client change should normally occur.

============================================================
CB. EVENT / OPS REGRESSION
============================================================

Run:

npm test challenge06.test.ts
npm test challenge10.test.ts
npm test challenge01.test.ts
npm test _sanity.test.ts

Then:

git diff --check

Finally:

npm test

Record Task 30+ failures honestly.

============================================================
CC. FAILURE DIAGNOSIS — 14a-1
============================================================

If net positions differ:
- sign convention reversed;
- transfer amount over/under-applied;
- zero-net participant included incorrectly;
- asset grouping mixed;
- BigInt conversion issue.

Build inputNet and outputNet and find first account/asset divergence.

Do not patch specific fixture.

============================================================
CD. FAILURE DIAGNOSIS — 14a-2
============================================================

If creditor pays:
- classification bug;
- group settlement directions reversed;
- negative transfer amount used.

Every output from-account must start as a net debtor for that asset under organizer semantics.

Every to-account must start as net creditor.

============================================================
CE. FAILURE DIAGNOSIS — 14b-1
============================================================

If cycle emits transfers:
you are likely operating on original edges instead of aggregate net positions.

Normalize first.

Equal cycle should have no nonzero balances.

============================================================
CF. FAILURE DIAGNOSIS — 14c-1
============================================================

If plan is valid but transfer count exceeds brute-force optimum:
- greedy-only algorithm;
- zero-sum subgroups not decomposed;
- exact search pruning invalid;
- memo key loses necessary state;
- search threshold falls back too early.

Inspect minimal counterexample from organizer.

Compare:
- nonzero participant count;
- optimal zero-sum partition;
- your groups.

Fix generally.

============================================================
CG. FAILURE DIAGNOSIS — 14d-1
============================================================

If multi-asset result differs:
- cross-asset balance map;
- canonical final sort wrong;
- same account global classification;
- amount applied under wrong asset.

Run each asset independently and compare combined canonical output.

============================================================
CH. FAILURE DIAGNOSIS — 14d-2
============================================================

If input permutation changes output:
- insertion order leak;
- unsorted asset/account maps;
- DFS candidate order from original input;
- nondeterministic Set iteration based on insertion.

If split obligation changes output:
- original edges influence grouping/tie-breakers;
- amounts not fully aggregated before solving.

Canonicalize normalized state before algorithm decisions.

============================================================
CI. FAILURE DIAGNOSIS — 14e-1
============================================================

If scale fails:
- exponential search applied to huge component;
- global O(n²) triple search;
- repeated full sorts;
- deep clone per recursion/transfer;
- debug logging.

Read generator structure and decompose safely.

Do not weaken minimum correctness where asserted.

============================================================
CJ. FAILURE DIAGNOSIS — 14f-1
============================================================

If invalid input does not throw:
read exact invalid fixture.

Throw RangeError before output.

If empty throws:
special-case valid empty list -> [].

Do not use broad catch that converts algorithm bugs into RangeError.

============================================================
CK. RANDOMIZED / PROPERTY DISCIPLINE
============================================================

When a random/property test fails record:
- seed;
- path;
- shrunk obligations;
- normalized balances;
- expected transfer count/net;
- actual plan.

Do not:
- freeze seed;
- alter generator;
- rerun until lucky.

Fix invariant.

============================================================
CL. BRUTE-FORCE ORACLE STUDY
============================================================

For 14c, read the organizer's brute-force reference carefully.

Document:
- what it considers a "transfer";
- whether counterpart identities matter;
- how minimum count is computed;
- max test size.

Match the mathematical problem.

Do not copy test oracle into production verbatim if it would explode on 14e.

Use it to derive the correct optimized strategy.

============================================================
CM. CANONICAL OUTPUT STUDY
============================================================

Read 14d-2 exact assertion.

It may:
- call netting repeatedly on permutations and deep-equal results;
- not compare to one predetermined transfer plan.

If so, any deterministic canonical optimal plan works.

If test expects a specific plan:
derive its ordering/tie-breaker exactly.

Do not guess.

============================================================
CN. GROUP SOLUTION DETERMINISM
============================================================

For each zero-sum group:
- canonicalize participant IDs;
- settle using deterministic choices.

Two equivalent input representations must yield same group plan.

Do not use original obligation sequence.

============================================================
CO. FULL OUTPUT DETERMINISM
============================================================

After combining groups/assets:
perform one final canonical sort if compatible with test.

Ensure:
- stable across V8 runs;
- stable across input permutations;
- stable across obligation splitting.

No randomization.

============================================================
CP. COMPLEXITY REPORT
============================================================

Engineering note must distinguish:
- normalization complexity;
- cheap pair/group detection;
- exact-search complexity and maximum input size used;
- large-case scalable complexity.

Do not make false polynomial claims for exponential search.

Be explicit.

============================================================
CQ. TASK 29 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-29-netting.md

Include:

1. Starting commit.
2. Working branch task-29.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 14 test count.
6. 200-point score map.
7. Public netting API.
8. Obligation interface.
9. Transfer interface.
10. Amount type.
11. Validation rules.
12. Empty-batch behavior.
13. Net-position sign convention.
14. Per-asset normalization.
15. Zero-net removal.
16. Debtor/creditor classification.
17. Cycle cancellation.
18. Exact net-preservation proof/check.
19. Minimum-transfer theory used.
20. 14c brute-force oracle size/structure.
21. Exact small-case algorithm.
22. Memoization/pruning.
23. Canonical optimal-plan tie-break.
24. 14e large generator structure.
25. Large-case decomposition strategy.
26. Pair/triple handling if applicable.
27. Any graph/component decomposition.
28. Greedy fallback, if used, and why it is safe for tested scope.
29. Input-order invariance strategy.
30. Obligation-splitting invariance strategy.
31. Asset ordering.
32. Account ordering.
33. Transfer ordering.
34. BigInt strategy.
35. Input immutability.
36. Complexity analysis.
37. 14e measured result/time.
38. Exact changed files.
39. Typecheck.
40. 14a result.
41. 14b result.
42. 14c result.
43. 14d result.
44. 14e result.
45. 14f result.
46. Full Challenge 14 result.
47. Challenge 02/04/09 results.
48. Challenge 13/16 results.
49. Challenge 03/05/08 results.
50. Challenge 11/19/20/12 results.
51. Challenge 06/10/01 results.
52. sanity/full-suite result.
53. protected-file confirmation.
54. suggested commit.
55. master merge/push workflow.
56. next Task 30: Challenge 15 Complex Order Types.

Do not include secrets.

============================================================
CR. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat
git diff --name-only

Review actual netting source discovered from the repository:

git diff -- "<actual-netting-domain-path>"
git diff -- "<actual-netting-engine-path>"

Only use paths that exist/change.

Review:

git diff -- docs/clearhouse-task-29-netting.md

Confirm:
- organizer tests unchanged;
- no new tests;
- config unchanged;
- package unchanged;
- migrations unchanged;
- seeds unchanged;
- no Number financial conversion;
- no original-input-order dependency;
- no cross-asset netting;
- no DB/ledger side effect unless challenge14 explicitly requires it;
- no Task 30+ implementation.

============================================================
CS. TASK 29 COMPLETION CRITERIA
============================================================

Task 29 is COMPLETE only when:

DISCOVERY

[ ] challenge14 read completely.
[ ] exact test count recorded.
[ ] exact Obligation type known.
[ ] exact Transfer type known.
[ ] exact validation known.
[ ] exact 14c generator/oracle known.
[ ] exact 14e generator/threshold known.
[ ] exact 14d output comparison known.

NORMALIZATION

[ ] input validated.
[ ] input not mutated.
[ ] per-asset net positions exact.
[ ] BigInt only for financial values.
[ ] duplicate/split obligations aggregate.
[ ] zero-net accounts removed.
[ ] total net per asset remains zero.

NET PRESERVATION

[ ] every account/asset output net equals input net.
[ ] only debtors pay.
[ ] only creditors receive.
[ ] transfer amounts valid/positive.
[ ] no overpayment.
[ ] no zero transfer.

CYCLES

[ ] reciprocal obligations cancel.
[ ] cycles of any tested length cancel.
[ ] all-zero-net asset produces [].

MINIMUM COUNT

[ ] simple greedy is not treated as universally optimal.
[ ] small 14c cases solved exactly.
[ ] result count equals brute-force oracle.
[ ] memo/pruning does not lose optimum.
[ ] canonical minimum plan deterministic.

ASSETS / DETERMINISM

[ ] assets solved independently.
[ ] input permutations yield deep-identical output.
[ ] split obligation yields deep-identical output.
[ ] asset ordering deterministic.
[ ] account ordering deterministic.
[ ] transfer ordering deterministic.
[ ] no Map insertion-order leak.

SCALE

[ ] exponential search not applied to entire large batch.
[ ] large generator structure inspected.
[ ] safe decomposition implemented.
[ ] no accidental global O(n²) if threshold cannot tolerate it.
[ ] no debug logs in hot loop.
[ ] 14e passes within time.
[ ] correctness preserved at scale.

VALIDATION

[ ] invalid obligations throw RangeError.
[ ] empty batch returns [].
[ ] no malformed amount coercion.
[ ] validation has no side effects.

REGRESSION

[ ] typecheck passes.
[ ] Challenge 14 passes.
[ ] Challenge 02 passes.
[ ] Challenge 04 passes.
[ ] Challenge 09 passes.
[ ] Challenge 13 passes.
[ ] Challenge 16 passes.
[ ] Challenge 03/05/08 pass.
[ ] Challenge 11/19 pass.
[ ] Challenge 20/12 pass.
[ ] Challenge 06/10/01 pass.
[ ] sanity/full suite recorded.
[ ] protected files unchanged.
[ ] Task 29 note created.
[ ] final Git target master.

If any Challenge 14 assertion remains failing:
- Task 29 status = PARTIAL;
- report exact failing test/root cause.

============================================================
CT. FINAL CURSOR REPORT
============================================================

Return:

1. Task 29 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact changed files.
5. Exact Challenge 14 test count.
6. Public netting API.
7. Obligation model.
8. Transfer model.
9. Amount representation.
10. Validation rules.
11. Net-position sign convention.
12. Per-asset normalization.
13. Cycle cancellation.
14. Debtor/creditor transfer rule.
15. Net-preservation result.
16. Minimum-transfer mathematical strategy.
17. 14c exact-search approach.
18. Memoization/pruning.
19. Canonical optimal-plan tie-break.
20. 14e generator structure.
21. Large-scale decomposition.
22. Pair/triple optimization if used.
23. Input-order invariance.
24. Obligation-splitting invariance.
25. Asset/account/transfer canonical ordering.
26. Complexity.
27. 14e measured timing/result.
28. BigInt/input immutability.
29. Typecheck.
30. 14a result.
31. 14b result.
32. 14c result.
33. 14d result.
34. 14e result.
35. 14f result.
36. Full Challenge 14 result.
37. Challenge 02/04/09 results.
38. Challenge 13/16 results.
39. Challenge 03/05/08 results.
40. Challenge 11/19/20/12 results.
41. Challenge 06/10/01 results.
42. sanity/full-suite result.
43. remaining future failures.
44. confirmation protected files unchanged.
45. final diff summary.
46. reviewed Git commands targeting master.

Suggested commit:

feat: implement optimal deterministic netting

Do not automatically commit, merge, or push.
````

---

# Task 29 acceptance matrix

| Area | Required behavior |
|---|---|
| Net positions | Exact per account, per asset |
| Debtors | Only pay |
| Creditors | Only receive |
| Transfer amount | Exact + valid |
| Cycles | Cancel completely |
| Assets | Netted independently |
| Minimum count | Equals brute-force oracle where required |
| Greedy-only | Not sufficient for 14c |
| Input order | No effect |
| Split obligation | No effect |
| Output order | Deterministic |
| Financial arithmetic | BigInt/exact |
| Empty batch | `[]` |
| Invalid input | `RangeError` |
| Small optimal cases | Exact search |
| Large batch | Structured scalable algorithm |
| Original obligations | Not mutated |
| Database/ledger | No side effect by default |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 29

Official final branch:

**`master`**

Workflow:

**`master` → `task-29` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 29 branch

```powershell
Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"

git status -sb
git branch --show-current
git branch --list
git remote -v
git log -12 --oneline --decorate
```

Expected development branch:

```text
task-29
```

Official final branch:

```text
master
```

---

## 2. Run final Task 29 verification

```powershell
npm run typecheck

npm test challenge14.test.ts

npm test challenge02.test.ts

npm test challenge04.test.ts

npm test challenge09.test.ts

npm test challenge13.test.ts

npm test challenge16.test.ts

npm test challenge03.test.ts

npm test challenge05.test.ts

npm test challenge08.test.ts

npm test challenge11.test.ts

npm test challenge19.test.ts

npm test challenge20.test.ts

npm test challenge12.test.ts

npm test challenge06.test.ts

npm test challenge10.test.ts

npm test challenge01.test.ts

npm test _sanity.test.ts

git diff --check
```

If Challenge 14 labels exist:

```powershell
npm test challenge14.test.ts -t "Challenge 14a"

npm test challenge14.test.ts -t "Challenge 14b"

npm test challenge14.test.ts -t "Challenge 14c"

npm test challenge14.test.ts -t "Challenge 14d"

npm test challenge14.test.ts -t "Challenge 14e"

npm test challenge14.test.ts -t "Challenge 14f"
```

Use actual current labels if different.

Then:

```powershell
npm test
```

---

## 3. Review Task 29 changes

```powershell
git status --short
git diff --stat
git diff --name-only
```

Review actual netting source paths:

```powershell
git diff -- "<actual-netting-domain-path>"
git diff -- "<actual-netting-engine-path>"
```

Do not paste placeholders literally.

Review:

```powershell
git diff -- docs/clearhouse-task-29-netting.md
```

If only one source file contains the complete netting implementation, review/stage only that actual file.

---

## 4. Stage only Task 29 files

Always stage:

```powershell
git add -- docs/clearhouse-task-29-netting.md
```

Stage actual Challenge 14 production files:

```powershell
git add -- "<actual-netting-domain-path>"
git add -- "<actual-netting-engine-path>"
```

Do not paste placeholders literally.

If another legitimate Task 29 helper changed:

```powershell
git add -- "<actual-task29-helper-path>"
```

If a file contains unrelated work:

```powershell
git add -p -- "<file-path>"
```

Avoid:

```text
git add .
```

---

## 5. Review staged content

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached
```

STOP if staged content unexpectedly contains:

- tests/
- config/
- package files
- migrations
- seeds
- `.env`
- `.gitignore`
- Task 30+ work
- unrelated ledger/matching/client/API code.

---

## 6. Commit Task 29

```powershell
git commit -m "feat: implement optimal deterministic netting"
```

Verify:

```powershell
git show --stat --oneline HEAD
git status -sb
```

---

## 7. Switch to official master

```powershell
git switch master
git fetch origin
```

Inspect divergence:

```powershell
git log --oneline --left-right master...origin/master
```

If local master is simply behind:

```powershell
git pull --ff-only origin master
```

Do not reset valid history.

---

## 8. Merge Task 29

Prefer:

```powershell
git merge --ff-only task-29
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-29
```

Resolve conflicts deliberately.

Never force/reset.

---

## 9. Re-test merged master

```powershell
git branch --show-current
```

Expected:

```text
master
```

Then:

```powershell
npm run typecheck

npm test challenge14.test.ts

npm test challenge02.test.ts

npm test challenge16.test.ts

git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge04.test.ts
npm test challenge09.test.ts
npm test _sanity.test.ts
```

---

## 10. Push official master

```powershell
git push origin master
```

Do not push the final competition submission to `main`.

Do not force-push.

---

## 11. Verify remote master

```powershell
git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

Local HEAD and remote `refs/heads/master` must match.

---

# If push is rejected

Do not force.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If safe for the local-only Task 29 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge14.test.ts
npm test challenge02.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts carefully.

---

# Fast Task 29 checklist

- [ ] branch = task-29
- [ ] final branch = master
- [ ] challenge14 fully read
- [ ] config/scores read-only
- [ ] exact test count recorded
- [ ] exact Obligation type known
- [ ] exact Transfer type known
- [ ] invalid cases known
- [ ] 14c brute-force oracle understood
- [ ] 14e generator/threshold understood
- [ ] input validated before solving
- [ ] empty batch -> []
- [ ] input obligations not mutated
- [ ] amounts exact BigInt/current exact type
- [ ] per-asset net positions
- [ ] no cross-asset netting
- [ ] zero-net accounts removed
- [ ] cycles cancel
- [ ] reciprocal obligations cancel
- [ ] only debtors pay
- [ ] only creditors receive
- [ ] every transfer positive/valid
- [ ] output net equals input net per account/asset
- [ ] greedy-only not used for 14c optimum
- [ ] small cases exact minimum
- [ ] memo/pruning mathematically safe
- [ ] optimal plan deterministic
- [ ] input permutations deep-identical
- [ ] split obligations deep-identical
- [ ] asset/account/transfer ordering canonical
- [ ] no Map insertion-order leak
- [ ] large test does not run global exponential search
- [ ] large generator structure exploited generally
- [ ] no unsafe global O(n²) if too large
- [ ] 14e within time
- [ ] invalid obligations -> RangeError
- [ ] Challenge14 passes
- [ ] Challenge02/04/09 pass
- [ ] Challenge13/16 pass
- [ ] Challenge03/05/08 pass
- [ ] Challenge11/19/20/12 pass
- [ ] Challenge06/10/01 pass
- [ ] sanity/full suite recorded
- [ ] protected files unchanged
- [ ] Task29 note created
- [ ] committed on task-29
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 30 — Challenge 15: Complex Order Types.
