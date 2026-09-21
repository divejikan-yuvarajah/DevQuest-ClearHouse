# ClearHouse — Complete Enhanced Cursor Prompt for Task 17

**Task:** Challenge 05 — Pre-Trade Risk and Limits  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-17`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 17 purpose

Task 17 implements **Challenge 05 — Pre-Trade Risk and Limits**.

The central rule is:

> Risk checks must happen **before** an order mutates the book, and any capacity/exposure reservation required by that decision must be committed atomically with the decision so concurrent requests cannot both pass stale state.

Task 17 must preserve:

- Task 14–16 matching behavior;
- Task 15 STP lifecycle cleanup;
- Task 16 cancel/amend lifecycle;
- Task 9 input validation;
- Task 7 risk-registry/shared-state fixes.

Do not redesign the matching engine or settlement system.

---

# Published Challenge 05 requirements

## 5a — Individual rules

### 5a-1 — Max notional — 14 pts

An order whose notional exceeds the account's configured limit must be rejected **before it ever reaches the book**.

### 5a-2 — Max open resting orders — 14 pts

An account cannot have more resting orders open than its configured limit.

### 5a-3 — Max committed position/exposure — 14 pts

Committed exposure beyond the configured position limit must be rejected.

### 5a-4 — Release on cancellation — 12 pts

Cancelling a live resting order must release:

- its open-order slot;
- its committed exposure.

The release must happen exactly once.

---

## 5b — Deterministic precedence

### 5b-1 — 12 pts

If one order violates both:

- max notional; and
- max open orders;

the reported violation must be **notional**.

Risk failure precedence must therefore be deterministic.

---

## 5c — Concurrent joint-limit enforcement

### 5c-1 — 16 pts

Two orders may each be individually valid against the current state but invalid jointly.

When submitted in parallel:

- exactly one may be accepted if accepting both would exceed the position limit;
- the second must observe the first committed reservation and reject.

A `check()` followed later by a separate `reserve()` is not safe if requests can interleave.

---

## 5d — Kill switch

### 5d-1 — 8 pts

Once the kill switch is engaged:

- new order placement is rejected;
- cancellation must still work.

Do not place kill-switch rejection in the cancellation path.

---

# Challenge 05 scoring note

The challenge overview says **140 points**, while the published visible subtasks above sum to **90 points**.

Therefore:

- do not claim that 90 is the complete current Challenge 05 score;
- do not invent the missing 50 points;
- Cursor must inspect the current `tests/challenge05.test.ts` and `config/scores.ts` read-only;
- record all current organizer tests, labels, and score entries;
- completion is based on the current tests, not the prose sum.

---

# Known existing integration from earlier tasks

The existing order-placement flow already contains risk integration around concepts such as:

- `firstViolatedRule`
- `reserve`
- `registerReservation`
- `rememberOrder`
- `takeReservation`
- `releaseRisk`

The exact current signatures in the CodeCommit checkout are authoritative.

Task 7 previously fixed risk registry/shared-state mechanics.

Task 9 validated risk-limit input such as `maxOpenOrders`.

Task 15 already required STP-cancelled resting orders to release any existing reservation.

Task 16 may have added amendment/cancel/fill lifecycle behavior.

Task 17 must build on these instead of creating a duplicate risk store.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 17

Copy the entire block below into Cursor Agent mode.

````text
Act as my senior TypeScript fintech risk-engine engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 17 ONLY: implement Challenge 05 — Pre-Trade Risk and Limits — completely and safely.

Implement the current risk-domain rules, atomic risk reservation, deterministic rule precedence, lifecycle release, concurrent joint-limit enforcement, and kill-switch behavior. Integrate them with the existing order controller and matching lifecycle without rewriting Tasks 14–16.

Preserve all completed Tasks 1–16.

Do not stop at a plan. Perform the implementation and verification, create the Task 17 engineering note, and show reviewed Git commands.

Do not automatically commit, merge, or push.

============================================================
A. REPOSITORY / SUBMISSION CONTEXT
============================================================

Working directory:

C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b

Official remote:

origin

Official repository:

https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b

OFFICIAL FINAL SUBMISSION BRANCH:

master

Task branch:

task-17

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–16;
- work on task-17;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT TASK 17 SCOPE
============================================================

IMPLEMENT:

Challenge 5a:
- max order notional;
- max resting/open-order count;
- max committed position/exposure;
- exact release on cancellation.

Challenge 5b:
- deterministic risk-rule precedence.

Challenge 5c:
- concurrent joint-limit enforcement.

Challenge 5d:
- kill switch blocks NEW orders;
- cancellation still works.

Also implement lifecycle consistency required by those rules:
- reservation on accepted resting exposure;
- reservation release on cancel;
- release on STP cancellation;
- release when a reserved order ceases to be live;
- correct handling of rejected/non-resting orders;
- amendment reservation changes only if current Challenge 05 tests/current architecture require it.

DO NOT IMPLEMENT:

- account closure (Task 18);
- reconciliation/migration (Task 19);
- rate limiting/operations (Task 20);
- API performance/config/cache (Task 21);
- event sourcing;
- fees;
- netting;
- dashboard;
- WebSockets.

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
- increase organizer timeout;
- reduce test discovery;
- alter property generators/seeds;
- relax TypeScript.

Do NOT add source code checking:

- NODE_ENV === "test";
- VITEST;
- organizer test names;
- known account IDs;
- known limits;
- known quantities/prices;
- concurrency fixture values.

Do NOT use floating point for:

- notional;
- position;
- exposure;
- quantity;
- price.

Use bigint where the current model uses exact integer amounts.

Do NOT use destructive Git:

- git reset --hard;
- git clean -fd;
- force-push;
- history rewriting.

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

- origin = official remote;
- master = official final branch.

Verify Task 16 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-16 exists:

git log --oneline --decorate --max-count=10 task-16

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-17

If task-17 already exists:

git branch --list task-17
git log --oneline --decorate --max-count=10 task-17

Do not delete/recreate blindly.

Record:

- starting commit;
- branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
E. VERIFY MATCHING PREREQUISITES
============================================================

Read if present:

- docs/clearhouse-task-14-basic-matching.md
- docs/clearhouse-task-15-execution-policies.md
- docs/clearhouse-task-16-advanced-matching.md

Verify actual source.

Task 17 depends heavily on live-order lifecycle being correct.

Before editing run:

npm run typecheck

npm test challenge03.test.ts

If Challenge 03 is not fully passing:
- record exact failing group;
- do not hide it;
- only touch matching lifecycle code if required for risk reservation correctness.

============================================================
F. READ THE EXACT CHALLENGE 05 CONTRACT
============================================================

Read COMPLETELY:

- tests/challenge05.test.ts

Read current:

- src/domain/risk.ts
- src/services/riskRegistry.ts
- src/controller/riskController.ts
- src/routes/riskRoutes.ts
- src/controller/orderController.ts
- src/services/matchingEngine.ts
- src/domain/matching.ts
- src/domain/orderBook.ts

Also inspect:

- account/controller auth around kill switch;
- Task 6 admin role protection;
- Task 7 risk-registry fixes;
- Task 9 risk-limit validation;
- Task 15 STP cleanup;
- Task 16 amend/cancel/fill lifecycle.

Search:

rg -n "RiskLimits|RiskState|RiskReservation|firstViolatedRule|reserve|releaseRisk|registerReservation|takeReservation|rememberOrder|maxNotional|maxOpenOrders|maxPositionAbs|killSwitch|kill-switch|risk" src tests

PowerShell fallback:

Get-ChildItem -Recurse src,tests -File |
  Select-String -Pattern "RiskLimits|RiskState|RiskReservation|firstViolatedRule|reserve|releaseRisk|registerReservation|takeReservation|rememberOrder|maxNotional|maxOpenOrders|maxPositionAbs|killSwitch|kill-switch|risk"

Do not assume historical signatures.

============================================================
G. SCORE / TEST COVERAGE AUDIT
============================================================

Read:

config/scores.ts

READ ONLY.

Challenge overview says 140 points, while visible prose subtasks total 90.

Create a compact note:

test label
| organizer assertion
| implementation surface
| score entry
| current pass/fail

Do not invent the missing score difference.

Do not claim earned points.

============================================================
H. BEFORE BASELINE
============================================================

Run:

npm test challenge05.test.ts

Record:

- executed count;
- passed;
- failed;
- exact errors;
- concurrency failures;
- current stubs.

Then run the Task 9 validation regression:

npm test challenge00b.test.ts -t "Challenge 0q"

Use actual current label if different.

============================================================
I. RISK LIMIT INPUT TYPES
============================================================

Task 9 already validates risk configuration input.

Preserve:

- maxOpenOrders as a finite integer in the current allowed range;
- maxNotional as an exact integer string -> bigint;
- maxPositionAbs as an exact integer string -> bigint.

Do not duplicate parser bugs in Task 17.

Do not weaken `INVALID_LIMITS`.

============================================================
J. RISK DOMAIN MUST BE PURE / DETERMINISTIC
============================================================

Where practical, keep rule evaluation in pure domain functions.

Given:

- limits;
- current committed state;
- incoming order risk request;

return the first violated rule deterministically.

Do not mutate registry inside `firstViolatedRule()` unless the existing API explicitly defines it as a combined operation.

Separate pure calculation from state mutation internally.

============================================================
K. DETERMINE CURRENT RISK REQUEST MODEL
============================================================

Inspect current types.

Record exactly what risk evaluation receives, for example:

- accountId;
- side;
- price;
- quantity;
- market/asset;
- whether order can rest;
- current exposure/open orders.

Do not invent fields not present in the contract.

If market orders have no price:
- inspect current tests/current risk policy;
- do not make up an arbitrary notional price.

Challenge 05 visible notional tests are likely limit-order based, but current tests are authoritative.

============================================================
L. MAX NOTIONAL RULE
============================================================

For a priced order, calculate notional exactly according to current contract.

Likely:

notional = price * quantity

using bigint.

Do NOT use:

Number(price) * Number(quantity)

Do not overflow into JS Number.

Rule:

if orderNotional > maxNotional

reject BEFORE matching/book mutation.

Check current boundary test:

- usually equality at the limit is allowed;
- only strictly greater should violate unless current test says otherwise.

Use exact current rule.

============================================================
M. NOTIONAL MUST BE CHECKED BEFORE BOOK MUTATION
============================================================

The order must not reach:

- engine.placeOrder();
- active book;
- stop storage;
- risk reservation registry that represents accepted live orders;
- market-feed publication

if rejected for notional.

Input validation happens first.

Risk gate happens before matching mutation.

============================================================
N. OPEN-ORDER LIMIT SEMANTICS
============================================================

The limit is about live/resting committed orders according to the current Challenge 05 contract.

Inspect how current orderController calculates `willRest`.

Task 15 established:

- IOC never rests;
- FOK never rests;
- market order never rests;
- GTC may rest;
- POST_ONLY may rest if accepted;
- stop/stop-limit may be dormant live orders under Task 16.

Current tests define exactly what counts.

Do not blindly increment openOrders for every submitted order.

============================================================
O. PRE-RESERVATION VS ACTUAL RESTING RESULT
============================================================

For policies that MIGHT rest:

risk may need to reserve an open-order slot before matching so concurrent orders cannot oversubscribe capacity.

After matching:

- if incoming actually rests/live -> keep reservation;
- if fully filled/non-resting/rejected -> release or do not retain reservation.

Do not leak an open-order slot for a fully filled GTC.

Do not reserve permanent slots for IOC/FOK.

============================================================
P. MAX OPEN ORDERS
============================================================

When checking an incoming order that will consume a slot:

project:

currentOpenOrders + incomingOpenOrderDelta

Reject if projected count exceeds limit.

Respect exact boundary.

Example conceptually:

limit = 2
current = 2
new live resting order -> reject

Cancel one:
current = 1
new valid resting order -> can proceed.

============================================================
Q. COMMITTED POSITION / EXPOSURE RULE
============================================================

Read the current domain model to determine signed exposure semantics.

Common structure:

buy contributes positive quantity/exposure;
sell contributes negative quantity/exposure.

Limit:

abs(projectedCommittedPosition) <= maxPositionAbs

Use exact current implementation/test model.

Do not assume only buys.

Do not compare unsigned raw quantity if domain tracks signed net commitment.

============================================================
R. POSITION LIMIT MUST INCLUDE EXISTING COMMITMENTS
============================================================

The key Challenge 5c concept:

Risk is checked against:

existing committed exposure
+
new order commitment

not only against the incoming order individually.

Two orders each within the limit can jointly exceed it.

Therefore:

if abs(currentPosition + delta) > maxPositionAbs

reject.

Do not reset exposure per request.

============================================================
S. OPPOSITE-SIDE EXPOSURE
============================================================

If current domain uses signed net position:

opposite-side commitments may reduce net absolute exposure.

Follow exact tests/domain.

Do not force gross exposure semantics if model is net.

If current model instead explicitly stores gross committed exposure per side/asset:
follow it.

This must be derived from source/tests, not guesswork.

============================================================
T. DETERMINISTIC RULE PRECEDENCE
============================================================

Challenge 5b-1 requires:

when NOTIONAL and OPEN ORDER both fail:

NOTIONAL is reported.

Implement one stable rule order.

At minimum:

1. notional
2. open orders
3. position/exposure

unless current tests specify additional ordering.

Kill switch may be an outer gate or part of rule ordering; inspect exact current test.

Do not depend on:
- object key iteration;
- Set order assembled dynamically;
- whichever check happens to run first after refactor.

============================================================
U. EXACT VIOLATION IDENTIFIERS
============================================================

Read `firstViolatedRule()` return type and controller response.

Preserve exact existing rule names/error codes.

Do not rename:

- notional violation;
- open-order violation;
- position violation;
- kill switch error

to prettier strings.

Organizer tests may assert exact codes.

============================================================
V. RISK STATE RESERVATION
============================================================

When an order is accepted by risk and needs committed capacity:

reserve that capacity exactly once.

Reservation should contain enough information to reverse the commitment later.

Typical fields may include:

- accountId;
- market/asset;
- open-order delta;
- signed exposure delta;
- orderId.

Use the actual current type.

Do not reconstruct release values from mutable order state if an immutable reservation already records them.

============================================================
W. REGISTER RESERVATION BY ORDER ID
============================================================

Accepted LIVE orders must have reservation lifecycle tied to order ID.

Use existing:

registerReservation(orderId,...)

or current equivalent.

Do not identify reservations only by array index.

Do not allow one order cancellation to release another order's reservation.

============================================================
X. RELEASE EXACTLY ONCE
============================================================

Existing:

takeReservation(orderId)

is useful because removing reservation before release prevents a second release.

Cancellation lifecycle:

1. engine cancel confirms live order removed;
2. take its reservation;
3. release exact risk state;
4. later duplicate cancel sees no live order/no reservation.

Do not double decrement open-order count.

Do not double reverse position exposure.

============================================================
Y. CANCELLATION RELEASE — 5a-4
============================================================

Challenge 5a-4 explicitly requires cancellation to release:

- open-order slot;
- exposure.

After cancelling a live resting order:

another order that previously failed only because of that capacity should be able to pass, assuming all other limits permit.

Do not release risk if cancellation failed/not found.

============================================================
Z. STP RELEASE
============================================================

Task 15 removes resting makers via STP.

That is semantically a cancellation of a live resting order.

For every STP cancellation:

- remove registry entry;
- take risk reservation;
- release its open-order/exposure commitment.

Do this exactly once.

Do not release aggressor reservation merely because it caused STP.

============================================================
AA. FULL-FILL RELEASE
============================================================

When a live resting maker becomes fully filled:

it is no longer an open order.

Its open-order reservation must not remain permanently committed.

Inspect Task 16 matchingEngine lifecycle.

If current risk reservation represents only pending/open exposure:
- release reservation on full fill.

If current risk model converts reserved exposure into actual committed/current position differently:
- follow exact source/tests.

Do not blindly release exposure if the model expects filled trades to retain actual position state.

This distinction is important: read current Challenge 05 tests and risk domain.

============================================================
AB. INCOMING ORDER FULLY FILLED
============================================================

If risk reserved potential resting capacity before engine placement but incoming order fully fills and does not rest:

- remove/release any reservation that was only needed for live resting commitment.

Do not leak open-order count.

Follow current position semantics for executed exposure exactly.

============================================================
AC. POST_ONLY REJECTION
============================================================

Task 15 crossing POST_ONLY may be rejected after risk pre-reservation.

Current controller already should release the incoming reservation on `result.rejected`.

Preserve and verify this.

A rejected order must not consume:
- open-order slot;
- committed exposure.

============================================================
AD. FOK FAILURE
============================================================

FOK that fails liquidity preflight:
- never rests;
- must not retain risk reservation.

If no reservation should be made for FOK by design, keep it that way.

Do not let risk state change merely because FOK was attempted.

============================================================
AE. STOP / STOP-LIMIT RISK LIFECYCLE
============================================================

Task 16 introduced dormant stop orders.

Read current Challenge 05 tests to determine whether dormant stops count toward:
- open-order limit;
- committed position.

A live dormant stop is still a live order in many systems, but do not assume if current model says otherwise.

If counted:
- reserve while dormant;
- preserve reservation through trigger;
- release only when order ceases to be live.

Do not double-reserve when it triggers into active book.

============================================================
AF. AMENDMENT RISK LIFECYCLE
============================================================

Task 16 amendments can change:
- price;
- quantity.

That can change:
- notional;
- committed exposure.

Read current Challenge 05 tests/current API.

If risk must apply to amendment:
- pre-check proposed amended order before book mutation;
- atomically replace/update reservation only after risk acceptance;
- rejection leaves old order and old reservation unchanged.

Do not implement amendment risk spec not present in current tests if it would broaden scope dangerously.

But ensure Task 17 changes do not corrupt existing Task 16 amend lifecycle.

============================================================
AG. KILL SWITCH STATE
============================================================

Inspect current riskRegistry/current controller.

Kill switch should be deterministic shared risk state.

Once engaged:

NEW order placement is rejected before matching.

Cancellation must still work.

Reset used by tests must disengage it.

Do not use process environment variable or test flag as kill switch.

============================================================
AH. KILL SWITCH AUTHORIZATION
============================================================

Task 6 established admin-only access for the kill-switch route.

Preserve:

- admin permitted;
- operator/no principal forbidden according to existing Task 6 contract.

Do not weaken RBAC while implementing risk.

Do not move kill switch into an unprotected new route.

============================================================
AI. KILL SWITCH SHOULD NOT BLOCK CANCEL
============================================================

Important:

do NOT put:

if (killSwitch) reject

inside:
- matchingEngine.cancel();
- DELETE order route shared helper;
- risk release.

Kill switch blocks NEW exposure, not risk reduction.

Cancellation must remain available to reduce risk.

============================================================
AJ. KILL SWITCH AND AMEND
============================================================

Read current tests.

If an amendment increases/reprices exposure while kill switch is on, it may need rejection as a new-risk action.

If Task 17 tests do not specify amendment under kill switch:
- preserve current behavior;
- document uncertainty;
- do not redesign Task 16.

============================================================
AK. ATOMIC CHECK + RESERVE — CHALLENGE 5c
============================================================

This is the most important Task 17 concurrency rule.

Unsafe pattern:

const violation = firstViolatedRule(limits, riskState, request)
if (!violation) {
    // request can interleave here
    reserve(riskState, request)
}

If two requests read the same state before either reserves:
both can pass,
then jointly exceed the limit.

Need one logical atomic operation.

============================================================
AL. RECOMMENDED ATOMIC RISK ADMISSION
============================================================

Prefer an API such as existing/current equivalent:

tryReserve(accountId, request)
or
checkAndReserve(...)

that performs synchronously within one critical section:

1. read current limits/state;
2. check kill switch;
3. calculate first violated rule;
4. if violation -> return reject, no mutation;
5. if valid -> apply reservation immediately;
6. return reservation object/token.

Then the controller registers that reservation under the new order ID.

Use existing APIs if they already support this.

Do not break public tests/imports by deleting old exports unnecessarily.

============================================================
AM. CONCURRENT REQUEST SERIALIZATION
============================================================

If risk registry mutation is purely synchronous in one Node process:

a synchronous `checkAndReserve` with no await between check and mutation is naturally atomic at event-loop level.

If current flow contains awaits between check and reserve:
- restructure so risk admission itself is synchronous;
OR
- use a small per-account mutex/queue if truly needed.

Do not add sleeps.

Do not add a global lock unless necessary.

Per-account serialization is preferable because unrelated accounts should not block each other.

============================================================
AN. CHALLENGE 5c EXPECTED RESULT
============================================================

Example conceptually:

position limit = 10

current committed = 0

parallel:
order A delta = +6
order B delta = +6

Each alone valid.

Together = +12 invalid.

Exactly one should reserve +6.
The second observes committed +6 and rejects.

Final committed risk must correspond only to the accepted order.

No leaked reservation for rejected order.

============================================================
AO. FAILURE MUST NOT REACH BOOK
============================================================

For every risk rejection:

do not call:

engine.placeOrder()

Do not:
- mutate active book;
- create dormant stop;
- publish book change;
- remember live order;
- register accepted risk reservation.

Risk failure is pre-trade.

============================================================
AP. RESERVATION ROLLBACK IF MATCHING REJECTS
============================================================

Risk admission can succeed but matching policy can later reject, e.g.:

- POST_ONLY would_cross;
- FOK insufficient liquidity.

If reservation was provisionally committed before engine result:

rollback that reservation exactly once.

Do not let policy rejection consume risk capacity.

============================================================
AQ. RESERVATION ROLLBACK IF CONTROLLER FAILS
============================================================

If an unexpected error occurs after reservation but before order becomes live:

attempt safe reservation rollback in a narrow finally/catch path.

Do not swallow the original error.

Do not release a reservation that has already been transferred/registered to a live order.

Use clear ownership state.

============================================================
AR. RISK STATE SHOULD NEVER GO NEGATIVE
============================================================

After release:

- openOrders >= 0;
- internal counts remain consistent;
- exposure reverses exactly.

A duplicate release should not drive state below zero.

Use take-once reservation semantics.

Do not clamp negative values silently; fix lifecycle cause.

============================================================
AS. EXACT BIGINT
============================================================

Use bigint for:

- maxNotional;
- notional;
- maxPositionAbs;
- position/exposure;
- price;
- quantity.

Never use Number for exact financial risk arithmetic.

maxOpenOrders may be a JS number because it is a count if current type defines it so.

============================================================
AT. MULTI-ACCOUNT ISOLATION
============================================================

Risk state and limits are per the exact current keying model.

Account A:
- must not consume B's limits;
- cancellation in A must not release B.

If limits are also market/asset scoped:
respect that current key.

Do not use one global mutable RiskState for all accounts unless current design intentionally keys internal entries.

============================================================
AU. RESET RISK STATE
============================================================

The test reset must clear:

- limits;
- committed states;
- reservation map;
- kill switch;
- any new per-account lock/queue state.

Do not retain stale reservations across tests.

Preserve Task 7 deterministic reset requirements.

============================================================
AV. RISK RULE PRECEDENCE TEST
============================================================

Construct reasoning from current test:

order violates:
- notional;
- open orders.

Expected returned code/rule:
NOTIONAL.

Do not let kill switch/state iteration accidentally change result in the normal non-killed case.

Document exact rule order used.

============================================================
AW. RESPONSE / STATUS CONTRACT
============================================================

Read current `orderController` and `riskController`.

Preserve exact status/error envelopes.

Likely risk rejection is conflict/unprocessable according to current tests.

Do not guess status in implementation if current tests state it.

Keep standard:

{
  error: {
    code: "...",
    details: []
  }
}

where established.

No raw Error object.

============================================================
AX. LIMITS API
============================================================

Risk-controller limits configuration must continue to:
- validate inputs;
- store exact values;
- return expected envelope.

Do not reintroduce Task 9 invalid maxOpenOrders bug.

Do not convert bigint limits through JSON BigInt directly; serialize strings as existing contract expects.

============================================================
AY. ORDER CONTROLLER INTEGRATION
============================================================

The controller is the main risk gate.

Correct order:

1. validate request syntax/value;
2. validate account/status/auth where existing;
3. compute risk request;
4. atomically check/reserve risk;
5. if risk rejected -> respond, no matching mutation;
6. create/place order;
7. reconcile provisional reservation with actual live/resting result;
8. register reservation by order ID only when appropriate;
9. release on matching rejection/non-live outcome according to current model;
10. publish accepted changes.

Do not move risk check after `engine.placeOrder`.

============================================================
AZ. CREATE ORDER ID AND RISK
============================================================

Inspect current flow.

If reservation must be tied to order ID, it is acceptable to generate an ID before risk check as long as:
- generating ID has no book side effect;
- rejected risk does not register a live reservation/order.

Do not confuse ID allocation with order acceptance.

============================================================
BA. MATCHING FILLS AND RISK STATE
============================================================

This is subtle.

Determine from current Challenge 05 source whether position limit means:

A. committed exposure from OPEN orders only;
or
B. actual + committed position including executions.

Do not assume.

Inspect:
- risk domain types;
- tests after fills;
- release logic.

Implement exactly the current model.

If only open-order reservations are modeled:
- full fill releases reservation.

If actual position is modeled:
- transition reservation to actual position instead of simply deleting exposure.

Document this explicitly.

============================================================
BB. AMEND/CANCEL/FILL LIFECYCLE TABLE
============================================================

Before editing, create a private working table:

event
| order live before?
| reservation before?
| risk state change
| reservation after?

Include:

- accepted resting order;
- fully-filled incoming;
- explicit cancel;
- STP cancel;
- maker fully filled;
- matching rejection;
- FOK failure;
- POST_ONLY rejection;
- quantity-decrease amend;
- quantity-increase amend;
- price amend;
- stop trigger.

This prevents reservation leaks/double release.

============================================================
BC. EXPECTED TASK 17 FILE SCOPE
============================================================

Primary likely:

- src/domain/risk.ts
- src/services/riskRegistry.ts
- src/controller/orderController.ts

Likely integration:

- src/controller/riskController.ts

Possibly if lifecycle requires minimal change:

- src/services/matchingEngine.ts

Create/update:

- docs/clearhouse-task-17-risk.md

Do NOT add tests.

Do NOT modify migrations/config/package files.

Do NOT broadly refactor matching.

============================================================
BD. TYPE SAFETY / QUALITY
============================================================

Maintain strict TypeScript.

Avoid:

- any;
- @ts-ignore;
- Number exact arithmetic;
- mutable shared singleton state without account keying;
- check-then-await-reserve race;
- double releases;
- silently clamped negative risk state;
- catch-all successful fallback;
- reservation leaks.

Prefer:

- pure rule evaluation;
- bigint;
- immutable reservation records;
- take-once release;
- atomic synchronous risk admission;
- explicit lifecycle helpers.

============================================================
BE. REQUIRED VERIFICATION — CHALLENGE 05
============================================================

Run:

npm run typecheck

Then:

npm test challenge05.test.ts

This is the primary Task 17 gate.

If the test file has named groups, also run:

npm test challenge05.test.ts -t "Challenge 5a"

npm test challenge05.test.ts -t "Challenge 5b"

npm test challenge05.test.ts -t "Challenge 5c"

npm test challenge05.test.ts -t "Challenge 5d"

Use exact current labels.

============================================================
BF. RISK VALIDATION REGRESSION
============================================================

Run:

npm test challenge00b.test.ts -t "Challenge 0q"

This verifies Task 9 risk-limit input remains correct.

If current label differs, use actual current test.

============================================================
BG. MATCHING REGRESSION
============================================================

Run:

npm test challenge03.test.ts

Task 17 controller/risk lifecycle changes must not break the completed matching engine.

============================================================
BH. PRIOR BUSINESS REGRESSIONS
============================================================

Run:

npm test challenge04.test.ts
npm test challenge02.test.ts
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

Then:

git diff --check

Finally:

npm test

Record future Task 18+ failures honestly.

============================================================
BI. CONCURRENCY FAILURE DIAGNOSIS
============================================================

If Challenge 5c accepts both parallel orders:

inspect:

- check and reserve separated by await;
- state object copied then committed later;
- reservation registered only after matching;
- per-account lock missing;
- reserve function not updating the shared state;
- race between temporary reservation and order ID registration.

Do not add sleeps.

Fix admission atomicity.

============================================================
BJ. CANCEL RELEASE FAILURE DIAGNOSIS
============================================================

If 5a-4 fails:

inspect:

- cancel result not found vs cancelled;
- takeReservation called with wrong ID;
- reservation never registered;
- open count released but exposure not;
- exposure released but open count not;
- double release corrupting state;
- Task 16 registry location stale.

============================================================
BK. PRECEDENCE FAILURE DIAGNOSIS
============================================================

If 5b reports open-order instead of notional:

make rule order explicit.

Do not rely on object iteration.

Check notional calculation exactness and boundaries.

============================================================
BL. KILL SWITCH FAILURE DIAGNOSIS
============================================================

If new orders still accepted:

ensure kill switch is checked in pre-trade risk gate.

If cancellation is blocked:

move kill-switch gate out of cancellation/release path.

If operator can engage switch unexpectedly:

recheck Task 6 role middleware.

============================================================
BM. TASK 17 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-17-risk.md

Include:

1. Starting commit.
2. Working branch task-17.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 05 tests/count.
6. Current score-config entries and 140-vs-visible-score note.
7. RiskLimits model.
8. RiskState model.
9. Reservation model.
10. Notional formula/boundary.
11. Open-order counting semantics.
12. Position/exposure semantics.
13. Rule precedence.
14. Atomic check-and-reserve design.
15. Concurrent 5c strategy.
16. Reservation registration.
17. Cancellation release.
18. STP release.
19. full-fill lifecycle.
20. incoming full-fill/non-resting lifecycle.
21. POST_ONLY/FOK rejection rollback.
22. stop lifecycle if relevant.
23. amendment lifecycle if relevant.
24. kill-switch state.
25. kill-switch authorization.
26. cancellation while killed.
27. reset behavior.
28. exact files changed.
29. typecheck result.
30. 5a result.
31. 5b result.
32. 5c result.
33. 5d result.
34. full Challenge 05 result.
35. Task 0q regression.
36. Challenge 03 regression.
37. Challenge 04 regression.
38. Challenge 02 regression.
39. foundation/sanity.
40. full-suite status.
41. protected-file confirmation.
42. suggested commit.
43. master merge/push workflow.
44. next Task 18: Account Closure.

Do not include secrets.

============================================================
BN. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat

Review:

git diff -- src/domain/risk.ts
git diff -- src/services/riskRegistry.ts
git diff -- src/controller/riskController.ts
git diff -- src/controller/orderController.ts
git diff -- src/services/matchingEngine.ts
git diff -- docs/clearhouse-task-17-risk.md

Only review matchingEngine if actually changed.

Confirm:

- no existing test changed;
- no new test added;
- config unchanged;
- scoring file unchanged;
- package files unchanged;
- .env/.gitignore unchanged;
- tsconfig/vitest unchanged;
- knexfile/migrations/seeds unchanged;
- no test detection;
- no floating-point exact risk arithmetic;
- no Task 18+ work;
- Task 14–16 semantics preserved.

============================================================
BO. TASK 17 COMPLETION CRITERIA
============================================================

Task 17 is COMPLETE only when:

RISK RULES

[ ] current challenge05 read completely.
[ ] current config/scores risk entries inspected read-only.
[ ] max notional implemented.
[ ] notional exact bigint.
[ ] risk rejection occurs before book mutation.
[ ] max open-order rule implemented.
[ ] open-order semantics match current tests.
[ ] max position/exposure implemented.
[ ] signed/gross semantics match current model.
[ ] equality boundaries correct.

PRECEDENCE

[ ] notional precedes open-order violation.
[ ] rule order deterministic.
[ ] exact error identifiers preserved.

RESERVATIONS

[ ] accepted live order reserves correct capacity.
[ ] reservation keyed to correct order.
[ ] cancellation releases open slot.
[ ] cancellation releases exposure.
[ ] release happens exactly once.
[ ] STP cancellation releases risk.
[ ] rejected order leaks no reservation.
[ ] POST_ONLY/FOK rejection leaks no reservation.
[ ] fully non-live incoming order leaks no open slot.
[ ] full-fill lifecycle matches current risk model.
[ ] state never becomes negative.

CONCURRENCY

[ ] check + reserve is atomic.
[ ] no await gap permits stale double admission.
[ ] Challenge 5c accepts exactly one when joint exposure exceeds limit.
[ ] rejected parallel request leaves no state.

KILL SWITCH

[ ] engaged switch rejects new orders.
[ ] cancellation still works.
[ ] switch reset works.
[ ] Task 6 admin protection preserved.

REGRESSION

[ ] Task 9 0q validation passes.
[ ] Challenge 03 passes.
[ ] Challenge 04 passes.
[ ] Challenge 02 passes.
[ ] typecheck passes.
[ ] sanity recorded.
[ ] full suite recorded honestly.
[ ] no tests modified.
[ ] no new tests added.
[ ] package/config/migrations unchanged.
[ ] Task 17 note created.
[ ] final Git target master.

If any Challenge 05 test remains failing:
- status = PARTIAL;
- name exact failing test and root cause.

Do not claim Challenge 05 complete from only prose-visible tests if the current test file contains more.

============================================================
BP. FINAL CURSOR REPORT
============================================================

Return:

1. Task 17 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact changed files.
5. Current Challenge 05 test count.
6. Scoring mismatch note from current config.
7. Notional implementation.
8. Open-order implementation.
9. Position/exposure implementation.
10. Deterministic precedence.
11. Atomic admission strategy.
12. Concurrent joint-limit result.
13. Reservation lifecycle.
14. Cancellation release.
15. STP/full-fill lifecycle.
16. kill-switch behavior.
17. typecheck.
18. Challenge 5a result.
19. Challenge 5b result.
20. Challenge 5c result.
21. Challenge 5d result.
22. full Challenge 05 result.
23. Challenge 0q regression.
24. Challenge 03 result.
25. Challenge 04 result.
26. Challenge 02 result.
27. foundation/sanity.
28. full-suite result.
29. remaining future failures.
30. confirmation protected files unchanged.
31. final diff summary.
32. reviewed Git commands targeting master.

Suggested commit:

feat: implement pre-trade risk limits

Do not automatically commit, merge, or push.
````

---

# Task 17 reference acceptance matrix

| Area | Required behavior |
|---|---|
| Notional | Reject before matching when above limit |
| Arithmetic | Exact BigInt |
| Open orders | Cannot exceed configured live-order limit |
| Position/exposure | Projected committed state must remain within limit |
| Precedence | Notional beats open-order violation |
| Check + reserve | Atomic logical operation |
| Parallel joint breach | Exactly one accepted |
| Cancel | Releases slot + exposure |
| Release | Exactly once |
| STP cancellation | Releases corresponding reservation |
| Rejected policy order | No risk leak |
| Kill switch | Blocks new orders |
| Kill switch + cancel | Cancel still allowed |
| RBAC | Existing admin protection preserved |
| Reset | Clears risk/kill state deterministically |
| Challenge 03 | Must remain passing |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 17

The official final branch is:

**`master`**

Workflow:

**`master` → `task-17` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 17 branch

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
task-17
```

