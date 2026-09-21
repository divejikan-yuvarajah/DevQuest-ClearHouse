# ClearHouse — Complete Enhanced Cursor Prompt for Task 24

**Task:** Challenge 20c — Informative Dashboard: Accounts, Portfolio, Risk Usage, Recent Trades  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-24`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 24 purpose

Task 24 completes **Challenge 20c — An Informative Dashboard**.

Task 23 already owns:

- **20a — Initial demo data**
- **20b — `GET /api/ledger/accounts`**

Task 24 owns only:

- **20c-1 — account list**
- **20c-2 — portfolio summary**
- **20c-3 — risk usage meters**
- **20c-4 — recent trades**

This task must turn the real API/demo data into useful operator-facing dashboard information while preserving all correctness and security work from Task 22.

Do not redesign the backend unless the current organizer tests prove a small integration defect is directly required for 20c.

Do not implement real-time WebSockets yet. That belongs to Tasks 31–32.

---

# Published Challenge 20c contract — 80 points

## 20c-1 — Account list — 20 pts

The account list must show **every account by name** with:

- exact exponent-aware holdings;
- a status badge.

The current organizer test determines:

- exact selectors;
- exact account/balance display shape;
- whether all accounts or a tested subset are passed directly to the renderer;
- exact status badge classes/text/attributes.

Do not guess selector names.

---

## 20c-2 — Portfolio summary — 25 pts

The dashboard must:

- count the accounts;
- aggregate each asset exactly across all accounts;
- format each asset using its correct exponent.

No floating-point summation.

No cross-asset aggregation.

Use exact integer minor units.

---

## 20c-3 — Risk usage — 20 pts

The dashboard must show how much of **each tested risk limit** is used.

The meter state must:

- become **warning at 80%**;
- become **danger at 100%**.

Read the exact Challenge 20 test to identify:

- which limits are rendered;
- exact `used` and `limit` field names;
- expected percentages/text;
- exact warning/danger classes or attributes;
- zero/unlimited/absent-limit semantics.

Do not guess the risk payload.

---

## 20c-4 — Recent trades — 15 pts

The recent-trades view must:

- display at most **10 trades**;
- sort them **newest first**;
- display each trade's **exact notional**;
- render a clear empty state when there are no trades.

Read the exact test to identify:

- timestamp field;
- trade price/quantity fields;
- asset/exponent used for notional formatting;
- exact selectors/empty text.

Do not use floating-point notional arithmetic.

---

# Challenge 20 score split

```text
20a = 55  -> Task 23
20b = 25  -> Task 23
20c = 80  -> Task 24
-------------------
Total = 160
```

Task 24 should complete the remaining 80-point dashboard portion.

These are available points only, not an earned-score claim.

---

# Critical dependencies Task 24 must preserve

## Task 22 — Operator Dashboard

Preserve:

- XSS-safe DOM construction;
- `formatMinorUnits(...)`;
- exact BigInt formatting;
- loading / empty / ready / error states;
- table accessibility;
- `aria-busy`;
- `role="alert"`;
- browser request signing;
- safe `buildSignedRequestInit(...)`.

Do not reintroduce unsafe `innerHTML`.

## Task 23 — Demo Data + Accounts API

Use:

- `GET /api/ledger/accounts`;
- real account names;
- real status;
- real balances;
- exact minor-unit strings.

Do not hardcode the demo accounts in client JS.

## Task 21 — API Design

Preserve:

- `{ data, meta }` success envelopes;
- `/api` / `/api/v1` compatibility;
- auth/signing middleware;
- standard errors.

## Task 17 / Challenge 05 — Risk

The dashboard should render risk state returned by the existing risk API/helpers.

Do not recalculate the whole risk engine in the browser.

## Tasks 14–16 — Matching / trades

Recent trades must represent real trade data.

Do not fabricate or hardcode trades.

Use the current trade API/helper/current in-memory data contract that Challenge 20 tests.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 24

Copy the entire block below into Cursor Agent mode.

````text
Act as my senior vanilla-JavaScript fintech dashboard engineer, exact-arithmetic reviewer, and frontend security/accessibility engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 24 ONLY: implement Challenge 20c — account list, exact portfolio summary, risk-usage meters, and recent trades.

Preserve all Tasks 1–23.

Task 23 already implements demo seeding and the accounts API.
Task 22 already implements the base operator dashboard.

Do not implement WebSockets/live updates, Swagger, event sourcing, fees, netting, or other later tasks.

Do not stop at a plan. Inspect, implement, test, document, and show reviewed Git commands.

Do not automatically commit, merge, or push.

============================================================
A. REPOSITORY / DELIVERY CONTEXT
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

task-24

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–23;
- work on task-24;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT TASK 24 SCOPE
============================================================

IMPLEMENT ONLY:

Challenge 20c-1:
- account list;
- account names;
- exponent-aware holdings;
- account status badges.

Challenge 20c-2:
- account count;
- exact per-asset portfolio totals;
- exponent-aware aggregate display.

Challenge 20c-3:
- risk usage for every tested limit;
- usage meters;
- warning threshold at 80%;
- danger threshold at 100%.

Challenge 20c-4:
- recent trades;
- newest first;
- max 10;
- exact notional;
- no-trades empty state.

PRESERVE:

- Task 22 base dashboard/rendering/signing;
- Task 23 seeded data/accounts API;
- existing backend APIs;
- Task 21 response envelopes/versioning;
- all exact-money behavior.

DO NOT IMPLEMENT:

- Challenge 17 live dashboard updates;
- Challenge 18 WebSocket feed;
- Task 25 Swagger/OpenAPI;
- Task 26 events/replay;
- Task 27 market data;
- Task 28 fees;
- Task 29 netting;
- Task 30 strategies;
- Task 31 WebSocket server;
- Task 32 live client;
- Task 33 final integration.

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

Task 24 has NO seed exception.
Task 23 already handled seeds.

Do NOT add production/client code checking:

- NODE_ENV === "test";
- VITEST;
- organizer test names;
- known demo account names;
- exact visible test balances;
- exact visible trade IDs/timestamps;
- exact test risk limits.

Do NOT install:
- React;
- Vue;
- Svelte;
- chart libraries;
- decimal libraries;
- date libraries;
- sanitization libraries.

Use:
- existing vanilla JS;
- existing HTML/CSS;
- BigInt;
- safe DOM APIs.

Do NOT:
- use floating-point money/notional aggregation;
- use unsafe innerHTML with API data;
- expose HMAC/JWT secrets;
- weaken request signing.

No destructive Git:
- no git reset --hard;
- no git clean -fd;
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

Verify Task 23 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-23 exists:

git log --oneline --decorate --max-count=10 task-23

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-24

If task-24 already exists:

git branch --list task-24
git log --oneline --decorate --max-count=10 task-24

Do not delete/recreate blindly.

Record:
- starting commit;
- current branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
E. VERIFY TASK 22–23 PREREQUISITES
============================================================

Read if present:

- docs/clearhouse-task-22-dashboard.md
- docs/clearhouse-task-23-demo-seed-accounts-api.md
- docs/clearhouse-task-21-api-cache-performance.md
- docs/clearhouse-task-17-risk.md

Verify actual source.

Read:

- client/index.html
- client/js/app.js
- client/js/dashboard.js
- client/js/signer.js
- client/js/liveFeed.js
- actual dashboard stylesheet

Read relevant current backend surfaces used by dashboard:
- accounts endpoint/controller
- risk endpoint/controller
- trade/history endpoint/controller
- asset registry API/helper if dashboard receives exponent metadata

Do not assume endpoint paths from this prompt.

============================================================
F. BEFORE-EDIT REGRESSION BASELINE
============================================================

Run:

npm run typecheck

npm test challenge20.test.ts -t "Challenge 20a|Challenge 20b"

npm test challenge12.test.ts

npm test challenge11.test.ts

Confirm Task 23 and Task 22 are healthy before attributing failures to Task 24.

If exact labels differ, use actual current labels.

============================================================
G. READ CHALLENGE 20 COMPLETELY
============================================================

Read:

tests/challenge20.test.ts

from first line to last line.

Focus especially on every 20c test helper, DOM fixture, selector, expected class, exact text, object shape, and directly imported export.

Read:

config/scores.ts

READ ONLY.

Build a pre-edit map:

20c test
| exact exported function
| input shape
| DOM selector
| expected output
| exact arithmetic rule
| state/class rule
| likely file

Record:
- exact test count;
- exact selectors;
- function names/exports;
- account object shape;
- balance object shape;
- asset exponent source;
- risk payload shape;
- trade payload shape;
- timestamp field;
- notional formula;
- expected sort;
- empty-state text/selector.

Do not rename any tested export or selector.

============================================================
H. RUN TASK 24 BASELINE
============================================================

Run:

npm test challenge20.test.ts -t "Challenge 20c"

If labels exist, also:

npm test challenge20.test.ts -t "Challenge 20c-1"
npm test challenge20.test.ts -t "Challenge 20c-2"
npm test challenge20.test.ts -t "Challenge 20c-3"
npm test challenge20.test.ts -t "Challenge 20c-4"

Use actual test labels.

Record:
- exact executed count;
- pass/fail;
- exact first root cause for each failure.

============================================================
I. PRESERVE TASK 22 DOM / TEST CONTRACT
============================================================

Task 22 already established exact DOM selectors for:
- balances;
- order book;
- risk state;
- loading/empty/error/ready;
- accessibility.

Challenge 20 may add new sections/selectors.

Do not rename existing Task 22 IDs/classes/data attributes.

Read both:
- challenge12.test.ts;
- challenge20.test.ts.

Make both compatible.

============================================================
J. FRONTEND ARCHITECTURE — THIN CLIENT
============================================================

Dashboard client responsibilities:

- fetch/receive API data;
- aggregate/present data where Challenge 20 explicitly requires client aggregation;
- safely render.

Do NOT duplicate backend:
- risk-engine decision logic;
- matching logic;
- settlement;
- account status rules.

Do not create hardcoded demo view models.

============================================================
K. ACCOUNT LIST — 20c-1
============================================================

Render EVERY account provided by the current accounts API/test input.

Each account must display:
- name;
- exact exponent-aware holdings;
- status badge.

Read exact test for whether it also expects:
- account ID;
- type;
- per-asset available/held/total labels.

Do not guess additional required text.

============================================================
L. ACCOUNT SORT ORDER
============================================================

Task 23 accounts API should already sort by name.

Do not assume input is always sorted if Challenge 20 renderer tests call function directly with unsorted data.

Read test.

If renderer itself must preserve/sort:
- use exact expected comparator;
- do not mutate input array.

Do not reorder contrary to API/test contract.

============================================================
M. ACCOUNT NAMES ARE UNTRUSTED
============================================================

Use:

element.textContent = account.name

Never:
- innerHTML;
- insertAdjacentHTML

with account names.

Task 22 XSS guarantee remains global.

Status strings and asset codes should also use textContent.

Do not inject arbitrary class names directly from untrusted status strings without validation/mapping.

============================================================
N. STATUS BADGE — 20c-1
============================================================

Read exact test.

Likely statuses:
- active;
- closed.

Map known status values to:
- tested visible text;
- tested class/data-state.

Do not concatenate arbitrary API status directly into HTML/class strings.

Use an allowlisted mapping.

Unknown status:
- display safely;
- use neutral class if current test/UI contract supports it;
- do not crash.

Do not falsely show every account active.

============================================================
O. EXPONENT-AWARE HOLDINGS
============================================================

Every asset's integer minor-unit holding must be shown using its correct exponent.

Reuse:

formatMinorUnits(...)

from Task 22.

Do not:
- duplicate money formatting;
- use Number;
- use `toFixed` on converted numbers.

Find exponent from exact current data contract:
- balance row;
- asset metadata map;
- registry data passed to render helper.

Do not guess exponent from asset string in multiple places if a registry/helper already exists.

============================================================
P. WHAT COUNTS AS AN ACCOUNT HOLDING
============================================================

Read Challenge 20 test.

If balance row contains:
- available;
- held;
- total;

use the exact tested holding concept.

Published wording says "holdings".

Task 23 may already return `total`.

Do not accidentally sum:
available + held + total

which double-counts.

If total isn't provided:
compute:

BigInt(available) + BigInt(held)

exactly.

If total is provided and organizer treats it as authoritative:
validate/format without converting to Number.

============================================================
Q. ACCOUNT WITH ZERO/NO BALANCES
============================================================

Every account should still be represented if input contains it.

For no balances:
- render the exact empty/none holdings text expected by test;
- do not omit account.

For zero balance rows:
- format zero correctly at asset exponent.

Do not invent an asset row that doesn't exist.

============================================================
R. PORTFOLIO SUMMARY — 20c-2
============================================================

Portfolio summary must:
- count accounts exactly;
- aggregate holdings independently by asset;
- format each aggregate using correct exponent.

Use:

Map<string, bigint>

or equivalent exact structure.

No global mixed-asset sum.

============================================================
S. ACCOUNT COUNT
============================================================

Count the accounts passed/returned by the relevant API according to test.

Do not count:
- balance rows;
- assets;
- only funded accounts

unless Challenge 20 explicitly filters them before calling renderer.

If internal/house accounts are present and API includes them:
follow test input/expected count.

Do not special-case demo names.

============================================================
T. PORTFOLIO ASSET AGGREGATION
============================================================

For each account's balances:

assetTotal += exact holding minor units

Use BigInt.

If holding is:
total:
  aggregate total once.

If only available/held:
  holding = available + held.

Do not include both total and components twice.

============================================================
U. PORTFOLIO EXACTNESS BEYOND 2^53
============================================================

Use:

BigInt(value)

Never:
- Number(value)
- parseInt(value)
- parseFloat(value)

Property/hidden tests may use large values.

Serialize/display through formatMinorUnits.

No scientific notation.

============================================================
V. PORTFOLIO ASSET ORDER
============================================================

Read test.

If summary assets are expected in:
- registry order;
- lexical order;
- first-seen order;

follow exact contract.

Do not depend accidentally on object property order if test asserts DOM row sequence.

Use a deterministic explicit sort if required.

============================================================
W. PORTFOLIO EXPONENT CONSISTENCY
============================================================

For each asset:
- determine one valid exponent;
- use it consistently.

If conflicting exponent metadata appears in input:
follow current validation/test behavior.

Do not silently format the same asset with different decimals per account.

Use registry metadata if available.

============================================================
X. PORTFOLIO INPUT IMMUTABILITY
============================================================

Do not mutate:
- account arrays;
- balance arrays;
- balance objects.

Aggregation should be pure.

This matters because tests may reuse fixtures.

============================================================
Y. RISK USAGE — 20c-3
============================================================

Read the exact risk input in challenge20.

Build a table:

limit
| used field
| max/limit field
| units
| display formatting
| meter semantics

Potential limits could involve:
- open orders;
- order quantity;
- position;
- notional/exposure.

These are examples only.

Do not implement fields not required by current test.

============================================================
Z. RISK DISPLAY MUST USE BACKEND STATE
============================================================

Do not reconstruct risk reservations by parsing orders in the browser.

Use the current risk API/test object.

The client may calculate:

usage classification/percentage

from:
- used;
- configured limit

because 20c requires meters.

But backend decides actual risk state.

============================================================
AA. WARNING / DANGER EXACT THRESHOLDS
============================================================

Published rule:

warning at 80%
danger at 100%

This means classification must be exact at boundaries.

Recommended conceptual logic for exact nonnegative integers:

if used * 100n >= limit * 100n:
    danger
else if used * 100n >= limit * 80n:
    warning
else:
    normal

Simplify algebraically if safe.

Do not use imprecise floating point for classification if values may exceed 2^53.

For integer used/limit:

danger when:
used >= limit

warning when:
used * 5n >= limit * 4n

normal otherwise.

Read test for over-limit values.

============================================================
AB. RISK TYPES MAY DIFFER
============================================================

Some risk metrics may be integer counts:
- open orders.

Others may be exact quantities/notional strings.

Create a small exact parser/helper that respects current input types.

Do not funnel every value through Number.

Do not use percentage arithmetic on formatted decimal strings.

============================================================
AC. ZERO LIMIT / UNLIMITED LIMIT
============================================================

Read test.

Do not divide by zero.

Possible contracts:
- limit 0 means zero allowed => any positive use danger;
- limit 0 + used 0 => 0%/normal;
- null/missing means unlimited/unconfigured.

Do not invent.

Implement exact organizer semantics.

At minimum:
- no Infinity/NaN;
- no crash.

============================================================
AD. RISK METER DOM
============================================================

Read exact test selectors.

The test may inspect:
- `<meter>`;
- progress bar width/value;
- `aria-valuenow`;
- class;
- data-state;
- text.

Implement exactly the tested semantics.

If using `<meter>`:
set numeric DOM properties only after safely deriving a bounded display percentage; do not use Number for financial aggregation logic itself.

Classification must remain exact.

============================================================
AE. RISK PERCENTAGE DISPLAY
============================================================

Read test.

If exact whole percentage is expected:
derive without floating precision errors.

For bigint used/limit, compute as required:
- floor;
- rounded;
- capped;
- uncapped.

Do not guess rounding.

If only classes are asserted:
avoid unnecessary decimal percent complexity.

============================================================
AF. RISK METER OVER 100%
============================================================

If used > limit:
- state remains danger;
- display may cap visual width at 100 while textual usage can show over-limit, depending on test.

Do not let CSS width become absurd/unbounded.

Read exact expected behavior.

============================================================
AG. RISK LIMIT LABEL SAFETY
============================================================

Use static/allowlisted labels.

Do not directly convert arbitrary API keys into unsafe HTML.

Render values via textContent.

============================================================
AH. RECENT TRADES — 20c-4
============================================================

Render at most:

10 trades

Sort:

newest first

Do not trust API input order unless test says endpoint is already ordered AND direct renderer test doesn't require sorting.

Task 20 explicitly requires newest-first behavior.

============================================================
AI. IDENTIFY TRADE TIMESTAMP FIELD
============================================================

Read challenge20 test and current trade API.

Possible fields:
- timestamp;
- createdAt;
- executedAt;
- sequence/time.

Do not guess.

Use exact field.

============================================================
AJ. TRADE SORTING
============================================================

Use a copy:

const sorted = [...trades]

Do not mutate input.

Sort newest first.

If timestamps tie:
use deterministic test-compatible secondary ordering:
- sequence;
- trade ID;
- original stable order

according to current contract.

Do not use locale string comparison if timestamps are numeric epochs.

============================================================
AK. DATE / TIME PARSING
============================================================

Only parse what current trade format requires.

Do not use:
- new Date on arbitrary string for sort

if test provides numeric timestamp/sequence.

Use exact organizer field type.

If rendering human time is not required:
do not invent locale-dependent time strings that make tests flaky.

============================================================
AL. RECENT TRADE CAP
============================================================

Apply cap after canonical newest-first sorting.

Then:

sorted.slice(0, 10)

Do not cap first and sort only those 10, because that can omit newer trades later in input.

============================================================
AM. TRADE NOTIONAL — EXACTNESS
============================================================

Recent trade notional must be exact.

Determine exact formula from current matching/trade model.

Typically:

notionalMinor = price * quantity

but price/quantity scaling may require asset/currency exponent semantics.

DO NOT assume naive multiplication if test defines a different scaling.

Read:
- challenge20 test oracle;
- trade object;
- matching-engine price representation;
- asset registry.

Use the exact organizer model.

============================================================
AN. TRADE PRICE / QUANTITY PARSING
============================================================

Use strict BigInt-safe parsing.

Never:

Number(price) * Number(quantity)

Never parseFloat.

Malformed trade data:
- read test/current behavior;
- do not crash whole dashboard if reasonable safe fallback is expected.

Do not silently fabricate zero notional for malformed trades unless test says so.

============================================================
AO. NOTIONAL ASSET / EXPONENT
============================================================

Identify which asset denomination notional represents.

Possible:
- quote/cash asset.

Use its correct exponent for `formatMinorUnits`.

Do not format notional with base asset exponent.

Read trade/market metadata.

============================================================
AP. MARKET METADATA
============================================================

If trade only contains:
- symbol/market
- price/quantity

and exponent metadata comes from current market/asset registry:
reuse that existing map/API.

Do not create a second hardcoded symbol parser unless current architecture already has one.

============================================================
AQ. TRADE DISPLAY FIELDS
============================================================

Read exact Challenge 20c-4 selectors.

Render only required/useful tested fields such as:
- market;
- side;
- price;
- quantity;
- notional;
- time.

Do not clutter with raw internal objects.

Always textContent untrusted strings.

============================================================
AR. NO-TRADES EMPTY STATE
============================================================

When trade list is empty:

render the exact tested no-trades state/message.

Do not:
- render an empty table only;
- leave stale previous trades;
- mark error.

Empty is a successful state, not an error.

============================================================
AS. RECENT TRADES READY / ERROR STATE
============================================================

If fetch succeeds:
- 0 trades => empty;
- >0 => ready.

If fetch fails:
- error state;
- role=alert if using Task 22 section-state semantics;
- do not pretend there are no trades.

Differentiate:
empty vs error.

============================================================
AT. ACCOUNT LIST EMPTY / ERROR
============================================================

If accounts API returns []:
use an explicit empty state if Challenge 20/test expects.

Do not render portfolio account count stale from prior data.

Portfolio summary for [] should be:
- count 0;
- no fabricated asset totals

according to test.

============================================================
AU. ONE SOURCE OF ACCOUNT DATA
============================================================

For account list and portfolio summary:
use the SAME fetched accounts dataset per refresh/load.

Do not issue:
- one accounts request for list;
- another race-prone separate accounts request for summary

unless current architecture/test specifically requires separate calls.

A single response reduces drift.

============================================================
AV. FETCH ORCHESTRATION
============================================================

Inspect current `app.js`.

Task 24 may need:
- accounts fetch;
- risk fetch;
- trades fetch.

Do not rewrite all dashboard loading.

Reuse current signed fetch helper.

Preserve:
- exact request signing;
- authorization;
- response envelope.

============================================================
AW. PARALLEL FETCHES
============================================================

Independent dashboard requests may be fetched with Promise.all/Promise.allSettled if current UI/state architecture benefits.

But section failures should ideally remain section-local:
- accounts failure shouldn't necessarily erase order book.

Read tests.

Do not create all-or-nothing page failure if Challenge 20 expects independent sections.

============================================================
AX. PRESERVE REQUEST SIGNING
============================================================

Use:

buildSignedRequestInit(...)

or exact Task 22 helper.

Do not:
- use unsigned fetch for protected risk/trade/account routes;
- duplicate crypto;
- expose secret.

Sign exact raw request body/path.

============================================================
AY. TASK 21 RESPONSE ENVELOPE
============================================================

Read:

response.data

and current meta.

Do not expect bare API arrays if Task 21/23 standardized envelopes.

Validate shape narrowly enough to avoid crashes.

Do not silently accept a server error body as empty data.

============================================================
AZ. API PATHS — DISCOVER, DON'T INVENT
============================================================

Determine exact existing endpoints from:
- routes;
- challenge20 test mocks;
- app.js.

Do not invent new REST endpoints just for convenience.

If Challenge 20 tests only renderer functions with direct fixtures:
keep backend untouched.

============================================================
BA. BACKEND CHANGE POLICY
============================================================

Task 24 should normally change client files only.

Only change backend if:
- current Challenge 20c explicitly makes a real HTTP call;
- an existing intended endpoint has a small direct defect preventing required data;
- the fix belongs to existing challenge functionality, not a future feature.

If backend change is required:
- make it minimal;
- preserve API envelopes/security;
- document why.

Do not add new schema/migrations.

============================================================
BB. SAFE DOM CONSTRUCTION
============================================================

For all data-derived text:

textContent

Do not use untrusted values in:
- innerHTML;
- className without allowlist;
- style attribute without numeric validation;
- event-handler attributes.

Construct rows/cards/elements with DOM APIs.

============================================================
BC. CLASS NAME ALLOWLISTS
============================================================

For status/risk states use explicit mapping:

active -> known class
closed -> known class

normal/warning/danger -> known classes

Do not do:

element.className = `badge ${apiValue}`

for arbitrary untrusted API strings.

============================================================
BD. CSS / VISUAL STATES
============================================================

Add minimal CSS needed for:
- account cards/table;
- status badges;
- portfolio summary;
- risk meter normal/warning/danger;
- recent trades;
- empty state.

Do not perform full redesign.

Do not break Task 22 selectors/layout.

============================================================
BE. WARNING / DANGER COLOR IS NOT ENOUGH
============================================================

Risk state should have:
- class/data-state;
- optional text label;
- accessible semantics

so state is not conveyed only by color.

Follow organizer test.

============================================================
BF. ACCESSIBILITY
============================================================

Preserve Task 22 accessibility.

For new sections:
- use headings;
- semantic tables/lists where suitable;
- table captions if using tables;
- `<th>` headers;
- progress/meter labels;
- accessible names;
- `role="alert"` for errors;
- `aria-busy` during loading if section uses async state.

Do not hide required tested content from accessibility tree.

============================================================
BG. FORMATTER REUSE
============================================================

Use one `formatMinorUnits` implementation.

Do not create:
- formatPortfolioMoney;
- formatTradeMoney

that duplicate exact logic inconsistently unless they wrap the shared function.

============================================================
BH. EXACT INTEGER PARSER
============================================================

If new aggregation helper parses monetary strings:
use strict integer grammar before BigInt.

Do not accept:
- `"1.5"`
- `"1e3"`
- whitespace

unless current API contract explicitly permits them.

Task 22 formatter already has validation behavior; reuse carefully.

============================================================
BI. AGGREGATION HELPER DESIGN
============================================================

A good Task 24 design may expose pure helpers that tests can import, such as:
- summarizePortfolio(accounts)
- classifyRiskUsage(used, limit)
- getRecentTrades(trades)

BUT DO NOT invent/rename exports without reading challenge20 first.

Preserve exact function names tests expect.

If test imports an existing stub:
implement that stub.

============================================================
BJ. PURE LOGIC VS DOM
============================================================

Separate exact arithmetic/sorting from DOM rendering where current source/test architecture permits.

Example:
- compute portfolio map
- then render safe DOM

This improves testability and avoids mixing BigInt with DOM.

Do not over-refactor Task 22.

============================================================
BK. PORTFOLIO SUMMARY OUTPUT
============================================================

Read exact DOM/test.

Possible required:
- account count element;
- one row/card per asset;
- formatted total.

Use exact selectors.

Do not add a mixed grand-total currency value unless test requires it; adding USD+BTC is meaningless.

============================================================
BL. PORTFOLIO DUPLICATE ASSET ROWS
============================================================

There must be one aggregate output per asset.

Do not render:
- one portfolio row per account balance.

Aggregate first, render once.

============================================================
BM. HELD BALANCES IN PORTFOLIO
============================================================

If "holdings" means total economic holding:
include both available and held.

Do not drop held funds from portfolio totals.

Use exact challenge20 oracle.

If test explicitly totals `balance.total`, use that once.

============================================================
BN. CLOSED ACCOUNTS IN PORTFOLIO
============================================================

Read test.

Published wording says all accounts.

Do not exclude closed account holdings unless exact test/API does.

If a legitimately closed account has zero balances, it contributes zero.

Status badge still reflects closed.

============================================================
BO. RISK LIMIT COUNT / ORDER
============================================================

Render each limit expected by test exactly once.

Use deterministic test-defined order.

Do not:
- sort by current usage unless test requires;
- duplicate meter per account accidentally.

If risk view is per selected account:
preserve current selected-account context.

============================================================
BP. ACCOUNT SELECTION CONTEXT
============================================================

Task 22 dashboard may already focus risk/order book on one account/market.

Challenge 20 account list may introduce selecting an account.

Read tests before adding selection behavior.

Do not invent complex interactivity if 20c only renders data.

If clicking an account is not tested/required:
do not expand scope.

============================================================
BQ. RISK EXACT BOUNDARY EXAMPLES
============================================================

For integer values:

79 / 100 -> normal
80 / 100 -> warning
99 / 100 -> warning
100 / 100 -> danger
120 / 100 -> danger

For arbitrary scaled exact values:
apply ratio, not string prefixes.

Do not implement:
percentage >= 79.999 due floats.

============================================================
BR. RISK COUNT LIMITS
============================================================

For count limits such as open orders:
BigInt is still safe and simple.

Do not use Number merely because visible counts are small if one shared helper supports exact integers.

If DOM `<meter>.value` requires number:
classification remains exact first;
then derive a safely bounded display number only.

============================================================
BS. TRADE NOTIONAL HALF / DECIMALS
============================================================

Do not round via floating point.

If notional formula requires integer division/scaling:
follow exact matching/test oracle rounding/truncation semantics.

Do not guess banker's rounding unless current trade model says so.

Fee-engine rounding belongs Task 28, not this task.

============================================================
BT. TRADE EMPTY STATE
============================================================

Clear stale prior rows before rendering empty state.

A second call with [] after earlier trades must not leave old trades visible.

Same for accounts/risk refresh.

============================================================
BU. IDEMPOTENT RENDERING
============================================================

Calling render function twice with same data should not duplicate rows.

Clear/replace only the dynamic container.

Preserve static headings/captions.

No accumulating event handlers if rerendered.

============================================================
BV. MALFORMED INPUT ROBUSTNESS
============================================================

Do not let one malformed account/trade/risk value cause:
- script crash;
- arbitrary HTML injection.

But do not hide organizer programming errors with broad catch returning fake data.

Use narrow validation.

Follow exact test malformed cases if any.

============================================================
BW. NO ARRAY MUTATION
============================================================

Do not mutate input arrays with in-place sort.

Use copies for:
- account sorting if needed;
- trade sorting;
- asset sorting.

Tests may assert fixtures unchanged.

============================================================
BX. DATE DISPLAY LOCALE
============================================================

If test does not assert human-formatted time:
avoid locale-specific date formatting.

If it does:
use exact required deterministic format.

Do not make test output depend on machine locale/timezone unless contract explicitly wants it.

============================================================
BY. HTML / CSS IDS
============================================================

Before editing `client/index.html`:
list all IDs/classes used by challenge12 and challenge20.

Do not create duplicate IDs.

Do not rename existing tested IDs.

Add only exact required new containers.

============================================================
BZ. TASK 24 EXPECTED FILE SCOPE
============================================================

Primary likely:
- client/js/dashboard.js
- client/js/app.js
- client/index.html
- client/dashboard.css or actual stylesheet

Possible:
- a current existing client helper module if challenge20 imports it

Normally DO NOT change:
- client/js/signer.js
- client/js/liveFeed.js
- backend
- seed files

Create/update:

- docs/clearhouse-task-24-portfolio-risk-trades-dashboard.md

Do NOT add tests.

============================================================
CA. LIVE FEED BOUNDARY
============================================================

Do not modify `liveFeed.js` to stream accounts/risk/trades.

Task 24 may load current data using normal HTTP/polling/startup mechanisms.

Real-time feed correctness belongs later.

Preserve any existing starter liveFeed code untouched unless Task 22 already integrated a harmless stub.

============================================================
CB. FULL CHALLENGE 20 VERIFICATION
============================================================

After implementation:

npm run typecheck

Run focused Task 24:

npm test challenge20.test.ts -t "Challenge 20c"

Then:

npm test challenge20.test.ts

Now expected:
- 20a pass from Task 23;
- 20b pass from Task 23;
- 20c pass from Task 24.

If full Challenge 20 doesn't pass:
diagnose whether failure is Task 23 regression or Task 24 defect.

============================================================
CC. TASK 22 DASHBOARD REGRESSION
============================================================

Run:

npm test challenge12.test.ts

This is critical because Task 24 changes same client files.

Preserve:
- balance/order book/risk base rendering;
- XSS safety;
- states;
- formatter;
- order sorting;
- accessibility;
- browser signing.

============================================================
CD. TASK 23 BACKEND/SEED REGRESSION
============================================================

Run:

npm test challenge20.test.ts -t "Challenge 20a|Challenge 20b"

Use actual labels.

Task 24 must not modify Task 23 seed/backend behavior.

============================================================
CE. API REGRESSION
============================================================

Run:

npm test challenge11.test.ts

The dashboard client must stay compatible with current API contract.

============================================================
CF. RISK REGRESSION
============================================================

Run:

npm test challenge05.test.ts

Task 24 must not modify risk engine semantics.

============================================================
CG. MATCHING / TRADES REGRESSION
============================================================

Run:

npm test challenge03.test.ts

Do not change matching just to make recent trades render.

============================================================
CH. ACCOUNT REGRESSION
============================================================

Run:

npm test challenge13.test.ts

Account statuses used by badges must remain backend truth.

============================================================
CI. SIGNING REGRESSION
============================================================

If `app.js` signed fetch flow changed, run:

npm test challenge00b.test.ts -t "Challenge 0t"

npm test challenge01.test.ts -t "Challenge 1c"

Use actual labels.

Do not touch signer without a proven need.

============================================================
CJ. BROADER REGRESSION
============================================================

Run:

npm test challenge10.test.ts
npm test challenge09.test.ts
npm test challenge04.test.ts
npm test challenge02.test.ts
npm test _sanity.test.ts

Then:

git diff --check

Finally:

npm test

Record Task 25+ failures honestly.

============================================================
CK. OPTIONAL MANUAL BROWSER SMOKE CHECK
============================================================

Only after automated tests.

Use HTTP/Live Server as current guide requires.

Do not use file:// if modules/fetch fail.

With a safe disposable demo setup, visually inspect:
- account list names/status;
- holdings decimals;
- portfolio account count;
- per-asset totals;
- risk meter normal/warning/danger;
- recent trades max 10/newest first;
- no-trades state if reproducible;
- no console errors;
- keyboard/readability.

Do not expose HMAC secret in report/screenshots.

If no browser check is run:
report NOT RUN.

============================================================
CL. FAILURE DIAGNOSIS — 20c-1
============================================================

If account list test fails:

check:
- wrong input envelope (`response` vs `response.data`);
- missing account name;
- holdings using available only instead of total;
- wrong exponent;
- status badge selector/class/text;
- unsafe/incorrect DOM structure;
- skipped accounts with [] balances;
- duplicated render rows.

Do not hardcode demo account names.

============================================================
CM. FAILURE DIAGNOSIS — 20c-2
============================================================

If portfolio total wrong:

check:
- Number conversion precision;
- double-counting total + available + held;
- grouping by wrong asset;
- dropped held values;
- account filtered incorrectly;
- exponent only affects formatting, not raw sum;
- stale rows from prior render.

Use BigInt reference.

============================================================
CN. FAILURE DIAGNOSIS — 20c-3
============================================================

If warning/danger wrong:

check exact boundaries:
- 80%;
- 100%.

Check:
- used and limit fields reversed;
- Number overflow;
- limit 0 handling;
- class applied to wrong element;
- meter value capped/classification not;
- stale class not removed when usage decreases.

When re-render:
remove previous normal/warning/danger class before applying new.

============================================================
CO. FAILURE DIAGNOSIS — 20c-4
============================================================

If trades order/cap wrong:

check:
- slice before sort;
- ascending instead of descending;
- timestamp field;
- input mutation;
- tie handling.

If notional wrong:
- wrong scaling/exponent;
- float multiplication;
- wrong price/qty field;
- base vs quote asset confusion.

If no-trades fails:
- blank table instead of explicit state;
- stale rows remain.

============================================================
CP. ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-24-portfolio-risk-trades-dashboard.md

Include:

1. Starting commit.
2. Working branch task-24.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 20 test count.
6. Task 24 = 20c = 80 available points.
7. Exact 20c function exports/selectors.
8. Accounts endpoint/input shape.
9. Account list DOM design.
10. Account holdings definition.
11. Exponent metadata source.
12. Status badge mapping.
13. Portfolio account-count logic.
14. Portfolio aggregation algorithm.
15. Exact BigInt handling.
16. Portfolio asset order.
17. Risk payload shape.
18. Risk limits rendered.
19. Risk exact classification algorithm.
20. 80% warning boundary.
21. 100% danger boundary.
22. Zero/missing-limit behavior.
23. Risk meter DOM/a11y.
24. Trade data source/input shape.
25. Timestamp/sort logic.
26. Ten-trade cap.
27. Exact notional formula.
28. Notional asset/exponent.
29. No-trades state.
30. Safe DOM/XSS strategy.
31. Loading/empty/ready/error handling.
32. Exact files changed.
33. Typecheck.
34. 20c-1 result.
35. 20c-2 result.
36. 20c-3 result.
37. 20c-4 result.
38. Full Challenge 20 result.
39. Challenge 12 regression.
40. Challenge 11 result.
41. Challenge 05 result.
42. Challenge 03 result.
43. Challenge 13 result.
44. Signing regressions if applicable.
45. sanity/full-suite result.
46. browser smoke result.
47. protected-file confirmation.
48. suggested commit.
49. master merge/push workflow.
50. next Task 25: OpenAPI/Swagger.

Do not include secrets.

============================================================
CQ. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat
git diff --name-only

Review actual changed client files:

git diff -- client/js/dashboard.js
git diff -- client/js/app.js
git diff -- client/index.html
git diff -- client/dashboard.css
git diff -- docs/clearhouse-task-24-portfolio-risk-trades-dashboard.md

Only if a backend file genuinely changed:
review it individually and document why it was necessary.

Confirm:
- organizer tests unchanged;
- no new tests;
- config unchanged;
- package unchanged;
- migrations unchanged;
- seeds unchanged;
- signer unchanged unless proven necessary;
- liveFeed unchanged;
- no unsafe innerHTML;
- no Number money/notional aggregation;
- no hardcoded demo accounts/trades/risk fixtures;
- no Task 25+ implementation.

============================================================
CR. TASK 24 COMPLETION CRITERIA
============================================================

Task 24 is COMPLETE only when:

DISCOVERY

[ ] challenge20 read completely.
[ ] exact 20c test names identified.
[ ] exact exported functions identified.
[ ] exact DOM selectors/classes identified.
[ ] exact risk payload identified.
[ ] exact trade payload identified.
[ ] exact notional oracle identified.

ACCOUNT LIST

[ ] every supplied account rendered.
[ ] account name rendered safely.
[ ] holdings use exact tested definition.
[ ] holdings exponent-aware.
[ ] status badge correct.
[ ] status classes allowlisted.
[ ] no-balance accounts handled.
[ ] rerender does not duplicate.

PORTFOLIO

[ ] account count exact.
[ ] one aggregate per asset.
[ ] all accounts included per contract.
[ ] available/held/total not double-counted.
[ ] BigInt aggregation.
[ ] values beyond 2^53 exact.
[ ] correct exponent formatting.
[ ] deterministic asset order.
[ ] empty input handled.

RISK

[ ] every tested limit rendered.
[ ] used/limit correct.
[ ] normal below 80%.
[ ] warning exactly at 80%.
[ ] warning between 80% and <100%.
[ ] danger exactly at 100%.
[ ] danger over 100%.
[ ] no divide-by-zero crash.
[ ] classes reset correctly on rerender.
[ ] meter accessible as required.
[ ] no backend risk logic duplicated.

RECENT TRADES

[ ] newest first.
[ ] sort occurs before cap.
[ ] max 10.
[ ] exact notional.
[ ] correct scaling/exponent.
[ ] no Number/parseFloat.
[ ] input array not mutated.
[ ] no-trades state explicit.
[ ] stale rows cleared.
[ ] untrusted text safe.

PRESERVATION

[ ] Task 22 XSS safety preserved.
[ ] Task 22 formatMinorUnits reused.
[ ] Task 22 accessibility preserved.
[ ] Task 22 signing preserved.
[ ] Task 23 seed unchanged.
[ ] Task 23 accounts API preserved.
[ ] no WebSocket/live-feed future scope.

VERIFICATION

[ ] typecheck passes.
[ ] Challenge 20c passes.
[ ] full Challenge 20 passes.
[ ] Challenge 12 passes.
[ ] Challenge 11 passes.
[ ] Challenge 05 passes.
[ ] Challenge 03 passes.
[ ] Challenge 13 passes.
[ ] signing regressions pass if applicable.
[ ] sanity/full suite recorded honestly.
[ ] protected files unchanged.
[ ] Task 24 note created.
[ ] final Git target master.

If any Challenge 20c organizer assertion remains failing:
- status = PARTIAL;
- name exact failure/root cause.

============================================================
CS. FINAL CURSOR REPORT
============================================================

Return:

1. Task 24 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Exact Challenge 20 test count.
6. Exact 20c tests.
7. Account list implementation.
8. Holdings definition.
9. Exponent source.
10. Status badge behavior.
11. Portfolio aggregation algorithm.
12. Exact account count behavior.
13. Per-asset total behavior.
14. Risk payload/limits.
15. Risk classification formula.
16. Warning/danger boundary behavior.
17. Risk meter DOM/accessibility.
18. Trade source/input shape.
19. Trade sorting.
20. Trade cap.
21. Exact notional formula.
22. Notional exponent.
23. No-trades state.
24. Safe DOM strategy.
25. Typecheck.
26. 20c-1 result.
27. 20c-2 result.
28. 20c-3 result.
29. 20c-4 result.
30. Full Challenge 20 result.
31. Challenge 12 result.
32. Challenge 11 result.
33. Challenge 05 result.
34. Challenge 03 result.
35. Challenge 13 result.
36. signing regression if applicable.
37. sanity/full-suite result.
38. browser smoke-check result.
39. remaining future failures.
40. confirmation protected files unchanged.
41. final diff summary.
42. reviewed Git commands targeting master.

Suggested commit:

feat: add portfolio risk and recent trades dashboard

Do not automatically commit, merge, or push.
````

---

# Task 24 acceptance matrix

| Area | Required behavior |
|---|---|
| Account list | Every supplied account |
| Name | Safe literal text |
| Holdings | Exact + exponent-aware |
| Status | Correct badge |
| Portfolio count | Exact accounts count |
| Portfolio totals | Per asset, BigInt exact |
| Mixed assets | Never cross-summed |
| Held amounts | Included if holdings definition requires total |
| Warning | At exactly 80% |
| Danger | At exactly 100% |
| Over-limit | Danger |
| Zero limit | No NaN/Infinity; test semantics |
| Recent trades | Newest first |
| Trade cap | Max 10 |
| Notional | Exact organizer formula |
| Empty trades | Explicit no-trades state |
| Input arrays | Not mutated |
| XSS | No untrusted innerHTML |
| Task 22 formatter | Reused |
| Task 22 signing | Preserved |
| Task 23 seed/API | Preserved |
| WebSockets | Not implemented now |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 24

Official final branch:

**`master`**

Workflow:

**`master` → `task-24` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 24 branch

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
task-24
```

