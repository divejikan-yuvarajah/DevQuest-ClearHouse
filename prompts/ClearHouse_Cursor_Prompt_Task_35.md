# ClearHouse — Complete Enhanced Cursor Prompt for Task 35

**Task:** Browser / Manual Demo Verification + Submission-Ready Smoke Test  
**Primary scope:** verify the real ClearHouse application the way a judge/demo user would experience it after Tasks 1–34  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-35`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 35 purpose

Task 35 is the **real-app smoke and demo-readiness pass** after the full automated regression work in Task 34.

Task 35 does not introduce a new organizer challenge.

Its goals are to verify that the finished system works in the way a human judge, reviewer, or demo operator is likely to experience it:

- the app starts cleanly;
- the database/setup is usable;
- the dashboard loads over HTTP;
- authentication works through the real supported flow;
- seeded demo accounts and balances appear correctly;
- orders can be placed using the real application path;
- matching/trading visibly changes the system;
- order-book REST and WebSocket views agree;
- live updates arrive;
- reconnect/stale behavior is visible and recovers;
- account/risk/recent-trade widgets remain coherent;
- OpenAPI/Swagger pages load;
- health/ready/metrics behavior remains valid;
- malformed or unauthorized actions fail cleanly;
- the browser console/network panel has no unexpected fatal errors;
- the app can be shut down cleanly;
- no secret or credential is exposed during the demo.

This is a **smoke verification and narrowly scoped repair task**.

Do not perform cosmetic redesign, large refactors, or new feature development.

If a real smoke check reveals a production defect:
1. reproduce it;
2. identify the owning challenge;
3. apply the smallest fix;
4. run the owning automated challenge;
5. rerun affected regressions;
6. rerun the smoke step;
7. rerun the full suite if code changed.

---

# Important distinction — automated proof vs manual/browser smoke

Task 34 is the automated organizer-test gate.

Task 35 is an additional human-facing verification layer.

A browser smoke pass does **not** replace:

```powershell
npm test
```

Likewise, an automated test pass does not guarantee that:

- a page visually loads;
- the browser can import modules;
- fetch paths are correct;
- WebSocket URL construction works in a real page;
- a CSP unexpectedly blocks a real script;
- CSS hides required content;
- the console is free from runtime errors.

Task 35 checks those human-facing integration risks.

---

# Task 35 is not Task 36

Task 35 must NOT:

- execute grading/result upload scripts;
- package a final submission bundle;
- invent a score;
- alter CodeCommit submission configuration;
- change branch conventions;
- create a final judging pitch/report unless needed for smoke notes;
- force-push;
- delete task branches;
- clean the repository for submission.

Task 36 handles final submission verification/hand-off.

---

# Non-negotiable organizer and safety rules

## Do not modify organizer files

Do not edit:

- organizer tests;
- `config/`;
- `config/scores.ts`;
- Vitest configuration;
- test runner scripts;
- `package.json` test script;
- grading/result-upload scripts.

Do not add test-only behavior.

## Do not execute grading upload

Do not execute:

```text
config/result.ts
```

or any script whose purpose is to send grading/test results externally.

## Do not reveal secrets

Do not print or record:

- JWT secrets;
- HMAC secrets;
- access tokens;
- refresh tokens;
- Authorization headers;
- signed HMAC values;
- AWS CodeCommit credentials;
- full `.env` contents;
- passwords other than clearly documented disposable demo credentials, and even those should not be put into the engineering note unless the project intentionally documents them publicly.

If screenshots/evidence are taken:
- crop/redact tokens;
- do not include DevTools Authorization headers;
- do not include `.env`;
- do not include credential-bearing remote URLs.

## Do not use personal credentials

Use only:

- competition-provided disposable local credentials;
- documented demo fixture credentials;
- local test/demo identities.

Do not use personal AWS, GitHub, bank, or production credentials.

## No destructive Git

Do not use:

- `git reset --hard`;
- `git clean -fd`;
- force push;
- branch replacement;
- history rewrite.

---

# Demo database safety

Task 35 may need realistic seeded demo data.

Before any destructive/reset/seed operation:

1. inspect the current database configuration;
2. determine whether the DB is a local disposable competition/demo DB;
3. identify the actual file or in-memory setup;
4. preserve the current local demo DB if it contains useful state.

If using file SQLite and a reset is necessary:
- create a local backup copy outside Git;
- do not commit the backup;
- do not expose database contents unnecessarily.

Do not run a destructive command merely because it exists.

Especially inspect whether:

```powershell
npm run migrate
```

deletes/resets the database before applying migrations.

Use the exact documented setup path from the current project/Task2 note.

For smoke verification, prefer:
- a known disposable demo DB;
- the real demo seed;
- a repeatable setup.

Do not modify migrations/seeds unless the smoke test proves a genuine production defect and the owning challenge also supports that fix.

---

# Browser environment

Use the browser/testing capability actually available in the Cursor environment.

Preferred smoke browser:

- Chromium / Chrome / Edge.

Also test a mobile-sized viewport if easy and available, because the dashboard should remain readable.

Do not claim a browser smoke pass if no browser was actually run.

If Cursor cannot control a browser:
- perform all server/API/WebSocket CLI-level smoke checks possible;
- create a precise MANUAL CHECKLIST for the user;
- mark browser-specific items as **NOT RUN**;
- do not fabricate visual evidence.

---

# Judge-facing smoke journey

Task 35 should aim to verify this complete journey:

```text
clean verified repo
→ safe local demo setup
→ server starts
→ health/ready OK
→ dashboard loads
→ login/auth works
→ seeded accounts visible
→ balances/portfolio/risk visible
→ book snapshot visible
→ place valid orders
→ matching/trade occurs
→ REST book changes
→ WS book changes
→ recent trades update
→ account/balance state remains coherent
→ force WS disconnect
→ UI becomes reconnecting/stale as appropriate
→ reconnect + fresh snapshot
→ live state returns
→ API docs work
→ security/invalid requests fail cleanly
→ no unexpected browser console errors
→ graceful shutdown
```

---

# COMPLETE CURSOR AGENT PROMPT — TASK 35

Copy the complete block below into Cursor Agent mode.

````text
Act as my senior release-smoke engineer, browser integration tester, fintech demo reviewer, TypeScript/JavaScript debugger, security reviewer, and competition-demo operator for the DevQuest 2026 ClearHouse final.

Execute TASK 35 ONLY: perform a real browser/manual/demo smoke verification of the completed ClearHouse system after Task34, repair only genuine smoke-reproducible production defects, and leave the system ready for Task36 final submission verification.

Preserve all completed Tasks 1–34.

Task35 is not a new feature task.

Do not redesign the app.

Do not execute grading/result-upload scripts.

Do not automatically commit, merge, or push.

============================================================
A. REPOSITORY CONTEXT
============================================================

Working directory:

C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b

Official remote:

origin

Official CodeCommit repository:

https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b

Official final submission branch:

master

Task branch:

task-35

Historical GitHub reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- preserve Tasks 1–34;
- work on task-35;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not automatically commit/merge/push.

============================================================
B. TASK35 STRICT SCOPE
============================================================

Task35 must verify:

1. latest Task34 automated state;
2. environment/startup;
3. database/demo data readiness;
4. server startup;
5. health/ready/metrics where applicable;
6. dashboard real HTTP loading;
7. login/auth flow;
8. seeded account list;
9. balances/portfolio/risk;
10. depth/order book;
11. real order placement;
12. matching/trade path;
13. recent trades;
14. REST ↔ WebSocket book parity;
15. live updates;
16. reconnect/stale recovery;
17. API version route behavior;
18. OpenAPI JSON;
19. Swagger docs;
20. representative unauthorized/invalid input behavior;
21. browser console/network health;
22. responsive/readable UI;
23. graceful stop/cleanup;
24. final smoke note.

Task35 may repair only a defect actually reproduced during this smoke pass.

If code changes:
- identify owning organizer challenge;
- run that challenge;
- run affected regressions;
- rerun full npm test;
- repeat smoke step.

Do not implement Task36.

============================================================
C. PROTECTED RULES
============================================================

Do not modify:

- tests/
- config/
- config/scores.ts
- vitest.config.ts
- package test script
- grading/report upload scripts
- migrations/seeds unless a proven production defect requires an owning-challenge-supported fix
- package dependencies/versions

Do not install packages.

Do not add test-detection branches.

Do not increase test timeouts.

Do not execute:

config/result.ts

or equivalent result-upload command.

Do not guess or report a score.

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
- origin is official CodeCommit;
- master is final branch.

Verify Task34 is on master:

git log --oneline --decorate --max-count=25 master

If task-34 exists:

git log --oneline --decorate --max-count=10 task-34

If master is correct:

git switch master
git pull --ff-only origin master
git switch -c task-35

If task-35 already exists:
inspect it; do not recreate blindly.

Record:
- starting commit;
- current branch;
- dirty files;
- staged files.

============================================================
E. READ TASK34 HANDOFF
============================================================

Read:

docs/clearhouse-task-34-full-regression.md

if present.

Record:
- final typecheck status;
- final full-suite status;
- any unresolved issue/flakiness;
- any production files Task34 changed.

Do not trust the note alone.

Verify the current checkout.

============================================================
F. AUTOMATED GATE BEFORE BROWSER SMOKE
============================================================

Before starting a real server/browser session:

run:

npm run typecheck

Then:

npm test

If the full official suite is currently failing:
- do not pretend the app is submission-ready;
- reproduce/fix only if clearly a regression from Task34/current state;
- otherwise mark Task35 BLOCKED/PARTIAL and document.

A clean automated gate is the expected starting point.

Do not execute grading upload.

============================================================
G. INSPECT ACTUAL STARTUP COMMANDS
============================================================

Read:
- package.json scripts;
- README;
- Task2 setup note;
- server entry point;
- client-serving architecture.

Determine:
- exact server start command;
- exact host/port;
- whether Express serves `/client`/dashboard;
- whether client needs a separate static server;
- whether environment values are required.

Do not guess.

Do not print `.env` values.

Only report required environment KEY NAMES.

============================================================
H. DATABASE / DEMO DATA PRE-FLIGHT
============================================================

Inspect:
- knexfile;
- DB config;
- actual local DB path;
- migrations;
- demo seed;
- Task23 note.

Determine whether the current local DB is safe/disposable.

Before any destructive reset:
- identify exact DB file;
- back it up locally outside Git if it contains useful state.

Do not commit DB backups.

Do not run destructive migrations/reset just for cleanliness.

If a fresh demo state is needed:
use the exact documented safe workflow.

Verify seed idempotency using the official Task23/Challenge20 behavior rather than manually inserting rows.

============================================================
I. DEMO DATA EXPECTATIONS
============================================================

Read current seed/source.

Record expected demo characteristics, not secret credentials:

- number of known demo accounts;
- assets each should hold;
- whether accounts are active;
- risk configuration required for trading;
- any clearly documented disposable login identity;
- initial book/trade state if seeded.

Do not hardcode these in production.

This is only for smoke expectations.

============================================================
J. START SERVER CLEANLY
============================================================

Start using the actual supported command.

Examples ONLY:

npm run dev
npm start

Use the real one.

Do not start multiple duplicate servers.

Verify:
- process starts without uncaught exception;
- port is listening;
- no migration error;
- no unhandled rejection;
- no secret printed.

Record the exact command in the Task35 note.

============================================================
K. HEALTH / READY / METRICS SMOKE
============================================================

Using browser or curl/fetch equivalent:

verify current tested endpoints such as:

/health
/ready
/api/metrics

Use exact routes from Challenge10.

Check:
- expected HTTP status;
- JSON/content type;
- no stack trace;
- no secret data.

Do not invent missing endpoints.

If `/ready` depends on DB:
confirm it reflects the working demo DB.

============================================================
L. DASHBOARD LOAD OVER HTTP
============================================================

Load the dashboard through its supported HTTP URL.

Do not use `file://` if the app expects modules/fetch/WebSockets over HTTP.

