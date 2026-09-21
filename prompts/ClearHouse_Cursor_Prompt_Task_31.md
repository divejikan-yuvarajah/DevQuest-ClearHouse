# ClearHouse — Complete Enhanced Cursor Prompt for Task 31

**Task:** Challenge 18 — The WebSocket Feed  
**Primary scope:** authenticated WebSocket server / hub + ordered topic feeds + liveness + backpressure + shutdown + depth deltas  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-31`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 31 purpose

Task 31 implements the full **Challenge 18 — The WebSocket Feed** server-side challenge.

The ClearHouse dashboard should receive authenticated, ordered, real-time topic updates through a real WebSocket server without polling.

The hub must correctly provide:

- authentication **before HTTP upgrade**;
- topic-level subscription authorization;
- snapshots for successful subscriptions;
- controlled errors for forbidden or unknown topics;
- malformed-message tolerance;
- independent, gapless sequence counters per topic;
- snapshot/delta sequencing that is race-free for late subscribers;
- resync snapshots only for already-subscribed topics;
- heartbeat ping/pong liveness;
- dead-client removal;
- bounded buffering / slow-consumer eviction;
- isolation so one slow client does not damage healthy clients;
- graceful `disconnectAll()` and terminal `close()` lifecycle;
- high-rate fan-out to many subscribers without missing/reordering messages;
- exact deterministic order-book `diffDepth()` deltas.

This task is **server-side WebSocket infrastructure**.

Do **not** implement the Challenge 17 browser live-feed state machine in Task 31. That is Task 32.

The current CodeCommit checkout and `tests/challenge18.test.ts` are authoritative.

---

# Published Challenge 18 contract — 190 points

## 18a — Handshake and subscriptions — 35 pts

### 18a-1 — 15 pts

Only a client presenting a **valid access token** may establish the WebSocket connection.

Anything else must be rejected with:

```text
HTTP 401
```

**before the protocol upgrade completes.**

This is important.

Do not:

- accept the WebSocket and then send an auth error frame;
- complete upgrade and then immediately close;
- treat invalid token as a normal WebSocket close.

The organizer uses a real HTTP server/client and checks the failed upgrade behavior.

Reuse the real Task 6 access-token verifier.

Do not create a second auth system.

### 18a-2 — 20 pts

Subscription requests must behave independently per topic:

- allowed topic → return/send a snapshot;
- forbidden topic → controlled error for that topic;
- unknown topic → controlled error;
- malformed client messages must not crash the hub/server;
- one malformed frame must not make unrelated healthy clients fail.

Read the exact protocol frame shape from `challenge18.test.ts`.

Do not guess:

- subscribe message type;
- topics array vs single topic;
- error fields;
- snapshot fields;
- permission mapping.

---

## 18b — Ordered delivery — 45 pts

### 18b-1 — 30 pts

Each topic owns its own **gapless, strictly increasing sequence**.

If topic A and topic B are both active:

```text
A: 1, 2, 3, ...
B: 1, 2, 3, ...
```

Publishing to B must not consume A's sequence.

A late subscriber's initial snapshot must join the live stream seamlessly.

If the snapshot is at sequence `N`, the next delta for that subscriber must be:

```text
N + 1
```

with no missing or duplicated sequence.

This requires correct synchronization between:

- snapshot capture;
- subscription registration;
- concurrent publishes.

Do not generate snapshot sequence independently from live topic state.

### 18b-2 — 15 pts

A resync request:

- is valid only for a topic the client is already subscribed to;
- returns a **fresh snapshot**;
- snapshot sequence equals that topic's current live sequence;
- must not subscribe a client to a new topic as a side effect;
- must not resync unrelated topics.

Read exact request/response type.

---

## 18c — Liveness and backpressure — 55 pts

### 18c-1 — 25 pts

Idle clients receive WebSocket heartbeats.

A client that stops answering pings must be disconnected.

A healthy client that responds must remain connected.

Requirements include:

- periodic ping scheduling;
- correct pong handling;
- per-client liveness state;
- stale clients terminated at the organizer-defined timing boundary;
- no heartbeat timer leaks after hub close.

Read exact test options/timers.

Do not hardcode visible milliseconds without inspecting constructor/options.

### 18c-2 — 30 pts

A client that stops reading must be disconnected rather than allowing buffered outgoing data to grow without bound.

Healthy subscribers must continue receiving **every message**.

Requirements include:

- bounded `bufferedAmount` / send backlog strategy;
- slow client removal;
- no global blocking while waiting for one client;
- no per-publish `await` chain that serializes all clients behind a stalled socket;
- no unbounded application-level queue.

The organizer deliberately creates a slow consumer.

Use the exact threshold/options in the current source/test.

---

## 18d — Shutdown — 15 pts

### 18d-1 — 15 pts

`disconnectAll()`:

- disconnects every currently connected client;
- uses close code **1012**;
- leaves the WebSocket hub/server capable of accepting new connections afterward.

`close()`:

- disconnects/ends all clients using close code **1001**;
- stops accepting new WebSocket connections;
- cancels heartbeat timers/listeners/resources;
- is terminal/idempotent according to the exact test contract.

Do not treat `disconnectAll()` as permanent server shutdown.

---

## 18e — Fan-out — 20 pts

### 18e-1 — 20 pts

The organizer creates:

- **30 subscribers**
- then rapidly publishes **100 messages**

Each subscriber must receive all 100 messages:

- complete;
- in order;
- with gapless topic sequence.

Do not:

- drop healthy-client frames because one other client is slow;
- reuse mutable message objects/buffers unsafely;
- create an O(clients² × messages) algorithm;
- globally queue behind the slowest connection.

---

## 18f — Book deltas — 20 pts

### 18f-1 — 20 pts

`diffDepth(previous, next)` must return **exactly the changed price levels**.

Rules:

- added level → include new quantity;
- changed level → include new quantity;
- removed level → include quantity `0`;
- unchanged level → omit;
- applying the returned deltas to `previous` must reconstruct `next`;
- input depth objects/arrays must not be mutated if the test expects pure behavior;
- output ordering must match the organizer's deterministic contract.

Read the exact depth shape.

Do not guess whether depth uses:

- `[price, quantity]` tuples;
- `{ price, quantity }` objects;
- bid/ask objects;
- BigInt vs strings.

---

# Challenge 18 score map

```text
18a = 35
18b = 45
18c = 55
18d = 15
18e = 20
18f = 20
----------------
Total = 190
```

These are available points only, not an earned-score claim.

---

# Critical architectural invariant — snapshot/live sequence race

The hardest correctness issue in Task 31 is late subscription.

Bad implementation:

```text
1. client asks to subscribe
2. hub reads current snapshot at seq 10
3. publish occurs → seq 11
4. hub adds client to subscribers
5. client receives snapshot seq 10
6. next observed delta is seq 12
```

The client permanently missed seq 11.

Another bad implementation:

```text
1. hub adds client to subscribers
2. publish seq 11 arrives
3. hub sends delta 11
4. hub later sends snapshot seq 10
```

Now the stream is out of baseline order.

The subscription transition must create a **consistent snapshot boundary**.

Cursor must inspect the starter/test and implement a safe strategy, such as one of:

- per-topic synchronous critical section where snapshot generation and subscriber activation are serialized with publish;
- versioned snapshot capture where the client becomes active at exactly the captured sequence;
- subscription state that buffers deltas occurring after snapshot capture until the snapshot frame is queued, then flushes in order.

Do not add async race windows unnecessarily.

Because Node's JS execution is single-threaded, a fully synchronous topic-state update/snapshot/send registration path may be sufficient if no `await` is inserted between the critical steps.

Use the current architecture and exact tests.

---

# Critical architectural invariant — per-topic sequence

Sequence belongs to a topic, not:

- connection;
- client;
- global hub;
- message type.

For one topic:

```text
snapshot seq = current topic seq
next publish = current + 1
```

A snapshot/resync generally observes current sequence but must **not consume** a new sequence unless the test explicitly defines otherwise.

Do not increment sequence merely because:

- a client connects;
- a client subscribes;
- a snapshot is sent;
- a resync is requested.

Read exact assertions.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 31

Copy the complete block below into Cursor Agent mode.

````text
Act as my senior TypeScript WebSocket infrastructure engineer, authentication/security engineer, real-time systems engineer, and backpressure/performance reviewer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 31 ONLY: implement Challenge 18 — The WebSocket Feed — completely and correctly.

Preserve all completed Tasks 1–30.

Task 31 is SERVER-SIDE WebSocket functionality.

Do NOT implement the Challenge 17 browser reconnect/order/stale-state client yet. That is Task 32.

Your implementation must provide:
- pre-upgrade authentication;
- subscription authorization and snapshots;
- per-topic gapless sequence numbers;
- race-free late subscription;
- subscribed-topic resync;
- heartbeat liveness;
- slow-consumer/backpressure protection;
- disconnectAll/close lifecycle;
- fast reliable fan-out;
- exact depth diffing.

Do not stop at a plan. Inspect, implement, run official tests/regressions, create the Task 31 engineering note, and show reviewed Git commands.

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

task-31

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–30;
- work on task-31;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT TASK 31 SCOPE
============================================================

IMPLEMENT:

Challenge 18a:
- HTTP upgrade interception;
- valid-token-only WebSocket connection;
- HTTP 401 before upgrade for invalid/missing token;
- subscription authorization;
- snapshot response;
- unknown/forbidden-topic error;
- malformed-message resilience.

Challenge 18b:
- independent topic sequence numbers;
- gapless publishes;
- late-subscriber snapshot continuity;
- subscribed-topic resync.

Challenge 18c:
- ping/pong heartbeat;
- dead-client eviction;
- slow-consumer/backpressure eviction;
- healthy-client isolation.

Challenge 18d:
- disconnectAll close code 1012 and continue accepting;
- close code 1001 and terminal shutdown.

Challenge 18e:
- 30 × 100 rapid fan-out complete and ordered.

Challenge 18f:
- exact deterministic diffDepth.

PRESERVE:
- Task 6 JWT access-token semantics;
- Task 20 server lifecycle/operations;
- Task 21 HTTP API;
- Task 25 OpenAPI REST docs;
- Task 27 market-data exactness;
- Task 30 strategy behavior;
- current HTTP server export contract.

DO NOT IMPLEMENT:
- Challenge 17 browser LiveFeed state machine;
- reconnect/backoff browser behavior;
- dashboard connection-state UI;
- Task 32 client work;
- final Task 33 integration beyond the exact server hook Challenge 18 requires.

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
- grading/result-upload scripts

Do NOT install a WebSocket dependency.

First inspect package.json / lockfile READ ONLY.

Use the already installed server WebSocket library, likely `ws`, only if that is what current source/tests use.

Do NOT:
- weaken test timeouts;
- increase heartbeat intervals in tests;
- disable backpressure checks;
- skip real server tests;
- fake WebSockets with EventEmitter-only mocks.

Do NOT add production code checking:
- NODE_ENV === "test";
- VITEST;
- challenge18 filename;
- known test tokens;
- known topic strings purely from fixture assumptions;
- exact published message counts.

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

Verify Task 30 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-30 exists:

git log --oneline --decorate --max-count=10 task-30

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-31

If task-31 already exists:

git branch --list task-31
git log --oneline --decorate --max-count=10 task-31

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

- docs/clearhouse-task-06-sessions.md
- docs/clearhouse-task-16-advanced-matching.md
- docs/clearhouse-task-20-observability-operations.md
- docs/clearhouse-task-21-api-cache-performance.md
- docs/clearhouse-task-25-openapi-swagger.md
- docs/clearhouse-task-27-market-data-time.md
- docs/clearhouse-task-30-complex-order-strategies.md

Verify source, not only notes.

Task 31 depends especially on:
- `verifyAccessToken()` from Task 6;
- real `http.Server` export;
- current order-book depth representation;
- any starter `liveHub.ts` wrapper.

Before editing run:

npm run typecheck
npm test challenge01.test.ts
npm test challenge10.test.ts

Record any pre-existing failures.

============================================================
F. READ CHALLENGE 18 COMPLETELY
============================================================

Read:

tests/challenge18.test.ts

from first line to last line.

Read:

config/scores.ts

READ ONLY.

Build an exact contract matrix:

test
| points
| imported function/class
| constructor options
| protocol frame
| expected HTTP/WS behavior
| close code
| timing threshold
| current defect

Record:
- exact Challenge 18 test count;
- exact hub constructor/function signatures;
- attach/mount API;
- auth token location;
- WebSocket URL/path;
- topic names;
- topic access rules;
- snapshot provider API;
- publish API;
- exact snapshot frame;
- exact delta/data frame;
- exact error frame;
- subscribe request;
- resync request;
- malformed-message behavior;
- heartbeat interval/dead threshold;
- backpressure threshold;
- disconnectAll behavior;
- close behavior;
- diffDepth input/output shape.

DO NOT GUESS.

============================================================
G. DISCOVER CURRENT SERVER / HUB SOURCE
============================================================

Read completely:

- src/server.ts
- src/services/liveHub.ts
- src/domain/session.ts

if those exact files exist.

Search:

rg -n "WebSocket|WebSocketServer|liveHub|attachLive|publish|subscribe|resync|disconnectAll|diffDepth|bufferedAmount|ping|pong|upgrade" src tests

PowerShell fallback:

Get-ChildItem -Recurse src,tests -File |
  Select-String -Pattern "WebSocket|WebSocketServer|liveHub|attachLive|publish|subscribe|resync|disconnectAll|diffDepth|bufferedAmount|ping|pong|upgrade"

Read all actual Challenge 18 files completely.

Also inspect:
- current package dependencies READ ONLY;
- HTTP server creation;
- server shutdown hooks;
- Task 20 lifecycle;
- matching/order-book `depth()` representation;
- auth principal/roles.

============================================================
H. RUN TASK 31 BASELINE
============================================================

Run:

npm test challenge18.test.ts

If group labels exist:

npm test challenge18.test.ts -t "Challenge 18a"
npm test challenge18.test.ts -t "Challenge 18b"
npm test challenge18.test.ts -t "Challenge 18c"
npm test challenge18.test.ts -t "Challenge 18d"
npm test challenge18.test.ts -t "Challenge 18e"
npm test challenge18.test.ts -t "Challenge 18f"

Use actual labels.

Record:
- executed test count;
- pass/fail;
- first real failure;
- real timing for heartbeat/backpressure/fan-out if reported.

Filtered-out tests are NOT passed.

============================================================
I. UNDERSTAND THE CURRENT LIVE HUB API
============================================================

Do not redesign public exports before reading tests.

Determine exact functions such as:
- createLiveHub(...)
- attach(...)
- publish(...)
- disconnectAll(...)
- close(...)
- diffDepth(...)

These names are illustrative only.

Preserve exact signatures.

If tests construct a hub directly:
support that exact constructor.

If server.ts imports a singleton/wrapper:
preserve that integration.

============================================================
J. AUTHENTICATION — REUSE TASK 6
============================================================

Challenge 18a-1 must use genuine application access-token verification.

Reuse current:

verifyAccessToken(token): Principal

or exact current equivalent.

Do NOT:
- decode JWT without verifying signature;
- accept any nonempty token;
- invent HMAC websocket auth;
- create fixed test tokens;
- use refresh tokens as access tokens.

Respect token expiration/algorithm checks already implemented.

============================================================
K. FIND THE EXACT TOKEN TRANSPORT
============================================================

Read challenge18.

The token may arrive via:
- query parameter;
- Authorization header;
- another supported upgrade location.

Do not support a guessed transport as the only mechanism.

Use exactly what tests/current API expect.

Do not log the token.

Do not include it in error frames.

============================================================
L. REJECT BEFORE UPGRADE — 18a-1
============================================================

Invalid/missing token must receive HTTP 401 BEFORE WebSocket upgrade.

If using `ws` with `{ noServer: true }`, a robust pattern can be:

httpServer.on("upgrade", (request, socket, head) => {
    validate path/auth
    if invalid:
        write HTTP/1.1 401 ...
        destroy socket
        return

    wss.handleUpgrade(...)
})

But use current architecture/test.

Do not call `handleUpgrade` first and close later.

Ensure refused socket is ended/destroyed cleanly.

No hanging TCP connection.

============================================================
M. UPGRADE PATH
============================================================

Read exact WebSocket path.

Do not hijack every HTTP upgrade if tests/server have a specific path.

For unrelated upgrade path:
follow organizer expectation, possibly 404 or destroy.

Do not break normal HTTP requests.

============================================================
N. PRINCIPAL ASSOCIATION
============================================================

Once authenticated, store the verified Principal on client metadata.

Use it for topic authorization.

Do not trust account/role fields supplied later in client messages.

The subscription request cannot escalate the authenticated principal.

============================================================
O. CLIENT STATE
============================================================

Maintain per-client state such as:
- socket;
- principal;
- subscribed topics;
- liveness flag;
- terminal/closed state;
- any subscription activation metadata.

Do not put all subscriptions in one global list without topic/client distinction.

Use Sets/Maps appropriately.

Clean state on socket close/error.

============================================================
P. TOPIC REGISTRY
============================================================

Read starter/test for topic definitions.

Each allowed topic likely needs:
- topic name;
- authorization rule;
- current sequence;
- snapshot provider;
- current state/source if required;
- subscriber set.

Do not hardcode access based on visible one-off fixture values.

Use current project roles/account semantics.

============================================================
Q. SUBSCRIBE PROTOCOL — 18a-2
============================================================

Read exact message.

It may subscribe:
- one topic per message;
- multiple topics in one message.

Do not guess.

For each requested topic:
- unknown -> exact error;
- known but forbidden -> exact error;
- allowed -> subscribe and emit snapshot.

A forbidden topic must not enter the client's subscription Set.

One forbidden topic must not necessarily abort other valid topics if test says per-topic behavior.

Read exact assertion.

============================================================
R. MALFORMED CLIENT MESSAGES
============================================================

Malformed inputs may include:
- invalid JSON;
- non-object JSON;
- missing type;
- wrong topic field;
- unsupported message type.

Hub must survive.

Do not throw uncaught exception from message callback.

Return/send exact controlled error if expected.

Do not disconnect healthy client unless test says malformed frame is terminal.

Do not crash server.

============================================================
S. SAFE JSON PARSING
============================================================

Wrap JSON parsing locally.

Do not broad-catch the entire server process.

Validate parsed shape.

Avoid prototype-sensitive object merges.

No eval.

No dynamic function execution.

============================================================
T. SERVER OUTPUT SERIALIZATION
============================================================

WebSocket frames must be JSON serializable.

If topic data contains BigInt:
convert exact financial values to string at the feed boundary according to protocol.

Do not globally monkey-patch BigInt.prototype.toJSON unless current project already does.

Use explicit serializers.

Preserve Task 4 exactness.

============================================================
U. SNAPSHOT FRAME
============================================================

Read exact shape.

It likely includes:
- type;
- topic;
- seq;
- payload/data.

Do not guess names.

Snapshot sequence must be the topic's CURRENT sequence at the exact consistent snapshot boundary.

A snapshot should not increment the sequence unless test explicitly says so.

============================================================
V. PER-TOPIC SEQUENCE — 18b-1
============================================================

Maintain independent sequence state for every topic.

Publish on topic X:

nextSeq = currentSeq + 1

store currentSeq = nextSeq

frame seq = nextSeq

Do not have one global sequence across topics.

Do not assign sequence per client.

Do not increment separately for every subscriber.

All subscribers to the same publish see the same sequence.

============================================================
W. INITIAL TOPIC SEQUENCE
============================================================

Read test.

Determine whether an untouched topic starts at:
- 0;
- another defined value.

Do not guess.

Late snapshot at current seq must reflect exact value.

============================================================
X. SNAPSHOT + SUBSCRIBE ATOMICITY — CRITICAL
============================================================

A late subscriber must not miss a publish between snapshot and activation.

Inspect whether snapshot provider is synchronous or async.

If synchronous:
avoid inserting `await` between:
- current sequence read;
- snapshot read;
- subscriber activation;
- snapshot send/queue.

Use a consistent critical section.

If async:
design explicit per-topic serialization or buffer pending publishes for the subscribing client.

Do not assume Node single-threading solves an `await` race.

============================================================
Y. SNAPSHOT STATE CONSISTENCY
============================================================

Snapshot payload and snapshot sequence must describe the same logical moment.

Do not:
- read sequence;
- await;
- read newer snapshot state;
- send old sequence with new data.

Likewise do not:
- read snapshot;
- then increment sequence unrelatedly.

Read starter snapshot provider semantics.

If provider returns both data + sequence:
use it exactly.

============================================================
Z. PUBLISH ORDER
============================================================

For a topic:
calls to publish must result in increasing sequences in call/event order.

Do not add asynchronous per-message work that allows seq N+1 to send before N.

Serialize the frame once where possible.

Then send same serialized frame to all eligible healthy subscribers synchronously/nonblocking.

============================================================
AA. DO NOT AWAIT SLOW CLIENT SEND
============================================================

Node `ws.send()` queues data and returns; callbacks may complete later.

Do not wrap every client send in an awaited Promise and `await` them serially.

One slow client must not block fan-out.

Use `bufferedAmount` pre-check and nonblocking sends.

Handle send callback errors/close cleanup safely.

============================================================
AB. SINGLE SERIALIZATION PER PUBLISH
============================================================

For fan-out efficiency:
construct the publish frame once.

Serialize JSON once per topic publish when all subscribers receive identical frame.

Do not `JSON.stringify` same large payload separately for all 30 clients if avoidable.

If authorization/payload differs per client, use exact contract, but Challenge 18 topic publishes are likely identical.

============================================================
AC. SUBSCRIPTION SET
============================================================

Publish only to clients subscribed to that topic.

Do not broadcast all topics to all authenticated clients.

Resync only for subscribed topics.

============================================================
AD. DUPLICATE SUBSCRIBE
============================================================

Read test.

If client subscribes to same topic twice:
- maybe return fresh snapshot;
- maybe idempotent no duplicate subscription.

Do not allow Set duplication leading to duplicate publishes.

Use Set.

Follow exact snapshot response expectation.

============================================================
AE. UNSUBSCRIBE
============================================================

Only implement unsubscribe if current challenge/test/source exposes it.

Do not invent protocol.

============================================================
AF. RESYNC — 18b-2
============================================================

Read exact request frame.

For valid already-subscribed topic:
- capture fresh snapshot;
- seq = topic current seq;
- send snapshot for that topic only.

Do not:
- increment sequence for resync;
- send snapshots for all subscriptions;
- clear/recreate subscription unnecessarily.

============================================================
AG. RESYNC FOR UNSUBSCRIBED TOPIC
============================================================

Must not silently subscribe.

Send exact error/response required.

Subscription Set unchanged.

Unknown topic:
exact error.

Forbidden but unsubscribed:
follow exact protocol.

============================================================
AH. RESYNC RACE
============================================================

Same consistency issue as subscription.

Snapshot payload + seq must be a coherent point.

Future delta after snapshot must be > snapshot seq.

If publish can interleave during async snapshot generation, serialize/buffer appropriately.

============================================================
AI. HEARTBEAT — 18c-1
============================================================

Read exact constructor options/test fake/real timers.

Determine:
- ping interval;
- timeout policy;
- whether one missed pong drops on next tick;
- initial alive state.

Do not hardcode arbitrary production 30s if tests inject a value.

Use provided/configured heartbeat interval.

============================================================
AJ. HEARTBEAT USING WS PING/PONG
============================================================

Use protocol-level:

socket.ping()

and:

socket.on("pong", ...)

if current library/test expects it.

Do not send a JSON `"ping"` application frame unless test defines that protocol.

A compliant WebSocket client library normally auto-pongs unless deliberately disabled by test.

============================================================
AK. LIVENESS ALGORITHM
============================================================

Typical robust pattern:

on connection:
client.isAlive = true

on pong:
client.isAlive = true

on heartbeat tick:
if client.isAlive === false:
    terminate/drop
else:
    client.isAlive = false
    ping()

But READ exact timing expectations.

This means:
- first tick sends ping and marks awaiting;
- next tick without pong terminates.

If organizer expects a separate timeout, adapt.

============================================================
AL. HEALTHY CLIENT STAYS
============================================================

Do not accidentally mark healthy client dead due to:
- pong listener not bound;
- liveness state shared globally;
- timer tick racing close;
- ping thrown on closing socket.

Check readyState.

============================================================
AM. DEAD CLIENT DROP METHOD
============================================================

Read test.

It may expect abrupt `terminate()` for heartbeat failure rather than a graceful close.

Use current organizer observation.

Do not use the shutdown codes 1012/1001 for heartbeat failure unless test requires.

============================================================
AN. HEARTBEAT TIMER LIFECYCLE
============================================================

Create one hub-level interval if possible.

Do not create one interval per client unnecessarily.

On hub `close()`:
clear interval.

On `disconnectAll()`:
hub heartbeat remains active because future clients are allowed.

On individual client close:
remove metadata/subscriptions.

No dangling interval keeping Vitest process alive.

============================================================
AO. BACKPRESSURE — 18c-2
============================================================

Read exact slow-client test and configured threshold.

Before sending a new application frame to a client:

inspect:

socket.bufferedAmount

and any current send/backlog metadata required.

If above organizer-defined max:
cut loose the slow consumer.

Do not continue buffering indefinitely.

============================================================
AP. BUFFER THRESHOLD SEMANTICS
============================================================

Read whether condition is:
- `> maxBufferedBytes`;
- `>=`.

Boundary may be tested.

Do not guess.

If options default:
preserve exact starter default.

============================================================
AQ. BACKPRESSURE DOES NOT HURT HEALTHY CLIENTS
============================================================

When one client is evicted:
continue fan-out loop for all other subscribers.

Do not throw out of publish.

Do not close topic.

Do not decrement sequence differently for different clients.

Topic sequence represents publish event even if one client is too slow.

============================================================
AR. SLOW CLIENT CLOSE/TERMINATE METHOD
============================================================

Read test.

It may expect:
- terminate;
- specific close code.

Do not guess.

The published contract only says "cut loose".

Use current test/source.

Do not confuse with `disconnectAll()` 1012 or `close()` 1001.

============================================================
AS. APPLICATION QUEUES
============================================================

Do not build an unbounded per-client JS array queue.

`ws` already buffers writes.

The challenge specifically wants bounded buffering.

If an application queue already exists:
bound it with exact options.

============================================================
AT. FAN-OUT — 18e
============================================================

30 subscribers × 100 rapid publishes.

Expected per subscriber:
100 frames in exact publish order.

Do not:
- debounce;
- coalesce;
- drop intermediate deltas;
- batch unless protocol/test explicitly allows.

Sequence should prove completeness.

============================================================
AU. FAN-OUT COMPLEXITY
============================================================

O(messages × subscribed clients) is expected.

Avoid:
- scanning all topics for each client;
- nested duplicate subscription lists;
- repeated snapshot recomputation during publish.

Use topic subscriber sets.

============================================================
AV. SEND READY STATE
============================================================

Before normal send:
verify socket is OPEN.

Do not send to:
- CLOSING;
- CLOSED.

Remove/ignore terminal clients.

Use WebSocket.OPEN constant from actual library.

============================================================
AW. SEND CALLBACK ERRORS
============================================================

A send callback error for one client:
- clean/terminate that client as appropriate;
- do not throw asynchronously and crash process;
- do not affect other clients.

Do not double-close.

============================================================
AX. CLIENT CLOSE CLEANUP
============================================================

On connection close:
- remove from global clients;
- remove from topic subscriber sets or make topic Sets reference client state that is removed;
- clear client metadata;
- no memory leak.

Do not decrement topic sequence.

============================================================
AY. DISCONNECTALL — 18d
============================================================

`disconnectAll()`:
- iterate current connected clients;
- close with code 1012;
- exact reason only if test checks it;
- clean subscriptions;
- DO NOT close WebSocketServer permanently;
- DO NOT remove HTTP upgrade listener permanently;
- heartbeat timer can continue.

After existing clients disconnect:
a new valid client must still connect.

============================================================
AZ. DISCONNECTALL IDEMPOTENCY
============================================================

Read test.

Calling with zero clients should be harmless.

If called twice:
do not throw.

Do not recreate server.

============================================================
BA. CLOSE — 18d
============================================================

`close()` is terminal.

Required:
- stop accepting upgrades/new WS connections;
- close existing clients with code 1001;
- clear heartbeat interval;
- detach upgrade listener if this hub attached it;
- close WebSocketServer resources;
- resolve/return according to exact API.

Do not shut down unrelated HTTP server unless current hub owns it and test expects that.

The HTTP server may be shared by REST API.

============================================================
BB. CLOSE VS HTTP SERVER
============================================================

Challenge says "close ends everything" in WebSocket hub context.

Read exact test to determine whether:
- hub.close() closes only WebSocket service;
- or also test-created HTTP server.

Do not accidentally kill REST server if the current design attaches to externally owned server.

Respect ownership.

============================================================
BC. CLOSE CODE 1001
============================================================

Existing clients should observe code:

1001

for terminal hub close according to published challenge.

Do not use 1012 here.

============================================================
BD. NO NEW CONNECTION AFTER CLOSE
============================================================

After terminal close:
new WebSocket attempt must not be accepted by the hub.

Exact HTTP/socket behavior may be tested.

Remove/detach upgrade handler or mark closed and reject.

Do not leave zombie upgrade listener.

============================================================
BE. HUB CLOSE IDEMPOTENCY
============================================================

Read API/test.

Usually repeated `close()` should be harmless.

Do not:
- clear undefined timer incorrectly;
- close already-closed WSS and throw;
- attach listeners again.

============================================================
BF. DIFFDEPTH — 18f
============================================================

Read exact function signature.

Do NOT assume only one side.

Determine whether input is:
- one depth side;
- `{ bids, asks }`;
- array of levels.

Determine exact level fields/types.

Implement pure deterministic diff.

============================================================
BG. DEPTH SEMANTICS
============================================================

For each price level in union(previous prices, next prices):

if previous quantity == next quantity:
    omit

if next contains level with changed/new quantity:
    output new quantity

if previous contains level but next removed:
    output quantity zero

Use exact quantity zero representation:
- `0n`;
- `"0"`;
- `0`;

according to current type/test.

============================================================
BH. DEPTH PRICE IDENTITY
============================================================

Use exact price identity.

If price is BigInt:
Map<bigint,...> works.

If price string:
do not convert through Number.

`"100"` and organizer-normalized price representations should follow actual contract.

Do not use floating keys.

============================================================
BI. DEPTH OUTPUT ORDER
============================================================

Read test.

Potential expected:
- bids sorted descending price;
- asks sorted ascending;
- generic levels ascending.

Do not guess.

Apply exact canonical ordering.

Removed levels must appear at their price in correct order.

============================================================
BJ. DEPTH INPUT IMMUTABILITY
============================================================

Do not mutate previous or next arrays/objects.

Do not sort them in place.

Build Maps/copies.

Task 17 client's `applyBookDelta` later relies on clean delta semantics.

============================================================
BK. DEPTH DUPLICATE PRICE LEVELS
============================================================

Read domain invariant.

Depth snapshots should usually have one row per price.

If duplicates are invalid or preaggregated:
follow current source.

Do not invent aggregation unless tests require.

============================================================
BL. SNAPSHOT PROVIDER / DEPTH DIFF INTEGRATION
============================================================

If `liveHub.ts` gets snapshots from matching depth:
reuse current order-book source.

Do not create a second mutable book.

If publish is triggered by matching events only in later Task 33:
Task 31 may simply expose publish API for tests.

Do not over-integrate now.

============================================================
BM. AUTHORIZATION — ALLOWED/FORBIDDEN TOPICS
============================================================

Read exact topic ACL test.

Authorization may depend on:
- role;
- account ownership;
- topic category.

Use authenticated Principal.

Do not trust topic payload accountId alone.

Do not silently broaden operator/admin permissions.

Preserve Task 6 policy concepts.

============================================================
BN. TOPIC STRING VALIDATION
============================================================

Unknown topic:
controlled error.

Malformed topic:
controlled error.

Do not create arbitrary topic state lazily for untrusted strings unless current API explicitly allows dynamic topics with validation.

Could cause memory abuse.

Use registry.

============================================================
BO. ERROR FRAME
============================================================

Read exact shape and code strings.

Do not invent:
`{error:"..."}`

if test expects:
`{type:"error", topic, code}`

or vice versa.

Do not expose:
- token;
- stack;
- internal exception message;
- filesystem path.

============================================================
BP. MALFORMED FRAME DOES NOT CORRUPT SUBSCRIPTIONS
============================================================

If client is subscribed then sends bad JSON:
existing subscription remains.

Later valid publishes should still arrive if organizer test expects "survives malformed messages."

Do not clear all state on parser error.

============================================================
BQ. PUBLISH PAYLOAD IMMUTABILITY
============================================================

Do not mutate caller's payload when adding:
- seq;
- topic;
- type.

Create frame object.

If caller reuses payload:
it should remain unchanged.

Especially avoid:
`payload.seq = ...`

unless API contract explicitly says publish mutates.

============================================================
BR. TOPIC STATE IMMUTABILITY / SNAPSHOTS
============================================================

Snapshot providers may return mutable objects.

Do not store client-specific mutation into shared snapshot source.

Serialize/copy at boundary as needed.

============================================================
BS. PUBLISH AFTER DISCONNECTALL
============================================================

Hub remains usable.

Topic sequence should likely continue, not reset, unless exact test says reset.

New client snapshot should reflect current sequence/data.

Do not reset topic state merely because clients were disconnected.

============================================================
BT. PUBLISH AFTER CLOSE
============================================================

Read API.

Likely should no-op/throw controlled error.

Do not recreate server.

Do not increment sequence if publish rejected due terminal close unless test says otherwise.

============================================================
BU. SEQUENCE RESET
============================================================

Do not reset sequences when:
- last subscriber leaves;
- disconnectAll;
- new subscriber joins.

Sequence belongs to topic lifetime/hub instance.

Only a fresh hub/reset method may start fresh.

Read test.

============================================================
BV. CONCURRENT/RAPID PUBLISH
============================================================

If publish() is synchronous:
sequences are naturally allocated in call order.

Keep it synchronous if public API/test permits.

Avoid making publish async merely to wait for sends.

If publish currently async:
serialize sequence assignment before awaits.

Never allow duplicate seq.

============================================================
BW. SNAPSHOT GENERATION COST
============================================================

Only compute snapshot on:
- subscribe;
- resync.

Do not recompute snapshots for every publish unless current design needs it.

Fan-out payload should be the supplied delta/event.

============================================================
BX. BACKPRESSURE + SNAPSHOT
============================================================

Slow-client protection applies to snapshot/error frames too if they can be large.

Use one safe send helper where appropriate.

But do not evict a brand-new client solely because a tiny current bufferedAmount is nonzero below threshold.

Follow exact threshold.

============================================================
BY. SAFE SEND HELPER
============================================================

A useful internal helper may:
1. check hub/client terminal state;
2. check socket OPEN;
3. check bufferedAmount threshold;
4. serialize if not already serialized;
5. socket.send(..., callback);
6. handle callback error without global throw.

If serialized publish string is already available:
avoid re-stringify.

Do not hide required close-code distinctions inside one generic close helper without parameters.

============================================================
BZ. TIMER UNREF
============================================================

Do not call `unref()` solely to hide a leaked timer from tests.

Correctly clear heartbeat timer on close.

If project uses unref appropriately, preserve it, but not as substitute for lifecycle cleanup.

============================================================
CA. ERROR EVENT LISTENER
============================================================

Sockets and WebSocketServer should have sufficient error handling to avoid unhandled EventEmitter `error` crashing tests.

Do not swallow all errors globally.

Clean the affected client.

============================================================
CB. HTTP SERVER UPGRADE LISTENER OWNERSHIP
============================================================

If hub attaches an `upgrade` listener:
store the exact handler reference.

On terminal close:
remove that same handler.

Do not use `removeAllListeners("upgrade")` because that can destroy unrelated components.

============================================================
CC. MULTIPLE HUB INSTANCES
============================================================

Tests may create hub instances repeatedly.

No module-global:
- client Set;
- sequence Map;
- interval handle;
- closed flag.

Instance isolation required unless current API explicitly singleton.

Task 1 noted `src/services/liveHub.ts` starter integration; inspect current lifecycle.

============================================================
CD. TEST SERVER CLEANUP
============================================================

Challenge18 runs real HTTP servers.

Your hub must release:
- heartbeat interval;
- WSS resources;
- upgrade listeners;
- sockets

so tests finish.

Do not use `process.exit`.

Do not force-close unrelated resources.

============================================================
CE. PACKAGE VERSION COMPATIBILITY
============================================================

Inspect installed `ws` version/types.

Use APIs available in that version.

Do not upgrade dependency.

Do not modify package lock.

============================================================
CF. NODE TYPES
============================================================

Preserve typechecking.

Avoid broad `any`.

Use actual:
- IncomingMessage;
- Socket/Duplex;
- RawData;
- WebSocket;
- WebSocketServer

types from current dependencies.

Do not weaken tsconfig.

============================================================
CG. PARSING RAWDATA
============================================================

`ws` message data may be:
- Buffer;
- ArrayBuffer;
- Buffer[] depending version.

Use a safe conversion to UTF-8 text compatible with current RawData type.

Do not assume it is always string.

Read current code/types.

============================================================
CH. BINARY FRAMES
============================================================

Read test.

If protocol expects text JSON only:
binary frames should produce controlled malformed-message behavior or be rejected.

Do not accidentally `JSON.parse("[object ArrayBuffer]")`.

Use `isBinary` argument if available.

============================================================
CI. MAX MESSAGE SIZE
============================================================

Only configure WebSocket `maxPayload` if current source/test/options define it.

Do not invent a value that rejects organizer frames.

Task 9 HTTP body-size does not automatically apply to WebSocket frames.

============================================================
CJ. ORIGIN CHECK
============================================================

Only enforce WebSocket Origin if current Challenge 18/source explicitly requires it.

Do not add a browser-origin restriction that breaks real test clients.

Auth token is the published gate.

============================================================
CK. HEARTBEAT VS APPLICATION TRAFFIC
============================================================

Do not treat any incoming application frame as pong unless exact liveness design says activity itself proves health.

Use protocol pong as tested.

Healthy client library will answer pings.

============================================================
CL. CLIENTS CONNECTED BUT UNSUBSCRIBED
============================================================

They still require heartbeat liveness.

They receive no topic publishes.

`disconnectAll()` and close still affect them.

============================================================
CM. SNAPSHOT SEQUENCE AFTER RAPID PUBLISH
============================================================

If 100 messages were published and current seq is 100:
new subscriber snapshot should be seq 100 according to current state.

The first future publish is 101.

Do not replay historical 1..100 unless protocol explicitly has replay, which Challenge 18 does not describe.

Challenge 17 client reconnect requests resubscription from seq later, but Task 31 server contract in Challenge 18 is snapshot/resync, not necessarily retained history.

Do not implement history backlog unless test says so.

============================================================
CN. DO NOT IMPLEMENT TASK 32 CLIENT SEMANTICS
============================================================

Do not edit client live feed for:
- connecting/live/stale status;
- shuffled delta buffering;
- gap timer/resync;
- exponential reconnect;
- stop behavior;
- dashboard connection-state notes.

Those are Challenge 17 / Task 32.

Task 31 can define the server protocol Task 32 consumes.

============================================================
CO. TASK 17 COMPATIBILITY
============================================================

Although Task 32 is later, server protocol should match existing `client/js/liveFeed.js` expectations if starter already defines them.

Inspect it READ ONLY if useful.

Do not edit unless Challenge18 server tests explicitly require shared constants and a minimal protocol correction.

Prefer server-only Task31 changes.

============================================================
CP. TASK 25 OPENAPI
============================================================

WebSocket protocol is not a normal OpenAPI REST endpoint.

Do not add fake ws paths to OpenAPI unless Challenge19 current tests explicitly expect an upgrade route, which prior Task25 guidance says not to do.

Challenge19 regression should remain passing.

============================================================
CQ. TASK 20 SERVER LIFECYCLE
============================================================

Do not break:
- `/health`;
- `/ready`;
- rate limiter;
- request logging;
- metrics.

WebSocket upgrade may bypass Express middleware by design.

Do not force upgrade requests through Express JSON auth middleware if token protocol is separate.

============================================================
CR. AUTH LOGGING SECURITY
============================================================

Do not log access tokens from WebSocket URL/header.

Task20 secret-leak test may capture stdout.

Avoid logging full upgrade URL if it contains token query.

============================================================
CS. FAN-OUT MESSAGE ORDER PER SOCKET
============================================================

`ws.send` calls on one socket should be invoked in publish order.

Do not dispatch them through:
- uncontrolled Promise.all that changes invocation order;
- setTimeout;
- queueMicrotask per message

without reason.

Synchronous publish loop maintains invocation order.

============================================================
CT. MUTABLE SHARED BUFFER
============================================================

If using Buffer/string:
create immutable serialized string per publish.

Do not mutate/reuse a buffer before sends complete.

Strings are convenient.

============================================================
CU. CLOSE REASON LENGTH
============================================================

If including close reason:
WebSocket protocol limits reason bytes.

Use exact short organizer-required reason if any.

Do not send stack/error.

============================================================
CV. 1012 / 1001 CONSTANTS
============================================================

Use numeric close codes exactly:

disconnectAll:
1012

terminal close:
1001

Do not swap them.

============================================================
CW. DIFFDEPTH APPLY-PROPERTY
============================================================

Reason through:

apply(previous, diffDepth(previous,next)) == next

for every tested book.

Removed level uses zero so client can delete it.

Do not include unchanged levels just because order changed.

Price level identity, not array position, determines change.

============================================================
CX. DIFFDEPTH SIDE INDEPENDENCE
============================================================

If input has bids + asks:
diff each side independently.

Same price can legally appear conceptually on different sides in malformed/crossed data; do not combine sides by price unless model explicitly forbids.

Use side-specific maps.

============================================================
CY. DIFFDEPTH OUTPUT DOES NOT ALIAS INPUT
============================================================

Returned delta rows should be fresh values if test mutates/compares.

Do not return references directly from `next` if that permits later mutation to alter delta.

Read structure.

============================================================
CZ. EXPECTED TASK 31 FILE SCOPE
============================================================

Primary likely:
- src/services/liveHub.ts

Potential:
- src/server.ts, only if actual hub attachment/lifecycle is missing;
- exact existing websocket/domain helper file if present.

Create/update:
- docs/clearhouse-task-31-websocket-feed.md

Normally do NOT change:
- matching engine;
- controllers;
- REST routes;
- OpenAPI;
- database;
- migrations;
- seeds;
- client live feed;
- dashboard.

Do NOT add tests.

============================================================
DA. REQUIRED VERIFICATION — CHALLENGE 18
============================================================

After implementation:

npm run typecheck

Primary Task 31 gate:

npm test challenge18.test.ts

If labels exist:

npm test challenge18.test.ts -t "Challenge 18a"
npm test challenge18.test.ts -t "Challenge 18b"
npm test challenge18.test.ts -t "Challenge 18c"
npm test challenge18.test.ts -t "Challenge 18d"
npm test challenge18.test.ts -t "Challenge 18e"
npm test challenge18.test.ts -t "Challenge 18f"

Use actual labels.

Record:
- exact executed test count;
- heartbeat result;
- slow-consumer result;
- fan-out result/time.

============================================================
DB. AUTH REGRESSION
============================================================

Run:

npm test challenge01.test.ts

Especially verify access-token behavior remains correct.

Do not modify session semantics just to simplify WS auth.

============================================================
DC. MATCHING / DEPTH REGRESSION
============================================================

Run:

npm test challenge03.test.ts

diffDepth / snapshot integration must not mutate book state.

============================================================
DD. MARKET-DATA REGRESSION
============================================================

Run:

npm test challenge08.test.ts

Do not alter price/quantity serialization unexpectedly.

============================================================
DE. OPS / SERVER REGRESSION
============================================================

Run:

npm test challenge10.test.ts

WebSocket timers/listeners must not regress server lifecycle.

============================================================
DF. API / OPENAPI REGRESSION
============================================================

Run:

npm test challenge11.test.ts
npm test challenge19.test.ts

No fake REST route should appear.

============================================================
DG. DASHBOARD STATIC REGRESSION
============================================================

Run:

npm test challenge12.test.ts
npm test challenge20.test.ts

Task31 should not modify client.

============================================================
DH. STRATEGY / FEE / NETTING REGRESSION
============================================================

Run:

npm test challenge15.test.ts
npm test challenge16.test.ts
npm test challenge14.test.ts

The WebSocket hub should be isolated.

============================================================
DI. SETTLEMENT / LEDGER / RISK REGRESSION
============================================================

Run:

npm test challenge04.test.ts
npm test challenge02.test.ts
npm test challenge05.test.ts
npm test challenge09.test.ts
npm test challenge13.test.ts

No business-state regressions.

============================================================
DJ. EVENT / SANITY REGRESSION
============================================================

Run:

npm test challenge06.test.ts
npm test _sanity.test.ts

Then:

git diff --check

Finally:

npm test

Record Challenge 17 / Task32 client failures honestly if still failing.

Do not implement Task32 just to make full suite green.

============================================================
DK. FAILURE DIAGNOSIS — 18a-1
============================================================

If invalid token still opens:
- auth checked after handleUpgrade;
- decode without verify;
- wrong token source.

If client gets WS close instead of HTTP 401:
- upgrade already completed.

If valid token rejected:
- header/query parsing wrong;
- bearer prefix handling;
- verifyAccessToken integration.

Do not weaken auth.

============================================================
DL. FAILURE DIAGNOSIS — 18a-2
============================================================

If allowed topic no snapshot:
- subscription state added without snapshot;
- snapshot provider missing.

If forbidden topic receives data:
- principal/ACL ignored.

If malformed JSON kills socket/server:
- parse error escapes message handler.

If one bad topic prevents valid topic in same request:
- inspect expected per-topic semantics.

============================================================
DM. FAILURE DIAGNOSIS — 18b-1
============================================================

If sequence gaps:
- global/per-client counters mixed;
- sequence increment skipped on publish;
- one publish increments once per subscriber.

If late subscriber misses N+1:
- snapshot/subscription race.

If receives delta before snapshot:
- subscriber activated too early without buffering/critical section.

If seq duplicates:
- concurrent async publish allocation.

============================================================
DN. FAILURE DIAGNOSIS — 18b-2
============================================================

If resync increments sequence:
- snapshot incorrectly treated as publish.

If resync works for unsubscribed topic:
- missing subscription guard.

If snapshot stale:
- cached snapshot/seq not refreshed coherently.

============================================================
DO. FAILURE DIAGNOSIS — 18c-1
============================================================

If dead client remains:
- pong flag never reset false;
- heartbeat timer not running;
- test client suppresses pong but application messages mark alive incorrectly.

If healthy client dropped:
- pong listener wrong;
- heartbeat boundary off;
- ping sent while socket not OPEN.

If tests hang:
- interval not cleared on close.

============================================================
DP. FAILURE DIAGNOSIS — 18c-2
============================================================

If memory/backlog grows:
- no bufferedAmount check;
- threshold wrong;
- application queue unbounded.

If all clients stop:
- exception from slow client aborts publish loop.

If healthy clients miss frames:
- global backpressure state;
- publish awaits slow socket;
- sequence generated per successful send rather than per publish.

============================================================
DQ. FAILURE DIAGNOSIS — 18d
============================================================

If new connection fails after disconnectAll:
- WSS/upgrade listener closed by mistake.

If close uses 1012:
- codes swapped.

If new connection succeeds after terminal close:
- upgrade listener still accepts;
- closed flag not checked.

If REST server dies unexpectedly:
- hub closed externally owned HTTP server.

Read exact ownership test.

============================================================
DR. FAILURE DIAGNOSIS — 18e
============================================================

If some client gets <100:
- slow threshold too aggressive for healthy burst;
- async send errors;
- subscriber Set mutation during iteration.

If order wrong:
- async frame dispatch;
- sequence assigned after send;
- per-client queue reorder.

If CPU slow:
- repeated JSON stringify per client;
- O(n²) cleanup.

============================================================
DS. FAILURE DIAGNOSIS — 18f
============================================================

If removed levels missing:
- only iterating next.

If unchanged levels included:
- comparing object identity rather than quantity.

If reconstruction fails:
- wrong zero representation;
- wrong side/price key.

If ordering fails:
- output comparator wrong.

Do not mutate inputs.

============================================================
DT. REAL-TIME TEST DISCIPLINE
============================================================

Do not "fix" timing tests by:
- adding sleeps;
- increasing organizer timeout;
- special casing test intervals.

Use injected/configured timing values exactly.

On a timing failure:
record actual expected/observed event order and timestamps from test output, not secrets.

============================================================
DU. TASK 31 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-31-websocket-feed.md

Include:

1. Starting commit.
2. Working branch task-31.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 18 test count.
6. 190-point score map.
7. WebSocket hub public API.
8. WebSocket path.
9. Auth token transport.
10. verifyAccessToken reuse.
11. pre-upgrade 401 strategy.
12. client metadata structure.
13. topic registry.
14. topic ACL strategy.
15. subscribe protocol.
16. snapshot frame shape.
17. error frame shape.
18. malformed-message handling.
19. per-topic sequence starting value.
20. publish sequence allocation.
21. late-subscription race solution.
22. resync contract.
23. snapshot/sequence consistency.
24. heartbeat interval/algorithm.
25. pong handling.
26. dead-client eviction.
27. backpressure threshold.
28. slow-consumer eviction.
29. healthy-client isolation.
30. fan-out serialization/send strategy.
31. subscriber cleanup.
32. disconnectAll semantics/code 1012.
33. close semantics/code 1001.
34. upgrade-listener/timer cleanup.
35. post-disconnectAll accept behavior.
36. post-close behavior.
37. diffDepth input/output model.
38. added/changed/removed level algorithm.
39. depth ordering.
40. input immutability.
41. exact files changed.
42. Typecheck.
43. 18a result.
44. 18b result.
45. 18c result.
46. 18d result.
47. 18e result.
48. 18f result.
49. Full Challenge 18 result.
50. Challenge 01 result.
51. Challenge 03/08 results.
52. Challenge 10 result.
53. Challenge 11/19 results.
54. Challenge 12/20 results.
55. Challenge 15/16/14 results.
56. Challenge 04/02/05/09/13 results.
57. Challenge 06/sanity.
58. Full-suite result.
59. Remaining Task32/Challenge17 failures.
60. Protected-file confirmation.
61. Suggested commit.
62. master merge/push workflow.
63. Next Task 32: Challenge 17 Live Dashboard Updates.

Do not include:
- JWTs;
- WebSocket auth tokens;
- secrets;
- AWS credentials.

============================================================
DV. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat
git diff --name-only

Review actual files, likely:

git diff -- src/services/liveHub.ts

Only if genuinely changed:

git diff -- src/server.ts
git diff -- "<actual-websocket-helper-path>"

Review:

git diff -- docs/clearhouse-task-31-websocket-feed.md

Do not paste placeholders literally.

Confirm:
- organizer tests unchanged;
- no new tests;
- config unchanged;
- package unchanged;
- migrations unchanged;
- seeds unchanged;
- auth token never logged;
- invalid token rejected before upgrade;
- topic seq independent;
- no snapshot/live race;
- no unbounded client queue;
- no global slow-client blocking;
- heartbeat timer cleaned on close;
- disconnectAll does not terminally close hub;
- close is terminal;
- no Challenge17 client implementation;
- no Task32+ work.

============================================================
DW. TASK 31 COMPLETION CRITERIA
============================================================

Task 31 is COMPLETE only when:

DISCOVERY

[ ] challenge18 read completely.
[ ] exact test count recorded.
[ ] hub API/signatures known.
[ ] WebSocket path known.
[ ] auth transport known.
[ ] protocol frames known.
[ ] topic ACL known.
[ ] timing/backpressure options known.
[ ] depth shape known.

HANDSHAKE

[ ] valid access token opens.
[ ] missing token gets HTTP 401 pre-upgrade.
[ ] invalid/expired token gets HTTP 401 pre-upgrade.
[ ] no fake post-upgrade auth failure.
[ ] principal stored from verified token.
[ ] token never logged.

SUBSCRIPTIONS

[ ] allowed topic subscribes.
[ ] allowed topic sends snapshot.
[ ] forbidden topic errors.
[ ] unknown topic errors.
[ ] bad topic not subscribed.
[ ] malformed JSON survives.
[ ] malformed message does not crash hub.
[ ] existing subscriptions survive malformed frame if expected.
[ ] duplicate subscription behavior exact.

ORDERING

[ ] per-topic sequence independent.
[ ] sequence gapless.
[ ] one publish consumes one seq regardless of subscriber count.
[ ] snapshots observe current seq.
[ ] snapshot does not consume seq unless contract.
[ ] late subscriber receives snapshot first.
[ ] next delta is snapshot seq + 1.
[ ] no publish lost during subscription race.
[ ] no duplicate publish during subscription race.
[ ] publish order stable.

RESYNC

[ ] only subscribed topic can resync.
[ ] fresh snapshot returned.
[ ] current topic seq used.
[ ] resync does not increment seq.
[ ] resync does not subscribe new topic.
[ ] unrelated topics untouched.

LIVENESS

[ ] heartbeat interval exact.
[ ] ping sent to idle healthy clients.
[ ] pong marks client alive.
[ ] dead client evicted.
[ ] healthy client retained.
[ ] timer cleared on close.
[ ] client close cleanup complete.

BACKPRESSURE

[ ] configured buffer threshold used.
[ ] slow consumer evicted.
[ ] no unbounded app queue.
[ ] healthy clients unaffected.
[ ] one slow send cannot abort publish loop.
[ ] sequence still advances once per publish.
[ ] boundary semantics exact.

SHUTDOWN

[ ] disconnectAll closes current clients with 1012.
[ ] disconnectAll keeps hub accepting.
[ ] topic state/seq not accidentally reset unless contract.
[ ] close closes clients with 1001.
[ ] close stops accepting.
[ ] close removes own upgrade listener.
[ ] close clears heartbeat timer.
[ ] close releases WSS resources.
[ ] HTTP ownership respected.
[ ] repeated lifecycle calls follow exact idempotency.

FANOUT

[ ] 30 clients connect/subscribe.
[ ] each receives all 100 rapid messages.
[ ] each receives same per-topic sequence order.
[ ] no dropped/coalesced messages.
[ ] JSON serialization efficient.
[ ] no client² algorithm.

DIFFDEPTH

[ ] exact added levels.
[ ] exact changed levels.
[ ] removed levels emit quantity zero.
[ ] unchanged omitted.
[ ] applying delta rebuilds next depth.
[ ] bids/asks independent if applicable.
[ ] exact deterministic ordering.
[ ] exact price/quantity types.
[ ] input not mutated.

REGRESSION

[ ] typecheck passes.
[ ] Challenge 18 passes.
[ ] Challenge 01 passes.
[ ] Challenge 03 passes.
[ ] Challenge 08 passes.
[ ] Challenge 10 passes.
[ ] Challenge 11/19 pass.
[ ] Challenge 12/20 pass.
[ ] Challenge 15/16/14 pass.
[ ] Challenge 04/02/05/09/13 pass.
[ ] Challenge 06/sanity pass.
[ ] full suite recorded honestly.
[ ] Challenge17/Task32 remaining state identified.
[ ] protected files unchanged.
[ ] Task31 note created.
[ ] final Git target master.

If any Challenge 18 assertion remains failing:
- Task 31 status = PARTIAL;
- report exact failing test/root cause.

============================================================
DX. FINAL CURSOR REPORT
============================================================

Return:

1. Task 31 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Exact Challenge 18 test count.
6. WebSocket hub public API.
7. WebSocket path.
8. Token transport/auth integration.
9. Pre-upgrade 401 implementation.
10. Client/principal state.
11. Topic registry/ACL.
12. Subscribe protocol/snapshot.
13. Error/malformed-message handling.
14. Per-topic sequence model.
15. Late-subscription race solution.
16. Resync behavior.
17. Heartbeat algorithm/timing.
18. Dead-client handling.
19. Backpressure threshold/eviction.
20. Healthy-client isolation.
21. Fan-out architecture.
22. disconnectAll behavior/code.
23. close behavior/code.
24. Timer/listener/resource cleanup.
25. diffDepth algorithm/order.
26. BigInt/serialization handling.
27. Typecheck.
28. 18a result.
29. 18b result.
30. 18c result.
31. 18d result.
32. 18e result.
33. 18f result.
34. Full Challenge 18 result.
35. Challenge 01 result.
36. Challenge 03/08 result.
37. Challenge 10 result.
38. Challenge 11/19 result.
39. Challenge 12/20 result.
40. Challenge 15/16/14 result.
41. Challenge 04/02/05/09/13 result.
42. Challenge 06/sanity result.
43. Full-suite result.
44. Remaining Task32/Challenge17 failures.
45. Confirmation protected files unchanged.
46. Final diff summary.
47. Reviewed Git commands targeting master.

Suggested commit:

feat: implement authenticated websocket feed

Do not automatically commit, merge, or push.
````

---

# Task 31 acceptance matrix

| Area | Required behavior |
|---|---|
| Auth | Valid access token only |
| Invalid auth | HTTP 401 before upgrade |
| Principal | From verified access token |
| Subscription | Topic-specific |
| Allowed topic | Snapshot |
| Forbidden/unknown | Controlled error |
| Malformed frame | Survives |
| Sequence | Independent per topic |
| Publish | Gapless increasing seq |
| Late subscriber | Snapshot + seamless next delta |
| Resync | Current snapshot, subscribed topic only |
| Heartbeat | Ping/pong |
| Dead client | Dropped |
| Slow client | Evicted at bounded backlog |
| Healthy clients | Never blocked by slow client |
| disconnectAll | 1012, hub stays accepting |
| close | 1001, terminal |
| Fan-out | 30 × 100 complete/in order |
| diffDepth add | New quantity |
| diffDepth change | New quantity |
| diffDepth remove | Quantity 0 |
| diffDepth unchanged | Omitted |
| Input mutation | None |
| Client Challenge 17 | Not implemented |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 31

Official final branch:

**`master`**

Workflow:

**`master` → `task-31` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 31 branch

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
task-31
```

