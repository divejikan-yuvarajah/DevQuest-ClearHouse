# ClearHouse — Complete Enhanced Cursor Prompt for Task 26

**Task:** Challenge 06 — Event Sourcing and Deterministic Replay  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-26`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 26 purpose

Task 26 implements **Challenge 06 — Event Sourcing and Deterministic Replay**.

The platform must be able to:

1. append immutable events in a cryptographically chained history;
2. detect tampering and identify the first broken point;
3. reconstruct the balance projection from events alone;
4. rebuild from a snapshot plus later events;
5. reconstruct historical state at an earlier event sequence;
6. replay a shuffled/duplicated event collection deterministically and idempotently;
7. assign event sequence numbers strictly increasing with no gaps.

This challenge is about a **provable event log and deterministic projection**, not about replacing the whole application with an event-sourced architecture.

The organizer's rebuild-fidelity test explicitly uses **deposits**. Implement the current tested event domain exactly before expanding anything else.

Do not event-source orders, matching, risk, fees, netting, or WebSockets unless the actual `challenge06.test.ts` explicitly includes them.

---

# Published Challenge 06 contract — overview says 100 points

## 6a — Chain integrity

### 6a-1 — 12 pts

Every appended event chains its hash to its predecessor's hash.

The exact event hash canonicalization is defined by the current test/source contract.

Do not invent:

- field order;
- JSON serialization;
- genesis value;
- delimiter;
- hash casing.

Read the test first.

### 6a-2 — 16 pts

If a historical event's amount is tampered with:

- verification detects the corruption;
- the **first broken link** is reported.

Verification must recompute integrity from event content rather than trusting the stored hash value.

---

## 6b — Rebuild fidelity

### 6b-1 — 13 pts

After a randomized sequence of deposits:

- replay the complete event log from an empty projection;
- rebuilt balances must exactly equal the live projection.

Money remains exact.

### 6b-2 — 13 pts

A snapshot plus tail replay must equal a replay of the complete log.

The snapshot's sequence boundary must be handled exactly once.

### 6b-3 — 11 pts

State-at-sequence for an arbitrary earlier sequence must:

- include events through the requested boundary according to the exact test;
- exclude all later events.

No current/future projection state may leak into the historical result.

---

## 6c — Idempotent and order-tolerant replay

### 6c-1 — 15 pts

Property test:

replaying a list containing randomly:

- duplicated events;
- shuffled event order

must produce the same balance projection as replaying the original deduplicated log.

This reducer must be pure and deterministic.

---

## 6d — Sequencing

### 6d-1 — 9 pts

Event sequence numbers are:

- strictly increasing;
- contiguous;
- no gaps.

Sequence assignment must be safe at the append boundary.

---

# Scoring caution

The visible published items total:

```text
12 + 16 + 13 + 13 + 11 + 15 + 9 = 89 points
```

but the challenge overview says:

```text
100 points
```

Therefore:

- do NOT invent an extra 11-point feature;
- read **all** of `tests/challenge06.test.ts`;
- read `config/scores.ts` **READ ONLY**;
- record every current Challenge 06 test and scoring entry;
- if extra organizer assertions exist beyond the prose summary, implement them;
- do not claim earned points.

The current organizer test file is authoritative.

---

# Critical design principles

## 1. Append-only history

Normal application code must not:

- UPDATE historical event payloads;
- UPDATE old hashes;
- DELETE historical events;
- renumber old events.

The tampering test may deliberately mutate DB rows to prove verification works. Your production implementation must detect that corruption, not normalize/fix it silently.

## 2. Hash verification must trust recomputation, not stored hashes

For event `E[n]`:

verification must recompute:

- expected predecessor relation;
- expected hash from the exact canonical event representation.

If an attacker changes an amount but leaves the old stored hash:

verification must fail.

If an attacker changes the amount and recomputes only that event's hash:

the next event's predecessor link should expose the chain break unless the whole suffix is fraudulently rewritten; use the exact organizer contract.

## 3. Replay must be independent of live projection

A replay function must not read:

- `account_balances`;
- current balance cache;
- live settlement state.

It reconstructs state **only** from:

- events;
- optional snapshot state.

Otherwise the replay proof is meaningless.

## 4. Replay reducer must be pure

For an input event array and optional snapshot:

- no database writes;
- no event mutation;
- no array mutation;
- no global state;
- deterministic result.

## 5. Event replay uses exact arithmetic

Deposits are exact minor-unit integer strings.

Use:

- `BigInt`;
- strings at serialization boundaries.

Never:

- `Number`;
- `parseInt`;
- `parseFloat`.

## 6. Sequence and hash assignment belong to one atomic append boundary

Do not:

1. calculate next sequence outside a transaction;
2. calculate predecessor hash outside a transaction;
3. insert later.

That can create:
- duplicate sequence;
- gaps;
- wrong predecessor under concurrency.

Read the current schema/SQLite strategy and implement the safest exact current approach.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 26

Copy the entire block below into Cursor Agent mode.

````text
Act as my senior TypeScript event-sourcing engineer, deterministic-systems reviewer, and fintech exact-arithmetic engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 26 ONLY: implement Challenge 06 — Event Sourcing and Deterministic Replay.

Preserve all completed Tasks 1–25.

Your work must provide:
- event hash-chain integrity;
- first-break tamper detection;
- deterministic replay from the complete log;
- snapshot + tail replay;
- historical state-at-sequence;
- pure shuffled/duplicated idempotent replay;
- strict gapless sequencing.

The organizer's rebuild-fidelity contract uses deposits. Implement the tested event domain exactly. Do not expand this into event-sourcing matching, risk, fees, WebSockets, or the entire application unless the current organizer tests explicitly require it.

Do not stop at a plan. Inspect, implement, run official tests/regressions, create a Task 26 engineering note, and show reviewed Git commands.

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

task-26

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to the historical GitHub commit;
- never replace origin;
- preserve Tasks 1–25;
- work on task-26;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT TASK 26 SCOPE
============================================================

IMPLEMENT:

Challenge 6a:
- cryptographic event chain;
- predecessor-hash linkage;
- event hash verification;
- first broken link reporting.

Challenge 6b:
- full replay;
- snapshot + tail replay;
- historical state at sequence.

Challenge 6c:
- pure deterministic reducer;
- duplicate-tolerant replay;
- shuffled-input replay.

Challenge 6d:
- strict increasing sequence;
- no gaps.

INTEGRATE:
- the exact current deposit mutation path with event append, but ONLY as the Challenge 06 test requires.

PRESERVE:
- Task 12 deposit idempotency;
- Task 18 account closure;
- Task 20/21 API behavior;
- all exact money semantics;
- ledger/settlement correctness;
- Challenge 20 seeded demo behavior.

DO NOT IMPLEMENT:
- Task 27 Market Data and Time;
- Task 28 Fee Engine;
- Task 29 Netting;
- Task 30 strategy orders;
- WebSocket feed;
- live client;
- final integration;
- generalized event sourcing for unrelated domains.

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
- unrelated migrations
- seeds
- grading/result-upload scripts

Before deciding whether ANY migration may be edited:
read the existing event-log schema and `challenge06.test.ts`.

Preferred:
- use the existing supplied event-store table/schema.

Do NOT add or alter migrations unless the current repository genuinely lacks the schema that Challenge 06's existing source/test explicitly expects and the task is impossible without it.
If that exceptional condition exists:
- report it before broadening scope;
- prefer an existing designated event migration/stub;
- never rewrite unrelated historical schema.

Do NOT:
- skip tests;
- weaken assertions;
- alter property-test generators/seeds;
- increase timeouts;
- reduce test discovery.

Do NOT add production code checking:
- NODE_ENV === "test";
- VITEST;
- organizer test names;
- known property-test values;
- known account IDs;
- known event counts;
- exact tampered fixture amount.

Do NOT use destructive Git.

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

Verify Task 25 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-25 exists:

git log --oneline --decorate --max-count=10 task-25

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-26

If task-26 already exists:

git branch --list task-26
git log --oneline --decorate --max-count=10 task-26

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
- docs/clearhouse-task-08-account-idempotency.md
- docs/clearhouse-task-10-ledger.md
- docs/clearhouse-task-12-deposit-withdraw-idempotency.md
- docs/clearhouse-task-18-account-closure.md
- docs/clearhouse-task-23-demo-seed-accounts-api.md
- docs/clearhouse-task-25-openapi-swagger.md

Verify actual source.

Challenge 06 depends strongly on:
- exact BigInt money;
- correct deposit behavior;
- idempotency;
- correct balance projection.

Before Task 26 edits run:

npm run typecheck

npm test challenge04.test.ts -t "Challenge 4b"

npm test challenge00b.test.ts -t "Challenge 0m"

Use actual current labels if different.

Record pre-existing failures.

============================================================
F. READ CHALLENGE 06 COMPLETELY
============================================================

Read:

tests/challenge06.test.ts

from first line to last line.

Read:

config/scores.ts

READ ONLY.

The published visible Challenge 06 items total 89 while overview says 100.

Do not invent the missing 11.

Build an exact table:

test label
| score
| imported function/export
| DB helper/table
| input
| expected result
| exact hash format
| exact sequence semantics
| current stub/defect

Record:
- exact current test count;
- exact scoring entries;
- any extra assertion not in Challenges.md;
- exact event interface/type;
- exact event table;
- sequence field name/type;
- event ID field;
- type field;
- payload shape;
- amount field;
- previous-hash field;
- hash field;
- timestamp field if relevant;
- exact genesis predecessor;
- exact hash algorithm;
- exact canonicalization;
- exact verify-chain return/error shape;
- exact snapshot structure;
- exact projection structure;
- exact replay function signatures.

DO NOT guess these fields.

============================================================
G. SEARCH THE CURRENT EVENT-SOURCING SURFACE
============================================================

Search:

rg -n "event|Event|appendEvent|eventStore|replay|snapshot|sequence|prevHash|previousHash|hashChain|verifyChain|stateAt" src db tests

PowerShell fallback:

Get-ChildItem -Recurse src,db,tests -File |
  Select-String -Pattern "event|Event|appendEvent|eventStore|replay|snapshot|sequence|prevHash|previousHash|hashChain|verifyChain|stateAt"

Read all likely files completely.

Potential locations may include:
- src/domain/events.ts
- src/services/eventStore.ts
- src/repositories/eventRepository.ts
- src/services/replay.ts
- db migration containing event table

These are examples only.

Use actual current paths.

Also inspect:
- deposit implementation;
- balance read/write helpers;
- idempotency wrapper.

============================================================
H. RUN TASK 26 BASELINE
============================================================

Run:

npm test challenge06.test.ts

Record:
- exact number of executed tests;
- each group pass/fail;
- imported function names;
- first true failure;
- property-test seed/path/counterexample if any.

If labels exist:

npm test challenge06.test.ts -t "Challenge 6a"
npm test challenge06.test.ts -t "Challenge 6b"
npm test challenge06.test.ts -t "Challenge 6c"
npm test challenge06.test.ts -t "Challenge 6d"

Use actual current labels.

============================================================
I. EVENT LOG IS APPEND-ONLY
============================================================

Production Task 26 logic must append new events.

Do not implement normal event operations that:
- UPDATE old payload;
- UPDATE old event hash;
- DELETE events;
- renumber sequences.

The organizer may directly tamper with the DB for 6a-2.
That is a test attack, not a production behavior to copy.

Do not auto-repair a corrupted chain.

Verification should report corruption.

============================================================
J. IDENTIFY THE EXACT EVENT MODEL
============================================================

Before coding, write down the exact current event record fields.

Do not redesign the event schema unnecessarily.

Determine whether event stores:
- flat columns;
- JSON payload;
- both.

Determine whether amount is:
- top-level;
- inside payload.

Tamper test tells you exactly what content participates in hashing.

============================================================
K. HASH ALGORITHM — USE EXACT TEST CONTRACT
============================================================

Challenge 6a says every event chains its hash to its predecessor.

Read exact test/source for:
- SHA-256 or another algorithm;
- output format;
- lowercase/uppercase hex;
- Buffer encoding;
- canonical payload.

Do not assume SHA-256 merely because it is common.

If source stub names an algorithm:
follow it.

Do not install crypto dependencies.
Use Node built-in `crypto` if appropriate.

============================================================
L. CANONICAL HASH REPRESENTATION
============================================================

The hash must be deterministic.

Do not use raw:

JSON.stringify(eventObject)

unless the organizer's exact oracle does so.

Reasons:
- key ordering;
- inclusion of stored hash field;
- undefined values;
- DB type normalization.

Read test/helper.

Create one canonical hashing function used by:
- append;
- verification.

The function must clearly exclude/include exact fields according to contract.

============================================================
M. DO NOT HASH THE STORED HASH INTO ITSELF
============================================================

Unless current test explicitly defines a different method:

an event hash generally covers:
- predecessor hash;
- immutable event content;
- possibly sequence/type/id/timestamp

but not the `hash` field itself.

Do not create recursive self-dependence.

Use exact organizer oracle.

============================================================
N. PREDECESSOR HASH — 6a-1
============================================================

For the first/genesis event:
use the exact expected predecessor value from test/schema.

Possibilities:
- null;
- empty string;
- fixed zero hash.

Do not guess.

For later events:
event[n].previousHash must equal event[n-1].hash.

Sequence order defines predecessor.

Do not use insertion-memory order when DB sequence exists.

============================================================
O. CHAIN VERIFICATION — ORDER FIRST
============================================================

Verification must load/use events in canonical sequence order.

Do not trust arbitrary array/DB row order.

If verifyChain accepts an array:
read whether it should:
- require already-ordered input;
- sort it.

Use exact test.

A DB verification function should explicitly:

ORDER BY sequence ASC

not rely on implicit SQLite row order.

============================================================
P. VERIFY THE FIRST EVENT TOO
============================================================

Check:
- expected genesis predecessor;
- recomputed hash of first event.

Do not start verification only at event 2.

Tampering with first event must be detectable.

============================================================
Q. VERIFY EVERY EVENT CONTENT HASH
============================================================

For each event:

1. verify expected sequence relationship if part of verification;
2. verify stored predecessor hash equals expected predecessor;
3. recompute expected hash from canonical immutable content;
4. compare with stored hash;
5. stop/report the FIRST broken event according to exact test contract.

Do not merely check:

event.prevHash === previous.hash

because a modified last event amount would otherwise pass if its hash is never recomputed.

============================================================
R. FIRST BROKEN LINK — 6a-2
============================================================

Read exact return contract.

It may expect:
- sequence number;
- index;
- event ID;
- object `{ valid, brokenAt }`;
- a specific error.

Do not guess.

If multiple later links become invalid because an early event is tampered:
report the earliest corrupted/broken point according to test.

Do not report only the final mismatch.

============================================================
S. CONSTANT-TIME HASH COMPARE?
============================================================

This is integrity verification of stored historical records, not authentication of a remote secret.

Use exact straightforward equality unless current source uses a helper.

Do not overcomplicate.

No secret is involved in a plain hash chain unless test says otherwise.

============================================================
T. STRICT SEQUENCING — 6d-1
============================================================

Sequence values must be:

1, 2, 3, ...

or the exact starting sequence defined by the test.

Read current schema/test.

Do not assume zero-based/one-based.

The organizer checks:
- strictly increasing;
- no gaps.

============================================================
U. SEQUENCE ASSIGNMENT MUST BE ATOMIC
============================================================

Unsafe:

const max = await db.max(...)
const next = max + 1
// another append occurs
await insert(next)

outside an atomic boundary.

Use current SQLite/Knex capabilities.

Possible safe approaches:
- DB auto-increment sequence if it guarantees exactly the expected sequence;
- transaction that serializes latest-row read + insert;
- existing single-writer helper.

Read current test concurrency assumptions/schema.

Do not add an in-memory counter as source of truth:
- process restart;
- multiple store instances;
- test DB recreation
would break it.

============================================================
V. HASH + SEQUENCE MUST BE ASSIGNED TOGETHER
============================================================

The predecessor hash depends on the actual latest event.

Therefore:
- read latest predecessor;
- calculate next sequence;
- calculate event hash;
- insert event

within one append consistency boundary.

Do not let another event insert between predecessor read and current insert.

============================================================
W. NO GAPS ON FAILED APPEND
============================================================

If sequence is application-assigned:

a failed append must not permanently consume a sequence and create a gap.

If DB auto-increment can produce gaps after failed inserts/rollbacks under SQLite:
read current test/schema and choose architecture that satisfies 6d.

Do not hardcode sequence values.

============================================================
X. EVENT ID VS SEQUENCE
============================================================

Replay deduplication may use:
- event ID;
- sequence;
- both.

Read the event model/test.

Sequence identifies ordering.

A stable unique event identity should determine duplicates according to organizer property test.

Do not dedupe distinct events merely because their payloads are identical.

Two equal-value deposits can be separate legitimate events.

============================================================
Y. DEPOSIT EVENT INTEGRATION — 6b-1
============================================================

Read exactly how randomized deposits are created in Challenge 06.

Determine whether tests:
- call `deposit()` and expect event append automatically;
- call an event append helper directly plus live projection;
- use a special command/event service.

Do not assume.

Integrate at the exact current mutation boundary.

============================================================
Z. EVENT APPEND AND LIVE DEPOSIT ATOMICITY
============================================================

If the tested deposit path must update:
- account_balances;
- event_log

then ideally both belong to the SAME database transaction.

A successful deposit must not leave:
- balance changed but event absent;
- event appended but balance unchanged.

Reuse Task 12's idempotency transaction if architecture allows.

Do not open a nested independent event transaction inside the Task 12 transaction.

============================================================
AA. IDEMPOTENT DEPOSIT MUST NOT APPEND DUPLICATE EVENTS
============================================================

Task 12 same:
- Idempotency-Key;
- same body replay

must apply deposit only once.

If event append occurs inside the actual idempotent mutation callback:
replay should not append a second event.

Do not append event before `withIdempotency()`.

Do not add an event on a cached/replayed response.

============================================================
AB. IDEMPOTENCY CONFLICT MUST APPEND NOTHING
============================================================

Same idempotency key + different body:
- conflict;
- no balance mutation;
- no event append.

Preserve Task 12.

============================================================
AC. FAILED DEPOSIT MUST APPEND NOTHING
============================================================

If deposit fails due:
- invalid amount;
- closed account;
- validation;
- DB failure

do not persist a successful deposit event.

Use transaction rollback.

============================================================
AD. EVENT PAYLOAD IS IMMUTABLE FACT
============================================================

Deposit event should record the exact tested facts, e.g.:
- accountId;
- asset;
- amount;

plus exact current metadata fields.

Do not store a formatted decimal instead of minor-unit integer string.

Do not store current balance as the source-of-truth event unless test specifically defines that event shape.

A deposit event represents the movement, not a mutable snapshot.

============================================================
AE. FULL REPLAY — 6b-1
============================================================

Replay starts from an empty projection.

For every canonical unique event in sequence order:
- apply the pure reducer.

The rebuilt state must exactly equal live balances after randomized deposits.

Do NOT read account_balances during replay.

Do NOT call deposit() during replay because that:
- writes DB;
- triggers idempotency/event append;
- has side effects.

Use a pure reducer.

============================================================
AF. PROJECTION SHAPE
============================================================

Read exact expected replay output.

Could be:
- Map;
- object;
- array;
- account/asset nested structure.

Preserve the tested return type/signature.

Do not change it to a more convenient custom class.

If Map:
avoid sharing mutable Maps between calls.

Return fresh state.

============================================================
AG. BALANCE KEY
============================================================

For deposit projection, state must distinguish at least:

account + asset

according to test.

Do not aggregate:
- all accounts together;
- all assets together.

Use a collision-safe key/nested Map/object.

Avoid naive concatenation if IDs/assets can contain separator characters unless current tested domain makes it safe.

============================================================
AH. DEPOSIT REDUCER — EXACT BIGINT
============================================================

For a deposit event:

newBalance =
oldBalance + BigInt(amount)

according to the current projection semantics.

If projection includes:
- available;
- held

read the test.

Deposit likely increases available while held remains unchanged.

Do not assume if test expects a simpler total-balance projection.

Use exact tested state.

============================================================
AI. UNKNOWN EVENT TYPES
============================================================

Read Challenge 06.

If replay receives unknown event:
- ignore;
- reject;
- exhaustiveness error

according to contract.

Do not silently invent behavior.

For current Challenge 06, only implement tested event types.

============================================================
AJ. REPLAY INPUT ORDER — 6c-1
============================================================

The property test deliberately shuffles events.

The pure replay helper must establish canonical order itself.

Do not assume caller sorted the array.

Sort a COPY:

const ordered = [...events].sort(...)

Do not mutate caller input.

============================================================
AK. REPLAY DEDUPLICATION — 6c-1
============================================================

The property test deliberately duplicates events.

Each logical event must be applied exactly once.

Deduplicate using the stable identity required by test:
- event ID;
- sequence;
- exact combination.

Do not dedupe by amount/account/asset payload:
two legitimate deposits can be identical in payload.

============================================================
AL. ORDER OF DEDUPE VS SORT
============================================================

Either:
- dedupe then sort;
- sort then dedupe

can work if identity semantics are correct.

Choose a deterministic implementation.

If duplicate copies with same identity somehow disagree in content:
read test/contract.

Do not arbitrarily pick a corrupted version if integrity verification is expected first.

Keep replay pure.

============================================================
AM. REPLAY MUST NOT VERIFY THROUGH LIVE DB
============================================================

If replay accepts events passed by the property test:
it must not fetch a "correct" copy from DB.

Use input only.

Otherwise shuffled/duplicate pure reducer test is meaningless.

============================================================
AN. PURE FUNCTION REQUIREMENTS
============================================================

Replay/reducer should:
- have no DB access;
- have no Date.now dependence;
- have no random generation;
- have no console output;
- have no cache/global mutable state;
- not mutate events;
- not mutate input array;
- return fresh projection.

This is crucial to deterministic property tests.

============================================================
AO. SNAPSHOT — 6b-2
============================================================

Read exact snapshot interface.

Identify:
- snapshot sequence field;
- stored projection;
- serialization type for BigInt if persisted/passed.

Do not invent a snapshot DB table if tests only use an in-memory snapshot object.

Challenge says snapshot + tail replay, not necessarily persisted snapshots.

Implement only current test contract.

============================================================
AP. SNAPSHOT BOUNDARY
============================================================

If snapshot represents state AFTER applying sequence `S`:

tail replay must apply only events where:

sequence > S

Do not apply event S twice.

If current contract defines snapshot before S:
follow it.

Read exact test.

This off-by-one is a common failure.

============================================================
AQ. SNAPSHOT STATE MUST NOT BE MUTATED
============================================================

Replay from snapshot should clone/copy initial projection as necessary.

Do not mutate the snapshot object supplied by caller.

Property tests may reuse it.

Full replay and snapshot-tail replay must yield independent objects with equal values.

============================================================
AR. SNAPSHOT + SHUFFLED TAIL
============================================================

If the tail helper receives arbitrary order:
sort/dedupe according to current replay semantics.

At minimum use exact Challenge 06 test.

Do not assume DB order if function takes an array.

============================================================
AS. SNAPSHOT SEQUENCE VALIDATION
============================================================

Read test.

If tail contains:
- events at/before snapshot sequence

filter/exclude them.

Do not replay them.

If snapshot sequence is beyond log:
return snapshot state or error according to contract.

Do not guess.

============================================================
AT. STATE AT SEQUENCE — 6b-3
============================================================

For target sequence `S`:

historical state must not include events with sequence > S.

Determine whether S is inclusive from organizer test.

Most likely:
apply sequence <= S.

But read test and implement exact semantics.

Do not use current live balance.

============================================================
AU. STATE AT ZERO / BEFORE FIRST
============================================================

Read boundary tests.

If requested sequence is before first event:
return empty projection according to contract.

Do not fabricate account balances.

If invalid negative sequence:
follow test.

Do not invent API behavior.

============================================================
AV. STATE AT LATEST
============================================================

State at the latest event sequence should normally match full replay.

Use this as a useful internal reasoning check.

Do not write extra test files.

============================================================
AW. HASH CHAIN AND REPLAY ARE RELATED BUT SEPARATE
============================================================

Replay should not necessarily verify hash integrity automatically unless exact API/test says so.

Possible design:
- `verifyChain(events)` validates integrity;
- `replay(events)` performs pure deterministic reduction.

Keep responsibilities clear.

Do not make property replay fail just because its intentionally shuffled input temporarily violates predecessor order before canonical sorting.

============================================================
AX. LOAD LOG — DETERMINISTIC DB ORDER
============================================================

Any repository method fetching events for:
- verification;
- full replay;
- snapshot tail;
- state at sequence

must use explicit sequence ordering.

Never rely on:
- primary-key insertion accident;
- SQLite natural order.

============================================================
AY. SEQUENCE TYPE
============================================================

Read schema.

If sequence is DB integer:
Number may be safe for small sequence counts, but use the existing type.

Do not convert monetary fields to Number just because sequence is numeric.

Do not use BigInt for sequence unless current interface does.

============================================================
AZ. EVENT HASH ENCODING
============================================================

Read test.

If hash stored as:
- hex;
- base64;
- Buffer

preserve exact current representation.

No leading `0x` unless expected.

No uppercase changes unless expected.

============================================================
BA. EVENT TIMESTAMP
============================================================

If timestamp participates in hash:
use the exact persisted timestamp value.

Do not hash `Date.now()` and then store a differently formatted timestamp.

Create the timestamp once and use identical canonical representation.

If tests inject timestamp:
preserve deterministic injection/current helper.

If timestamp does NOT participate in hash:
do not add it just because it seems useful.

============================================================
BB. EVENT ID
============================================================

If event ID participates in hash:
generate/resolve it before hashing.

Use existing ID helper.

Do not generate twice.

If tests construct events with IDs directly:
hash exactly that supplied ID.

============================================================
BC. JSON PAYLOAD CANONICALIZATION
============================================================

If payload is JSON:
read exact canonicalization from test.

Do not trust `JSON.stringify` object property order unless test does.

A robust canonical function might explicitly serialize fields in defined order.

But match organizer oracle exactly.

Do not use third-party canonical JSON package.

============================================================
BD. VERIFY STORED EVENT AFTER DB TYPE CONVERSION
============================================================

SQLite may return:
- numeric sequence;
- string text;
- null.

Normalize only according to defined event type before hashing.

Do not hash JS representation that differs from what append hashed.

One canonical event-to-hash-input function should accept the normalized logical event.

============================================================
BE. CONCURRENT APPENDS
============================================================

Even if Challenge 6d only sequentially appends visible examples:
design append so two callers cannot trivially get the same next sequence/previous hash.

Use DB transaction/constraint.

Do not use:
- static module counter;
- sleep;
- retry with random delay.

If SQLite lock conflict occurs:
use current DB transaction style, not unbounded retry.

============================================================
BF. UNIQUE SEQUENCE CONSTRAINT
============================================================

Inspect schema.

If sequence has UNIQUE/PRIMARY KEY:
preserve it.

Do not remove constraints.

If not unique but current designated schema includes another ordering key:
follow test.

Do not alter migration casually.

============================================================
BG. APPEND RETRIES
============================================================

Do not internally retry by generating a different event identity unless exact architecture requires optimistic append retries.

A failed operation should not create duplicate events.

Keep event append semantics simple.

============================================================
BH. EVENT APPEND RETURN VALUE
============================================================

Read test.

If `appendEvent(...)` returns the appended stored event:
include exact:
- sequence;
- previous hash;
- hash;
- payload.

If it returns void/ID:
preserve signature.

Do not change public API unnecessarily.

============================================================
BI. CHAIN VERIFICATION RETURN VALUE
============================================================

Read test.

Possible examples are only illustrative:

{ valid: true }

{ valid: false, brokenAt: 3 }

Do not implement this exact shape unless test confirms it.

Preserve current exported contract.

============================================================
BJ. CORRUPTION MUST NOT BE "FIXED" BY REPLAY
============================================================

Replay of a tampered event list may calculate a projection, but integrity verification must expose corruption when invoked.

Do not:
- recompute and overwrite stored hash;
- silently drop corrupted event;
- repair suffix.

Auditability requires detection.

============================================================
BK. FULL REPLAY MUST NOT APPEND EVENTS
============================================================

Do not implement replay by calling business commands such as:
- deposit();
- controller handlers.

Those have side effects.

Pure reducer only.

============================================================
BL. FULL REPLAY MUST NOT TOUCH IDEMPOTENCY TABLE
============================================================

Replay is not a client mutation.

Do not create:
- idempotency records;
- HMAC nonces;
- ledger entries

during replay unless event projection itself explicitly includes them in test.

Challenge 06 balance rebuild should be side-effect-free.

============================================================
BM. EVENT LOG VS DOUBLE-ENTRY LEDGER
============================================================

Do not confuse:
- immutable accounting ledger;
- event-sourcing event log.

Challenge 02 ledger remains separately correct.

Do not replace ledger postings with event records.

Do not treat event hash as ledger entry ID.

Challenge 06 replay target is defined by its own test.

============================================================
BN. LIVE PROJECTION SOURCE
============================================================

6b-1 compares replay with live projection after randomized deposits.

Determine exactly which live balance function the test reads.

Ensure the event represents the SAME successful deposit mutation semantics.

Do not change account balance definition.

============================================================
BO. ACCOUNT STATUS
============================================================

Task 18 closed accounts cannot be deposited into.

If event integration is in `deposit()`:
status validation must still happen before successful mutation/event.

Do not append an event for a rejected closed-account deposit.

============================================================
BP. SEED DEPOSITS / TASK 23
============================================================

Task 23 demo seed may fund accounts through ledger/balance operations.

Do not automatically event-source seed funding unless:
- current Challenge 06/20 integration explicitly expects it.

Task 26 is not permission to modify seed files.

Preserve Task 23 idempotency.

============================================================
BQ. API / OPENAPI
============================================================

Challenge 06 may expose no new HTTP endpoint.

Do not add event APIs unless test/source explicitly includes routes.

Task 25 OpenAPI should not be changed just because event internals exist.

If current event endpoint is already stubbed/part of Challenge 06:
implement/document integration only if organizer test requires it; otherwise leave Task 25 untouched.

============================================================
BR. ERROR HANDLING
============================================================

If event service functions throw:
use current domain error style.

Do not leak:
- raw DB errors;
- file paths;
- internal hashes in unrelated HTTP errors.

Challenge 06 direct functions may return structured integrity result instead of HTTP.

Read test.

============================================================
BS. PROPERTY TEST DISCIPLINE — 6b / 6c
============================================================

If randomized/property test fails:

record:
- seed;
- path;
- minimal counterexample;
- event list before/after shuffle/duplicates;
- expected vs actual projection.

Do not:
- hardcode the seed;
- change generator;
- rerun until lucky.

Fix invariant.

============================================================
BT. DETERMINISTIC SORTING
============================================================

Sequence sort must be deterministic.

Comparator:
- based on sequence;
- safe for actual sequence type.

Do not use timestamp as primary order if sequence defines causality.

If duplicate same sequence records exist:
dedupe identity first/according to contract rather than nondeterministically applying both.

============================================================
BU. MAP / OBJECT SERIALIZATION
============================================================

If replay returns a Map but snapshot stores a JSON object:
use exact conversion helpers from test/source.

Do not accidentally stringify BigInt directly.

Convert exact values to strings only at the required serialization boundary.

Within reducer use BigInt.

============================================================
BV. SNAPSHOT FORMAT
============================================================

Do not persist native BigInt into JSON without conversion.

If snapshot is pure in-memory Map<BigInt>:
preserve it.

If snapshot schema stores strings:
clone/parse exact.

Read test.

============================================================
BW. EMPTY EVENT LOG
============================================================

Read tests.

A full replay of no events should normally produce:
- empty projection;
- no error.

Chain verification of empty log should normally be valid.

But implement exact contract.

Do not fabricate a genesis event unless schema/test requires it.

============================================================
BX. SINGLE EVENT
============================================================

A one-event log must:
- have correct genesis previous hash;
- verify;
- replay.

Useful reasoning boundary.

No new tests required.

============================================================
BY. FIRST-BREAK INDEX VS SEQUENCE
============================================================

Do not confuse array index with event sequence.

If test expects:
- sequence `3`,
do not return:
- zero-based index `2`.

Read exact assertion.

============================================================
BZ. DETECT SEQUENCE GAPS DURING CHAIN VERIFY
============================================================

Read Challenge 06 exact behavior.

6d independently asserts append sequence gaplessness.

If `verifyChain` is also expected to reject:
- missing seq;
- duplicate seq

implement it.

Do not add untested behavior that changes expected valid handling without evidence.

============================================================
CA. SNAPSHOT CREATED FROM REPLAY, NOT LIVE STATE
============================================================

If Challenge 06 has a helper to create snapshot:
it should capture projection at a known sequence.

Do not copy current account_balances if that includes later events.

Snapshot content must correspond exactly to its sequence.

Read test.

============================================================
CB. STATE AT SEQUENCE IMPLEMENTATION OPTIONS
============================================================

Strong pure design:

stateAtSequence(events, sequence):
- select canonical unique events where seq <= sequence (if inclusive);
- replay selected events.

This avoids live state leakage.

If snapshot optimization exists:
use only if current test/source wants it.

Correctness first.

============================================================
CC. FULL REPLAY FROM DB
============================================================

If there is a repository-level:

rebuildFromLog(db)

it may:
1. fetch all events ORDER BY sequence;
2. pass into pure replay reducer;
3. return projection.

Do not update account_balances unless test explicitly defines a rebuild command that writes a projection table.

The published wording says "rebuilding ... matches the live projection", which may be a pure comparison.

Read test.

============================================================
CD. DO NOT DESTROY LIVE PROJECTION DURING REBUILD TEST
============================================================

Do not clear `account_balances` to prove replay.

The organizer likely compares values directly.

Do not mutate DB during pure rebuild unless current function contract explicitly rebuilds stored projection.

============================================================
CE. HASH CHAIN PERFORMANCE
============================================================

Challenge 06 is correctness-first.

Do not:
- prehash using unsafe caches;
- skip verification on old events.

Linear O(n) verification/replay is appropriate.

No need for Merkle trees.

============================================================
CF. SECURITY OF HASH CHAIN
============================================================

A plain hash chain proves accidental/unauthorized alteration relative to a trusted head, but is not a digital signature.

Do not add HMAC secret to event hash unless current test defines it.

Task 5 HMAC request signing is a different concern.

============================================================
CG. EXPECTED TASK 26 FILE SCOPE
============================================================

Likely primary files are the actual existing:
- event domain/model;
- event store/repository;
- replay/projection service;
- deposit repository/service integration.

Possible paths might resemble:
- src/domain/events.ts
- src/services/eventStore.ts
- src/repositories/eventRepository.ts
- src/services/replay.ts
- src/repositories/settlementRepository.ts

These are examples only.

Use actual paths found in current repo.

Create/update:

docs/clearhouse-task-26-event-sourcing.md

Normally do NOT change:
- tests;
- config;
- package;
- client;
- OpenAPI;
- seeds;
- unrelated domain modules.

============================================================
CH. NO MIGRATION CHANGE BY DEFAULT
============================================================

Inspect existing DB schema.

If an event table already exists:
use it.

Do not alter its migration to suit a preferred design.

If it lacks a column you wish existed:
first read challenge/source; perhaps the intended event data lives in JSON payload.

Only broaden to a designated event migration if organizer source proves that migration is part of the unimplemented Challenge 06 surface.

Document any exception explicitly.

============================================================
CI. REQUIRED VERIFICATION — CHALLENGE 06
============================================================

After implementation:

npm run typecheck

Then:

npm test challenge06.test.ts

This is the PRIMARY Task 26 gate.

If labels exist:

npm test challenge06.test.ts -t "Challenge 6a"
npm test challenge06.test.ts -t "Challenge 6b"
npm test challenge06.test.ts -t "Challenge 6c"
npm test challenge06.test.ts -t "Challenge 6d"

Use actual labels.

Record:
- test count;
- property seeds;
- exact results.

============================================================
CJ. DEPOSIT / IDEMPOTENCY REGRESSION
============================================================

Because Task 26 may integrate event append with deposits:

run:

npm test challenge04.test.ts -t "Challenge 4b"

npm test challenge00b.test.ts -t "Challenge 0m"

npm test challenge00c.test.ts -t "Challenge 0w"

Use current labels.

Ensure:
- replay same key does not duplicate event;
- conflict appends no event.

============================================================
CK. ACCOUNT-CLOSURE REGRESSION
============================================================

Run:

npm test challenge13.test.ts

Closed-account deposit behavior must remain correct.

============================================================
CL. LEDGER / RECONCILIATION REGRESSION
============================================================

Run:

npm test challenge02.test.ts
npm test challenge09.test.ts

Task 26 must not confuse/alter the accounting ledger.

============================================================
CM. DEMO / API REGRESSION
============================================================

Run:

npm test challenge20.test.ts
npm test challenge11.test.ts
npm test challenge19.test.ts

Event integration must not regress:
- seed/accounts/dashboard;
- API;
- OpenAPI route documentation.

If Task 26 adds no HTTP route, Challenge 19 should remain unchanged.

============================================================
CN. BROADER REGRESSION
============================================================

Run:

npm test challenge10.test.ts
npm test challenge05.test.ts
npm test challenge03.test.ts
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

Then:

git diff --check

Finally:

npm test

Record Task 27+ failures honestly.

============================================================
CO. FAILURE DIAGNOSIS — 6a-1
============================================================

If predecessor link fails:
- event fetch order;
- wrong genesis sentinel;
- predecessor read outside transaction;
- hash created before real sequence/ID assigned;
- wrong hash encoding.

If stored hash differs:
- canonical field order;
- JSON representation;
- timestamp normalization;
- amount string normalization.

Use organizer oracle.

============================================================
CP. FAILURE DIAGNOSIS — 6a-2
============================================================

If tampered amount is not detected:
you are probably checking only predecessor hash fields and not recomputing event content hash.

If wrong broken link reported:
- off-by-one index vs sequence;
- verification starts too late;
- suffix failure reported instead of first changed event;
- event ordering wrong.

Do not auto-repair corruption.

============================================================
CQ. FAILURE DIAGNOSIS — 6b-1
============================================================

If full replay differs from live balance:
- deposit event appended at wrong boundary;
- replay uses wrong account/asset key;
- held/available definition mismatch;
- duplicate event appended due idempotency replay;
- Number precision;
- rejected deposit produced event.

Compare first divergent event/state.

============================================================
CR. FAILURE DIAGNOSIS — 6b-2
============================================================

Snapshot-tail mismatch often means:
- event at snapshot sequence applied twice;
- tail filtering uses >= instead of >;
- snapshot state mutated;
- wrong sequence recorded on snapshot;
- tail not sorted.

Fix boundary.

============================================================
CS. FAILURE DIAGNOSIS — 6b-3
============================================================

Historical state includes later events:
- target filter wrong;
- using live account_balances;
- snapshot newer than target;
- sequence comparator wrong.

State-at-sequence must be historical and deterministic.

============================================================
CT. FAILURE DIAGNOSIS — 6c-1
============================================================

Shuffled replay mismatch:
- no sequence sort;
- timestamp sort used instead;
- mutation of input.

Duplicate replay mismatch:
- no dedupe;
- dedupe based on payload and removed legitimate identical deposits;
- unstable identity.

Capture fast-check seed/path.

============================================================
CU. FAILURE DIAGNOSIS — 6d-1
============================================================

Gaps/duplicates:
- max+1 outside transaction;
- auto-increment rollback behavior;
- counter reset;
- failed append consumed sequence;
- multiple DB handles race.

Use persistent DB ordering source.

============================================================
CV. TEST REPORTING
============================================================

For every run record:
- exact command;
- exit code;
- tests executed;
- passed;
- failed;
- filtered/not exercised;
- root cause.

For property tests:
- seed;
- path;
- counterexample.

Do not edit:
- tests;
- test-results.xml;
- config/scores.ts.

Filtered-out tests are not passed.

============================================================
CW. TASK 26 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-26-event-sourcing.md

Include:

1. Starting commit.
2. Working branch task-26.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 06 test count.
6. Current score entries from config/scores.ts.
7. 100-point overview vs visible 89-point note.
8. Exact event table/source files.
9. Event record interface.
10. Event identity field.
11. Sequence field/start.
12. Event type/payload.
13. Exact hash algorithm.
14. Exact canonical hash input.
15. Genesis predecessor value.
16. Append transaction design.
17. Sequence gaplessness design.
18. Predecessor lookup design.
19. verifyChain algorithm.
20. First-broken-link semantics.
21. Deposit-event integration boundary.
22. Idempotency interaction.
23. Failure atomicity.
24. Projection shape.
25. Pure reducer algorithm.
26. Dedup identity.
27. Shuffle sorting rule.
28. Full replay.
29. Snapshot shape.
30. Snapshot boundary semantics.
31. Tail replay.
32. State-at-sequence semantics.
33. BigInt strategy.
34. Input immutability/purity.
35. Exact files changed.
36. Typecheck.
37. 6a result.
38. 6b result.
39. 6c result.
40. 6d result.
41. Full Challenge 06 result.
42. Challenge 04b regression.
43. Task 8 idempotency/concurrency regressions.
44. Challenge 13 result.
45. Challenge 02/09 results.
46. Challenge 20/11/19 results.
47. broader regressions.
48. full-suite result.
49. protected-file confirmation.
50. migration-change confirmation if applicable.
51. suggested commit.
52. master merge/push workflow.
53. next Task 27: Challenge 08 Market Data and Time.

Do not include secrets.

============================================================
CX. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat
git diff --name-only

Review the actual Task 26 source files discovered from the repository, e.g.:

git diff -- "<actual-event-model-path>"
git diff -- "<actual-event-store-or-repository-path>"
git diff -- "<actual-replay-path>"

If deposit integration changed:

git diff -- src/repositories/settlementRepository.ts
git diff -- src/controller/settlementController.ts

Review:

git diff -- docs/clearhouse-task-26-event-sourcing.md

Only use paths that actually exist/change.

Confirm:
- organizer tests unchanged;
- no new tests;
- config unchanged;
- package unchanged;
- no unrelated migrations;
- seeds unchanged;
- no old event mutation;
- no Number money arithmetic;
- no test-detection;
- no current-balance read inside pure replay;
- no event-sourcing of future domains;
- no Task 27+ work.

============================================================
CY. TASK 26 COMPLETION CRITERIA
============================================================

Task 26 is COMPLETE only when:

DISCOVERY

[ ] challenge06 read completely.
[ ] exact current test count recorded.
[ ] config/scores inspected read-only.
[ ] 100 vs visible 89 mismatch documented.
[ ] exact event interface discovered.
[ ] exact hash oracle discovered.
[ ] exact replay/snapshot signatures discovered.

CHAIN

[ ] first event genesis predecessor correct.
[ ] every later event links to previous hash.
[ ] event content hash recomputed correctly.
[ ] hash encoding exact.
[ ] historical event rows remain append-only.
[ ] tampered amount detected.
[ ] first broken point reported exactly.
[ ] no silent corruption repair.

SEQUENCE

[ ] sequence start correct.
[ ] sequence strictly increasing.
[ ] no gaps.
[ ] sequence persistent, not module counter.
[ ] predecessor/sequence/hash assigned atomically.
[ ] failed append doesn't leave gap according to current test.

DEPOSIT INTEGRATION

[ ] only successful tested deposits append events.
[ ] same idempotency key replay does not duplicate event.
[ ] idempotency conflict appends nothing.
[ ] failed/closed-account deposit appends nothing.
[ ] balance + event mutation atomic if current integration requires both.

FULL REPLAY

[ ] replay starts empty.
[ ] no live DB projection read.
[ ] exact account+asset grouping.
[ ] BigInt only.
[ ] result shape exact.
[ ] full replay equals live projection.

SNAPSHOT

[ ] snapshot shape exact.
[ ] snapshot sequence correct.
[ ] snapshot input not mutated.
[ ] tail excludes already-snapshotted events.
[ ] snapshot+tail equals full replay.

STATE AT SEQUENCE

[ ] exact inclusive/exclusive boundary implemented.
[ ] later events excluded.
[ ] early/empty boundary follows test.
[ ] no live-state leakage.

PURE REDUCER

[ ] input events not mutated.
[ ] input array not sorted in-place.
[ ] events sorted by canonical sequence.
[ ] duplicates deduped by stable event identity.
[ ] identical-payload legitimate events not lost.
[ ] no DB/global/time/random side effects.
[ ] shuffled+duplicated property test passes.

REGRESSION

[ ] typecheck passes.
[ ] Challenge 06 passes.
[ ] Challenge 04b passes.
[ ] Task 8 idempotency checks pass.
[ ] Challenge 13 passes.
[ ] Challenge 02 passes.
[ ] Challenge 09 passes.
[ ] Challenge 20/11/19 regressions recorded.
[ ] sanity recorded.
[ ] full suite recorded honestly.
[ ] protected files unchanged.
[ ] Task 26 note created.
[ ] final Git target master.

If any Challenge 06 assertion remains failing:
- Task 26 status = PARTIAL;
- report exact failing test/root cause.

============================================================
CZ. FINAL CURSOR REPORT
============================================================

Return:

1. Task 26 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact changed files.
5. Exact Challenge 06 test count.
6. Score-map / 100-vs-89 note.
7. Event model.
8. Event table/schema used.
9. Sequence semantics.
10. Hash algorithm.
11. Canonical hash input.
12. Genesis predecessor.
13. Append atomicity.
14. Chain verification.
15. First-break reporting.
16. Deposit integration.
17. Idempotency interaction.
18. Full replay algorithm.
19. Projection shape.
20. Snapshot shape/boundary.
21. State-at-sequence behavior.
22. Dedup identity.
23. Shuffle/order normalization.
24. BigInt strategy.
25. Purity/input immutability.
26. Typecheck.
27. 6a result.
28. 6b result.
29. 6c result.
30. 6d result.
31. Full Challenge 06 result.
32. Challenge 04b/idempotency regressions.
33. Challenge 13.
34. Challenge 02/09.
35. Challenge 20/11/19.
36. broader regressions.
37. full-suite result.
38. remaining future failures.
39. confirmation protected files unchanged.
40. final diff summary.
41. reviewed Git commands targeting master.

Suggested commit:

feat: add event sourcing and deterministic replay

Do not automatically commit, merge, or push.
````

---

# Task 26 acceptance matrix

| Area | Required behavior |
|---|---|
| Event log | Append-only |
| Event sequence | Strict + gapless |
| Sequence source | Persistent/atomic |
| Previous hash | Exact predecessor |
| Genesis previous hash | Exact organizer contract |
| Event hash | Exact canonical test oracle |
| Tamper | Detected |
| Broken point | First one reported |
| Replay source | Events only |
| Full replay | Equals live deposit projection |
| Money | Exact BigInt |
| Snapshot | Exact state + sequence |
| Tail | Only after snapshot boundary |
| Snapshot + tail | Equals full replay |
| Historical state | Excludes later events |
| Shuffled events | Canonically sorted |
| Duplicate events | Applied once |
| Dedupe | Stable event identity, not payload |
| Pure reducer | No DB/global/time/random writes |
| Input arrays | Not mutated |
| Deposit idempotency | No duplicate events |
| Failed deposit | No event |
| Event/amount | Exact minor-unit string |
| Future domains | Not event-sourced now |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 26

Official final branch:

**`master`**

Workflow:

**`master` → `task-26` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 26 branch

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
task-26
```

