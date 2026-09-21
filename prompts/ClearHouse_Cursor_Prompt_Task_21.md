# ClearHouse — Complete Enhanced Cursor Prompt for Task 21

**Task:** Challenge 11 — API Design and Performance  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-21`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 21 purpose

Task 21 implements **Challenge 11 — API Design and Performance**.

This challenge asks whether all previously built route families behave like one coherent API.

Task 21 covers four areas:

1. **Response-envelope consistency**
   - representative success responses use:
     ```json
     { "data": ..., "meta": ... }
     ```
   - representative error responses use:
     ```json
     { "error": { "code": "...", "details": [] } }
     ```

2. **Cache correctness**
   - first eligible read is a cache miss;
   - second identical read is a cache hit;
   - a successful write invalidates affected cached data;
   - the very next read reflects the new state.

3. **API versioning**
   - supported routes behave identically under `/api` and `/api/v1`;
   - unsupported version segments return a clean 404 rather than silently falling back.

4. **Latency budget**
   - the exact organizer-selected read-only route must remain within its documented latency budget under repeated load.

Task 21 should integrate earlier API behavior, not rewrite business logic from Tasks 1–20.

---

# Published Challenge 11 contract — 90 points

## 11a — Response envelope consistency — 25 pts

### 11a-1 — 12 pts
A representative successful response from every route family must match:

```json
{
  "data": "...",
  "meta": {}
}
```

Use the exact current test expectations for each family.

### 11a-2 — 13 pts
A representative error response from every route family must match:

```json
{
  "error": {
    "code": "SOME_CODE",
    "details": []
  }
}
```

No bare `{ error: "..." }`, raw Error object, stack trace, or HTML error page on the tested paths.

---

## 11b — Cache correctness — 35 pts

### 11b-1 — 18 pts
A first eligible read is a cache miss and the second identical read is a cache hit.

### 11b-2 — 17 pts
A successful write invalidates affected cached data, so the very next read returns the new state, not stale cached content.

---

## 11c — API versioning — 20 pts

### 11c-1 — 10 pts
The same supported route must answer identically under:

```text
/api/...
```

and:

```text
/api/v1/...
```

Do not duplicate business logic or controllers.

### 11c-2 — 10 pts
An unknown version segment, for example a version not explicitly supported by the current test, must return a clean 404.

It must not silently fall back to the unversioned API.

---

## 11d — Latency budget — 10 pts

### 11d-1 — 10 pts
The representative read-only route selected by `tests/challenge11.test.ts` must remain within the documented latency budget under repeated load.

Do not guess:
- the route;
- request count;
- threshold;
- warmup behavior.

Read the current organizer test and optimize the measured path only as needed.

---

# Challenge 11 total

```text
11a = 25
11b = 35
11c = 20
11d = 10
----------------
Total = 90 points
```

These are available points only, not earned points.

---

# Important earlier work Task 21 must preserve

## Task 3 cache invalidation

`src/services/cache.ts`

Already-fixed invariant:

```text
invalidate(key)
```

must actually delete only that key.

Do not convert invalidation into `clear()`.

## Task 7 cache expiry

Preserve:

- TTL is milliseconds;
- `expiresAt = Date.now() + ttlMs`;
- expired entries are not returned;
- expired entries are removed lazily when discovered;
- falsy cached values are not accidentally treated as misses.

Task 21 adds **correct application-level cache usage**, not a replacement cache implementation.

## Task 9 error envelopes

Malformed input/security paths already introduced safe:

```json
{
  "error": {
    "code": "...",
    "details": []
  }
}
```

Preserve those fixes.

## Task 20 logging/metrics

Task 21 route/version/cache work must not break:

- `/health`;
- `/ready`;
- structured logging;
- `/api/metrics`;
- login rate limiting.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 21

Copy the entire block below into Cursor Agent mode.

````text
Act as my senior TypeScript/Express API-platform and performance engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 21 ONLY: implement Challenge 11 — API Design and Performance — completely and safely.

Implement:
- success/error envelope consistency across the organizer-tested route families;
- correct read cache hit behavior;
- precise cache invalidation on successful writes;
- /api and /api/v1 parity using one route tree/business implementation;
- clean 404 for unsupported API versions;
- the exact organizer-selected read-only latency budget.

Preserve all completed Tasks 1–20.

Do not stop at a plan. Inspect, implement, test, document, and show reviewed Git commands.

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

task-21

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–20;
- work on task-21;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT TASK 21 SCOPE
============================================================

IMPLEMENT:

Challenge 11a:
- success envelope consistency;
- error envelope consistency.

Challenge 11b:
- cache miss -> hit behavior;
- successful-write invalidation;
- next read fresh.

Challenge 11c:
- /api alias;
- /api/v1 alias;
- unsupported version clean 404.

Challenge 11d:
- exact organizer-selected read-only latency budget.

PRESERVE:

- all business semantics Tasks 1–19;
- Task 20 observability/rate limiting;
- Task 5 HMAC originalUrl/rawBody semantics;
- Task 7 cache TTL/expiry behavior;
- Task 3 invalidate(key) semantics;
- Task 9 safe errors.

DO NOT IMPLEMENT:

- Task 22 operator dashboard;
- Task 23 demo seed/accounts enhancements;
- Task 24 portfolio/risk/trades dashboard;
- OpenAPI/Swagger (Task 25);
- event sourcing;
- market data;
- fees;
- netting;
- strategy orders;
- WebSockets.

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
- increase organizer timeout/latency threshold;
- reduce test discovery;
- alter generated inputs;
- relax TypeScript.

Do NOT add source behavior checking:

- NODE_ENV === "test";
- VITEST;
- organizer test names;
- known route fixtures;
- known cache keys;
- known request counts;
- known latency iteration counts;
- known benchmark threshold.

Do NOT hardcode:
- “hit” on the second request by request count;
- stale values from visible tests;
- only `/api/v1` fixture routes individually.

No destructive Git:

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

- origin = official CodeCommit remote;
- master = official final submission branch.

Verify Task 20 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-20 exists:

git log --oneline --decorate --max-count=10 task-20

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-21

If task-21 already exists:

git branch --list task-21
git log --oneline --decorate --max-count=10 task-21

Do not delete/recreate blindly.

Record:
- starting commit;
- current branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
E. VERIFY IMPORTANT PREREQUISITES
============================================================

Read if present:

- docs/clearhouse-task-03-infrastructure.md
- docs/clearhouse-task-07-shared-state.md
- docs/clearhouse-task-09-input-security.md
- docs/clearhouse-task-20-observability-operations.md

Verify actual source.

Before Task 21 edits run:

npm run typecheck
npm test challenge10.test.ts
npm test _sanity.test.ts

Task 21 must not break Challenge 10 operational endpoints.

============================================================
F. READ CHALLENGE 11 COMPLETELY
============================================================

Read:

- tests/challenge11.test.ts

from first line to last line.

Do not implement from Challenges.md summary alone.

Build a coverage table:

test
| exact route
| method
| auth/signing requirements
| expected status
| expected success/error envelope
| exact cache read/write path
| exact cache indicator/metadata
| exact versioning comparison
| exact unsupported-version path
| exact latency route
| iteration count
| latency threshold

Read:

- config/scores.ts

READ ONLY.

Confirm current Challenge 11 scoring/test labels.

============================================================
G. INVENTORY THE API ROUTE TREE
============================================================

Read:

- src/server.ts
- every current route module under src/routes/
- shared controller response helpers if any
- central error handler
- not-found handler
- cache service
- controllers/repositories touched by Challenge 11 cache test

Search:

rg -n "Router|app.use|/api|/v1|res.status|res.json|res.send|error:|data:|meta:|cache|getCache|invalidate|setCache|ttl" src tests

PowerShell fallback:

Get-ChildItem -Recurse src,tests -File |
  Select-String -Pattern "Router|app.use|/api|/v1|res.status|res.json|res.send|error:|data:|meta:|cache|invalidate"

Create a route-family inventory from the actual test.

Do not refactor every endpoint if only specific representative route families are asserted.

============================================================
H. BEFORE BASELINE
============================================================

Run:

npm test challenge11.test.ts

Record:

- exact current test count;
- 11a pass/fail;
- 11b pass/fail;
- 11c pass/fail;
- 11d pass/fail;
- exact endpoint names;
- exact response mismatches;
- exact cache key/metadata expectations;
- latency timing output/threshold.

If labels exist:

npm test challenge11.test.ts -t "Challenge 11a"
npm test challenge11.test.ts -t "Challenge 11b"
npm test challenge11.test.ts -t "Challenge 11c"
npm test challenge11.test.ts -t "Challenge 11d"

Use exact current labels.

============================================================
I. SUCCESS ENVELOPE — 11a-1
============================================================

Organizer-tested successful responses must match:

{
  data: ...,
  meta: ...
}

Read exact test.

For every representative success route:

- `data` must exist;
- `meta` must exist;
- preserve the existing data payload semantics;
- preserve status code.

Do not add:
- top-level `success`;
- top-level `message`;
- duplicate payload outside `data`.

============================================================
J. META SHAPE
============================================================

Read current test.

If simple routes expect:

meta: {}

use that.

If paginated routes legitimately have:

meta: {
  nextCursor,
  hasMore
}

preserve it.

Envelope consistency does NOT mean forcing every route's meta to empty.

Do not delete meaningful pagination metadata merely to satisfy the shape.

============================================================
K. DO NOT DOUBLE-WRAP SUCCESS RESPONSES
============================================================

Before editing any route, inspect current output.

Already correct:

{
  data: {...},
  meta: {}
}

must NOT become:

{
  data: {
    data: {...},
    meta: {}
  },
  meta: {}
}

Fix only routes missing the standard envelope.

Prefer narrow helpers only if they improve consistency without forcing a broad rewrite.

============================================================
L. ERROR ENVELOPE — 11a-2
============================================================

Organizer-tested errors must match:

{
  error: {
    code: string,
    details: array
  }
}

Preserve:
- actual HTTP status;
- actual business error code.

Do not convert every business error to one generic code merely for envelope shape.

============================================================
M. ERROR DETAILS
============================================================

Read exact tests and current conventions.

`details` should be an array.

Do not return:
- raw Error;
- stack;
- SQL;
- local filesystem path;
- request body;
- secret values.

Task 9 safety rules remain in force.

============================================================
N. CENTRAL VS ROUTE-SPECIFIC ERROR FIXES
============================================================

Prefer fixing a shared central error formatting defect when:
- multiple tested families fail for the same reason;
- doing so does not change intentionally custom statuses/codes.

Do NOT globally rewrite all errors blindly.

Some controllers may already return correct business envelopes directly.

Avoid:
- double formatting;
- “headers already sent” errors;
- changing valid 201/204 flows.

============================================================
O. REPRESENTATIVE ROUTE FAMILIES
============================================================

Read exact Challenge 11 family list.

Possible families may include:
- assets;
- auth;
- ledger;
- settlement;
- orders;
- risk;
- market data;
- operations.

These are examples only.

Only claim the exact families that the current organizer test exercises.

For each family create:

family
| success route
| error route
| current shape
| required fix

============================================================
P. 204 / NO-CONTENT RESPONSES
============================================================

Do not force a JSON success envelope onto a route that the current contract intentionally specifies as HTTP 204 with no body unless Challenge 11 explicitly tests it.

Envelope consistency applies to the organizer-selected representative responses.

Do not violate HTTP semantics unnecessarily.

============================================================
Q. API VERSIONING — ONE ROUTE TREE
============================================================

Challenge 11c requires supported endpoints under both:

/api
/api/v1

Use the SAME router tree/business implementation.

Strong pattern:

const apiRouter = Router()

apiRouter.use(...existing route families...)

app.use("/api", apiRouter)
app.use("/api/v1", apiRouter)

However, inspect current server architecture first.

Do not blindly duplicate middleware or create recursive mounting.

============================================================
R. AVOID DUPLICATED CONTROLLERS
============================================================

Do NOT create:

- `ledgerRoutesV1.ts`
- `orderControllerV1.ts`
- duplicated business handlers

just to mirror `/api`.

The two prefixes must reuse the same handlers so they cannot drift.

============================================================
S. HMAC / ORIGINAL URL COMPATIBILITY
============================================================

Task 5 HMAC canonicalization uses the exact request path/originalUrl.

Versioned requests have a different path string.

Do NOT strip `/v1` before HMAC verification in a way that invalidates correctly signed versioned requests unless current signing contract/test says so.

Read:
- HMAC middleware;
- Challenge 11 auth/signing setup.

Preserve exact signed path semantics.

============================================================
T. ROUTER MOUNT ORDER
============================================================

Express mount order matters.

Ensure:

- `/api/v1/...` reaches supported v1 routes;
- `/api/...` still reaches legacy/unversioned routes;
- `/api/v2/...` does NOT accidentally get treated as `/api/...` with a fallback route.

Read current route patterns carefully.

============================================================
U. UNKNOWN VERSION — 11c-2
============================================================

Unsupported version segments must return clean 404.

Examples only:

/api/v2/...
/api/v999/...

Use the exact current test path/version.

Requirements:
- 404;
- standard safe error envelope if test requires;
- no silent routing to `/api`;
- no generic 500;
- no HTML error.

Do not hardcode only `v2` if general unsupported-version detection is simple and safe.

============================================================
V. VERSION DETECTION
============================================================

If explicit guard is needed, make it narrow.

For example, recognize version-like first segments under `/api` and reject unsupported versions before general route fallback.

But avoid rejecting legitimate unversioned route names that happen to begin with "v".

Use the exact route tree and test.

============================================================
W. /api AND /api/v1 RESPONSE PARITY
============================================================

Challenge 11c-1 says same route answers identically.

Compare:
- status;
- body;
- headers only if test asserts them.

Operational fields such as request IDs/timestamps can make bodies differ if included.

Do not add nondeterministic response metadata unless current contract already includes it.

Reuse the same handler.

============================================================
X. CACHE — VERIFY CORE SERVICE FIRST
============================================================

Read:

src/services/cache.ts

Preserve:

- `get(key)` expiry semantics;
- `set(key,value,ttlMs)`;
- TTL in milliseconds;
- `invalidate(key)` deletes exactly one key;
- `clear()` if present.

Do not replace cache with a second implementation.

Task 21 should integrate the existing cache into the exact read/write path from Challenge 11.

============================================================
Y. IDENTIFY EXACT CACHED READ
============================================================

Challenge 11b chooses a specific read endpoint.

Read the test and identify exactly:

- URL;
- query params;
- account/asset/market scope;
- auth context;
- first-read expected metadata/header indicating MISS;
- second-read expected metadata/header indicating HIT;
- underlying repository call.

Do not guess that balance, assets, risk, or book is cached.

Use the actual test.

============================================================
Z. CACHE KEY DESIGN
============================================================

Cache key must include every input that changes the response.

Examples:
- account ID;
- asset;
- market;
- pagination cursor;
- other tested query params.

Do not allow:

account A's result

to be returned for:

account B.

Do not omit a query dimension.

============================================================
AA. AUTH / PERMISSION SCOPE IN CACHE KEY
============================================================

If the response can vary by authenticated principal/role:
- either do not cache it across principals;
- or include the necessary safe authorization scope.

Do not cache authorization decisions.

Never allow cache to bypass middleware.

Auth/ownership checks must still run before serving sensitive cached data unless current architecture guarantees otherwise.

============================================================
AB. CACHE MISS BEHAVIOR — 11b-1
============================================================

On first eligible read:

1. compute canonical key;
2. `cache.get(key)`;
3. if undefined/miss:
   - read actual current source of truth;
   - build the normal response payload;
   - cache the value;
   - return correct MISS indicator if test expects one.

Do not cache before the source read succeeds.

============================================================
AC. CACHE HIT BEHAVIOR — 11b-1
============================================================

On second identical read before expiry/invalidation:

- serve cached value;
- do not re-run unnecessary source read;
- return correct HIT indicator if test expects one;
- response data must be equivalent to miss response.

Do not mutate the cached object when attaching request-specific metadata.

If necessary:
- cache only immutable/data portion;
- construct fresh response envelope each request.

============================================================
AD. FALSY CACHE VALUES
============================================================

Do not use:

if (!cached)

if legitimate cached values can be:
- 0;
- "";
- false;
- empty array;
- null.

Use the cache service's missing sentinel semantics.

============================================================
AE. DO NOT CACHE ERRORS
============================================================

Do not cache:

- 4xx;
- 5xx;
- auth denial;
- account-not-found;
- temporary DB errors

unless the current test explicitly requires negative caching.

Cache successful read data only.

============================================================
AF. CACHE TTL
============================================================

Use an existing cache TTL constant if present.

Do not change TTL just to fit Challenge 11.

Remember:
- TTL is already milliseconds.

Do not multiply by 1000.

Do not use an effectively infinite TTL.

Correct invalidation is required independently of expiry.

============================================================
AG. IDENTIFY EXACT INVALIDATING WRITE
============================================================

Challenge 11b-2 chooses a specific write that changes the cached read.

Read the test and identify:

- exact write endpoint;
- exact entity/cache key affected;
- transaction completion point.

Do not invalidate arbitrary unrelated caches.

============================================================
AH. INVALIDATE AFTER SUCCESSFUL WRITE
============================================================

The affected cache entry must be invalidated after the write has successfully committed/finished.

Strong order:

1. validate/authenticate;
2. execute write;
3. write succeeds/commits;
4. invalidate affected cache key(s);
5. respond success.

Do not invalidate and then later fail the write if avoidable.

Do not leave stale cache after successful write.

============================================================
AI. "VERY NEXT READ" INVARIANT
============================================================

After successful write:

the very next matching read must:
- MISS;
- fetch new source state;
- return updated value;
- populate fresh cache.

No stale grace period.

Do not rely on TTL expiration for write coherence.

============================================================
AJ. CACHE INVALIDATION SCOPE
============================================================

Invalidate all and only logically affected keys.

If one write affects:
- one account+asset;
- multiple views of one entity;
- an aggregate list;

read the test/current architecture and invalidate required dependent keys.

Do not call cache.clear() globally unless the current API intentionally uses whole-cache invalidation and performance remains acceptable.

Task 3 invariant prefers targeted invalidation.

============================================================
AK. CONCURRENT READ/WRITE CAUTION
============================================================

Think through:

read miss starts
write commits + invalidates
old read finishes and sets stale value

This can reintroduce stale data after invalidation.

If current Challenge 11 concurrency does not test this, avoid unnecessary complexity.

If the actual test or current architecture exposes this race:
- use a generation/version token or ordering strategy.

Do not add complex locking without evidence.

============================================================
AL. VERSIONED CACHE KEYS
============================================================

If `/api` and `/api/v1` use identical business response:
do not accidentally create inconsistent caches just because `req.originalUrl` differs.

Prefer cache key based on business resource parameters, not raw version prefix, unless test expects separate caches.

This preserves API parity.

============================================================
AM. CACHE HIT/MISS META WITHOUT DATA DRIFT
============================================================

Read exact test.

If it expects something like:

meta.cache = "HIT" / "MISS"

construct meta per request.

Do not include the HIT/MISS field inside the cached value itself if that would make the second response claim MISS.

Cache the stable data, not request-local cache-state metadata.

============================================================
AN. LATENCY TEST — READ FIRST
============================================================

Read Challenge 11d-1 completely.

Record:

- exact route;
- setup state;
- auth requirements;
- warm-up request count;
- measured request count;
- measured statistic:
  - total;
  - mean;
  - max;
  - percentile;
- exact threshold;
- whether cache is expected to help.

Do not optimize from the challenge title alone.

============================================================
AO. MEASURE BEFORE OPTIMIZING
============================================================

Run:

npm test challenge11.test.ts -t "Challenge 11d"

Record real baseline.

If it already passes:
- do not perform speculative performance refactors.

If it fails:
profile the exact measured path.

============================================================
AP. LATENCY OPTIMIZATION PRIORITY
============================================================

Prefer safe optimizations in this order:

1. remove obviously repeated work in the measured read;
2. ensure cache hit avoids DB work if Challenge 11 design expects caching;
3. reuse existing DB connection/Knex;
4. avoid repeated serialization/transformation;
5. ensure no synchronous debug logging of large objects;
6. ensure Task 20 operational middleware is lightweight;
7. improve missing DB index/query only if schema/index already supports a non-migration fix.

Do not jump to broad architecture changes.

============================================================
AQ. NO BENCHMARK CHEATS
============================================================

Do NOT:

- detect request count and shortcut after N calls;
- return stale precomputed organizer fixture;
- bypass auth only in benchmark;
- disable logging/metrics only in test environment;
- change threshold;
- increase timeout;
- fake elapsed time;
- monkey-patch Date/performance APIs.

Optimize real code.

============================================================
AR. LOGGING / METRICS PERFORMANCE
============================================================

Task 20 structured logging and metrics run on requests.

Do not remove them merely to pass latency.

If they are unexpectedly expensive:
- keep required behavior;
- reduce avoidable object allocation/work;
- do not log request bodies.

Operational functionality must remain passing.

============================================================
AS. RESPONSE ENVELOPE AND CACHE ORDER
============================================================

A good pattern:

repository/domain data
-> cache stable business data
-> build standardized `{ data, meta }` response

Avoid caching entire Express responses.

Do not cache:
- response object;
- status object;
- request ID;
- dynamic operational metadata.

============================================================
AT. CACHE + ERROR ENVELOPE
============================================================

Cache miss source errors must flow through the same standard error handling as uncached requests.

Do not catch repository error and return fake cached empty success.

============================================================
AU. NOT-FOUND HANDLING
============================================================

Unknown API routes and unsupported versions should use the standard safe 404.

Read current central not-found middleware.

Do not:
- silently redirect;
- answer 200 with empty data;
- return Express default HTML.

============================================================
AV. API PREFIX STRUCTURE
============================================================

Inspect current app architecture.

If routes are individually mounted like:

app.use("/api/assets", assetsRoutes)
app.use("/api/ledger", ledgerRoutes)
...

consider extracting/mounting one shared `apiRouter`.

But keep refactor minimal.

Alternative:
mount each same route module under both prefixes.

Whichever approach:
- one handler implementation;
- no duplicate controller logic;
- route order correct;
- Task 20 `/api/metrics` behavior preserved.

============================================================
AW. /health AND /ready
============================================================

These are operational root routes from Task 20.

Do not automatically create:
- `/api/health`;
- `/api/v1/health`

unless current Challenge 11 explicitly expects them.

Versioning requirement applies to the tested API routes.

Preserve Task 20 root probe contracts.

============================================================
AX. /api/metrics VERSIONING
============================================================

Read the Challenge 11 representative route selection.

Do not assume `/api/metrics` must have `/api/v1/metrics` parity unless the current route tree/test includes it.

If all API routes are mounted under shared router, ensure behavior is coherent and does not break Task 20.

============================================================
AY. RESPONSE STATUS CODES
============================================================

Envelope fixes must not flatten status semantics.

Preserve:
- 200;
- 201;
- 204;
- 400;
- 401;
- 403;
- 404;
- 409;
- 413;
- 422;
- 429;
- 503

according to existing contracts.

Do not return 200 for an error merely to simplify envelopes.

============================================================
AZ. SERIALIZATION / BIGINT
============================================================

Do not introduce native BigInt into JSON responses.

Continue serializing exact monetary values as strings.

Envelope work must preserve prior exact-money response formats.

============================================================
BA. PAGINATION
============================================================

For statement/paginated routes:

preserve:

meta.nextCursor
meta.hasMore

and other current fields.

Do not move them into `data` if current contract expects meta.

Do not drop pagination metadata for 11a consistency.

============================================================
BB. ROUTE FAMILY OWNERSHIP / RBAC
============================================================

Envelope/version changes must not bypass middleware.

When reusing route modules under `/api/v1`:
- preserve JWT/HMAC/RBAC/account ownership middleware;
- preserve middleware order.

Do not mount versioned routes around security middleware incorrectly.

============================================================
BC. HMAC SIGNATURE PATH
============================================================

If tests sign `/api/v1/...`, signature verification must use the exact path that the client signed.

Do not canonicalize:
`/api/v1/x`
to
`/api/x`

inside HMAC unless current contract says so.

Version aliasing is routing-level, not signature-forgery compatibility.

============================================================
BD. TASK 20 RATE LIMIT
============================================================

If login route becomes available under `/api/v1` through shared router:
ensure the Task 20 login limiter still applies exactly as intended.

Do not create an un-rate-limited alternate login path accidentally.

============================================================
BE. TASK 20 METRICS COUNTING
============================================================

Versioned requests are real traffic.

Task 20 metrics/logging should continue to observe them.

Do not mount `/api/v1` outside global observability middleware.

============================================================
BF. EXPECTED TASK 21 FILE SCOPE
============================================================

Likely:

- src/server.ts
- exact route modules/controllers identified by challenge11
- src/services/cache.ts only if a real remaining service defect exists
- exact repository/controller read/write path used by 11b

Possible shared helpers:
- response/envelope helper if already present or minimally justified
- api router composition helper

Create/update:

- docs/clearhouse-task-21-api-cache-performance.md

Do NOT add tests.

Do NOT modify migrations/config/package files.

============================================================
BG. DO NOT REWRITE EVERY CONTROLLER
============================================================

Challenge 11 uses representative routes.

Fix shared abstractions where safe, but avoid a large all-controller formatting rewrite unless the current tests show broad inconsistency.

Nine-hour challenge principle:
- minimum coherent fix;
- maximum regression safety.

============================================================
BH. TYPE SAFETY / QUALITY
============================================================

Maintain strict TypeScript.

Avoid:

- any;
- @ts-ignore;
- Express request/response monkey patches;
- route duplication;
- raw res object caching;
- cache key collisions;
- global cache.clear after every write;
- swallowed errors;
- benchmark-specific shortcuts.

Prefer:

- shared router reuse;
- stable cache keys;
- stable cached business data;
- explicit response helpers if needed;
- targeted invalidation;
- measured optimization.

============================================================
BI. REQUIRED VERIFICATION — CHALLENGE 11
============================================================

After implementation:

npm run typecheck

Then:

npm test challenge11.test.ts

This is the PRIMARY Task 21 gate.

If labels exist:

npm test challenge11.test.ts -t "Challenge 11a"
npm test challenge11.test.ts -t "Challenge 11b"
npm test challenge11.test.ts -t "Challenge 11c"
npm test challenge11.test.ts -t "Challenge 11d"

Record actual counts/results.

============================================================
BJ. CACHE FOUNDATION REGRESSION
============================================================

Because Task 21 uses cache:

run the actual Task 7 cache-focused organizer labels from:
- challenge00b.test.ts
- challenge00c.test.ts

Also run:

npm test challenge00.test.ts

This confirms Task 3 `invalidate()` remains correct.

Do not invent filters; inspect current labels.

============================================================
BK. OBSERVABILITY REGRESSION
============================================================

Run:

npm test challenge10.test.ts

Task 21 server/router work must not break:
- health;
- ready;
- logging;
- metrics;
- login limiter.

============================================================
BL. SECURITY / AUTH REGRESSION
============================================================

Run:

npm test challenge01.test.ts

Run relevant Task 9/security tests if current server/error/router files were touched:

npm test challenge07.test.ts -t "Challenge 7d|Challenge 7e"

Use current labels.

============================================================
BM. BUSINESS REGRESSION
============================================================

Run:

npm test challenge13.test.ts
npm test challenge09.test.ts
npm test challenge05.test.ts
npm test challenge04.test.ts
npm test challenge03.test.ts
npm test challenge02.test.ts
npm test _sanity.test.ts

Then:

git diff --check

Finally:

npm test

Record Task 22+ failures honestly.

============================================================
BN. FAILURE DIAGNOSIS — 11a
============================================================

If success envelope fails:
- inspect exact route;
- check missing `meta`;
- check data is returned bare;
- check double-wrapping.

If error envelope fails:
- check route-local response bypasses central handler;
- check `details` missing/not array;
- check Express HTML 404;
- check raw error serialization.

Preserve status/error code.

============================================================
BO. FAILURE DIAGNOSIS — 11b
============================================================

If second read is still MISS:
- key mismatch;
- TTL too short/unit bug;
- cache module recreated per request;
- cache set not reached.

If second read says HIT but source still queried:
- hit path does not return early.

If write followed by stale read:
- wrong key invalidated;
- invalidation before/after wrong boundary;
- cached response mutation;
- write path forgot invalidate.

Do not solve stale read by setting TTL to 0.

============================================================
BP. FAILURE DIAGNOSIS — 11c
============================================================

If `/api/v1` 404s:
- route tree not mounted there;
- path concatenation error;
- auth middleware mounted incorrectly.

If unknown version succeeds:
- generic API router is swallowing version segment;
- fallback/parameterized route too broad.

If `/api` and `/api/v1` differ:
- duplicate handlers;
- request path affects business data/meta;
- version-specific middleware drift.

============================================================
BQ. FAILURE DIAGNOSIS — 11d
============================================================

If latency fails:
- run focused 11d multiple times only after a real change;
- identify DB calls/cache misses;
- inspect excessive logging;
- inspect repeated expensive transformations;
- inspect connection setup per request.

Do not repeatedly run full suite during micro-optimization.

Do not disable required middleware.

============================================================
BR. TEST REPORTING
============================================================

For every command record:

- exact command;
- exit code;
- executed;
- passed;
- failed;
- not exercised;
- root cause.

For latency:
- record threshold;
- actual organizer output;
- route;
- measured request count.

Filtered-out tests are NOT passed.

Do not edit test-results.xml.

============================================================
BS. TASK 21 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-21-api-cache-performance.md

Include:

1. Starting commit.
2. Working branch task-21.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 11 test count.
6. 90-point score map.
7. Representative success route families.
8. Representative error route families.
9. Success envelope fixes.
10. Error envelope fixes.
11. Pagination/meta preservation.
12. Shared router/versioning design.
13. `/api` behavior.
14. `/api/v1` behavior.
15. unsupported-version behavior.
16. HMAC/security middleware preservation.
17. Exact cached read route.
18. Cache key structure.
19. Cached value structure.
20. MISS behavior.
21. HIT behavior.
22. TTL used.
23. Exact invalidating write.
24. Invalidation timing.
25. Very-next-read freshness proof.
26. Cache foundation regressions.
27. Exact latency route.
28. Latency threshold.
29. Baseline timing.
30. Optimization made, if any.
31. Post-change timing.
32. Task 20 observability regression.
33. Exact files changed.
34. Typecheck.
35. 11a result.
36. 11b result.
37. 11c result.
38. 11d result.
39. full Challenge 11 result.
40. Challenge 10 result.
41. Challenge 01/security results.
42. business regressions.
43. sanity/full-suite.
44. protected-file confirmation.
45. suggested commit.
46. master merge/push workflow.
47. next Task 22: Operator Dashboard + Browser Signing.

Do not include secrets.

============================================================
BT. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat

Review actual Task 21 files.

Likely:

git diff -- src/server.ts
git diff -- src/services/cache.ts
git diff -- docs/clearhouse-task-21-api-cache-performance.md

Then review actual route/controller/repository files identified by `challenge11.test.ts`.

Do not blindly review/stage every controller.

Confirm:

- organizer tests unchanged;
- config unchanged;
- package unchanged;
- migrations/seeds unchanged;
- no test-detection;
- no cache TTL regression;
- no cache.clear abuse;
- no route duplication;
- no HMAC/auth bypass;
- no Task 20 operational regression;
- no Task 22 dashboard work.

============================================================
BU. TASK 21 COMPLETION CRITERIA
============================================================

Task 21 is COMPLETE only when:

DISCOVERY

[ ] challenge11 read completely.
[ ] exact test count recorded.
[ ] exact route families identified.
[ ] exact cached read identified.
[ ] exact invalidating write identified.
[ ] exact latency route/threshold identified.

ENVELOPES

[ ] tested successes have `{ data, meta }`.
[ ] tested errors have `{ error: { code, details } }`.
[ ] details is correct type.
[ ] statuses preserved.
[ ] no double wrapping.
[ ] pagination meta preserved.
[ ] no raw error/HTML leakage.

VERSIONING

[ ] `/api` continues to work.
[ ] `/api/v1` uses same business handlers.
[ ] `/api` and `/api/v1` tested response parity passes.
[ ] middleware/security preserved.
[ ] unsupported version returns 404.
[ ] unsupported version does not silently fall back.
[ ] no duplicate controller implementation.

CACHE

[ ] first read MISS.
[ ] second identical read HIT.
[ ] cache key includes all response-changing dimensions.
[ ] auth-sensitive data not leaked across principals.
[ ] successful data only cached.
[ ] Task 7 TTL milliseconds preserved.
[ ] Task 3 targeted invalidation preserved.
[ ] successful write invalidates affected key(s).
[ ] very next read is fresh.
[ ] updated value is cached again.
[ ] no global clear unless explicitly justified.
[ ] cached business data does not contain request-local HIT/MISS meta.

LATENCY

[ ] exact organizer benchmark understood.
[ ] baseline measured.
[ ] no benchmark-specific branch.
[ ] no timeout/threshold change.
[ ] real route stays within required budget.
[ ] Task 20 logging/metrics preserved.

REGRESSION

[ ] typecheck passes.
[ ] Challenge 11 passes.
[ ] Challenge 10 passes.
[ ] Challenge 01 passes.
[ ] cache foundation regressions pass.
[ ] security regression recorded.
[ ] business regressions recorded.
[ ] sanity passes.
[ ] full suite recorded honestly.
[ ] tests/config/package/migrations unchanged.
[ ] Task 21 note created.
[ ] final Git target master.

If any current Challenge 11 test remains failing:
- status = PARTIAL;
- state exact failing test/root cause.

============================================================
BV. FINAL CURSOR REPORT
============================================================

Return:

1. Task 21 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact changed files.
5. Current Challenge 11 test count.
6. Success envelope changes.
7. Error envelope changes.
8. Tested route families.
9. Versioning router design.
10. `/api` vs `/api/v1` parity.
11. Unsupported-version handling.
12. Exact cached read.
13. Cache key.
14. Cached value shape.
15. MISS/HIT implementation.
16. Exact invalidating write.
17. Invalidation timing.
18. Next-read freshness behavior.
19. Exact latency route.
20. Latency threshold.
21. Baseline latency result.
22. Optimization, if any.
23. Final latency result.
24. Typecheck.
25. Challenge 11a result.
26. Challenge 11b result.
27. Challenge 11c result.
28. Challenge 11d result.
29. Full Challenge 11 result.
30. Cache foundation regression.
31. Challenge 10 result.
32. Challenge 01/security result.
33. business regressions.
34. sanity.
35. full-suite result.
36. remaining future failures.
37. confirmation protected files unchanged.
38. final diff summary.
39. reviewed Git commands targeting master.

Suggested commit:

feat: unify API versioning and cache behavior

Do not automatically commit, merge, or push.
````

---

# Task 21 reference acceptance matrix

| Area | Required behavior |
|---|---|
| Success envelope | `{ data, meta }` |
| Error envelope | `{ error: { code, details } }` |
| Status codes | Preserve existing semantics |
| `/api/...` | Supported |
| `/api/v1/...` | Same behavior |
| Unsupported version | Clean 404 |
| Route implementation | Shared, not duplicated |
| First cached read | MISS |
| Second identical read | HIT |
| Cache TTL | Milliseconds |
| Write | Invalidates affected cache |
| Next read | Fresh updated value |
| Cache key | Correct resource scope |
| Latency | Within exact organizer budget |
| Benchmark hacks | Forbidden |
| Task 20 ops | Preserved |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 21

Official final branch:

**`master`**

Workflow:

**`master` → `task-21` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 21 branch

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
task-21
```

