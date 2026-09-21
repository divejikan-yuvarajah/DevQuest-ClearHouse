# ClearHouse — Complete Enhanced Cursor Prompt for Task 25

**Task:** Challenge 19 — API Documentation (OpenAPI / Swagger)  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-25`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 25 purpose

Task 25 implements **Challenge 19 — API Documentation (OpenAPI / Swagger)**.

The documentation must describe the **real API that exists in the current checkout after Tasks 1–24**.

This task is not “make a Swagger-looking page.” The organizer validates:

- the OpenAPI document with a real validator;
- every `$ref`;
- exact API route coverage;
- absence of nonexistent documented routes;
- unique operation IDs;
- summaries/tags;
- path parameters;
- request body schemas;
- integer-string financial amounts;
- enums;
- idempotency headers;
- response schemas against real API responses;
- the shared error envelope;
- Swagger UI HTML;
- a docs-only CSP relaxation while all other routes remain locked down.

The current runtime route tree is the source of truth.

Do not copy an old route list from `Challenges.md` and assume it is complete.

---

# Published Challenge 19 contract — 185 points

## 19a — A valid OpenAPI document — 30 pts

### 19a-1 — 10 pts

`GET /api/openapi.json`

serves an **OpenAPI 3** document with:

- `openapi`;
- `info.title`;
- `info.version`;
- at least one `servers` entry according to the exact organizer test.

### 19a-2 — 20 pts

The document passes a **real OpenAPI validator**, including:

- all `$ref` targets;
- legal schema shapes;
- legal parameter definitions;
- legal response definitions;
- no dangling components;
- valid OpenAPI 3 syntax/semantics.

---

## 19b — Coverage and accuracy — 75 pts

### 19b-1 — 25 pts

Every operation the API actually serves is documented under its **exact path template**.

Examples of exactness:

- `/api/orders/{id}` rather than `/api/orders/:id`;
- method must be correct;
- route prefix/version handling must match what the organizer considers part of the documented API.

Read `tests/challenge19.test.ts` for the exact route inventory algorithm.

### 19b-2 — 15 pts

The document must not advertise operations that the real API does not serve.

No stale/future/fabricated endpoints.

### 19b-3 — 20 pts

Every documented operation must have:

- a real nonempty `summary`;
- a `tag`;
- a globally unique `operationId`;
- at least one success response;
- every path-template parameter declared correctly.

### 19b-4 — 15 pts

API operations document the standard error envelope through a **shared component**.

Use the real Task 21 / Task 9 error contract:

```json
{
  "error": {
    "code": "SOME_CODE",
    "details": []
  }
}
```

Do not duplicate a slightly different inline error schema on every operation if the organizer expects a shared component reference.

---

## 19c — Request and response schemas — 55 pts

### 19c-1 — 30 pts

Request bodies must accurately describe:

- required fields;
- enum values;
- financial integer-string amounts;
- field types/formats;
- idempotent calls' `Idempotency-Key` header.

Do not document money as JavaScript/OpenAPI floating `number` if the real API accepts exact minor-unit integer strings.

### 19c-2 — 25 pts

Documented response schemas must match what the API **really returns**.

This includes:

- Task 21 success envelope;
- current response field names;
- exact string-vs-number types;
- arrays/objects;
- pagination/meta where applicable;
- current API behavior after Tasks 1–24.

Do not document aspirational future responses.

---

## 19d — Swagger UI — 25 pts

### 19d-1 — 10 pts

`GET /api/docs`

serves an HTML page that loads Swagger UI against the OpenAPI document.

Read the organizer test for:

- required HTML markers;
- document URL;
- bundle/style references;
- initialization shape.

### 19d-2 — 15 pts

The docs page relaxes the **Content-Security-Policy only enough to run Swagger UI**, while every other route remains protected by the strict global CSP.

Task 3 / Task 9 global policy must remain locked down.

Do **not** loosen CSP globally.

---

# Challenge 19 score map

```text
19a = 30
19b = 75
19c = 55
19d = 25
----------------
Total = 185 points
```

These are available points, not an earned-score claim.

---

# Critical Task 25 principle — runtime route tree is authoritative

Tasks 21 and 23 added/changed API routing, including:

- API version aliases;
- accounts API;
- operational endpoints.

Later tasks may also have already supplied routes from earlier challenges.

Therefore:

1. Read `tests/challenge19.test.ts`.
2. Read `src/server.ts`.
3. Read every mounted router and its route definitions.
4. Build the exact organizer route inventory.
5. Only then create/fix the OpenAPI `paths`.

Do not manually copy the challenge titles into a spec and call it complete.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 25

Copy the entire block below into Cursor Agent mode.

````text
Act as my senior TypeScript/Express API architect, OpenAPI reviewer, security-header engineer, and fintech schema reviewer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 25 ONLY: implement Challenge 19 — API Documentation / OpenAPI / Swagger — completely and accurately.

Preserve all completed Tasks 1–24.

Your job is to:
- serve a valid OpenAPI 3 document at /api/openapi.json;
- document every real API operation and no nonexistent operation;
- describe real request/response schemas;
- model exact integer-string money correctly;
- model required enums and headers;
- reference a shared standard error schema;
- serve Swagger UI at /api/docs;
- relax CSP only for /api/docs and leave every other route locked down.

Do not redesign business APIs merely to make documentation easier.

Do not stop at a plan. Inspect, implement, run organizer tests/regressions, create the Task 25 engineering note, and show reviewed Git commands.

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

task-25

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–24;
- work on task-25;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT TASK 25 SCOPE
============================================================

IMPLEMENT:

Challenge 19a:
- GET /api/openapi.json;
- valid OpenAPI 3 document;
- info title/version/server;
- validator-clean references/document.

Challenge 19b:
- exact operation coverage;
- no fake operations;
- summary/tag/operationId;
- path parameter declarations;
- shared standard error component.

Challenge 19c:
- accurate request bodies;
- required fields;
- enums;
- exact integer-string money;
- Idempotency-Key declarations;
- real response schemas.

Challenge 19d:
- GET /api/docs;
- Swagger UI loading the real OpenAPI document;
- route-specific CSP sufficient for docs;
- global strict CSP preserved everywhere else.

PRESERVE:
- all API behavior Tasks 1–24;
- Task 21 envelopes/versioning;
- Task 20 security/ops;
- Task 9 error/security behavior;
- Task 3 global CSP;
- Task 5/6 auth/signing.

DO NOT IMPLEMENT:
- Task 26 event sourcing/replay;
- Task 27 market data changes;
- Task 28 fees;
- Task 29 netting;
- Task 30 strategies;
- Task 31 WebSockets;
- Task 32 live client;
- Task 33 integration;
- business endpoint rewrites unrelated to docs.

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

Do NOT install:
- swagger-ui-express;
- swagger-jsdoc;
- OpenAPI generators;
- YAML parsers;
- schema generators

because package files are protected and the challenge can be implemented with current dependencies / static TypeScript objects and HTML.

If a Swagger/OpenAPI library is ALREADY installed:
inspect whether current starter intended it.
Do not add/update packages.

Do NOT:
- skip tests;
- weaken route coverage checks;
- alter validator settings;
- change CSP tests;
- add test-environment branches.

Do NOT add production code checking:
- NODE_ENV === "test";
- VITEST;
- test file names;
- known expected route arrays;
- known validator result.

No destructive Git:
- no reset --hard;
- no clean -fd;
- no force push;
- no history rewriting.

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

Verify Task 24 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-24 exists:

git log --oneline --decorate --max-count=10 task-24

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-25

If task-25 already exists:

git branch --list task-25
git log --oneline --decorate --max-count=10 task-25

Do not delete/recreate blindly.

Record:
- starting commit;
- current branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
E. VERIFY TASK 25 PREREQUISITES
============================================================

Read if present:

- docs/clearhouse-task-03-infrastructure.md
- docs/clearhouse-task-09-input-security.md
- docs/clearhouse-task-20-observability-operations.md
- docs/clearhouse-task-21-api-cache-performance.md
- docs/clearhouse-task-23-demo-seed-accounts-api.md
- docs/clearhouse-task-24-portfolio-risk-trades-dashboard.md

Verify source, not only notes.

Read:
- src/server.ts
- src/middleware/securityHeaders.ts
- every route file under src/routes/
- every controller referenced by those routes
- central error handler
- auth/HMAC middleware
- enum/domain request types used by controllers.

Before editing:

npm run typecheck
npm test challenge11.test.ts
npm test challenge10.test.ts
npm test challenge07.test.ts -t "Challenge 7e"

Use actual labels if different.

These establish:
- current route/API shape;
- operational middleware;
- strict security headers.

============================================================
F. READ CHALLENGE 19 COMPLETELY BEFORE SOURCE EDITS
============================================================

Read:

tests/challenge19.test.ts

from first line to last line.

Read:

config/scores.ts

READ ONLY.

Build a matrix:

test
| points
| exact assertion
| route/spec field
| implementation file
| current state

Record:
- exact test count;
- exact OpenAPI version expectation;
- exact `info` requirements;
- exact `servers` assertion;
- route inventory source;
- whether `/api/v1` aliases are expected in docs;
- whether `/health`, `/ready`, `/api/metrics`, `/api/docs`, `/api/openapi.json` are included/excluded in route coverage;
- exact response-schema samples used;
- exact required error statuses/components;
- exact Swagger UI HTML markers;
- exact CSP assertions.

DO NOT guess any of these.

============================================================
G. RUN TASK 25 BASELINE
============================================================

Run:

npm test challenge19.test.ts

Record:
- exact tests;
- passed;
- failed;
- exact validator errors;
- exact missing/extra operations;
- schema mismatches;
- docs/CSP failures.

If labels exist:

npm test challenge19.test.ts -t "Challenge 19a"
npm test challenge19.test.ts -t "Challenge 19b"
npm test challenge19.test.ts -t "Challenge 19c"
npm test challenge19.test.ts -t "Challenge 19d"

Use actual labels.

============================================================
H. INVENTORY THE REAL ROUTE TREE
============================================================

Do not begin writing `paths` until this is complete.

Inspect:

src/server.ts

Then every router mounted by it.

Search:

rg -n "app\.(get|post|put|patch|delete)|router\.(get|post|put|patch|delete)|Router\(|app\.use|router\.use" src

PowerShell fallback:

Get-ChildItem -Recurse src -File |
  Select-String -Pattern "app\.(get|post|put|patch|delete)|router\.(get|post|put|patch|delete)|Router\(|app\.use|router\.use"

Build exact table:

HTTP method
| runtime Express path
| OpenAPI template
| controller
| auth middleware
| request body
| path params
| query params
| success status/body
| error statuses
| idempotency
| operation tag

============================================================
I. EXPRESS PATH TO OPENAPI PATH
============================================================

Convert Express path parameters:

:param

to OpenAPI:

{param}

Example:

/api/orders/:id
->
/api/orders/{id}

Every `{param}` appearing in a path must have a corresponding:

parameters:
- in: path
  name: param
  required: true
  schema: ...

Do not document a path parameter that is absent in the path.

============================================================
J. TASK 21 API VERSIONING
============================================================

Task 21 may mount the SAME router under:

/api
/api/v1

Challenge 19 may:
- require both aliases documented;
- normalize aliases;
- exclude one from coverage.

Read the organizer route inventory algorithm.

Do not automatically duplicate every path in docs until you know the test contract.

Whatever the test expects:
- exact supported paths only;
- no unsupported `/api/v2`.

============================================================
K. OPERATION COVERAGE — 19b-1
============================================================

The document must include every organizer-considered real API operation.

Do not forget routes introduced by later Tasks:
- Task 20 operational routes if included;
- Task 23 accounts route;
- any earlier challenge route that exists in source.

Do not assume challenge numbering order corresponds to routes.

Use the real source/test inventory.

============================================================
L. NO EXTRA OPERATIONS — 19b-2
============================================================

Do not document:
- future fees route not yet served;
- WebSocket topics as REST paths;
- planned netting API that does not exist;
- obsolete starter route;
- duplicated alias the test excludes.

An OpenAPI path+method not in the actual route set can fail 19b-2.

Documentation is a contract, not a roadmap.

============================================================
M. DOC ENDPOINT SELF-COVERAGE
============================================================

Read challenge19.

Determine whether these must appear under `paths`:
- GET /api/openapi.json
- GET /api/docs

Do not guess.

If route coverage explicitly excludes documentation infrastructure:
do not include them.

If it includes them:
document them accurately.

============================================================
N. HEALTH / READY COVERAGE
============================================================

Task 20 exposes:

/health
/ready

Read Challenge 19's route scanner.

If it treats only `/api` operations as API-doc scope:
exclude root probes.

If it expects them:
document exact paths.

Do not move the actual probes under `/api` to make docs easier.

============================================================
O. OPENAPI DOCUMENT LOCATION / IMPLEMENTATION
============================================================

Inspect starter code for:
- openapi.ts;
- swagger.ts;
- docs router;
- TODO/NotImplementedError.

Fill the existing intended module if present.

If no module exists, create a focused source file, e.g.:

src/openapi.ts

that exports a plain typed/document object.

Optionally create:
- src/routes/docsRoutes.ts

if it fits current route architecture.

Do not generate the spec dynamically from Express private internals unless the starter/test expects that.

A clear explicit spec object is usually safest in a small competition codebase.

============================================================
P. VALID OPENAPI VERSION
============================================================

Read test.

Use the exact accepted OpenAPI 3 version, typically:

3.0.3

or another current starter-intended value.

Do not use Swagger 2.0.

Do not use a 3.1-only schema keyword if the validator is configured for 3.0.x.

============================================================
Q. INFO OBJECT — 19a-1
============================================================

Provide:
- nonempty title;
- nonempty semantic/project version as expected.

Do not expose:
- package secrets;
- git commit hashes as required runtime metadata unless intended;
- internal credentials.

Read exact assertions.

============================================================
R. SERVERS — 19a-1
============================================================

Provide at least the server entry expected by the organizer.

Read test before choosing:
- `/`;
- `http://localhost:3000`;
- API prefix URL.

