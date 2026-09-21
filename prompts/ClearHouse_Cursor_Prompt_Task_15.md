# ClearHouse — Complete Enhanced Cursor Prompt for Task 15

**Task:** Challenge 03b — Execution Policies and Self-Trade Prevention  
**Primary scope:** IOC + FOK + POST_ONLY + STP  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-15`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 15 purpose

Task 15 extends the Task 14 core price-time matching engine with **order execution policies**.

Implement only:

- **IOC — Immediate-Or-Cancel**
- **FOK — Fill-Or-Kill**
- **POST_ONLY**
- **Self-Trade Prevention (STP)**

Task 15 must preserve Task 14's:

- maker-price execution;
- best-price-first matching;
- FIFO within price;
- no-overfill;
- uncrossed-book invariant;
- cancellation behavior.

Task 16 remains responsible for:

- stop orders;
- stop-limit orders;
- amendments;
- cancel/fill race;
- amend/fill race;
- deterministic replay target;
- performance target;
- full stateful model.

---

# Confirmed organizer contract

## Challenge 3b-1 — IOC — 15 points

A limit IOC order:

- immediately matches as much crossing liquidity as possible;
- returns any executions;
- **never rests**;
- discards any unfilled remainder.

Reference visible example:

```text
resting sell: 3 @ 100
incoming buy IOC: 10 @ 100
```

Expected:

```text
trade quantity = 3
incoming resting = false
```

The remaining 7 units do not join the book.

---

## Challenge 3b-2 — FOK — 18 points

A FOK order:

- must fill its complete quantity immediately;
- must first determine whether enough matchable liquidity exists;
- if not completely fillable, it is rejected;
- failed FOK must leave the order book **exactly unchanged**.

Reference visible example:

```text
resting sell: 3 @ 100
incoming buy FOK: 10 @ 100
```

Expected:

```text
HTTP 409
book after === book before
```

The engine's existing rejection reason is:

```ts
"insufficient_liquidity_for_fill_or_kill"
```

The FOK preflight must not mutate:

- maker `filled`;
- book order arrays;
- STP makers;
- registry;
- any other matching state.

---

## Challenge 3b-3 — POST_ONLY — 15 points

A POST_ONLY order:

- is intended to add liquidity;
- if it would cross immediately, it must be rejected;
- it must not execute any trade before rejection.

Reference visible example:

```text
resting sell: 5 @ 100
incoming buy POST_ONLY: 5 @ 101
```

Expected:

```text
HTTP 409
```

Existing rejection reason:

```ts
"would_cross"
```

A non-crossing POST_ONLY limit order may rest normally.

---

## Challenge 3b-4 — Self-Trade Prevention — 18 points

If an incoming order encounters a crossing resting order owned by the **same account**:

- do not trade against it;
- remove/cancel the resting self order;
- emit one cancellation record:

```ts
{
  orderId: string,
  reason: "self_trade_prevention"
}
```

- continue matching the aggressor against the next eligible resting order.

Reference visible example:

```text
ask 1: same-account 5 @ 100
ask 2: other-maker  5 @ 101
incoming buy from same-account: 5 @ 101
```

Expected:

```text
cancellations.length = 1
trades.length = 1
trade price = 101
```

The aggressor is not cancelled.

The resting self-order is cancelled.

---

# Visible Task 15 points

Challenge 3b visible points:

- 3b-1 = 15
- 3b-2 = 18
- 3b-3 = 15
- 3b-4 = 18

Total = **66 available Challenge 03 points**.

This is not an earned-score claim.

---

# Existing matching result contract

The historical `src/domain/matching.ts` defines:

```ts
export interface Cancellation {
  orderId: string;
  reason: "self_trade_prevention";
}