Official final branch:

```text
master
```

---

## 2. Run final Task 31 verification

```powershell
npm run typecheck

npm test challenge18.test.ts

npm test challenge01.test.ts

npm test challenge03.test.ts

npm test challenge08.test.ts

npm test challenge10.test.ts

npm test challenge11.test.ts

npm test challenge19.test.ts

npm test challenge12.test.ts

npm test challenge20.test.ts

npm test challenge15.test.ts

npm test challenge16.test.ts

npm test challenge14.test.ts

npm test challenge04.test.ts

npm test challenge02.test.ts

npm test challenge05.test.ts

npm test challenge09.test.ts

npm test challenge13.test.ts

npm test challenge06.test.ts

npm test _sanity.test.ts

git diff --check
```

If Challenge 18 labels exist:

```powershell
npm test challenge18.test.ts -t "Challenge 18a"

npm test challenge18.test.ts -t "Challenge 18b"

npm test challenge18.test.ts -t "Challenge 18c"

npm test challenge18.test.ts -t "Challenge 18d"

npm test challenge18.test.ts -t "Challenge 18e"

npm test challenge18.test.ts -t "Challenge 18f"
```

Use actual labels if different.

Then:

```powershell
npm test
```

Do not implement Task 32 just because Challenge 17 remains red.

