# ClearHouse — Complete Enhanced Cursor Prompt for Task 33

**Task:** Challenge 21 — Final Integration  
**Primary scope:** connect the already-implemented matching engine, REST APIs, WebSocket feed, LiveFeed client, netting, fee engine, demo seed, database and dashboard into one consistent end-to-end system  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-33`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 33 purpose

Task 33 implements the full **Challenge 21 — Integration** challenge.

By this point the individual subsystems should already exist:

- exact money/assets/authentication;
- double-entry ledger;
- matching engine;
- holds and atomic settlement;
- risk;
- event sourcing;
- reconciliation;
- API design/cache/versioning;
- operator dashboard;
- account closure;
- netting;
- complex order strategies;
- fee/rebate engine;
- live WebSocket server;
- live dashboard client;
- OpenAPI;
- demo seed/data.

Challenge 21 verifies that these pieces agree with each other **when exercised together through a real server, real sockets, real API calls, real data and the real dashboard code**.

This task is therefore primarily an **integration wiring + source-of-truth consistency task**.

Do not rewrite a subsystem that already passes its dedicated challenge unless the Challenge 21 test proves an actual integration mismatch.

The current CodeCommit checkout and the full `tests/challenge21.test.ts` are authoritative.

---

# Published Challenge 21 contract — 150 points

## 21a — The live order book — 80 pts

### 21a-1 — 40 pts

The order book reconstructed by the browser/client from:

- the WebSocket snapshot;
- subsequent WebSocket depth deltas

must always equal the current order-book depth returned by the HTTP depth endpoint.

The WebSocket stream must have a **gapless topic sequence**.

This requires:

- REST depth;
- WebSocket snapshots;
- WebSocket deltas;
- client `applyBookDelta()`

to use the exact same book-level semantics and ordering.

Do not keep a second independent WebSocket order book.

### 21a-2 — 40 pts

When the server intentionally drops every WebSocket connection:

- the LiveFeed client reconnects;
- it re-subscribes/resumes;
- it obtains a fresh snapshot;
- it re-establishes the correct baseline;
- it catches up to the actual current server book;
- final client-reconstructed book again equals the REST depth endpoint;
- topic sequencing remains coherent according to Challenge 17/18 semantics.

The organizer uses the real `disconnectAll()` / real server behavior.

---

## 21b — From trades to settlement — 40 pts

### 21b-1 — 40 pts

Trades obtained from the real API must integrate correctly with:

- netting;
- participant positions;
- fee/rebate accounting;
- the ledger / fee account as required by the current test.

The netted result must not change any participant's economic position.

Fees must balance exactly.

Important:

- use the exact actual API trade representation;
- do not build an independent fake trade model for integration;
- preserve maker/taker identity;
- preserve exact price/quantity/notional arithmetic;
- preserve asset identity;
- preserve fee idempotency;
- preserve ledger balance.

Read the test to identify whether the integration test:
- transforms trades into netting obligations directly;
- invokes an integration helper/service;
- applies settlement plans;
- prices fees;
- inspects ledger entries;
- or uses a combination.

Do not guess.

---

## 21c — The dashboard on real data — 30 pts

### 21c-1 — 30 pts

After:

- running the real demo seed;
- performing real trading;

the dashboard's:

- portfolio summary;
- account list;
- recent trades

must agree with:

- the real API;
- the real database.

This requires:

- seed/account balances;
- trading effects;
- API serializers;
- dashboard exact-value aggregation;
- recent-trade ordering/limit;
- status/asset formatting

to share the same truth.

Do not fabricate dashboard-only totals or trades.

---

# Challenge 21 score map

```text
21a-1 = 40
21a-2 = 40
21b-1 = 40
21c-1 = 30
----------------
Total  = 150
```

These are available points only, not an earned-score claim.

---

# Task 33 guiding principle — one source of truth

Challenge 21 is likely to expose failures caused by duplicated state.

Avoid creating:

- one order book for REST and another for WebSocket;
- one trade list for the API and another for fees/netting;
- one account/balance model for the dashboard and another in the database;
- one sequence counter in server integration and another in `liveHub`;
- one recent-trades array used only by the UI.

Prefer wiring existing components to the existing canonical state.

---

# Integration map to verify before editing

Cursor must inspect the current repository and identify the exact path for:

```text
Order HTTP request
  -> authentication / authorization
  -> account-open check
  -> risk reservation
  -> matching engine
  -> trades
  -> live order-book depth change
  -> WebSocket depth publish
  -> trade/event persistence or in-memory trade registry
  -> fee processing if/where integration requires
  -> settlement if/where integration requires
  -> REST trade API
  -> dashboard / netting consumers
```

Do not assume all of those steps belong in one controller.

Document the actual current architecture before changing it.

---

# Critical 21a invariant — REST depth and WebSocket share the same book

The strongest architecture is:

```text
canonical matching engine book
        |
        +--> depth endpoint snapshot
        |
        +--> liveHub snapshot provider
        |
        +--> before/after depth diff -> liveHub.publish(delta)
