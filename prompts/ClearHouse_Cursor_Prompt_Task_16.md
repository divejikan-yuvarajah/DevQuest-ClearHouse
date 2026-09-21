# ClearHouse — Complete Enhanced Cursor Prompt for Task 16

**Task:** Challenge 03 — Advanced Matching Engine Completion  
**Primary scope:** Stops + Stop-Limit + Amendments + Concurrency + Determinism + Performance + Stateful Model  
**Published challenge groups:** 3e + 3f + 3g + 3h + 3i  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-16`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 16 purpose

Task 16 completes the advanced part of **Challenge 03 — The Matching Engine** after:

- **Task 14:** core price-time order book, matching, invariants, cancellation.
- **Task 15:** IOC, FOK, POST_ONLY, and self-trade prevention.

Task 16 implements:

- **3e:** stop and stop-limit orders;
- **3f:** amendment rules and queue-priority behavior;
- **3g:** cancel/fill and amend/fill concurrency consistency;
- **3h:** deterministic replay;
- **3i:** sublinear insertion performance at deep book sizes;
- the additional stateful/randomized matching-model checks present in the current organizer test file, if labelled as **3j** or equivalent.

After Task 16, the goal is for the **entire `tests/challenge03.test.ts`** to pass while preserving all earlier matching behaviors.

---

# Published Task 16 requirements

## Challenge 3e — Stop and stop-limit orders — 20 points

- **3e-1 — 8 pts:** a stop order triggers as a market order once the last trade price reaches its stop price.
- **3e-2 — 6 pts:** a stop-limit order triggers as a limit order at its own price, not as a market order.
- **3e-3 — 6 pts:** multiple stops triggered by the same trade fire in original submission order.

---

## Challenge 3f — Amendment — 20 points

- **3f-1 — 3 pts:** decreasing quantity preserves queue position.
- **3f-2 — 4 pts:** a price change loses queue position, moving the order to the back of its new price level.
- **3f-3 — 4 pts:** increasing quantity loses queue position.
- **3f-4 — 3 pts:** amending a non-existent or already-filled order returns 404.
- **3f-5 — 2 pts:** amending to a non-positive quantity is rejected.
- **3f-6 — 4 pts:** decreasing quantity of an order that is not at the front preserves its exact place in the queue.

---

## Challenge 3g — Concurrency — 25 points

- **3g-1 — 13 pts:** a cancel racing an aggressing fill resolves to exactly one consistent outcome.
- **3g-2 — 12 pts:** an amend racing an aggressing fill never double-counts quantity.

---

## Challenge 3h — Determinism — 15 points

- **3h-1 — 15 pts:** replaying the same **10,000-operation sequence** twice produces identical trades and an identical final book.

---

## Challenge 3i — Performance — 15 points

- **3i-1 — 15 pts:** per-order insert cost does **not** grow linearly with book depth.

---

# Visible Task 16 score

Published groups 3e–3i:

```text
3e = 20
3f = 20
3g = 25
3h = 15
3i = 15
----------------
Task 16 visible total = 95 points
```

Tasks 14 + 15 + 16:

```text
Task 14 = 89
Task 15 = 66
Task 16 = 95
----------------
Challenge 03 = 250
```

This is an available-point calculation only, not an earned-score claim.

The current organizer test file may include additional **stateful/randomized model** assertions beyond the prose scoring summary. They must also pass before declaring the matching engine complete.

---

# Important architectural recommendation for 3i

A sorted JavaScript array with:

```ts
splice(insertIndex, 0, order)
```

is still **O(n)** insertion even if the insert index is found with binary search.

For the performance challenge, Cursor must inspect the exact current performance test. If the current Task 14 array implementation does not satisfy it, migrate `BookSide` internals to a genuinely sublinear mutation structure while preserving its public API.

A strong dependency-free option is an **indexed binary heap** per side:

- root = best order;
- ordering key = price + sequence;
- insert = O(log n);
- remove best = O(log n);
- remove by ID = O(log n) using `Map<orderId,index>`;
- priority-changing amendment = O(log n);
- same-priority quantity decrease = O(1);
- snapshot can sort a copy for deterministic public output.

Do not add a package solely for a tree/heap.

The exact current test remains authoritative.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 16

Copy the entire block below into Cursor Agent mode.

````text
Act as my senior TypeScript exchange/matching-engine engineer and concurrency/performance reviewer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 16 ONLY: complete the advanced matching-engine requirements in Challenge 03 — stops, stop-limit orders, amendment semantics, cancel/fill and amend/fill race consistency, deterministic replay, deep-book insertion performance, and the current stateful/randomized reference-model checks.

Preserve all completed Tasks 1–15.

This task is the final Challenge 03 matching-engine completion pass. Do not expand into Task 17 risk rules or later challenges.

Perform implementation and verification, create the Task 16 engineering note, and show reviewed Git commands.

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

task-16

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- do not reset to historical GitHub;
- do not replace origin;
- do not clone over the checkout;
- preserve Tasks 1–15;
- develop on task-16;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT TASK 16 SCOPE
============================================================

IMPLEMENT:

Challenge 3e:
- stop orders;
- stop-limit orders;
- stop trigger ordering.

Challenge 3f:
- amendment;
- exact priority-preservation/loss semantics;
- amendment validation/not-found behavior.

Challenge 3g:
- cancel vs fill consistency;
- amend vs fill consistency.

Challenge 3h:
- deterministic replay.

Challenge 3i:
- non-linear deep-book insertion performance.

ALSO:
- any current organizer stateful/randomized matching-model assertion after 3i, often referred to in project planning as Challenge 3j.

PRESERVE:

Task 14:
- price-time priority;
- maker price;
- FIFO;
- sweeping;
- no overfill;
- uncrossed book;
- cancellation.

Task 15:
- IOC;
- FOK;
- POST_ONLY;
- STP;
- FOK + STP no-mutation semantics;
- market IOC/FOK.

DO NOT IMPLEMENT:

- full Challenge 05 risk rules;
- settlement redesign;
- event sourcing;
- fees;
- netting;
- account closure;
- WebSockets;
- market-data challenge features;
- dashboard.

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
- increase test timeout;
- reduce test discovery;
- alter fast-check generators or seeds;
- relax TypeScript.

Nothing in src/ may detect:

- NODE_ENV === "test";
- VITEST;
- organizer test names;
- exact fixture market/account/order names;
- known benchmark size;
- known property-test values.

Do NOT add logic such as:

if (book.length === 100000) ...

Do NOT use Number() for price or quantity.

Do NOT use:

- git reset --hard;
- git clean -fd;
- force-push;
- shared-history rewriting.

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
- master = official final branch.

Verify Task 15 is in master:

git log --oneline --decorate --max-count=20 master

If task-15 exists:

git log --oneline --decorate --max-count=10 task-15

Do not discard valid prior work.

If master is correct:

git switch master
git pull --ff-only origin master
git switch -c task-16

If task-16 already exists:

git branch --list task-16
git log --oneline --decorate --max-count=10 task-16

Do not delete/recreate it blindly.

Record:

- starting commit;
- branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
E. VERIFY TASKS 14–15 FIRST
============================================================

Read:

- docs/clearhouse-task-14-basic-matching.md
- docs/clearhouse-task-15-execution-policies.md

if present.

Verify actual source.

Before Task 16 edits run:

npm run typecheck

npm test challenge03.test.ts -t "Challenge 3a|Challenge 3b|Challenge 3c|Challenge 3d"

Task 16 must not fix advanced behavior by regressing these completed groups.

If a Task 14/15 group is already failing:
- record it;
- determine whether the shared engine defect must be corrected for Task 16;
- do not hide the baseline.

============================================================
F. READ THE ENTIRE CURRENT MATCHING SPEC
============================================================

Read COMPLETELY:

- tests/challenge03.test.ts

Read current:

- src/domain/orderBook.ts
- src/domain/matching.ts
- src/services/matchingEngine.ts
- src/controller/orderController.ts
- src/routes/orderRoutes.ts

Inspect:

- src/services/riskRegistry.ts
- market-feed publishing
- order registry
- trade log
- sequence counter
- resetAllBooks()
- current amend route/controller if present
- any mutex/serialization helper already present

Search:

rg -n "stop|stop_limit|stopPrice|amend|amendOrder|sequence|mutex|lock|serialize|tradeLog|lastTrade|performance|stateful|fast-check|registry|BookSide" src tests

PowerShell fallback:

Get-ChildItem -Recurse src,tests -File |
  Select-String -Pattern "stop|stop_limit|stopPrice|amend|amendOrder|sequence|mutex|lock|serialize|tradeLog|lastTrade|performance|stateful|fast-check|registry|BookSide"

IMPORTANT:
The current tests are the authority for exact API status/error codes and any details not explicit in the published prose.

============================================================
G. BEFORE BASELINE
============================================================

Run:

npm test challenge03.test.ts -t "Challenge 3e|Challenge 3f|Challenge 3g|Challenge 3h|Challenge 3i|Challenge 3j"

If current test names do not include 3j, this still exercises the 3e–3i groups.

Then run:

npm test challenge03.test.ts

Record:

- executed count;
- passed;
- failed;
- timeout/performance failures;
- property seed/path/counterexample;
- current NotImplementedError sites.

Do not optimize before identifying actual bottlenecks and contract failures.

============================================================
H. STOP ORDERS — DORMANT UNTIL TRIGGER
============================================================

A STOP order must NOT enter the visible active bid/ask book before its trigger condition.

Store it in separate per-market dormant stop state.

Dormant stops:

- must not affect best bid/ask;
- must not appear as executable liquidity;
- must not be matched before trigger;
- must remain cancelable if the current API/test requires cancellation of dormant orders;
- must have stable original submission ordering.

Use existing order ID/account/quantity/sequence.

Do not fake a far-away limit price to hide a stop in the normal book.

============================================================
I. STOP TRIGGER CONDITION
============================================================

Use last TRADE price, not:

- best bid;
- best ask;
- incoming limit price;
- current midpoint.

Standard directional semantics:

BUY stop triggers when:

lastTradePrice >= stopPrice

SELL stop triggers when:

lastTradePrice <= stopPrice

Verify exact current organizer tests.

Once triggered, remove the dormant stop from stop storage before activation so it cannot trigger twice.

============================================================
J. STOP ORDER ACTIVATION
============================================================

Challenge 3e-1:

A triggered STOP becomes a MARKET order.

That means:

- no limit price;
- immediately consumes eligible opposite liquidity;
- best-price-first;
- never rests as a market order;
- preserve account, ID, quantity, and relevant execution semantics.

Use the existing market-capable Task 15 path rather than duplicating matching logic.

A triggered plain stop should behave conceptually like IOC market unless current test specifies another exact TIF representation.

Do not allow an unfilled market-stop remainder to become a resting order.

============================================================
K. STOP-LIMIT ACTIVATION
============================================================

Challenge 3e-2:

A triggered STOP_LIMIT becomes a LIMIT order at its OWN stored limit price.

Do NOT convert it to market.

When triggered:

- remove from dormant stops;
- activate with price = original stop-limit price;
- match normally if crossing;
- any valid GTC-style remainder may rest according to current contract.

Preserve:

- quantity;
- account;
- order ID.

Do not replace the stop-limit price with:
- trigger price;
- last trade price;
- maker price.

============================================================
L. MULTIPLE STOPS — ORIGINAL SUBMISSION ORDER
============================================================

Challenge 3e-3:

If one trade causes multiple dormant stops to become eligible:

fire them in original submission order.

Use a deterministic stop sequence assigned at submission.

Do not depend on:
- Map iteration after arbitrary delete/reinsert;
- UUID lexical order;
- Date.now() ties;
- account ID.

Procedure:

1. determine eligible stops for the current last-trade price;
2. order by original stop submission sequence;
3. remove each from dormant storage before activation;
4. activate one at a time in sequence;
5. process resulting trades deterministically.

============================================================
M. CASCADING STOP TRIGGERS
============================================================

A triggered stop may generate another trade, producing a new last trade price that triggers more stops.

Implement a deterministic queue/loop rather than uncontrolled recursive mutation.

Strong pattern:

- process one matching action;
- append produced trades in order;
- update lastTradePrice for each committed trade;
- enqueue newly eligible stops in submission order;
- process queued stop activations until no newly triggered stop remains.

Prevent:
- double trigger;
- infinite recursion;
- processing the same dormant stop twice.

============================================================
N. TRADE-BY-TRADE TRIGGER SEMANTICS
============================================================

Inspect the exact organizer tests.

If an incoming sweep produces multiple trades, trigger semantics may depend on the last price after each trade, not only the final batch.

Do not assume batch-final price if the current test expects per-trade triggering.

If necessary, refactor matching integration so emitted trades can be observed in deterministic execution order without changing public API contracts.

Do not regenerate trades merely for triggering.

============================================================
O. STOP REGISTRY / CANCELLATION LIFECYCLE
============================================================

The central order registry should represent live orders, including dormant stops if the current cancel/amend API operates on them.

Store sufficient location metadata to distinguish:

- active bid;
- active ask;
- dormant stop.

After trigger:
- update registry from stop location to active/resting location if it remains live;
- remove if fully filled.

After cancellation:
- remove from relevant storage;
- delete registry.

Do not leave stale dormant entries.

============================================================
P. STOP RESET STATE
============================================================

Task 7 `resetAllBooks()` must now also clear Task 16 matching state:

- dormant stops;
- last-trade state if module-owned;
- per-market operation queues/locks if any;
- amendment/concurrency metadata;
- order-index state;
- sequence counter as intended.

After reset, replay must start clean and deterministic.

============================================================
Q. AMENDMENT — READ CURRENT API CONTRACT
============================================================

Before implementing amendments, inspect:

- amend route path;
- request body fields;
- controller status/error codes;
- matchingEngine amend signature;
- whether quantity means new TOTAL quantity or new REMAINING quantity;
- whether price is optional.

Do not guess where tests already specify it.

Preserve public API.

============================================================
R. AMENDMENT — DECREASE QUANTITY PRESERVES PRIORITY
============================================================

Challenge 3f-1 and 3f-6:

If only quantity is decreased:

- price unchanged;
- new quantity is valid;
- order remains at exactly the same queue location;
- sequence does NOT change.

This applies even if order is:
- at front;
- in the middle;
- at back.

Do not remove/reinsert a pure quantity decrease.

That would lose FIFO priority.

============================================================
S. AMENDMENT — NON-FRONT EXACT POSITION
============================================================

3f-6 specifically protects against an implementation that:

- removes the order;
- re-adds it with the same sequence;
- accidentally changes relative array/heap placement.

For same-price quantity decrease:

only mutate the permitted quantity field in place.

Its ordering key is unchanged.

If BookSide uses an indexed heap:
- quantity is not part of comparator;
- no heap reordering is needed.

============================================================
T. AMENDMENT — PRICE CHANGE LOSES PRIORITY
============================================================

Challenge 3f-2:

Changing price is equivalent to losing original queue priority.

Required:

1. remove current resting order;
2. set new valid price;
3. allocate a NEW later sequence;
4. reinsert using price-time ordering.

At its new price level it must sit behind older existing orders at that price.

Do not preserve original sequence on price change.

============================================================
U. AMENDMENT — QUANTITY INCREASE LOSES PRIORITY
============================================================

Challenge 3f-3:

Increasing quantity loses time priority even when price stays the same.

Required:

1. remove order from active side;
2. set increased valid quantity;
3. allocate new sequence;
4. reinsert.

At same price:
- it moves behind older orders already at that level.

Do not simply mutate quantity upward in place.

============================================================
V. AMENDMENT WITH CUMULATIVE FILLED QUANTITY
============================================================

RestingOrder tracks:

- quantity;
- filled.

Never allow an amendment to create:

filled > quantity.

If the public amendment quantity means new TOTAL quantity:

newQuantity must be > 0 and >= filled, with exact current test boundary behavior.

If the API means new REMAINING quantity:
follow the actual test/controller definition and convert consistently.

Do not erase existing fill history during amendment.

Do not reset `filled` to zero.

============================================================
W. NON-POSITIVE AMENDMENT
============================================================

Challenge 3f-5:

amending to zero or negative quantity is rejected.

Use the exact current API status/error code.

Must leave:
- order quantity;
- sequence;
- price;
- book position;
- registry

unchanged.

Do not treat zero amendment as cancellation unless the current tests explicitly say so.

============================================================
X. AMEND NOT FOUND / FILLED
============================================================

Challenge 3f-4:

Amending:
- unknown order ID;
- already fully filled order;
- cancelled order

returns not found.

Do not retain dead orders in registry.

Do not resurrect a fully filled order through amendment.

============================================================
Y. AMENDMENT AND RISK RESERVATION
============================================================

Do not implement full Task 17 risk rules.

However current order lifecycle may associate a reservation with a live resting order.

If amendment changes:
- quantity;
- price

and current architecture already provides reservation update/re-evaluation hooks, preserve consistency using existing mechanisms.

Do not invent future risk formulas.

If current Challenge 03 tests do not involve risk on amend, keep this narrow and document it.

============================================================
Z. AMENDMENT CROSSING BEHAVIOR
============================================================

Read current tests before deciding whether a price amendment that becomes crossing:

- immediately matches as a newly reprioritized order;
OR
- is only repositioned as a resting order.

Do not invent semantics.

Implement exactly the current organizer contract.

Whatever behavior is required must remain:
- deterministic;
- no-overfill;
- uncrossed after completion.

============================================================
AA. CONCURRENCY MODEL — 3g
============================================================

JavaScript is single-threaded, but concurrent HTTP requests can interleave around async work.

The matching-engine shared state must treat each market mutation as one logical atomic state transition.

Operations that race:

- place/fill;
- cancel;
- amend;
- stop activation.

Must never see half-applied matching state.

============================================================
AB. CANCEL VS FILL RACE
============================================================

Challenge 3g-1:

If cancel and aggressing fill race against the same resting order:

exactly one coherent outcome wins.

Valid conceptual outcomes:

A. cancel wins:
- order removed;
- aggressor cannot fill it;
- cancel succeeds.

B. fill wins:
- aggressor fills/removes order;
- cancel reports not found.

Invalid outcomes:

- trade AND successful cancel both claim the full same live quantity;
- order remains after both;
- order becomes negative-filled;
- stale registry says live after removal.

============================================================
AC. AMEND VS FILL RACE
============================================================

Challenge 3g-2:

Amend racing a fill must never double-count quantity or create impossible state.

Whichever logical operation linearizes first determines what the second sees.

Preserve:

filled <= quantity

at every completed operation boundary.

Do not:
- read an order snapshot;
- await;
- later mutate it assuming still live.

============================================================
AD. SERIALIZE PER-MARKET MUTATIONS
============================================================

Inspect current public method signatures.

If all matching mutations are synchronous and contain no await:
- keep the actual shared-state mutation synchronous/atomic;
- ensure no asynchronous gap exists inside the critical transition.

If current service/controller architecture requires async operations around matching:
- use a small dependency-free per-market mutex/operation queue;
- serialize mutations for the same market;
- allow independent markets to proceed independently where possible.

Do NOT:
- add a global sleep;
- add busy waiting;
- use a test-only lock.

Do not change public sync/async signatures unnecessarily.

============================================================
AE. LOCK / QUEUE MUST NOT DEADLOCK ON STOP ACTIVATION
============================================================

If using a per-market serialized operation:

- do not re-enter the same lock recursively while already holding it;
- use internal "already in market operation" helpers for triggered stops;
- or queue stop activations after the current operation and drain before releasing.

Avoid:

public placeOrder()
  -> lock
  -> trigger stop
  -> public placeOrder()
     -> waits on same lock forever

Keep external wrapper and internal mutation function separate if needed.

============================================================
AF. DETERMINISM — 10,000 OPERATIONS
============================================================

Challenge 3h:

Same initial state + same exact operation sequence must yield:

- identical trade sequence;
- identical trade fields;
- identical final book;
- identical cancellation ordering where compared.

Do not use:

- Math.random();
- Date.now() as priority;
- non-deterministic UUID generation inside core matching results that are compared;
- race-dependent Map/Object iteration order;
- wall-clock timestamps as tie-breakers.

Use explicit sequence counters driven only by operation order.

============================================================
AG. RESET MUST RESTORE DETERMINISTIC INITIAL STATE
============================================================

Between replay runs:

resetAllBooks()

must clear:

- active books;
- dormant stops;
- registry;
- trade log;
- account lookup;
- sequence counter;
- last trade prices;
- pending trigger queues;
- locks/operation queues when safe.

A reset must not allow prior references/state to influence the next replay.

============================================================
AH. TRADE LOG DETERMINISM
============================================================

Trade logging must append in actual execution order.

Do not sort trades afterward by:
- price;
- order ID;
- account.

If a triggered stop produces trades:
- their location in trade history must reflect deterministic trigger processing order.

============================================================
AI. PERFORMANCE — UNDERSTAND 3i BEFORE REFACTORING
============================================================

Read the exact Challenge 3i benchmark.

Record:
- warmup behavior;
- depth sizes;
- measured operation;
- timing ratio/threshold;
- whether it measures BookSide directly or HTTP/service path.

Do not optimize the wrong layer.

Do not change organizer threshold.

============================================================
AJ. SORTED ARRAY WARNING
============================================================

A design using:

binary-search index + Array.splice()

still shifts O(n) elements.

It remains linear mutation cost.

If the current 3i test detects linear growth, replace BookSide internals with a genuinely sublinear mutation structure.

Do not hide O(n) work in another helper called during insert.

============================================================
AK. RECOMMENDED INDEXED BINARY HEAP
============================================================

A strong dependency-free design is:

BookSide:
- private heap: RestingOrder[]
- private idToIndex: Map<string, number>
- comparator by price + sequence.

For bid side:
better if:
- higher price;
- if equal, smaller sequence.

For ask side:
better if:
- lower price;
- if equal, smaller sequence.

Operations:

insert:
- append;
- map id->index;
- siftUp;
- O(log n).

best:
- heap[0];
- O(1).

removeFront:
- remove index 0;
- swap last;
- repair heap;
- O(log n).

removeById:
- lookup index;
- swap/remove;
- repair up/down;
- O(log n).

same-priority quantity decrease:
- mutate quantity only;
- O(1).

price/sequence amendment:
- update ordering fields;
- repair heap;
- O(log n), or remove/reinsert.

snapshot:
- clone all orders;
- sort copy by canonical comparator;
- O(n log n) READ operation.

Performance challenge concerns insert mutation, so an expensive snapshot is acceptable unless current benchmark says otherwise.

============================================================
AL. INDEX MAP CORRECTNESS
============================================================

Every heap swap must update:

idToIndex

for both swapped orders.

After removal:
- deleted ID must be removed from map.

After reset:
- heap and map both empty.

A stale index map can corrupt:
- cancel;
- amend;
- fill;
- stateful model.

============================================================
AM. HEAP AND FIFO
============================================================

Heap comparator must be total and deterministic:

1. price priority;
2. sequence priority.

Since sequence is unique/monotonic, equal-price FIFO is preserved.

Do not compare quantity or filled.

Partial fill does not alter comparator fields and therefore stays at exact priority.

============================================================
AN. SNAPSHOT PUBLIC ORDERING
============================================================

Heap internal array order is NOT globally sorted.

Therefore public:

snapshot()

must return a sorted defensive copy using the canonical price-time comparator.

This preserves:
- API depth expectations;
- determinism comparisons;
- dashboard;
- tests.

Never expose heap internal layout as book order.

============================================================
AO. DEPTH WITH HEAP
============================================================

Depth should aggregate from canonical snapshot or equivalent deterministic traversal.

Output:
- best price first;
- exact remaining quantity.

Do not assume heap array after root is sorted.

============================================================
AP. PERFORMANCE AND AMENDMENT TOGETHER
============================================================

Indexed heap supports:

- cancel O(log n);
- priority-changing amend O(log n);
- quantity-decrease preserve priority O(1);
- best O(1).

This satisfies the Task 16 combination better than a sorted array.

Only implement this migration if the current performance test requires it.

If current BookSide already uses a suitable sublinear structure, preserve it.

============================================================
AQ. STATEFUL / RANDOMIZED MODEL CHECK
============================================================

The current challenge03 test file may contain a stateful/randomized reference-model test beyond the published 3e–3i prose.

Read it fully.

Do not special-case:
- generated order IDs;
- command counts;
- seeds;
- market names.

The engine must agree with the model through general rules:

- price-time;
- FIFO;
- STP;
- cancel semantics;
- quantity conservation;
- live-order registry consistency;
- no overfill;
- uncrossed book.

For a property failure record:
- seed;
- path;
- minimal command sequence/counterexample.

Fix the invariant, not the specific sequence.

============================================================
AR. STOP STATE AND STATEFUL MODEL
============================================================

If the stateful model does not include stop orders:
- do not force stop state into active-book snapshot.

If it does:
- follow exact model semantics.

Dormant stops generally must remain excluded from active bid/ask book until trigger.

============================================================
AS. PUBLIC BEST PRICE / DEPTH REGRESSION
============================================================

After any:

- fill;
- cancel;
- amend;
- stop trigger;
- triggered stop fill;

bestPrices() and depth() must reflect new active state immediately.

Empty side remains null as fixed in Task 7.

============================================================
AT. ACTIVE ORDER REGISTRY INVARIANT
============================================================

Registry must correspond to all and only live orders that the public lifecycle can act on.

For active resting:
- location points to market + side.

For dormant stop:
- location distinguishes stop storage if current API allows cancel/amend.

Remove registry entry when:
- fully filled;
- explicitly cancelled;
- STP cancelled;
- triggered market stop fully completes.

Update location when:
- dormant stop activates and rests;
- price amendment changes side location details if stored.

No stale registry.

============================================================
AU. ORDER ACCOUNT LOOKUP / RISK LIFECYCLE
============================================================

Preserve existing `accountForOrder` / reservation bookkeeping.

When an order finally ceases to be live:
- lifecycle cleanup should occur using existing hooks.

Do not implement Task 17 rule evaluation.

Do not leak reservations for:
- cancellation;
- STP;
- fully filled order;
- rejected amendment if existing code already handles it.

Only change what current architecture/tests require.

============================================================
AV. AMENDMENT PRIORITY SEQUENCE
============================================================

Use the same global/per-engine deterministic sequence source used for new orders.

When priority must be lost:
- allocate one new sequence at the moment of successful amend.

When priority is preserved:
- do not allocate a replacement priority sequence for the order.

Avoid consuming sequence numbers for rejected amendments if doing so would break replay equality under identical inputs. Follow current determinism tests.

============================================================
AW. STOP ACTIVATION PRIORITY SEQUENCE
============================================================

Keep original stop submission sequence for deciding which eligible stop triggers first.

For a stop-limit order that becomes active and may rest:
- inspect current test semantics for its active queue priority.

A reasonable deterministic exchange behavior is:
- trigger candidates ordered by original stop submission sequence;
- allocate active sequence when each activates, preserving trigger order.

If current organizer test expects original sequence to carry into the active book, follow the test.

Document the decision.

============================================================
AX. AVOID RECURSIVE STACK EXPLOSION
============================================================

A chain of triggered stops should be processed iteratively where possible.

Use:
- queue;
- loop;
- bounded by number of dormant stops/trades naturally.

Do not recursively nest thousands of placeOrder calls.

============================================================
AY. NO EVENT-LOOP YIELD INSIDE CRITICAL MATCHING MUTATION
============================================================

Do not add:

await Promise.resolve()
setTimeout()
sleep()

inside book mutation to "help concurrency".

That creates races rather than solving them.

Keep state transition synchronous inside the serialized critical section.

============================================================
AZ. EXACT BIGINT THROUGHOUT
============================================================

Use bigint for:

- order price;
- stop price;
- quantity;
- filled;
- trade quantity;
- performance structure comparisons.

Never compare bigint by subtraction cast to Number.

Comparator should use relational comparisons:

a.price < b.price
a.price > b.price

not:

Number(a.price - b.price)

============================================================
BA. EXPECTED TASK 16 FILE SCOPE
============================================================

Primary likely:

- src/domain/orderBook.ts
- src/domain/matching.ts
- src/services/matchingEngine.ts

Likely integration:

- src/controller/orderController.ts

Only if current project already separates helpers:
- relevant small matching/locking service file.

Create/update:

- docs/clearhouse-task-16-advanced-matching.md

Do NOT add tests.

Do NOT modify:
- routes unless exact amend/stop route defect requires it;
- package/config/migrations;
- database config.

============================================================
BB. KEEP API CHANGES MINIMAL
============================================================

Do not redesign endpoints.

Preserve current:
- create order;
- cancel;
- amend;
- best/depth routes.

Use existing orderType fields:

- limit
- market
- stop
- stop_limit

Use existing:
- stopPrice
- price
- timeInForce

Do not add a second stop API if the current route already supports it.

============================================================
BC. REQUIRED VERIFICATION — FOCUSED GROUPS
============================================================

After implementation run:

npm run typecheck

Then:

npm test challenge03.test.ts -t "Challenge 3e"

npm test challenge03.test.ts -t "Challenge 3f"

npm test challenge03.test.ts -t "Challenge 3g"

npm test challenge03.test.ts -t "Challenge 3h"

npm test challenge03.test.ts -t "Challenge 3i"

If current tests include a separately labelled 3j:

npm test challenge03.test.ts -t "Challenge 3j"

If no 3j label exists, do not claim that command passed; use the full Challenge 03 run to exercise additional model tests.

============================================================
BD. REQUIRED VERIFICATION — FULL MATCHING ENGINE
============================================================

Run:

npm test challenge03.test.ts

This is the primary completion gate for Task 16.

After Task 16, do not mark COMPLETE unless the entire current Challenge 03 suite passes, unless an explicitly identified prerequisite outside Challenge 03 genuinely blocks it.

============================================================
BE. REGRESSION TESTS
============================================================

Run:

npm test challenge04.test.ts
npm test challenge02.test.ts
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

Run:

git diff --check

Then:

npm test

Record remaining future Challenge 05+ failures honestly.

============================================================
BF. PERFORMANCE TEST DISCIPLINE
============================================================

When running 3i:

- do not have verbose debug logging inside insert/matching path;
- remove temporary profiling logs before final diff;
- do not cache a known benchmark answer;
- do not branch on test book depth.

If performance fails:
1. identify measured operation;
2. inspect asymptotic cost;
3. improve actual structure;
4. rerun.

Do not "optimize" by weakening snapshot correctness or cancellation.

============================================================
BG. DETERMINISM TEST DISCIPLINE
============================================================

If 3h fails:

compare:
- first divergent trade;
- sequence assignment;
- snapshot ordering;
- reset behavior;
- registry cleanup;
- stop trigger ordering;
- amendment priority;
- unordered collection iteration.

Do not sort trade history after the fact just to mask nondeterministic execution.

============================================================
BH. CONCURRENCY TEST DISCIPLINE
============================================================

If 3g fails:

find the operation linearization issue.

Do not:
- retry until preferred result;
- add random delay;
- add fixed sleeps.

The result must be one valid coherent serialization.

============================================================
BI. STATEFUL PROPERTY TEST DISCIPLINE
============================================================

If current model test fails:

capture:
- fast-check seed;
- path;
- minimal command sequence;
- engine state vs model state.

Fix:
- lifecycle;
- quantity;
- priority;
- registry;
- STP;
- cancel/amend semantics.

Do not modify test generator.

============================================================
BJ. TASK 16 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-16-advanced-matching.md

Include:

1. Starting commit.
2. Working branch task-16.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact current 3e–3i test counts.
6. Any additional stateful model test discovered.
7. Stop storage design.
8. Stop trigger conditions.
9. Stop market activation.
10. Stop-limit activation.
11. multiple-stop ordering.
12. cascading trigger handling.
13. stop registry/reset behavior.
14. amend API semantics.
15. quantity decrease priority preservation.
16. price-change priority loss.
17. quantity-increase priority loss.
18. invalid/not-found amendment handling.
19. filled quantity safety.
20. cancel/fill concurrency strategy.
21. amend/fill concurrency strategy.
22. determinism strategy.
23. reset determinism.
24. data structure before/after performance work.
25. insertion complexity.
26. remove/amend complexity.
27. snapshot ordering.
28. index-map correctness.
29. stateful model result/counterexample if any.
30. exact changed files.
31. typecheck.
32. 3e result.
33. 3f result.
34. 3g result.
35. 3h result.
36. 3i result.
37. full Challenge 03 result.
38. Challenge 04 regression.
39. Challenge 02 regression.
40. foundation/sanity.
41. full-suite result.
42. protected-file confirmation.
43. suggested commit.
44. master merge/push commands.
45. next Task 17: Pre-Trade Risk and Limits.

Do not include secrets.

============================================================
BK. FINAL DIFF REVIEW
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
git diff -- docs/clearhouse-task-16-advanced-matching.md

If any other production source changed:
- review it explicitly;
- justify it in the note.

Confirm:

- no existing test modified;
- no new test added;
- config unchanged;
- package files unchanged;
- .env/.gitignore unchanged;
- tsconfig/vitest unchanged;
- knexfile/migrations/seeds unchanged;
- no test detection;
- no hardcoded benchmark;
- no Number price/quantity conversion;
- Task 14/15 semantics preserved;
- no Task 17 risk expansion.

============================================================
BL. TASK 16 COMPLETION CRITERIA
============================================================

Task 16 is COMPLETE only when:

STOPS

[ ] dormant stop state separate from active book.
[ ] buy-stop trigger condition correct.
[ ] sell-stop trigger condition correct.
[ ] plain stop activates as market.
[ ] stop-limit activates as limit at its own price.
[ ] dormant stop cannot execute early.
[ ] one stop triggers once only.
[ ] multiple eligible stops fire in submission order.
[ ] cascading triggers deterministic.
[ ] stop state cleared by reset.

AMENDMENTS

[ ] decrease quantity preserves sequence.
[ ] decrease quantity preserves exact non-front position.
[ ] price change loses priority.
[ ] quantity increase loses priority.
[ ] new/lost-priority sequence deterministic.
[ ] not-found/filled amend returns 404.
[ ] cancelled order cannot be amended.
[ ] non-positive amendment rejected.
[ ] invalid amendment does not mutate book.
[ ] cumulative filled quantity remains valid.
[ ] no amend creates filled > quantity.

CONCURRENCY

[ ] cancel/fill race has one coherent result.
[ ] amend/fill race cannot double-count.
[ ] no half-applied state visible.
[ ] no stale registry after race.
[ ] no negative remaining.
[ ] per-market serialization/atomic sync transition valid.

DETERMINISM

[ ] reset clears all new Task 16 state.
[ ] same 10k operation sequence produces identical trades.
[ ] identical final book.
[ ] sequence assignment deterministic.
[ ] snapshot ordering deterministic.
[ ] stop ordering deterministic.

PERFORMANCE

[ ] exact current 3i benchmark understood.
[ ] insert mutation is not linear with book depth.
[ ] no Array.splice O(n) insertion remains if benchmark rejects it.
[ ] best remains efficient.
[ ] remove/cancel remains correct.
[ ] amendments remain correct.
[ ] public snapshot stays canonical.

FULL MATCHING

[ ] Task 14 groups still pass.
[ ] Task 15 group still passes.
[ ] 3e passes.
[ ] 3f passes.
[ ] 3g passes.
[ ] 3h passes.
[ ] 3i passes.
[ ] additional stateful/model checks pass.
[ ] entire challenge03.test.ts passes.
[ ] BigInt exactness preserved.
[ ] no existing tests modified.
[ ] no new tests added.
[ ] no config/package/migration changes.
[ ] Task 16 note created.
[ ] final Git target master.

If any Challenge 03 group remains failing:
- status = PARTIAL;
- identify exact failing group/test;
- include real root cause.

Do not claim matching-engine completion from only filtered groups.

============================================================
BM. FINAL CURSOR REPORT
============================================================

Return:

1. Task 16 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Stop storage/trigger strategy.
6. Stop-limit strategy.
7. multiple/cascading stop handling.
8. amendment priority rules implemented.
9. concurrency/linearization strategy.
10. deterministic sequence/reset strategy.
11. BookSide performance data structure.
12. insertion/remove/amend complexity.
13. stateful model result.
14. typecheck.
15. Challenge 3e result.
16. Challenge 3f result.
17. Challenge 3g result.
18. Challenge 3h result.
19. Challenge 3i result.
20. full Challenge 03 result.
21. Challenge 04 result.
22. Challenge 02 result.
23. foundation/sanity result.
24. full npm test result.
25. remaining future challenge failures.
26. confirmation protected files unchanged.
27. final diff summary.
28. reviewed Git commands targeting master.

Suggested commit:

feat: complete advanced matching engine

Do not automatically commit, merge, or push.
````

---

# Task 16 reference acceptance matrix

| Area | Required behavior |
|---|---|
| Buy stop | Triggers when last trade >= stop |
| Sell stop | Triggers when last trade <= stop |
| Plain stop | Activates as market |
| Stop-limit | Activates at its own limit price |
| Multiple stops | Original submission order |
| Dormant stops | Not active-book liquidity |
| Qty decrease amend | Preserve exact queue position |
| Price amend | Lose priority |
| Qty increase amend | Lose priority |
| Amend dead order | 404 |
| Amend <= 0 | Reject, no mutation |
| Cancel/fill race | One coherent outcome |
| Amend/fill race | No double counting |
| Determinism | Same 10k replay = same trades/book |
| Performance | Insert cost not linear with depth |
| Snapshot | Canonical price-time order |
| Arithmetic | BigInt |
| Stateful/model test | General invariant agreement |
| Full Challenge 03 | Pass |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 16

The official final branch is **`master`**.

Workflow:

**`master` → `task-16` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 16 branch

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
task-16
```