Verify:
- HTML loads;
- CSS loads;
- JS loads;
- no 404 for required local assets;
- no module import failure;
- no CSP block of required first-party code;
- no blank-screen exception.

Record:
- URL path only;
- do not record credential-bearing query values.

============================================================
M. BROWSER CONSOLE BASELINE
============================================================

Open/check browser console.

Before interacting, look for:
- uncaught JS exceptions;
- failed imports;
- failed fetch;
- CSP errors;
- WebSocket construction errors;
- BigInt JSON exceptions;
- infinite reconnect loops.

Expected:
no unexpected fatal console errors.

Warnings may be acceptable only if understood and harmless.

Do not hide console errors with a catch-all.

============================================================
N. NETWORK BASELINE
============================================================

Inspect representative requests.

Verify:
- correct API base path;
- no accidental duplicate requests;
- no infinite polling;
- no 404/500 during normal startup;
- correct content types;
- WebSocket upgrade works after valid auth.

Do not record/export Authorization header/token in notes.

============================================================
O. LOGIN / AUTH SMOKE
============================================================

Use the real supported competition/demo authentication flow.

Use only a documented disposable demo/test identity.

Do not invent or weaken authentication.

Verify:
- valid login succeeds;
- session/access token behavior works for the app;
- browser reaches authenticated dashboard/operator view;
- invalid credential attempt fails cleanly if safe to test.