```

Do NOT maintain:

```text
REST book state
WS book state
```

separately.

If the WebSocket snapshot provider currently points to a stale copy, fix the provider/wiring—not the matching algorithm unless its own challenge regressed.

---

# Critical 21a invariant — publish after every tested book mutation

The integration test may modify the book through:

- new resting order;
- order match/partial fill;
- full fill removing a level;
- cancellation;
- amendment;
- stop activation;
- strategy-generated child order, if included.

Read `challenge21.test.ts` to determine the exact mutation paths it uses.

For every path the integration test exercises:

1. capture the canonical previous depth at the correct boundary;
2. execute the mutation;
3. obtain canonical next depth;
4. compute `diffDepth(previous, next)` using Task 31 logic;
5. if there is a meaningful change, publish the exact delta on the exact topic;
6. REST depth returns the same `next` state.

Do not publish guessed deltas from request intent.

For example:
- an incoming order may be fully matched and never rest;
- a cancel may remove one level or only reduce aggregate quantity;
- an amend may move price/priority.

Always diff actual before/after canonical depth.

---

# Critical 21a invariant — no duplicate publishing

Do not publish the same logical book transition from:

- controller;
- matching engine;
- event listener

all at once.

Find one integration boundary.

One logical book mutation should produce the exact expected delta publish once.

Task 31's topic sequence increments once per `publish()`.

Duplicate publishing therefore creates:
- wrong sequence;
- duplicate client changes;
- Challenge 21a failure.

---

# Critical 21a invariant — snapshot and delta serialization match

If the REST endpoint represents depth like:

```text
{
  bids: [...],
  asks: [...]
}
```

then the WebSocket snapshot/delta protocol and client application must be compatible.

Do not:
- string-format prices differently between REST and WS;
- sort bids differently;
- include zeros in one path but not another;
- aggregate at different price-level granularity.

Read exact test equality comparison.

---

# Critical 21a reconnect invariant

Task 31 `disconnectAll()` must:

- drop sockets with code 1012;
- leave hub active;
- preserve topic state/sequence unless the test says otherwise.

Task 32 LiveFeed must:

- detect the disconnect;
- reconnect with its exact backoff;
- re-subscribe;
- start without trusted baseline;
- accept a fresh snapshot;
- continue from the server's current book state.

Task 33 should wire these existing semantics together.

Do not reset the matching engine merely because WebSocket clients reconnect.

Do not reset server topic sequence merely because all clients were dropped.

---

# Critical 21b invariant — trades have one canonical representation

Identify the actual canonical trade record.

The API, fee engine and netting integration may use different input shapes.

Task 33 may need a **small explicit adapter**, but not separate truth.

The adapter must preserve exact:

- trade/fill identity;
- buyer/seller or maker/taker account IDs;
- side roles;
- base/quote asset;
- price;
- quantity;
- timestamp/sequence if relevant;
- notional definition.

Do not use `Number` for financial values.

---

# Critical 21b invariant — netting preserves economic positions

If API trades are transformed into obligations, the original trade obligations and netted transfers must produce the same per-account/per-asset net vector.

Challenge 14 already guarantees the netting algorithm itself.

Task 33 must ensure the **adapter into Challenge 14** is correct.

Do not accidentally:

- reverse payer/receiver;
- net base and quote together;
- use maker/taker where buyer/seller is required;
- use price as amount instead of notional;
- lose quantity/base-leg obligations.

Read the exact Challenge 21 integration oracle.

---

# Critical 21b invariant — exact fees

The Challenge 16 fee engine already owns:

- exact rate arithmetic;
- signed half-even rounding;
- maker/taker volume tiers;
- ledger posting;
- fill idempotency.

Task 33 should reuse it.

Do not recalculate fees in a controller with:

```text
price * quantity * percentage
```

using JavaScript Number.

Do not post duplicate fees for an API trade that the fee engine already processed during execution.

Read whether Challenge 21:
- expects fees to be processed automatically when the trade occurs;
- or explicitly passes API trades to fee integration after fetching them.

Avoid double processing.

---

# Critical 21b invariant — fee ledger remains balanced

Any integration-created fee posting must still satisfy Task 10 / Challenge 16:

- balanced independently per asset;
- correct fee-account direction;
- rebates reverse direction;
- idempotent per fill/trade;
- no accidental duplicate entry.

The fee-account net must equal the exact fees collected less rebates according to the test.

---

# Critical 21c invariant — dashboard uses real API data

The Challenge 20 dashboard functions should consume real responses from:

- accounts API;
- risk API;
- trades API;
- other existing tested endpoints.

Do not create a dashboard-specific hardcoded "demo state".

After real trading:

- account balances/holdings displayed must reflect actual database/API state;
- portfolio totals must aggregate those same holdings;
- recent trades must come from the real API trade source.

---

# Critical 21c invariant — recent trades are canonical

Identify where executed trades are stored for API retrieval.

Do not keep:
- one matching-engine `trades` array;
- another integration `recentTrades` array

that can drift.

If a repository/service already owns trade history, use it.

If Challenge 03 matching returns trades but there is no canonical API persistence, inspect the current starter and `challenge21.test.ts` to determine the intended integration point.

Do not invent a new DB table unless the test/current architecture explicitly requires it.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 33

Copy the complete block below into Cursor Agent mode.

````text
Act as my senior TypeScript/JavaScript integration engineer, fintech systems engineer, real-time architecture reviewer, exact-accounting reviewer, and end-to-end debugging engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 33 ONLY: implement Challenge 21 — Integration — completely and correctly.

Preserve all completed Tasks 1–32.

This task must connect already-correct components into a coherent system.

Do NOT rewrite whole subsystems merely because an integration test fails.

Do not stop at a plan. Inspect the full Challenge 21 test, map the integration flow, run a truthful baseline, fix the minimum real integration defects, run focused and broad regressions, create the Task 33 engineering note, and show reviewed Git commands.

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

task-33

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–32;
- work on task-33;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not automatically commit, merge, or push.

============================================================
B. STRICT TASK 33 SCOPE
============================================================

IMPLEMENT ONLY THE INTEGRATION REQUIRED BY CHALLENGE 21:

Challenge 21a:
- REST depth and WebSocket live book share canonical matching state;
- correct snapshots;
- correct actual depth deltas;
- one publish per real book transition;
- gapless sequence;
- real reconnect after server disconnectAll;
- fresh snapshot/resync and catch-up.

Challenge 21b:
- real API trades can be transformed/consumed correctly by netting/fee integration;
- netting preserves every position;
- exact fee/rebate results;
- balanced fee ledger;
- no duplicate fee processing.

Challenge 21c:
- after real seed + real trades, dashboard summary/account list/recent trades match API/database.

PRESERVE:
- all dedicated challenge behavior already implemented.

DO NOT IMPLEMENT:
- Task 34 broad regression repair beyond proven integration defects;
- Task 35 manual browser/demo polish beyond Challenge21;
- Task 36 final submission packaging;
- unrelated features.

============================================================
C. STRICT ORGANIZER / FILE RULES
============================================================

Do NOT modify organizer tests.

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
- grading/result scripts

Seed files:
- Task 23 legitimately implemented Challenge 20 demo seeding.
- Do NOT modify seeds in Task 33 unless `challenge21.test.ts` proves a genuine integration mismatch that cannot be fixed elsewhere.
- Prefer consuming existing seed behavior.

Do NOT:
- weaken integration assertions;
- skip real WebSocket tests;
- increase timeouts;
- fake HTTP/WebSocket responses;
- detect challenge21 in source;
- hardcode known account IDs/trade IDs;
- hardcode organizer book snapshots;
- hardcode sequence numbers;
- use test-only branches.

Do NOT use floating point for financial values.

No destructive Git:
- no reset --hard;
- no clean -fd;
- no force push;
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
git log -20 --oneline --decorate
git diff --stat
git diff --cached --stat

Confirm:
- origin = official CodeCommit remote;
- master = official final submission branch.

Verify Task 32 is represented on master:

git log --oneline --decorate --max-count=25 master

If task-32 exists:

git log --oneline --decorate --max-count=10 task-32

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-33

If task-33 already exists:

git branch --list task-33
git log --oneline --decorate --max-count=10 task-33

Do not delete/recreate blindly.

Record:
- starting commit;
- current branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
E. READ THE EXACT CHALLENGE 21 TEST
============================================================

Read:

tests/challenge21.test.ts

from first line to last line.

Read:

config/scores.ts

READ ONLY.

Do not start coding before this.

Build an exact matrix:

test
| points
| setup
| server/API operations
| socket/client operations
| database assertions
| imports
| expected result
| current failure
| likely integration boundary

Record:
- exact test count;
- exact subtest names;
- exact routes;
- exact WS topic;
- exact socket authentication mechanism;
- exact order mutations performed;
- exact depth payload shapes;
- exact comparison method;
- exact disconnect/reconnect sequence;
- exact trade API route;
- exact trade record shape;
- exact netting adapter/helper expected;
- exact fee helper/engine integration expected;
- exact dashboard functions/DOM asserted;
- exact seed invocation;
- exact database rows/tables inspected.

DO NOT GUESS.

============================================================
F. READ ALL RELEVANT EXISTING ENGINEERING NOTES
============================================================

Read if present:

- docs/clearhouse-task-10-ledger.md
- docs/clearhouse-task-13-atomic-settlement.md
- docs/clearhouse-task-14-basic-matching.md
- docs/clearhouse-task-16-advanced-matching.md
- docs/clearhouse-task-17-risk.md
- docs/clearhouse-task-21-api-cache-performance.md
- docs/clearhouse-task-22-dashboard.md
- docs/clearhouse-task-23-demo-data.md
- docs/clearhouse-task-24-portfolio-risk-trades-dashboard.md
- docs/clearhouse-task-26-events-replay.md
- docs/clearhouse-task-28-fee-rebate-engine.md
- docs/clearhouse-task-29-netting.md
- docs/clearhouse-task-31-websocket-feed.md
- docs/clearhouse-task-32-live-dashboard-updates.md

Names may differ.

Find actual files.

These notes are secondary.

The source/tests remain authoritative.

============================================================
G. MAP THE ACTUAL INTEGRATION FLOW
============================================================

Search:

rg -n "depth\(|depthRoute|orderBook|matching|liveHub|publish|diffDepth|trades|recentTrades|fee|netting|accounts|dashboard|seed" src client db tests

PowerShell fallback:

Get-ChildItem -Recurse src,client,db,tests -File |
  Select-String -Pattern "depth\(|depthRoute|orderBook|matching|liveHub|publish|diffDepth|trades|recentTrades|fee|netting|accounts|dashboard|seed"

Identify exact current files/functions for:

1. order placement HTTP endpoint;
2. order cancel/amend endpoint;
3. matching engine singleton/instance;
4. depth endpoint;
5. depth snapshot function;
6. liveHub topic snapshot provider;
7. liveHub publish function;
8. diffDepth;
9. browser LiveFeed;
10. applyBookDelta;
11. trade history source;
12. trades API;
13. fee engine instance/helper;
14. netting function;
15. settlement if used by Challenge21;
16. accounts API;
17. dashboard render/account/summary/trade functions;
18. demo seed.

Create a flow diagram in the Task33 note.

============================================================
H. BASELINE DEDICATED CHALLENGES BEFORE INTEGRATION
============================================================

Before editing, run:

npm run typecheck

npm test challenge03.test.ts
npm test challenge14.test.ts
npm test challenge16.test.ts
npm test challenge17.test.ts
npm test challenge18.test.ts
npm test challenge20.test.ts

If any of these dedicated challenges already fail:
- record exact failure;
- do not falsely classify it as only a Challenge21 integration bug;
- fix only if the same defect is necessary for Task33 and does not expand scope.

Then run:

npm test challenge21.test.ts

Record every integration failure.

============================================================
I. CHALLENGE 21A-1 — IDENTIFY THE CANONICAL ORDER BOOK
============================================================

Determine exactly which matching-engine instance/state is used by:
- order placement;
- cancel/amend;
- REST depth endpoint.

That instance/state is the canonical source.

The WebSocket feed MUST observe the same state.

Do not instantiate a second matching engine inside liveHub.

Do not reconstruct the server book from WebSocket deltas.

============================================================
J. REST DEPTH ENDPOINT
============================================================

Read the exact depth endpoint.

Record:
- route path;
- auth;
- response envelope;
- bid/ask level shape;
- price/qty serialization;
- sort order;
- aggregation by price;
- empty result.

Do not change the public format unless Challenge21 proves a mismatch and dedicated API tests permit the correct existing contract.

============================================================
K. LIVEHUB SNAPSHOT PROVIDER
============================================================

Read Task31 hub topic registration/snapshot provider.

The book topic snapshot must derive directly from the canonical current depth.

Do not cache a stale snapshot independently unless invalidated on every book transition.

Best:
snapshot provider calls canonical depth function synchronously at subscription/resync boundary.

Preserve Task31 snapshot/sequence atomicity.

============================================================
L. BOOK DELTA PUBLICATION BOUNDARY
============================================================

Find the minimal single place to observe each tested book mutation.

Do not publish from multiple layers.

Potential integration boundary:
controller/service around matching operation.

Conceptually:

before = canonicalDepth()

result = performBookMutation()

after = canonicalDepth()

delta = diffDepth(before, after)

if delta is non-empty:
    liveHub.publish(bookTopic, delta)

Use actual current types.

Do not place this exact code blindly if there is an existing event/hook architecture.

Prefer existing hook.

============================================================
M. CAPTURE DEPTH BEFORE MUTATION
============================================================

The "previous" book for diff must be the real state immediately before the mutation.

Do not use:
- last published snapshot if it can lag;
- browser state;
- request payload.

Use canonical matching depth.

============================================================
N. COMPUTE DEPTH AFTER ALL MATCHING SIDE EFFECTS
============================================================

For a new order:
matching may:
- fully consume resting orders;
- partially consume;
- rest remainder;
- trigger stops;
- activate strategy child behavior if wired.

The delta must represent the final canonical depth after the tested transaction/event boundary.

Do not publish an intermediate wrong state unless Challenge21 expects each individual internal transition.

Read test event expectations.

============================================================
O. PUBLISH ONLY REAL CHANGES
============================================================

If before and after depth are identical:
do not publish an empty/no-op delta unless the protocol/test explicitly expects a sequence for every attempted mutation.

Challenge18 sequence advances per publish.

Unnecessary no-op publish can break Challenge21 expected sequences.

Read test.

============================================================
P. ONE LOGICAL CHANGE = ONE INTENDED PUBLISH
============================================================

Search for existing calls to liveHub.publish.

Do not add a second duplicate call.

If existing call publishes incorrect payload:
fix it rather than layering another.

Use instrumentation/temporary local reasoning, but remove debug logging.

============================================================
Q. CANCEL / AMEND INTEGRATION
============================================================

Challenge21 may mutate book through cancel/amend.

If so:
ensure same live publication hook covers those operations.

Do not fix only order placement.

Before/after depth diff naturally handles:
- removed price level;
- changed aggregate quantity;
- moved price.

============================================================
R. MATCH EXECUTIONS AND BOOK DEPTH
============================================================

A trade can alter:
- resting level quantity;
- remove resting level;
- incoming remainder level.

The delta must reconstruct exactly the REST book.

Task31 diffDepth + Task32 applyBookDelta should compose:

applyBookDelta(previous, diffDepth(previous, next)) == next

Preserve this property end-to-end.

============================================================
S. DEPTH SERIALIZATION CONSISTENCY
============================================================

REST depth and WS snapshot/delta may have boundary serializers.

Ensure exact semantic values are identical.

If REST uses strings for BigInt:
WS should use compatible strings.

Do not convert via Number.

If client converts internally:
do so exact.

============================================================
T. 21A-1 SEQUENCE
============================================================

Task31 liveHub owns the sequence.

Integration code MUST NOT assign its own seq.

Call:

publish(topic, payload)

or actual API and let hub assign exactly one next sequence.

Do not pass a guessed seq unless publish API requires data without seq and adds it itself.

No parallel sequence counter in controller.

============================================================
U. 21A-1 TEST STRATEGY
============================================================

After integration:
run 21a-1 alone if label exists.

When failing, compare after each mutation:

- REST depth;
- client's reconstructed depth;
- last delivered WS sequence;
- server topic sequence;
- actual delta.

Find first divergence.

Do not patch final state only.

============================================================
V. CHALLENGE 21A-2 — REAL DISCONNECT
============================================================

Read exact test.

The organizer may call:
- hub.disconnectAll();
- an exposed integration helper;
- server component.

Do not simulate reconnect.

Use real Task31 disconnectAll.

Code 1012 must trigger the real Task32 reconnect flow.

============================================================
W. DISCONNECTALL MUST NOT RESET BOOK
============================================================

Dropping sockets must not:
- reset matching engine;
- clear liveHub topic sequence;
- clear server depth;
- clear trades;
- close HTTP server.

Only client connections are dropped.

Task31 dedicated test must remain passing.

============================================================
X. ORDERS DURING DISCONNECT WINDOW
============================================================

Challenge21a-2 may modify the order book while client is disconnected/reconnecting.

Those mutations must:
- update canonical book;
- update liveHub topic state/sequence through normal publication even if no subscribers;
- be represented by the fresh reconnect snapshot.

Do not skip `publish` just because subscriber count is zero if topic sequence/state semantics require it.

Read liveHub design.

============================================================
Y. RECONNECT SNAPSHOT
============================================================

On reconnect/resubscribe:
Task31 snapshot provider returns the CURRENT canonical depth, not old cached depth.

Snapshot sequence = current topic sequence.

Task32 invalidates old baseline and adopts fresh snapshot.

Do not try to manually replay all old deltas unless protocol/test says so.

============================================================
Z. RECONNECT CATCH-UP
============================================================

After snapshot:
future deltas continue with next sequence.

Final client book must equal REST depth.

If more mutations occur while/after reconnect:
they must not be lost between snapshot and subscription activation.

Task31 atomic snapshot/subscription boundary must remain correct.

============================================================
AA. 21A-2 FAILURE DIAGNOSIS
============================================================

If client reconnects but final book is stale:
- snapshot provider cached;
- integration not publishing mutations during disconnect;
- client baseline not reset;
- old socket event corruption.

If sequence gap:
- topic sequence reset;
- duplicate publish;
- no-op publish mismatch;
- mutation path missing publish.

If reconnect never occurs:
Task32 regression, not book wiring.

============================================================
AB. CHALLENGE 21B — READ EXACT TRADE API
============================================================

Identify exact route used by test.

Record:
- route;
- response envelope;
- trade ordering;
- field names;
- IDs;
- account roles;
- asset fields;
- price/quantity representations;
- timestamps.

Do not write integration adapter before this.

============================================================
AC. CANONICAL TRADE HISTORY
============================================================

Identify who owns historical executed trades.

Possibilities:
- matching engine;
- repository/table;
- service;
- event log.

There must be one canonical source feeding the API.

If controller stores duplicate trade history in another array:
remove/avoid divergence only if safe and covered.

Do not create a new "integrationTrades" cache.

============================================================
AD. TRADE IDENTITY
============================================================

Challenge16 fee idempotency requires stable fill identity.

Challenge21 adapter must map API trade to the exact stable ID used/expected by fee engine.

Do not generate a fresh UUID every time GET /trades is read.

The same historical trade must map to the same fill identity.

Otherwise fees can be duplicated on replay.

============================================================
AE. MAKER / TAKER IDENTITY
============================================================

Fee engine tiers depend on maker vs taker.

Do not derive maker/taker from:
- buy vs sell;
- API array order.

Use actual trade/matching metadata.

If current Trade API lacks maker/taker metadata but Challenge21 needs it:
inspect intended starter adapter/tests before adding fields.

Do not break Challenge03 public trade shape or Challenge11 API envelope.

============================================================
AF. BUYER / SELLER IDENTITY
============================================================

Netting/settlement may need buyer and seller roles rather than maker/taker.

Preserve both concepts correctly.

Do not use maker as seller automatically.

Buy/sell side and liquidity role are independent.

============================================================
AG. BASE / QUOTE LEGS
============================================================

Read the actual trading model.

A trade may produce two economic legs:
- base asset quantity;
- quote asset notional.

Challenge21 netting may transform one or both into obligations.

Do not assume only one money transfer.

Use exact test oracle.

Do not cross-net assets.

============================================================
AH. EXACT NOTIONAL
============================================================

If quote notional = price × quantity under current model:
use exact BigInt/current scaling.

Do not:
- Number(price);
- Number(quantity);
- parseFloat;
- floating multiplication.

If price/quantity have scale/exponents:
use the exact existing settlement/fee formula.

Do not invent scaling.

============================================================
AI. NETTING ADAPTER
============================================================

Challenge14 `netObligations(...)` or actual function expects an `Obligation` shape.

Build a small deterministic adapter from the API trade representation to that exact shape if needed.

Requirements:
- correct payer;
- correct receiver;
- correct asset;
- exact amount;
- deterministic order if input ordering matters only for adapter output (netting itself canonical).

Do not mutate API trades.

============================================================
AJ. NET POSITION VERIFICATION
============================================================

For Challenge21b:
the obligations created from API trades and the netting transfer plan must have identical per-account/per-asset net vectors.

Use Challenge14 output.

Do not implement a second netting algorithm.

If positions differ:
the adapter is wrong unless Challenge14 dedicated test regressed.

============================================================
AK. FEE ADAPTER
============================================================

Challenge16 fee engine expects its current Fill type.

Map canonical API/matching trade to that exact fill shape.

Preserve:
- stable fill ID;
- maker account;
- taker account;
- notional basis;
- timestamp;
- asset;
- other tested fields.

Do not mutate the fee-engine public API unnecessarily.

============================================================
AL. FEE PROCESSING OWNERSHIP
============================================================

Critical:

Determine whether fees are already automatically processed when trades occur.

If YES:
Challenge21 should inspect/reuse those existing results/ledger entries.
Do NOT process again merely because the integration test fetches trades.

If NO and Challenge21 explicitly requires adapter processing:
process each canonical trade exactly once according to test.

Use fee idempotency.

Document this decision.

============================================================
AM. FEE SCHEDULE / OPTIONS
============================================================

Do not invent a new fee schedule for integration.

Read how Challenge21 constructs/configures the fee engine.

If it supplies schedule:
use it.

If app has configured schedule:
use canonical one.

Do not hardcode visible rates.

============================================================
AN. FEE LEDGER
============================================================

Reuse Challenge16 balanced fee posting.

Do not manually insert one-sided fees.

After integration:
- ledger entries balance;
- fee account net matches exact fees;
- rebates reverse direction;
- duplicate trade processing no second posting.

============================================================
AO. SETTLEMENT IN 21B
============================================================

The Challenge title says "From trades to settlement", but the published assertion specifically mentions:
- netting;
- positions unchanged;
- fees balance.

Read the exact test before adding balance mutations.

If it only computes netting/fees:
do not physically settle again.

Trades may already have been settled by Challenge04 integration.

Double settlement would corrupt balances.

If test explicitly applies a net settlement:
reuse existing atomic settlement helpers.

No second settlement engine.

============================================================
AP. CHALLENGE 21B FAILURE DIAGNOSIS
============================================================

If netted positions differ:
inspect adapter roles/assets/amounts.

If fees differ:
inspect maker/taker/notional/rate/timestamp mapping.

If ledger unbalanced:
do not weaken ledger assertion; inspect fee posting.

If balances double-move:
settlement executed twice.

If fees duplicate:
unstable fill ID or double integration ownership.

============================================================
AQ. CHALLENGE 21C — SEED BASELINE
============================================================

Read exact seed command/helper used in test.

Task23 guarantees:
- at least five funded trading accounts;
- at least two known assets each;
- balanced initial funding;
- idempotent rerun.

Do not rewrite the seed.

Challenge21 adds trading after seed.

The resulting API/database/dashboard must agree.

============================================================
AR. DATABASE RESET / SEED TEST LIFECYCLE
============================================================

Do not run destructive resets beyond organizer/test commands.

In production source, do not reset data.

Understand whether Challenge21 test creates its own temp DB or uses configured DB.

Do not hardcode main.sqlite3 path.

============================================================
AS. ACCOUNTS API AS DASHBOARD SOURCE
============================================================

Task23 accounts API should read canonical accounts/balances.

Task24 dashboard account list/portfolio should consume this shape.

Ensure integration wiring uses the real API response envelope from Task21.

Do not feed dashboard raw DB objects if the application path uses HTTP.

Challenge21 may call render functions directly with API-like payload; follow exact test.

============================================================
AT. STORED BALANCE VS LEDGER TRUTH
============================================================

Challenge20 seed verified stored balances agree with ledger.

After trading:
Challenge21 may inspect DB stored balances.

Any trading/settlement integration must maintain the same consistency.

Do not only update ledger and leave projection rows stale.
Do not only update balance rows without ledger if settlement contract requires ledger.

Reuse Challenge04 settlement.

============================================================
AU. RECENT TRADES API
============================================================

Task24 recent-trades renderer needs real trade data.

Identify route/source.

After new trades:
API must expose them.

Do not require browser refresh of hardcoded seed trade fixtures.

Use canonical history.

============================================================
AV. RECENT TRADE ORDERING
============================================================

Challenge20 requires:
- at most 10;
- newest first.

Challenge21 may compare real API results to dashboard.

Ensure:
- API ordering;
- dashboard ordering

are compatible.

Do not sort one by UUID and another by timestamp.

Use canonical chronology/sequence.

============================================================
AW. RECENT TRADE NOTIONAL
============================================================

Dashboard must display exact notional.

Use Task24 exact formatter.

Do not recompute through floating point.

If API provides price/quantity strings:
derive with BigInt/current scale.

============================================================
AX. PORTFOLIO SUMMARY
============================================================

Dashboard summary must aggregate exact balances from accounts API.

After trading:
totals should equal API/database.

Do not cache initial seed totals forever.

If Task24 uses startup fetch:
Challenge21 may invoke refresh/render after trades.

Read exact test.

============================================================
AY. ACCOUNT LIST
============================================================

Dashboard must show all accounts from real API by name with:
- exact holdings;
- status badge.

Do not filter out fee/clearing accounts unless API/test expects only trading accounts.

Read Challenge20/21.

Do not hardcode names.

============================================================
AZ. DASHBOARD CACHE / REFRESH
============================================================

If app caches API data:
ensure Challenge21 refresh path invalidates/reloads after real trading as expected.

Do not globally disable Task21 caching.

Use correct cache invalidation tied to writes.

Do not solve by TTL=0.

============================================================
BA. LIVE DASHBOARD VS SUMMARY DATA
============================================================

Challenge17 live feed may update the order book only.

Challenge21c summary/accounts/recent trades may still be loaded through API.

Do not assume WebSocket feed contains account balances unless protocol defines it.

Use correct source per view.

============================================================
BB. RESPONSE ENVELOPES
============================================================

Task21 standardized:

success:
{ data, meta }

errors:
{ error: { code, details } }

Integration client/dashboard must unwrap the exact current envelope.

Do not add ad-hoc route-specific exceptions.

Challenge11 must remain passing.

============================================================
BC. REAL SERVER STARTUP
============================================================

Challenge21 uses a real server.

Ensure:
- liveHub attaches exactly once;
- server shares canonical services/instances;
- no duplicate matching engine created per import;
- test-created server lifecycle can close cleanly;
- no timers leak.

Do not auto-listen at module import if current tests expect exported server/app.

Preserve server architecture.

============================================================
BD. SINGLETON VS FACTORY OWNERSHIP
============================================================

Inspect module lifecycle.

A common integration failure:
- controller imports matching singleton A;
- depth endpoint imports singleton B;
- liveHub snapshot imports singleton C.

Even identical code produces divergent state.

Ensure all three consume the same intended instance.

Do not introduce module-global singleton blindly if tests instantiate isolated engines.

Use existing dependency injection/factory architecture.

Challenge21 imports reveal intended ownership.

============================================================
BE. TEST ISOLATION
============================================================

Challenge21 may create multiple app/server instances across tests.

Do not let:
- liveHub topic sequence;
- matching book;
- trade history;
- fee engine volume state

leak across test instances unless architecture explicitly uses process singleton and reset hooks.

Preserve dedicated challenge isolation semantics.

Do not add NODE_ENV test resets.

============================================================
BF. PUBLISH TRANSACTION BOUNDARY
============================================================

Do not publish a book state that later rolls back due to:
- risk failure;
- account closed;
- settlement failure;
- DB transaction failure.

Read current order flow.

Ideally publish after the book mutation is considered committed/successful at the application boundary.

But in-memory matching mutation may occur before DB settlement.

Challenge13 noted DB rollback does not automatically restore in-memory matching state.

Inspect Challenge21 scenario carefully.

Do not make integration inconsistency worse.

============================================================
BG. ORDER FAILURE MUST NOT PUBLISH
============================================================

Rejected order due to:
- validation;
- auth;
- risk;
- closed account;
- POST_ONLY/FOK policy

must not produce a fake depth delta unless matching state genuinely changed according to existing policies.

Use before/after depth comparison after successful path.

============================================================
BH. STP / INTERNAL CANCELLATION
============================================================

If an accepted order causes STP cancellation or internal book change:
the canonical depth change must be published if Challenge21 path exercises it.

Do not only listen to external cancel endpoint.

Again:
publish actual before/after depth.

============================================================
BI. STRATEGY CHILD ORDERS
============================================================

Only integrate Challenge15 strategy child actions into live depth if Challenge21 explicitly exercises them.

Do not broaden final integration unnecessarily.

If it does:
route child actions through the same canonical order path and publication boundary where possible.

No special second WebSocket path.

============================================================
BJ. EVENT SOURCING
============================================================

Task26 event sourcing may record domain events.

Do not make event replay a second source of current book unless current architecture/test expects it.

If Challenge21 expects event publishing:
read exact test.

No speculative integration.

============================================================
BK. MARKET DATA
============================================================

Challenge27 OHLCV may use executed trades.

Do not integrate candles into Challenge21 unless test requires.

The published Challenge21 contract doesn't mention candles.

Preserve Challenge08 regression.

============================================================
BL. NETTING DOES NOT MUTATE ORIGINAL TRADES
============================================================

Challenge14 netting should be pure.

Adapter must not mutate API trade list.

Challenge21 may reuse trades for fee check after netting.

Keep input immutable.

============================================================
BM. FEE ENGINE DOES NOT MUTATE API TRADES
============================================================

Same.

Map/copy to fee Fill type if necessary.

Stable IDs preserved.

Do not attach fee properties directly to API trade objects unless public contract explicitly does so.

============================================================
BN. BIGINT / JSON BOUNDARIES
============================================================

Server internal exact values may be bigint.

HTTP/WS JSON must serialize to exact decimal strings.

Client/dashboard converts only as needed using BigInt or exact formatters.

Never bridge through Number for:
- prices;
- quantities;
- balances;
- notional;
- fees;
- net transfers.

Timer/sequence fields can remain ordinary number where defined.

============================================================
BO. ASSET EXPONENTS
============================================================

Dashboard formatting must use Task4 asset exponents.

Do not assume 2 decimals for every asset.

Challenge20 already covers exponent-aware holdings.

Challenge21 checks after real data/trading.

Preserve:
- JPY 0;
- BHD 3;
- BTC 8;
- etc. according to actual registry.

Do not hardcode in Task33 if registry helper exists.

============================================================
BP. NO FAKE INTEGRATION SERVICE
============================================================

Do not create one huge `integrationService.ts` that duplicates:
- matching;
- fee arithmetic;
- netting;
- settlement;
- dashboard totals.

If a small orchestration service is already intended, it should call existing modules.

The challenge rewards integration, not duplication.

============================================================
BQ. MINIMUM CHANGE PRINCIPLE
============================================================

For each Challenge21 failure ask:

1. Which two previously-correct components disagree?
2. Where is the missing/incorrect adapter or hook?
3. What is the smallest change that lets them share truth?
4. Which dedicated challenge must be rerun?

Avoid broad refactors during final integration.

============================================================
BR. EXPECTED TASK 33 FILE SCOPE
============================================================

The exact files depend on Challenge21 failures.

Potential production files MAY include:

- src/server.ts
- src/services/liveHub.ts
- actual order controller/service
- actual matching service wrapper
- actual trade API/service/repository
- a small existing integration/orchestration helper
- client/js/liveFeed.js
- client/js/dashboard.js
- client/js/app.js

But do NOT edit all of these automatically.

Edit only proven integration boundaries.

Create/update:

docs/clearhouse-task-33-integration.md

Normally do NOT change:
- domain matching algorithm;
- domain netting algorithm;
- fee rounding algorithm;
- DB schema/migrations;
- protected config/tests;
unless a real defect proven by both integration and dedicated tests requires a minimal fix.

============================================================
BS. CHALLENGE 21A FOCUSED VERIFICATION
============================================================

After 21a changes:

npm run typecheck

Run:

npm test challenge21.test.ts -t "Challenge 21a"

Use actual label.

Then:

npm test challenge17.test.ts
npm test challenge18.test.ts
npm test challenge03.test.ts
npm test challenge11.test.ts
npm test challenge12.test.ts

If a depth/market helper changed:

npm test challenge08.test.ts

Do not proceed to 21b until 21a is understood/passing or clearly isolated.

============================================================
BT. CHALLENGE 21B FOCUSED VERIFICATION
============================================================

After 21b changes:

npm test challenge21.test.ts -t "Challenge 21b"

Then:

npm test challenge14.test.ts
npm test challenge16.test.ts
npm test challenge04.test.ts
npm test challenge02.test.ts
npm test challenge03.test.ts
npm test challenge09.test.ts

If trade API changed:

npm test challenge11.test.ts
npm test challenge20.test.ts

============================================================
BU. CHALLENGE 21C FOCUSED VERIFICATION
============================================================

After 21c changes:

npm test challenge21.test.ts -t "Challenge 21c"

Then:

npm test challenge20.test.ts
npm test challenge12.test.ts
npm test challenge11.test.ts
npm test challenge13.test.ts
npm test challenge02.test.ts
npm test challenge04.test.ts

If app/live client files changed:

npm test challenge17.test.ts
npm test challenge18.test.ts

============================================================
BV. FULL CHALLENGE 21
============================================================

Run:

npm test challenge21.test.ts

Record:
- exact test count;
- pass/fail for 21a-1;
- 21a-2;
- 21b-1;
- 21c-1.

Filtered-out tests are not passed.

============================================================
BW. BROAD REGRESSION — ALL FEATURE CHALLENGES
============================================================

Task33 is integration, so run every major dedicated feature challenge affected by wiring.

At minimum:

npm test challenge01.test.ts
npm test challenge02.test.ts
npm test challenge03.test.ts
npm test challenge04.test.ts
npm test challenge05.test.ts
npm test challenge06.test.ts
npm test challenge08.test.ts
npm test challenge09.test.ts
npm test challenge10.test.ts
npm test challenge11.test.ts
npm test challenge12.test.ts
npm test challenge13.test.ts
npm test challenge14.test.ts
npm test challenge15.test.ts
npm test challenge16.test.ts
npm test challenge17.test.ts
npm test challenge18.test.ts
npm test challenge19.test.ts
npm test challenge20.test.ts

Challenge07/security if current full integration changes server:

npm test challenge07.test.ts

Then:

npm test _sanity.test.ts

Do not omit a dedicated challenge just because Challenge21 passes.

============================================================
BX. BUG-HUNT REGRESSION
============================================================

Run relevant Challenge00 suites before declaring Task33 complete:

npm test challenge00.test.ts
npm test challenge00b.test.ts
npm test challenge00c.test.ts

Especially important if you touched:
- auth;
- cache;
- API;
- balances;
- market data;
- shared state.

============================================================
BY. FULL SUITE
============================================================

Run:

git diff --check

Then:

npm test

Record remaining failures honestly.

Task33 should aim for end-to-end consistency, but Task34 is the dedicated full regression/final repair pass.

Do not hide remaining failures.

============================================================
BZ. 21A-1 DEBUGGING CHECKLIST
============================================================

If WS-rebuilt book != REST depth:

Compare:
1. canonical matching depth;
2. REST serialized depth;
3. WS snapshot payload;
4. every WS delta;
5. client's book after each delta.

Find first divergence.

Possible causes:
- different matching instance;
- stale snapshot provider;
- missing mutation publish;
- duplicate publish;
- wrong diff;
- wrong client apply;
- serialization/order mismatch.

Do not patch the final JSON only.

============================================================
CA. 21A-2 DEBUGGING CHECKLIST
============================================================

If reconnect final state differs:

Check:
- disconnectAll code 1012 observed;
- LiveFeed schedules reconnect once;
- server remains accepting;
- topic sequence did not reset unexpectedly;
- mutations during downtime still update canonical state;
- reconnect subscribe sent last delivered seq;
- client hasBaseline=false;
- fresh snapshot current;
- snapshot seq current;
- next delta snapshot+1.

============================================================
CB. 21B DEBUGGING CHECKLIST
============================================================

For every API trade:
logically tabulate without printing secrets:

tradeId
buyer
seller
maker
taker
base asset/amount
quote asset/amount
fee input
fee result

Then verify:
- obligations preserve economics;
- net transfer positions identical;
- fee fill mapping exact;
- each trade processed once;
- ledger balances.

Remove debug output before final.

============================================================
CC. 21C DEBUGGING CHECKLIST
============================================================

Compare after test trading:

Database:
- accounts;
- balances;
- trade history source.

API:
- accounts response;
- trades response.

Dashboard:
- account rows;
- portfolio totals;
- recent trades.

Find the first layer where data differs.

Do not hardcode UI to database expected values.

============================================================
CD. SERVER RESOURCE CLEANUP
============================================================

Challenge21 uses real sockets/server.

Ensure tests finish:
- liveHub close clears heartbeat;
- LiveFeed stop clears timers;
- HTTP server closes through test lifecycle;
- no reconnect timer remains.

Do not use process.exit.

Do not call unref as a substitute for cleanup.

============================================================
CE. NO TOKEN/SECRET LOGGING
============================================================

Real WebSocket/client integration may use access token.

Do not:
- console.log full WS URL if token query is included;
- print Authorization headers;
- write token into engineering note.

Task10 operations/security regressions may inspect logs.

============================================================
CF. CACHE CONSISTENCY
============================================================

If the REST depth/accounts/trades route is cached:
read Task21 cache behavior.

Writes/trades/order mutations must invalidate correct cache where Challenge21 expects current data.

Do not solve stale integration by disabling all caches.

Target affected key.

Very next read after mutation must reflect canonical new state.

============================================================
CG. API VERSIONING
============================================================

Challenge21 may use `/api` or `/api/v1`.

Ensure integration works through actual tested route.

Do not duplicate integration only under one version if both use shared router.

Challenge11 parity must remain.

============================================================
CH. HMAC / AUTH
============================================================

If Challenge21 uses signed order/API calls:
preserve Task5/Task6 auth.

Do not bypass authentication for integration tests.

No challenge21-specific allowlist.

============================================================
CI. ACCOUNT CLOSURE
============================================================

If seeded/trading account is open, normal flow works.

Do not loosen Challenge13 closure rules just to let integration tests trade.

If integration fails with closed account, inspect test setup/account selection.

No auto-reopen.

============================================================
CJ. RISK RESERVATIONS
============================================================

Do not bypass Challenge05 risk to make integration orders succeed.

Use test-provided/configured limits.

If seeded accounts require risk setup:
read test/current seed.

Do not hardcode high limits globally unless canonical demo setup intends that.

============================================================
CK. ORDER IDs / SEQUENCES
============================================================

Challenge21 may compare real depth only, not IDs.

Do not reset order sequence when WebSocket reconnects.

Order/matching sequence and WS topic sequence are separate domains.

Never mix them.

============================================================
CL. TRADE CHRONOLOGY
============================================================

Recent trades must be newest first by canonical chronology.

Do not rely on UUID lexical ordering.

Use actual:
- timestamp;
- match sequence;
- stored monotonically increasing trade sequence

according to current model.

============================================================
CM. IDEMPOTENCY ACROSS INTEGRATION
============================================================

Ensure stable boundaries:

- deposit/withdraw idempotency;
- fee fill idempotency;
- strategy fill idempotency;
- WebSocket client duplicate seq filtering.

Task33 must not accidentally wrap these in new retries that bypass IDs.

============================================================
CN. TRANSACTION / IN-MEMORY BOUNDARY
============================================================

Be cautious if:
- DB transaction fails after matching book mutated.

Do not attempt a major redesign during Task33 unless Challenge21 exposes exactly this scenario.

If test does expose it:
reuse existing order transaction/rollback architecture and document the minimal fix.

Never hide mismatch by altering test.

============================================================
CO. DASHBOARD DOM SAFETY
============================================================

If Task33 touches dashboard:
preserve:
- textContent safe rendering;
- accessibility;
- state panels;
- status badges;
- meter warning/danger;
- connection status.

Challenge12,17,20 must remain passing.

============================================================
CP. NO MANUAL POLLING FALLBACK TO HIDE WS BUG
============================================================

Do not make 21a pass by repeatedly fetching the depth endpoint and replacing client state.

Challenge21 specifically tests WebSocket reconstruction.

The live client must consume snapshots/deltas.

REST is comparison truth, not a polling workaround.

============================================================
CQ. NO FAKE RECONNECT
============================================================

Do not intercept disconnectAll and directly set client book from server object.

Use actual socket reconnect/snapshot protocol.

Challenge17/18 must remain meaningful.

============================================================
CR. NO FAKE FEE TOTAL
============================================================

Do not make 21b pass by summing expected rates separately.

Use Challenge16 fee engine and real ledger output.

============================================================
CS. NO FAKE DASHBOARD TOTAL
============================================================

Do not query database directly in browser/dashboard to bypass API mismatch.

Use the same intended API data.

Fix the integration source.

============================================================
CT. TASK 33 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-33-integration.md

Include:

1. Starting commit.
2. Working branch task-33.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge21 test count.
6. 150-point split.
7. Exact 21a routes/topic/protocol.
8. Canonical matching-engine instance ownership.
9. REST depth source.
10. WS snapshot source.
11. Book mutation publication boundary.
12. Before/after depth strategy.
13. diffDepth reuse.
14. no-op delta policy.
15. sequence ownership.
16. duplicate-publish prevention.
17. reconnect/disconnectAll flow.
18. mutations during disconnect.
19. reconnect snapshot/catch-up strategy.
20. exact trade API route/model.
21. canonical trade history source.
22. trade identity.
23. buyer/seller mapping.
24. maker/taker mapping.
25. base/quote mapping.
26. exact notional mapping.
27. netting adapter.
28. net-position proof/result.
29. fee-engine adapter.
30. fee-processing ownership.
31. fee idempotency.
32. fee ledger balance.
33. whether physical settlement is invoked and why.
34. demo seed lifecycle.
35. accounts API source.
36. trade API source after trading.
37. dashboard account mapping.
38. dashboard portfolio aggregation.
39. dashboard recent-trade mapping.
40. DB/API/dashboard consistency.
41. cache invalidation impact.
42. exact files changed.
43. Typecheck.
44. 21a-1 result.
45. 21a-2 result.
46. 21b-1 result.
47. 21c-1 result.
48. full Challenge21 result.
49. Challenge17 result.
50. Challenge18 result.
51. Challenge03 result.
52. Challenge14 result.
53. Challenge16 result.
54. Challenge20 result.
55. Challenge12 result.
56. Challenge11 result.
57. Challenge04/02/05/09/13 results.
58. Challenge01/06/08/10/15/19 results.
59. Challenge00/00b/00c results.
60. full-suite result.
61. remaining Task34+ issues.
62. protected-file confirmation.
63. suggested commit.
64. master merge/push workflow.
65. next Task34: full regression/final repair pass.

Do not include:
- JWTs;
- access tokens;
- HMAC secrets;
- AWS credentials;
- raw .env contents.

============================================================
CU. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat
git diff --name-only

Review EVERY changed production file individually.

Likely examples only:

git diff -- src/server.ts
git diff -- src/services/liveHub.ts
git diff -- "<actual-order-controller-or-service>"
git diff -- "<actual-trade-api-or-service>"
git diff -- client/js/liveFeed.js
git diff -- client/js/dashboard.js
git diff -- client/js/app.js

Do not paste placeholders literally.

Review:

git diff -- docs/clearhouse-task-33-integration.md

If any seed changed:
review it separately and justify exactly why Challenge21 required it.

Confirm:
- no organizer tests changed;
- no new tests;
- config/package unchanged;
- migrations unchanged;
- no challenge21-specific branch;
- no fake polling;
- no fake fee math;
- no duplicate matching engine;
- no duplicate trade history;
- no duplicate WS publish;
- no Number financial arithmetic;
- no auth bypass;
- no Task34+ unrelated cleanup.

============================================================
CV. TASK 33 COMPLETION CRITERIA
============================================================

Task33 is COMPLETE only when:

DISCOVERY

[ ] challenge21 read completely.
[ ] exact test count known.
[ ] exact 21a route/topic/protocol known.
[ ] exact 21b trade/fee/netting APIs known.
[ ] exact 21c seed/API/dashboard assertions known.
[ ] canonical service/instance ownership mapped.
[ ] baseline dedicated challenges recorded.

21A — LIVE BOOK

[ ] REST depth uses canonical matching state.
[ ] WS snapshot uses same canonical matching state.
[ ] client applyBookDelta protocol matches server diffDepth.
[ ] one intended publish per tested real book transition.
[ ] no duplicate publish path.
[ ] every tested cancel/amend/order mutation publishes if depth changed.
[ ] no-op changes do not consume seq unless exact contract.
[ ] liveHub alone owns topic sequence.
[ ] depth serialization matches.
[ ] client-rebuilt book equals REST after every tested stage.
[ ] sequence gapless.

21A — RECONNECT

[ ] disconnectAll uses real Task31 path.
[ ] HTTP/matching server remains active.
[ ] matching book remains intact.
[ ] topic state/seq behavior exact.
[ ] mutations during downtime update canonical state.
[ ] LiveFeed reconnects.
[ ] resume seq is last delivered.
[ ] baseline invalid after reconnect.
[ ] fresh snapshot is current.
[ ] snapshot seq is current.
[ ] next delta coherent.
[ ] final client book equals REST.

21B — TRADES/NETTING/FEES

[ ] API trades come from canonical executed trade history.
[ ] trade IDs stable.
[ ] exact buyer/seller roles.
[ ] exact maker/taker roles.
[ ] exact base/quote assets.
[ ] exact quantity/notional.
[ ] no Number financial conversion.
[ ] adapter to Challenge14 exact.
[ ] netted positions equal original trade obligations.
[ ] fee adapter to Challenge16 exact.
[ ] fee processing ownership understood.
[ ] no double fee processing.
[ ] idempotency stable.
[ ] fee entries balanced.
[ ] fee account net exact.
[ ] no double settlement.

21C — REAL DASHBOARD DATA

[ ] demo seed remains valid/idempotent.
[ ] real trading changes canonical data.
[ ] stored balances remain ledger-consistent.
[ ] accounts API reflects DB.
[ ] trade API reflects real trades.
[ ] dashboard account list equals API.
[ ] dashboard portfolio totals equal API/database.
[ ] recent trades equal API.
[ ] recent trades newest first/max 10.
[ ] exact notional/exponents.
[ ] no hardcoded dashboard demo totals.
[ ] cache freshness correct.
[ ] Challenge12 states/security preserved.
[ ] Challenge17 connection-state behavior preserved.

REGRESSION

[ ] typecheck passes.
[ ] Challenge21 passes.
[ ] Challenge17 passes.
[ ] Challenge18 passes.
[ ] Challenge03 passes.
[ ] Challenge14 passes.
[ ] Challenge16 passes.
[ ] Challenge20 passes.
[ ] Challenge12 passes.
[ ] Challenge11 passes.
[ ] Challenge04/02/05/09/13 pass.
[ ] Challenge01/06/08/10/15/19 pass.
[ ] Challenge00/00b/00c pass.
[ ] sanity passes.
[ ] full suite recorded honestly.
[ ] protected files unchanged.
[ ] Task33 note created.
[ ] final Git target master.

If any Challenge21 assertion remains failing:
- Task33 status = PARTIAL;
- report exact test;
- first divergent layer;
- root cause;
- do not fake completion.

============================================================
CW. FINAL CURSOR REPORT
============================================================

Return:

1. Task33 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Exact Challenge21 test count.
6. Integration architecture summary.
7. Canonical matching state owner.
8. REST depth source.
9. WS snapshot source.
10. Book publish integration boundary.
11. diffDepth/applyBookDelta compatibility.
12. WS sequence ownership.
13. 21a duplicate/no-op publish strategy.
14. Reconnect/disconnectAll flow.
15. Downtime mutation handling.
16. Reconnect snapshot/catch-up.
17. Canonical trade history.
18. Trade API representation.
19. Netting adapter.
20. Net-position preservation result.
21. Fee adapter.
22. Fee processing/idempotency ownership.
23. Fee-ledger balance.
24. Settlement ownership/no-double-settlement.
25. Seed/database source.
26. Accounts API consistency.
27. Recent-trades API consistency.
28. Dashboard account/summary/trade consistency.
29. Cache invalidation/freshness.
30. Typecheck.
31. 21a-1 result.
32. 21a-2 result.
33. 21b-1 result.
34. 21c-1 result.
35. Full Challenge21 result.
36. Challenge17 result.
37. Challenge18 result.
38. Challenge03 result.
39. Challenge14 result.
40. Challenge16 result.
41. Challenge20 result.
42. Challenge12 result.
43. Challenge11 result.
44. Challenge04/02/05/09/13 results.
45. Challenge01/06/08/10/15/19 results.
46. Challenge00/00b/00c results.
47. sanity result.
48. full-suite result.
49. remaining Task34+ issues.
50. protected-file confirmation.
51. final diff summary.
52. reviewed Git commands targeting master.

Suggested commit:

feat: integrate live trading data end to end

Do not automatically commit, merge, or push.
````

---

# Task 33 acceptance matrix

| Area | Required behavior |
|---|---|
| REST depth | Canonical matching state |
| WS snapshot | Same canonical book |
| WS delta | Actual before→after depth |
| Duplicate publish | None |
| Topic seq | Hub-owned, gapless |
| Client reconstruction | Equals REST depth |
| disconnectAll | Real 1012 flow |
| Reconnect | Real client reconnect |
| Reconnect snapshot | Current canonical depth |
| Downtime changes | Reflected after reconnect |
| API trades | Canonical history |
| Trade identity | Stable |
| Netting adapter | Exact roles/assets/amounts |
| Netting result | Same positions |
| Fee adapter | Exact maker/taker/notional |
| Fees | Idempotent |
| Fee ledger | Balanced |
| Settlement | No duplicate settlement |
| Seed | Existing real demo seed |
| Accounts API | DB-consistent |
| Trade API | Real executed trades |
| Dashboard account list | API-consistent |
| Portfolio summary | API/DB-consistent |
| Recent trades | API-consistent |
| Exact arithmetic | BigInt/current exact types |
| Authentication | Preserved |
| Dedicated challenges | Still pass |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 33

Official final branch:

**`master`**

Workflow:

**`master` → `task-33` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 33 branch

```powershell
Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"