Official final branch:

```text
master
```

---

## 2. Final Task 16 verification

```powershell
npm run typecheck

npm test challenge03.test.ts -t "Challenge 3e"

npm test challenge03.test.ts -t "Challenge 3f"

npm test challenge03.test.ts -t "Challenge 3g"

npm test challenge03.test.ts -t "Challenge 3h"

npm test challenge03.test.ts -t "Challenge 3i"

npm test challenge03.test.ts
```

If the current test file includes a named 3j:

```powershell
npm test challenge03.test.ts -t "Challenge 3j"
```

Then regressions:

```powershell
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

---

## 3. Review Task 16 changes

```powershell
git status --short
git diff --stat

git diff -- src/domain/orderBook.ts
git diff -- src/domain/matching.ts
git diff -- src/services/matchingEngine.ts
git diff -- src/controller/orderController.ts
git diff -- docs/clearhouse-task-16-advanced-matching.md
```

Review any additional production file individually.

Confirm organizer files remain unchanged.

---

## 4. Stage only Task 16 files

Expected:

```powershell
git add -- src/domain/orderBook.ts
git add -- src/domain/matching.ts
git add -- src/services/matchingEngine.ts
git add -- docs/clearhouse-task-16-advanced-matching.md
```

Only if actually changed and required:

```powershell
git add -- src/controller/orderController.ts
```

If another legitimate Task 16 production file changed:

```powershell
git add -- <actual-file-path>
```

If files contain unrelated work:

```powershell
git add -p -- <file-path>
```

Avoid:

```text
git add .
```

---

## 5. Review staged changes

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached
```

