# ClearHouse — Complete Enhanced Cursor Prompt for Task 32

**Task:** Challenge 17 — Live Dashboard Updates  
**Primary scope:** browser WebSocket client / live-feed state machine + ordered per-topic delivery + reconnect/resync + dashboard connection-state UI  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-32`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 32 purpose

Task 32 implements the full **Challenge 17 — Live Dashboard Updates** client-side challenge.

Task 31 already provides the authenticated server-side WebSocket feed.

Task 32 must make the browser/client consume that feed correctly even when real-time delivery is imperfect:

- connection state changes;
- the feed goes quiet;
- frames arrive duplicated;
- frames arrive out of order;
- a sequence gap appears;
- the missing frame never arrives;
- one topic breaks while another stays healthy;
- the socket disconnects;
- reconnect attempts fail;
- reconnect delays use exponential backoff + jitter;
- a connection resumes from prior delivered sequence;
- old data stays visible while stale/reconnecting;
- the user/client explicitly stops the feed.

The client must preserve correctness **per topic**, not globally.

This task includes:

- the reusable browser live-feed state machine;
- pure order-book delta application;
- dashboard connection-state presentation.

Do **not** rewrite the WebSocket server from Task 31 unless `tests/challenge17.test.ts` proves a tiny protocol compatibility defect. Server-side Challenge 18 must remain passing.

The current CodeCommit checkout and `tests/challenge17.test.ts` are authoritative.

---

# Published Challenge 17 contract — 150 points

## 17a — Connection status — 20 pts

### 17a-1 — 20 pts

The feed reports:

- `connecting`
- `live`
- `stale`

at exactly the organizer-defined moments.

It must **never report the same status twice in a row**.

Important:

- determine whether `live` begins on WebSocket `open` or only after valid data/snapshot arrives;
- determine exactly when the stale timer starts/resets;
- determine whether ordinary duplicate/ignored frames count as activity;
- determine what happens to stale state while reconnecting/down.

Read the test before implementing transitions.

---

## 17b — Per-topic ordering — 45 pts

### 17b-1 — 25 pts

Messages can arrive:

- shuffled;
- duplicated.

The client must deliver each valid sequence **once**, and in exact increasing order, independently for each topic.

Example conceptually:

```text
topic A receives: 3, 1, 2, 2, 4
delivered:         1, 2, 3, 4
```

But only after the exact baseline/snapshot semantics required by the test.

Topic A's sequencing must not affect topic B.

### 17b-2 — 20 pts

If a sequence gap never fills:

- exactly one resync is requested for that topic;
- other topics continue normally;
- deltas for that affected topic are ignored while awaiting the next snapshot;
- the next valid snapshot re-establishes the baseline.

Do not request repeated resync messages for the same unresolved gap.

---

## 17c — Reconnecting — 40 pts

### 17c-1 — 25 pts

Reconnect delays must follow the organizer's exact:

- exponential backoff formula;
- cap;
- jitter formula.

The test likely injects:

- timer controls;
- random source;
- delay options.

Do not use uncontrolled `Math.random()` if an injected random function exists.

Do not guess the formula.

Read the test and match it exactly.

Backoff must reset once valid data flows again according to the test contract.

### 17c-2 — 15 pts

On reconnect:

- subscriptions are sent again;
- each subscription resumes from the **last delivered sequence**;
- the new connection begins **without a trusted baseline**;
- failed reconnect attempts retry;
- the client must **never report `stale` while the connection is down/reconnecting**.

The last delivered sequence and "baseline currently valid" are different pieces of state.

Do not erase the resume sequence merely because the baseline is invalidated.

---

## 17d — Stopping — 10 pts

### 17d-1 — 10 pts

`stop()` must:

- close the socket once;
- cancel every timer;
- ignore late frames/events;
- never reconnect.

Repeated `stop()` must follow the exact organizer idempotency behavior.

After stop, no stale timer, gap timer or reconnect timer may later emit work.

---

## 17e — Applying order-book deltas — 15 pts

### 17e-1 — 15 pts

Applying a stream of depth deltas must:

- match an independent reference model;
- never mutate the input snapshot/book;
- reject invalid deltas.

Task 31's `diffDepth()` produces server deltas.

Task 32's `applyBookDelta()` must consume the exact same protocol.

Typical semantics from Challenge 18 are:

- quantity `0` removes a level;
- nonzero changed/new quantity inserts/replaces the level;
- untouched levels remain;
- side ordering remains canonical.

But read the exact Challenge 17 types and invalid cases.

---

## 17f — Dashboard connection-state UI — 20 pts

### 17f-1 — 20 pts

Dashboard behavior:

- `stale` → keep old data visible + show a note/connection indication;
- `reconnecting` → keep old data visible + show a note/connection indication;
- `live` → restore normal live indication;
- existing `loading`, `empty`, and `error` panels must remain correct and must not be overwritten by connection-status rendering.

Do not clear the order book simply because the connection becomes stale.

Do not replace an existing error/loading/empty panel with stale/reconnecting text if the organizer expects those panels to remain authoritative.

---

# Challenge 17 score map

```text
17a = 20
17b = 45
17c = 40
17d = 10
17e = 15
17f = 20
----------------
Total = 150
```

These are available points only, not an earned-score claim.

---

# Core architecture — one connection, independent topic state

A strong architecture should normally separate:

## Connection-level state

Examples:

- stopped?
- current socket?
- connection generation/token?
- current connection status?
- reconnect attempt count?
- reconnect timer?
- stale timer / last meaningful data time?
- configured subscriptions?

## Per-topic state

For each topic:

- last delivered sequence;
- whether a trusted baseline currently exists;
- pending out-of-order frames keyed by sequence;
- gap timer;
- whether a resync has already been requested;
- whether currently awaiting a fresh snapshot;
- current topic data/book if the live feed owns it, or callbacks for delivery.

Do not use one global:

- `lastSeq`;
- gap timer;
- resync flag;
- out-of-order buffer

for all topics.

---

# Critical invariant — last delivered sequence vs baseline validity

On a healthy stream:

```text
lastDeliveredSeq = 42
hasBaseline = true
```

After the connection drops:

```text
lastDeliveredSeq = 42
hasBaseline = false
```

The value `42` is still needed to tell the server:

```text
resume from 42
```

But incoming deltas on the new socket must not necessarily be applied until the server establishes the new baseline according to the exact protocol/test.

Do **not** reset last delivered sequence to zero simply because the connection drops.

Do **not** keep `hasBaseline = true` merely because old data remains visible in the dashboard.

---

# Critical invariant — generation guards

Browser WebSocket events may arrive after:

- a reconnect created a replacement socket;
- `stop()` was called;
- an old socket's `close`/`message` callback runs late.

A strong implementation should associate each socket with a connection generation or compare against `currentSocket`.

Old socket events must be ignored.

Otherwise:

- an old close can schedule a reconnect after a new connection is healthy;
- a late old message can corrupt current topic sequence;
- an old open can change status incorrectly.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 32

Copy the complete block below into Cursor Agent mode.

````text
Act as my senior browser real-time systems engineer, vanilla-JavaScript state-machine engineer, deterministic networking reviewer, and frontend accessibility/security engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 32 ONLY: implement Challenge 17 — Live Dashboard Updates — completely and correctly.

Preserve all completed Tasks 1–31.

Task 31 already implemented the Challenge 18 WebSocket server/hub.

Task 32 is primarily CLIENT-SIDE:
- liveFeed.js or the current equivalent;
- pure applyBookDelta logic;
- minimal dashboard connection-state integration.

Do not stop at a plan. Inspect the current test/source, implement the full Challenge 17 state machines, run tests/regressions, create the Task 32 engineering note, and show reviewed Git commands.

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

task-32

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–31;
- work on task-32;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT TASK 32 SCOPE
============================================================

IMPLEMENT:

Challenge 17a:
- connecting/live/stale status transitions;
- no repeated status notification.

Challenge 17b:
- independent per-topic sequence state;
- duplicate suppression;
- out-of-order buffering;
- ordered drain;
- unresolved-gap timeout;
- exactly-one resync request per affected gap;
- affected-topic deltas ignored until fresh snapshot.

Challenge 17c:
- exact capped exponential backoff;
- exact jitter formula;
- reconnect retries;
- backoff reset condition;
- resubscribe from last delivered sequence;
- no trusted baseline immediately after reconnect;
- never stale while down/reconnecting.

Challenge 17d:
- terminal stop;
- close socket once;
- clear all timers;
- ignore late callbacks;
- never reconnect.

Challenge 17e:
- pure `applyBookDelta()`;
- exact depth semantics;
- invalid delta rejection;
- no input mutation.

Challenge 17f:
- dashboard live/stale/reconnecting indication;
- old data preserved during stale/reconnecting;
- loading/empty/error panels preserved.

PRESERVE:
- Task 22 base dashboard;
- Task 24 account/risk/trades dashboard;
- Task 31 WebSocket protocol/server;
- Task 5 browser signing;
- current vanilla-JS/no-build architecture;
- accessibility/XSS safety.

DO NOT IMPLEMENT:
- unrelated backend changes;
- new WebSocket server architecture;
- Task 33 final end-to-end publish wiring unless Challenge17 requires an exact small compatibility hook;
- Task 34 regression-wide fixes outside proven Task32 scope.

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
- seeds
- grading/result scripts

Do NOT install:
- React;
- Vue;
- Svelte;
- RxJS;
- reconnecting-websocket;
- state-machine libraries;
- book libraries.

Use current:
- vanilla JS;
- DOM;
- WebSocket API;
- timers.

Do NOT:
- increase timing test timeouts;
- add arbitrary sleeps;
- hardcode visible random values;
- special-case known sequences/topics;
- add NODE_ENV/VITEST branches;
- freeze random jitter.

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
git log -15 --oneline --decorate
git diff --stat
git diff --cached --stat

Confirm:
- origin = official CodeCommit remote;
- master = official final submission branch.

Verify Task 31 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-31 exists:

git log --oneline --decorate --max-count=10 task-31

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-32

If task-32 already exists:

git branch --list task-32
git log --oneline --decorate --max-count=10 task-32

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

- docs/clearhouse-task-22-dashboard.md
- docs/clearhouse-task-24-portfolio-risk-trades-dashboard.md
- docs/clearhouse-task-31-websocket-feed.md

Verify actual source.

Read:
- client/js/liveFeed.js
- client/js/dashboard.js
- client/js/app.js
- client/index.html
- client/dashboard.css or actual stylesheet

Use actual paths.

Before editing run:

npm run typecheck
npm test challenge18.test.ts
npm test challenge12.test.ts
npm test challenge20.test.ts

Record any pre-existing failures.

Challenge 18 MUST remain passing after Task 32.

============================================================
F. READ CHALLENGE 17 COMPLETELY
============================================================

Read:

tests/challenge17.test.ts

from first line to last line.

Read:

config/scores.ts

READ ONLY.

Build an exact contract matrix:

test
| points
| imported export/class
| constructor/options
| timer/random dependencies
| input frame
| callback/output
| exact transition
| current defect

Record:
- exact Challenge 17 test count;
- exact `LiveFeed` constructor/function API;
- exact callbacks;
- exact status values;
- exact WebSocket factory injection;
- exact timer injection or global timers;
- exact random/jitter source;
- stale timeout;
- gap timeout;
- reconnect base delay;
- reconnect cap;
- jitter formula/range;
- topic subscription representation;
- server frame shapes;
- resume request shape;
- snapshot semantics;
- delta semantics;
- order-book level shape;
- invalid delta cases;
- exact dashboard DOM IDs/classes/text expectations.

DO NOT GUESS.

============================================================
G. DISCOVER CURRENT LIVE-FEED SOURCE
============================================================

Search:

rg -n "LiveFeed|liveFeed|WebSocket|connecting|reconnecting|stale|resync|lastSeq|gap|backoff|jitter|applyBookDelta|connection status" client src tests

PowerShell fallback:

Get-ChildItem -Recurse client,src,tests -File |
  Select-String -Pattern "LiveFeed|liveFeed|WebSocket|connecting|reconnecting|stale|resync|lastSeq|gap|backoff|jitter|applyBookDelta|connection status"

Read every current Challenge 17 stub/helper completely.

Do not assume only one file.

Identify exactly which files tests import directly.

============================================================
H. RUN TASK 32 BASELINE
============================================================

Run:

npm test challenge17.test.ts

If labels exist:

npm test challenge17.test.ts -t "Challenge 17a"
npm test challenge17.test.ts -t "Challenge 17b"
npm test challenge17.test.ts -t "Challenge 17c"
npm test challenge17.test.ts -t "Challenge 17d"
npm test challenge17.test.ts -t "Challenge 17e"
npm test challenge17.test.ts -t "Challenge 17f"

Use actual labels.

Record:
- exact executed count;
- pass/fail;
- fake-timer state if shown;
- expected/actual reconnect delays;
- first sequencing divergence;
- first UI assertion failure.

Filtered-out tests are NOT passed.

============================================================
I. PRESERVE THE TASK 31 PROTOCOL
============================================================

Read current Task31 protocol from source and tests.

The client must use the exact server frame/request shapes.

Do NOT "simplify" server frames.

If Challenge17 uses a mocked WebSocket rather than real Task31:
still make liveFeed protocol compatible with current server.

Do not create a second incompatible topic protocol.

============================================================
J. CONNECTION-LEVEL STATE
============================================================

Read current architecture.

A robust feed normally needs connection-level state such as:

- stopped;
- socket;
- socket generation;
- current status;
- reconnect attempt;
- reconnect timer;
- stale timer;
- whether connection is currently considered up;
- configured topics/subscriptions.

Use exact current API.

No module-global state.

Multiple LiveFeed instances must be isolated.

============================================================
K. PER-TOPIC STATE — CRITICAL
============================================================

Every topic needs independent ordering state.

Potential internal state:

{
  lastDeliveredSeq,
  hasBaseline,
  pendingBySeq,
  gapTimer,
  resyncRequested,
  awaitingSnapshot
}

Use actual current names/types.

Do NOT share:
- one lastSeq across topics;
- one pending buffer;
- one gap timer;
- one resync flag.

Challenge 17b-2 explicitly requires a gap on one topic to resync only that topic.

============================================================
L. BASELINE / SNAPSHOT MODEL
============================================================

Read exact frame protocol.

A snapshot establishes a trusted baseline for its topic.

On a valid snapshot:
- set/replace current topic baseline according to current callbacks/model;
- set lastDeliveredSeq to snapshot seq as organizer expects;
- mark `hasBaseline = true`;
- clear old gap/resync waiting state;
- clear/handle pending deltas according to exact test;
- reset relevant activity/stale state if snapshot counts as flowing data.

Do not deliver stale buffered deltas that are older than/equal to the snapshot sequence.

============================================================
M. NO BASELINE DELTA BEHAVIOR
============================================================

Read test carefully.

Before a trusted snapshot:
the client may need to:
- ignore deltas;
- buffer them;
- request snapshot/resync.

Do not guess.

Challenge 17c-2 explicitly says reconnect "starts without a baseline".

This means do not immediately treat retained last sequence as a valid current book baseline unless the protocol/test says replayed deltas can rebuild from old retained visible data.

Follow exact test.

============================================================
N. DUPLICATE SUPPRESSION — 17b-1
============================================================

For a topic with valid baseline and last delivered sequence L:

frame seq <= L:
duplicate/old -> ignore

frame seq == L + 1:
deliver immediately

frame seq > L + 1:
out of order/gap -> buffer according to current strategy

Do not deliver duplicates twice.

Do not let duplicate frame reset state incorrectly.

Use integer sequence exactly.

Validate seq type if test requires.

============================================================
O. OUT-OF-ORDER BUFFERING
============================================================

Use a per-topic Map keyed by sequence.

If frame 3 arrives before 2:
buffer 3.

When 2 arrives:
deliver 2;
then drain 3;
then continue draining L+1 while present.

Do not sort whole history on every frame if a Map + sequential lookup is enough.

Do not mutate input frames.

============================================================
P. DUPLICATE PENDING FRAME
============================================================

If seq 3 is already buffered and another seq 3 arrives:
ignore duplicate according to exact contract.

Do not store two copies.

Do not deliver twice later.

If same seq arrives with conflicting payload:
read test; do not invent behavior.

============================================================
Q. ORDERED DRAIN
============================================================

After delivering expected seq:

while pending has lastDeliveredSeq + 1:
- remove it;
- deliver it;
- increment last delivered.

Stop at first missing sequence.

Do not deliver a later sequence across a gap.

============================================================
R. GAP DETECTION
============================================================

A gap exists when:
- baseline exists;
- a future delta arrives with seq > lastDeliveredSeq + 1.

Start the exact per-topic gap timer according to test.

Do not start multiple timers for the same unresolved gap.

If missing frames arrive and buffer drains completely:
cancel the gap timer.

If a smaller remaining gap still exists:
read whether timer continues from original detection or restarts.

Match exact test.

============================================================
S. GAP TIMEOUT — 17b-2
============================================================

When the gap timer expires and the gap is still unresolved:

- send exactly ONE resync request for that topic;
- mark topic awaiting fresh snapshot;
- ignore subsequent deltas for that topic until snapshot;
- leave other topics unaffected.

Do not repeatedly send resync on every ignored delta.

Do not globally reset all topic state.

============================================================
T. IGNORING DELTAS WHILE AWAITING SNAPSHOT
============================================================

After resync requested:

affected topic:
- ignore deltas until valid snapshot as required.

Do not:
- append endlessly to pending buffer;
- apply them to stale baseline.

On fresh snapshot:
re-establish state cleanly.

Other topics continue.

============================================================
U. GAP TIMER CLEANUP
============================================================

Clear per-topic gap timer when:
- gap resolves;
- snapshot resets topic;
- connection drops/reconnect semantics invalidate baseline;
- stop() called.

No timer may fire after stop.

No timer from an old connection may send resync on a new socket unless test explicitly carries that gap, which is unlikely.

============================================================
V. CONNECTION STATUS DEDUP — 17a
============================================================

Centralize status reporting.

Implement a helper conceptually:

setStatus(next):
    if next === currentStatus:
        return
    currentStatus = next
    callback(next)

Use actual API.

Do not notify repeated:
- connecting;
- live;
- stale;
- reconnecting

twice in a row.

Challenge 17a explicitly checks no repeated status.

============================================================
W. EXACT STATUS VOCABULARY
============================================================

Read test.

Published statuses include:
- connecting;
- live;
- stale.

Challenge 17f references:
- stale;
- reconnecting;
- live.

Therefore current API may include reconnecting as an additional status.

Use exact strings/enums from test/source.

Do not invent:
- offline;
- disconnected

unless current API defines them.

============================================================
X. INITIAL STATUS
============================================================

Read test.

Determine when first `connecting` fires:
- constructor;
- start();
- connect().

Do not emit twice due constructor + socket creation.

Do not assume WebSocket open means live.

============================================================
Y. WHEN LIVE BEGINS
============================================================

Critical: read 17a/17c tests.

Possible organizer rule:
- live only after valid snapshot/data flows, not merely `socket.onopen`.

This matters because 17c-1 says backoff resets once **data flows again**.

Do not reset reconnect attempt on open if test expects reset on first data.

Do not report live too early.

============================================================
Z. STALE TIMER
============================================================

Read exact stale timeout and reset condition.

Potentially reset stale timer on each successfully accepted/delivered valid data frame.

Do not reset stale timer on:
- duplicate frame;
- malformed frame;
- ping/pong not surfaced as feed data;
- ignored out-of-baseline delta

unless test says these count as activity.

Use organizer exact semantics.

============================================================
AA. STALE WHILE CONNECTED ONLY
============================================================

Challenge 17c-2 explicitly says:

never report stale while down.

Therefore when socket closes / reconnecting:
- cancel stale timer;
- do not schedule stale until connection becomes live again according to test.

Do not transition:
reconnecting -> stale

simply because old stale timeout expires.

============================================================
AB. STALE DOES NOT DISCARD DATA
============================================================

Stale is a presentation/status signal.

Do not clear:
- last good order book;
- portfolio;
- DOM rows;
- last delivered sequence

just because stream went quiet.

Old data remains visible, marked stale.

============================================================
AC. DATA AFTER STALE
============================================================

When valid live data resumes on same connection:
status should return to live according to exact test.

Do not emit live twice if already live.

Reset stale timer.

============================================================
AD. SOCKET OPEN HANDLING
============================================================

Read exact protocol.

On socket open:
- send subscription request(s);
- include required resume sequence;
- set baseline-invalid state per reconnect semantics;
- do not necessarily report live yet.

Use exact Task31 server subscribe shape.

============================================================
AE. RESUBSCRIBE FROM LAST DELIVERED SEQ — 17c-2
============================================================

For each topic, retain:

lastDeliveredSeq

across disconnect.

When new socket opens:
send subscription/resume request containing that last delivered seq using exact protocol.

Do not use:
- highest buffered seq;
- last received seq;
- snapshot seq from an untrusted/failed baseline
instead of last DELIVERED seq.

"Delivered" is the organizer wording.

============================================================
AF. RECONNECT STARTS WITHOUT BASELINE
============================================================

On disconnect/reconnect:
for each topic:
- preserve lastDeliveredSeq for resume;
- invalidate `hasBaseline`;
- clear pending/gap-resync transient state according to test;
- wait for new snapshot/baseline.

Do not assume old visible dashboard book equals a trusted live-feed baseline.

Old DOM data can remain displayed while state machine waits.

============================================================
AG. RECONNECT TRIGGER
============================================================

Read test.

Reconnect likely occurs on:
- close;
- connection error/failed connect.

Prevent duplicate reconnect scheduling when both error and close fire for the same failed socket.

One connection failure should schedule one retry.

Use connection generation/current socket guards.

============================================================
AH. SOCKET GENERATION GUARD
============================================================

Each connect attempt should be identifiable.

Old socket callbacks must not affect current connection.

At minimum:
inside callback verify:
socket === currentSocket
and not stopped.

Or use incrementing generation.

Late old:
- open;
- message;
- close;
- error

must be ignored.

This is important after rapid reconnects and stop.

============================================================
AI. RECONNECT BACKOFF — 17c-1
============================================================

Read exact formula from test.

Determine:
- first retry attempt index;
- base delay;
- exponent;
- cap ordering;
- jitter range/formula;
- random injection;
- rounding/truncation.

DO NOT assume.

A common concept is:

raw = min(cap, base * 2^attempt)
delay = applyJitter(raw, random())

But organizer checks exact values.

Implement exactly what the test oracle uses.

============================================================
AJ. JITTER RANDOM SOURCE
============================================================

If constructor/options inject `random`:
use it.

Do not call Math.random directly.

This allows deterministic tests.

If no injection exists but starter provides helper:
use it.

Do not freeze random.

============================================================
AK. RECONNECT ATTEMPT COUNTER
============================================================

Read expected indexing.

Do not off-by-one.

Record:
- attempt value before scheduling;
- when increment occurs;
- when reset occurs.

Do not reset merely because TCP/WS opens if 17c says reset once data flows again.

============================================================
AL. BACKOFF CAP
============================================================

Exact cap behavior may be tested.

Apply cap at exact stage organizer expects:
- before jitter;
- after jitter

according to test.

Do not guess.

============================================================
AM. FAILED RECONNECT RETRIES — 17c-2
============================================================

If reconnect socket fails:
schedule another retry with next backoff step.

Do not give up after one attempt.

Do not create overlapping reconnect timers.

At most one reconnect timer pending at a time.

============================================================
AN. RESET BACKOFF ON DATA FLOW
============================================================

Challenge wording:

"reset once data flows again"

Therefore after valid data/snapshot is successfully accepted according to test:
- reconnect attempt counter resets.

Do not necessarily reset on socket open.

Read test exact event.

============================================================
AO. TIMER INJECTION / FAKE TIMERS
============================================================

Challenge17 likely uses fake timers.

Use normal setTimeout/clearTimeout through injected/current environment.

Do not capture real timer functions in a way that bypasses Vitest fake timers unless current architecture intentionally injects them.

Do not use busy loops.

No sleeps.

============================================================
AP. STOP() — 17d
============================================================

`stop()` is terminal for the feed instance unless API says it may restart.

On first stop:
- set stopped flag BEFORE closing socket/timers;
- cancel reconnect timer;
- cancel stale timer;
- cancel every per-topic gap timer;
- close current socket exactly once if needed;
- clear current socket reference as appropriate.

Late socket close must not schedule reconnect because stopped is already true.

============================================================
AQ. STOP CLOSE ONCE
============================================================

If repeated stop():
do not call socket.close repeatedly.

If socket already closing/closed:
do not throw.

Follow exact test count.

Use terminal stopped state.

============================================================
AR. IGNORE LATE FRAMES AFTER STOP
============================================================

Every callback should early-return if:
- stopped;
- callback belongs to stale socket generation.

A late message after stop must not:
- deliver data;
- change status;
- reset timers;
- request resync.

============================================================
AS. NO RECONNECT AFTER STOP
============================================================

Socket close caused by stop must never schedule a reconnect.

Reconnect timer callback already queued before stop must be cancelled and/or check stopped before connecting.

Use both:
- clear timer;
- guard inside callback.

============================================================
AT. STATUS AFTER STOP
============================================================

Read test.

Do not invent a `stopped` status unless API expects it.

17d focuses close/timers/reconnect behavior.

Preserve exact status contract.

============================================================
AU. MESSAGE PARSING
============================================================

Read Task31 frame shapes.

Parse incoming JSON safely.

Malformed server frame:
follow exact Challenge17 behavior.

Do not let one malformed message crash feed loop.

Do not treat arbitrary error frames as deltas.

Use explicit frame type dispatch.

============================================================
AV. SNAPSHOT VS DELTA TYPES
============================================================

Distinguish:
- snapshot;
- delta/data;
- error;
- heartbeat/application frames if any.

Protocol pings are handled by browser internally; do not expect browser JS ping event.

Use exact server protocol.

============================================================
AW. SERVER ERROR FRAMES
============================================================

Read test/source.

If subscription/resync returns error:
handle according to current callback/connection status contract.

Do not turn every topic error into global connection failure unless test says so.

One forbidden topic should not necessarily break allowed topic.

============================================================
AX. TOPIC CALLBACK DELIVERY
============================================================

Read LiveFeed API.

It may:
- call one `onMessage(frame)`;
- call per-topic callback;
- expose `onData(topic,payload)`.

Preserve exact public API.

"Delivered once each, in order" refers to this tested delivery callback.

Do not mutate delivered frame.

============================================================
AY. ORDERING ONLY AFTER BASELINE
============================================================

Read exact semantics.

Snapshot sequence may set last delivered seq but may be delivered through a separate snapshot callback.

Do not assume snapshot is part of same delta callback count.

Match test.

============================================================
AZ. BUFFER SIZE
============================================================

Only add a pending-buffer bound if current test/options specify one.

Do not invent a small limit that fails valid shuffled test.

Gap timeout/resync is the published recovery mechanism.

============================================================
BA. GAP RESOLUTION BEFORE TIMEOUT
============================================================

If missing seq arrives before timeout:
- cancel timer when no gap remains;
- deliver buffered contiguous frames.

Do not send resync.

Exactly zero resync for resolved gap.

============================================================
BB. SECOND GAP LATER
============================================================

After first gap resolves normally:
a later distinct gap must be able to start a new timer.

After resync snapshot completes:
future gaps may again request one resync.

`resyncRequested` is per unresolved episode, not permanent.

============================================================
BC. GAP CHANGES WHILE TIMER ACTIVE
============================================================

If expected seq changes because some missing frames arrive but another gap remains:
read test.

A robust approach:
one timer protects the existence of any current gap, not a specific first missing seq, unless organizer expects restart.

When it fires:
check gap still exists before resync.

Do not blindly resync after gap has resolved.

============================================================
BD. PER-TOPIC INDEPENDENCE
============================================================

Example:

A has missing seq -> waiting/resync.
B receives perfect 10,11,12 -> must continue delivering.

Do not set a global "awaitingSnapshot" flag.

Do not globally pause WebSocket processing.

============================================================
BE. RECONNECT AND GAP TIMERS
============================================================

On socket disconnect:
clear old per-topic gap timers.

Connection is down; a pending gap resync cannot be sent on old socket.

On reconnect:
baseline is invalid and subscription/resume re-establishes state.

Do not fire stale gap callback into new connection.

============================================================
BF. LAST DELIVERED SEQ AFTER RESYNC SNAPSHOT
============================================================

Fresh snapshot at seq S:
set lastDeliveredSeq to S exactly as organizer expects.

Discard/clear pending deltas <= S.

Do not apply old pending frames that the snapshot supersedes.

Read if future pending > S should be discarded or preserved; likely discard on resync to avoid mixing connection epochs, but use test.

============================================================
BG. PURE applyBookDelta() — 17e
============================================================

Read exact function signature and level shape.

It must:
- not mutate input book;
- apply valid delta exactly;
- reject invalid delta.

If book contains bids/asks:
treat sides independently.

If one side only:
follow type.

Do not reuse DOM rendering functions as domain logic.

============================================================
BH. ZERO QUANTITY REMOVES LEVEL
============================================================

Challenge18 `diffDepth()` uses quantity zero for removed levels.

Task32 applyBookDelta should therefore remove matching level on zero quantity if current Challenge17 confirms.

Do not leave a visible 0-quantity row.

Use exact zero type:
- `0`;
- `"0"`;
- `0n`

according to test.

============================================================
BI. NONZERO DELTA UPSERT
============================================================

For a valid nonzero level delta:
- if price exists, replace quantity;
- if absent, insert.

Then sort side in canonical book order.

Do not duplicate a price level.

============================================================
BJ. BOOK SORT ORDER
============================================================

Read exact test/current dashboard.

Typically:
- bids descending;
- asks ascending.

Do not guess.

Keep exact canonical sorting required by independent model.

Do not use floating Number conversion for exact price strings if prices may exceed safe integer.

Use safe exact comparator.

============================================================
BK. EXACT PRICE COMPARATOR
============================================================

If prices are integer strings:
use BigInt for comparison after strict validation.

Do not:
- `Number(price)`;
- `parseFloat(price)`.

If current browser model uses safe numeric prices:
follow exact type, but do not change protocol.

============================================================
BL. applyBookDelta INPUT IMMUTABILITY
============================================================

Do not:
- sort book arrays in place;
- splice caller arrays;
- mutate level objects.

Create new arrays/objects.

Tests may deep-freeze fixtures.

Returned book should not alias mutated input structures where test checks.

============================================================
BM. INVALID DELTAS
============================================================

Read exact invalid cases.

Potential categories MAY include:
- negative quantity;
- malformed price;
- malformed quantity;
- duplicate price levels in one delta;
- invalid side;
- non-array shape.

Examples only.

Follow test.

Throw exact error type required.

Do not silently skip invalid rows if organizer expects rejection.

============================================================
BN. ATOMIC applyBookDelta VALIDATION
============================================================

If one delta row is invalid:
do not partially apply earlier rows to input anyway.

Because implementation is pure, validate/build against copy and throw without mutating original.

Do not return partial result.

============================================================
BO. DASHBOARD INTEGRATION — 17f
============================================================

Read exact tested functions/DOM.

Do not redesign dashboard.

Add the minimum connection-state rendering required.

Preserve existing tested IDs/classes from Challenges 12 and 20.

============================================================
BP. STALE DASHBOARD BEHAVIOR
============================================================

When status becomes stale:
- KEEP the old live data rendered;
- show exact organizer-required stale note/state.

Do not:
- clear tables;
- render loading;
- render empty;
- render error solely due stale.

Stale means data is old, not absent.

============================================================
BQ. RECONNECTING DASHBOARD BEHAVIOR
============================================================

When reconnecting:
- keep old data visible;
- show reconnecting note/state.

Do not clear good previous values.

No flicker back to loading unless current dashboard truly has no data and test expects it.

============================================================
BR. LIVE DASHBOARD BEHAVIOR
============================================================

When status returns live:
- remove/update stale/reconnecting note;
- restore live state exactly.

Do not rerender/duplicate data just to change connection note.

Connection-state indicator should be orthogonal to data panel.

============================================================
BS. LOADING / EMPTY / ERROR PANELS WIN
============================================================

Challenge17f explicitly says loading/empty/error panels are left alone.

Therefore connection-state rendering must not overwrite those panels.

Inspect Task22 render-state architecture.

If a panel is in:
- loading;
- empty;
- error

then stale/reconnecting indicator must not replace its core content.

Maybe a separate status element is the correct design.

Follow test.

============================================================
BT. SAFE DOM RENDERING
============================================================

Use:
- textContent;
- classList;
- hidden/aria attributes

according to existing dashboard style.

Do not insert status text via unsafe `innerHTML`.

Preserve XSS protections from Challenge12.

============================================================
BU. ACCESSIBILITY
============================================================

If existing dashboard has status region:
reuse it.

If new status text is required:
read test for:
- role;
- aria-live;
- text.

Do not break existing accessible names/labels.

Keep changes minimal.

============================================================
BV. CSS
============================================================

Only add minimal styles if needed for:
- live;
- stale;
- reconnecting.

Do not make visual redesign.

Do not hide test-required text.

Do not use animation/timers that complicate fake timer tests.

============================================================
BW. APP INTEGRATION
============================================================

Read current `app.js`.

Do not create multiple LiveFeed instances on repeated init.

Do not register duplicate status/data handlers.

If tests import liveFeed directly and dashboard integration separately:
keep concerns separated.

Only modify app wiring if Challenge17f/current app requires it.

============================================================
BX. TOKEN / WS URL HANDLING
============================================================

Task31 auth transport is authoritative.

If LiveFeed constructs URL with token:
use existing safe source/API.

Do not hardcode real tokens/secrets.

Do not log token.

Do not persist access token into DOM.

If test injects URL/socket factory:
honor injection.

============================================================
BY. WEBSOCKET FACTORY INJECTION
============================================================

Tests may provide a fake socket factory.

Do not directly use global `new WebSocket()` if current constructor accepts:

createWebSocket / socketFactory / WebSocketImpl

Use injected dependency exactly.

This is essential for deterministic reconnect tests.

============================================================
BZ. RANDOM INJECTION
============================================================

Same rule for jitter.

If options include a random function:
use it.

Do not use `Math.random()` as a hidden second source.

============================================================
CA. CLOCK/TIMER INJECTION
============================================================

If current API injects timers/clock:
use them.

If it expects global setTimeout:
use those normally so Vitest fake timers intercept.

Do not capture timers at module load in a way that defeats test spies unless current starter already does.

============================================================
CB. RECONNECT STATUS
============================================================

Read exact transition.

Likely when socket is down and retry scheduled:
status = reconnecting.

Do not emit connecting/reconnecting repeatedly on every timer tick unless test expects.

Central dedup handles repeats.

============================================================
CC. CONNECTING VS RECONNECTING
============================================================

Initial connection:
likely `connecting`.

Subsequent attempts:
likely `reconnecting`.

Read exact test.

Do not treat every attempt as initial connecting.

============================================================
CD. NO STALE WHILE DOWN
============================================================

When close/error leads to reconnect:
- clear stale timer;
- set reconnecting once;
- ensure stale callback cannot later fire.

On a reconnect attempt failure:
remain/re-report according to dedup rule, but never stale.

============================================================
CE. SOCKET CLOSE/ERROR DOUBLE EVENT
============================================================

Many WebSocket implementations emit error then close.

Do not schedule two reconnect timers.

Use a per-generation flag or central `handleDisconnect(socket)` that checks current socket/reconnect scheduled state.

============================================================
CF. SOCKET OPEN AFTER STOP
============================================================

If stop called while connecting and an `open` arrives late:
ignore it and close/leave terminal according to current socket state.

Do not send subscriptions.

Do not change status.

============================================================
CG. LATE MESSAGE FROM OLD SOCKET
============================================================

After reconnect new socket is current:
old socket message must be ignored even if it has a higher sequence.

Otherwise old connection can corrupt new baseline.

Use generation guard.

============================================================
CH. SUBSCRIBE MESSAGE ORDER
============================================================

If multiple topics:
read test exact expected order.

Use deterministic configured topic order.

Do not rely on object key order if subscription input is a Set/Map.

If organizer tests only content:
still keep stable ordering.

============================================================
CI. RESUME SEQ PER TOPIC
============================================================

Do not send one global `fromSeq`.

Each topic can have a different last delivered sequence.

Use per-topic value in subscribe/resume protocol.

============================================================
CJ. FIRST CONNECTION RESUME VALUE
============================================================

Read test.

For a topic never delivered:
resume may be:
- 0;
- undefined/null;
- omitted.

Do not guess.

Use server/client protocol.

============================================================
CK. SERVER SNAPSHOT AFTER RESUME
============================================================

Challenge18 server returns snapshot on subscription.

After reconnect:
client starts without baseline, sends resume info, then uses returned snapshot as baseline according to Challenge17 test.

Do not assume server will replay all missed deltas unless tests define that.

Task31 published challenge used fresh snapshot semantics.

============================================================
CL. ERROR FRAME DOES NOT COUNT AS LIVE DATA
============================================================

Unless test says otherwise:
topic error should not reset stale/backoff as if market data flowed.

Read exact status test.

Be careful to define "data flows again" as accepted snapshot/delta, not arbitrary frame.

============================================================
CM. DUPLICATE DELTA DOES NOT COUNT AS DELIVERED
============================================================

Challenge wording is delivered once each.

Do not increment delivered seq or invoke callback on duplicate.

Whether duplicate counts as connection activity for stale timer is test-defined; inspect.

============================================================
CN. OUT-OF-ORDER FUTURE FRAME ACTIVITY
============================================================

Likewise:
a future buffered frame is received, but not delivered.

Read stale semantics:
does "feed went quiet" mean no frames at all or no valid delivered data?

Implement exact oracle.

Do not assume.

============================================================
CO. STATUS CALLBACK EXCEPTIONS
============================================================

Do not broad-catch user callback bugs and corrupt internal state.

Read current architecture.

If callbacks throw in tests, likely not expected.

Keep state transition consistent.

============================================================
CP. DATA CALLBACK ORDER
============================================================

When buffered frames drain:
invoke callback in exact increasing seq order.

Do not asynchronously schedule each callback.

Synchronous drain is deterministic.

============================================================
CQ. SNAPSHOT DELIVERY ORDER
============================================================

If snapshot callback + status live occur on same frame:
read exact expected order.

Tests may observe:
- data callback first, then live;
- live then data.

Do not guess; inspect assertions.

============================================================
CR. BACKOFF CALCULATION PRECISION
============================================================

Delays are ordinary timer numbers, not money.

Use Number as required for milliseconds.

But match:
- rounding;
- cap;
- jitter

exactly.

Do not accidentally BigInt timer values.

============================================================
CS. HUGE ATTEMPT SAFETY
============================================================

Avoid exponent overflow if retry count grows.

Use cap-aware calculation.

But do not change formula for tested values.

No Infinity passed to setTimeout.

============================================================
CT. RECONNECT TIMER OWNERSHIP
============================================================

At most one reconnect timer.

On timer fire:
clear its handle before connect attempt.

On stop:
clear.

On successful data/reset:
ensure no stale pending retry remains.

============================================================
CU. STALE TIMER OWNERSHIP
============================================================

At most one stale timer.

On accepted activity:
clear prior timer;
schedule new one.

On down:
clear.

On stop:
clear.

Use generation or status guard in timer callback.

============================================================
CV. GAP TIMER OWNERSHIP
============================================================

At most one per affected topic.

Store timer handle in topic state.

Clear on:
- gap resolved;
- snapshot;
- disconnect;
- stop.

Timer callback verifies:
- not stopped;
- current connection generation;
- topic still has unresolved gap;
- no resync already requested.

============================================================
CW. RESYNC SEND SAFETY
============================================================

Before sending resync:
socket must be current and OPEN.

If connection dropped before gap timeout:
do not throw/send.

Reconnect subscription will recover.

Use exact WebSocket OPEN constant or fake socket contract.

============================================================
CX. SOCKET SEND SERIALIZATION
============================================================

Client requests are JSON.

Use exact frame shape.

Do not mutate subscription config.

Do not send when socket isn't open.

Do not queue unlimited client control frames.

============================================================
CY. EXPECTED TASK 32 FILE SCOPE
============================================================

Primary likely:

- client/js/liveFeed.js

Potential Challenge17f files:

- client/js/dashboard.js
- client/js/app.js
- client/index.html
- client/dashboard.css

Only if exact test/current architecture requires a tiny shared protocol helper:
- current client helper module.

Create/update:

- docs/clearhouse-task-32-live-dashboard-updates.md

Normally DO NOT change:

- src/services/liveHub.ts
- src/server.ts
- backend controllers/routes
- matching
- database
- OpenAPI
- seeds/migrations.

Do NOT add tests.

============================================================
CZ. REQUIRED VERIFICATION — CHALLENGE 17
============================================================

After implementation:

npm run typecheck

Primary Task 32 gate:

npm test challenge17.test.ts

If labels exist:

npm test challenge17.test.ts -t "Challenge 17a"
npm test challenge17.test.ts -t "Challenge 17b"
npm test challenge17.test.ts -t "Challenge 17c"
npm test challenge17.test.ts -t "Challenge 17d"
npm test challenge17.test.ts -t "Challenge 17e"
npm test challenge17.test.ts -t "Challenge 17f"

Use actual labels.

Record:
- exact test count;
- exact backoff delays from assertions/output;
- gap/resync behavior;
- fake timer cleanup result.

============================================================
DA. WEBSOCKET SERVER REGRESSION
============================================================

Run:

npm test challenge18.test.ts

This is CRITICAL.

Task 32 must consume the protocol without regressing Task31 server implementation.

If Challenge18 fails after Task32 and no server file changed:
investigate shared protocol constants/helper before touching server.

============================================================
DB. BASE DASHBOARD REGRESSION
============================================================

Run:

npm test challenge12.test.ts

Preserve:
- loading/empty/error;
- XSS safety;
- accessibility;
- order-book rendering;
- signer behavior.

============================================================
DC. DEMO DASHBOARD REGRESSION
============================================================

Run:

npm test challenge20.test.ts

Preserve:
- account list;
- portfolio;
- risk meters;
- recent trades.

============================================================
DD. API / OPENAPI REGRESSION
============================================================

Run:

npm test challenge11.test.ts
npm test challenge19.test.ts

Task32 should not change backend API docs.

============================================================
DE. MATCHING / MARKET REGRESSION
============================================================

Run:

npm test challenge03.test.ts
npm test challenge08.test.ts

Book delta rendering must remain compatible with actual depth semantics.

============================================================
DF. AUTH / SIGNER REGRESSION
============================================================

Run:

npm test challenge01.test.ts

If `app.js`, token plumbing or signer interaction changed, also run exact browser signer regression if present:

npm test challenge00b.test.ts -t "Challenge 0t"

Use actual label.

Do not modify signer unless proven necessary.

============================================================
DG. STRATEGY / FEES / NETTING REGRESSION
============================================================

Run:

npm test challenge15.test.ts
npm test challenge16.test.ts
npm test challenge14.test.ts

No domain changes expected.

============================================================
DH. OPS / FOUNDATION REGRESSION
============================================================

Run:

npm test challenge10.test.ts
npm test challenge06.test.ts
npm test challenge05.test.ts
npm test challenge04.test.ts
npm test challenge02.test.ts
npm test challenge09.test.ts
npm test challenge13.test.ts
npm test _sanity.test.ts

Then:

git diff --check

Finally:

npm test

Record remaining Task33+ integration failures honestly.

Do not broaden Task32 into Task33 automatically.

============================================================
DI. FAILURE DIAGNOSIS — 17a
============================================================

If repeated status:
- status setter does not dedupe;
- open/data/timer all emit same value independently.

If live too early:
- reporting on socket open when test expects first valid data.

If stale too early/late:
- wrong reset event;
- ms units;
- duplicate stale timers.

If stale occurs while reconnecting:
- old stale timer not cleared.

============================================================
DJ. FAILURE DIAGNOSIS — 17b-1
============================================================

If shuffled output remains shuffled:
- delivering on arrival instead of buffering.

If duplicate delivered twice:
- only checking pending, not <= lastDelivered.

If topic B blocks on topic A:
- global sequence/buffer state.

If seq 3 never drains after seq 2:
- no contiguous drain loop.

============================================================
DK. FAILURE DIAGNOSIS — 17b-2
============================================================

If repeated resync requests:
- no resyncRequested/awaitingSnapshot guard.

If other topic stops:
- global awaitingSnapshot flag.

If affected deltas still apply after resync:
- not entering ignore-until-snapshot state.

If resync fires after gap already filled:
- timer not cancelled or callback doesn't recheck.

============================================================
DL. FAILURE DIAGNOSIS — 17c-1
============================================================

If delays differ:
- exponent attempt off by one;
- cap applied before/after jitter incorrectly;
- jitter formula wrong;
- Math.random used instead of injected source;
- rounding wrong.

If backoff fails to reset:
- resetting at wrong event, or never on accepted data.

Record expected and actual delay sequence.

============================================================
DM. FAILURE DIAGNOSIS — 17c-2
============================================================

If reconnect subscription sends wrong seq:
- using highest received/buffered instead of last delivered.

If deltas apply before snapshot:
- hasBaseline not invalidated on disconnect.

If reconnect stops after one failure:
- error/close scheduler disabled incorrectly.

If stale emitted while down:
- stale timer not cleared/guarded.

============================================================
DN. FAILURE DIAGNOSIS — 17d
============================================================

If close called twice:
- repeated stop not idempotent.

If reconnect happens after stop:
- timer not cleared;
- close callback schedules reconnect;
- stopped guard set too late.

If late frame delivered:
- stale socket generation callback not guarded.

If tests hang:
- timer left pending.

============================================================
DO. FAILURE DIAGNOSIS — 17e
============================================================

If input mutated:
- sort/splice direct arrays.

If removed level remains:
- zero quantity treated as a normal row.

If ordering wrong:
- price comparator/side sort wrong.

If invalid delta partially applies:
- validation happens during mutation instead of before pure result construction.

============================================================
DP. FAILURE DIAGNOSIS — 17f
============================================================

If stale clears data:
- status renderer is calling general loading/reset renderer.

If stale replaces error/loading/empty:
- connection status not separated from panel state.

If live duplicates DOM:
- status transition rerenders full dashboard unnecessarily.

Use dedicated connection-status element/state.

============================================================
DQ. TIMING TEST DISCIPLINE
============================================================

Do not fix timing assertions using sleeps or larger test timeout.

Use exact injected:
- timers;
- random;
- delay options.

With fake timers:
ensure all handles can be cleared.

On failure record:
- current time from test if available;
- scheduled delay;
- status event order;
- socket generation.

============================================================
DR. TASK 32 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-32-live-dashboard-updates.md

Include:

1. Starting commit.
2. Working branch task-32.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 17 test count.
6. 150-point score map.
7. LiveFeed public API.
8. WebSocket factory/injection.
9. Status callback/API.
10. Initial status timing.
11. Live transition condition.
12. Stale timeout/reset condition.
13. Status dedup strategy.
14. Connection-level state.
15. Socket generation guard.
16. Per-topic state shape.
17. Snapshot/baseline semantics.
18. last-delivered sequence semantics.
19. duplicate filtering.
20. out-of-order buffer.
21. ordered drain.
22. gap detection.
23. gap timer behavior.
24. one-resync-per-gap logic.
25. ignore-until-snapshot behavior.
26. reconnect invalidates baseline.
27. resume-from-last-delivered logic.
28. reconnect base delay.
29. reconnect cap.
30. jitter formula.
31. injected random source.
32. backoff reset condition.
33. failed-reconnect retry behavior.
34. no-stale-while-down rule.
35. stop() lifecycle.
36. timer cleanup.
37. late-event guards.
38. applyBookDelta input/output model.
39. zero-removal semantics.
40. book ordering.
41. invalid delta rules.
42. input immutability.
43. dashboard connection-state DOM design.
44. stale behavior.
45. reconnecting behavior.
46. live behavior.
47. loading/empty/error preservation.
48. XSS/accessibility preservation.
49. exact changed files.
50. Typecheck.
51. 17a result.
52. 17b result.
53. 17c result.
54. 17d result.
55. 17e result.
56. 17f result.
57. Full Challenge 17 result.
58. Challenge 18 result.
59. Challenge 12 result.
60. Challenge 20 result.
61. Challenge 11/19 result.
62. Challenge 03/08 result.
63. Challenge 01/signer result.
64. broader domain regressions.
65. full-suite result.
66. remaining Task33+ failures.
67. protected-file confirmation.
68. suggested commit.
69. master merge/push workflow.
70. next Task 33: final integration.

Do not include:
- real JWTs;
- access tokens;
- secrets;
- AWS credentials.

============================================================
DS. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat
git diff --name-only

Review primary:

git diff -- client/js/liveFeed.js

Only if genuinely changed:

git diff -- client/js/dashboard.js
git diff -- client/js/app.js
git diff -- client/index.html
git diff -- client/dashboard.css

Use actual stylesheet path.

Review:

git diff -- docs/clearhouse-task-32-live-dashboard-updates.md

Confirm:
- organizer tests unchanged;
- no new tests;
- config/package unchanged;
- migrations/seeds unchanged;
- no backend WebSocket rewrite;
- no uncontrolled Math.random when injection exists;
- no status duplicates;
- no global topic sequence state;
- all timers cleared on stop;
- old socket callbacks guarded;
- applyBookDelta pure;
- dashboard old data preserved when stale/reconnecting;
- loading/empty/error remain intact;
- no Task33+ implementation.

============================================================
DT. TASK 32 COMPLETION CRITERIA
============================================================

Task 32 is COMPLETE only when:

DISCOVERY

[ ] challenge17 read completely.
[ ] exact test count recorded.
[ ] LiveFeed API known.
[ ] exact status vocabulary known.
[ ] exact timer options known.
[ ] exact backoff/jitter formula known.
[ ] exact server frame protocol known.
[ ] exact dashboard DOM contract known.
[ ] exact book/delta shape known.

STATUS

[ ] initial connecting timing exact.
[ ] live timing exact.
[ ] stale timing exact.
[ ] no repeated status callback.
[ ] accepted data resets stale according to test.
[ ] stale data remains displayed.
[ ] no stale while down/reconnecting.

PER-TOPIC ORDERING

[ ] state independent per topic.
[ ] snapshot establishes baseline.
[ ] duplicate <= last delivered ignored.
[ ] out-of-order future frame buffered.
[ ] pending duplicate ignored.
[ ] missing frame causes ordered drain when received.
[ ] callback delivery strictly increasing.
[ ] topic A gap does not block topic B.

GAP / RESYNC

[ ] one gap timer per affected topic.
[ ] resolved gap cancels timer.
[ ] unresolved gap sends exactly one resync.
[ ] resync only for affected topic.
[ ] affected deltas ignored until fresh snapshot.
[ ] next snapshot resets resync state.
[ ] pending obsolete frames cleared correctly.

RECONNECT

[ ] disconnect invalidates baseline.
[ ] last delivered seq retained.
[ ] resubscribe includes exact last delivered seq.
[ ] initial connection and reconnect statuses exact.
[ ] one reconnect timer at a time.
[ ] error+close do not double schedule.
[ ] backoff formula exact.
[ ] cap exact.
[ ] jitter exact.
[ ] injected random used.
[ ] failed reconnect retries.
[ ] backoff reset at exact data-flow event.
[ ] no stale while reconnecting.
[ ] old socket events ignored.

STOP

[ ] stop terminal flag set early.
[ ] socket closes exactly once.
[ ] reconnect timer cleared.
[ ] stale timer cleared.
[ ] every topic gap timer cleared.
[ ] queued callbacks guard stopped.
[ ] late messages ignored.
[ ] close after stop cannot schedule reconnect.
[ ] repeated stop exact/idempotent.

BOOK DELTA

[ ] applyBookDelta pure.
[ ] inputs not mutated.
[ ] zero quantity removes.
[ ] nonzero upserts.
[ ] no duplicate price levels.
[ ] side ordering exact.
[ ] exact price comparison.
[ ] invalid deltas rejected.
[ ] no partial mutation before rejection.

DASHBOARD

[ ] stale keeps old data.
[ ] stale note/status exact.
[ ] reconnecting keeps old data.
[ ] reconnecting note/status exact.
[ ] live restores live indicator.
[ ] loading panel preserved.
[ ] empty panel preserved.
[ ] error panel preserved.
[ ] XSS safety preserved.
[ ] accessibility preserved.
[ ] no duplicate DOM rows/listeners.

REGRESSION

[ ] typecheck passes.
[ ] Challenge 17 passes.
[ ] Challenge 18 passes.
[ ] Challenge 12 passes.
[ ] Challenge 20 passes.
[ ] Challenge 11/19 pass.
[ ] Challenge 03/08 pass.
[ ] Challenge 01/signer pass where relevant.
[ ] broader regressions recorded.
[ ] full suite recorded honestly.
[ ] protected files unchanged.
[ ] Task32 note created.
[ ] final Git target master.

If any Challenge 17 assertion remains failing:
- Task 32 status = PARTIAL;
- report exact failing test/root cause.

============================================================
DU. FINAL CURSOR REPORT
============================================================

Return:

1. Task 32 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Exact Challenge 17 test count.
6. LiveFeed public API.
7. Socket factory/injection.
8. Status model.
9. Connecting/live/stale transition rules.
10. Status dedup.
11. Connection generation guard.
12. Per-topic state model.
13. Snapshot/baseline behavior.
14. Last-delivered sequence behavior.
15. Duplicate handling.
16. Out-of-order buffering/draining.
17. Gap timer.
18. Resync-once behavior.
19. Ignore-until-snapshot behavior.
20. Reconnect state reset.
21. Resume sequence protocol.
22. Backoff formula.
23. Jitter formula/random source.
24. Backoff reset point.
25. Failed reconnect retries.
26. Stop/timer cleanup.
27. Late-event suppression.
28. applyBookDelta algorithm.
29. Invalid delta handling.
30. Dashboard stale behavior.
31. Dashboard reconnecting behavior.
32. Dashboard live behavior.
33. Loading/empty/error preservation.
34. XSS/accessibility preservation.
35. Typecheck.
36. 17a result.
37. 17b result.
38. 17c result.
39. 17d result.
40. 17e result.
41. 17f result.
42. Full Challenge 17 result.
43. Challenge 18 result.
44. Challenge 12 result.
45. Challenge 20 result.
46. Challenge 11/19 result.
47. Challenge 03/08 result.
48. Challenge 01/signer result.
49. broader regressions.
50. Full-suite result.
51. Remaining Task33+ failures.
52. Protected-file confirmation.
53. Final diff summary.
54. Reviewed Git commands targeting master.

Suggested commit:

feat: implement resilient live dashboard feed

Do not automatically commit, merge, or push.
````

---

# Task 32 acceptance matrix

| Area | Required behavior |
|---|---|
| Initial status | Exact `connecting` timing |
| Live status | Exact organizer condition |
| Stale status | Exact timeout |
| Status repeats | Never consecutive duplicates |
| Topic sequence | Independent per topic |
| Duplicate frame | Delivered once |
| Out-of-order | Buffered |
| Missing frame arrives | Ordered drain |
| Unresolved gap | One resync |
| Gap isolation | Other topics continue |
| Awaiting snapshot | Ignore affected deltas |
| Reconnect resume | Last **delivered** seq |
| Reconnect baseline | Invalid until fresh snapshot |
| Failed connects | Retry |
| Backoff | Exact exponential + cap |
| Jitter | Exact organizer formula |
| Backoff reset | Once valid data flows |
| Down/reconnecting | Never stale |
| stop() | Closes once |
| stop() timers | All cancelled |
| Late events after stop | Ignored |
| Reconnect after stop | Never |
| applyBookDelta | Pure |
| Removed level | Quantity 0 delta removes |
| Invalid delta | Rejected |
| Dashboard stale | Old data + note |
| Dashboard reconnecting | Old data + note |
| Dashboard live | Normal live state restored |
| Loading/empty/error | Preserved |
| Server Challenge 18 | Must remain passing |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 32

Official final branch:

**`master`**

Workflow:

**`master` → `task-32` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 32 branch

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
task-32
```