git status -sb
git branch --show-current
git branch --list
git remote -v
git log -15 --oneline --decorate
```

Expected development branch:

```text
task-33
```

Official final branch:

```text
master
```

---

## 2. Run final Task 33 verification

Primary:

```powershell
npm run typecheck

npm test challenge21.test.ts
```

Focused labels if they exist:

```powershell
npm test challenge21.test.ts -t "Challenge 21a"

npm test challenge21.test.ts -t "Challenge 21b"

npm test challenge21.test.ts -t "Challenge 21c"
```

Then critical integration dependencies:

```powershell
npm test challenge17.test.ts
npm test challenge18.test.ts

npm test challenge03.test.ts

npm test challenge14.test.ts
npm test challenge16.test.ts

npm test challenge20.test.ts
npm test challenge12.test.ts

npm test challenge11.test.ts

npm test challenge04.test.ts
npm test challenge02.test.ts
npm test challenge05.test.ts
npm test challenge09.test.ts
npm test challenge13.test.ts
```

Broader:

```powershell
npm test challenge01.test.ts
npm test challenge06.test.ts
npm test challenge07.test.ts
npm test challenge08.test.ts
npm test challenge10.test.ts
npm test challenge15.test.ts
npm test challenge19.test.ts

npm test challenge00.test.ts
npm test challenge00b.test.ts
npm test challenge00c.test.ts

