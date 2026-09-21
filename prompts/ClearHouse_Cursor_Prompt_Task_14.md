# ClearHouse — Complete Enhanced Cursor Prompt for Task 14

**Task:** Challenge 03 — Basic Order Book and Core Matching  
**Primary scope:** Challenge 3a + Challenge 3c + Challenge 3d  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-14`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 14 purpose

Task 14 implements the **foundational limit order book and GTC matching engine**.

The Challenge 03 work is intentionally split:

- **Task 14:** core order book / price-time matching / basic invariants / cancellation
- **Task 15:** IOC, FOK, POST_ONLY, self-trade prevention
- **Task 16:** stops, stop-limit, amendment, concurrency races, determinism, performance, stateful model

Task 14 should establish a correct core that Tasks 15–16 can extend without rewriting the public API.

---

# Confirmed Task 14 organizer scope

## Challenge 3a — Price-time priority

### 3a-1 — Resting price

A crossing incoming order trades at the **resting maker's price**, not the incoming aggressor's price.

Example:

```text
resting sell: 10 @ 100
incoming buy: 10 @ 105
```

Trade:

```text
price = 100
quantity = 10
```

### 3a-2 — FIFO at one price level

At one price level, the earlier resting order fills before later orders.

Example:

```text
sell A: 5 @ 100
sell B: 5 @ 100
buy:    5 @ 100
```

A must fill first; B remains.

### 3a-3 — Sweep prices best-to-worst

A large buy aggressor must consume asks from lowest price upward.

Example:

```text
asks:
5 @ 101
5 @ 100
5 @ 102

buy 15 @ 102
```

Trade prices must be:

```text
100, 101, 102
```

For a sell aggressor, bids must analogously be consumed highest price first.

---

# Challenge 3c — Core invariants

## 3c-1 — Book is never crossed

After processing orders:

```text
bestBid < bestAsk
```

whenever both sides are non-empty.

A crossing GTC order must match until:
- it is fully filled; or
- no opposite resting order remains at a crossing price.

Any remaining limit quantity may then rest.

## 3c-2 — No overfill

The sum of all executions against any order may never exceed its order quantity.

Remaining quantity is:

```text
quantity - filled
```

and must never become negative.

---

# Challenge 3d — Cancellation

A live resting order can be cancelled exactly once.

First cancel:

```text
200
cancelled = true
```

Second cancel of the same order:

```text
404 ORDER_NOT_FOUND
```

Cancellation must remove only the target order and preserve all other resting orders.

---

# Visible Task 14 challenge points

From the supplied challenge description:

- 3a-1 = 15
- 3a-2 = 15
- 3a-3 = 18
- 3c-1 = 20
- 3c-2 = 12
- 3d-1 = 9

Visible Task 14 scope = **89 available Challenge 03 points**.

This is not an earned-score claim.

---

# Important existing domain model

Historical reference interfaces:

```ts
export type Side = "buy" | "sell";
export type TimeInForce = "GTC" | "IOC" | "FOK" | "POST_ONLY";