Official final branch:

```text
master
```

---

## 2. Run final Task 32 verification

```powershell
npm run typecheck

npm test challenge17.test.ts

npm test challenge18.test.ts

npm test challenge12.test.ts

npm test challenge20.test.ts

npm test challenge11.test.ts

npm test challenge19.test.ts

npm test challenge03.test.ts

npm test challenge08.test.ts

npm test challenge01.test.ts

npm test challenge15.test.ts

npm test challenge16.test.ts

npm test challenge14.test.ts

npm test challenge10.test.ts

npm test challenge06.test.ts

npm test challenge05.test.ts

npm test challenge04.test.ts

npm test challenge02.test.ts

npm test challenge09.test.ts

npm test challenge13.test.ts

npm test _sanity.test.ts

git diff --check
```

If Challenge 17 labels exist:

```powershell
npm test challenge17.test.ts -t "Challenge 17a"

npm test challenge17.test.ts -t "Challenge 17b"

npm test challenge17.test.ts -t "Challenge 17c"

npm test challenge17.test.ts -t "Challenge 17d"

npm test challenge17.test.ts -t "Challenge 17e"

npm test challenge17.test.ts -t "Challenge 17f"
```

Use actual labels if different.

If client/app signing plumbing changed, also run the exact existing browser-signing regression, for example:

```powershell
npm test challenge00b.test.ts -t "Challenge 0t"
```

only if that label exists.

Then:

```powershell
npm test
```

Do not implement Task 33 automatically to fix unrelated final-integration failures.

---

## 3. Review Task 32 changes

```powershell
git status --short
git diff --stat
git diff --name-only
```

Primary:

```powershell
git diff -- client/js/liveFeed.js
```

Only if genuinely changed:

```powershell
git diff -- client/js/dashboard.js
git diff -- client/js/app.js
git diff -- client/index.html
git diff -- client/dashboard.css
```

Use the actual stylesheet path if different.

Review note:

```powershell
git diff -- docs/clearhouse-task-32-live-dashboard-updates.md
```

Normally there should be no Task32 backend changes.

If a backend file appears:
stop and justify it against a concrete Challenge17 protocol defect before staging.

---

## 4. Stage only Task 32 files

Always stage:

```powershell
git add -- docs/clearhouse-task-32-live-dashboard-updates.md
```

Primary:

```powershell
git add -- client/js/liveFeed.js
```

Only if genuinely changed:

```powershell
git add -- client/js/dashboard.js
git add -- client/js/app.js
git add -- client/index.html
git add -- client/dashboard.css
```

Use actual paths.

If another legitimate client helper changed:

```powershell
git add -- "<actual-task32-client-helper-path>"
```

Do not paste placeholders literally.

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
- WebSocket backend rewrite
- unrelated business-domain code
- Task 33+ integration work.

---

## 6. Commit Task 32

```powershell
git commit -m "feat: implement resilient live dashboard feed"
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

## 8. Merge Task 32

Prefer:

```powershell
git merge --ff-only task-32
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-32
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

npm test challenge17.test.ts

npm test challenge18.test.ts

npm test challenge12.test.ts

npm test challenge20.test.ts

git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge19.test.ts
npm test challenge03.test.ts
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

If safe for the local-only Task 32 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
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

# Fast Task 32 checklist

- [ ] branch = task-32
- [ ] final branch = master
- [ ] challenge17 fully read
- [ ] config/scores read-only
- [ ] exact test count recorded
- [ ] LiveFeed API known
- [ ] Task31 protocol confirmed
- [ ] status strings/timing exact
- [ ] no consecutive duplicate statuses
- [ ] per-topic last-delivered seq
- [ ] per-topic baseline flag
- [ ] per-topic pending map
- [ ] per-topic gap timer
- [ ] per-topic resync flag
- [ ] duplicate seq ignored
- [ ] shuffled seq buffered/drained in order
- [ ] unresolved gap triggers exactly one resync
- [ ] only affected topic pauses
- [ ] deltas ignored until next snapshot after resync
- [ ] snapshot re-establishes baseline
- [ ] reconnect preserves last delivered seq
- [ ] reconnect invalidates baseline
- [ ] reconnect resubscribes all configured topics
- [ ] reconnect retries failed connections
- [ ] exact exponential backoff
- [ ] exact cap
- [ ] exact jitter
- [ ] injected random used
- [ ] backoff resets at exact data-flow point
- [ ] stale timer exact
- [ ] never stale while down
- [ ] old socket callbacks ignored
- [ ] error+close do not double reconnect
- [ ] stop closes socket once
- [ ] stop clears reconnect timer
- [ ] stop clears stale timer
- [ ] stop clears all gap timers
- [ ] stop ignores late frames
- [ ] stop never reconnects
- [ ] applyBookDelta inputs not mutated
- [ ] zero qty removes level
- [ ] nonzero qty upserts
- [ ] order book sorting exact
- [ ] invalid deltas rejected
- [ ] stale keeps old dashboard data
- [ ] reconnecting keeps old dashboard data
- [ ] live state restored
- [ ] loading/empty/error panels preserved
- [ ] XSS/accessibility preserved
- [ ] Challenge17 passes
- [ ] Challenge18 passes
- [ ] Challenge12 passes
- [ ] Challenge20 passes
- [ ] Challenge11/19 pass
- [ ] Challenge03/08 pass
- [ ] Challenge01/signer pass where relevant
- [ ] broader regressions recorded
- [ ] protected files unchanged
- [ ] Task32 note created
- [ ] committed on task-32
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 33 — final integration across live server, client, matching, events, market data and dashboard.