Avoid environment-specific hostnames that make docs invalid elsewhere.

Do not include a fake production domain.

============================================================
S. VALIDATOR-FIRST COMPONENT DESIGN
============================================================

Create reusable `components.schemas` for repeated real shapes, such as:
- standard ErrorEnvelope;
- ErrorBody;
- success envelope schemas;
- account/balance;
- orders;
- trades;
- risk;
- ledger responses

only where they actually match current API.

Use `$ref` carefully.

Every `$ref` must resolve.

No circular ref unless validator supports it and needed.

============================================================
T. SHARED ERROR ENVELOPE — 19b-4
============================================================

Define a shared schema, for example conceptually:

components:
  schemas:
    ErrorEnvelope:
      type: object
      required: [error]
      properties:
        error:
          $ref: ...

and:

Error:
  type: object
  required: [code, details]
  properties:
    code:
      type: string
    details:
      type: array
      items: ...

But read current real `details` contents/types from Task 21/current tests.

Do not guess if details items are:
- strings;
- arbitrary objects;
- structured validation details.

Match real behavior.

============================================================
U. SHARED ERROR RESPONSES
============================================================

If the organizer expects a shared error component through:
- `components.responses`;
- or `components.schemas`

read test exactly.

Create the expected reusable structure.

Operations should reference it for relevant non-success statuses.