Official final branch:

```text
master
```

---

## 2. Final Task 24 verification

```powershell
npm run typecheck

npm test challenge20.test.ts -t "Challenge 20c"

npm test challenge20.test.ts

npm test challenge12.test.ts

npm test challenge11.test.ts

npm test challenge05.test.ts

npm test challenge03.test.ts

npm test challenge13.test.ts

npm test challenge10.test.ts

npm test challenge09.test.ts

npm test challenge04.test.ts

npm test challenge02.test.ts

npm test _sanity.test.ts

git diff --check
```

If `app.js` / signed request flow changed, also run:

```powershell
npm test challenge00b.test.ts -t "Challenge 0t"

npm test challenge01.test.ts -t "Challenge 1c"
```

Use actual current labels if different.

Then:

```powershell
npm test
```

---

## 3. Review Task 24 changes

```powershell
git status --short
git diff --stat
git diff --name-only
```

Review actual client files:

```powershell
git diff -- client/js/dashboard.js
git diff -- client/js/app.js
git diff -- client/index.html
git diff -- client/dashboard.css
git diff -- docs/clearhouse-task-24-portfolio-risk-trades-dashboard.md
```

Only review/stage paths that actually exist and changed.

If stylesheet path differs, use actual path.

---

## 4. Stage only Task 24 files

