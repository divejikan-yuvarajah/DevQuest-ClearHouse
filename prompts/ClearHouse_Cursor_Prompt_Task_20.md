# ClearHouse — Complete Enhanced Cursor Prompt for Task 20

**Task:** Challenge 10 — Observability and Operations  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-20`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 20 purpose

Task 20 implements **Challenge 10 — Observability and Operations**.

This task makes the platform operable from the outside without reading source code. It must provide:

- **liveness**: process is alive;
- **readiness**: database dependency is actually reachable;
- **structured request logging**: useful operational fields, no password/token/full-body leakage;
- **real request metrics**: `/api/metrics` reflects requests already served;
- **login rate limiting**: real 429 behavior with `Retry-After` and automatic recovery after the configured window.

This is an operational layer. Do not redesign business logic from Tasks 1–19.

---

# Published Challenge 10 contract — 100 points

## 10a — Health and readiness — 25 pts

### 10a-1 — 10 pts
`/health` always returns **200** while the process is running.

This is a **liveness** check.

It must not fail merely because the database is temporarily unavailable.

### 10a-2 — 8 pts
`/ready` returns **200** when the database is reachable.

### 10a-3 — 7 pts
`/ready` returns **503** when the database is unreachable.

This is a **readiness** check.

It must test the real database dependency rather than just returning a hardcoded status.

---

## 10b — Structured logging with no secrets — 45 pts

### 10b-1 — 25 pts
A request must never cause any of these to reach stdout:

- password;
- token;
- full request body.

Logging must not leak credentials or request payloads.

### 10b-2 — 20 pts
A request produces at least one structured log line with the exact required fields from `tests/challenge10.test.ts`.

Do not guess the field names.

Read the test completely and preserve the exact expected JSON/log structure.

---

## 10c — Metrics — 15 pts

### 10c-1 — 15 pts
`/api/metrics` must reflect **real traffic already served**.

Metrics must be updated by actual request flow, not hardcoded fixtures.

---

## 10d — Rate limiting — 15 pts

### 10d-1 — 10 pts
Exceeding the login rate limit returns:

- HTTP `429`;
- a valid `Retry-After` response header.

### 10d-2 — 5 pts
After the rate-limit window resets, a request that was previously rate-limited succeeds again.

The limiter must expire/reset naturally according to the configured/tested window.

---

# Challenge 10 total

```text
10a = 25
10b = 45
10c = 15
10d = 15
----------------
Total = 100 points
```

These are available points only, not earned points.

---

# Important design boundaries

Task 20 should generally work in:

- `src/server.ts`
- existing health/readiness controller/service if present
- existing logging middleware/service if present
- existing metrics middleware/service if present
- existing rate-limiter middleware/service if present
- login route/controller integration only where necessary

Do not add external observability packages unless the current repository already depends on them.

Do not modify `package.json`.

Prefer minimal dependency-free implementation using existing Express/Knex infrastructure.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 20

Copy the entire block below into Cursor Agent mode.

````text
Act as my senior TypeScript/Express production-operations engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 20 ONLY: implement Challenge 10 — Observability and Operations — completely and safely.

Implement:
- liveness;
- database readiness;
- structured request logging with secret/body exclusion;
- real HTTP traffic metrics;
- login rate limiting with Retry-After and window recovery.

Preserve Tasks 1–19.

Do not stop at a plan. Inspect, implement, run organizer tests and regressions, create the Task 20 engineering note, and show reviewed Git commands.

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

task-20

Historical reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–19;
- work on task-20;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit/merge/push automatically.

============================================================
B. STRICT TASK 20 SCOPE
============================================================

IMPLEMENT:

Challenge 10a:
- /health;
- /ready;
- database reachability readiness.

Challenge 10b:
- structured request logging;
- required log fields;
- no password leakage;
- no token leakage;
- no full-body leakage.

Challenge 10c:
- request metrics;
- /api/metrics;
- real traffic accounting.

Challenge 10d:
- login rate limiter;
- HTTP 429;
- Retry-After;
- automatic window reset.

PRESERVE:

- Task 5 HMAC/rawBody handling;
- Task 6 login/session/token behavior;
- Task 9 body parser/security/error envelopes;
- all Tasks 10–19 business logic.

DO NOT IMPLEMENT:

- Task 21 API versioning/cache/latency;
- dashboard;
- WebSockets;
- Swagger;
- event sourcing;
- market data;
- fees;
- netting;
- complex orders.

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

- skip tests;
- weaken assertions;
- increase organizer timeouts;
- reduce test discovery;
- change fake timers/property seeds;
- add test-only production behavior.

Do NOT add source logic checking:

- NODE_ENV === "test";
- VITEST;
- organizer test names;
- fixture passwords;
- fixture tokens;
- known test IPs;
- known request counts;
- known metrics expected values.

Do NOT log:

- req.body;
- rawBody;
- password;
- access token;
- refresh token;
- Authorization header;
- HMAC signature;
- HMAC secret;
- JWT secret;
- cookies;
- complete request headers;
- full query/body objects containing untrusted data.

No destructive Git:

- git reset --hard;
- git clean -fd;
- force-push;
- history rewrite.

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

Verify Task 19 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-19 exists:

git log --oneline --decorate --max-count=10 task-19

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-20

If task-20 already exists:

git branch --list task-20
git log --oneline --decorate --max-count=10 task-20

Do not delete/recreate blindly.

Record:

- starting commit;
- branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
E. VERIFY IMPORTANT PREREQUISITES
============================================================

Read if present:

- docs/clearhouse-task-02-setup.md
- docs/clearhouse-task-05-signing.md
- docs/clearhouse-task-06-sessions.md
- docs/clearhouse-task-09-input-security.md
- docs/clearhouse-task-19-reconciliation-migration.md

Verify source, not only notes.

Task 20 depends on:

TASK 2:
- normal Express startup;
- database available in normal test setup.

TASK 5:
- express.json verify/rawBody capture;
- do not log rawBody.

TASK 6:
- login endpoint/session behavior.

TASK 9:
- JSON parser/error handling;
- security middleware order.

Before editing run:

npm run typecheck

npm test _sanity.test.ts

Record any pre-existing failure.

============================================================
F. READ CHALLENGE 10 COMPLETELY
============================================================

Read:

- tests/challenge10.test.ts

from top to bottom.

Do not implement from challenge prose alone.

Build a coverage table:

test
| exact endpoint
| exact expected status
| exact response/body
| exact expected log fields
| exact metrics shape
| exact limiter threshold/window
| exact Retry-After expectation
| source surface

Read:

- config/scores.ts

READ ONLY.

Confirm current Challenge 10 scoring/tests.

============================================================
G. DISCOVER EXISTING OPERATIONAL SURFACES
============================================================

Search:

rg -n "health|ready|readiness|metrics|logger|logging|rateLimit|rateLimiter|Retry-After|login|stdout|console.log|console.error|requestId|duration" src tests

PowerShell fallback:

Get-ChildItem -Recurse src,tests -File |
  Select-String -Pattern "health|ready|readiness|metrics|logger|logging|rateLimit|rateLimiter|Retry-After|login|stdout|console.log|requestId|duration"

Read likely files:

- src/server.ts
- existing health controller/service
- existing metrics service/middleware
- existing logger middleware/service
- existing rate limiter
- auth/login controller/routes
- DB accessor/Knex singleton

Do not invent a parallel ops framework if stubs already exist.

============================================================
H. BEFORE BASELINE
============================================================

Run:

npm test challenge10.test.ts

Record:

- exact test count;
- exact failing groups;
- exact log-field assertions;
- exact metrics JSON/text shape;
- exact rate limit count/window;
- any fake-timer usage;
- any DB failure injection pattern.

If group labels exist:

npm test challenge10.test.ts -t "Challenge 10a"
npm test challenge10.test.ts -t "Challenge 10b"
npm test challenge10.test.ts -t "Challenge 10c"
npm test challenge10.test.ts -t "Challenge 10d"

Use current labels exactly.

============================================================
I. LIVENESS — /health
============================================================

`/health` proves:

- the Express process is alive and can serve HTTP.

It must return 200 while process is running.

Do NOT make `/health` depend on:

- database;
- matching engine;
- HMAC secret validity;
- downstream APIs;
- seed state.

If DB is down:
- `/health` should still be 200;
- `/ready` should be 503.

This separation is intentional.

============================================================
J. /health RESPONSE CONTRACT
============================================================

Read exact test.

Preserve exact body/envelope if asserted.

Do not invent:
- detailed environment dumps;
- database filename;
- host filesystem paths;
- secrets;
- process.env.

A minimal safe liveness body is preferred if current tests permit it.

No stack traces.

============================================================
K. READINESS — /ready
============================================================

`/ready` must test the real DB dependency.

Do not hardcode:

return res.status(200)

Do not infer readiness from:
- server started;
- knex object exists;
- DB config string exists.

Perform a tiny actual database operation using the existing Knex connection.

Examples:
- SELECT 1
- a current project-appropriate raw/simple query.

Use the current test environment and exact DB layer.

============================================================
L. READINESS SUCCESS
============================================================

When DB is reachable:

- respond 200;
- exact current expected response shape;
- do not leak schema/database internals.

Do not run expensive business queries.

Do not mutate DB.

============================================================
M. READINESS FAILURE
============================================================

When DB is unavailable/unreachable:

- respond 503;
- controlled JSON response per current test;
- do not throw a raw unhandled error;
- do not expose SQL, path, stack, credentials.

Do not make failure turn into 500.

Do not call process.exit().

============================================================
N. READINESS MUST OBSERVE CURRENT DB HANDLE
============================================================

Challenge 10a-3 may inject or simulate DB unavailability.

Inspect how test does it.

Do not cache readiness forever.

Each readiness request must use the current dependency state or a correctly bounded current probe.

Do not return stale "ready=true" from startup.

============================================================
O. STRUCTURED REQUEST LOGGING
============================================================

Challenge 10b requires at least one structured log line for a request.

Read the exact fields from the organizer test.

Potential operational fields commonly include:

- timestamp;
- level;
- method;
- path;
- status;
- duration;
- requestId.

These are examples.

DO NOT hardcode this list unless the test confirms it.

Implement exactly the expected fields.

============================================================
P. LOG FORMAT
============================================================

If test parses stdout as JSON:

emit one JSON object per line.

Use:

JSON.stringify(logObject)

Do not produce:
- JS object inspection syntax;
- multiline pretty JSON;
- prefix text before JSON if test expects a parseable line.

If existing logger already defines a format:
preserve it and complete missing fields.

============================================================
Q. LOG ON RESPONSE COMPLETION
============================================================

For accurate:
- status code;
- duration;

attach logging to a reliable response completion event such as:

res.on("finish", ...)

or equivalent existing middleware pattern.

Measure start time before downstream handler.

Do not log successful status before controller finishes.

============================================================
R. REQUEST DURATION
============================================================

Use monotonic-ish process timing or Date.now according to current architecture/test.

Do not expose huge precision if not needed.

Duration must be:
- numeric/non-negative;
- deterministic enough for tests.

Do not sleep to create a duration.

============================================================
S. LOG PATH
============================================================

Read exact test expectation:

- req.path;
- req.originalUrl;
- route template.

Use the expected form.

Avoid logging sensitive query values if the current path can contain secrets.

If organizer expects path only:
do not include entire query string.

============================================================
T. NO FULL REQUEST BODY LOGGING
============================================================

Never log:

req.body
rawBody
JSON.stringify(req.body)

Even if body appears harmless.

Challenge 10b-1 specifically requires full body not to reach stdout.

Do not add body redaction then log the full redacted structure unless current test explicitly allows it; safest is not to log request bodies at all.

============================================================
U. PASSWORD SECRET EXCLUSION
============================================================

A login request may contain:

password

The password string itself must never appear in stdout.

Do not log:
- credentials;
- auth input object;
- validation object containing password;
- thrown error that embeds request body.

Inspect all Task 20-touched console/log statements.

============================================================
V. TOKEN SECRET EXCLUSION
============================================================

Do not log:

- access tokens;
- refresh tokens;
- Authorization/Bearer header;
- HMAC signature;
- JWT claims if they expose sensitive token strings;
- cookies;
- session tokens.

Do not log all headers wholesale.

Whitelist safe operational fields instead of trying to blacklist every possible secret.

============================================================
W. ERROR LOGGING
============================================================

If logging errors:

log safe fields such as:
- error category/code;
- route/method;
- status;

not:
- request body;
- token;
- password;
- SQL with secrets;
- raw stack if the organizer stdout secret test may include sensitive values.

Task 9 already protects HTTP responses.

Task 20 must protect stdout.

============================================================
X. REQUEST ID
============================================================

If current test requires request ID:

- reuse existing request-id middleware if present;
- otherwise generate a safe opaque ID using built-in crypto;
- or accept a validated existing request-id header only if current architecture/test expects it.

Do not use sensitive values as request IDs.

Do not add dependency.

If request ID is not required, do not overcomplicate.

============================================================
Y. METRICS — REAL TRAFFIC
============================================================

`/api/metrics` must reflect requests that were actually served before the metrics request.

Do not hardcode:
- requests = 1;
- known test paths;
- expected fixture counts.

Use middleware that observes real HTTP responses.

============================================================
Z. METRICS STATE
============================================================

Use a small in-memory process-local metrics store unless current project already provides one.

Challenge 10 is process-level ops.

Do not add Redis/Prometheus dependency.

Metrics should be bounded.

Do not create unbounded labels per:
- account ID;
- order ID;
- IP;
- token;
- URL query.

============================================================
AA. METRICS DIMENSIONS
============================================================

Read exact organizer expectation.

Possible requirements may include:
- total requests;
- per-method;
- per-status;
- counts by route/path.

Only expose what the test/current API expects.

Avoid high-cardinality keys.

If tracking path:
prefer normalized safe path if current tests support it.

============================================================
AB. METRICS UPDATE TIMING
============================================================

Increment metrics when a request is actually served/completes.

Use response finish where current test expects final status.

Do not increment only when `/api/metrics` itself is called.

The metrics endpoint should report prior traffic.

============================================================
AC. SHOULD /api/metrics COUNT ITSELF?
============================================================

Read the test carefully.

If test records N traffic requests and then queries metrics:
the assertion may expect:
- N; or
- N + the metrics request.

Middleware order determines this.

Implement exact organizer expectation.

Do not guess.

If necessary:
- snapshot metrics before counting `/api/metrics`;
OR
- count it consistently if expected.

Document the decision.

============================================================
AD. METRICS RESET / TEST ISOLATION
============================================================

Inspect test setup.

If module state persists across organizer tests:
provide/use the existing reset helper only if current architecture already allows it.

Do not expose a public metrics-reset route.

Do not add test-environment branches.

If server/app is recreated per test:
keep metrics module naturally isolated where possible.

============================================================
AE. METRICS ENDPOINT SECURITY / SHAPE
============================================================

Preserve exact API response format.

Do not leak:
- secrets;
- environment variables;
- process argv;
- DB path.

Only operational counters needed by contract.

Do not implement full Prometheus format unless current test expects it.

============================================================
AF. RATE LIMIT SCOPE
============================================================

Challenge 10d is specifically about **login rate limiting**.

Do not rate-limit:
- every API route;
- health;
- readiness;
- metrics;
- cancellation;
- trading globally

unless existing architecture already does so.

Apply limiter narrowly to the login/auth endpoint required by test.

============================================================
AG. IDENTIFY LIMIT KEY
============================================================

Read exact test.

Likely key may be:
- request IP;
- username/email;
- combination.

Do not guess.

Use existing Express trust-proxy configuration.

Do not trust arbitrary spoofable forwarding headers directly unless the app already correctly configures proxies and test expects it.

============================================================
AH. RATE LIMIT DATA STRUCTURE
============================================================

A bounded in-memory Map is sufficient unless current project already has a limiter abstraction.

Each key should track enough information for the tested algorithm, e.g.:

- count;
- windowStart;
- expiresAt.

Do not add Redis.

Do not persist rate-limit state to business database unless current project already defines that.

============================================================
AI. FIXED WINDOW / SLIDING WINDOW
============================================================

Read exact test and existing constants.

Do not invent a different algorithm if the test expects fixed-window semantics.

Use existing exported:
- max attempts;
- window duration

if present.

Do not change constants to fit visible requests.

============================================================
AJ. RATE LIMIT CHECK ORDER
============================================================

Limiter should execute before expensive login credential verification where appropriate.

But preserve:
- body parsing;
- validation;
- auth response contract.

Read current middleware order.

Do not count malformed unrelated requests if test specifies only valid login attempts.

Use exact current semantics.

============================================================
AK. 429 RESPONSE
============================================================

When limit exceeded:

- status 429;
- standard error envelope if current API expects it;
- exact error code asserted by test;
- include Retry-After.

Do not return 403.

Do not throw generic 500.

============================================================
AL. Retry-After
============================================================

Set a valid `Retry-After` header.

Read organizer assertion:

- integer delay seconds; or
- another accepted format.

Use the exact expected style.

If delay seconds:

remainingMs = expiry - now
seconds = Math.ceil(remainingMs / 1000)
minimum = 1 while still blocked

Do not return:
- negative value;
- zero while still blocked;
- milliseconds if seconds expected.

============================================================
AM. WINDOW RESET — 10d-2
============================================================

After the window expires:

- stale entry must reset/expire;
- the next login request is allowed according to normal auth behavior;
- count starts a new window.

Do not permanently lock the key.

Do not require process restart.

============================================================
AN. CLOCK HANDLING
============================================================

Challenge 10d-2 may use fake timers.

Use a clock source compatible with the current test.

Usually:
- Date.now()

Do not:
- use a hidden separate wall-clock source that fake timers do not affect;
- add setTimeout cleanup as the only expiry mechanism.

Lazy expiry during request handling is robust:

if now >= expiresAt:
    reset bucket

This avoids timer leaks.

============================================================
AO. RATE LIMIT MEMORY CLEANUP
============================================================

Avoid unbounded stale entries.

At minimum:
- delete/reset expired key on access.

If adding periodic cleanup:
- do not create test-hanging timers;
- use unref if appropriate;
- but periodic cleanup is not required if lazy cleanup satisfies bounded challenge behavior.

Do not add long-lived intervals unless necessary.

============================================================
AP. SUCCESS / FAILURE COUNT SEMANTICS
============================================================

Read current test.

Does limiter count:
- every login attempt;
- failed logins only;
- both success and failure?

Follow exact organizer test/current constants.

Do not invent production policy that conflicts with test.

============================================================
AQ. LOGIN RESPONSE MUST STILL WORK AFTER RESET
============================================================

When the window resets:

the request should proceed to existing login handler.

If credentials are valid:
- normal successful login.

If credentials are intentionally invalid in test:
- the important contract may be "not 429".

Read exact assertion.

Do not fake success to prove limiter reset.

============================================================
AR. HEALTH/READY SHOULD NOT BE RATE-LIMITED
============================================================

Operational probes must remain usable.

Do not put login limiter at app-global middleware level.

Similarly, logging/metrics middleware should observe health requests according to current test but should not block them.

============================================================
AS. MIDDLEWARE ORDER
============================================================

Review Task 9 raw-body/HMAC requirements.

A safe conceptual order may be:

- security headers;
- body parser/rawBody verify;
- request timing/logging/metrics middleware;
- public health/readiness routes;
- API routes/auth;
- route-specific login limiter;
- error handling.

But DO NOT blindly reorder the app.

Read current source and tests.

Preserve:
- HMAC raw-body capture;
- malformed JSON handling;
- security headers;
- route auth.

Make the smallest required change.

============================================================
AT. DO NOT LOG MALFORMED BODY CONTENT
============================================================

If JSON parser throws:
- logging can record method/path/status;
- never print parser's entire raw payload if it includes sensitive body content.

Task 9 malformed JSON error envelope must stay intact.

============================================================
AU. STDOUT VS STDERR
============================================================

Read exact Challenge 10b test capture.

If it spies on `console.log` / stdout:
use the existing logger output channel required by test.

Do not switch to stderr solely to hide secrets from the test.

The requirement is genuine safe logging, not bypassing capture.

Likewise, do not silence all logs merely to satisfy 10b-1 because 10b-2 requires structured logs.

============================================================
AV. EXISTING console.log REVIEW
============================================================

Search touched/request path code for:

console.log
console.info
console.error
console.warn

If existing request code prints:
- body;
- password;
- token;

remove or sanitize only those unsafe operational logs.

Do not mass-delete unrelated developer diagnostics without evidence.

Do not print secrets in the Task 20 engineering note.

============================================================
AW. DATABASE READINESS PROBE TIME / COST
============================================================

Use a minimal query.

Do not:
- run migrations;
- write data;
- open new connection pool each request;
- query entire tables.

Use the existing shared Knex instance.

============================================================
AX. DB FAILURE RECOVERY
============================================================

If readiness sees a transient DB failure:

return 503 for that request.

A later request after DB recovery should be able to return 200.

Do not latch permanent not-ready state unless current architecture requires it.

============================================================
AY. METRICS + RATE LIMIT INTERACTION
============================================================

A 429 is still real HTTP traffic.

If metrics track status classes/codes and current test expects it:
- count 429 correctly.

Do not bypass metrics middleware for rate-limited responses accidentally.

============================================================
AZ. LOGGING + RATE LIMIT INTERACTION
============================================================

Rate-limited login requests should still produce safe operational logging if the logger observes all requests.

Never log:
- password/body

even on rejected attempts.

============================================================
BA. EXPECTED TASK 20 FILE SCOPE
============================================================

Primary likely:

- src/server.ts

Potential existing modules:
- src/middleware/requestLogger.ts
- src/middleware/rateLimiter.ts
- src/services/metrics.ts
- src/controller/opsController.ts
- src/routes/opsRoutes.ts
- or equivalent current paths.

Auth integration only if necessary:
- login route/controller.

Create/update:

- docs/clearhouse-task-20-observability-operations.md

Do NOT add tests.

Do NOT create new dependencies.

Do NOT modify DB schema.

============================================================
BB. CREATE SMALL MODULES ONLY IF THE REPO LACKS THEM
============================================================

If current starter already has stubs:
fill them.

If no module exists:
it is acceptable to create narrowly scoped source files, for example:

- src/middleware/requestLogger.ts
- src/services/metrics.ts
- src/middleware/loginRateLimiter.ts

only if that fits current architecture.

Do not build an enterprise telemetry framework.

============================================================
BC. TYPE SAFETY / QUALITY
============================================================

Maintain strict TypeScript.

Avoid:

- any;
- @ts-ignore;
- broad request object spreading;
- serializing req/res;
- logging headers wholesale;
- unbounded Map labels;
- timer leaks;
- swallowed DB errors;
- hardcoded test counts;
- module state with no reset/expiry strategy.

Prefer:

- small explicit types;
- safe field allowlists;
- lazy rate-limit expiry;
- deterministic metrics counters;
- existing Knex instance;
- JSON structured log object.

============================================================
BD. REQUIRED VERIFICATION — CHALLENGE 10
============================================================

After implementation:

npm run typecheck

Then:

npm test challenge10.test.ts

This is the PRIMARY Task 20 gate.

If current group labels exist:

npm test challenge10.test.ts -t "Challenge 10a"
npm test challenge10.test.ts -t "Challenge 10b"
npm test challenge10.test.ts -t "Challenge 10c"
npm test challenge10.test.ts -t "Challenge 10d"

Use actual labels.

============================================================
BE. SECURITY REGRESSION
============================================================

Because Task 20 touches server middleware/logging:

run:

npm test challenge07.test.ts -t "Challenge 7d|Challenge 7e"

Use actual labels.

This checks:
- request hardening;
- information disclosure/security headers where relevant.

Also run Task 9 input/security regression if practical:

npm test challenge00b.test.ts -t "Challenge 0s"

Use actual current label.

============================================================
BF. AUTH REGRESSION
============================================================

Because Task 20 touches login:

run:

npm test challenge01.test.ts

This verifies:
- HMAC/auth;
- login/session;
- permissions

remain healthy.

If login-specific tests are in another file/current label:
run the relevant exact current tests.

============================================================
BG. BROADER REGRESSION
============================================================

Run:

npm test challenge09.test.ts
npm test challenge13.test.ts
npm test challenge05.test.ts
npm test challenge04.test.ts
npm test challenge03.test.ts
npm test challenge02.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

Then:

git diff --check

Finally:

npm test

Record future Task 21+ failures honestly.

============================================================
BH. FAILURE DIAGNOSIS — HEALTH / READY
============================================================

If /health returns non-200 when DB is down:
- liveness is wrongly coupled to readiness.

If /ready still returns 200 with broken DB:
- probe is hardcoded/stale;
- test failure injection not reaching the DB handle used by readiness.

If /ready returns 500:
- DB error not mapped to controlled 503.

Do not leak DB error details.

============================================================
BI. FAILURE DIAGNOSIS — LOGGING
============================================================

If 10b-1 fails:
search stdout sources for the exact synthetic secret string.

Common causes:
- logging req.body;
- console.log login DTO;
- printing Authorization header;
- error object containing payload;
- rawBody logging;
- full req object.

If 10b-2 fails:
- inspect exact expected field names/types;
- ensure line is valid structured format;
- ensure log emitted after response;
- ensure stdout channel matches test.

Do not disable logging.

============================================================
BJ. FAILURE DIAGNOSIS — METRICS
============================================================

If metrics stay zero:
- middleware not registered;
- registered after routes;
- updates only metrics endpoint;
- response finish listener not firing.

If count off by one:
- determine whether `/api/metrics` counts itself;
- implement exact test contract.

If metrics leak state across tests:
- inspect app/module lifecycle;
- do not add NODE_ENV test reset.

============================================================
BK. FAILURE DIAGNOSIS — RATE LIMIT
============================================================

If no 429:
- middleware not on login route;
- key changes unexpectedly;
- threshold comparison off-by-one.

If Retry-After missing/wrong:
- calculate remaining window correctly;
- use seconds if test expects seconds;
- ceil.

If never resets:
- stale bucket not lazily expired;
- fake timer incompatible clock;
- window start not refreshed.

If resets too soon:
- incorrect ms/sec units.

============================================================
BL. TASK 20 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-20-observability-operations.md

Include:

1. Starting commit.
2. Working branch task-20.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 10 test count.
6. 100-point score map.
7. Exact health endpoint contract.
8. Exact ready endpoint contract.
9. DB probe used.
10. DB failure mapping.
11. Structured log format.
12. Exact required log fields.
13. stdout channel.
14. secret/body exclusion strategy.
15. request duration strategy.
16. metrics data model.
17. exact metrics response shape.
18. what traffic is counted.
19. whether metrics endpoint counts itself.
20. rate-limit key.
21. threshold.
22. window duration.
23. rate-limit algorithm.
24. Retry-After calculation.
25. window-reset behavior.
26. memory cleanup strategy.
27. middleware ordering.
28. exact files changed.
29. typecheck.
30. 10a result.
31. 10b result.
32. 10c result.
33. 10d result.
34. full Challenge 10 result.
35. Challenge 07/Task 9 security regressions.
36. Challenge 01 auth regression.
37. Challenge 09/13/05/04/03/02 results.
38. sanity result.
39. full-suite result.
40. protected-file confirmation.
41. suggested commit.
42. master merge/push workflow.
43. next Task 21: API Design, Performance, Config and Cache.

Do not include:
- passwords;
- tokens;
- env values;
- raw request bodies;
- secret header examples.

============================================================
BM. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat

Review actual changed files individually.

Likely:

git diff -- src/server.ts
git diff -- src/middleware/requestLogger.ts
git diff -- src/middleware/rateLimiter.ts
git diff -- src/services/metrics.ts
git diff -- src/controller/opsController.ts
git diff -- src/routes/opsRoutes.ts
git diff -- docs/clearhouse-task-20-observability-operations.md

Only review paths that actually exist/changed.

If auth route changed:

git diff -- "<actual-login-route-or-controller>"

Confirm:

- no tests changed;
- no config changes;
- no package changes;
- no migrations/seeds;
- no HMAC rawBody break;
- no password/token/body logging;
- no test-specific branches;
- no Task 21 work.

============================================================
BN. TASK 20 COMPLETION CRITERIA
============================================================

Task 20 is COMPLETE only when:

HEALTH / READY

[ ] /health returns 200 while process is alive.
[ ] /health does not depend on DB.
[ ] /ready probes real DB.
[ ] /ready returns 200 when reachable.
[ ] /ready returns 503 when unreachable.
[ ] readiness error is controlled/safe.
[ ] no DB mutation from readiness.

LOGGING

[ ] at least one structured line per tested request.
[ ] exact test-required fields present.
[ ] log line is parseable as required.
[ ] final status recorded correctly.
[ ] duration recorded as required.
[ ] password never appears.
[ ] token never appears.
[ ] Authorization never appears.
[ ] full body never appears.
[ ] rawBody never appears.
[ ] no secret logging through errors.

METRICS

[ ] real request middleware updates counters.
[ ] metrics not hardcoded.
[ ] /api/metrics returns exact current shape.
[ ] prior traffic reflected.
[ ] self-count semantics match test.
[ ] no high-cardinality unbounded labels.

RATE LIMIT

[ ] limiter is scoped to login.
[ ] exact key matches test/contract.
[ ] exact threshold matches existing config/test.
[ ] exceeded request returns 429.
[ ] Retry-After present.
[ ] Retry-After units correct.
[ ] expired window resets.
[ ] request proceeds after reset.
[ ] no permanent lockout.
[ ] no timer leak.

REGRESSION

[ ] typecheck passes.
[ ] Challenge 10 passes.
[ ] Challenge 01 passes.
[ ] relevant security regression passes.
[ ] sanity passes.
[ ] broader business regressions recorded.
[ ] full suite recorded honestly.
[ ] organizer tests unchanged.
[ ] config/package/migrations unchanged.
[ ] Task 20 note created.
[ ] final Git target master.

If any current Challenge 10 test remains failing:
- status = PARTIAL;
- name exact failure/root cause.

============================================================
BO. FINAL CURSOR REPORT
============================================================

Return:

1. Task 20 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Current Challenge 10 test count.
6. /health implementation.
7. /ready implementation.
8. DB probe/failure handling.
9. structured log format.
10. exact log fields.
11. secret/body exclusion.
12. metrics design.
13. metrics response shape.
14. metrics self-count behavior.
15. login limiter design.
16. limit key.
17. limit/window values.
18. Retry-After behavior.
19. reset behavior.
20. typecheck.
21. Challenge 10a result.
22. Challenge 10b result.
23. Challenge 10c result.
24. Challenge 10d result.
25. Full Challenge 10 result.
26. Challenge 01 auth regression.
27. security regression.
28. Challenge 09/13/05/04/03/02 results.
29. sanity result.
30. full-suite result.
31. remaining future failures.
32. confirmation protected files unchanged.
33. final diff summary.
34. reviewed Git commands targeting master.

Suggested commit:

feat: add observability and operational controls

Do not automatically commit, merge, or push.
````

---

# Task 20 reference acceptance matrix

| Area | Required behavior |
|---|---|
| `/health` | 200 while process is alive |
| `/health` + DB down | Still 200 |
| `/ready` + DB up | 200 |
| `/ready` + DB down | 503 |
| readiness probe | Real DB query, read-only |
| request logging | Structured |
| password in stdout | Never |
| token in stdout | Never |
| full body in stdout | Never |
| required fields | Exact organizer test fields |
| metrics | Reflect real prior traffic |
| metrics hardcoding | Forbidden |
| login rate limit | 429 after threshold |
| `Retry-After` | Present and valid |
| limiter reset | Request proceeds after window |
| timer/test hacks | Forbidden |
| final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 20

Official final branch:

**`master`**

Workflow:

**`master` → `task-20` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 20 branch

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
task-20
```