Do not expose password/token in note/screenshots.

Do not repeatedly trigger rate limiting unnecessarily.

============================================================
P. AUTHENTICATED API SMOKE
============================================================

After login, verify representative authenticated reads used by dashboard:

- accounts;
- balances;
- risk;
- depth;
- recent trades

using actual current routes.

Check:
- success envelope;
- exact string financial values;
- no unexpected 500;
- no stale hardcoded demo data.

Do not compare by floating-point conversion.

============================================================
Q. ACCOUNT LIST VISUAL CHECK
============================================================

Verify:
- seeded accounts appear;
- names/statuses are correct;
- no duplicates;
- active/closed badge mapping makes sense;
- empty-balance account handling remains readable if present;
- no raw `[object Object]`;
- no escaped HTML executed as markup.

If account names contain untrusted text fixture:
ensure it is rendered safely.

============================================================
R. HOLDINGS / PORTFOLIO VISUAL CHECK
============================================================

Verify:
- holdings values render with correct asset exponent;
- available/held/total definition matches Task24;
- portfolio account count is correct;
- per-asset totals are coherent;
- large values do not display scientific notation unexpectedly;
- JPY/BHD/BTC-like exponents remain correct.

Do not "fix" formatting by converting exact values through Number.

============================================================
S. RISK PANEL VISUAL CHECK
============================================================

Verify:
- current limits are visible;
- usage values are visible;
- normal/warning/danger class appears correctly for current demo state;
- meters do not overflow visually;
- zero/missing limit state does not crash;
- labels remain readable.

Do not alter backend risk rules during UI smoke.

============================================================
T. ORDER BOOK INITIAL VIEW
============================================================

Verify:
- bids and asks render in expected order;
- empty book state is readable if initially empty;
- quantities/prices format correctly;
- no duplicated price levels;
- WebSocket snapshot and REST depth correspond semantically.

If current UI only shows one of REST/WS:
inspect live feed state internally through documented callbacks/DevTools without exposing tokens.

============================================================
U. PREPARE A SAFE TRADING SCENARIO
============================================================

Read the actual order API and demo account/risk setup.

Choose a minimal, disposable, deterministic trading scenario using seeded/open accounts.