export interface SubmitResult {
  trades: Trade[];
  cancellations: Cancellation[];
  restingOrder: RestingOrder | null;
  rejected: boolean;
  rejectionReason?:
    | "would_cross"
    | "insufficient_liquidity_for_fill_or_kill";
}
```

Preserve this existing public contract.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 15

Copy the complete block below into Cursor Agent mode.

````text
Act as my senior TypeScript exchange and matching-engine engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 15 ONLY: implement Challenge 3b execution policies — IOC, FOK, POST_ONLY, and self-trade prevention — on top of the completed Task 14 price-time matching engine.

Preserve Tasks 1–14. Do not implement Task 16 stop orders, amendments, concurrency races, dedicated performance optimization, or stateful-model special cases.

Perform the implementation and verification, create the Task 15 engineering note, and show reviewed Git commands.

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

task-15

Historical GitHub reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:
- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–14;
- work on task-15;
- final reviewed work later merges into master;
- final submission push is `git push origin master`;
- do not commit/merge/push automatically.

============================================================
B. STRICT TASK 15 SCOPE
============================================================

IMPLEMENT:

Challenge 3b-1:
- IOC

Challenge 3b-2:
- FOK

Challenge 3b-3:
- POST_ONLY

Challenge 3b-4:
- self-trade prevention

Required supporting integration:
- domain `submitOrder()`;
- matchingEngine registry cleanup for STP;
- controller rejection behavior if current integration requires correction;
- release existing risk reservation for STP-cancelled live resting makers if the current controller/risk architecture already reserves resting orders.

PRESERVE:
- GTC behavior from Task 14;
- price-time priority;
- maker-price execution;
- cancellation;
- BigInt;
- empty book behavior;
- shared-state/reset behavior.

DO NOT IMPLEMENT:
- stop / stop_limit;
- amendment;
- cancel-fill race locks;
- amend-fill race locks;
- dedicated determinism optimization;
- 100k performance optimization;
- fee logic;
- risk challenge rules;
- settlement integration;
- market-feed feature work.

============================================================
C. STRICT ORGANIZER FILE RULES
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
- change timeouts;
- reduce test discovery;
- alter property generators/seeds;
- relax TypeScript.

Do NOT add production branches detecting:
- NODE_ENV === "test";
- VITEST;
- organizer test names;
- TEST-* markets;
- maker/taker fixture names;
- visible quantities/prices.

Do NOT use Number() for:
- prices;
- quantities;
- filled values;
- remaining liquidity.

Do NOT use destructive Git:
- git reset --hard;
- git clean -fd;
- force-push;
- history rewriting;
- blind branch deletion.

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
- origin = official repository;
- master = final branch.

Verify Task 14 is already in master:

git log --oneline --decorate --max-count=20 master

If task-14 exists:

git log --oneline --decorate --max-count=10 task-14

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-15

If task-15 exists:

git branch --list task-15
git log --oneline --decorate --max-count=10 task-15

Do not delete/recreate blindly.

Record:
- starting commit;
- branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
E. VERIFY TASK 14 CORE FIRST
============================================================

Read:

docs/clearhouse-task-14-basic-matching.md

if present.

Verify actual source.

Task 15 depends on:

- ordered asks/bids;
- FIFO;
- maker price;
- correct partial/full fills;
- GTC remainder;
- no overfill;
- uncrossed book;
- cancellation;
- registry behavior.

Run before Task 15 changes:

npm run typecheck

npm test challenge03.test.ts -t "Challenge 3a|Challenge 3c|Challenge 3d"

If Task 14 focused core is not passing:
- record it;
- do not hide it;
- fix only if the defect is in shared core needed by Task 15;
- do not rewrite unrelated completed areas.

============================================================
F. READ CURRENT CHALLENGE 03 COMPLETELY
============================================================

Read:

- tests/challenge03.test.ts
- src/domain/orderBook.ts
- src/domain/matching.ts
- src/services/matchingEngine.ts
- src/controller/orderController.ts
- src/routes/orderRoutes.ts

Inspect:

- riskRegistry;
- risk reservation APIs;
- market feed integration;
- Task 14 implementation.

Search:

rg -n "IOC|FOK|POST_ONLY|self_trade_prevention|Cancellation|rejectionReason|submitOrder|placeOrder|registry|takeReservation|releaseRisk" src tests

PowerShell fallback:

Get-ChildItem -Recurse src,tests -File |
  Select-String -Pattern "IOC|FOK|POST_ONLY|self_trade_prevention|Cancellation|rejectionReason|submitOrder|placeOrder|registry|takeReservation|releaseRisk"

Read current source signatures before editing.

Preserve existing public types.

============================================================
G. BEFORE BASELINE
============================================================

Run:

npm test challenge03.test.ts -t "Challenge 3b"

Historical reference count:

4 tests.

Record:
- executed;
- passed;
- failed;
- exact failure cause.

Then preserve Task 14 baseline result separately.

============================================================
H. EXECUTION POLICY ORDER OF OPERATIONS
============================================================

A robust `submitOrder()` flow should distinguish:

1. determine incoming type / crossing rules;
2. POST_ONLY rejection precheck;
3. FOK full-fill precheck;
4. actual match loop;
5. IOC/FOK never-rest logic;
6. GTC/POST_ONLY remainder rest logic.

STP is part of both:
- actual matching;
- FOK liquidity eligibility simulation.

Do not bolt these policies on after mutating the book.

============================================================
I. CROSSING HELPER
============================================================

Keep one consistent helper.

For LIMIT BUY:

incoming.price >= maker ask.price

For LIMIT SELL:

incoming.price <= maker bid.price

For MARKET order:
- price is undefined;
- any opposite maker price is eligible.

Controller already permits price omission for IOC/FOK.

Do not accidentally require a price for all IOC/FOK orders inside matching.

Do not allow a market order to rest.

============================================================
J. IOC — IMMEDIATE OR CANCEL
============================================================

IOC behavior:

- attempt matching immediately;
- preserve Task 14 price-time priority;
- preserve maker-price execution;
- fill as much as possible;
- discard remainder;
- never create a resting incoming order.

If fully fillable:
- trades as normal;
- restingOrder = null.

If partially fillable:
- partial trades;
- restingOrder = null.

If no eligible liquidity:
- trades = [];
- restingOrder = null;
- rejected = false unless current contract says otherwise.

IOC is not the same as FOK.

A partial IOC is successful.

============================================================
K. IOC REMAINDER IS NOT AN STP CANCELLATION
============================================================

The existing Cancellation type is:

{
  orderId,
  reason: "self_trade_prevention"
}

Do not emit a fake cancellation record for an unfilled IOC remainder.

IOC simply returns:

restingOrder = null

The response's cancellations array is only for actual STP maker cancellations.

============================================================
L. IOC MARKET ORDER
============================================================

Because the current controller permits no price for IOC:

- an IOC market order should consume opposite liquidity best-price-first;
- stop when quantity is filled or book is empty;
- never rest.

Do not access incoming.price with a non-null assertion unless the order is known to be a limit order.

============================================================
M. FOK — FULL-FILL PRECHECK
============================================================

FOK must know whether it can fill COMPLETELY before any mutation.

If full quantity cannot be filled:

return:

{
  trades: [],
  cancellations: [],
  restingOrder: null,
  rejected: true,
  rejectionReason: "insufficient_liquidity_for_fill_or_kill"
}

The book must be byte-for-byte/structurally equivalent from the API perspective.

Do not:
- partially fill;
- update maker.filled;
- remove makers;
- STP-cancel same-account makers;
- alter registry;
- rest the incoming order.

============================================================
N. FOK PRECHECK MUST BE NON-MUTATING
============================================================

Do NOT perform normal matching and then "undo" it.

Rollback in an in-memory order book is error-prone and can corrupt:
- filled fields;
- queue order;
- registry;
- cancellation records;
- sequence state.

Instead inspect a snapshot or read-only traversal.

Calculate:

fillable = sum of eligible maker remaining quantities

until:
- incoming quantity is satisfied;
- no more crossing maker exists.

Use exact bigint.

============================================================
O. FOK LIMIT PRICE BOUND
============================================================

For FOK limit BUY:
count only asks:

ask.price <= incoming.price

For FOK limit SELL:
count only bids:

bid.price >= incoming.price

Do not count non-crossing liquidity.

Do not count same-side liquidity.

============================================================
P. FOK MARKET ORDER
============================================================

If incoming FOK has no price:
- treat it as market;
- all opposite resting prices are eligible;
- still require full quantity before mutation.

If opposite book total eligible liquidity < requested quantity:
- reject unchanged.

============================================================
Q. FOK + SELF-TRADE PREVENTION
============================================================

STP semantics cancel same-account RESTING makers and let the aggressor continue.

Therefore same-account resting quantity does NOT count as fillable liquidity.

During FOK preflight:

- skip same-account makers for fillable quantity;
- continue scanning later crossing makers;
- do NOT actually cancel the same-account makers during preflight.

If FOK cannot fully fill:
- reject;
- book completely unchanged;
- own makers must remain untouched.

If FOK can fully fill:
- run the actual match loop;
- actual STP behavior may then cancel same-account makers and continue.

This distinction is crucial.

============================================================
R. FOK SUCCESS
============================================================

After successful preflight, execute normal match loop.

The actual fills must still:
- use maker price;
- follow price-time ordering;
- apply STP;
- fully fill incoming quantity.

For FOK:

restingOrder = null

even though there should be zero remainder after a correct successful preflight.

If actual matching somehow cannot fill after preflight:
- that indicates an implementation inconsistency;
- do not silently rest remainder.

In a single-threaded in-memory operation, preflight and execution should agree.

============================================================
S. POST_ONLY — PRECHECK BEFORE MUTATION
============================================================

POST_ONLY must determine whether the incoming order would cross immediately.

For BUY limit:
wouldCross if current best ask exists and:

incoming.price >= bestAsk.price

For SELL limit:
wouldCross if current best bid exists and:

incoming.price <= bestBid.price

If it would cross:

return:

{
  trades: [],
  cancellations: [],
  restingOrder: null,
  rejected: true,
  rejectionReason: "would_cross"
}

No maker may be changed.

No STP cancellation occurs.

No trade occurs.

============================================================
T. POST_ONLY IS A LIMIT/RESTING POLICY
============================================================

The controller requires a price for POST_ONLY.

Do not support a no-price POST_ONLY as a market order.

If a non-crossing POST_ONLY order is valid:
- it joins the book like GTC;
- price-time ordering applies;
- it gets a normal restingOrder.

============================================================
U. POST_ONLY + SAME-ACCOUNT MAKER
============================================================

Default to the direct "would cross by price" contract:

If POST_ONLY price crosses current opposite best price:
- reject before matching logic;
- do not invoke STP to cancel a same-account maker first.

This satisfies "post-only is rejected rather than matched when it would cross on entry."

If the current checkout organizer tests specify a different combined-policy behavior, follow the actual tests.

Do not invent hidden interaction semantics without evidence.

============================================================
V. SELF-TRADE PREVENTION — ACTUAL MATCH LOOP
============================================================

Before creating a trade with maker:

if:

maker.accountId === incoming.accountId

then:

1. remove the maker from opposite side;
2. append:

{
  orderId: maker.id,
  reason: "self_trade_prevention"
}

to cancellations;

3. do NOT decrement incoming remaining;
4. do NOT change maker.filled;
5. continue to next best maker.

The incoming aggressor survives and continues.

============================================================
W. STP MUST CANCEL RESTING ORDER, NOT AGGRESSOR
============================================================

Reference requirement:

"self-trade prevention cancels the resting order and the aggressor continues"

Do not:
- cancel incoming order;
- reject incoming merely because first maker is same account;
- stop matching after the self-maker;
- generate a self-trade.

============================================================
X. MULTIPLE STP MAKERS
============================================================

The loop should naturally handle more than one self-maker.

Example:

same account ask @100
same account ask @101
other ask @102
incoming buy same account @102

Expected:
- first two resting self orders cancelled;
- aggressor continues;
- may trade at 102.

Keep cancellations in actual encounter order.

============================================================
Y. STP AND PRICE-TIME
============================================================

STP does not allow jumping over a self order without removing it.

At each best crossing maker:

- if same account: cancel maker;
- otherwise trade.

Then continue.

The next maker is determined by normal price-time priority.

============================================================
Z. STP CANCELLATION REGISTRY CLEANUP
============================================================

matchingEngine.placeOrder() already receives:

result.cancellations

For each:

registry.delete(cancellation.orderId)

Preserve/verify this.

After STP removal:
- explicit DELETE on that maker should not behave as if it is still live;
- amend should later treat it as gone.

Do not leave stale registry entries.

============================================================
AA. STP RISK RESERVATION CLEANUP
============================================================

Existing orderController reserves risk for resting orders and stores reservation by order ID.

When STP cancels a resting maker, the maker is no longer live.

If current risk architecture already has:

risk.takeReservation(orderId)

and:

releaseRisk(...)

then after `engine.placeOrder()` returns, release the reservation associated with every STP cancellation.

This is NOT implementing Challenge 05 risk rules.

It is lifecycle cleanup for an order that Task 15 explicitly cancels.

Use the same existing release mechanism used by explicit DELETE cancellation.

Do not invent new risk math.

Do not release the aggressor's reservation unless its own lifecycle/rejection logic already requires it.

============================================================
AB. POST_ONLY RISK RESERVATION ROLLBACK
============================================================

The controller's current:

willRest =
  price exists &&
  timeInForce !== IOC &&
  timeInForce !== FOK

means POST_ONLY may reserve risk before matching determines it would cross.

Current rejection handling already releases the incoming reservation when `result.rejected`.

Preserve this.

Verify:
- POST_ONLY rejection does not leak risk reservation;
- no extra release occurs when POST_ONLY successfully rests.

Do not redesign pre-trade risk yet.

============================================================
AC. FOK / IOC RISK `willRest`
============================================================

IOC and FOK should never rest.

Current controller uses:

willRest = false

for those.

Preserve.

Do not create resting risk reservations for IOC/FOK.

============================================================
AD. GTC REGRESSION
============================================================

Task 15 modifications to submitOrder must not break:

- normal GTC;
- Task 14 price-time priority;
- partial maker;
- full maker;
- maker-price;
- sweeps;
- GTC remainder resting.

Keep policy branches clean rather than duplicating matching code four times.

============================================================
AE. SHARED MATCH LOOP
============================================================

Prefer one matching loop for:
- GTC
- IOC
- FOK after successful preflight

with STP integrated.

Then policy controls:
- precheck;
- post-match resting behavior.

This reduces divergence.

POST_ONLY crossing rejection occurs before the loop.

Non-crossing POST_ONLY can use no-trade/rest path.

============================================================
AF. AVOID BOOK MUTATION DURING LIQUIDITY INSPECTION
============================================================

Task 14 `snapshot()` should be defensive.

Use snapshots for FOK preflight if appropriate.

Do not call:
- removeFront();
- removeById();
- maker.filled += ...
during preflight.

============================================================
AG. FILLABLE LIQUIDITY ALGORITHM
============================================================

Conceptually:

needed = incoming.quantity
fillable = 0n

for maker of opposite snapshot in price-time order:
    if not crossing:
        break

    if maker.accountId === incoming.accountId:
        continue // STP: not fillable

    makerRemaining = maker.quantity - maker.filled
    fillable += makerRemaining

    if fillable >= needed:
        return true

return false

For market FOK:
- no price-bound break.

Use bigint.

============================================================
AH. FOK BOOK-UNCHANGED GUARANTEE
============================================================

Visible organizer test compares:

after.body.data === before.body.data

Therefore failed FOK must preserve at least:
- bestBid;
- bestAsk.

Correct implementation should preserve ALL internal book state.

Do not:
- alter filled and then restore;
- reorder arrays;
- increment a per-book mutation sequence;
- remove/reinsert makers;
- cancel self makers.

============================================================
AI. REJECTION CONTROLLER CONTRACT
============================================================

Current controller maps:

result.rejected

to:

HTTP 409

{
  error: {
    code: result.rejectionReason,
    details: []
  }
}

Preserve this.

Expected reasons:

POST_ONLY:
- `would_cross`

FOK:
- `insufficient_liquidity_for_fill_or_kill`

Do not rename these to custom uppercase strings unless current checkout changed the type/test.

============================================================
AJ. IOC RESPONSE CONTRACT
============================================================

IOC partial success returns HTTP 201 like normal accepted orders.

Expected data:

- orderId = null
- resting = false
- trades = fills
- cancellations = any STP cancellations

Do not return conflict merely because IOC did not fill completely.

============================================================
AK. FOK RESPONSE CONTRACT
============================================================

Failed FOK:
- HTTP 409 via `result.rejected`;
- no resting order;
- no trades;
- no cancellations;
- unchanged book.

Successful FOK:
- HTTP 201;
- fully filled;
- resting=false;
- orderId=null;
- trades cover full quantity.

============================================================
AL. POST_ONLY RESPONSE CONTRACT
============================================================

Crossing POST_ONLY:
- HTTP 409;
- no trades;
- no cancellations;
- no resting order.

Non-crossing POST_ONLY:
- HTTP 201;
- resting=true;
- orderId = incoming id;
- trades=[].

============================================================
AM. STP RESPONSE CONTRACT
============================================================

STP cancellation appears in:

data.cancellations

Example:

[
  {
    orderId: "...",
    reason: "self_trade_prevention"
  }
]

Do not expose removed RestingOrder object.

Do not call it a normal user cancellation reason.

============================================================
AN. FULLY FILLED MAKER REGISTRY CLEANUP
============================================================

Task 14 should already manage dead maker registry consistency.

Task 15 must preserve it.

Additionally:
- STP makers are definitely removed from registry.

Do not use result.cancellations for normal fully filled makers.

============================================================
AO. MARKET ORDERS IN IOC/FOK
============================================================

Controller allows:

price undefined when timeInForce is IOC/FOK.

Therefore Task 15 should support:

IOC market
FOK market

according to the same semantics.

Market order:
- crosses every opposite price;
- executes best-price first;
- never rests.

Do not introduce a fake extreme bigint price.

Use explicit no-price crossing logic.

============================================================
AP. MARKET GTC / POST_ONLY SAFETY
============================================================

Controller should prevent market GTC/POST_ONLY from reaching matching due PRICE_REQUIRED.

Do not rely exclusively on controller if a direct domain call could cause unsafe behavior.

A no-price order must never become a RestingOrder because RestingOrder.price is required.

Structure domain logic defensively.

============================================================
AQ. ZERO / NEGATIVE QUANTITY SAFETY
============================================================

Task 9 already rejects zero/invalid order quantities at HTTP boundary.

Do not undo that.

Domain code should not create:
- negative remaining;
- zero trade.

No Number conversion.

============================================================
AR. CURRENT RESULT TYPES
============================================================

Preserve:

Cancellation.reason =
"self_trade_prevention"

SubmitResult.rejectionReason =
"would_cross"
|
"insufficient_liquidity_for_fill_or_kill"

Do not widen public union unless Task 15 genuinely requires it.

No new rejection reason is needed for IOC.

============================================================
AS. TASK 16 COMPATIBILITY
============================================================

Task 16 will add:
- stop/stop_limit;
- amendment;
- concurrent operations;
- determinism;
- performance;
- stateful model.

Keep Task 15 matching code deterministic:
- no Math.random;
- no Date.now for priority;
- no unordered object iteration affecting match priority.

Use existing sequence.

Do not implement Task 16 now.

============================================================
AT. STATEFUL MODEL AWARENESS
============================================================

Challenge 3j later includes:
- buys;
- sells;
- cancels;
- self-trade prevention effects.

Task 15 should implement STP generally rather than only the visible fixture.

However do NOT special-case the future stateful test.

Correct model behavior should follow naturally.

============================================================
AU. EXPECTED TASK 15 FILE SCOPE
============================================================

Primary expected:

- src/domain/matching.ts

Potentially required for lifecycle integration:

- src/services/matchingEngine.ts
- src/controller/orderController.ts

Normally preserve without editing unless needed:

- src/domain/orderBook.ts

Create/update:

- docs/clearhouse-task-15-execution-policies.md

Do NOT add tests.

Do NOT modify routes unless a real Task 15 route defect exists.

Do NOT modify package/config/database files.

============================================================
AV. TYPE SAFETY / IMPLEMENTATION QUALITY
============================================================

Maintain strict TypeScript.

Avoid:
- any;
- @ts-ignore;
- duplicated separate matching loops for every policy;
- Number conversion;
- mutation during FOK preflight;
- manual rollback;
- fake IOC cancellation reason;
- stale STP registry;
- swallowed errors.

Prefer:
- one crossing helper;
- one match loop;
- one FOK read-only preflight helper;
- explicit policy checks;
- bigint;
- defensive snapshots.

============================================================
AW. REQUIRED POST-IMPLEMENTATION VERIFICATION
============================================================

Run:

npm run typecheck

Task 15 focused:

npm test challenge03.test.ts -t "Challenge 3b"

Reference expected:
- 4 tests.

Then individual Task 15 groups are all inside 3b, so the combined filter is primary.

Run Task 14 regressions:

npm test challenge03.test.ts -t "Challenge 3a|Challenge 3c|Challenge 3d"

Then:

npm test challenge04.test.ts
npm test challenge02.test.ts
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

Run:

git diff --check

Then milestone:

npm test

Record remaining Task 16 Challenge 03 failures honestly.

============================================================
AX. OPTIONAL MANUAL REASONING CASES — NO NEW TEST FILE
============================================================

Reason through current code:

CASE 1 — IOC partial:

ask 3 @100
buy IOC 10 @100

=> trade 3
=> incoming does not rest
=> ask removed

CASE 2 — IOC noncrossing:

ask 5 @105
buy IOC 5 @100

=> no trades
=> no resting buy

CASE 3 — FOK fail:

ask 3 @100
buy FOK 10 @100

=> rejected
=> ask unchanged

CASE 4 — FOK sweep success:

asks:
3 @100
4 @101
5 @102

buy FOK 7 @101

=> full fill:
3 @100
4 @101

CASE 5 — FOK cannot count bad price:

ask 3 @100
ask 10 @110
buy FOK 5 @100

=> reject unchanged

CASE 6 — POST_ONLY crossing:

ask 5 @100
buy POST_ONLY 5 @100

=> reject
=> no trade

CASE 7 — POST_ONLY noncross:

ask 5 @101
buy POST_ONLY 5 @100

=> rests at bid 100

CASE 8 — STP:

same acct ask 5 @100
other ask 5 @101
same acct buy 5 @101

=> cancel own ask
=> trade other @101

CASE 9 — FOK + STP fail without mutation:

same acct ask 5 @100
other ask 2 @101
same acct buy FOK 5 @101

=> own 5 cannot count
=> only 2 fillable
=> FOK rejected
=> own maker remains because preflight must not mutate

Do not add hardcoded branches for these cases.

============================================================
AY. TEST REPORTING
============================================================

For each command report:

- exact command;
- exit code;
- executed;
- passed;
- failed;
- not exercised;
- actual cause.

Do not claim Task 16 groups passed unless they actually do.

If FOK test fails with changed book:
- inspect mutation in preflight;
- inspect STP cancellation during preflight;
- inspect maker.filled changes.

If IOC rests:
- inspect post-match rest policy.

If STP stops instead of continuing:
- inspect `continue` after maker removal.

If test hangs:
- ensure STP maker is actually removed before continue;
- ensure remaining changes after real trades;
- ensure no zero-remaining maker stays at front.

Do not increase timeout.

============================================================
AZ. TASK 15 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-15-execution-policies.md

Include:

1. Starting commit.
2. Working branch task-15.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 3b tests/count.
6. IOC behavior.
7. IOC market support.
8. FOK preflight design.
9. FOK price-bound rules.
10. FOK market support.
11. FOK + STP preflight handling.
12. Failed FOK no-mutation guarantee.
13. POST_ONLY crossing precheck.
14. POST_ONLY rejection reason.
15. STP maker-cancel behavior.
16. STP cancellation order.
17. registry cleanup.
18. risk-reservation cleanup if applied.
19. GTC regression strategy.
20. exact BigInt use.
21. files changed.
22. typecheck.
23. Challenge 3b result.
24. Task 14 regression result.
25. Challenge 04 regression.
26. Challenge 02 regression.
27. foundation/sanity.
28. full-suite status.
29. remaining Task 16 failures.
30. protected-file confirmation.
31. suggested commit.
32. master merge/push commands.
33. next Task 16.

No secrets/credentials.

============================================================
BA. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat

Review:

git diff -- src/domain/matching.ts
git diff -- src/services/matchingEngine.ts
git diff -- src/controller/orderController.ts
git diff -- src/domain/orderBook.ts
git diff -- docs/clearhouse-task-15-execution-policies.md

Confirm:
- no existing tests changed;
- no new tests added;
- config unchanged;
- package files unchanged;
- .env/.gitignore unchanged;
- tsconfig/vitest unchanged;
- knexfile/migrations/seeds unchanged;
- no test detection;
- no Number price/quantity conversion;
- no stop/amend/race/performance implementation;
- Task 14 price-time behavior intact;
- prior Tasks intact.

============================================================
BB. TASK 15 COMPLETION CRITERIA
============================================================

Task 15 is COMPLETE only when:

[ ] Challenge 3b read fully.
[ ] IOC implemented.
[ ] IOC partial fills allowed.
[ ] IOC remainder never rests.
[ ] IOC no-fill does not rest.
[ ] IOC market behavior supported if price absent.
[ ] FOK preflight implemented.
[ ] FOK preflight is non-mutating.
[ ] FOK respects limit price.
[ ] FOK market counts all eligible opposite liquidity.
[ ] FOK ignores same-account liquidity for fillability.
[ ] Failed FOK does not STP-cancel makers.
[ ] Failed FOK leaves book unchanged.
[ ] failed FOK rejection reason exact.
[ ] successful FOK fills full quantity.
[ ] successful FOK never rests.
[ ] POST_ONLY crossing detection happens before mutation.
[ ] crossing POST_ONLY rejects.
[ ] POST_ONLY rejection reason = would_cross.
[ ] rejected POST_ONLY produces no trade.
[ ] non-crossing POST_ONLY rests.
[ ] STP identifies same account.
[ ] STP cancels resting maker, not aggressor.
[ ] STP does not create self-trade.
[ ] STP aggressor continues.
[ ] multiple STP makers can be removed sequentially.
[ ] STP cancellations emitted correctly.
[ ] STP registry cleanup correct.
[ ] STP risk reservation cleanup handled if required by current architecture.
[ ] GTC Task 14 behavior preserved.
[ ] maker price preserved.
[ ] FIFO preserved.
[ ] no overfill preserved.
[ ] BigInt preserved.
[ ] typecheck passes.
[ ] Challenge 3b passes.
[ ] Task 14 groups pass.
[ ] previous completed challenges regressions recorded.
[ ] full suite recorded honestly.
[ ] Task 16 failures kept separate.
[ ] no tests/config/package/migration modifications.
[ ] Task 15 note created.
[ ] final Git target master.

If any 3b test or policy invariant fails:
- Task 15 status = PARTIAL;
- identify exact blocker.

============================================================
BC. FINAL CURSOR REPORT
============================================================

Return:

1. Task 15 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. IOC implementation.
6. FOK preflight implementation.
7. POST_ONLY implementation.
8. STP implementation.
9. FOK+STP handling.
10. market IOC/FOK handling.
11. registry cleanup.
12. risk-reservation cleanup if changed.
13. typecheck.
14. Challenge 3b result.
15. Task 14 group regression.
16. Challenge 04 result.
17. Challenge 02 result.
18. foundation/sanity.
19. full-suite result.
20. remaining Task 16 failures.
21. confirmation protected files unchanged.
22. final diff summary.
23. reviewed Git commands for master.

Suggested commit:

feat: implement matching execution policies

Do not automatically commit, merge, or push.
````

---

# Task 15 acceptance matrix

| Policy | Required behavior |
|---|---|
| IOC partial | Fill available crossing liquidity |
| IOC remainder | Never rests |
| IOC no fill | Does not rest |
| IOC market | Matches best-price-first, never rests |
| FOK fail | Reject before mutation |
| FOK fail book | Completely unchanged |
| FOK limit | Counts only crossing prices |
| FOK market | Counts all eligible opposite liquidity |
| FOK + STP | Same-account liquidity does not count |
| FOK failed preflight | Must not cancel same-account makers |
| FOK success | Full quantity only |
| POST_ONLY crossing | Reject |
| POST_ONLY trade | None |
| POST_ONLY noncross | May rest |
| STP | Cancel resting same-account maker |
| STP aggressor | Continues |
| STP cancellation reason | `self_trade_prevention` |
| FOK rejection reason | `insufficient_liquidity_for_fill_or_kill` |
| POST_ONLY reason | `would_cross` |
| GTC | Task 14 behavior preserved |
| Arithmetic | BigInt |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 15

Final competition branch:

**`master`**

Workflow:

**`master` → `task-15` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify working state

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
task-15
```

