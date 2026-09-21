# ClearHouse — Complete Enhanced Cursor Prompt for Task 30

**Task:** Challenge 15 — Complex Order Types / Strategy State Machines  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-30`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 30 purpose

Task 30 implements the full **Challenge 15 — Complex Order Types** challenge.

This challenge is about deterministic event-driven **strategy state machines** that create, resize, cancel, trigger, and replenish child orders.

The required strategy families are:

- **OCO — One Cancels the Other**
- **Bracket orders**
- **Iceberg orders**
- **Trailing stops**

The state machines must also provide:

- fill-event redelivery idempotency;
- deterministic action emission from identical event history;
- idempotent parent cancellation;
- correct child cancellation/disarming;
- exact fill accounting;
- strict `RangeError` validation for impossible parent orders and impossible fills.

This is **not** the same scope as earlier Task 16 / Challenge 03 advanced matching.

Earlier Challenge 03 work dealt with exchange-level order-book behavior such as:

- limit/market/stop/stop-limit execution;
- amendments;
- race conditions;
- priority;
- matching.

Task 30 / Challenge 15 instead manages **parent strategy state** and emits child-order actions in response to events.

Do not rewrite the core matching engine unless `tests/challenge15.test.ts` explicitly requires a tiny integration fix.

The current CodeCommit checkout and `tests/challenge15.test.ts` are authoritative.

---

# Published Challenge 15 contract — 200 points

## 15a — OCO — 35 pts

### 15a-1 — 25 pts

A triggered OCO stop must:

- cancel the paired live limit child;
- sell exactly the quantity that remains unfilled;
- behave correctly for arbitrary fill and price history.

Important invariant:

```text
remaining protected quantity
=
original parent quantity
-
quantity already filled by the paired take-profit/limit child
-
quantity already executed by any prior stop action, if such state can exist under the contract
```

Use the exact current parent/child model and organizer oracle.

The stop must not sell the original parent quantity after the paired limit has already partially filled.

### 15a-2 — 10 pts

After a partial fill of the OCO take-profit/limit child:

- the armed stop must represent only the smaller remaining protected quantity;
- when the stop eventually triggers, it fires **once**;
- redelivered price/fill events must not cause a second stop child/action.

Do not create multiple simultaneously armed stops for one remaining OCO quantity unless the current test explicitly models that.

---

## 15b — Bracket orders — 45 pts

### 15b-1 — 45 pts

Bracket exits must always cover **exactly the cumulative filled quantity of the entry order**.

As the entry fills incrementally:

- exits grow with cumulative entry fill;
- exits must never cover unfilled entry quantity;
- exit coverage must not lag behind filled entry quantity after each processed fill;
- duplicate fill delivery must not enlarge exits twice.

When the stop-loss side triggers:

- it must protect/exit the currently filled exposure according to the exact test;
- it must also cancel the **unfilled remainder of the entry order**.

Read the exact action model:
the strategy may emit child create/amend/cancel actions rather than mutating an actual book.

Do not guess.

---

## 15c — Iceberg orders — 40 pts

### 15c-1 — 40 pts

An iceberg must expose only one live visible clip at a time.

Required invariants:

- visible child quantity never exceeds the configured display/clip size;
- total emitted quantity across all clips never exceeds the parent total;
- a replacement clip is emitted only after the current visible clip is fully filled;
- partial fill of a clip does **not** replenish a second overlapping clip;
- replenishment stops permanently after parent cancellation;
- the replacement clips keep the **original sequence / priority token** required by the organizer.

Do not allocate a fresh sequence on each replenishment if Challenge 15 expects the original sequence to remain.

---

## 15d — Trailing stops — 35 pts

### 15d-1 — 35 pts

A trailing stop must:

- maintain the relevant favorable-price watermark;
- ratchet the stop only in the favorable direction;
- never loosen/move backward when price moves against the position;
- trigger at the exact organizer-defined boundary;
- fire exactly once.

The organizer compares behavior against an independent oracle.

Read the exact fields and side semantics before coding.

For a sell trailing stop protecting a long position, the high watermark commonly rises and the stop rises with it.

For a buy trailing stop protecting a short position, the low watermark commonly falls and the stop falls with it.

These are conceptual examples only.

Follow the current Challenge 15 test.

---

## 15e — Redelivery, determinism and cancellation — 35 pts

### 15e-1 — 20 pts

A redelivered fill changes nothing.

The same event history must always yield the same emitted actions.

Requirements include:

- stable fill/event identity;
- no double-counted fills;
- no duplicate child create/amend/cancel action;
- no duplicate stop trigger;
- no duplicate iceberg replenishment;
- deterministic action ordering;
- no `Date.now()` / random IDs if the organizer expects deterministic child identities.

### 15e-2 — 15 pts

Cancelling a strategy parent must:

- cancel its currently live limit children;
- disarm all pending stops;
- stop future iceberg replenishment;
- stop future bracket/OCO child creation or resizing;
- be idempotent.

Calling parent cancellation twice must not emit a second set of cancellation actions or throw unless the current test explicitly requires another exact behavior.

After cancellation, later price/fill events must not resurrect the strategy.

---

## 15f — Input validation — 10 pts

### 15f-1 — 10 pts

Impossible strategy orders and impossible fills must throw `RangeError`.

Read every invalid fixture in `tests/challenge15.test.ts`.

Do not:

- silently clamp quantities;
- accept negative/zero impossible parameters;
- silently ignore overfills;
- convert malformed financial values through `Number`;
- substitute a generic `Error` where `RangeError` is required.

Validation must occur before strategy state is mutated.

---

# Challenge 15 score map

```text
15a = 35
15b = 45
15c = 40
15d = 35
15e = 35
15f = 10
----------------
Total = 200
```

These are available points only, not an earned-score claim.

---

# Core Task 30 design principles

## 1. Parent state is the source of strategy truth

Each strategy should maintain exactly the state required to decide future actions:

- parent status;
- total quantity;
- cumulative fills;
- child identities;
- child live/cancelled/triggered state;
- stop armed/fired state;
- iceberg current clip and remaining hidden quantity;
- trailing watermark / current trigger level;
- processed fill/event identities.

Do not derive strategy truth from incidental caller array order.

## 2. State transition first, action emission second

For one event:

1. validate the event;
2. detect redelivery/idempotency;
3. compute the deterministic next state;
4. compute exact actions caused by that transition;
5. record the event as processed;
6. return actions/state according to the current public API.

If an event is a duplicate:
return the exact organizer-required replay behavior without reapplying the transition.

## 3. Never double count a fill

A fill has a stable identity defined by the organizer.

The first processing may:

- increase entry/child cumulative filled quantity;
- resize exits;
- replenish an iceberg;
- shrink OCO protection.

A redelivery of the same fill must do none of those again.

Do not dedupe only by `(quantity, price)`.

Two different executions can have identical economics.

## 4. Quantities use exact integer arithmetic

Use the exact current quantity type, normally `bigint`.

Never:

- `Number(quantity)`;
- `parseFloat(quantity)`;
- floating arithmetic.

No child emitted quantity may be negative.

No cumulative fill may exceed the relevant parent/child total.

## 5. Child identities must be deterministic

Challenge 15e requires the same event history to yield the same actions.

If the current starter expects generated child IDs:

- use an organizer-compatible deterministic ID derivation;
- do not use `crypto.randomUUID()` / random values unless test explicitly allows opaque nondeterminism;
- do not use `Date.now()`.

Read the tests/source before choosing.

## 6. Parent cancellation is terminal unless test says otherwise

Once a strategy parent is cancelled:

- stop triggers are disarmed;
- no new live child may appear;
- iceberg clips do not replenish;
- bracket exits do not expand;
- OCO stop does not fire;
- repeated cancel is a no-op/idempotent result.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 30

Copy the complete block below into Cursor Agent mode.

````text
Act as my senior TypeScript trading-strategy state-machine engineer, exact-arithmetic reviewer, event-determinism engineer, and matching-integration reviewer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 30 ONLY: implement Challenge 15 — Complex Order Types / Strategy State Machines — completely and correctly.

Preserve all completed Tasks 1–29.

Your implementation must provide:
- OCO parent/child behavior;
- bracket order state management;
- iceberg clip replenishment;
- trailing stops;
- fill/event redelivery idempotency;
- deterministic action generation;
- parent cancellation;
- RangeError validation.

Do not automatically rewrite the core order book/matching engine. Challenge 15 is primarily strategy state machines unless the current organizer tests explicitly require integration.

Do not stop at a plan. Inspect, implement, run official tests/regressions, write the Task 30 engineering note, and show reviewed Git commands.

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

task-30

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–29;
- work on task-30;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT TASK 30 SCOPE
============================================================

IMPLEMENT:

Challenge 15a:
- OCO paired children;
- remaining-quantity stop protection;
- stop trigger cancels paired limit;
- stop fires once.

Challenge 15b:
- bracket entry-fill tracking;
- exit coverage exactly equals cumulative entry fill;
- stop-loss cancels remaining unfilled entry.

Challenge 15c:
- iceberg one-live-clip invariant;
- clip replenishment only after full clip fill;
- total cap;
- original sequence preserved.

Challenge 15d:
- trailing-stop favorable watermark;
- one-direction ratchet;
- exact trigger;
- fires once.

Challenge 15e:
- redelivered fills no-op;
- deterministic actions;
- parent cancellation;
- parent cancellation idempotency;
- cancellation permanently disarms strategy.

Challenge 15f:
- RangeError validation.

PRESERVE:
- Challenge 03 matching engine;
- Task 15 execution policies/STP;
- Task 16 advanced matching races/stop order behavior;
- Challenge 05 risk;
- Challenge 08 market-data time semantics;
- Challenge 13 closure;
- Challenge 16 fee engine.

DO NOT IMPLEMENT:
- Task 31 WebSocket server;
- Task 32 live dashboard client;
- Task 33 final integration;
- speculative strategy HTTP APIs unless challenge15 explicitly requires them.

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
- weaken property tests;
- freeze randomized sequences;
- increase test timeout;
- skip challenge groups;
- reduce fill/price histories.

Do NOT add production branches checking:
- NODE_ENV === "test";
- VITEST;
- challenge15 file name;
- known strategy IDs;
- known fill IDs;
- visible exact price paths;
- visible quantities.

Do NOT use floating point for:
- prices;
- quantities;
- fill totals;
- offsets if the current model represents them as exact integer units.

Use current exact types.

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

Verify Task 29 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-29 exists:

git log --oneline --decorate --max-count=10 task-29

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-30

If task-30 already exists:

git branch --list task-30
git log --oneline --decorate --max-count=10 task-30

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

- docs/clearhouse-task-14-basic-matching.md
- docs/clearhouse-task-15-execution-policies.md
- docs/clearhouse-task-16-advanced-matching.md
- docs/clearhouse-task-17-risk.md
- docs/clearhouse-task-27-market-data-time.md
- docs/clearhouse-task-28-fee-rebate-engine.md
- docs/clearhouse-task-29-netting.md

Verify actual source.

Before Task 30 edits run:

npm run typecheck
npm test challenge03.test.ts

Record pre-existing failures.

Challenge 15 must not regress the existing core matching engine.

============================================================
F. READ CHALLENGE 15 COMPLETELY
============================================================

Read:

tests/challenge15.test.ts

from first line to last line.

Read:

config/scores.ts

READ ONLY.

Build an exact contract matrix:

test
| points
| imported class/function
| parent input type
| event/fill type
| action/result type
| required state transition
| idempotency identity
| exact validation
| current defect

Record:
- exact Challenge 15 test count;
- exact public exports;
- exact strategy constructor/factory APIs;
- parent IDs;
- child IDs;
- child action types;
- fill event fields;
- price event fields;
- quantity type;
- price type;
- sequence type;
- cancellation method/result;
- deterministic ID rules;
- exact trigger boundaries;
- exact invalid cases;
- whether tests call strategy domain directly or through matching.

DO NOT GUESS.

============================================================
G. DISCOVER CURRENT STRATEGY SOURCE
============================================================

Search:

rg -n "OCO|oco|bracket|iceberg|trailing|strategy|parentOrder|childOrder|replenish|watermark|takeProfit|stopLoss|displayQuantity|clip|processedFill" src tests

PowerShell fallback:

Get-ChildItem -Recurse src,tests -File |
  Select-String -Pattern "OCO|oco|bracket|iceberg|trailing|strategy|parentOrder|childOrder|replenish|watermark|takeProfit|stopLoss|displayQuantity|clip|processedFill"

Read every actual Challenge 15 stub/source file completely.

Potential examples only:
- src/domain/strategies.ts
- src/domain/complexOrders.ts
- src/services/strategyEngine.ts

Use actual paths.

Also inspect current:
- IncomingOrder / RestingOrder / Trade / Fill types;
- matching action conventions;
- order cancellation APIs.

============================================================
H. RUN TASK 30 BASELINE
============================================================

Run:

npm test challenge15.test.ts

If group labels exist:

npm test challenge15.test.ts -t "Challenge 15a"
npm test challenge15.test.ts -t "Challenge 15b"
npm test challenge15.test.ts -t "Challenge 15c"
npm test challenge15.test.ts -t "Challenge 15d"
npm test challenge15.test.ts -t "Challenge 15e"
npm test challenge15.test.ts -t "Challenge 15f"

Use actual labels.

Record:
- exact executed count;
- pass/fail;
- property/random test seed/path;
- minimal failing history;
- first real state-machine defect.

Filtered-out tests are NOT passed.

============================================================
I. IDENTIFY THE ACTION MODEL
============================================================

Before implementing any state machine, identify what the strategy returns/emits.

Possible action concepts may include:
- place child order;
- amend child;
- cancel child;
- trigger market child;
- no-op.

Do NOT invent action names.

Read exact interfaces.

Preserve exact:
- action `type`;
- child ID field;
- parent ID/ref;
- side;
- quantity;
- price/stop price;
- sequence;
- order type;
- time-in-force;
- ordering of multiple actions.

Challenge 15e may deep-compare actions.

============================================================
J. IDENTIFY EVENT TYPES
============================================================

Read current API.

Possible event concepts:
- fill event;
- price/tick event;
- parent cancel event.

Determine exact:
- event ID / fill ID;
- order/child ID;
- filled quantity;
- execution price;
- market price;
- event sequence/timestamp if any.

Do not infer redelivery identity from payload if a stable ID exists.

============================================================
K. STATE MACHINE PURITY / DETERMINISM
============================================================

Given:
- same initial strategy;
- same ordered event history;

the emitted action history must be exactly identical.

Do not use:
- Date.now();
- Math.random();
- randomUUID();
- nondeterministic Set/Map insertion behavior;
- global sequence counter unless current contract explicitly injects it.

Use deterministic internal IDs/sequence as required by test.

============================================================
L. PROCESSED EVENT / FILL IDENTITY
============================================================

Challenge 15e-1 requires redelivery idempotency.

Maintain a stable processed-event/fill identity set/map according to exact test.

Do not dedupe by:
- quantity;
- price;
- child ID only

if distinct fills can exist for the same child.

Two fills with identical quantity/price but distinct IDs must both count.

============================================================
M. DUPLICATE EVENT HANDLING ORDER
============================================================

For a redelivered event:

duplicate detection should happen BEFORE:
- cumulative fill mutation;
- exit resizing;
- iceberg replenishment;
- trailing watermark update if the event itself is duplicate and test expects full no-op;
- child cancellation;
- stop trigger;
- action emission.

Return exact expected no-op/original result.

Read test for whether duplicate price ticks also have IDs/idempotency requirements or only fills.

Do not over-dedupe price observations if repeated equal prices are legitimate new events without identity.

============================================================
N. QUANTITY EXACTNESS
============================================================

Use exact quantity type.

If bigint:
all arithmetic uses bigint.

Never:
- Number(quantity);
- Math.min on bigint;
- parseFloat.

Use exact comparisons.

Every cumulative fill must satisfy:

0 <= filled <= relevant total

unless organizer test models another explicit behavior.

============================================================
O. PRICE EXACTNESS
============================================================

Use exact price/offset types.

Do not convert to floating point for trailing-stop math.

If trailing offset is an absolute integer:
use exact addition/subtraction.

If it is another representation:
read test.

Do not assume percentage trailing stops.

============================================================
P. PARENT LIFECYCLE
============================================================

Read exact statuses, but conceptually track:

- active;
- cancelled;
- completed/terminal.

After terminal/cancelled:
no future event may create new live children or trigger a stop.

If completed automatically after all quantity exits:
follow organizer contract.

Do not resurrect.

============================================================
Q. CHILD LIFECYCLE
============================================================

Track exactly enough state to know each child is:

- not created;
- live;
- partially filled;
- filled;
- cancelled;
- triggered/replaced

according to current model.

Do not emit a cancel for a child already:
- filled;
- cancelled;
- never created

unless test expects an idempotent cancel action, which is unlikely.

Read exact assertions.

============================================================
R. OCO — IDENTIFY PAIRED CHILDREN
============================================================

Read OCO parent input.

Determine:
- parent total quantity;
- side;
- take-profit/limit price;
- stop trigger;
- child IDs;
- whether limit child is live immediately;
- whether stop is an armed logical child/action or actual resting stop order.

Do not guess.

============================================================
S. OCO LIMIT PARTIAL FILLS
============================================================

Maintain exact cumulative filled quantity of the paired limit child.

Remaining protected quantity:

remaining =
parent quantity - cumulative limit fill

or exact organizer formula if stop fills can coexist.

After partial limit fill:
- stop protection shrinks to remaining;
- do not trigger for already exited quantity.

If the current action model expects an explicit stop-amend action on partial fill:
emit exactly that.

If stop is only internal state until trigger:
update internal remaining only.

Read test.

============================================================
T. OCO LIMIT FULL FILL
============================================================

If take-profit/limit child fills the full parent quantity:

- remaining = 0;
- stop must be disarmed/cancelled;
- later stop-trigger price must emit nothing.

Do not emit zero-quantity stop child.

If current test expects cancel action for armed stop:
emit it once.

============================================================
U. OCO STOP TRIGGER — 15a-1
============================================================

When stop condition becomes true:

1. verify parent active;
2. verify stop armed/not fired;
3. compute exact remaining protected quantity;
4. if remaining <= 0:
   - disarm;
   - no sell child;
5. cancel paired live limit child if still live;
6. emit exact stop/market child for remaining quantity;
7. mark stop fired/disarmed;
8. mark appropriate paired child state so future fills/events cannot recreate it.

The stop fires exactly once.

Do not sell original parent quantity after partial limit fills.

============================================================
V. OCO ACTION ORDER
============================================================

If stop trigger produces multiple actions such as:

- cancel limit child;
- place stop-exit child

read exact expected action order.

Challenge 15e deterministic deep comparison may depend on it.

Use one consistent organizer-compatible ordering.

============================================================
W. OCO RACE-LIKE HISTORIES
============================================================

Challenge 15 says arbitrary fill and price history.

Reason about:
- partial TP fill then stop;
- multiple partial TP fills then stop;
- full TP fill then stop price;
- stop price then duplicate price event;
- duplicate partial fill before stop;
- parent cancel before stop.

Do not overfill.

============================================================
X. BRACKET — IDENTIFY ENTRY AND EXITS
============================================================

Read bracket parent input.

Determine:
- entry child type/price;
- take-profit exit;
- stop-loss exit;
- entry total quantity;
- whether exits are created immediately at zero qty, or only after fills;
- whether resizing uses amend actions or cancel+replace.

Do not guess.

============================================================
Y. BRACKET CUMULATIVE ENTRY FILL
============================================================

Track unique entry fills.

For every first-time entry fill:

cumulativeEntryFilled += fill.quantity

Validate:

cumulativeEntryFilled <= entry total

Then ensure live exit coverage equals exactly cumulative entry filled according to test.

Do not:
- pre-cover unfilled entry quantity;
- double count duplicate fill.

============================================================
Z. BRACKET EXIT COVERAGE — 15b
============================================================

After each new entry fill:

take-profit protected quantity
and
stop-loss protected quantity

must represent exactly the currently filled entry exposure, according to current strategy semantics.

If exits already exist:
- amend/resize them deterministically.

If no exits yet:
- create them when first required.

Do not create multiple overlapping exits whose total exceeds exposure unless organizer action model explicitly expects replacement workflow with cancellation.

============================================================
AA. BRACKET ENTRY PARTIAL FILLS
============================================================

Example conceptually:

entry total = 100
fill1 = 30
fill2 = 20

After fill1:
exits protect 30.

After fill2:
exits protect 50.

Not:
- 20;
- 80;
- 100.

Use cumulative unique fills.

============================================================
AB. BRACKET EXIT FILLS
============================================================

Read test.

If take-profit or stop child itself fills partially/full:
determine how sibling coverage/state changes.

Do not invent symmetrical OCO logic unless the test defines it.

Bracket often behaves like entry + OCO exits, but use current organizer model.

============================================================
AC. BRACKET STOP-LOSS TRIGGER
============================================================

When bracket stop-loss triggers:

- it must exit exactly the currently exposed filled entry quantity remaining according to test;
- it must cancel the unfilled remainder of the entry order;
- it must prevent future entry fills/exit growth after that cancellation.

If take-profit has already reduced exposure:
read organizer state model and subtract correctly if required.

Do not oversell.

============================================================
AD. BRACKET CANCEL UNFILLED ENTRY
============================================================

Published requirement explicitly states:

stop-loss also cancels the unfilled entry.

Therefore if entry quantity 100 but only 40 filled:
stop-loss transition must ensure remaining 60 cannot later fill.

Emit exact cancel action for live entry child if the action model requires.

Do not cancel an already fully filled entry.

============================================================
AE. BRACKET DUPLICATE ENTRY FILL
============================================================

Redelivered entry fill:
- cumulative fill unchanged;
- exit quantities unchanged;
- no new resize/place actions.

Store fill ID before returning.

============================================================
AF. BRACKET DETERMINISTIC CHILD IDS
============================================================

If exit children are generated by strategy:
same parent/event history must produce same child IDs.

Do not use random UUID.

Use existing child-ID helper if deterministic.

Read current starter.

============================================================
AG. ICEBERG — IDENTIFY PARENT SETTINGS
============================================================

Read exact parent fields:
- total quantity;
- display/clip quantity;
- price;
- side;
- parent/original sequence;
- parent/child IDs.

Do not guess names.

============================================================
AH. ICEBERG INITIAL CLIP
============================================================

On creation/initialization according to test:

visible quantity =
min(displayQuantity, totalRemaining)

Only one clip is live.

Do not expose hidden remaining quantity.

If strategy constructor returns an initial action:
emit exact action.

If caller requests `start()`:
follow API.

============================================================
AI. ICEBERG PARTIAL CLIP FILL
============================================================

If current clip quantity is 20 and receives a fill of 7:

- current clip has 13 remaining;
- do NOT create a replacement clip;
- hidden quantity remains hidden;
- only one live clip remains.

A clip replenishes **only when fully filled**.

============================================================
AJ. ICEBERG FULL CLIP FILL
============================================================

When current clip becomes fully filled:

1. update total cumulative filled;
2. mark clip no longer live;
3. if parent active and total remaining > 0:
   - create exactly one new clip;
   - quantity = min(displayQuantity, remaining total);
   - use exact original sequence required by test;
4. if no remaining:
   - complete parent;
   - emit no clip.

Do not exceed parent total.

============================================================
AK. ICEBERG ORIGINAL SEQUENCE — 15c
============================================================

All replenished clips must preserve the original sequence/priority token according to the published contract.

Do not:
- increment sequence per clip;
- use global matching sequence generator;
- allocate Date.now.

Read exact action field.

If child ID changes but sequence stays same:
follow test.

============================================================
AL. ICEBERG TOTAL CAP
============================================================

Track cumulative executed/emitted quantities carefully.

The sum of actual fills cannot exceed parent total.

The sum of clip capacities over time can equal total but must never expose more than total.

Final clip may be smaller than display quantity.

Example conceptually:

total 45
display 20

clips:
20, 20, 5

not:
20, 20, 20.

============================================================
AM. ICEBERG DUPLICATE FILL
============================================================

Redelivery of a full-clip fill must not cause:
- second replenishment;
- extra visible child;
- parent total overflow.

Fill identity must short-circuit before replenishment.

============================================================
AN. ICEBERG PARENT CANCEL
============================================================

Parent cancel:
- cancel current live clip if any;
- mark parent cancelled;
- no future clip replenishment.

If a fill event is delivered later:
follow exact organizer invalid/ignore semantics.

Do not create a replacement clip after cancel.

============================================================
AO. TRAILING STOP — IDENTIFY SIDE SEMANTICS
============================================================

Read exact parent type.

Determine:
- side/direction;
- initial reference price or first price-event rule;
- trailing amount/offset representation;
- trigger comparison boundary;
- emitted stop child/action.

Do not assume.

============================================================
AP. TRAILING WATERMARK
============================================================

Maintain the favorable extreme only.

Typical conceptual behavior:

SELL trailing stop:
- watermark = max(previousWatermark, marketPrice)
- stop = watermark - offset

BUY trailing stop:
- watermark = min(previousWatermark, marketPrice)
- stop = watermark + offset

Use exact organizer formula.

Do not update watermark in the unfavorable direction.

============================================================
AQ. TRAILING RATC HET MONOTONICITY
============================================================

The stop level must move only in the protective/favorable direction.

For a sell trailing stop:
new stop should never be below the prior stop.

For a buy trailing stop:
new stop should never be above the prior stop.

These are conceptual directions; verify test.

============================================================
AR. TRAILING TRIGGER BOUNDARY
============================================================

Read exact test:

For a sell stop, trigger may be:
price <= stop

For a buy stop:
price >= stop

But do not guess `<` vs `<=`.

Boundary equality is usually tested.

Use exact organizer comparison.

============================================================
AS. TRAILING FIRST PRICE EVENT
============================================================

Determine how initial watermark is established.

Possibilities:
- supplied initial/reference price;
- first price tick;
- parent creation price.

Do not invent.

An uninitialized watermark must not trigger from an arbitrary default zero.

============================================================
AT. TRAILING FIRES ONCE
============================================================

On first trigger:
- emit exact child/action;
- mark fired/disarmed/terminal as required.

Later prices:
- no additional trigger actions.

Duplicate trigger event:
- no second action.

Parent cancellation before trigger:
- no action.

============================================================
AU. TRAILING AFTER TRIGGER
============================================================

Do not continue ratcheting a fired stop unless current test wants historical state updates, which is unlikely.

Terminal state should be clear.

============================================================
AV. TRAILING OFFSET VALIDATION
============================================================

Read 15f.

Likely impossible:
- zero offset;
- negative offset;
- invalid exact integer;
- impossible initial stop relation.

Only enforce actual organizer rules.

Throw RangeError.

============================================================
AW. REDelivery DETERMINISM — 15e-1
============================================================

Challenge 15e is cross-strategy.

For every first-time fill:
- update exactly once.

For redelivery:
- state identical;
- emitted actions identical to organizer's expected duplicate behavior, usually no new actions.

Do not return a newly regenerated child action merely because its ID is deterministic; that is still a duplicate action.

============================================================
AX. ACTION HISTORY DETERMINISM
============================================================

Same parent + same event sequence must generate same ordered action list.

Ensure deterministic:
- child IDs;
- action types;
- quantities;
- price fields;
- action order;
- sequence fields.

No random IDs.

No system time.

No locale.

============================================================
AY. EVENT ORDER
============================================================

Read test.

Challenge 15e says same event history, not arbitrary reordering.

Do not automatically sort event histories by ID/time if the state machine is supposed to process them in delivery order.

The supplied event order itself may be meaningful.

Determinism means same ordered history -> same result.

Do not confuse with Task 26 replay sorting.

============================================================
AZ. PARENT CANCELLATION — 15e-2
============================================================

Implement one central terminal cancellation path if architecture allows.

On first cancel:
- mark parent cancelled;
- identify currently live limit children;
- emit cancel actions for those exact live children;
- disarm logical stops;
- disable iceberg replenishment;
- disable bracket/OCO future action generation.

Return actions in deterministic order.

============================================================
BA. CANCELLATION DOES NOT CANCEL DEAD CHILDREN
============================================================

Do not emit duplicate cancel actions for:
- already filled child;
- already cancelled child;
- never-created child.

Only current live limit children according to exact test.

Read whether armed stop is represented by a cancellable child action; if so, include as organizer expects.

============================================================
BB. CANCELLATION IDEMPOTENCY
============================================================

Second parent cancel:
- no state change;
- no duplicate cancel actions;
- no error

unless test explicitly expects another result.

Use exact API.

============================================================
BC. POST-CANCEL EVENTS
============================================================

After parent cancellation:

price/fill events must not:
- trigger stops;
- resize bracket exits;
- create iceberg clips;
- replenish;
- place new children.

If an impossible fill arrives for a child that was cancelled:
read 15f / test semantics.

It may:
- throw RangeError;
- ignore as stale.

Do not guess.

============================================================
BD. CHILD FILL VALIDATION — 15f
============================================================

Read every impossible-fill case.

Potential invalid cases MAY include:
- unknown child/order ID;
- zero/negative fill;
- fill > remaining child quantity;
- fill after terminal child;
- duplicate ID with conflicting payload;
- fill on wrong parent;
- impossible price.

Examples only.

Follow exact test.

Throw RangeError where required.

Validation before state mutation.

============================================================
BE. PARENT INPUT VALIDATION — 15f
============================================================

Read every impossible parent-order case for all strategy types.

Potential categories MAY include:

OCO:
- quantity <= 0;
- stop/limit relation impossible;
- blank ID.

Bracket:
- invalid entry/TP/SL relation;
- quantity <= 0.

Iceberg:
- displayQuantity <= 0;
- total <= 0;
- display > total if organizer treats invalid rather than clamping.

Trailing:
- offset <= 0;
- invalid initial price.

These are conceptual examples only.

Do not enforce untested trading opinions.

============================================================
BF. RANGEERROR EXACT TYPE
============================================================

Throw `RangeError` for organizer-defined invalid inputs.

Do not:
- return error object;
- use generic Error;
- silently ignore.

Do not catch your own logic bugs and convert them all to RangeError.

============================================================
BG. DUPLICATE FILL ID WITH CONFLICTING PAYLOAD
============================================================

Read test.

If same fill ID arrives with different quantity/child:
- may throw RangeError;
- may replay original.

Follow exact contract.

A robust design can store a fingerprint with processed fill result/state if test requires conflict detection.

Do not add expensive serialization unless necessary.

============================================================
BH. STATE MUTATION SAFETY
============================================================

For invalid new events:
state must remain unchanged.

Perform:
- identity/conflict check;
- validation;

before cumulative mutation.

Avoid partially updating one child then throwing.

============================================================
BI. INTERNAL INVARIANTS
============================================================

Add clear internal assertions/guards where helpful, but do not over-throw on valid organizer cases.

Useful invariants:

- cumulativeFilled >= 0
- cumulativeFilled <= parent/child total
- remaining >= 0
- one live iceberg clip max
- fired stop cannot be armed
- cancelled parent cannot be active
- no child both live and cancelled
- exit coverage does not exceed exposure.

Use RangeError only where public invalid input requires; internal impossible-state bugs can use Error if needed.

============================================================
BJ. ONE LIVE ICEBERG CLIP
============================================================

At any point count live iceberg clips.

Must be <= 1.

Do not create replacement until full-fill transition marks old clip dead.

No transient return containing both as live unless action model represents "old filled" implicitly and test accepts.

============================================================
BK. BRACKET COVERAGE INVARIANT
============================================================

After every processed unique entry fill:

exit protected quantity == cumulative entry fill

or exact remaining exposed quantity if exit fills are included by organizer.

Read test.

Do not maintain separate inconsistent TP and SL quantities.

Use one exposure calculation when possible.

============================================================
BL. OCO COVERAGE INVARIANT
============================================================

Before stop fires:

stop remaining coverage == parent protected quantity remaining after paired limit fills.

Do not let partial fill shrink only one internal counter while trigger reads another stale total.

============================================================
BM. TERMINAL STOP INVARIANT
============================================================

For OCO/trailing/bracket logical stop:

once fired:
- fired = true;
- armed = false;
- no second action.

Centralize trigger guard.

============================================================
BN. CHILD ACTION QUANTITIES
============================================================

Every emitted order/amend action quantity must be:
- positive;
- <= parent relevant remaining/exposure;
- exact type.

Do not emit zero-amend if test expects no action.

If exposure becomes zero:
cancel/disarm rather than place 0 quantity.

============================================================
BO. CHILD ACTION PRICE RELATIONS
============================================================

Use exact parent-configured prices/trigger levels.

Do not modify limit price because of a fill unless strategy semantics require.

Trailing stop is the only strategy with dynamic stop level under published scope.

============================================================
BP. SEQUENCE SEMANTICS
============================================================

Challenge 15c explicitly requires original sequence for iceberg replenishment.

Read sequence behavior for:
- OCO children;
- bracket exits;
- trailing stop child.

Do not globally allocate new matching sequence if the strategy test expects deterministic preserved values.

Preserve current action interface.

============================================================
BQ. MATCHING ENGINE INTEGRATION
============================================================

If Challenge 15 state machines only emit actions:
do not execute them through `matchingEngine` inside strategy code.

Keep domain deterministic.

If test explicitly wires emitted actions into matching:
use existing matching API without altering core invariants.

Do not duplicate the order book.

============================================================
BR. TASK 16 / CHALLENGE 03 STOP ORDERS
============================================================

Earlier code may already know:
- stop;
- stop-limit.

Do not conflate exchange stop-order trigger state with strategy parent state.

An OCO/bracket/trailing strategy may emit a normal stop/market/limit child using existing order types.

Reuse types where appropriate but keep parent strategy lifecycle separate.

============================================================
BS. SELF-TRADE / EXECUTION POLICY
============================================================

Do not reimplement:
- IOC/FOK/POST_ONLY;
- STP.

If child actions use these fields:
populate as required by strategy contract.

Matching handles execution policy.

============================================================
BT. RISK INTEGRATION
============================================================

Do not reserve/release risk inside pure strategy state if Challenge 15 does not require it.

Task 33 final integration can apply emitted child orders through normal risk/order paths.

Do not double-reserve.

============================================================
BU. ACCOUNT CLOSURE
============================================================

Do not add account-status logic inside Challenge 15 unless current tests integrate it.

If strategy actions are later submitted, normal order path can enforce closure.

Keep Task 30 scoped.

============================================================
BV. FEE INTEGRATION
============================================================

Do not charge fees inside strategy state.

Fees apply to actual fills through Challenge 16.

A redelivered fill must not cause duplicate strategy effects; Challenge 16 separately protects duplicate fees.

============================================================
BW. MARKET PRICE EVENTS
============================================================

Use exact price event order supplied by Challenge 15.

Do not query Task 27 candles/VWAP to trigger strategies unless test says so.

Trailing/OCO triggers likely consume raw price events.

Do not synthesize missing ticks.

============================================================
BX. NO DATABASE BY DEFAULT
============================================================

Challenge 15 is likely pure/in-memory state machines.

Do not add:
- strategy tables;
- child-order tables;
- migrations.

Unless current source/test explicitly requires persistence.

No seed changes.

============================================================
BY. NO HTTP API BY DEFAULT
============================================================

Do not invent:
- `/api/oco`
- `/api/brackets`
- `/api/icebergs`
- `/api/trailing-stops`

unless Challenge 15 tests an existing route.

If no new route:
Task 25 OpenAPI remains untouched.

============================================================
BZ. STRUCTURE STRATEGIES CLEANLY
============================================================

If current code permits, keep common utilities minimal:

- processed-fill guard;
- child-state helpers;
- deterministic ID helper;
- exact quantity helpers;
- parent terminal/cancel helper.

But do not force all strategy types into one complicated inheritance tree during a nine-hour challenge.

Prefer readable explicit state machines.

============================================================
CA. STATE ENUMS / DISCRIMINATED UNIONS
============================================================

Use current types.

If introducing internal state types:
TypeScript discriminated unions can prevent impossible transitions.

Do not modify public API unnecessarily.

Avoid broad `any`.

============================================================
CB. IMMUTABILITY VS LOCAL MUTATION
============================================================

Read test expectations.

Class-based strategies may mutate internal state.

Pure reducer strategies may return new state.

Preserve current intended architecture.

Regardless:
- do not mutate caller input event/order objects;
- do not retain external mutable references to parent config if caller changes it.

Defensive-copy config if appropriate.

============================================================
CC. ACTION ARRAY MUTATION
============================================================

Return fresh action arrays.

Do not return an internal array later appended by future events.

Challenge 15e may save prior actions and compare them after more events.

Avoid retroactively mutating previous results.

============================================================
CD. RESULT OBJECT MUTATION
============================================================

If returning state snapshots:
return copies as required.

Do not expose internal Set/Map references if caller mutation could corrupt state and tests probe it.

Read source conventions.

============================================================
CE. DETERMINISTIC CHILD ID STRATEGY
============================================================

Read test first.

If it asserts exact IDs:
follow exact format.

If it only compares repeated histories:
a deterministic derivation from:
- parent ID;
- role;
- clip index/generation

may work.

Examples:
parent + ":tp"
parent + ":sl"
parent + ":iceberg:0"

These are conceptual only.

Do not invent if existing helpers/stubs define naming.

============================================================
CF. ICEBERG CLIP INDEX
============================================================

If deterministic child IDs use generation:
increment only when a new clip is actually created.

Duplicate full-fill event must not increment generation.

Partial fills do not increment.

Parent cancel prevents further increments.

============================================================
CG. BRACKET EXIT RESIZE STRATEGY
============================================================

Read action model.

If action supports amend:
use it.

If not:
cancel old exit and create replacement.

Do not invent amend action type.

Whatever mechanism:
action sequence must be deterministic and exit coverage exact.

============================================================
CH. OCO STOP RESIZE STRATEGY
============================================================

Same rule.

If logical stop quantity is internal:
no external action needed on TP partial fill.

If stop child is a live order and must be amended:
emit exact organizer action.

Do not create duplicate stops.

============================================================
CI. CANCEL SIBLING ON EXIT
============================================================

OCO semantics likely require one exit cancels the other.

Published 15a explicitly states triggered stop cancels limit.

Read whether full take-profit fill must also cancel/disarm stop.

Implement exact symmetric terminal behavior where tested.

Bracket may also use OCO-like exits; read test.

============================================================
CJ. TRAILING SIDE DIRECTION
============================================================

Never derive trigger direction solely from whether action is buy/sell without reading parent semantics.

A trailing stop parent may encode:
- position side;
- exit side.

Use exact fields.

Wrong direction can look correct on monotonic one-way samples but fail randomized oracle histories.

============================================================
CK. TRAILING WATERMARK UPDATE VS TRIGGER ORDER
============================================================

Read oracle.

For each price event:
determine whether to:
1. update favorable watermark/stop;
2. then test trigger;
or
1. test trigger against prior stop;
2. update if not triggered.

Normally:
- favorable price updates ratchet;
- adverse price checks trigger.

For a single price, those conditions are mutually directed, but equality/boundary can matter.

Match test.

============================================================
CL. PRICE HISTORY PROPERTY TESTS
============================================================

If trailing/OCO uses randomized histories:

record on failure:
- fast-check seed;
- path;
- parent config;
- exact price sequence;
- fill sequence;
- expected actions;
- actual actions.

Do not hardcode the shrunk case.

Fix state invariant.

============================================================
CM. FILL HISTORY PROPERTY TESTS
============================================================

For OCO/bracket/iceberg property failures:
identify first event where state diverges.

Report:
- event index;
- fill ID;
- child ID;
- qty;
- expected cumulative/remaining;
- actual cumulative/remaining.

Do not hide via later correction.

============================================================
CN. CANCEL HISTORY PROPERTY
============================================================

After cancel event index N:
assert conceptually that actions after N never include:
- place new child;
- replenish;
- trigger.

Unless organizer explicitly allows cancellation acknowledgements.

Use terminal guard early in event handling.

============================================================
CO. ACTION ORDER DETERMINISM
============================================================

If one event emits multiple actions:
define organizer-compatible ordering.

Examples:
- cancel sibling before place triggered exit;
- cancel entry before place stop exit;
- amend TP then amend SL.

Do not rely on object key iteration.

Read exact expected arrays.

============================================================
CP. RANGEERROR BEFORE PARTIAL STATE
============================================================

For an overfill:
do not first increment cumulative and then notice overflow.

Validate:

fill.quantity <= remaining

before update.

For invalid parent:
validate fully before registering initial child/internal state.

============================================================
CQ. UNKNOWN CHILD FILL
============================================================

Read 15f.

If a fill references unknown child:
likely `RangeError`.

Do not accidentally create state for it.

Do not treat unknown child as parent fill.

Use explicit child registry/role map if helpful.

============================================================
CR. FILLED/CANCELLED CHILD FILL
============================================================

A brand-new fill ID against a child that is already terminal may be impossible.

Read test.

Do not accept and push cumulative past total.

Duplicate of a previously processed fill must short-circuit before terminal-child invalidity if test expects idempotent redelivery.

Ordering matters:
1. duplicate identity check;
2. validate new event against current state.

============================================================
CS. PROCESSED FILL STORAGE
============================================================

Store enough to:
- recognize duplicate;
- optionally recognize same-ID conflicting payload if required.

Avoid unbounded heavy action-history copies if fills can be many, but Challenge 15 scale appears state-machine correctness, not 200k benchmark.

A Map from ID -> compact fingerprint/result is reasonable.

Use current interfaces.

============================================================
CT. SAME EVENT HISTORY FROM FRESH INSTANCE
============================================================

Challenge 15e may instantiate two strategies and replay same history.

Ensure no module-level mutable global:
- child counter;
- processed set;
- watermark;
- generation.

All strategy state must belong to the instance/state value.

============================================================
CU. RESET / REUSE
============================================================

If current module exposes reset:
read test.

Do not share state across tests/strategy parents.

Each parent starts clean.

No test-specific reset branch.

============================================================
CV. ERROR MESSAGE
============================================================

Challenge 15f likely checks `RangeError` class, not exact text, but read test.

Use concise stable messages.

Do not expose internal stack in any HTTP layer if one exists.

============================================================
CW. EXPECTED TASK 30 FILE SCOPE
============================================================

Primary:
- actual Challenge 15 strategy domain/engine files discovered in repo.

Possible examples only:
- src/domain/strategies.ts
- src/domain/complexOrders.ts
- src/services/strategyEngine.ts

Only if current test truly requires integration:
- current matching order type/helper.

Create/update:

docs/clearhouse-task-30-complex-order-strategies.md

Normally do NOT change:
- settlement;
- ledger;
- risk;
- fees;
- netting;
- database;
- server/API;
- dashboard;
- WebSockets.

Do NOT add tests.

============================================================
CX. REQUIRED VERIFICATION — CHALLENGE 15
============================================================

After implementation:

npm run typecheck

Primary gate:

npm test challenge15.test.ts

If current labels exist:

npm test challenge15.test.ts -t "Challenge 15a"
npm test challenge15.test.ts -t "Challenge 15b"
npm test challenge15.test.ts -t "Challenge 15c"
npm test challenge15.test.ts -t "Challenge 15d"
npm test challenge15.test.ts -t "Challenge 15e"
npm test challenge15.test.ts -t "Challenge 15f"

Use actual labels.

Record:
- exact count;
- property/random seed/path;
- deterministic replay comparison;
- cancellation result.

============================================================
CY. MATCHING REGRESSION
============================================================

Run:

npm test challenge03.test.ts

This is the most important regression.

Strategy work must not regress:
- price-time priority;
- IOC/FOK/POST_ONLY;
- STP;
- stop/stop-limit;
- amend/cancel races;
- matching performance.

============================================================
CZ. RISK REGRESSION
============================================================

Run:

npm test challenge05.test.ts

If Task 30 touches order types/actions, ensure risk remains healthy.

============================================================
DA. MARKET / FEE REGRESSION
============================================================

Run:

npm test challenge08.test.ts
npm test challenge16.test.ts

Do not alter trade/price/fill types incompatibly.

============================================================
DB. ACCOUNT / SETTLEMENT REGRESSION
============================================================

Run:

npm test challenge13.test.ts
npm test challenge04.test.ts

No state-machine changes should alter balances/account closure.

============================================================
DC. NETTING / LEDGER REGRESSION
============================================================

Run:

npm test challenge14.test.ts
npm test challenge02.test.ts
npm test challenge09.test.ts

Task 30 should be isolated.

============================================================
DD. API / DOC / DEMO REGRESSION
============================================================

Run:

npm test challenge11.test.ts
npm test challenge19.test.ts
npm test challenge20.test.ts
npm test challenge12.test.ts

No API change expected by default.

============================================================
DE. EVENT / OPS / AUTH REGRESSION
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

Record Task 31+ future failures honestly.

============================================================
DF. FAILURE DIAGNOSIS — 15a OCO
============================================================

If stop sells too much:
- stop uses parent total instead of remaining after TP fills;
- duplicate fill counted twice.

If stop fires twice:
- fired flag not terminal;
- duplicate price event not guarded according to model;
- stop child recreated.

If limit not cancelled:
- child live-state registry stale;
- stop transition missing paired cancel action.

If partial TP does not shrink stop:
- remaining coverage stored in stale field.

============================================================
DG. FAILURE DIAGNOSIS — 15b BRACKET
============================================================

If exits too large:
- created for full entry quantity before fills;
- duplicate entry fill counted twice.

If exits too small:
- using latest fill instead of cumulative fill.

If stop loss leaves unfilled entry live:
- missing entry cancel action/state.

If later entry fill expands exits after stop:
- entry not terminal/cancelled.

============================================================
DH. FAILURE DIAGNOSIS — 15c ICEBERG
============================================================

If two clips live:
- replenishment occurs on partial fill;
- old clip not marked terminal before new clip.

If total exceeded:
- final clip not capped to remaining;
- duplicate full-fill event replenished twice.

If priority/sequence changes:
- new global sequence allocated per clip.

If cancel still replenishes:
- cancelled parent guard missing.

============================================================
DI. FAILURE DIAGNOSIS — 15d TRAILING
============================================================

If stop loosens:
- watermark overwritten by unfavorable price.

If trigger too early/late:
- wrong <=/>= boundary;
- wrong side semantics;
- offset arithmetic wrong;
- update/trigger order wrong.

If trigger repeated:
- fired state not terminal.

Capture exact oracle price history.

============================================================
DJ. FAILURE DIAGNOSIS — 15e REDELIVERY
============================================================

If duplicate fill changes anything:
- duplicate check too late;
- fill identity wrong;
- processed set stored after state transitions incorrectly.

If two fresh instances differ:
- random IDs;
- global child counter;
- Date.now;
- nondeterministic iteration.

If second parent cancel emits actions:
- cancellation not idempotent.

============================================================
DK. FAILURE DIAGNOSIS — 15f VALIDATION
============================================================

If wrong error type:
throw RangeError.

If state changes before error:
move validation earlier.

If duplicate legitimate fill redelivery throws as overfill:
duplicate identity check must occur before new-fill remaining validation.

Read exact test.

============================================================
DL. PROPERTY TEST DISCIPLINE
============================================================

When property/random test fails, record:
- seed;
- path;
- shrunk parent config;
- ordered event history;
- event index of first divergence;
- expected state/actions;
- actual state/actions.

Do not:
- freeze seed;
- skip history;
- hardcode counterexample.

Fix the invariant.

============================================================
DM. TASK 30 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-30-complex-order-strategies.md

Include:

1. Starting commit.
2. Working branch task-30.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 15 test count.
6. 200-point score map.
7. Public strategy APIs.
8. Parent/order interfaces.
9. Event/fill interfaces.
10. Action/result interfaces.
11. Quantity/price exact types.
12. Processed-fill identity strategy.
13. Deterministic child-ID strategy.
14. Common parent terminal/cancel model.
15. OCO initial child model.
16. OCO remaining-coverage formula.
17. OCO partial-fill behavior.
18. OCO stop-trigger action order.
19. OCO one-shot behavior.
20. Bracket cumulative entry fill.
21. Bracket exit coverage formula.
22. Bracket resize action strategy.
23. Bracket stop-loss entry cancellation.
24. Iceberg total/display model.
25. Iceberg current-clip state.
26. Iceberg replenish rule.
27. Iceberg final-clip cap.
28. Iceberg original sequence preservation.
29. Trailing side semantics.
30. Trailing initial watermark.
31. Trailing ratchet formula.
32. Trigger comparison boundary.
33. Trailing one-shot behavior.
34. Duplicate fill/event behavior.
35. Deterministic action ordering.
36. Parent cancellation actions.
37. Post-cancel terminal guards.
38. Validation/RangeError rules.
39. Input/result immutability.
40. Exact files changed.
41. Typecheck.
42. 15a result.
43. 15b result.
44. 15c result.
45. 15d result.
46. 15e result.
47. 15f result.
48. Full Challenge 15 result.
49. Challenge 03 result.
50. Challenge 05 result.
51. Challenge 08/16 results.
52. Challenge 13/04 results.
53. Challenge 14/02/09 results.
54. Challenge 11/19/20/12 results.
55. Challenge 06/10/01 results.
56. sanity/full-suite.
57. protected-file confirmation.
58. suggested commit.
59. master merge/push workflow.
60. next Task 31: Challenge 18 WebSocket Feed.

Do not include secrets.

============================================================
DN. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat
git diff --name-only

Review actual Challenge 15 strategy files:

git diff -- "<actual-strategy-domain-path>"
git diff -- "<actual-strategy-engine-path>"

Only if genuine integration changed:

git diff -- "<actual-order-type-or-matching-helper-path>"

Review:

git diff -- docs/clearhouse-task-30-complex-order-strategies.md

Do not paste placeholders literally.

Confirm:
- organizer tests unchanged;
- no new tests;
- config unchanged;
- package unchanged;
- migrations unchanged;
- seeds unchanged;
- no Number quantity/price arithmetic;
- no random/Date.now child identity;
- no module-global strategy state;
- no duplicate fill effects;
- no child creation after parent cancel;
- no WebSocket/client work;
- no Task 31+ implementation.

============================================================
DO. TASK 30 COMPLETION CRITERIA
============================================================

Task 30 is COMPLETE only when:

DISCOVERY

[ ] challenge15 read completely.
[ ] exact test count recorded.
[ ] exact parent interfaces known.
[ ] exact event/fill interfaces known.
[ ] exact action/result model known.
[ ] exact validation known.
[ ] deterministic ID requirements known.

COMMON STATE MACHINE

[ ] strategy state isolated per parent/instance.
[ ] quantities exact.
[ ] inputs not mutated.
[ ] action arrays/results not retroactively mutated.
[ ] fill identity stable.
[ ] duplicate fills do not change state.
[ ] same event history yields same actions.
[ ] no Date.now/randomness.
[ ] parent cancellation terminal.
[ ] parent cancellation idempotent.
[ ] post-cancel events cannot resurrect children.

OCO

[ ] initial paired-child semantics exact.
[ ] cumulative TP/limit fill exact.
[ ] remaining stop coverage exact.
[ ] partial fill shrinks stop protection.
[ ] full paired fill disarms stop.
[ ] stop trigger cancels live limit.
[ ] triggered exit quantity equals remaining.
[ ] stop fires exactly once.
[ ] duplicate fills/triggers no extra action.

BRACKET

[ ] cumulative unique entry fill tracked.
[ ] exit coverage equals cumulative entry exposure.
[ ] exit coverage never includes unfilled entry.
[ ] duplicate entry fill no resize.
[ ] partial entry fills resize correctly.
[ ] stop-loss cancels unfilled entry.
[ ] no later entry growth after stop/cancel.
[ ] exit behavior matches organizer child model.

ICEBERG

[ ] one live clip maximum.
[ ] initial clip <= display quantity.
[ ] partial clip fill does not replenish.
[ ] full clip fill replenishes exactly one.
[ ] replacement <= display quantity.
[ ] final clip <= total remaining.
[ ] cumulative never exceeds total.
[ ] original sequence preserved.
[ ] duplicate full-fill no second replenish.
[ ] parent cancel stops replenishment.

TRAILING STOP

[ ] side semantics exact.
[ ] watermark initialized correctly.
[ ] favorable move updates watermark.
[ ] unfavorable move does not loosen stop.
[ ] trigger boundary exact.
[ ] trigger quantity/action exact.
[ ] fires exactly once.
[ ] parent cancellation disarms.
[ ] duplicate event behavior exact.

VALIDATION

[ ] invalid parents throw RangeError.
[ ] invalid fills throw RangeError.
[ ] overfill rejected.
[ ] unknown/terminal child behavior exact.
[ ] validation before state mutation.
[ ] duplicate redelivery recognized before false overfill rejection when required.

REGRESSION

[ ] typecheck passes.
[ ] Challenge 15 passes.
[ ] Challenge 03 passes.
[ ] Challenge 05 passes.
[ ] Challenge 08 passes.
[ ] Challenge 16 passes.
[ ] Challenge 13/04 pass.
[ ] Challenge 14/02/09 pass.
[ ] Challenge 11/19/20/12 pass.
[ ] Challenge 06/10/01 pass.
[ ] sanity/full suite recorded.
[ ] protected files unchanged.
[ ] Task 30 note created.
[ ] final Git target master.

If any Challenge 15 assertion remains failing:
- Task 30 status = PARTIAL;
- report exact failing test/root cause.

============================================================
DP. FINAL CURSOR REPORT
============================================================

Return:

1. Task 30 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Exact Challenge 15 test count.
6. Public strategy APIs.
7. Parent/event/action models.
8. Fill identity/idempotency design.
9. Deterministic ID/action-order design.
10. OCO state model.
11. OCO remaining-coverage rule.
12. OCO trigger/cancel behavior.
13. Bracket cumulative-entry logic.
14. Bracket exit-resize behavior.
15. Bracket stop-loss entry cancellation.
16. Iceberg clip state.
17. Iceberg replenish/final-cap behavior.
18. Iceberg sequence preservation.
19. Trailing watermark/ratchet formula.
20. Trailing trigger boundary.
21. Parent cancellation behavior.
22. Post-cancel guards.
23. RangeError validation.
24. Input/result immutability.
25. Typecheck.
26. 15a result.
27. 15b result.
28. 15c result.
29. 15d result.
30. 15e result.
31. 15f result.
32. Full Challenge 15 result.
33. Challenge 03 result.
34. Challenge 05 result.
35. Challenge 08/16 results.
36. Challenge 13/04 results.
37. Challenge 14/02/09 results.
38. Challenge 11/19/20/12 results.
39. Challenge 06/10/01 results.
40. sanity/full-suite result.
41. remaining future failures.
42. confirmation protected files unchanged.
43. final diff summary.
44. reviewed Git commands targeting master.

Suggested commit:

feat: implement complex order strategy state machines

Do not automatically commit, merge, or push.
````

---

# Task 30 acceptance matrix

| Area | Required behavior |
|---|---|
| Strategy state | Isolated + deterministic |
| Fill identity | Stable |
| Duplicate fill | No state/action change |
| Child IDs | Deterministic if generated |
| OCO partial TP | Shrinks stop coverage |
| OCO stop | Cancels paired live limit |
| OCO stop qty | Exact remaining quantity |
| OCO trigger | Once |
| Bracket exits | Equal cumulative entry exposure |
| Bracket duplicate fill | No double resize |
| Bracket stop | Cancels unfilled entry |
| Iceberg live clips | Max 1 |
| Iceberg replenish | Only after full clip fill |
| Iceberg total | Never exceeded |
| Iceberg sequence | Original preserved |
| Trailing watermark | Favorable extreme |
| Trailing stop | Never loosens |
| Trailing trigger | Exact boundary |
| Trailing fire | Once |
| Parent cancel | Cancels live limit children |
| Parent cancel | Disarms stops |
| Parent cancel | Stops replenishment |
| Parent cancel | Idempotent |
| Invalid parent/fill | `RangeError` |
| Quantity/price | Exact integer type |
| Random/time dependency | None |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 30

Official final branch:

**`master`**

Workflow:

**`master` → `task-30` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 30 branch

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
task-30
```