Always stage the engineering note:

```powershell
git add -- docs/clearhouse-task-24-portfolio-risk-trades-dashboard.md
```

Primary likely:

```powershell
git add -- client/js/dashboard.js
```

Only if genuinely changed:

```powershell
git add -- client/js/app.js
git add -- client/index.html
git add -- client/dashboard.css
```

If another legitimate client helper changed:

```powershell
git add -- "<actual-task24-client-helper-path>"
```

Only if a current Challenge 20c integration test proved a minimal backend fix was required:

```powershell
git add -- "<actual-required-backend-path>"
```

Do not paste placeholders literally.

If any file includes unrelated work:

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
- signer changes without proven need
- liveFeed/WebSocket future work
- unrelated source.

---

## 6. Commit Task 24

```powershell
git commit -m "feat: add portfolio risk and recent trades dashboard"
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

## 8. Merge Task 24

Prefer:

```powershell
git merge --ff-only task-24
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If valid histories diverged:

```powershell
git merge task-24
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

npm test challenge20.test.ts

npm test challenge12.test.ts

npm test challenge11.test.ts

git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge05.test.ts
npm test challenge03.test.ts
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

If rebasing the local-only Task 24 commit is safe:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge20.test.ts
npm test challenge12.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts deliberately.

---

# Fast Task 24 checklist

- [ ] branch = task-24
- [ ] final branch = master
- [ ] challenge20 fully read
- [ ] exact 20c selectors/exports identified
- [ ] Task23 20a/20b baseline healthy
- [ ] account list renders every account
- [ ] account names safe via textContent
- [ ] holdings exact
- [ ] holdings exponent-aware
- [ ] no double-count of total/components
- [ ] status badge correct
- [ ] no-balance account handled
- [ ] account count exact
- [ ] portfolio one total per asset
- [ ] BigInt aggregation
- [ ] values >2^53 exact
- [ ] deterministic asset order
- [ ] empty portfolio safe
- [ ] exact risk payload identified
- [ ] all tested limits rendered
- [ ] warning at 80%
- [ ] danger at 100%
- [ ] over-100 danger
- [ ] zero/missing limit safe
- [ ] risk classes reset on rerender
- [ ] accessible risk meter
- [ ] exact trade payload identified
- [ ] newest-first sorting
- [ ] sort before slice
- [ ] max 10 trades
- [ ] exact notional formula
- [ ] correct notional asset exponent
- [ ] no floating point
- [ ] no-trades state explicit
- [ ] input arrays not mutated
- [ ] stale rows cleared on rerender
- [ ] no unsafe innerHTML
- [ ] Task22 formatMinorUnits reused
- [ ] Task22 signing preserved
- [ ] Task23 seeds/API untouched
- [ ] no WebSocket/liveFeed expansion
- [ ] Challenge20c passes
- [ ] full Challenge20 passes
- [ ] Challenge12 passes
- [ ] Challenge11 passes
- [ ] Challenge05 passes
- [ ] Challenge03 passes
- [ ] Challenge13 passes
- [ ] sanity/full suite recorded
- [ ] protected files unchanged
- [ ] Task24 note created
- [ ] committed on task-24
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 25 — Challenge 19: OpenAPI / Swagger Documentation.
