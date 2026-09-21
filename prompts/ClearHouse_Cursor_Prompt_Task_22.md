# ClearHouse — Complete Enhanced Cursor Prompt for Task 22

**Task:** Challenge 12 — Operator Dashboard + Browser Request Signing  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-22`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 22 purpose

Task 22 implements **Challenge 12 — Operator Dashboard** and the dashboard-specific browser signing integration present in the organizer test.

The dashboard must remain a **thin, dependency-free client** over the APIs already completed in Tasks 1–21. This is not the time to redesign backend business logic.

Task 22 must provide:

- real account-balance rendering;
- real order-book rendering;
- real risk-state rendering;
- XSS-safe rendering of untrusted API data;
- distinct loading / empty / ready / error states;
- exact minor-unit money formatting;
- canonical best-price-first book presentation;
- capped deep-book display;
- graceful malformed-price handling;
- basic accessibility;
- browser-signed request construction compatible with the existing server HMAC protocol.

Do not implement the later real-time dashboard/WebSocket features from Tasks 31–32.

---

# Published Challenge 12 contract — 130 points

## 12a — Rendering real data — 30 pts

### 12a-1 — 10 pts
The balance view renders **one row per asset** with:

- asset name;
- available;
- held;
- total.

### 12a-2 — 10 pts
The order-book view highlights:

- best bid;
- best ask.

### 12a-3 — 10 pts
The risk view shows:

- open order count;
- committed exposure.

---

## 12b — Untrusted data never executes — 20 pts

### 12b-1 — 20 pts
An asset name containing markup must render as **literal text**, not as an HTML element/script.

Do not trust API strings.

Do not build tested dashboard rows with unsafe `innerHTML`.

---

## 12c — Distinguishable loading, empty and error states — 10 pts

### 12c-1 — 2 pts
An empty balance list renders a clear empty state, not a blank/empty table.

### 12c-2 — 2 pts
Successfully rendered data marks the section **ready**, visibly distinct from loading/empty/error.

### 12c-3 — 2 pts
Loading is visibly distinct from empty/error/ready.

### 12c-4 — 2 pts
Error is visibly distinct from empty/loading/ready.

### 12c-5 — 2 pts
An empty order book renders a distinct empty state, not just empty bid/ask columns.

---

## 12d — Browser signing — organizer-test requirement omitted from the short challenge prose

The project audit and Task 5 handoff confirm that `tests/challenge12.test.ts` contains a **Challenge 12d browser-signing check** involving:

- `client/js/dashboard.js`;
- `buildSignedRequestInit(...)`;
- dashboard-generated signing headers;
- `X-Signature-Algorithm`.

Task 5 already repaired `client/js/signer.js` to use the server-compatible LF-delimited signing payload.

Known compatibility requirement:

- server / Challenge 1c expects `X-Algorithm`;
- Challenge 12d expects the dashboard request builder to expose `X-Signature-Algorithm`.

Task 22 must inspect the exact current Challenge 12d assertions and preserve **both** contracts where needed, e.g. by sending both headers with the same supported algorithm value if that is consistent with the current tests/server.

Do **not** rename/remove the server's `X-Algorithm` header just to satisfy the dashboard.

Do **not** expose the HMAC secret to the browser through a new backend endpoint.

The visible published items total **110 points** while the challenge total is **130 points**. The missing 20-point coverage corresponds to additional organizer-test coverage such as Challenge 12d. Read `config/scores.ts` READ ONLY and report the exact current split; do not guess the subtest point allocation.

---

## 12e — Exact money formatting — 20 pts

### 12e-1 — 12 pts
`formatMinorUnits` matches an exact BigInt oracle for arbitrary:

- amount;
- sign;
- leading zeros;
- exponent.

### 12e-2 — 8 pts
Correctly handles:

- small fractions;
- zero;
- exponent `0`;

and malformed input throws `RangeError`.

---

## 12f — Order-book presentation — 20 pts

### 12f-1 — 12 pts
Each side renders best-price-first **regardless of the order returned by the API**.

Only the first displayed row on each side is marked as best.

### 12f-2 — 8 pts
A deep book is capped at **10 displayed levels per side** and shows a:

```text
+N more
```

row/indicator.

Malformed price data must not crash the render.

---

## 12g — Accessibility — 10 pts

### 12g-1 — 10 pts

Required accessible behaviors include:

- loading uses `aria-busy`;
- error content announces with `role="alert"`;
- tables have captions;
- tables have proper column headers.

Read the exact test selectors/assertions.

---

# Visible score summary

Published visible items:

```text
12a = 30
12b = 20
12c = 10
12e = 20
12f = 20
12g = 10
----------------
Visible = 110
Challenge total = 130
```

The remaining organizer coverage includes browser signing (12d). Read the current scoring file read-only for the exact split. These are available points, not earned points.

---

# Existing Task 5 browser-signing behavior to preserve

`client/js/signer.js` should already use the canonical payload:

1. `method.toUpperCase()`
2. exact request path
3. SHA-256 hex of raw body
4. timestamp
5. nonce

joined with LF:

```text
\n
```

and HMAC-SHA256 via Web Crypto.

Do not reintroduce the old `|` separator.

Task 22 is primarily about the **dashboard request builder/header integration**, not rewriting the signer.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 22

Copy the complete block below into Cursor Agent mode.

````text
Act as my senior vanilla-JavaScript frontend engineer, browser-security reviewer, and fintech UI engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 22 ONLY: implement Challenge 12 — Operator Dashboard — including the current organizer's browser-signing assertions.

Preserve all Tasks 1–21.

Build the thinnest correct operator dashboard over the existing APIs. Do not migrate frameworks, add dependencies, implement WebSockets, or redesign the backend.

Perform the implementation and verification, create the Task 22 engineering note, and show reviewed Git commands.

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

task-22

Historical reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–21;
- work on task-22;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit/merge/push automatically.

============================================================
B. STRICT TASK 22 SCOPE
============================================================

IMPLEMENT:

Challenge 12a:
- balance view;
- order-book view;
- risk view.

Challenge 12b:
- safe untrusted-data rendering.

Challenge 12c:
- loading;
- empty;
- ready;
- error states.

Challenge 12d:
- browser signed-request builder/header compatibility according to actual current tests.

Challenge 12e:
- exact `formatMinorUnits`.

Challenge 12f:
- best-price-first sorting;
- only first level marked best;
- ten-level cap;
- +N more;
- malformed price resilience.

Challenge 12g:
- tested accessibility semantics.

PRESERVE:
- Task 5 browser signer;
- Task 21 API versioning/envelopes;
- backend APIs;
- Task 20 operational endpoints;
- current vanilla frontend architecture.

DO NOT IMPLEMENT:
- Task 23 seed/accounts API;
- Task 24 additional portfolio/trades dashboard;
- Task 25 Swagger/OpenAPI;
- Task 31 WebSocket server;
- Task 32 live client;
- polling-to-stream migration;
- frontend framework migration.

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
- change jsdom behavior;
- change timeouts;
- reduce test discovery;
- add test-only production branches.

Do NOT add frontend code checking:

- NODE_ENV === "test";
- VITEST;
- known DOM fixture IDs from organizer logic as a bypass;
- known malicious asset string;
- known generated money cases;
- exact test prices;
- exact test book depth.

Do NOT install:
- React;
- Vue;
- Svelte;
- DOMPurify;
- Big.js;
- crypto libraries;
- CSS frameworks.

Use:
- existing HTML;
- existing CSS;
- vanilla ES modules;
- browser Web Crypto already present.

Do NOT expose:
- HMAC secret;
- JWT secret;
- server env values;
- CodeCommit credentials.

No destructive Git.

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

Verify Task 21 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-21 exists:

git log --oneline --decorate --max-count=10 task-21

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-22

If task-22 already exists:

git branch --list task-22
git log --oneline --decorate --max-count=10 task-22

Do not delete/recreate blindly.

Record:
- starting commit;
- current branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
E. VERIFY FRONTEND / SIGNING PREREQUISITES
============================================================

Read if present:

- docs/clearhouse-task-05-signing.md
- docs/clearhouse-task-21-api-cache-performance.md
- docs/clearhouse-task-02-setup.md

Verify actual source.

Read:

- client/index.html
- client/js/app.js
- client/js/dashboard.js
- client/js/signer.js
- client/js/liveFeed.js
- client/dashboard.css

Use actual paths if CSS filename differs.

Before editing run:

npm run typecheck

npm test challenge00b.test.ts -t "Challenge 0t"

npm test challenge01.test.ts -t "Challenge 1c"

These protect browser/server signing compatibility.

Use exact labels if current tests differ.

============================================================
F. READ CHALLENGE 12 COMPLETELY
============================================================

Read:

tests/challenge12.test.ts

from first line to last line.

Do not rely only on Challenges.md because the short challenge description omits Challenge 12d browser signing.

Read:

config/scores.ts

READ ONLY.

Build a coverage table:

test label
| points
| exported function
| DOM selector
| expected DOM/state
| API data shape
| security invariant
| current defect/stub

Record:
- exact current Challenge 12 test count;
- exact 12d test names;
- exact 12d score split;
- exact DOM IDs/classes/data attributes;
- exact functions imported directly by tests.

Do not rename exported functions/selectors that tests import/query.

============================================================
G. RUN BEFORE BASELINE
============================================================

Run:

npm test challenge12.test.ts

Record:
- executed;
- passed;
- failed;
- exact selectors/functions expected;
- exact browser-signing header names;
- current rendering defects.

If labels exist:

npm test challenge12.test.ts -t "Challenge 12a"
npm test challenge12.test.ts -t "Challenge 12b"
npm test challenge12.test.ts -t "Challenge 12c"
npm test challenge12.test.ts -t "Challenge 12d"
npm test challenge12.test.ts -t "Challenge 12e"
npm test challenge12.test.ts -t "Challenge 12f"
npm test challenge12.test.ts -t "Challenge 12g"

Use actual labels.

============================================================
H. DO NOT REDESIGN THE DASHBOARD DOM BEFORE READING TESTS
============================================================

Challenge 12 may query exact:

- element IDs;
- section containers;
- state attributes;
- table structure;
- classes;
- captions;
- labels.

First inspect `client/index.html` and test setup.

Preserve expected selectors.

You may improve minimal markup required for correctness/accessibility, but do not rename tested selectors for style.

============================================================
I. DASHBOARD SHOULD USE REAL DATA, NOT FIXTURES
============================================================

Do not hardcode:

- USD/BTC only;
- fixed account balances;
- fixed order-book prices;
- risk counts;
- demo account values.

Render whatever data the tested API/helper supplies.

If tests call rendering functions directly with data:
implement them as general pure-ish DOM renderers.

If dashboard fetches real APIs:
preserve current API configuration from `app.js`.

============================================================
J. BALANCE VIEW — 12a-1
============================================================

Render one row per balance asset.

Each row must show:

- asset;
- available;
- held;
- total.

Total must be exact:

total = available + held

Do not use floating point.

If API already supplies total:
verify it matches contract and render safely.

If client computes total:
use exact integer representation, preferably BigInt after strict validation.

Do not use:

Number(available) + Number(held)

for monetary minor units.

============================================================
K. BALANCE MONEY FORMATTING
============================================================

Use the exact asset exponent where the current data contract provides it.

Inspect:
- API response;
- asset registry endpoint/data;
- current dashboard helper signatures.

Do not hardcode every asset exponent inside the render function if the dashboard already receives metadata.

`formatMinorUnits` is the single exact formatting primitive.

============================================================
L. BALANCE ROW XSS SAFETY
============================================================

Asset names are untrusted.

NEVER write:

row.innerHTML = `<td>${asset}</td>...`

for API strings.

Use:

document.createElement(...)
element.textContent = String(value)

or equivalent safe DOM APIs.

The malicious asset string must remain literal text.

Do not "sanitize" by deleting angle brackets and changing displayed content unless test allows it.

The requirement is text rendering, not mutation of the string.

============================================================
M. SAFE DOM POLICY
============================================================

For all API-derived strings use:
- `textContent`;
- safe attributes set from validated primitives.

Avoid `innerHTML`.

If static trusted markup is already in HTML, leave it static.

Do not use:
- insertAdjacentHTML with untrusted strings;
- document.write;
- eval;
- Function;
- inline event-handler strings.

============================================================
N. BALANCE EMPTY STATE — 12c-1
============================================================

When balance list is empty:

- do not render an empty table as if data loaded;
- render the exact tested empty-state marker/message;
- section state must distinguish EMPTY from READY with rows.

Read exact test selector/state attribute.

Do not invent a second hidden empty table that confuses test/accessibility.

============================================================
O. READY STATE — 12c-2
============================================================

After successful non-empty rendering:

- mark the section ready using exact tested semantics;
- remove/replace loading state;
- remove stale error/empty content;
- `aria-busy` must no longer indicate loading.

State transitions should be mutually clear.

============================================================
P. LOADING STATE — 12c-3
============================================================

Loading must be visibly/semantically distinct.

Use exact current state mechanism:
- data-state;
- class;
- status text;
- aria-busy;
or whatever the tests require.

Do not leave old ready data labelled as loading unless later live-feed task explicitly wants stale-data retention. Task 22 is polling/static dashboard behavior.

============================================================
Q. ERROR STATE — 12c-4
============================================================

On fetch/render error:

- render distinct error state;
- use `role="alert"` per 12g;
- do not show error as empty;
- do not expose stack/token/secret/raw body.

Use a safe generic/user-readable error message if tests permit.

Do not insert raw `error.message` through innerHTML.

============================================================
R. ORDER BOOK EMPTY STATE — 12c-5
============================================================

When both sides contain no displayable levels:

- render the exact tested empty state;
- do not leave two blank tables/columns pretending to be ready.

If only one side is empty:
follow exact test/current UI contract and still render the other side correctly.

============================================================
S. ORDER BOOK — 12a-2
============================================================

Render:

- bids;
- asks;
- best bid;
- best ask.

Do NOT trust API order.

Task 12f explicitly requires client-side canonical ordering.

Best bid = highest valid bid price.

Best ask = lowest valid ask price.

============================================================
T. ORDER-BOOK SORTING — 12f-1
============================================================

Bids:

descending price.

Asks:

ascending price.

Only the first DISPLAYED valid row per side gets the tested "best" marker/class/attribute.

Do not mark every row at the same price as best unless test explicitly says so.

Sort a copy.

Do not mutate API input arrays.

============================================================
U. EXACT PRICE COMPARISON
============================================================

Prices are exact integer strings/minor units.

Do not sort with:

Number(a.price) - Number(b.price)

because values may exceed Number.MAX_SAFE_INTEGER.

Parse valid integer price using BigInt and compare relationally.

Do not subtract and cast to Number.

============================================================
V. MALFORMED PRICE RESILIENCE — 12f-2
============================================================

Malformed price input must never crash the whole render.

Create a safe parse/validation helper.

Read test expected presentation:
- skip malformed level;
- display it safely after valid levels;
- placeholder;
or another behavior.

Do not guess final positioning if test specifies it.

Universal invariant:
- no BigInt exception escapes;
- valid levels still render;
- DOM remains valid;
- unsafe string remains text.

============================================================
W. DEEP BOOK CAP — 12f-2
============================================================

Display at most:

10 levels per side

unless current test says the cap is applied after filtering malformed rows in a particular way.

For hidden remaining levels show:

+N more

using exact tested text/selector.

N must represent the exact organizer-expected remaining count.

Do not hardcode `+1 more`.

============================================================
X. ORDER BOOK INPUT IMMUTABILITY
============================================================

Use:

const sorted = [...levels]

not:

levels.sort(...)

if tests may reuse input.

Do not mutate:
- input arrays;
- level objects.

This also makes later live-feed integration safer.

============================================================
Y. RISK VIEW — 12a-3
============================================================

Render the current risk payload fields required by test:

- open order count;
- committed exposure.

Use exact current property names.

Do not invent risk math in the browser if backend already returns state.

Display exact integer values safely.

If committed exposure is monetary/position minor units:
format according to the current UI/test contract.

============================================================
Z. RISK VIEW SECURITY
============================================================

Do not display:
- risk registry internals;
- hidden reservation IDs;
- tokens;
- secrets.

Only tested operator-facing state.

============================================================
AA. formatMinorUnits — PRESERVE EXACT SIGNATURE
============================================================

Read its current exported signature from:

client/js/dashboard.js

and direct imports from `challenge12.test.ts`.

Do not rename it.

Do not change argument order/types unless test/source requires it.

============================================================
AB. formatMinorUnits — EXACTNESS
============================================================

The amount represents integer minor units.

Never convert amount to Number.

Use:
- strict integer-string validation;
- BigInt;
OR
- exact string manipulation.

Handle arbitrary magnitudes.

No floating point.

============================================================
AC. formatMinorUnits — SIGN
============================================================

Preserve negative sign exactly.

Examples conceptually:

amount = -12345, exponent = 2
=> "-123.45"

amount = 12345, exponent = 2
=> "123.45"

Do not output:
- "-0.00" for zero unless current oracle expects it;
- plus sign unless current contract includes one.

Read exact tests.

============================================================
AD. formatMinorUnits — LEADING ZEROS
============================================================

Inputs such as:

"000123"

must produce the same numeric formatting as exact integer 123.

Do not preserve meaningless source leading zeros in the major-unit portion unless the oracle explicitly does.

Use the organizer oracle.

============================================================
AE. formatMinorUnits — SMALL FRACTIONS
============================================================

For exponent > digit count:

pad fractional portion with leading zeros.

Conceptually:

1, exponent 2
=> "0.01"

1, exponent 8
=> "0.00000001"

Do not produce scientific notation.

============================================================
AF. formatMinorUnits — EXPONENT ZERO
============================================================

Exponent 0:

123 -> "123"

No decimal point.

-5 -> "-5"

Zero -> "0"

according to exact current oracle.

============================================================
AG. formatMinorUnits — MALFORMED INPUT
============================================================

Challenge 12e-2 requires malformed input to throw `RangeError`.

Read exact invalid cases.

Likely validate:
- amount grammar;
- exponent type;
- exponent finite/integer/nonnegative;
- unsupported signs/whitespace/decimal/scientific notation.

Do NOT silently coerce malformed strings with:
- parseInt;
- parseFloat;
- Number.

Do not return "NaN".

Throw RangeError where test expects it.

============================================================
AH. VERY LARGE EXPONENT / AMOUNT
============================================================

Avoid huge accidental memory/CPU behavior.

Use exact expected practical behavior from tests.

If exponent must be bounded by an existing domain constraint, preserve it.

Do not introduce an arbitrary tiny bound that breaks valid generated property tests.

============================================================
AI. MONEY DISPLAY / ASSET EXPONENT
============================================================

Do not confuse:
- internal minor-unit integer string;
- display decimal.

API data remains exact strings.

Only presentation uses `formatMinorUnits`.

Do not send formatted decimals back to backend mutation APIs.

============================================================
AJ. TABLE ACCESSIBILITY — 12g
============================================================

Tables must include:

- `<caption>`;
- column header cells `<th>`;
- proper table structure.

Use `scope="col"` when appropriate.

Do not simulate a table entirely with generic divs if organizer expects semantic table elements.

============================================================
AK. aria-busy — 12g
============================================================

While section is loading:

`aria-busy="true"`

or exact tested equivalent.

After loading completes/fails:

set to false/remove according to test.

Do not leave aria-busy true forever.

============================================================
AL. ERROR ROLE — 12g
============================================================

Error state must contain/use:

`role="alert"`

as asserted.

Avoid `role=alert` on normal empty/ready state.

Do not use alert() popup.

============================================================
AM. ACCESSIBLE BEST-PRICE MARKING
============================================================

If the UI uses only color to mark best bid/ask, add textual/semantic indication if current test/UI supports it.

At minimum satisfy exact tested class/attribute and maintain readable text.

Do not make CSS generated content the only marker if tests query DOM text/attributes.

============================================================
AN. STATE TRANSITION HELPER
============================================================

If current dashboard repeats state logic, a small helper is acceptable:

setSectionState(section, "loading" | "empty" | "ready" | "error")

but preserve tested DOM.

It should:
- update state attribute/class;
- update aria-busy;
- clear obsolete state content safely;
- not delete permanent heading/caption containers unexpectedly.

Do not overbuild a state machine.

============================================================
AO. DATA FETCHING
============================================================

Read the actual dashboard API calls.

Preserve:
- backend URL configuration;
- `/api` or `/api/v1` path chosen by current client;
- Task 21 response envelopes;
- authorization/signing requirements.

Do not invent new backend endpoints solely for the dashboard.

If a backend endpoint genuinely does not exist yet and belongs to Task 23/24:
do not steal that task; report blocker separately.

But implement all direct render helpers independently so Challenge 12 can pass its DOM/unit tests.

============================================================
AP. RESPONSE ENVELOPE HANDLING
============================================================

Task 21 standardized:

{
  data,
  meta
}

Dashboard fetch helpers must read real `data`.

Do not assume bare arrays if API now returns envelope.

Read current test mocks.

Avoid silent fallback that masks malformed backend responses.

============================================================
AQ. BROWSER REQUEST SIGNING — 12d
============================================================

Read exact Challenge 12d tests.

Inspect:

client/js/dashboard.js
client/js/signer.js

Known relevant function:

buildSignedRequestInit(...)

Preserve its export/signature.

Determine exact expected inputs:
- method;
- path;
- body;
- signer;
- timestamp/nonce generation/injection;
- headers.

Do not guess.

============================================================
AR. DO NOT REIMPLEMENT CRYPTO IN dashboard.js
============================================================

Task 5 already made:

client/js/signer.js

the canonical browser signer.

Use/import it.

Do not duplicate:
- SHA-256;
- HMAC;
- payload construction

inside dashboard.js.

One protocol implementation.

============================================================
AS. SIGN EXACT RAW BODY
============================================================

If request has JSON body:

create the exact body string ONCE.

Example conceptually:

const bodyText = JSON.stringify(payload)

Use that exact string:
- for signing;
- for fetch body.

Do NOT sign one JSON serialization and send another.

Property order/whitespace are part of raw body bytes.

============================================================
AT. SIGN EXACT PATH
============================================================

Sign the exact request path expected by Task 5/server HMAC middleware.

If fetch URL includes origin:
the signed path should follow existing signer contract, normally pathname + query, not full origin, unless current test says otherwise.

Preserve query string exactly.

For `/api/v1`:
do not strip version prefix if actual request includes it.

============================================================
AU. REQUIRED SIGNING HEADERS
============================================================

Read Challenge 12d exact assertions.

Task 5 known server headers include:
- signature;
- timestamp;
- nonce;
- algorithm header `X-Algorithm`.

Challenge 12d specifically asserts:
- `X-Signature-Algorithm`.

Preserve both official contracts.

If current tests/server permit:
set both:

X-Algorithm: <algorithm>
X-Signature-Algorithm: <same algorithm>

Do NOT remove `X-Algorithm`.

Do not make algorithm values disagree.

Use actual casing/names expected by tests; HTTP header names are case-insensitive but test object access may not be.

============================================================
AV. OTHER SIGNING HEADERS
============================================================

Read exact Task 5 middleware names and Challenge 12d tests.

Likely existing headers include equivalents of:
- X-Signature
- X-Timestamp
- X-Nonce
- algorithm

Do not invent alternate names.

Do not send the HMAC secret.

============================================================
AW. NONCE GENERATION
============================================================

Use browser-safe random nonce generation already present, e.g. Web Crypto.

Do not:
- Math.random if existing secure generator exists;
- fixed nonce;
- timestamp as nonce only;
- reuse nonce across signed requests.

If tests inject nonce/timestamp for determinism:
preserve injection hooks.

============================================================
AX. TIMESTAMP
============================================================

Use the exact timestamp representation Task 5 expects.

Do not convert to locale date string.

If tests inject time:
preserve the injection point.

Do not hardcode current timestamp fixture.

============================================================
AY. SECRET HANDLING
============================================================

The browser signer requires a secret under the starter/demo architecture.

Do not make this worse by:

- embedding production secret in committed JS;
- adding `/api/hmac-secret`;
- reading server `.env` from client;
- logging secret;
- storing it in DOM/data attributes.

Follow the current competition client configuration/test injection pattern.

If the demo requires a manually entered/injected disposable secret:
preserve that existing pattern.

Do not claim a shared HMAC secret in a browser is production-safe; this is challenge compatibility.

============================================================
AZ. CONTENT-TYPE AND HEADER MERGING
============================================================

`buildSignedRequestInit` should preserve caller headers safely.

Do not overwrite required:
- Content-Type;
- Authorization

unless contract says so.

When merging:
- signing headers must have correct final values;
- body signed must match body sent.

Read tests for header object type:
- plain object;
- Headers instance;
- both.

Implement only needed compatibility cleanly.

============================================================
BA. BODYLESS REQUEST SIGNING
============================================================

For GET/read requests:

raw body should be exact empty string per Task 5 contract.

Do not sign `"undefined"` or `"null"` unless those are actual sent bytes.

Do not attach a GET body just to simplify signing.

============================================================
BB. SIGNER REGRESSION
============================================================

Do not alter `client/js/signer.js` unless Challenge 12d proves an actual remaining defect.

Task 5 should already pass Challenge 0t.

If you must touch signer:
rerun 0t and Challenge 1c.

Do not regress LF separator.

============================================================
BC. XSS TEST DETAILS
============================================================

The malicious asset value may look like HTML.

Do not special-case a known string.

All asset names:
- textContent only.

Also apply safe rendering to:
- market names;
- risk labels;
- error messages;
- `+N more` count built from validated number.

No generic unsafe HTML template for rows.

============================================================
BD. MALFORMED PRICE + XSS TOGETHER
============================================================

Malformed price text should not be inserted as HTML.

If displayed:
use textContent.

If skipped:
ensure count/best markers remain correct.

No BigInt throw.

============================================================
BE. CSS
============================================================

Use existing stylesheet.

Add only minimal styles for:
- state visibility;
- best level;
- tables;
- empty/error/loading;
- accessibility/readability.

Do not spend Task 22 on a full visual redesign.

Do not hide required text with `display:none` when tests/accessibility expect visible content.

============================================================
BF. RESPONSIVE DESIGN
============================================================

Maintain usable simple layout.

Do not introduce a heavy grid rewrite that can break tested DOM.

Challenge 12 tests focus correctness/accessibility.

Keep dashboard functional at normal/mobile widths, but prioritize test contract.

============================================================
BG. LATER REAL-TIME FEATURES
============================================================

Do not implement:
- WebSocket connection status;
- stale/reconnecting states;
- delta application;
- resync;
- backoff;
- liveFeed integration beyond preserving current code.

Those belong to Challenges 17/18 and Tasks 31/32.

Task 22 may continue polling/current static fetching if starter does so.

============================================================
BH. EXPECTED TASK 22 FILE SCOPE
============================================================

Primary likely:

- client/js/dashboard.js
- client/index.html
- client/dashboard.css

Potential minimal:
- client/js/app.js

Only if Challenge 12d exposes a remaining protocol defect:
- client/js/signer.js

Create/update:

- docs/clearhouse-task-22-dashboard.md

Do NOT add tests.

Do NOT modify backend unless a current Challenge 12 assertion proves a frontend-serving/config integration defect. Prefer frontend-only changes.

============================================================
BI. DO NOT CHANGE PACKAGE/BUILD SYSTEM
============================================================

This is a no-build vanilla frontend.

Do not add:
- bundler;
- transpiler;
- npm frontend scripts;
- framework.

Preserve ES module imports expected by Vitest/jsdom.

============================================================
BJ. REQUIRED VERIFICATION — CHALLENGE 12
============================================================

After implementation run:

npm run typecheck

Then:

npm test challenge12.test.ts

This is the PRIMARY Task 22 gate.

If labels exist:

npm test challenge12.test.ts -t "Challenge 12a"
npm test challenge12.test.ts -t "Challenge 12b"
npm test challenge12.test.ts -t "Challenge 12c"
npm test challenge12.test.ts -t "Challenge 12d"
npm test challenge12.test.ts -t "Challenge 12e"
npm test challenge12.test.ts -t "Challenge 12f"
npm test challenge12.test.ts -t "Challenge 12g"

Use actual labels.

============================================================
BK. SIGNING REGRESSION
============================================================

Run:

npm test challenge00b.test.ts -t "Challenge 0t"

npm test challenge01.test.ts -t "Challenge 1c"

These confirm:
- browser signer oracle;
- server HMAC protocol

remain healthy.

============================================================
BL. API REGRESSION
============================================================

Run:

npm test challenge11.test.ts

Task 22 client adaptations must remain compatible with Task 21 API envelopes/versioning.

============================================================
BM. ACCOUNT-CLOSURE REGRESSION
============================================================

Run:

npm test challenge13.test.ts

Challenge 13 explicitly states Challenges 01–12 remain unaffected.

============================================================
BN. BROADER REGRESSION
============================================================

Run:

npm test challenge10.test.ts
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

Record Task 23+ failures honestly.

============================================================
BO. OPTIONAL BROWSER SMOKE CHECK
============================================================

Only after automated tests pass.

Use an HTTP static server per project guide.

Do NOT open with file:// if ES modules/fetch require HTTP.

Check:
- page loads;
- no JS module error;
- loading state transitions;
- balance table;
- order book;
- risk view;
- empty-state behavior if possible;
- browser console;
- signed fetch behavior if safe demo configuration exists.

Do not expose or paste the HMAC secret.

If no browser capability:
report browser smoke test NOT RUN.

Do not claim visual pass from jsdom alone.

============================================================
BP. FAILURE DIAGNOSIS — 12a
============================================================

If balances fail:
- inspect exact API/mock shape;
- verify one row per item;
- exact total;
- selectors.

If book best fails:
- sort valid prices correctly;
- ensure only first row best.

If risk fails:
- property names mismatch;
- rendering target wrong;
- state not ready.

============================================================
BQ. FAILURE DIAGNOSIS — 12b
============================================================

If XSS test finds an element:
search:

innerHTML
insertAdjacentHTML

in touched dashboard code.

Replace untrusted rendering with textContent/createElement.

Do not special-case malicious fixture.

============================================================
BR. FAILURE DIAGNOSIS — 12c
============================================================

If state tests conflict:
- stale content not cleared;
- same selector used for loading and empty;
- state attribute not updated;
- aria-busy stuck;
- error rendered as empty.

Create one deterministic state transition path.

============================================================
BS. FAILURE DIAGNOSIS — 12d
============================================================

If dashboard signing fails:
- exact signed path mismatch;
- body signed != body sent;
- missing required header;
- X-Algorithm vs X-Signature-Algorithm mismatch;
- signer not awaited;
- nonce/timestamp mismatch;
- signer reverted to wrong separator.

Do not change server protocol blindly.

Compare Task 5 tests first.

============================================================
BT. FAILURE DIAGNOSIS — 12e
============================================================

If property formatting fails:
- Number conversion;
- sign logic;
- zero handling;
- leading-zero handling;
- exponent=0;
- fractional padding;
- malformed input not throwing RangeError.

Keep implementation pure/exact.

============================================================
BU. FAILURE DIAGNOSIS — 12f
============================================================

If ordering fails:
- API array trusted;
- bid/ask comparator reversed;
- Number precision loss.

If deep-book count fails:
- cap applied before malformed filtering incorrectly;
- N computed from wrong set;
- more row duplicated.

If render throws:
- unsafe BigInt parse of malformed price.

============================================================
BV. FAILURE DIAGNOSIS — 12g
============================================================

Inspect:
- aria-busy exact element;
- role=alert;
- captions;
- `<th>`;
- scope where asserted.

Do not patch only CSS; accessibility assertions inspect DOM semantics.

============================================================
BW. TEST REPORTING
============================================================

For every run record:

- exact command;
- exit code;
- executed;
- passed;
- failed;
- not exercised;
- root cause.

For property tests:
- seed;
- path;
- counterexample.

Filtered-out tests are not passed.

Do not edit test-results.xml.

============================================================
BX. TASK 22 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-22-dashboard.md

Include:

1. Starting commit.
2. Working branch task-22.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 12 test count.
6. Published 110-point items vs total 130 note.
7. Exact current 12d score split from config/scores.ts.
8. Existing dashboard DOM/selectors.
9. Balance API/mock shape.
10. Balance rendering.
11. Exact total calculation.
12. XSS-safe DOM strategy.
13. Order-book input shape.
14. bid/ask sorting.
15. best marker.
16. malformed-price policy.
17. ten-level cap.
18. +N more semantics.
19. risk rendering.
20. state model: loading/empty/ready/error.
21. aria-busy behavior.
22. alert behavior.
23. table caption/header accessibility.
24. `formatMinorUnits` signature.
25. exact formatting algorithm.
26. RangeError validation.
27. Challenge 12d exact assertions.
28. buildSignedRequestInit behavior.
29. signed path.
30. raw-body strategy.
31. required signing headers.
32. X-Algorithm/X-Signature-Algorithm compatibility.
33. nonce/timestamp strategy.
34. secret handling.
35. exact files changed.
36. typecheck.
37. 12a result.
38. 12b result.
39. 12c result.
40. 12d result.
41. 12e result.
42. 12f result.
43. 12g result.
44. full Challenge 12 result.
45. Challenge 0t/1c signing regression.
46. Challenge 11 result.
47. Challenge 13 result.
48. broader regressions.
49. browser smoke-check result.
50. full-suite result.
51. protected-file confirmation.
52. suggested commit.
53. master merge/push workflow.
54. next Task 23: demo data/accounts API.

Do not include:
- real HMAC secret;
- tokens;
- credentials.

============================================================
BY. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat

Review:

git diff -- client/index.html
git diff -- client/js/dashboard.js
git diff -- client/dashboard.css
git diff -- client/js/app.js
git diff -- client/js/signer.js
git diff -- docs/clearhouse-task-22-dashboard.md

Only review/stage files that actually changed.

Confirm:

- tests unchanged;
- config unchanged;
- package unchanged;
- migrations/seeds unchanged;
- no test detection;
- no unsafe innerHTML with API data;
- no secret embedded;
- signer LF protocol preserved;
- no server auth protocol broken;
- no WebSocket/liveFeed future work;
- no Task 23+ backend work.

============================================================
BZ. TASK 22 COMPLETION CRITERIA
============================================================

Task 22 is COMPLETE only when:

DISCOVERY

[ ] challenge12 read completely.
[ ] exact test count recorded.
[ ] exact 12d tests discovered.
[ ] config/scores inspected read-only.
[ ] exact DOM selectors recorded.
[ ] exact imported functions/signatures preserved.

BALANCES

[ ] one row per asset.
[ ] available rendered.
[ ] held rendered.
[ ] total exact.
[ ] no Number money arithmetic.
[ ] empty balance state distinct.
[ ] ready state distinct.

SECURITY

[ ] asset markup renders literal text.
[ ] no untrusted innerHTML.
[ ] no eval/document.write.
[ ] error/untrusted strings use textContent.

ORDER BOOK

[ ] bids sorted descending.
[ ] asks sorted ascending.
[ ] BigInt-safe comparison.
[ ] input arrays not mutated.
[ ] first displayed bid marked best.
[ ] first displayed ask marked best.
[ ] no other row marked best.
[ ] malformed prices do not crash.
[ ] deep side capped at 10.
[ ] correct +N more.
[ ] empty book distinct.

RISK

[ ] open-order count rendered.
[ ] committed exposure rendered.
[ ] no browser-side invented risk calculation.

STATES

[ ] loading distinct.
[ ] empty distinct.
[ ] ready distinct.
[ ] error distinct.
[ ] stale prior state does not leak incorrectly.
[ ] aria-busy correct.
[ ] error role alert correct.

MONEY

[ ] formatMinorUnits exact.
[ ] large integers exact.
[ ] negatives exact.
[ ] leading zeros correct.
[ ] small fractions correct.
[ ] zero correct.
[ ] exponent 0 correct.
[ ] malformed input RangeError.
[ ] no scientific notation.

SIGNING

[ ] Task 5 signer reused.
[ ] LF canonical signer preserved.
[ ] exact path signed.
[ ] exact sent body signed.
[ ] bodyless request signs empty body.
[ ] signature header correct.
[ ] timestamp header correct.
[ ] nonce header correct.
[ ] server X-Algorithm compatibility preserved.
[ ] Challenge 12d X-Signature-Algorithm satisfied.
[ ] no secret exposed in source/DOM/log.
[ ] no duplicate crypto implementation.

ACCESSIBILITY

[ ] semantic table.
[ ] caption.
[ ] column headers.
[ ] loading aria-busy.
[ ] errors role=alert.

REGRESSION

[ ] typecheck passes.
[ ] Challenge 12 passes.
[ ] Challenge 0t passes.
[ ] Challenge 1c passes.
[ ] Challenge 11 passes.
[ ] Challenge 13 passes.
[ ] sanity passes.
[ ] full suite recorded honestly.
[ ] organizer tests untouched.
[ ] config/package/migrations unchanged.
[ ] Task 22 note created.
[ ] final Git target master.

If any current Challenge 12 test fails:
- status = PARTIAL;
- name exact failing assertion/root cause.

============================================================
CA. FINAL CURSOR REPORT
============================================================

Return:

1. Task 22 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Exact Challenge 12 test count.
6. Current 12d score/test details.
7. Balance renderer.
8. XSS-safe rendering strategy.
9. State-transition strategy.
10. Order-book sorting/best logic.
11. malformed-price policy.
12. deep-book cap/+N logic.
13. risk renderer.
14. formatMinorUnits implementation.
15. accessibility implementation.
16. buildSignedRequestInit implementation.
17. exact signing headers.
18. X-Algorithm / X-Signature-Algorithm compatibility.
19. raw-body/path signing behavior.
20. nonce/timestamp behavior.
21. secret handling.
22. typecheck.
23. Challenge 12a result.
24. 12b result.
25. 12c result.
26. 12d result.
27. 12e result.
28. 12f result.
29. 12g result.
30. full Challenge 12 result.
31. Challenge 0t/1c result.
32. Challenge 11 result.
33. Challenge 13 result.
34. broader regression.
35. browser smoke-check result.
36. full-suite result.
37. remaining future failures.
38. confirmation protected files unchanged.
39. final diff summary.
40. reviewed Git commands targeting master.

Suggested commit:

feat: complete operator dashboard

Do not automatically commit, merge, or push.
````

---

# Task 22 reference acceptance matrix

| Area | Required behavior |
|---|---|
| Balance rows | One per asset |
| Balance fields | available / held / total |
| Asset text | XSS-safe literal text |
| Balance empty | Distinct empty state |
| Ready/loading/error | Distinguishable |
| Risk | open orders + committed exposure |
| Bids | Highest first |
| Asks | Lowest first |
| Best marker | First displayed valid row only |
| Deep book | Max 10 levels/side |
| Extra levels | `+N more` |
| Malformed price | Never crashes render |
| Money | Exact minor-unit formatting |
| Malformed money | `RangeError` |
| Loading a11y | `aria-busy` |
| Error a11y | `role="alert"` |
| Tables | caption + column headers |
| Signing | Reuse browser HMAC signer |
| Raw body | Signed bytes == sent bytes |
| Algorithm compatibility | Preserve `X-Algorithm`; satisfy tested `X-Signature-Algorithm` |
| Secret | Never exposed |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 22

Official final branch:

**`master`**

Workflow:

**`master` → `task-22` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 22 branch

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
task-22
```