export interface RestingOrder {
  id: string;
  accountId: string;
  side: Side;
  price: bigint;
  quantity: bigint;
  filled: bigint;
  sequence: number;
  timeInForce: TimeInForce;
}
```

Incoming order:

```ts
export interface IncomingOrder {
  id: string;
  accountId: string;
  side: Side;
  price?: bigint;
  quantity: bigint;
  timeInForce: TimeInForce;
  sequence: number;
  orderType?: "limit" | "market" | "stop" | "stop_limit";
  stopPrice?: bigint;
}
```

Trade:

```ts
export interface Trade {
  buyOrderId: string;
  sellOrderId: string;
  price: bigint;
  quantity: bigint;
}
```

Task 14 must preserve these public structures unless the current checkout differs.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 14

Copy the full block below into Cursor Agent mode.

````text
Act as my senior TypeScript exchange/matching-engine engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 14 ONLY: implement the foundational GTC limit order book and basic matching engine for Challenge 03. The required Task 14 scope is Challenge 3a price-time priority, Challenge 3c core matching invariants, and Challenge 3d basic cancellation.

Preserve all completed Tasks 1–13. Do not implement Task 15 execution policies or Task 16 advanced order behavior. Perform the implementation, run focused organizer tests and regressions, create the Task 14 engineering note, and show reviewed Git commands.

Do not automatically commit, merge, or push.

============================================================
A. REPOSITORY / SUBMISSION CONTEXT
============================================================

Existing checkout:

C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b

Official remote:

origin

Official repository:

https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b

OFFICIAL FINAL SUBMISSION BRANCH:

master

Task branch:

task-14

Historical GitHub reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:
- current CodeCommit checkout is authoritative;
- do not reset to historical GitHub;
- do not replace origin;
- do not clone over the checkout;
- preserve Tasks 1–13;
- develop on task-14;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit/merge/push automatically.

============================================================
B. STRICT TASK 14 SCOPE
============================================================

TASK 14 IMPLEMENTS:

Challenge 3a:
- 3a-1 resting-maker price
- 3a-2 FIFO at same price
- 3a-3 multi-price sweeping

Challenge 3c:
- 3c-1 uncrossed book invariant
- 3c-2 no order overfill

Challenge 3d:
- 3d-1 cancellation removes exactly one live resting order and second cancel is not found

Core infrastructure required for those:
- BookSide ordered insertion
- best()
- removeById()
- removeFront()
- snapshot() correctness
- remainingQuantity()
- base GTC `submitOrder()`
- matchingEngine registry maintenance
- best-price output consistency
- depth ordering if Task 14 changes expose it

TASK 14 DOES NOT IMPLEMENT:

Challenge 3b:
- IOC
- FOK
- POST_ONLY
- self-trade prevention

Challenge 3e:
- stop
- stop_limit

Challenge 3f:
- amendment

Challenge 3g:
- cancel/fill race
- amend/fill race

Challenge 3h:
- 10,000-operation determinism requirement as a dedicated optimization target

Challenge 3i:
- 100,000-order performance requirement

Challenge 3j:
- stateful randomized model agreement, because its reference model includes self-trade prevention from Task 15

Do not broaden Task 14 just to make all challenge03 tests green.

============================================================
C. STRICT ORGANIZER / FILE RULES
============================================================

Do NOT modify any existing test file.

Do NOT add new test files.

Do NOT modify:
- config/
- package.json
- package-lock.json
- .env
- .gitignore
- tsconfig files
- vitest.config.ts
- knexfile.js
- migrations
- seeds
- scoring files
- grading scripts

Do NOT:
- skip tests;
- weaken assertions;
- increase organizer timeouts;
- reduce test discovery;
- change property generators/seeds;
- relax TypeScript.

Do NOT add production code checking:
- NODE_ENV === "test";
- VITEST;
- Challenge 3a/3c/3d;
- test filenames;
- TEST-* market names;
- known maker/taker account names;
- fixture prices/quantities.

Do NOT use floating-point arithmetic for:
- prices;
- quantities;
- fills.

Use bigint.

Do NOT use destructive Git:
- git reset --hard
- git clean -fd
- force-push
- history rewriting
- blind branch deletion

============================================================
D. GIT PRE-FLIGHT — BASE TASK 14 ON MASTER
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
- origin is official remote;
- master is official final branch.

Verify Task 13 reached master:

git log --oneline --decorate --max-count=20 master

If task-13 exists:

git log --oneline --decorate --max-count=10 task-13

If valid prior work is not yet on master:
- preserve it;
- report it;
- do not start Task 14 from stale history.

If master is correct:

git switch master
git pull --ff-only origin master
git switch -c task-14

If task-14 already exists:

git branch --list task-14
git log --oneline --decorate --max-count=10 task-14

Do not delete/recreate blindly.

Record:
- starting commit;
- current branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
E. VERIFY TASK 7 / TASK 9 MATCHING PREREQUISITES
============================================================

Task 7 previously covered shared-state/empty-state matching bugs.

Verify current source still has:

- resetAllBooks() clears:
  - books
  - order registry
  - trade log
  - order-account lookup
  - sequence counter

- empty book best prices return null, not misleading "0", according to current completed Task 7 contract.

Task 9 validated:
- quantity > 0
- supplied price > 0
before matching.

Do not undo those fixes.

Do not assume historical GitHub defects still exist in the current CodeCommit checkout.

============================================================
F. READ THE EXACT CHALLENGE 03 CONTRACT
============================================================

Read COMPLETELY:

- tests/challenge03.test.ts
- src/domain/orderBook.ts
- src/domain/matching.ts
- src/services/matchingEngine.ts
- src/controller/orderController.ts
- src/routes/orderRoutes.ts

Also inspect:
- src/services/riskRegistry.ts
- src/domain/risk.ts
- src/services/marketFeed.ts
- current Task 7 docs
- current Task 9 docs

Search:

rg -n "BookSide|OrderBook|RestingOrder|remainingQuantity|submitOrder|cancelOrder|placeOrder|cancel\(|bestPrices|depth|registry|sequenceCounter|restingOrder|trades|filled" src tests

PowerShell fallback:

Get-ChildItem -Recurse src,tests -File |
  Select-String -Pattern "BookSide|OrderBook|RestingOrder|remainingQuantity|submitOrder|cancelOrder|placeOrder|cancel\(|bestPrices|depth|registry|sequenceCounter|restingOrder|trades|filled"

Read all Challenge 3 groups even though Task 14 implements only 3a, 3c, and 3d.

Reason:
the Task 14 core must leave extension points compatible with Tasks 15–16.

Do not implement those later groups now.

============================================================
G. BEFORE BASELINE
============================================================

Run:

npm run typecheck

Run Task 14 focused groups:

npm test challenge03.test.ts -t "Challenge 3a|Challenge 3c|Challenge 3d"

Record:
- executed count;
- pass count;
- fail count;
- first meaningful failure per group;
- NotImplementedError sites.

Historical reference Task 14 count:

Challenge 3a = 3 tests
Challenge 3c = 2 tests
Challenge 3d = 1 test

Total = 6 focused tests.

Use current checkout output if it differs.

============================================================
H. BOOK SIDE ORDERING — CORE PRICE-TIME RULE
============================================================

File:

src/domain/orderBook.ts

A BookSide must be ordered:

1. better price first;
2. for equal price, smaller/earlier sequence first.

Bids:
- higher price first.

Asks:
- lower price first.

At equal price:
- FIFO by sequence.

The best order must always be available from:

orders[0]

or the current equivalent data structure.

Never sort by:
- order id;
- account id;
- quantity;
- lexical price string.

Use bigint comparisons for price.

============================================================
I. BookSide.insert()
============================================================

Implement ordered insertion generically.

Required invariant after every insert:

For adjacent orders A then B:

Either:
- A has strictly better price than B;
OR:
- A.price === B.price and A.sequence <= B.sequence.

Newer same-price order must go AFTER every older same-price order.

Do not accidentally use `>=` / `<=` logic that reverses FIFO.

Do not mutate the incoming order after insertion except where matching later updates its `filled` field as intended.

============================================================
J. DATA STRUCTURE CHOICE
============================================================

Task 14 must pass correctness first and remain extendable.

The historical starter uses:

private readonly orders: RestingOrder[] = [];

You may retain an ordered array for Task 14 if that is the smallest current-contract implementation.

However:
- do not add unnecessary full-array sorts after every match iteration;
- do not write obviously quadratic matching logic when the best order is already at index 0;
- keep the implementation organized enough that Task 16 can optimize Challenge 3i later without changing public interfaces.

Do NOT prematurely build a large third-party tree/heap dependency.

Do not modify package.json.

============================================================
K. BookSide.best()
============================================================

best():

- returns current best resting order;
- returns undefined when empty.

Do not return a stale removed/filled order.

Fully filled front orders must be removed promptly during matching.

============================================================
L. removeFront()
============================================================

When the current maker becomes fully filled:

remove it from the opposite side.

Do not leave a zero-remaining order at the front.

A zero-remaining order left in the book can:
- cause infinite loops;
- create zero-quantity trades;
- break best-price reporting;
- break no-overfill invariant.

============================================================
M. removeById()
============================================================

Cancellation requires removing only the exact target.

Preserve order of all other resting orders.

Do not rebuild/re-sort unrelated orders unnecessarily.

Return:
- removed order when found;
- undefined when absent.

============================================================
N. snapshot()
============================================================

Return defensive copies.

Do not expose internal RestingOrder object references if callers could mutate them.

Preserve current ordering:
- bids best first;
- asks best first;
- FIFO within levels.

This matters for:
- depth;
- dashboard later;
- debugging;
- future state model.

============================================================
O. remainingQuantity()
============================================================

Remaining quantity is exactly:

order.quantity - order.filled

Use bigint.

Invariant:

0n <= filled <= quantity

Task 14 must never let remaining become negative.

============================================================
P. BASE GTC submitOrder()
============================================================

File:

src/domain/matching.ts

Implement the basic GTC limit-order path.

Task 14 required assumptions:
- incoming is a normal limit/GTC order for focused tests;
- price exists;
- quantity > 0 from Task 9 validation.

Do not implement IOC/FOK/POST_ONLY/STP behavior here beyond preserving clean extension points.

Return shape:

{
  trades: Trade[],
  cancellations: Cancellation[],
  restingOrder: RestingOrder | null,
  rejected: boolean,
  rejectionReason?: ...
}

For Task 14 normal GTC:
- rejected should be false;
- cancellations should remain [] because STP belongs to Task 15.

============================================================
Q. CROSSING RULE
============================================================

For incoming BUY with limit price P:

it crosses the best ask when:

P >= bestAsk.price

For incoming SELL with limit price P:

it crosses the best bid when:

P <= bestBid.price

If no opposite order:
- stop matching.

If opposite best no longer crosses:
- stop matching.

Do not compare prices as strings.

============================================================
R. MATCH LOOP
============================================================

Conceptually:

remainingIncoming = incoming.quantity
trades = []

while remainingIncoming > 0:
    maker = opposite.best()
    if no maker:
        break
    if maker price does not cross incoming limit:
        break

    makerRemaining = maker.quantity - maker.filled
    tradeQty = min(remainingIncoming, makerRemaining)

    create trade at maker.price

    maker.filled += tradeQty
    remainingIncoming -= tradeQty

    if maker.filled === maker.quantity:
        opposite.removeFront()

After loop:

if remainingIncoming > 0:
    create a resting order for the incoming remainder

Do not create zero-quantity trade records.

============================================================
S. RESTING PRICE — CHALLENGE 3a-1
============================================================

Every execution price is:

maker.price

Never incoming.price.

For:
resting ask = 100
incoming buy limit = 105

trade.price = 100.

For:
resting bid = 105
incoming sell limit = 100

trade.price = 105.

This rule applies across all sweep fills.

============================================================
T. TRADE IDS
============================================================

Trade fields:

buyOrderId
sellOrderId

must reflect sides, not maker/taker role.

If incoming is buy:
- buyOrderId = incoming.id
- sellOrderId = maker.id

If incoming is sell:
- buyOrderId = maker.id
- sellOrderId = incoming.id

Do not swap simply because incoming is always treated as "taker".

============================================================
U. TRADE QUANTITY
============================================================

Execution quantity is:

min(incomingRemaining, makerRemaining)

Use bigint.

After each trade:

incomingRemaining >= 0

maker.filled <= maker.quantity

No order can be overfilled.

============================================================
V. PARTIAL MAKER FILL
============================================================

If incoming quantity is smaller than maker remaining:

- increment maker.filled;
- keep maker resting at same price and same queue position;
- stop if incoming fully filled.

Do NOT remove/reinsert a partially filled maker.

Reinsertion would incorrectly lose FIFO priority.

============================================================
W. FULL MAKER FILL
============================================================

When maker remaining becomes zero:

- remove it from book immediately;
- continue matching against the next best maker if incoming remains.

This is required for multi-level sweep.

============================================================
X. MULTI-LEVEL SWEEP — CHALLENGE 3a-3
============================================================

For buy aggressor:
- consume asks lowest price first.

For sell aggressor:
- consume bids highest price first.

Within each price:
- FIFO.

Never match a worse price before a better price.

Do not repeatedly scan unsorted orders to guess best if BookSide already maintains best-first ordering.

============================================================
Y. REST INCOMING REMAINDER
============================================================

For Task 14 GTC limit orders:

If incoming has remaining quantity after all crossing liquidity is exhausted:

create one RestingOrder:

{
  id: incoming.id,
  accountId: incoming.accountId,
  side: incoming.side,
  price: incoming.price,
  quantity: incoming.quantity,
  filled: incoming.quantity - remainingIncoming,
  sequence: incoming.sequence,
  timeInForce: incoming.timeInForce
}

IMPORTANT:
The historical RestingOrder model stores:
- original quantity;
- cumulative filled.

Therefore remainingQuantity(restingOrder) must equal remainingIncoming.

Do not set:
quantity = remainingIncoming
AND also filled = prior fills
because that double-subtracts.

Use the current domain model exactly.

============================================================
Z. FULLY FILLED INCOMING ORDER
============================================================

If incoming is fully filled:

restingOrder = null

Do not insert it in the book.

Do not register it as resting.

Controller response:

resting = false
orderId = null

according to current public contract.

Preserve current behavior.

============================================================
AA. UNCROSSED BOOK INVARIANT — CHALLENGE 3c-1
============================================================

After each normal GTC submission:

if bestBid and bestAsk both exist:

bestBid < bestAsk

A residual incoming limit order may rest only when it does NOT cross the current best opposite price.

Do not:
- stop matching after only one fill if more crossing liquidity exists;
- rest an order while it still crosses.

============================================================
AB. NO OVERFILL — CHALLENGE 3c-2
============================================================

For every order:

filled <= quantity

For each submit result:

sum(trade.quantity for trades generated by incoming)
<= incoming.quantity

Maker cumulative fills also must not exceed quantity.

Use exact min logic.

Never use:
- absolute differences;
- subtraction without prior min;
- Number conversion.

============================================================
AC. BASIC CANCELLATION — CHALLENGE 3d
============================================================

A live resting order:
- can be found via registry;
- is removed from exactly its stored side/market;
- registry entry is removed;
- first cancellation returns cancelled=true.

After successful cancellation:
- second cancel must be NOT FOUND.

The historical matchingEngine cancel implementation may distinguish:
- registry missing;
- registry exists but book row missing.

Follow current controller contract.

For a missing order ID, the service outcome must cause controller to return:

404
ORDER_NOT_FOUND

not:
200 cancelled=false.

============================================================
AD. REGISTRY CONSISTENCY FOR CANCELLED/FILLED ORDERS
============================================================

The matching registry maps:

orderId -> market + side

It must represent LIVE RESTING orders.

Therefore remove registry entries when:
- explicitly cancelled;
- fully consumed by a trade;
- later STP removes them (Task 15).

Task 14 must at least ensure:
- explicit cancellation cleanup;
- fully filled maker cleanup if current architecture exposes maker IDs from matching result.

Do not leave stale registry entries for fully filled makers if doing so causes later cancellation/amendment to treat dead orders as live.

Possible approaches:
- have submitOrder return/communicate filled maker removals internally;
- after trades, verify whether fully filled maker remains;
- introduce a minimal internal removal list separate from public cancellations if needed.

Do NOT overload public `cancellations` with normal fills; that array semantically belongs to explicit cancellation reasons such as STP.

Preserve public result contract.

============================================================
AE. CAUTION: ORDER RISK RESERVATIONS
============================================================

orderController currently integrates risk reservations.

Task 17 handles full risk rules.

Task 14 must not redesign risk.

However fully filled resting orders may have existing risk reservations from earlier controller logic.

Inspect current code carefully.

Do not add broad Task 17 behavior now.

If current organizer Task 14 tests do not exercise risk release on maker fill, keep scope narrow and document any later integration requirement.

Do not break existing reservation logic for incoming rejection/cancel.

============================================================
AF. bestPrices()
============================================================

Preserve Task 7's empty-state behavior.

Expected conceptually:

empty market:

{
  bestBid: null,
  bestAsk: null
}

Non-empty:

stringified bigint prices.

Do not return "0" for an empty side if Task 7 already corrected that.

Task 14 matching must update best prices immediately after:
- full fill;
- new resting order;
- cancellation.

============================================================
AG. depth()
============================================================

Depth aggregation should continue to use:

remaining = quantity - filled

When Task 14 changes order ordering, ensure depth remains best-price-first.

If existing depth() creates levels in snapshot insertion order and snapshot is ordered correctly, preserve that.

Do not implement dashboard formatting.

============================================================
AH. sequenceCounter / FIFO
============================================================

matchingEngine assigns a monotonically increasing sequence.

Task 7 reset must reset it.

Task 14 must use the incoming sequence to establish FIFO.

Do not use:
- Date.now();
- UUID lexical order;
- array creation time;
- account name

as FIFO priority.

Sequence is deterministic.

============================================================
AI. MARKET ISOLATION
============================================================

Every market has an independent OrderBook.

Orders in market A must never match orders in market B.

bookFor(market) must preserve per-market state.

Do not introduce a global shared bid/ask side.

============================================================
AJ. SIDE ISOLATION
============================================================

Buy orders rest on bids.

Sell orders rest on asks.

Incoming buy matches asks.

Incoming sell matches bids.

Never match same-side orders.

============================================================
AK. EXACT PRICE / QUANTITY
============================================================

Prices and quantities are bigint.

Do not use Number for:
- sorting price;
- comparing limit price;
- fill quantity;
- remaining quantity.

This protects exactness for large integer prices/quantities.

============================================================
AL. DO NOT IMPLEMENT MARKET-ORDER SEMANTICS IN TASK 14
============================================================

IncomingOrder price is optional because market orders exist later.

Task 14 focused scope is GTC LIMIT matching.

Do not invent incomplete market-order behavior now unless current Challenge 3a/3c/3d test explicitly requires it.

Task 15 handles execution-policy semantics.

If current `submitOrder()` must accept an undefined price for compilation/public API:
- structure the crossing helper so market behavior can be added cleanly;
- do not silently rest a no-price order.

============================================================
AM. DO NOT IMPLEMENT TASK 15 FEATURES
============================================================

Do not implement:
- IOC remainder discard;
- FOK preflight;
- POST_ONLY crossing rejection;
- self-trade prevention.

If current result fields exist:
- preserve them;
- normal Task 14 GTC path should have cancellations=[];
- rejected=false.

Task 15 will add those branches.

============================================================
AN. DO NOT IMPLEMENT TASK 16 FEATURES
============================================================

Do not implement:
- stop orders;
- stop-limit orders;
- amendOrder();
- cancel/fill locks;
- amend/fill locks;
- deterministic replay optimization;
- 100k-order performance optimization;
- stateful-model-specific special cases.

Keep interfaces compatible.

============================================================
AO. PERFORMANCE AWARENESS WITHOUT SCOPE CREEP
============================================================

Task 16 later contains a 100,000-order performance test.

For Task 14:
- correctness is the gate;
- avoid gratuitous O(n) scans inside the INNER matching loop when best is already at front;
- avoid full sort after every individual trade;
- keep data structure internals encapsulated behind BookSide.

Do not add dependencies or implement a complex balanced tree solely for Task 16 now.

============================================================
AP. CONTROLLER INTEGRATION
============================================================

The order controller already:
- validates input;
- creates order ID;
- assigns account;
- calls matchingEngine.placeOrder();
- serializes trade bigint price/quantity to strings;
- publishes book changes;
- returns CREATED.

Prefer not to edit orderController in Task 14.

Only edit if current focused tests expose a direct Task 14 integration defect.

Do not undo Task 9 positive quantity/price validation.

============================================================
AQ. CANCELLATION CONTROLLER CONTRACT
============================================================

First cancel live order:

HTTP 200

{
  data: {
    orderId,
    cancelled: true
  },
  meta: {}
}

Second cancel:

HTTP 404

{
  error: {
    code: "ORDER_NOT_FOUND",
    details: []
  }
}

Ensure matchingEngine.cancel() exposes sufficient found/cancelled semantics.

Do not change controller envelope.

============================================================
AR. EXPECTED TASK 14 FILE SCOPE
============================================================

Primary:

- src/domain/orderBook.ts
- src/domain/matching.ts
- src/services/matchingEngine.ts

Only if focused Task 14 integration proves necessary:

- src/controller/orderController.ts

Create/update:

- docs/clearhouse-task-14-basic-matching.md

Do NOT add tests.

Do NOT modify routes unless an actual route defect prevents 3a/3c/3d.

Do NOT modify risk internals.

Do NOT modify package/config/migrations.

============================================================
AS. TYPE SAFETY
============================================================

Maintain strict TypeScript.

Avoid:
- any;
- @ts-ignore;
- unsafe casts;
- Number price/quantity conversion;
- mutable global shortcuts outside existing matching state;
- swallowed errors;
- zero-quantity trades;
- stale registry state.

Prefer:
- bigint;
- explicit side helpers;
- small crossing helper;
- deterministic sequence;
- defensive snapshots.

============================================================
AT. REQUIRED POST-IMPLEMENTATION VERIFICATION
============================================================

Run:

npm run typecheck

Task 14 focused organizer tests:

npm test challenge03.test.ts -t "Challenge 3a|Challenge 3c|Challenge 3d"

Reference expected:
- 6 focused tests.

Then individual groups for diagnosis/record:

npm test challenge03.test.ts -t "Challenge 3a"

npm test challenge03.test.ts -t "Challenge 3c"

npm test challenge03.test.ts -t "Challenge 3d"

Do NOT require Challenge 3b/3e/3f/3g/3h/3i/3j to pass yet.

Run previous completed feature regressions:

npm test challenge04.test.ts

npm test challenge02.test.ts

npm test challenge01.test.ts

npm test challenge00.test.ts

npm test _sanity.test.ts

Run:

git diff --check

Then milestone full suite:

npm test

Record all remaining Task 15+ matching failures honestly.

============================================================
AU. OPTIONAL NON-SCORING STATIC CHECKS
============================================================

Without adding tests, inspect manually or reason through:

CASE 1:
resting sell 100x10
incoming buy 105x4

Expected:
trade 4 @100
maker remains 6 @100

CASE 2:
asks:
100x5 first
100x5 second
buy 100x7

Expected:
trade first 5
trade second 2
second remains 3

CASE 3:
asks:
101x5
100x5
102x5
buy 102x12

Expected prices:
100,101,102
last fill 2

CASE 4:
bid 100x5
sell 99x2

Expected:
trade 2 @100
bid remains 3

CASE 5:
cancel one of several same-price orders:
only target disappears;
relative order of others unchanged.

Do not add debug code or hardcoded branches.

============================================================
AV. TEST REPORTING RULES
============================================================

For every command report:

- exact command;
- exit code;
- executed;
- passed;
- failed;
- not exercised;
- real cause.

Filtered-out Task 15/16 tests are NOT passed.

For fast-check Challenge 3c failure:
- record seed;
- path;
- minimal counterexample;
- fix general matching invariant.

Do not edit test-results.xml.

If a test hangs:
- inspect zero-quantity loop;
- fully filled maker not removed;
- remaining not reduced;
- stale best order;
- recursive retry.

Do not increase timeout or add sleep.

============================================================
AW. TASK 14 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-14-basic-matching.md

Include:

1. Starting commit.
2. Working branch task-14.
3. Official final branch master.
4. Pre-existing dirty/staged state preserved.
5. Exact Task 14 Challenge 3 groups/count.
6. BookSide data structure used.
7. Bid ordering.
8. Ask ordering.
9. FIFO rule.
10. crossing conditions.
11. maker-price execution.
12. partial-fill logic.
13. full-fill removal logic.
14. incoming remainder/resting representation.
15. trade ID side mapping.
16. no-overfill invariant.
17. uncrossed-book invariant.
18. cancellation semantics.
19. registry cleanup strategy.
20. bestPrices/depth compatibility.
21. Task 15 features deliberately left out.
22. Task 16 features deliberately left out.
23. Exact files changed.
24. Typecheck result.
25. Challenge 3a result.
26. Challenge 3c result.
27. Challenge 3d result.
28. combined Task 14 result.
29. Challenge 04 regression.
30. Challenge 02 regression.
31. foundation/sanity result.
32. full-suite status.
33. remaining matching groups.
34. protected-file confirmation.
35. suggested commit message.
36. master merge/push commands.
37. next Task 15: execution policies.

Do not include secrets/credentials.

============================================================
AX. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat

Review:

git diff -- src/domain/orderBook.ts
git diff -- src/domain/matching.ts
git diff -- src/services/matchingEngine.ts
git diff -- src/controller/orderController.ts
git diff -- docs/clearhouse-task-14-basic-matching.md

Confirm:
- no existing test changed;
- no new test added;
- config unchanged;
- package files unchanged;
- .env/.gitignore unchanged;
- tsconfig/vitest unchanged;
- knexfile/migrations/seeds unchanged;
- no test detection;
- no floating-point price/quantity arithmetic;
- no IOC/FOK/post-only/STP implementation;
- no stops/amendments/concurrency/performance special casing;
- Tasks 1–13 remain intact.

============================================================
AY. TASK 14 COMPLETION CRITERIA
============================================================

Task 14 is COMPLETE only when:

[ ] challenge03 read completely.
[ ] BookSide insertion orders bids best-first.
[ ] BookSide insertion orders asks best-first.
[ ] same-price orders are FIFO.
[ ] `best()` always returns live best maker.
[ ] partial maker remains in queue.
[ ] fully filled maker is removed.
[ ] incoming GTC crossing loop implemented.
[ ] crossing buy uses P >= ask.
[ ] crossing sell uses P <= bid.
[ ] trade executes at resting-maker price.
[ ] buyOrderId/sellOrderId map by side correctly.
[ ] trade quantity uses exact min remaining.
[ ] no zero-quantity trades.
[ ] no order overfills.
[ ] multi-level buy sweep is low-ask to high-ask.
[ ] multi-level sell sweep is high-bid to low-bid.
[ ] unfilled GTC limit remainder rests.
[ ] resting order preserves original quantity + cumulative filled model correctly.
[ ] fully filled incoming does not rest.
[ ] book remains uncrossed.
[ ] cancellation removes exact live order.
[ ] second cancellation returns not found.
[ ] registry does not intentionally retain cancelled orders.
[ ] stale fully-filled registry handling reviewed/fixed as required.
[ ] Task 7 null empty-book behavior preserved.
[ ] bigint used for price/quantity.
[ ] typecheck passes.
[ ] Challenge 3a passes.
[ ] Challenge 3c passes.
[ ] Challenge 3d passes.
[ ] combined Task 14 focused run passes.
[ ] Challenge 04 regression recorded.
[ ] Challenge 02 regression recorded.
[ ] foundation/sanity recorded.
[ ] full suite recorded honestly.
[ ] Task 15/16 failures remain correctly separated.
[ ] no existing tests modified.
[ ] no new tests added.
[ ] no package/config/migration changes.
[ ] Task 14 note created.
[ ] final Git target is master.

If any 3a/3c/3d requirement fails:
- status = PARTIAL;
- report exact blocker.

Never claim future matching groups passed if they were not run/passing.

============================================================
AZ. FINAL CURSOR REPORT
============================================================

Return:

1. Task 14 status: COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. BookSide ordering strategy.
6. Matching-loop strategy.
7. Resting-price rule.
8. FIFO implementation.
9. Sweep implementation.
10. partial/full-fill handling.
11. incoming remainder behavior.
12. no-overfill protection.
13. cancellation/registry behavior.
14. typecheck result.
15. Challenge 3a result.
16. Challenge 3c result.
17. Challenge 3d result.
18. combined Task 14 result.
19. Challenge 04 result.
20. Challenge 02 result.
21. foundation/sanity result.
22. full-suite result.
23. remaining Task 15/16 matching failures.
24. confirmation tests/config/package/migrations unchanged.
25. final diff summary.
26. reviewed Git commands targeting master.

Suggested commit:

feat: implement core price-time matching engine

Do not commit, merge, or push automatically.
````

---

# Task 14 reference acceptance matrix

| Area | Required behavior |
|---|---|
| Best ask | Lowest ask price |
| Best bid | Highest bid price |
| Equal-price priority | Earlier sequence first |
| Crossing buy | incoming price >= best ask |
| Crossing sell | incoming price <= best bid |
| Trade price | Resting maker price |
| Fill quantity | min(incoming remaining, maker remaining) |
| Partial maker | Stays at same queue position |
| Full maker | Removed immediately |
| Sweep buy | Lowest asks first |
| Sweep sell | Highest bids first |
| Incoming GTC remainder | Rests if no longer crossing |
| Fully filled incoming | Does not rest |
| Overfill | Never |
| Crossed final book | Never |
| Cancel | Removes exact live order |
| Second cancel | 404 not found |
| Empty best price | null |
| Arithmetic | BigInt |
| Task 15 semantics | Outside Task 14 |
| Task 16 advanced behavior | Outside Task 14 |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 14

The organisers require final changes on **`master`**.

Workflow:

**`master` → `task-14` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 14 branch

```powershell
Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"