Do not copy/paste divergent inline error bodies.

============================================================
V. SUCCESS ENVELOPE — TASK 21
============================================================

Task 21 established:

{
  data: ...,
  meta: ...
}

Document real response envelopes.

Do not document bare resource objects if runtime wraps them.

For endpoints intentionally returning:
- 204 no content;
- nonstandard operational body;

document actual behavior.

Do not force runtime changes to match your preferred OpenAPI.

============================================================
W. META SCHEMAS
============================================================

Simple operations may have:

meta: {}

Paginated operations may have:
- nextCursor;
- hasMore;
- other current fields.

Document actual fields/types.

Do not model `meta` as a string or omit it if runtime always returns it and tests compare.

============================================================
X. INTEGER-STRING MONEY — CRITICAL 19c-1
============================================================

Every API financial integer value represented as a JSON string should be modeled as:

type: string

with an integer-string pattern consistent with the real domain, e.g. conceptually:

pattern: '^-?[0-9]+$'

or nonnegative:

pattern: '^[0-9]+$'

depending on actual field rules.

Do NOT document minor-unit money as:

type: number
format: double

Do NOT document arbitrary decimal `"12.34"` if endpoint accepts integer minor units.

Read each controller/domain validator.

============================================================
Y. QUANTITY / PRICE STRING SCHEMAS
============================================================

Read actual API validation.

Some fields may require:
- positive integer strings;
- signed amount strings;
- optional price for market order;
- price required for limit order.

Document the schema accurately enough for organizer checks.

If conditional validation is not required by test/validator:
do not overcomplicate with invalid oneOf structures.

But required fields/enums must be correct.

============================================================
Z. ENUMS — 19c-1
============================================================

Document current accepted enum values from actual source.

Examples may include:
- side;
- order type;
- time-in-force;
- account type;
- role.

Do not:
- invent future enum values;
- omit currently accepted tested values;
- use display labels rather than API literals.

Prefer importing constants/types only if doing so does not create runtime coupling/circular dependencies.

A spec-local readonly array copied from authoritative enum values is acceptable if verified against source.

============================================================
AA. REQUIRED FIELDS
============================================================

For every request body asserted by test:

`required` must match real controller/domain validation.

Do not mark optional:
- required amount;
- required accountId;
- required side

as optional.

Do not mark conditionally absent fields always required if runtime permits omission.

Read exact tests/controllers.

============================================================
AB. ADDITIONAL PROPERTIES
============================================================

Read test/actual API.

Do not set:

additionalProperties: false

everywhere unless runtime actually rejects unknown properties.

OpenAPI must describe actual acceptance.

Task 9 mass-assignment/security rules may influence this.

Do not make docs stricter than runtime without evidence.

============================================================
AC. IDEMPOTENCY-KEY — 19c-1
============================================================

Every idempotent mutation that requires `Idempotency-Key` must document it as a header parameter.

Read current Task 12/controller behavior.

For each relevant operation:

parameters:
- in: header
  name: Idempotency-Key
  required: true
  schema:
    type: string

Use the exact capitalization asserted by test.

Do not document it on operations that do not use it unless harmless/current test permits.

============================================================
AD. AUTHENTICATION HEADERS / SECURITY SCHEMES
============================================================

Read Challenge 19 assertions.

If current OpenAPI is expected to document auth:
model the real mechanisms:
- bearer JWT;
- HMAC headers;
- role requirements as descriptions/tags.

Use OpenAPI `components.securitySchemes` where appropriate.

Do not put actual secrets/tokens in examples.

Do not invent OAuth.