Official final branch:

```text
master
```

---

## 2. Run final Task 26 verification

```powershell
npm run typecheck

npm test challenge06.test.ts

npm test challenge04.test.ts -t "Challenge 4b"

npm test challenge00b.test.ts -t "Challenge 0m"

npm test challenge00c.test.ts -t "Challenge 0w"

npm test challenge13.test.ts

npm test challenge02.test.ts

npm test challenge09.test.ts

npm test challenge20.test.ts

npm test challenge11.test.ts

npm test challenge19.test.ts

npm test challenge10.test.ts

npm test challenge05.test.ts

npm test challenge03.test.ts

npm test challenge01.test.ts

npm test challenge00.test.ts

npm test _sanity.test.ts

git diff --check
```

If current Challenge 06 labels exist:

```powershell
npm test challenge06.test.ts -t "Challenge 6a"

npm test challenge06.test.ts -t "Challenge 6b"

npm test challenge06.test.ts -t "Challenge 6c"

npm test challenge06.test.ts -t "Challenge 6d"
```

Use actual labels if they differ.

Then:

```powershell
npm test
```

---

## 3. Review Task 26 changes

```powershell
git status --short
git diff --stat
git diff --name-only
```

Review actual event-source files identified by Cursor:

```powershell
git diff -- "<actual-event-model-path>"
git diff -- "<actual-event-store-or-repository-path>"
git diff -- "<actual-replay-path>"
```