git status -sb
git branch --show-current
git branch --list
git remote -v
git log -12 --oneline --decorate
```

Expected:

```text
task-14
```

Final:

```text
master
```

---

## 2. Final Task 14 verification

```powershell
npm run typecheck

npm test challenge03.test.ts -t "Challenge 3a|Challenge 3c|Challenge 3d"

npm test challenge03.test.ts -t "Challenge 3a"

npm test challenge03.test.ts -t "Challenge 3c"

npm test challenge03.test.ts -t "Challenge 3d"

npm test challenge04.test.ts
npm test challenge02.test.ts
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

git diff --check
```

Milestone:

```powershell
npm test
```

Task 15/16 Challenge 03 groups may still fail.

---

## 3. Review Task 14 changes

```powershell
git status --short
git diff --stat

git diff -- src/domain/orderBook.ts
git diff -- src/domain/matching.ts
git diff -- src/services/matchingEngine.ts
git diff -- src/controller/orderController.ts
git diff -- docs/clearhouse-task-14-basic-matching.md
```

Confirm protected files remain unchanged.

---

## 4. Stage only Task 14 files

Expected:

```powershell
git add -- src/domain/orderBook.ts
git add -- src/domain/matching.ts
git add -- src/services/matchingEngine.ts
git add -- docs/clearhouse-task-14-basic-matching.md
```

Only if actually required and changed:

```powershell
git add -- src/controller/orderController.ts
```

If a source file contains unrelated work:

```powershell
git add -p -- <file-path>
```

Do not blindly run:

```text
git add .
```

---

## 5. Review staged changes

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
```