If tests do not require detailed security schemes:
still keep documentation accurate without overengineering.

============================================================
AE. HMAC SIGNING DOCUMENTATION
============================================================

If documenting HMAC-protected endpoints:
describe required headers without exposing the secret.

Do not include:
- real HMAC secret;
- real signature fixture tied to a secret;
- .env data.

If Challenge 19 tests only schemas/routes:
avoid bloating the document.

============================================================
AF. PATH PARAMETERS — 19b-3
============================================================

For every OpenAPI path containing:

{accountId}
{id}
{market}
etc.

declare each parameter:
- `in: path`;
- matching exact name;
- `required: true`;
- real schema type.

Do not declare `required: false` for path params; OpenAPI forbids it.

============================================================
AG. QUERY PARAMETERS
============================================================

Document query parameters where current tests/schema accuracy require:
- cursor;
- limit;
- asset;
- accountId;
- market;
- asOf;
etc.

Use actual types and requirements.

Do not invent filters.

============================================================
AH. OPERATION ID UNIQUENESS — 19b-3
============================================================

Every operation must have a globally unique nonempty `operationId`.

Strong style:

listLedgerAccounts
getLedgerBalance
createOrder
cancelOrder

Do not reuse:
- `get`;
- `create`;
- same operationId across `/api` and `/api/v1` aliases if both must be documented.

If both version aliases are in spec:
operation IDs still must be unique.

Use meaningful stable names.

============================================================
AI. SUMMARY — 19b-3
============================================================

Each operation needs a real human-readable summary.

Not:
- "TODO";
- method+path only;
- empty string.

Keep concise and accurate.

============================================================
AJ. TAGS — 19b-3
============================================================

Assign at least one meaningful tag per operation.

Use consistent route-family tags:
- Authentication
- Ledger
- Settlement
- Orders
- Risk
- Market Data
- Operations

only for actual route families.

Do not create one arbitrary tag per method unless current docs style requires.

============================================================
AK. SUCCESS RESPONSES — 19b-3
============================================================

Each operation needs at least one real success response:
- 200;
- 201;
- 204

matching runtime.

Do not universally document 200.

Read controllers.

For 204:
do not attach a JSON body schema unless runtime sends one.

============================================================
AL. ERROR STATUS RESPONSES
============================================================

Document meaningful current statuses where organizer expects:
- 400
- 401
- 403
- 404
- 409
- 413
- 422
- 429
- 503

depending on operation.

Do not claim an error status impossible for a route merely to pad docs.

Shared error component should match Task 21.

============================================================
AM. RESPONSE SCHEMA REALITY CHECK — 19c-2
============================================================

The test may issue real HTTP requests and compare response structure.

For each sampled operation:
- run/read the real controller result;
- match exact wrapper;
- match exact field types;
- preserve string money;
- preserve nullability/optional fields.

Do not use overly generic:

type: object

for every response if organizer expects actual structure.

============================================================
AN. SCHEMA REQUIRED FIELDS
============================================================

Response schema required fields should match guaranteed runtime fields.

Do not mark optional dynamic fields always required if omitted in valid responses.

Conversely, ensure tested guaranteed fields are required where validator/test expects.

============================================================
AO. NULLABILITY — OPENAPI 3.0
============================================================

If using OpenAPI 3.0.x:
use:

nullable: true

where appropriate.

Do not use JSON Schema 3.1 syntax:

type: ["string", "null"]

unless the chosen OpenAPI version supports it and validator accepts it.

============================================================
AP. FORMAT KEYWORDS
============================================================

Only use formats validators understand appropriately:
- date-time;
- uuid

when real values comply.

Do not label arbitrary IDs as UUID if demo IDs/current API allow other strings.

Incorrect formats can fail example/response validation.

============================================================
AQ. EXAMPLES
============================================================

Examples are optional unless current test requires.

If adding:
- use synthetic safe values;
- no secrets;
- no production data;
- exact integer strings.

Do not let examples contradict schemas.

============================================================
AR. OPENAPI PATH ORDER
============================================================

JSON object order should not matter, but keep deterministic organization.

Group route families consistently.

This helps final review.

Do not rely on object order for correctness.

============================================================
AS. OPENAPI ENDPOINT — /api/openapi.json
============================================================

Serve the in-memory document as JSON.

Use:

res.json(openApiDocument)

or current project response style if test expects raw document.

IMPORTANT:
This endpoint itself likely should NOT wrap the OpenAPI document inside Task 21 `{ data, meta }`, because clients/Swagger validators need the actual OpenAPI root object.

Read Challenge 19 exact assertion.

Do not automatically apply normal API envelope to the spec if test expects:
- body.openapi at root.

============================================================
AT. CACHE HEADERS FOR SPEC
============================================================

Do not add cache complexity unless current project/test expects it.

The spec is static per process.

Correctness first.

No secrets in response.

============================================================
AU. SWAGGER UI — /api/docs
============================================================

Serve HTML with correct:
- doctype;
- charset;
- viewport;
- Swagger UI container;
- CSS;
- JS bundle;
- initialization pointing to `/api/openapi.json`.

Read exact test for required substrings/structure.

Do not serve JSON at `/api/docs`.

============================================================
AV. CDN VS EXISTING LOCAL ASSET
============================================================

Inspect starter code and package dependencies.

If current starter already references a Swagger UI CDN:
use its intended URLs.

If no Swagger UI package is installed and package files are protected:
a minimal CDN-backed page is acceptable if it satisfies current test.

Do not add npm dependencies.

Do not invent inaccessible local `/swagger-ui.css` routes unless you actually serve those files.

============================================================
AW. SWAGGER UI DOCUMENT URL
============================================================

Initialize Swagger UI against exactly the served spec URL expected by test, likely:

/api/openapi.json

Do not point to:
- filesystem;
- external spec;
- `/openapi.json` if actual route is `/api/openapi.json`.

============================================================
AX. SWAGGER HTML SECURITY
============================================================

Do not interpolate untrusted request values into docs HTML.

Use a static constant template.

Do not include secrets/tokens.

Do not add arbitrary inline data from query parameters.

============================================================
AY. GLOBAL CSP MUST REMAIN STRICT
============================================================

Task 3/9 established global:

Content-Security-Policy: default-src 'none'

plus other security headers.

Do NOT change global security middleware to:

default-src *
script-src 'unsafe-eval'
...

That would regress Challenge 7/security.