Official final branch:

```text
master
```

---

## 2. Final Task 20 verification

```powershell
npm run typecheck

npm test challenge10.test.ts

npm test challenge01.test.ts

npm test challenge09.test.ts

npm test challenge13.test.ts

npm test challenge05.test.ts

npm test challenge04.test.ts

npm test challenge03.test.ts

npm test challenge02.test.ts

npm test challenge00.test.ts

npm test _sanity.test.ts

git diff --check
```

If current group labels exist:

```powershell
npm test challenge10.test.ts -t "Challenge 10a"

npm test challenge10.test.ts -t "Challenge 10b"

npm test challenge10.test.ts -t "Challenge 10c"

npm test challenge10.test.ts -t "Challenge 10d"
```

Security-focused regression if labels exist:

```powershell
npm test challenge07.test.ts -t "Challenge 7d|Challenge 7e"
```

Then:

```powershell
npm test
```

---

## 3. Review Task 20 changes

```powershell
git status --short
git diff --stat
```

Review actual changed source files individually.

Common examples:

```powershell
git diff -- src/server.ts
git diff -- src/middleware/requestLogger.ts
git diff -- src/middleware/rateLimiter.ts
git diff -- src/services/metrics.ts
git diff -- src/controller/opsController.ts
git diff -- src/routes/opsRoutes.ts
git diff -- docs/clearhouse-task-20-observability-operations.md
```