Official final branch:

```text
master
```

---

## 2. Final Task 21 verification

```powershell
npm run typecheck

npm test challenge11.test.ts

npm test challenge10.test.ts

npm test challenge01.test.ts

npm test challenge00.test.ts

npm test challenge13.test.ts

npm test challenge09.test.ts

npm test challenge05.test.ts

npm test challenge04.test.ts

npm test challenge03.test.ts

npm test challenge02.test.ts

npm test _sanity.test.ts

git diff --check
```

If current group labels exist:

```powershell
npm test challenge11.test.ts -t "Challenge 11a"

npm test challenge11.test.ts -t "Challenge 11b"

npm test challenge11.test.ts -t "Challenge 11c"

npm test challenge11.test.ts -t "Challenge 11d"
```

Run the exact Task 7 cache-focused filters discovered from current organizer tests.

Security-focused regression if relevant:

```powershell
npm test challenge07.test.ts -t "Challenge 7d|Challenge 7e"
```

Then:

```powershell
npm test
```

---

## 3. Review Task 21 changes

```powershell
git status --short
git diff --stat
```

Always review:

```powershell
git diff -- docs/clearhouse-task-21-api-cache-performance.md
```

Review `src/server.ts` if changed:

```powershell
git diff -- src/server.ts
```

Review cache service if changed:

```powershell
git diff -- src/services/cache.ts
```

Then review each actual route/controller/repository file changed for Challenge 11.

Do not assume file names.

---

## 4. Stage only Task 21 files

Always stage the engineering note if created:

```powershell
git add -- docs/clearhouse-task-21-api-cache-performance.md
```

Only if changed:

```powershell
git add -- src/server.ts
git add -- src/services/cache.ts
```

Stage actual Challenge 11 route/controller/repository files individually:

```powershell
git add -- "<actual-task21-file-path>"
```

Do not paste the placeholder literally.

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

Stop if staged content unexpectedly contains:

- tests/
- config/
- package files
- migrations
- seeds
- .env
- .gitignore
- unrelated work.

---

## 6. Commit Task 21

```powershell
git commit -m "feat: unify API versioning and cache behavior"
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

## 8. Merge Task 21

Prefer:

```powershell
git merge --ff-only task-21
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-21
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
npm test challenge11.test.ts
npm test challenge10.test.ts
git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge01.test.ts
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

If safe for the local-only Task 21 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge11.test.ts
npm test challenge10.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts deliberately.

---

# Fast Task 21 checklist

- [ ] branch = task-21
- [ ] final branch = master
- [ ] challenge11 fully read
- [ ] exact route families identified
- [ ] success envelopes consistent
- [ ] error envelopes consistent
- [ ] no double wrapping
- [ ] statuses preserved
- [ ] pagination meta preserved
- [ ] `/api` works
- [ ] `/api/v1` works
- [ ] shared handlers/router
- [ ] unsupported version clean 404
- [ ] no silent fallback
- [ ] auth/HMAC preserved
- [ ] exact cached read identified
- [ ] cache key correct
- [ ] first read MISS
- [ ] second identical read HIT
- [ ] cache stable data, not request-local meta
- [ ] no errors cached
- [ ] TTL milliseconds preserved
- [ ] exact write invalidates cache
- [ ] invalidation after successful write
- [ ] next read fresh
- [ ] Task 3 invalidate semantics preserved
- [ ] exact latency route identified
- [ ] exact threshold identified
- [ ] baseline measured
- [ ] no benchmark hack
- [ ] final benchmark passes
- [ ] Challenge11 passes
- [ ] Challenge10 passes
- [ ] cache regressions pass
- [ ] Challenge01/security pass
- [ ] sanity passes
- [ ] full suite recorded
- [ ] no organizer tests modified
- [ ] no new tests added
- [ ] config/package/migrations unchanged
- [ ] Task 21 note created
- [ ] committed on task-21
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 22 — Challenge 12: Operator Dashboard and Browser Signing.