============================================================
AZ. DOCS-ONLY CSP OVERRIDE — 19d-2
============================================================

The `/api/docs` HTML needs enough CSP to load:
- Swagger CSS;
- Swagger JS;
- fetch `/api/openapi.json`;
- possibly data images/style attributes depending on actual Swagger UI setup.

Override CSP specifically for `/api/docs`.

Do not affect:
- `/api/openapi.json`;
- `/health`;
- `/ready`;
- other APIs;
- dashboard.

Read Challenge 19 exact header assertions before choosing directives.

============================================================
BA. MINIMUM CSP PRINCIPLE
============================================================

Allow only what the docs implementation actually uses.

For a CDN-based page, likely categories may include:
- `default-src 'none'`
- `script-src <exact CDN origin> [plus inline hash/nonce or exact allowed requirement]`
- `style-src <exact CDN origin> ...`
- `img-src data: ...` if needed
- `connect-src 'self'`

These are examples ONLY.

Read exact test and actual HTML.

Avoid:
- wildcard `*`;
- `unsafe-eval` unless genuinely indispensable and explicitly accepted;
- globally broad `default-src`.

============================================================
BB. INLINE SCRIPT CSP
============================================================

If the Swagger initialization is inline, CSP may need:
- an explicit hash;
- nonce;
- or `unsafe-inline`.

Prefer the narrowest solution compatible with the challenge/test and static HTML.

If test expects a specific simple policy, follow it.

Do not introduce complex nonce middleware unless needed.

============================================================
BC. SELF-HOSTED / EXTERNAL CONNECTIVITY
============================================================

The Swagger page's fetch of `/api/openapi.json` is same origin.

Ensure `connect-src 'self'` if CSP requires it.

If test doesn't execute browser network, still produce a policy that would logically work.

============================================================
BD. OTHER SECURITY HEADERS
============================================================

Docs CSP exception must not remove:
- X-Content-Type-Options;
- Referrer-Policy;
- X-Frame-Options

unless actual Swagger UI embedding requirement/test explicitly conflicts.

Only change CSP directive for docs.

Task 9 remains authoritative.

============================================================
BE. SECURITY SCHEME VS CSP ARE DIFFERENT
============================================================

Do not confuse:
- OpenAPI `securitySchemes`
with:
- browser CSP.

Implement each independently.

============================================================
BF. ROUTE ORDER FOR /api/docs
============================================================

Ensure docs route is mounted before a broad unsupported-version/not-found guard that would swallow it, if current server structure requires.

Do not break Task 21 unsupported-version 404 handling.

Test:
- `/api/docs`
- `/api/openapi.json`
- `/api/v2/...`

after changes.

============================================================
BG. ROUTE INVENTORY AND DOCUMENTATION ENDPOINT RECURSION
============================================================

If Challenge 19 route scanner observes routes after docs are added:
adding `/api/docs` and `/api/openapi.json` may change the expected set.

Read the organizer code carefully.

Do not get into a loop where spec route coverage expectations are guessed.

Use the exact scanner/exclusion rules.

============================================================
BH. EXACT PATH TEMPLATES
============================================================

OpenAPI path keys should not include query strings.

Correct:
`/api/statements`

and document `cursor` as query parameter.

Incorrect:
`/api/statements?cursor={cursor}`

Likewise path params use `{}`.

============================================================
BI. REQUEST CONTENT TYPE
============================================================

For JSON request bodies:

content:
  application/json:
    schema: ...

Do not use form-data unless actual endpoint does.

For no-body GET/DELETE routes:
do not invent a request body.

============================================================
BJ. REQUIRED REQUEST BODY
============================================================

If endpoint requires JSON body:

requestBody:
  required: true

If optional:
false/omit.

Read actual controller.

============================================================
BK. RESPONSE CONTENT TYPE
============================================================

JSON responses:
- `application/json`.

204:
- no content body.

Swagger docs:
- `text/html`.

OpenAPI endpoint:
- JSON.

Model accurately if documentation endpoint itself is included.

============================================================
BL. ACCOUNT / BALANCE SCHEMA
============================================================

Task 23 added accounts data.

If documented route includes balances:
preserve:
- string amounts;
- actual name/type/status fields;
- balances array;
- total if real API returns it.

Do not document Task 24 UI concepts as backend fields.

============================================================
BM. ORDER SCHEMAS
============================================================

If order routes are documented:
read Tasks 14–17/current controller.

Document current:
- side;
- type;
- time-in-force/execution-policy enums;
- price optionality;
- quantity;
- account/market identifiers;
- response fields.

Do not document future strategy order fields from Task 30 unless route already serves them.

============================================================
BN. SETTLEMENT SCHEMAS
============================================================

If deposit/withdraw/hold/release/settle routes exist:
document exact:
- account;
- asset;
- amount;
- idempotency key where required.

Money = integer string.

Do not claim settlement returns ledger shapes if current controller returns balance/result.

============================================================
BO. LEDGER SCHEMAS
============================================================

Document:
- posting amount signed integer string;
- asset;
- account ID;
- entry IDs/timestamps only if real response includes them.

Trial balance values exact strings if returned via HTTP.

Statements/pagination match real meta/cursor.

============================================================
BP. RISK SCHEMAS
============================================================

Document current risk-limit fields/types and responses.

Do not expose internal mutable maps that are not API output.

If maxOpenOrders is numeric integer at API level, document as integer only if runtime really uses JSON number.

Exact money/exposure values that are strings remain strings.

============================================================
BQ. MARKET DATA SCHEMAS
============================================================

Document market-data endpoint bodies/responses if currently served.

Use current exact price/quantity representations.

Do not implement market data changes (Task 27) just because docs reveal future shortcomings.

Document current route behavior.

============================================================
BR. OPERATIONAL ENDPOINT SCHEMAS
============================================================

If Challenge 19 scope includes:
- metrics;
- health;
- ready

document their actual current outputs.

Do not change Task 20 response bodies to make them prettier.

============================================================
BS. WEBSOCKET NOT REST OPENAPI
============================================================

Challenge 18 WebSocket functionality is not a normal OpenAPI REST path.

Do not document:
`ws://...`
as a fake HTTP GET path unless current Challenge 19 explicitly requires upgrade route representation.

OpenAPI 3 REST document covers actual HTTP operations under the test's inventory.

============================================================
BT. SOURCE OF TRUTH PRIORITY
============================================================