Official final branch:

```text
master
```

---

## 2. Run final Task 30 verification

```powershell
npm run typecheck

npm test challenge15.test.ts

npm test challenge03.test.ts

npm test challenge05.test.ts

npm test challenge08.test.ts

npm test challenge16.test.ts

npm test challenge13.test.ts

npm test challenge04.test.ts

npm test challenge14.test.ts

npm test challenge02.test.ts

npm test challenge09.test.ts

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

If Challenge 15 labels exist:

```powershell
npm test challenge15.test.ts -t "Challenge 15a"

npm test challenge15.test.ts -t "Challenge 15b"

npm test challenge15.test.ts -t "Challenge 15c"

npm test challenge15.test.ts -t "Challenge 15d"

npm test challenge15.test.ts -t "Challenge 15e"

npm test challenge15.test.ts -t "Challenge 15f"
```

Use actual labels if different.

Then:

```powershell
npm test
```

---

## 3. Review Task 30 changes

```powershell
git status --short
git diff --stat
git diff --name-only
```

Review the actual Challenge 15 source files discovered by Cursor:

```powershell
git diff -- "<actual-strategy-domain-path>"
git diff -- "<actual-strategy-engine-path>"
```

Do not paste placeholders literally.

Only if a genuine Challenge 15 integration change exists:

```powershell
git diff -- "<actual-order-type-or-matching-helper-path>"
```

Review engineering note:

```powershell
git diff -- docs/clearhouse-task-30-complex-order-strategies.md
```

---

## 4. Stage only Task 30 files

Always stage:

```powershell
git add -- docs/clearhouse-task-30-complex-order-strategies.md
```

Stage actual strategy source:

```powershell
git add -- "<actual-strategy-domain-path>"
git add -- "<actual-strategy-engine-path>"
```

Do not paste placeholders literally.

Only if genuinely changed:

```powershell
git add -- "<actual-order-type-or-matching-helper-path>"
```

If another Task 30 helper genuinely changed:

```powershell
git add -- "<actual-task30-helper-path>"
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
- WebSocket/client work
- unrelated ledger/settlement/netting code
- Task 31+ implementation.