npm test _sanity.test.ts

git diff --check
```

Finally:

```powershell
npm test
```

Do not hide remaining failures.

---

## 3. Review Task 33 changes

```powershell
git status --short
git diff --stat
git diff --name-only
```

Review **every changed production file individually**.

Examples only:

```powershell
git diff -- src/server.ts
git diff -- src/services/liveHub.ts
git diff -- client/js/liveFeed.js
git diff -- client/js/dashboard.js
git diff -- client/js/app.js
```

Review the actual order/trade/integration files that changed:

```powershell
git diff -- "<actual-order-integration-path>"
git diff -- "<actual-trade-integration-path>"
```

Do not paste placeholders literally.

Review:

```powershell
git diff -- docs/clearhouse-task-33-integration.md
```

If a seed changed:

```powershell
git diff -- "<actual-seed-path>"
```

and justify it carefully before staging.

---

## 4. Stage only Task 33 files

Always stage:

```powershell
git add -- docs/clearhouse-task-33-integration.md
```

Then stage only the actual integration files reported by:

```powershell
git diff --name-only
```

Examples:

```powershell
git add -- src/server.ts
git add -- src/services/liveHub.ts
git add -- client/js/liveFeed.js
git add -- client/js/dashboard.js
git add -- client/js/app.js
```

Only run lines for files genuinely changed by Task33.

For dynamic actual paths:

```powershell
git add -- "<actual-order-integration-path>"
git add -- "<actual-trade-integration-path>"
```

Do not paste placeholders literally.

If a changed file contains unrelated work:

```powershell
git add -p -- "<file-path>"
```

Avoid:

```text
git add .
```

because Task33 may touch shared files and you must not accidentally stage unrelated work.

---

## 5. Review staged content

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached
```