If these disagree:
1. current organizer test;
2. actual current route/controller behavior;
3. Challenge prose;
4. historical GitHub.

Follow 1 and 2.

Do not modify tests.

============================================================
BU. KEEP SPEC MAINTAINABLE
============================================================

Use small helpers to avoid typo repetition if helpful, e.g.:
- successEnvelope(schema);
- errorResponses(...);
- jsonRequest(schema);
- idempotencyHeader();

But helpers must produce plain valid OpenAPI objects.

Do not build a complex generator that obscures route accuracy.

============================================================
BV. NO TYPE-UNSAFE SPEC ESCAPES
============================================================

If TypeScript typing the document is awkward:
use reasonable local interfaces/type annotations.

Do not blanket:
- `as any`;
- `@ts-ignore`
through the spec.

If no OpenAPI TypeScript type package exists, a carefully typed `Record<string, unknown>` structure is acceptable.

Runtime validity is proven by organizer validator.

============================================================
BW. OPENAPI OBJECT IMMUTABILITY
============================================================

The served spec should not be mutated by requests.

Do not append paths dynamically per call.

Return the same stable document data.

Express `res.json` won't mutate it.

============================================================
BX. NO SECRET EXAMPLES
============================================================

Search final spec and docs HTML for:
- HMAC_SECRET;
- JWT_SECRET;
- Authorization sample real token;
- CodeCommit credentials;
- .env values.

Use placeholders/synthetic descriptions only.

============================================================
BY. VALIDATOR ERROR WORKFLOW
============================================================

If 19a-2 fails:

read every validator error.

Fix in order:
1. invalid root/version;
2. broken `$ref`;
3. invalid parameter;
4. invalid response/schema;
5. unsupported schema keyword;
6. duplicate/invalid operation metadata.

Do not suppress validator.

Do not replace spec with `{ openapi, info, paths: {} }` merely to pass structure; coverage tests will fail.

============================================================
BZ. COVERAGE FAILURE WORKFLOW
============================================================

If 19b-1 says missing operations:
compare:
- organizer expected set;
- your spec path+methods.

If 19b-2 says extras:
remove stale/future docs, not real runtime routes.

Do not change runtime routes to fit an incorrect spec unless Challenge 19 exposes an actual Task 21 route defect.

============================================================
CA. REQUEST SCHEMA FAILURE WORKFLOW
============================================================

If 19c-1 fails:
inspect:
- body.required;
- field.required arrays;
- enum literals;
- amount schema type/pattern;
- Idempotency-Key header.

Do not broadly loosen schemas to `additionalProperties: true` to bypass precise assertions.

============================================================
CB. RESPONSE SCHEMA FAILURE WORKFLOW
============================================================

If 19c-2 fails:
capture/read actual tested response and compare:
- wrapper;
- field types;
- required properties;
- arrays;
- null/optional data.

Fix docs.

Prefer changing documentation rather than working production behavior that already passes its challenge.

============================================================
CC. SWAGGER UI FAILURE WORKFLOW
============================================================

If 19d-1 fails:
check:
- Content-Type;
- Swagger UI marker;
- JS/CSS refs;
- initialization target URL;
- HTML actually returned with 200.

Do not add package dependency.

============================================================
CD. CSP FAILURE WORKFLOW
============================================================

If docs won't pass 19d-2:
compare headers:
- `/api/docs`;
- a normal API route.

Normal route must retain locked-down global policy.

Docs route may override only CSP.

Do not modify global securityHeaders to special-case arbitrary referers.

Use route path/server routing.

============================================================
CE. EXPECTED TASK 25 FILE SCOPE
============================================================

Primary likely:
- existing OpenAPI/docs source module if present
- src/server.ts or exact docs route module
- src/middleware/securityHeaders.ts ONLY if a narrow route-aware mechanism is genuinely required

Possible new focused files if starter lacks them:
- src/openapi.ts
- src/routes/docsRoutes.ts

Create/update:
- docs/clearhouse-task-25-openapi-swagger.md

Normally do NOT change:
- business controllers;
- repositories;
- domain logic;
- client dashboard;
- database;
- seed files.

Do NOT add tests.

============================================================
CF. PREFER ROUTE-LOCAL CSP, NOT GLOBAL MIDDLEWARE REWRITE
============================================================

If securityHeaders middleware runs before docs route and sets strict CSP:
the docs route can typically overwrite only:

Content-Security-Policy

with its docs-specific minimal policy before sending HTML.

This avoids global middleware changes.

Use current architecture/test.

============================================================
CG. REQUIRED VERIFICATION — CHALLENGE 19
============================================================

After implementation:

npm run typecheck

Then:

npm test challenge19.test.ts

This is the PRIMARY Task 25 gate.

If labels exist:

npm test challenge19.test.ts -t "Challenge 19a"
npm test challenge19.test.ts -t "Challenge 19b"
npm test challenge19.test.ts -t "Challenge 19c"
npm test challenge19.test.ts -t "Challenge 19d"

Use actual labels.

Record exact tests/results.

============================================================
CH. API REGRESSION
============================================================

Run:

npm test challenge11.test.ts

Because Task 25 modifies API routing/server and must preserve:
- envelopes;
- versioning;
- unsupported-version handling;
- performance/cache behavior.

============================================================
CI. SECURITY REGRESSION
============================================================

Run:

npm test challenge07.test.ts -t "Challenge 7e"

Run other exact Task 9 header/security tests if current labels apply.

Confirm normal routes still have strict CSP and other headers.

============================================================
CJ. OPERATIONS REGRESSION
============================================================

Run:

npm test challenge10.test.ts

Ensure:
- health;
- ready;
- logging;
- metrics;
- login limiter

remain healthy.

============================================================
CK. AUTH / HMAC REGRESSION
============================================================

Run:

npm test challenge01.test.ts

Docs routes should not accidentally alter security middleware order for business APIs.

============================================================
CL. DASHBOARD / DEMO REGRESSION
============================================================

Run:

npm test challenge12.test.ts
npm test challenge20.test.ts

OpenAPI/docs work must not regress client/demo APIs.

============================================================
CM. BUSINESS REGRESSION
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

Record Task 26+ failures honestly.

============================================================
CN. OPTIONAL HTTP SMOKE CHECK
============================================================

Only after automated tests pass and if a safe local server can be run.

Verify:

GET /api/openapi.json
- 200
- application/json
- root has `openapi`, `info`, `paths`.