Do not assume those modules exist; use actual paths Cursor reports.

If login route/controller changed, review it separately.

---

## 4. Stage only Task 20 files

Always stage the Task 20 engineering note if created:

```powershell
git add -- docs/clearhouse-task-20-observability-operations.md
```

Stage only actual Task 20 source files that changed, for example:

```powershell
git add -- src/server.ts
```

Then use the actual discovered paths:

```powershell
git add -- "<actual-request-logger-path>"
git add -- "<actual-metrics-path>"
git add -- "<actual-rate-limiter-path>"
git add -- "<actual-ops-controller-or-route-path>"
```

Only if login integration actually changed:

```powershell
git add -- "<actual-login-route-or-controller-path>"
```

Do not paste angle-bracket placeholders literally.

If a changed file contains unrelated work:

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
- .env
- .gitignore
- unrelated work.

Also inspect staged logs/docs for accidental secrets.

---

## 6. Commit Task 20

```powershell
git commit -m "feat: add observability and operational controls"
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

## 8. Merge Task 20

Prefer:

```powershell
git merge --ff-only task-20
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If valid histories diverged:

```powershell
git merge task-20
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
npm test challenge10.test.ts
npm test challenge01.test.ts
git diff --check
git status -sb
```

For extra confidence:

```powershell
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

Local HEAD must match remote `refs/heads/master`.

---

# If push is rejected

Do not force.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If safe for the local-only Task 20 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge10.test.ts
npm test challenge01.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts deliberately.

---

# Fast Task 20 checklist

- [ ] branch = task-20
- [ ] final branch = master
- [ ] challenge10 read completely
- [ ] exact log fields identified from test
- [ ] exact metrics shape identified
- [ ] exact rate limit threshold identified
- [ ] exact rate limit window identified
- [ ] `/health` implemented
- [ ] `/health` independent of DB
- [ ] `/ready` real DB probe
- [ ] `/ready` 200 when DB reachable
- [ ] `/ready` 503 when DB unavailable
- [ ] no readiness data leak
- [ ] structured JSON/log line implemented
- [ ] correct status/duration fields
- [ ] no password logging
- [ ] no token logging
- [ ] no Authorization logging
- [ ] no full body logging
- [ ] no rawBody logging
- [ ] request metrics reflect real traffic
- [ ] no hardcoded metrics
- [ ] metrics self-count behavior matches test
- [ ] login limiter scoped correctly
- [ ] correct limiter key
- [ ] correct attempt threshold
- [ ] correct window
- [ ] 429 on excess
- [ ] Retry-After valid
- [ ] window reset works
- [ ] lazy expiry / no timer leak
- [ ] Task 5 rawBody behavior preserved
- [ ] Task 9 security behavior preserved
- [ ] Task 6 auth/login preserved
- [ ] Challenge10 passes
- [ ] Challenge01 passes
- [ ] relevant security checks pass
- [ ] sanity passes
- [ ] full suite recorded
- [ ] no tests modified
- [ ] no new tests added
- [ ] config/package/migrations unchanged
- [ ] Task 20 note created
- [ ] committed on task-20
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 21 — Challenge 11: API Design, Performance, Configuration and Cache Correctness.