Do not paste placeholders literally.

If deposit integration changed:

```powershell
git diff -- src/repositories/settlementRepository.ts
git diff -- src/controller/settlementController.ts
```

Review note:

```powershell
git diff -- docs/clearhouse-task-26-event-sourcing.md
```

If a designated existing event migration genuinely changed under an organizer-proven exception:

```powershell
git diff -- "<actual-designated-event-migration-path>"
```

Review it especially carefully.

---

## 4. Stage only Task 26 files

Always stage the engineering note:

```powershell
git add -- docs/clearhouse-task-26-event-sourcing.md
```

Stage each actual event source path:

```powershell
git add -- "<actual-event-model-path>"
git add -- "<actual-event-store-or-repository-path>"
git add -- "<actual-replay-path>"
```

Do not paste placeholders literally.

Only if deposit integration actually changed:

```powershell
git add -- src/repositories/settlementRepository.ts
git add -- src/controller/settlementController.ts
```

Only if an existing designated Challenge 06 migration was proven necessary and actually changed:

```powershell
git add -- "<actual-designated-event-migration-path>"
```

Do not stage unrelated migrations.

If a file includes unrelated work:

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
- seeds
- unrelated migrations
- `.env`
- `.gitignore`
- Task 27+ work
- unrelated business modules.