GET /api/docs
- 200
- text/html
- Swagger UI shell/initialization present
- docs CSP applied.

A normal route:
- still uses strict global CSP.

Do not expose credentials in curl output.

If not run:
report NOT RUN.

============================================================
CO. OPTIONAL BROWSER SWAGGER SMOKE
============================================================

If browser/network environment permits:
- open `/api/docs`;
- verify Swagger UI renders;
- spec loads;
- route list appears;
- no CSP console failure.

Do not use "Try it out" with destructive production data.

Use safe GET only if needed.

If CDN unavailable:
automated organizer HTML/CSP tests remain primary.
Report CDN/network limitation honestly.

============================================================
CP. TASK 25 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-25-openapi-swagger.md

Include:

1. Starting commit.
2. Working branch task-25.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 19 test count.
6. 185-point score map.
7. Chosen OpenAPI version.
8. `info` fields.
9. server URL(s).
10. Runtime route inventory method.
11. Exact organizer route count.
12. Exact documented operation count.
13. Any route exclusions/aliases and why.
14. Path-template conversion.
15. operationId naming strategy.
16. tags.
17. path/query/header parameter strategy.
18. integer-string money schema.
19. enums documented.
20. required-body field strategy.
21. Idempotency-Key operations.
22. success envelope schemas.
23. shared error component.
24. sampled real response/schema verification.
25. `/api/openapi.json` integration.
26. `/api/docs` HTML integration.
27. Swagger asset source.
28. docs-only CSP.
29. proof normal CSP remained strict.
30. exact changed files.
31. typecheck.
32. 19a result.
33. 19b result.
34. 19c result.
35. 19d result.
36. full Challenge 19 result.
37. Challenge 11 result.
38. security regression.
39. Challenge 10 result.
40. Challenge 01 result.
41. Challenge 12/20 result.
42. broader regressions.
43. HTTP/browser smoke result.
44. full-suite result.
45. protected-file confirmation.
46. suggested commit.
47. master merge/push workflow.
48. next Task 26: Event Sourcing / Replay.

Do not include:
- secrets;
- tokens;
- real signatures;
- .env values.

============================================================
CQ. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat
git diff --name-only

Review actual changed Task 25 files, for example:

git diff -- src/openapi.ts
git diff -- src/routes/docsRoutes.ts
git diff -- src/server.ts
git diff -- src/middleware/securityHeaders.ts
git diff -- docs/clearhouse-task-25-openapi-swagger.md

Only review paths that exist/change.

Confirm:
- tests unchanged;
- no new tests;
- config unchanged;
- package files unchanged;
- migrations/seeds unchanged;
- no business behavior rewrite;
- no global CSP relaxation;
- no secret in examples;
- no fake/future routes;
- all `$ref`s local/valid;
- no Task 26+ work.

============================================================
CR. TASK 25 COMPLETION CRITERIA
============================================================

Task 25 is COMPLETE only when:

DISCOVERY

[ ] challenge19 read completely.
[ ] exact test count recorded.
[ ] real route tree inventoried.
[ ] organizer route inclusion/exclusion rules understood.
[ ] exact request/response samples understood.
[ ] docs/CSP assertions understood.

19A VALIDITY

[ ] GET /api/openapi.json returns 200.
[ ] root body is OpenAPI document, not normal API wrapper if test expects root.
[ ] valid OpenAPI 3 version.
[ ] info.title present.
[ ] info.version present.
[ ] servers valid.
[ ] real validator passes.
[ ] every $ref resolves.
[ ] no invalid 3.1-only keywords in 3.0 document.

19B COVERAGE

[ ] every required real operation documented.
[ ] no nonexistent operation documented.
[ ] exact path templates.
[ ] correct HTTP methods.
[ ] every operation has summary.
[ ] every operation has tag.
[ ] every operation has globally unique operationId.
[ ] every operation has success response.
[ ] every path parameter declared.
[ ] standard error envelope uses shared component.

19C SCHEMAS

[ ] tested request bodies documented.
[ ] required fields correct.
[ ] enums correct.
[ ] money/amount fields integer strings.
[ ] price/quantity types match runtime.
[ ] idempotent operations declare Idempotency-Key.
[ ] response wrapper matches runtime.
[ ] response field types match real API.
[ ] 204 bodies not fabricated.
[ ] pagination meta accurate.

19D SWAGGER UI

[ ] GET /api/docs returns HTML.
[ ] Swagger UI resources/markers correct.
[ ] UI points to `/api/openapi.json`.
[ ] docs-specific CSP allows required resources.
[ ] docs CSP is minimal.
[ ] normal routes retain strict CSP.
[ ] no global unsafe-inline/unsafe-eval broadening unless exact test/implementation requires docs-only directive.

REGRESSION

[ ] typecheck passes.
[ ] Challenge 19 passes.
[ ] Challenge 11 passes.
[ ] security/CSP regression passes.
[ ] Challenge 10 passes.
[ ] Challenge 01 passes.
[ ] Challenge 12 passes.
[ ] Challenge 20 passes.
[ ] sanity recorded.
[ ] full suite recorded honestly.
[ ] protected files unchanged.
[ ] Task 25 note created.
[ ] final Git target master.

If any Challenge 19 organizer assertion remains failing:
- Task 25 status = PARTIAL;
- report exact assertion/root cause.

============================================================
CS. FINAL CURSOR REPORT
============================================================

Return:

1. Task 25 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Exact Challenge 19 test count.
6. OpenAPI version.
7. Info/server configuration.
8. Runtime route inventory count.
9. Documented operation count.
10. Route aliases/exclusions.
11. Path parameter strategy.
12. operationId strategy.
13. Tags/summary strategy.
14. Shared ErrorEnvelope implementation.
15. Money/integer-string schema strategy.
16. Enum coverage.
17. Idempotency-Key operations.
18. Request schema accuracy.
19. Response schema accuracy.
20. `/api/openapi.json` implementation.
21. `/api/docs` implementation.
22. Swagger asset loading strategy.
23. Docs-only CSP.
24. Normal-route CSP proof.
25. Typecheck.
26. 19a result.
27. 19b result.
28. 19c result.
29. 19d result.
30. Full Challenge 19 result.
31. Challenge 11 result.
32. security regression.
33. Challenge 10 result.
34. Challenge 01 result.
35. Challenge 12 result.
36. Challenge 20 result.
37. broader regressions.
38. HTTP/browser smoke result.
39. full-suite result.
40. remaining future failures.
41. confirmation protected files unchanged.
42. final diff summary.
43. reviewed Git commands targeting master.