Final:

```text
master
```

---

## 2. Run final Task 22 verification

```powershell
npm run typecheck

npm test challenge12.test.ts

npm test challenge00b.test.ts -t "Challenge 0t"

npm test challenge01.test.ts -t "Challenge 1c"

npm test challenge11.test.ts

npm test challenge13.test.ts

npm test challenge10.test.ts

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
npm test challenge12.test.ts -t "Challenge 12a"
npm test challenge12.test.ts -t "Challenge 12b"
npm test challenge12.test.ts -t "Challenge 12c"
npm test challenge12.test.ts -t "Challenge 12d"
npm test challenge12.test.ts -t "Challenge 12e"
npm test challenge12.test.ts -t "Challenge 12f"
npm test challenge12.test.ts -t "Challenge 12g"
```

Then:

```powershell
npm test
```

---

## 3. Review Task 22 changes

```powershell
git status --short
git diff --stat
```

Review actual changed frontend files:

```powershell
git diff -- client/index.html
git diff -- client/js/dashboard.js
git diff -- client/js/app.js
git diff -- client/js/signer.js
git diff -- client/dashboard.css
git diff -- docs/clearhouse-task-22-dashboard.md
```

Only files that actually changed should be staged.

Check especially:
- no real secret;
- no unsafe `innerHTML` for untrusted data;
- no signer separator regression.