---

## 6. Commit Task 30

```powershell
git commit -m "feat: implement complex order strategy state machines"
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

## 8. Merge Task 30

Prefer:

```powershell
git merge --ff-only task-30
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-30
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

npm test challenge15.test.ts

npm test challenge03.test.ts

npm test challenge05.test.ts

git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge16.test.ts
npm test challenge14.test.ts
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

If safe for the local-only Task 30 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge15.test.ts
npm test challenge03.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts carefully.

---

# Fast Task 30 checklist

- [ ] branch = task-30
- [ ] final branch = master
- [ ] challenge15 fully read
- [ ] config/scores read-only
- [ ] exact test count recorded
- [ ] exact parent types known
- [ ] exact fill/event types known
- [ ] exact action/result types known
- [ ] exact child ID rules known
- [ ] exact validation known
- [ ] no random/Date.now IDs
- [ ] state isolated per strategy
- [ ] duplicate fill no-op
- [ ] same history deterministic
- [ ] input event/order objects not mutated
- [ ] OCO partial fill shrinks stop quantity
- [ ] OCO full paired fill disarms stop
- [ ] OCO stop cancels live limit
- [ ] OCO stop exits exact remainder
- [ ] OCO stop fires once
- [ ] bracket cumulative entry fill exact
- [ ] bracket exits equal filled exposure
- [ ] duplicate entry fill no double resize
- [ ] bracket stop cancels unfilled entry
- [ ] no later entry expansion after stop
- [ ] iceberg max one live clip
- [ ] partial clip does not replenish
- [ ] full clip replenishes exactly one
- [ ] final clip capped to remaining
- [ ] total never exceeded
- [ ] original sequence preserved
- [ ] duplicate clip fill no second replenish
- [ ] parent cancel stops iceberg
- [ ] trailing watermark favorable only
- [ ] trailing stop ratchets one direction
- [ ] trigger boundary exact
- [ ] trailing fires once
- [ ] parent cancellation cancels live limit children
- [ ] parent cancellation disarms stops
- [ ] parent cancellation prevents future children
- [ ] parent cancellation idempotent
- [ ] invalid parent -> RangeError
- [ ] invalid fill -> RangeError
- [ ] overfill rejected before mutation
- [ ] Challenge15 passes
- [ ] Challenge03 passes
- [ ] Challenge05 passes
- [ ] Challenge08/16 pass
- [ ] Challenge13/04 pass
- [ ] Challenge14/02/09 pass
- [ ] Challenge11/19/20/12 pass
- [ ] Challenge06/10/01 pass
- [ ] sanity/full suite recorded
- [ ] protected files unchanged
- [ ] Task30 note created
- [ ] committed on task-30
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 31 — Challenge 18: WebSocket Feed.