Suggested commit:

feat: document API with OpenAPI and Swagger UI

Do not automatically commit, merge, or push.
````

---

# Task 25 acceptance matrix

| Area | Required behavior |
|---|---|
| Spec endpoint | `GET /api/openapi.json` |
| OpenAPI | Valid OpenAPI 3 |
| `info.title` | Present |
| `info.version` | Present |
| Server | Valid expected server |
| `$ref` | Every reference resolves |
| Real route coverage | Complete |
| Extra routes | None |
| Path templates | Exact `{param}` form |
| `summary` | Every operation |
| `tag` | Every operation |
| `operationId` | Unique globally |
| Success response | Every operation |
| Path parameters | Declared + required |
| Error envelope | Shared component |
| Money | Integer strings, not floats |
| Required fields | Accurate |
| Enums | Real API literals |
| Idempotency-Key | Declared where required |
| Response schemas | Match runtime |
| Docs endpoint | `GET /api/docs` HTML |
| Swagger UI | Loads real spec |
| Docs CSP | Minimal docs-only relaxation |
| Other routes CSP | Remains strict |
| Package dependencies | No new packages |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 25

Official final branch:

**`master`**

Workflow:

**`master` → `task-25` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 25 branch

```powershell
Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"

git status -sb
git branch --show-current
git branch --list
git remote -v
git log -12 --oneline --decorate
```

Expected:

```text
task-25
```

Final branch:

```text
master
```

---

## 2. Run final Task 25 verification

```powershell
npm run typecheck

npm test challenge19.test.ts

npm test challenge11.test.ts

npm test challenge10.test.ts

npm test challenge01.test.ts

npm test challenge12.test.ts

npm test challenge20.test.ts

npm test challenge13.test.ts

npm test challenge09.test.ts

npm test challenge05.test.ts

npm test challenge04.test.ts

npm test challenge03.test.ts

npm test challenge02.test.ts

npm test _sanity.test.ts

git diff --check
```

Security-focused:

```powershell
npm test challenge07.test.ts -t "Challenge 7e"
```

Use exact current label if different.

If Challenge 19 labels exist:

```powershell
npm test challenge19.test.ts -t "Challenge 19a"
npm test challenge19.test.ts -t "Challenge 19b"
npm test challenge19.test.ts -t "Challenge 19c"
npm test challenge19.test.ts -t "Challenge 19d"
```

Then:

```powershell
npm test
```

---

## 3. Review Task 25 changes

```powershell
git status --short
git diff --stat
git diff --name-only
```

Review the actual docs/spec integration files, likely:

```powershell
git diff -- src/openapi.ts
git diff -- src/routes/docsRoutes.ts
git diff -- src/server.ts
git diff -- src/middleware/securityHeaders.ts
git diff -- docs/clearhouse-task-25-openapi-swagger.md
```

Only use files that actually exist/change.

Confirm:
- no global CSP weakening;
- no fake routes;
- no secrets/examples with credentials;
- no business API rewrite.

---

## 4. Stage only Task 25 files

Always stage the engineering note:

```powershell
git add -- docs/clearhouse-task-25-openapi-swagger.md
```

Stage the actual OpenAPI module:

```powershell
git add -- "<actual-openapi-source-path>"
```

Stage docs route if used:

```powershell
git add -- "<actual-docs-route-path>"
```

Only if genuinely changed:

```powershell
git add -- src/server.ts
git add -- src/middleware/securityHeaders.ts
```

Do not paste placeholders literally.

If a file contains unrelated changes:

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
- unrelated business code
- Task 26+ work.

Search staged content mentally/visually for:
- secrets;
- real bearer tokens;
- real HMAC signatures.

---

## 6. Commit Task 25

```powershell
git commit -m "feat: document API with OpenAPI and Swagger UI"
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

Never reset valid history.

---

## 8. Merge Task 25

Prefer:

```powershell
git merge --ff-only task-25
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-25
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

npm test challenge19.test.ts

npm test challenge11.test.ts

npm test challenge07.test.ts -t "Challenge 7e"

git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge10.test.ts
npm test challenge20.test.ts
npm test _sanity.test.ts
```

---

## 10. Push official master

```powershell
git push origin master
```

Do not push final competition submission to `main`.

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

If safe for the local-only Task 25 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge19.test.ts
npm test challenge11.test.ts
npm test challenge07.test.ts -t "Challenge 7e"
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts deliberately.

---

# Fast Task 25 checklist

- [ ] branch = task-25
- [ ] final branch = master
- [ ] challenge19 read completely
- [ ] config/scores read-only
- [ ] real runtime route tree inventoried
- [ ] route scanner inclusion/exclusion understood
- [ ] `/api/v1` documentation expectation understood
- [ ] OpenAPI root served at `/api/openapi.json`
- [ ] OpenAPI 3 version valid
- [ ] info title/version present
- [ ] server valid
- [ ] validator passes
- [ ] every `$ref` resolves
- [ ] all real operations documented
- [ ] no fake/future operations
- [ ] exact `{pathParam}` templates
- [ ] path params declared required
- [ ] every operation summary
- [ ] every operation tag
- [ ] every operation unique operationId
- [ ] every operation success response
- [ ] shared ErrorEnvelope component
- [ ] Task 21 `{data,meta}` responses modeled
- [ ] financial amounts integer strings
- [ ] quantity/price schemas exact
- [ ] request required fields exact
- [ ] enum values exact
- [ ] Idempotency-Key documented where required
- [ ] response schemas match real API
- [ ] 204 responses have no fake body
- [ ] `/api/docs` returns HTML
- [ ] Swagger UI targets `/api/openapi.json`
- [ ] docs CSP allows only required docs resources
- [ ] normal route CSP remains strict
- [ ] no new package dependency
- [ ] no secret examples
- [ ] Challenge19 passes
- [ ] Challenge11 passes
- [ ] Challenge7 security regression passes
- [ ] Challenge10 passes
- [ ] Challenge01 passes
- [ ] Challenge12 passes
- [ ] Challenge20 passes
- [ ] sanity/full suite recorded
- [ ] protected files unchanged
- [ ] Task25 note created
- [ ] committed on task-25
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 26 — Challenge 06: Event Sourcing and Deterministic Replay.