Do not use personal identities.

Do not hardcode organizer fixture IDs in production.

Before submitting orders:
- ensure accounts have sufficient available balances/holds;
- ensure risk limits allow the trade;
- ensure accounts are open;
- use exact integer-string fields.

Avoid huge quantities.

Use a tiny scenario that visibly exercises:
- resting order;
- matching trade;
- changed book;
- recent trade.

============================================================
V. PLACE A RESTING ORDER THROUGH REAL APP/API PATH
============================================================

Use the actual supported UI if the dashboard includes an order form.

If no UI exists for order placement:
use the real authenticated HTTP API through browser/DevTools/curl.

Do not build a temporary demo-only order form.

Verify:
- request succeeds;
- response envelope is correct;
- order appears/rests if expected;
- REST depth changes;
- WS delta arrives;
- browser book changes.

Check topic sequence increments normally.

============================================================
W. PLACE A CROSSING ORDER / CREATE A REAL TRADE
============================================================

Submit a compatible opposite order through the real supported path.

Verify:
- matching occurs;
- resulting quantity/price matches expected rules;
- book level decreases/removes appropriately;
- recent trade is exposed by real trade source;
- no duplicate trade row;
- account/balance impact remains coherent if settlement is automatic;
- risk/reservations release/update correctly according to app behavior.

Do not manually mutate DB.

============================================================
X. REST ↔ WEBSOCKET BOOK PARITY
============================================================

After each order/trade step:

compare:
- current REST depth response;
- current client-reconstructed/live displayed book.

They must agree semantically.

Check:
- bid order;
- ask order;
- zero/removal handling;
- exact quantities;
- no missing level;
- no duplicate delta.

This is the human-facing version of Challenge21a.

============================================================
Y. RECENT TRADES VISUAL CHECK
============================================================

After the real trade:

verify:
- newest trade is visible;
- newest-first ordering;
- at most 10 rows;
- correct accounts/side fields if displayed;
- exact notional/price/qty formatting;
- no duplicate trade;
- no stale pre-trade list after refresh/live update as current architecture defines.

If dashboard requires explicit refresh:
use supported refresh, do not add hidden polling just for demo.

============================================================
Z. BALANCE / PORTFOLIO AFTER TRADE
============================================================

Refresh/reload using normal app behavior.

Verify:
- account balances now reflect real state;
- holdings remain exact;
- dashboard and API agree;
- DB/API integration remains consistent;
- no negative balance unless domain scenario legitimately allows it;
- held/available splits make sense.

Do not directly edit balances.

============================================================
AA. FEE / LEDGER SMOKE IF VISIBLE
============================================================

If current app exposes fee/ledger data through existing UI/API:
verify the trade created the expected fee/ledger effects.

Do not create new UI for this.

At minimum:
ensure there is no visible inconsistency or 500.

Dedicated Challenge16/02 tests remain the primary proof.

============================================================
AB. LIVE CONNECTION STATE
============================================================

Observe current connection status indicator.

Verify normal healthy state becomes:
- `live` or exact current label.

No repeated flicker.

No hidden reconnect loop.

No stale banner while data is flowing.

============================================================
AC. FORCE A SAFE WEBSOCKET DISCONNECT
============================================================

Use the real Task31 supported mechanism if accessible in local/demo code, such as the real `disconnectAll()` integration path used by Challenge21, or safely stop/restart the WebSocket-serving side if the application architecture supports it.

Do not modify production code just to expose a demo-only "disconnect" endpoint.

Do not kill unrelated Node processes.

Goal:
observe the real client reconnect flow.

============================================================
AD. RECONNECTING / STALE UX
============================================================

During/after disconnect:

verify:
- old data stays visible;
- reconnecting/stale note is visible according to current state timing;
- loading/empty/error panel is not wrongly substituted;
- console does not spam fatal errors;
- only one reconnect loop exists.

Challenge17 automated tests remain authoritative for exact timing.

Smoke focuses on realistic behavior.

============================================================
AE. RECONNECTION RECOVERY
============================================================

After the server/hub accepts connections again:

verify:
- client reconnects;
- re-subscribes;
- receives fresh snapshot;
- status returns live;
- client book equals REST depth;
- no duplicate rows;
- no old stale banner remains.

If orders changed while disconnected and the test setup permits it:
verify fresh snapshot catches up.

============================================================
AF. RELOAD / HARD REFRESH
============================================================

Perform a normal page reload.

If feasible, also a hard refresh.

Verify:
- app initializes once;
- no duplicate event handlers;
- no duplicated account/trade rows;
- no duplicate WebSocket connections beyond expected;
- session/auth behavior remains correct;
- no cached stale JS causing mismatch.

Do not clear browser storage unless testing logout/relogin intentionally.

============================================================
AG. LOGOUT / SESSION END IF SUPPORTED
============================================================

If the current UI supports logout:

verify:
- logout completes;
- protected dashboard/API is no longer accessible through normal app flow;
- page/back navigation does not silently expose new protected API data;
- login can be performed again if needed.

Do not modify session policy.

If no UI logout is implemented/tested:
do not invent one in Task35.

============================================================
AH. UNAUTHORIZED REPRESENTATIVE REQUEST
============================================================

Using a safe request without a valid access token/signature:

verify one representative protected endpoint returns the expected controlled:
- 401 or 403 according to current contract;
- standard error envelope;
- no stack trace.

Do not bombard login or protected routes.

No brute force.

============================================================
AI. INVALID INPUT REPRESENTATIVE REQUEST
============================================================

Test one or two safe malformed/invalid requests using the actual API contract.

Examples ONLY:
- invalid zero/negative order quantity;
- malformed JSON if safe;
- unknown route/version.

Verify:
- 400/404/413/etc. as appropriate;
- no server crash;
- no stack/path leak.

Do not send huge stress payloads in browser smoke if Challenge07 already covers them.

============================================================
AJ. API VERSION SMOKE
============================================================

Verify representative:

- `/api/...`
- `/api/v1/...`

parity where Challenge11 defines it.

Verify an unsupported version returns clean 404.

Do not test every route manually.

Automated tests remain the exhaustive proof.

============================================================
AK. OPENAPI JSON SMOKE
============================================================

Load:

`/api/openapi.json`

or actual Challenge19 path.

Verify:
- 200;
- JSON document;
- OpenAPI version;
- paths visible;
- no fatal reference error in browser.

Do not edit docs just for cosmetic wording.

============================================================
AL. SWAGGER UI SMOKE
============================================================

Load:

`/api/docs`

or current Challenge19 path.

Verify:
- page loads;
- CSS/JS required by the implementation load;
- CSP does not break it;
- it references the real OpenAPI document;
- no blank page;
- no browser console fatal error.

Do not weaken global CSP.

If route-specific CSP is already implemented, preserve it.

============================================================
AM. HEALTH / METRICS AFTER ACTIVITY
============================================================

After the smoke trade/reconnect activity:

recheck:
- `/health`;
- `/ready`;
- metrics endpoint if current contract exposes it.

Verify the app remains healthy.

Look for:
- abnormal error-count spike caused by normal flows;
- server no longer ready;
- leaked connection count if metrics expose one.

Do not invent metric semantics.

============================================================
AN. SECURITY HEADER BROWSER CHECK
============================================================

Inspect representative response headers for:
- CSP;
- no-sniff;
- frame protection;
- referrer policy

according to Challenge07/Challenge19 behavior.

Do not require browser UI to show them.

Use DevTools/network/curl.

Verify Swagger's route-specific CSP remains limited to docs route and does not weaken normal routes.

============================================================
AO. RESPONSIVE / LAYOUT SMOKE
============================================================

At normal desktop viewport:
verify major dashboard content is readable.

If easy:
also test a mobile/narrow viewport.

Check:
- no essential controls completely inaccessible;
- tables can scroll or remain usable;
- connection status visible;
- no severe overlap;
- no text clipped beyond use.

Do not redesign styling unless a severe functional/readability defect exists.

Task35 is not a design-polish task.

============================================================
AP. KEYBOARD / BASIC ACCESSIBILITY SMOKE
============================================================

Using keyboard if browser available:
- tab through main actionable controls;
- verify focus is visible enough to operate;
- controls/buttons reachable;
- page does not trap focus unexpectedly.

Check status messages/labels remain comprehensible.

This is a smoke check, not an accessibility certification.

Do not claim WCAG compliance.

============================================================
AQ. XSS SAFETY SMOKE
============================================================

Do not insert dangerous real attack payloads into production data unnecessarily.

If a safe existing organizer/demo fixture contains HTML-like text:
confirm it renders as text, not executable markup.

Automated Challenge12 remains the authoritative XSS test.

Do not weaken safe rendering.

============================================================
AR. CONSOLE FINAL PASS
============================================================

After completing:
- login;
- trading;
- reconnect;
- docs;

review console again.

There should be no unexplained:
- uncaught exception;
- unhandled promise rejection;
- endless reconnect logs;
- BigInt stringify crash;
- CSP block on required app asset;
- failed required module/fetch.

Record known harmless warnings separately.

Do not hide bugs with global try/catch.

============================================================
AS. NETWORK FINAL PASS
============================================================

Review normal flow for:
- unexpected 500s;
- duplicate POSTs;
- duplicate order placement;
- duplicate WebSocket connections;
- repeated resync storm;
- unbounded polling.

One failed unauthorized/malformed request intentionally generated during smoke is expected and should be labeled as intentional.

============================================================
AT. SERVER TERMINATION
============================================================

Stop the server using the normal method.

Verify:
- process exits cleanly;
- no obvious stuck heartbeat/reconnect timer;
- no orphan server left listening on port;
- DB connection closes according to current architecture.

Do not kill all Node processes.

Only stop the process you started/identified.

============================================================
AU. IF A SMOKE DEFECT IS FOUND
============================================================

Do NOT immediately patch visually.

First:

1. capture reproducible steps;
2. identify owning challenge;
3. run that challenge test;
4. identify first wrong layer;
5. make smallest production fix.

Then run:

npm run typecheck

owning challenge

direct dependent regressions

Then:

npm test

because Task34 was already supposed to be green and Task35 introduced a post-regression code change.

Then rerun the exact browser smoke step.

Task35 cannot be COMPLETE with a code change that has not been followed by a full suite.

============================================================
AV. EXAMPLES OF SMOKE DEFECT OWNERSHIP
============================================================