Final branch:

```text
master
```

---

## 2. Final Task 17 verification

```powershell
npm run typecheck

npm test challenge05.test.ts

npm test challenge00b.test.ts -t "Challenge 0q"

npm test challenge03.test.ts

npm test challenge04.test.ts

npm test challenge02.test.ts

npm test challenge01.test.ts

npm test challenge00.test.ts

npm test _sanity.test.ts

git diff --check
```

If Challenge 05 group names exist exactly:

```powershell
npm test challenge05.test.ts -t "Challenge 5a"
npm test challenge05.test.ts -t "Challenge 5b"
npm test challenge05.test.ts -t "Challenge 5c"
npm test challenge05.test.ts -t "Challenge 5d"
```

Then:

```powershell
npm test
```

---

## 3. Review Task 17 changes

```powershell
git status --short
git diff --stat

git diff -- src/domain/risk.ts
git diff -- src/services/riskRegistry.ts
git diff -- src/controller/riskController.ts
git diff -- src/controller/orderController.ts
git diff -- src/services/matchingEngine.ts
git diff -- docs/clearhouse-task-17-risk.md
```

Only expect `matchingEngine.ts` if risk lifecycle truly required a minimal change.

Confirm no protected file changed.

---

## 4. Stage only Task 17 files

Primary expected:

```powershell
git add -- src/domain/risk.ts
git add -- src/services/riskRegistry.ts
git add -- src/controller/orderController.ts
git add -- docs/clearhouse-task-17-risk.md
```

Only if actually changed and required:

```powershell
git add -- src/controller/riskController.ts
git add -- src/services/matchingEngine.ts
```

If another legitimate production file changed:

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

## 5. Review staged content

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached
```

Stop if staged files unexpectedly contain:

- tests/
- config/
- package files
- scoring files
- migrations
- seeds
- .env
- .gitignore
- database config
- unrelated work.

---

## 6. Commit Task 17

```powershell
git commit -m "feat: implement pre-trade risk limits"
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

## 8. Merge Task 17

Prefer:

```powershell
git merge --ff-only task-17
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-17
```

Resolve carefully.

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

Run:

```powershell
npm run typecheck
npm test challenge05.test.ts
npm test challenge03.test.ts
git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge04.test.ts
npm test _sanity.test.ts
```

---

## 10. Push official master

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

Local HEAD must match remote `refs/heads/master`.

---

# If push is rejected

Do not force.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If safe for your local-only Task 17 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge05.test.ts
npm test challenge03.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts deliberately.

---

# Fast Task 17 checklist

- [ ] branch = task-17
- [ ] final branch = master
- [ ] challenge05 fully read
- [ ] config/scores inspected read-only
- [ ] 140-point vs visible-score mismatch documented
- [ ] max notional exact
- [ ] notional checked before book mutation
- [ ] max open orders exact
- [ ] committed position/exposure exact
- [ ] deterministic rule precedence
- [ ] notional precedes open-order failure
- [ ] atomic check + reserve
- [ ] parallel joint breach allows exactly one
- [ ] order reservation registered correctly
- [ ] cancel releases slot
- [ ] cancel releases exposure
- [ ] release exactly once
- [ ] STP cancellation release
- [ ] policy rejection rollback
- [ ] full-fill/non-resting lifecycle correct
- [ ] kill switch rejects new orders
- [ ] cancellation works under kill switch
- [ ] RBAC preserved
- [ ] reset clears risk state
- [ ] BigInt exact
- [ ] Task 9 0q passes
- [ ] Challenge05 passes
- [ ] Challenge03 passes
- [ ] Challenge04 passes
- [ ] Challenge02 passes
- [ ] sanity recorded
- [ ] full suite recorded
- [ ] no tests modified
- [ ] no new tests added
- [ ] package/config/migrations unchanged
- [ ] Task 17 note created
- [ ] committed on task-17
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 18 — Challenge 13: Account Closure.