Review:

```powershell
git diff --cached -- src/domain/orderBook.ts src/domain/matching.ts src/services/matchingEngine.ts docs/clearhouse-task-14-basic-matching.md
```

Review controller separately if staged.

Stop if staged files unexpectedly include:
- tests/
- config/
- migrations/
- package files
- .env
- .gitignore
- tsconfig
- Vitest configuration
- DB configuration
- seeds
- scoring/grading files.

---

## 6. Commit Task 14

```powershell
git commit -m "feat: implement core price-time matching engine"
```

Verify:

```powershell
git show --stat --oneline HEAD
git status -sb
```

---

## 7. Switch to official `master`

```powershell
git switch master
git fetch origin
```

Inspect:

```powershell
git log --oneline --left-right master...origin/master
```

If local master is simply behind:

```powershell
git pull --ff-only origin master
```

---

## 8. Merge Task 14

Prefer:

```powershell
git merge --ff-only task-14
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-14
```

Resolve carefully.

Never force/reset shared history.

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

npm test challenge03.test.ts -t "Challenge 3a|Challenge 3c|Challenge 3d"

npm test challenge04.test.ts

git diff --check
git status -sb
```

---

## 10. Push official final branch

```powershell
git push origin master
```

Do not push final submission to `main`.

Do not force-push.

---

## 11. Verify remote master

```powershell
git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