---

## 4. Stage only Task 22 files

Always stage the engineering note if created:

```powershell
git add -- docs/clearhouse-task-22-dashboard.md
```

Expected primary file:

```powershell
git add -- client/js/dashboard.js
```

Only if genuinely changed:

```powershell
git add -- client/index.html
git add -- client/dashboard.css
git add -- client/js/app.js
git add -- client/js/signer.js
```

If stylesheet path differs, use actual path.

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

Before committing confirm no staged:
- tests;
- config;
- package files;
- secret/env values;
- unrelated backend work.

---

## 6. Commit Task 22

```powershell
git commit -m "feat: complete operator dashboard"
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

If simply behind:

```powershell
git pull --ff-only origin master
```

---

## 8. Merge Task 22

Prefer:

```powershell
git merge --ff-only task-22
```

If fast-forward is not possible:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If valid histories diverged:

```powershell
git merge task-22
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
npm test challenge12.test.ts
npm test challenge00b.test.ts -t "Challenge 0t"
npm test challenge01.test.ts -t "Challenge 1c"
npm test challenge11.test.ts
git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge13.test.ts
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

Local HEAD must match remote `refs/heads/master`.

---

# If push is rejected

Do not force.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If safe for the local-only Task 22 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge12.test.ts
npm test challenge00b.test.ts -t "Challenge 0t"
npm test challenge01.test.ts -t "Challenge 1c"
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts deliberately.