---

## 3. Review Task 31 changes

```powershell
git status --short
git diff --stat
git diff --name-only
```

Primary likely file:

```powershell
git diff -- src/services/liveHub.ts
```

Only if genuinely changed:

```powershell
git diff -- src/server.ts
git diff -- "<actual-websocket-helper-path>"
```

Do not paste placeholders literally.

Review note:

```powershell
git diff -- docs/clearhouse-task-31-websocket-feed.md
```

---

## 4. Stage only Task 31 files

Always stage:

```powershell
git add -- docs/clearhouse-task-31-websocket-feed.md
```

If changed:

```powershell
git add -- src/services/liveHub.ts
```

Only if genuinely required by Challenge 18:

```powershell
git add -- src/server.ts
git add -- "<actual-websocket-helper-path>"
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
- client live-feed/dashboard changes
- unrelated domain/business code
- Task 32+ work.

Also confirm no auth token/secret was accidentally put into the engineering note.

---

## 6. Commit Task 31

```powershell
git commit -m "feat: implement authenticated websocket feed"
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

## 8. Merge Task 31

Prefer:

```powershell
git merge --ff-only task-31
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-31
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

npm test challenge18.test.ts

npm test challenge01.test.ts

npm test challenge10.test.ts

git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge03.test.ts
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

Local HEAD and remote `refs/heads/master` must match.

---

# If push is rejected

Do not force.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If safe for the local-only Task 31 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge18.test.ts
npm test challenge01.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts carefully.

---

# Fast Task 31 checklist

- [ ] branch = task-31
- [ ] final branch = master
- [ ] challenge18 fully read
- [ ] config/scores read-only
- [ ] exact test count recorded
- [ ] current `ws` API/version inspected
- [ ] exact WS path known
- [ ] exact token transport known
- [ ] valid token upgrades
- [ ] invalid/missing token HTTP 401 before upgrade
- [ ] no token logging
- [ ] client principal stored
- [ ] topic registry known
- [ ] ACL exact
- [ ] subscribe frame exact
- [ ] allowed topic snapshot
- [ ] forbidden topic error
- [ ] unknown topic error
- [ ] malformed JSON survives
- [ ] per-topic independent seq
- [ ] one publish = one topic seq increment
- [ ] snapshot reads current seq
- [ ] snapshot doesn't increment seq unless contract
- [ ] late subscriber misses nothing
- [ ] snapshot precedes later deltas
- [ ] resync subscribed topic only
- [ ] resync fresh snapshot current seq
- [ ] heartbeat ping/pong works
- [ ] dead client dropped
- [ ] healthy client stays
- [ ] heartbeat timer cleaned
- [ ] bufferedAmount/backpressure threshold exact
- [ ] slow consumer dropped
- [ ] healthy subscribers unaffected
- [ ] no unbounded client queue
- [ ] disconnectAll uses 1012
- [ ] disconnectAll still accepts new clients
- [ ] close uses 1001
- [ ] close stops accepting
- [ ] own upgrade listener removed
- [ ] WSS resources cleaned
- [ ] 30 subscribers × 100 publishes complete
- [ ] each subscriber order/gaps correct
- [ ] diffDepth added levels exact
- [ ] diffDepth changed levels exact
- [ ] removed levels quantity zero
- [ ] unchanged omitted
- [ ] applying diff rebuilds new depth
- [ ] diffDepth inputs not mutated
- [ ] Challenge18 passes
- [ ] Challenge01 passes
- [ ] Challenge03/08 pass
- [ ] Challenge10 passes
- [ ] Challenge11/19 pass
- [ ] Challenge12/20 pass
- [ ] Challenge15/16/14 pass
- [ ] Challenge04/02/05/09/13 pass
- [ ] Challenge06/sanity pass
- [ ] full suite recorded
- [ ] Task32/Challenge17 not implemented prematurely
- [ ] protected files unchanged
- [ ] Task31 note created
- [ ] committed on task-31
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 32 — Challenge 17: Live Dashboard Updates.