Stop if staged content unexpectedly contains:

- tests/
- config/
- package files
- migrations
- seeds
- .env
- .gitignore
- DB config
- scoring/grading files.

---

## 6. Commit Task 16

```powershell
git commit -m "feat: complete advanced matching engine"
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

Inspect:

```powershell
git log --oneline --left-right master...origin/master
```

If local master is simply behind:

```powershell
git pull --ff-only origin master
```

Do not reset valid history.

---

## 8. Merge Task 16

Prefer:

```powershell
git merge --ff-only task-16
```

If fast-forward cannot be used:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-16
```

Resolve carefully.

Do not force-push or hard-reset.

---

## 9. Re-test merged master

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
npm test challenge03.test.ts
npm test challenge04.test.ts
git diff --check
git status -sb
```

This is the important post-merge gate because Task 16 completes Challenge 03.

---

## 10. Push official final branch

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

Local HEAD and remote `refs/heads/master` must match.

---

# If push is rejected

Do not force.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If a rebase is appropriate for your local-only Task 16 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge03.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts deliberately.

---

# Fast Task 16 checklist

- [ ] branch = task-16
- [ ] final branch = master
- [ ] Task 14/15 regressions pass before advanced work
- [ ] challenge03 fully read
- [ ] stop state separate
- [ ] buy/sell trigger direction correct
- [ ] plain stop -> market
- [ ] stop-limit -> own limit price
- [ ] multiple stops fire submission order
- [ ] cascading stops deterministic
- [ ] stop state reset
- [ ] quantity decrease preserves priority
- [ ] non-front decrease keeps exact place
- [ ] price change loses priority
- [ ] quantity increase loses priority
- [ ] invalid/dead amend safe
- [ ] filled <= amended quantity invariant
- [ ] cancel/fill race coherent
- [ ] amend/fill race coherent
- [ ] no async yield in mutation critical section
- [ ] deterministic 10k replay
- [ ] complete reset determinism
- [ ] performance test inspected
- [ ] genuinely sublinear insert structure if needed
- [ ] indexed structure map consistency
- [ ] canonical sorted snapshot
- [ ] stateful/randomized model passes
- [ ] exact BigInt
- [ ] 3e passes
- [ ] 3f passes
- [ ] 3g passes
- [ ] 3h passes
- [ ] 3i passes
- [ ] entire challenge03 passes
- [ ] Challenge04 regression passes
- [ ] prior foundation regressions recorded
- [ ] full suite recorded
- [ ] no tests modified
- [ ] no new tests added
- [ ] config/package/migrations unchanged
- [ ] Task 16 note created
- [ ] committed on task-16
- [ ] merged into master
- [ ] pushed origin master
- [ ] remote master verified

**Next planned task:** Task 17 — Challenge 05: Pre-Trade Risk and Limits.