---

# Fast Task 22 checklist

- [ ] branch = task-22
- [ ] final branch = master
- [ ] challenge12 fully read
- [ ] hidden/omitted 12d inspected
- [ ] config/scores read-only
- [ ] exact DOM selectors preserved
- [ ] one balance row per asset
- [ ] exact available/held/total
- [ ] XSS-safe asset rendering
- [ ] distinct balance empty state
- [ ] distinct book empty state
- [ ] loading/ready/error distinct
- [ ] risk open-order count
- [ ] risk committed exposure
- [ ] bids best-first
- [ ] asks best-first
- [ ] only first row marked best
- [ ] price compare BigInt-safe
- [ ] malformed price doesn't crash
- [ ] cap 10 levels/side
- [ ] correct +N more
- [ ] input arrays not mutated
- [ ] formatMinorUnits exact
- [ ] negative exact
- [ ] leading zeros exact
- [ ] small fractions exact
- [ ] exponent zero exact
- [ ] malformed input RangeError
- [ ] tables have captions
- [ ] headers use th
- [ ] aria-busy
- [ ] role alert
- [ ] Task 5 signer reused
- [ ] signed body equals sent body
- [ ] exact path signed
- [ ] secure nonce
- [ ] timestamp correct
- [ ] X-Algorithm preserved
- [ ] X-Signature-Algorithm satisfies 12d
- [ ] no HMAC secret exposed
- [ ] Challenge12 passes
- [ ] Challenge0t passes
- [ ] Challenge1c passes
- [ ] Challenge11 passes
- [ ] Challenge13 passes
- [ ] sanity passes
- [ ] full suite recorded
- [ ] no tests/config/package/migration changes
- [ ] Task 22 note created
- [ ] committed on task-22
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 23 — Demo Data / Accounts API.