Dashboard blank due JS error:
- likely Challenge12/17/20.

REST depth correct, WS display wrong:
- Challenge17/18/21.

REST depth itself wrong:
- Challenge03/11/21.

Recent trades absent:
- Challenge20/21 or trade source.

Login broken:
- Challenge01/10/client wiring.

Swagger blank:
- Challenge19/security CSP.

Seeded accounts missing:
- Challenge20/Task23.

Trading rejects valid seeded account:
- Challenge05/13/20/21.

Do not guess—run the owner test.

============================================================
AW. BROWSER NOT AVAILABLE
============================================================

If no controllable browser is available:

do NOT pretend browser checks were completed.

Perform CLI/server smoke for:
- startup;
- health;
- ready;
- API;
- auth;
- order flow;
- WebSocket where tooling allows;
- OpenAPI;
- shutdown.

Then create a section:

MANUAL BROWSER CHECKS — NOT RUN

with exact steps the user can execute.

Mark Task35:
PARTIAL if browser verification was a required goal and truly could not be run.

If the competition environment only permits manual user browser inspection, report the automated/CLI portion COMPLETE and browser portion NOT RUN, without fabrication.

============================================================
AX. NO SCREENSHOT REQUIREMENT UNLESS USEFUL
============================================================

Do not generate/commit screenshots by default.

If screenshots are useful locally:
- keep them out of Git unless user explicitly requests;
- redact secrets/tokens;
- do not include DevTools headers.

Task35 proof is primarily the engineering note and actual observed results.

============================================================
AY. ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-35-browser-demo-smoke.md

Include:

1. Task35 starting commit.
2. Working branch task-35.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Task34 final automated status.
6. Task35 pre-smoke typecheck.
7. Task35 pre-smoke full-suite result.
8. Actual startup command.
9. Actual local app URL/path, without credentials.
10. Browser used/version if available.
11. Browser mode/viewport(s).
12. Demo DB strategy.
13. Whether DB backup was made.
14. Demo seed command/workflow.
15. Health result.
16. Ready result.
17. Metrics result if applicable.
18. Dashboard initial-load result.
19. Initial console result.
20. Initial network result.
21. Login/auth result.
22. Account list result.
23. Holdings/portfolio result.
24. Risk panel result.
25. Initial order-book result.
26. Real resting-order smoke.
27. Real crossing-order/trade smoke.
28. REST/WS depth parity.
29. Recent trades result.
30. Balance/portfolio-after-trade result.
31. Connection-status live result.
32. Forced disconnect method.
33. Reconnecting/stale UI result.
34. Reconnect/fresh-snapshot result.
35. Page reload result.
36. Logout result or NOT APPLICABLE.
37. Unauthorized request result.
38. Invalid input result.
39. API version result.
40. OpenAPI JSON result.
41. Swagger UI result.
42. Security-header observation.
43. Desktop layout result.
44. Mobile/narrow layout result.
45. Keyboard/basic a11y smoke.
46. Final console result.
47. Final network result.
48. Graceful shutdown result.
49. Any smoke defect found.
50. Reproduction steps.
51. Production fix made, if any.
52. Owning challenge regression.
53. Full suite after any Task35 code change.
54. Exact Task35 files changed.
55. Protected-file confirmation.
56. Confirmation no grading upload was executed.
57. Confirmation no secrets recorded.
58. `git diff --check`.
59. Suggested commit.
60. master merge/push workflow.
61. Next Task36: final submission verification.

Do not include:
- passwords;
- tokens;
- signatures;
- AWS credentials;
- raw `.env`.

============================================================
AZ. TASK35 COMPLETION CRITERIA
============================================================

Task35 is COMPLETE only when:

PRE-FLIGHT

[ ] origin verified.
[ ] master final branch confirmed.
[ ] Task34 represented.
[ ] task-35 created from latest valid master.
[ ] Task34 regression note reviewed.
[ ] pre-smoke typecheck passes.
[ ] pre-smoke full npm test passes.

ENVIRONMENT

[ ] startup command identified.
[ ] demo DB strategy understood.
[ ] no accidental destructive DB operation.
[ ] real demo seed/useable data available.
[ ] server starts cleanly.

SERVER

[ ] health OK.
[ ] ready OK.
[ ] metrics OK if applicable.
[ ] no secret logging.
[ ] no startup unhandled errors.

BROWSER / APP

[ ] dashboard loads over HTTP.
[ ] required JS/CSS loads.
[ ] no initial fatal console error.
[ ] normal network requests succeed.
[ ] login/auth works.
[ ] account list visible/correct.
[ ] holdings/portfolio coherent.
[ ] risk panel coherent.
[ ] order book coherent.
[ ] live status coherent.

TRADING

[ ] safe real resting order submitted.
[ ] book changed correctly.
[ ] WS delta observed.
[ ] safe crossing order submitted.
[ ] real trade created.
[ ] recent trade visible/API-correct.
[ ] balances/portfolio remain coherent.
[ ] REST/WS book parity maintained.

LIVE RECOVERY

[ ] real safe disconnect performed.
[ ] old data preserved.
[ ] reconnecting/stale UX coherent.
[ ] reconnect occurs.
[ ] fresh snapshot accepted.
[ ] live status restored.
[ ] REST/WS book parity restored.