Final:

```text
master
```

---

## 2. Run Task 15 verification

```powershell
npm run typecheck

npm test challenge03.test.ts -t "Challenge 3b"

npm test challenge03.test.ts -t "Challenge 3a|Challenge 3c|Challenge 3d"

npm test challenge04.test.ts
npm test challenge02.test.ts
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

git diff --check
```

Then:

```powershell
npm test
```

Record Task 16 failures separately.

---

## 3. Review Task 15 diff

```powershell
git status --short
git diff --stat

git diff -- src/domain/matching.ts
git diff -- src/services/matchingEngine.ts
git diff -- src/controller/orderController.ts
git diff -- src/domain/orderBook.ts
git diff -- docs/clearhouse-task-15-execution-policies.md
```

Do not proceed if protected files changed.

---

## 4. Stage only Task 15 files

Primary:

```powershell
git add -- src/domain/matching.ts
git add -- docs/clearhouse-task-15-execution-policies.md
```

Only if actually changed and required:

```powershell
git add -- src/services/matchingEngine.ts
git add -- src/controller/orderController.ts
git add -- src/domain/orderBook.ts
```

If a file contains unrelated changes:

```powershell
git add -p -- <file-path>
```

Avoid `git add .`.

---

## 5. Review staged content

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached
```

Stop if staged content includes:
- tests;
- config;
- package files;
- migrations;
- .env;
- database config;
- unrelated work.

---

## 6. Commit Task 15

```powershell
git commit -m "feat: implement matching execution policies"
```

Verify:

```powershell
git show --stat --oneline HEAD
git status -sb
```

---

## 7. Switch to master

```powershell
git switch master
git fetch origin
```

Inspect:

```powershell
git log --oneline --left-right master...origin/master
```

If simply behind:

```powershell
git pull --ff-only origin master
```

---

## 8. Merge Task 15

Prefer:

```powershell
git merge --ff-only task-15
```

If fast-forward is impossible:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If valid histories diverged:

```powershell
git merge task-15
```

Resolve deliberately.

Do not force/reset.

---

## 9. Re-test master

```powershell
git branch --show-current
```

Expected:

```text
master
```

Run:

```powershell
npm run typecheck
npm test challenge03.test.ts -t "Challenge 3a|Challenge 3b|Challenge 3c|Challenge 3d"
git diff --check
git status -sb
```

---

## 10. Push official master

```powershell
git push origin master
```

Never use `main` for final submission.

Never force-push.

---

## 11. Verify remote master

```powershell
git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