---

## 6. Commit Task 26

```powershell
git commit -m "feat: add event sourcing and deterministic replay"
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

## 8. Merge Task 26

Prefer:

```powershell
git merge --ff-only task-26
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-26
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

Then:

```powershell
npm run typecheck

npm test challenge06.test.ts

npm test challenge04.test.ts -t "Challenge 4b"

npm test challenge13.test.ts

npm test challenge02.test.ts

git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge20.test.ts
npm test challenge19.test.ts
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

The local HEAD must match remote `refs/heads/master`.

---

# If push is rejected

Do not force.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If safe for the local-only Task 26 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge06.test.ts
npm test challenge04.test.ts -t "Challenge 4b"
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts deliberately.

---

# Fast Task 26 checklist

- [ ] branch = task-26
- [ ] final branch = master
- [ ] challenge06 fully read
- [ ] config/scores read-only
- [ ] visible 89 vs overview 100 documented
- [ ] exact event interface discovered
- [ ] exact event table discovered
- [ ] exact hash algorithm discovered
- [ ] exact canonical hash bytes/string discovered
- [ ] exact genesis previous-hash discovered
- [ ] append-only history
- [ ] sequence persistent
- [ ] sequence strictly increasing
- [ ] sequence no gaps
- [ ] predecessor + sequence + hash assigned atomically
- [ ] event hash recomputed during verification
- [ ] tampered amount detected
- [ ] first broken link reported
- [ ] no silent repair
- [ ] successful deposit appends exactly one event
- [ ] same idempotent replay appends no second event
- [ ] conflict/failed deposit appends no event
- [ ] event and live balance transactionally consistent if required
- [ ] full replay uses event input/log only
- [ ] full replay exact BigInt
- [ ] account+asset separated
- [ ] full replay equals live projection
- [ ] snapshot shape exact
- [ ] snapshot boundary exact
- [ ] tail does not reapply snapshot event
- [ ] snapshot+tail equals full replay
- [ ] state-at-sequence excludes later events
- [ ] pure reducer
- [ ] shuffled events sorted by sequence
- [ ] duplicate events deduped by stable identity
- [ ] identical legitimate deposit payloads not deduped incorrectly
- [ ] inputs not mutated
- [ ] no Number/parseFloat money
- [ ] Challenge06 passes
- [ ] Challenge04b passes
- [ ] idempotency regressions pass
- [ ] Challenge13 passes
- [ ] Challenge02/09 pass
- [ ] Challenge20/11/19 pass or regressions explained
- [ ] sanity/full suite recorded
- [ ] protected files unchanged
- [ ] Task26 note created
- [ ] committed on task-26
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 27 — Challenge 08: Market Data and Time.