STOP if staged content unexpectedly contains:

- organizer tests;
- config/scoring;
- package changes;
- migrations;
- `.env`;
- secrets;
- Task34+ cleanup;
- hardcoded challenge fixtures.

Confirm all changed files have an explicit Challenge21 integration reason.

---

## 6. Commit Task 33

Suggested commit:

```powershell
git commit -m "feat: integrate live trading data end to end"
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

If local `master` is simply behind:

```powershell
git pull --ff-only origin master
```

Do not reset valid teammate/history changes.

---

## 8. Merge Task 33

Prefer:

```powershell
git merge --ff-only task-33
```

If fast-forward is impossible:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=40
```

If there is legitimate divergence:

```powershell
git merge task-33
```

Resolve conflicts deliberately.

Never force/reset.

---

## 9. Re-test merged master

Confirm:

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

npm test challenge21.test.ts
npm test challenge17.test.ts
npm test challenge18.test.ts
npm test challenge14.test.ts
npm test challenge16.test.ts
npm test challenge20.test.ts

git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge03.test.ts
npm test challenge12.test.ts
npm test challenge11.test.ts
npm test _sanity.test.ts
```

---

## 10. Push official master

```powershell
git push origin master
```

Do NOT push final competition submission only to `main`.

Do NOT force-push.

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

If the local Task33 commit can safely be rebased:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge21.test.ts
npm test challenge17.test.ts
npm test challenge18.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts carefully.

---

# Fast Task 33 checklist

- [ ] branch = task-33
- [ ] final branch = master
- [ ] challenge21 fully read
- [ ] config/scores read-only
- [ ] exact test count recorded
- [ ] current architecture mapped
- [ ] baseline dedicated challenges recorded
- [ ] canonical matching engine identified
- [ ] REST depth uses canonical book
- [ ] WS snapshot uses canonical book
- [ ] mutation→diff→publish boundary identified
- [ ] no duplicate WS publish path
- [ ] no guessed request-intent deltas
- [ ] delta based on actual before/after depth
- [ ] client applyBookDelta compatible
- [ ] sequence only owned by liveHub
- [ ] 21a client book equals REST
- [ ] real disconnectAll triggers reconnect
- [ ] disconnect does not reset book
- [ ] downtime mutations preserved
- [ ] reconnect snapshot current
- [ ] reconnect catches up
- [ ] canonical trade history identified
- [ ] trade IDs stable
- [ ] buyer/seller mapping exact
- [ ] maker/taker mapping exact
- [ ] base/quote mapping exact
- [ ] netting adapter exact
- [ ] net positions preserved
- [ ] fee adapter exact
- [ ] fee processing not duplicated
- [ ] fee ledger balanced
- [ ] no double settlement
- [ ] existing seed reused
- [ ] accounts API reflects DB
- [ ] trade API reflects executions
- [ ] dashboard account list matches API
- [ ] portfolio matches API/DB
- [ ] recent trades match API
- [ ] exact asset formatting preserved
- [ ] cache freshness correct
- [ ] no Number financial arithmetic
- [ ] no auth bypass
- [ ] Challenge21 passes
- [ ] Challenge17/18 pass
- [ ] Challenge03 pass
- [ ] Challenge14/16 pass
- [ ] Challenge20/12 pass
- [ ] Challenge11 pass
- [ ] Challenge04/02/05/09/13 pass
- [ ] Challenge01/06/07/08/10/15/19 pass
- [ ] Challenge00/00b/00c pass
- [ ] sanity/full suite recorded
- [ ] protected files unchanged
- [ ] Task33 note created
- [ ] committed on task-33
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 34 — full regression, remaining-failure diagnosis and final code-quality repair pass before browser/demo verification.