Local HEAD must match remote master.

---

# If push is rejected

Do not force.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If safe:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge03.test.ts -t "Challenge 3a|Challenge 3b|Challenge 3c|Challenge 3d"
git diff --check
```

Then:

```powershell
git push origin master
```

---

# Fast Task 15 checklist

- [ ] task-15 branch
- [ ] master final branch
- [ ] challenge03 read completely
- [ ] Task 14 core passes
- [ ] IOC partial fills
- [ ] IOC never rests
- [ ] IOC market handled
- [ ] FOK preflight read-only
- [ ] FOK requires full fill
- [ ] FOK failure unchanged book
- [ ] FOK limit bound correct
- [ ] FOK market correct
- [ ] FOK excludes STP self liquidity
- [ ] failed FOK does not mutate/cancel
- [ ] POST_ONLY crossing rejects
- [ ] POST_ONLY noncross rests
- [ ] STP cancels resting same-account maker
- [ ] STP aggressor continues
- [ ] STP cancellation record exact
- [ ] STP registry cleanup
- [ ] STP reservation cleanup if required
- [ ] rejection reasons exact
- [ ] GTC regression passes
- [ ] BigInt only
- [ ] typecheck passes
- [ ] Challenge 3b passes
- [ ] Task 14 groups pass
- [ ] previous completed challenge regressions recorded
- [ ] full suite recorded
- [ ] Task 16 failures separated
- [ ] no existing tests modified
- [ ] no new tests added
- [ ] config/package/migrations unchanged
- [ ] Task 15 note created
- [ ] committed on task-15
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 16 — Stops, Amendments, Concurrency, Determinism, Performance, and Stateful Matching.