The local HEAD hash and remote `refs/heads/master` hash should match.

---

# If push is rejected

Do not force.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If safe to rebase your local-only Task 14 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge03.test.ts -t "Challenge 3a|Challenge 3c|Challenge 3d"
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts deliberately.

---

# Fast Task 14 checklist

- [ ] working branch task-14
- [ ] final branch master
- [ ] full Challenge 03 test file read
- [ ] 3a/3c/3d scoped
- [ ] bids best-price-first
- [ ] asks best-price-first
- [ ] equal price FIFO
- [ ] resting-maker execution price
- [ ] correct buy/sell order IDs
- [ ] exact min fill
- [ ] partial maker stays in place
- [ ] full maker removed
- [ ] multi-level sweep ordered correctly
- [ ] GTC remainder rests
- [ ] full incoming doesn't rest
- [ ] no order overfilled
- [ ] final book uncrossed
- [ ] cancel exact live order
- [ ] second cancel 404
- [ ] registry cleanup correct
- [ ] empty best prices remain null
- [ ] bigint only
- [ ] Task 15 features not implemented
- [ ] Task 16 features not implemented
- [ ] typecheck passes
- [ ] Challenge 3a passes
- [ ] Challenge 3c passes
- [ ] Challenge 3d passes
- [ ] previous completed challenges regressions recorded
- [ ] full suite recorded honestly
- [ ] no existing tests changed
- [ ] no new tests added
- [ ] package/config/migrations unchanged
- [ ] Task 14 note created
- [ ] Task 14 committed
- [ ] merged into master
- [ ] `git push origin master`
- [ ] local and remote master hashes match

**Next planned task:** Task 15 — Execution Policies: IOC, FOK, POST_ONLY, and Self-Trade Prevention.