DOCS / SECURITY

[ ] representative unauthorized request controlled.
[ ] representative invalid request controlled.
[ ] /api and /api/v1 representative route checked.
[ ] unsupported version 404.
[ ] OpenAPI JSON loads.
[ ] Swagger UI loads.
[ ] required CSP/security headers observed.
[ ] no stack/secret leak.

USABILITY

[ ] desktop layout usable.
[ ] narrow/mobile layout smoke completed if browser available.
[ ] keyboard basic navigation smoke.
[ ] loading/empty/error states not obviously broken.
[ ] safe text rendering preserved.

FINAL

[ ] final console has no unexplained fatal errors.
[ ] final network has no unexplained normal-flow 500s.
[ ] server stops cleanly.
[ ] if Task35 code changed: owning challenge passes.
[ ] if Task35 code changed: affected regressions pass.
[ ] if Task35 code changed: full npm test passes after last edit.
[ ] protected files unchanged.
[ ] engineering note complete.
[ ] no grading upload executed.
[ ] no secrets captured.
[ ] `git diff --check` passes.

If browser was unavailable:
browser-specific items must be marked NOT RUN, not falsely checked.

If any critical real-app defect remains:
Task35 = PARTIAL.

============================================================
BA. FINAL CURSOR REPORT
============================================================

Return:

1. Task35 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact Task35 files changed.
5. Pre-smoke typecheck.
6. Pre-smoke full-suite result.
7. Browser actually used or NOT AVAILABLE.
8. Startup command/result.
9. Demo DB/seed status.
10. Health/ready/metrics.
11. Dashboard load.
12. Initial console/network.
13. Login/auth.
14. Account list.
15. Holdings/portfolio.
16. Risk panel.
17. Initial order book.
18. Resting-order smoke.
19. Trade smoke.
20. REST/WS book parity.
21. Recent-trade result.
22. Post-trade balances.
23. Live connection state.
24. Disconnect/reconnecting/stale behavior.
25. Reconnect/fresh-snapshot result.
26. Reload behavior.
27. Logout result if applicable.
28. Unauthorized request.
29. Invalid request.
30. API version check.
31. OpenAPI.
32. Swagger.
33. Security headers.
34. Desktop layout.
35. Mobile/narrow layout.
36. Keyboard/a11y smoke.
37. Final console/network.
38. Graceful shutdown.
39. Smoke defects discovered.
40. Fixes made.
41. Owning challenge regressions after fix.
42. Full-suite after Task35 changes.
43. Protected-file confirmation.
44. Confirmation grading upload NOT executed.
45. Confirmation no secret captured.
46. Final diff summary.
47. Reviewed Git commands targeting master.

Suggested commit if no production defect:

docs: record browser and demo smoke verification

Suggested commit if production smoke fixes were needed:

fix: resolve final demo smoke issues

Do not automatically commit, merge, or push.
````

---

# Manual judge-style smoke script

Cursor should use this as a compact sequence after it understands the actual routes and credentials.

## Step 1 — Verify green code

```powershell
npm run typecheck
npm test
```

## Step 2 — Start the actual app

Use the repository's real command.

Do not guess.

## Step 3 — Open dashboard

Use the actual HTTP URL.

Check:

- no blank screen;
- no fatal console error;
- auth flow works;
- data widgets appear.

## Step 4 — Verify seeded state

Check:

- accounts;
- balances;
- portfolio;
- risk;
- initial book/trades.

## Step 5 — Place a resting order

Check:

- API success;
- REST depth changed;
- WebSocket delta;
- dashboard changed.

## Step 6 — Place a crossing order

Check:

- trade created;
- book updated;
- recent trade visible;
- balances coherent.

## Step 7 — Compare book sources

Compare REST depth vs live client state.

## Step 8 — Disconnect WebSocket clients safely

Observe:

- old data preserved;
- reconnecting/stale;
- reconnect;
- snapshot;
- live restored.

## Step 9 — Check docs

Open:

- OpenAPI JSON;
- Swagger UI.

## Step 10 — Check error paths

One unauthorized request.

One invalid request.

No stack/secret leak.

## Step 11 — Final console/network review

No unexpected normal-flow 500.

No infinite reconnect/resync.

## Step 12 — Stop server cleanly

No obvious orphan process.

---

# If Task35 reveals a code defect

After the minimal fix:

```powershell
npm run typecheck
```

Run the exact owning challenge.

Examples:

```powershell
npm test challenge12.test.ts
npm test challenge17.test.ts
npm test challenge18.test.ts
npm test challenge20.test.ts
npm test challenge21.test.ts
```

Use only those applicable.

Then run:

```powershell
npm test
git diff --check
```

Then repeat the failing smoke step.

---

# Protected-file verification

Record Task35 starting commit, then use the actual hash:

```powershell
git diff <TASK35_START_COMMIT> -- tests config vitest.config.ts package.json package-lock.json
```

Do not paste `<TASK35_START_COMMIT>` literally.

Expected Task35-introduced protected diff:

none.

If a protected file was already modified before Task35:
report it; do not automatically revert teammate/user work.

---

# Official Git / CodeCommit workflow — Task 35

Official final branch:

**`master`**

Workflow:

**`master` → `task-35` → smoke/fix/verify → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 35 branch

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
task-35
```

Final branch:

```text
master
```

---

## 2. Final verification before staging

If Task35 made **no production code changes** and Task34/full suite was verified at Task35 start:

rerun at least:

```powershell
npm run typecheck
npm test
git diff --check
```

before final publication is still recommended.

If Task35 made **any production code change**:

the following are mandatory after the last edit:

```powershell
npm run typecheck
npm test
git diff --check
```

Do not rely only on focused tests.

---

## 3. Review Task35 changes

```powershell
git status --short
git diff --stat
git diff --name-only
```

Review:

```powershell
git diff -- docs/clearhouse-task-35-browser-demo-smoke.md
```

If production files changed:
review each individually:

```powershell
git diff -- "<actual-production-file>"
```

Do not paste placeholders literally.

There should be no unrelated formatting/refactor churn.

---

## 4. Verify protected files

With actual Task35 start hash:

```powershell
git diff <TASK35_START_COMMIT> -- tests config vitest.config.ts package.json package-lock.json
```

Expected no Task35 change.

Also:

```powershell
git diff --check
```

---

## 5. Stage selectively

Always:

```powershell
git add -- docs/clearhouse-task-35-browser-demo-smoke.md
```

If production fixes were made:

```powershell
git add -- "<actual-fixed-production-file>"
```

Do not paste placeholders literally.

If mixed with unrelated edits:

```powershell
git add -p -- "<file-path>"
```

Do not use:

```text
git add .
```

---

## 6. Review staged diff

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached
```

Stop if staged content includes:

- organizer tests;
- config/scoring;
- package dependency changes;
- `.env`;
- DB backup;
- screenshot containing secret;
- debug dump;
- Task36 submission files.

---

## 7. Commit

If only smoke documentation changed:

```powershell
git commit -m "docs: record browser and demo smoke verification"
```

If production defects were fixed:

```powershell
git commit -m "fix: resolve final demo smoke issues"
```

Verify:

```powershell
git show --stat --oneline HEAD
git status -sb
```

---

## 8. Update master

```powershell
git switch master
git fetch origin
git log --oneline --left-right master...origin/master
git pull --ff-only origin master
```

Do not reset valid remote history.

---

## 9. Merge Task35

Prefer:

```powershell
git merge --ff-only task-35
```

If this fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=40
```

If legitimate divergence exists:

```powershell
git merge task-35
```

Resolve deliberately.

Never force/reset.

---

## 10. Mandatory master verification

On master:

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
npm test
git diff --check
git status -sb
```

Do not push if this verification is unexpectedly red.

---

## 11. Push official master

```powershell
git push origin master
```

Do not push final competition work only to `main`.

Do not force push.

---

## 12. Verify remote master

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

If safe:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test
git diff --check
```

Then:

```powershell
git push origin master
```

Verify remote hash.

---

# Fast Task35 checklist

## Automated gate

- [ ] Task34 note reviewed
- [ ] typecheck passes
- [ ] full npm test passes

## Environment

- [ ] actual start command known
- [ ] actual app URL known
- [ ] demo DB strategy safe
- [ ] seed/demo state usable
- [ ] server starts cleanly

## Server

- [ ] health
- [ ] ready
- [ ] metrics if applicable
- [ ] no secret logging

## Browser

- [ ] dashboard loads over HTTP
- [ ] CSS/JS loads
- [ ] no fatal initial console errors
- [ ] no unexpected startup 404/500
- [ ] login/auth works

## Data

- [ ] accounts visible
- [ ] balances/holdings exact-looking
- [ ] portfolio coherent
- [ ] risk panel coherent
- [ ] initial book coherent

## Trading

- [ ] resting order
- [ ] REST depth change
- [ ] WS delta
- [ ] crossing order
- [ ] real trade
- [ ] recent trade visible
- [ ] balances coherent
- [ ] REST/WS parity

## Live recovery

- [ ] live status
- [ ] safe forced disconnect
- [ ] reconnecting/stale behavior
- [ ] old data preserved
- [ ] reconnect
- [ ] fresh snapshot
- [ ] live restored
- [ ] book parity restored

## Docs/security

- [ ] representative unauthorized request controlled
- [ ] representative invalid request controlled
- [ ] API version smoke
- [ ] OpenAPI JSON
- [ ] Swagger
- [ ] security headers
- [ ] no stack/secret leak

## Usability

- [ ] desktop readable
- [ ] narrow/mobile smoke if available
- [ ] keyboard basic navigation
- [ ] no obvious XSS unsafe rendering
- [ ] no unexplained final console errors
- [ ] no unexplained normal-flow 500s

## Cleanup

- [ ] graceful server stop
- [ ] no obvious orphan process
- [ ] no DB backup/screenshot secrets committed
- [ ] protected files unchanged
- [ ] Task35 note created
- [ ] if code changed: owning challenge rerun
- [ ] if code changed: full suite rerun
- [ ] `git diff --check`
- [ ] reviewed commit
- [ ] merge into master
- [ ] master typecheck
- [ ] master full test
- [ ] `git push origin master`
- [ ] remote hash verified

**Next planned task:** Task 36 — final submission verification, repository cleanliness, CodeCommit/master confirmation, and judge-ready handoff.
