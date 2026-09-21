# ClearHouse — Complete Enhanced Cursor Prompt for Task 34

**Task:** Full Regression, Remaining-Failure Diagnosis, and Final Production Repair Pass  
**Scope:** All Challenge 00 bug suites + Challenges 01–21 + TypeScript + sanity + lifecycle/flakiness review  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-34`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 34 purpose

Task 34 is the **full regression and final production-repair gate** after Tasks 1–33.

It does **not** introduce a new Challenge.

Its purpose is to verify that all previously implemented parts work together and to repair any remaining genuine production defects exposed by the official organizer tests.

The current published assessment contains:

- **21 feature challenges** totaling **3195 available feature points**;
- **Challenge 00 bug-hunt coverage** totaling **922 available bug points** across the organizer's bug checks.

Do **not** calculate or claim an earned competition score from these raw totals.

Do **not** combine the feature and bug raw points into your own percentage.

The official grading system may weight categories differently.

Task 34 must report:

- what actually ran;
- what passed;
- what failed;
- what was repaired;
- what remains unresolved.

No unrun test may be described as passed.

---

# Task 34 is failure-driven, not refactor-driven

The correct workflow is:

```text
baseline
→ identify concrete failing organizer assertions
→ classify ownership/root cause
→ fix the smallest production defect
→ rerun the owning focused test
→ rerun directly affected regression tests
→ continue until stable
→ run final full suite
```

Do not perform broad cleanup because code "could be nicer."

Do not rename APIs, redesign architecture, or migrate frameworks during Task 34 unless an official test proves a real contract defect.

---

# Challenge ownership map

Use this map to triage failures:

| Test | Owner |
|---|---|
| `challenge00.test.ts` / `00b` / `00c` | shipped bug hunt / cross-cutting defects |
| `challenge01.test.ts` | money, assets, auth/authz |
| `challenge02.test.ts` | double-entry ledger |
| `challenge03.test.ts` | matching engine |
| `challenge04.test.ts` | holds, deposits/withdrawals, settlement |
| `challenge05.test.ts` | pre-trade risk |
| `challenge06.test.ts` | event sourcing/replay |
| `challenge07.test.ts` | adversarial security |
| `challenge08.test.ts` | market data/time |
| `challenge09.test.ts` | reconciliation/reporting/migration |
| `challenge10.test.ts` | observability/operations |
| `challenge11.test.ts` | API design/cache/performance/versioning |
| `challenge12.test.ts` | operator dashboard |
| `challenge13.test.ts` | account closure |
| `challenge14.test.ts` | netting |
| `challenge15.test.ts` | complex order strategies |
| `challenge16.test.ts` | fee/rebate engine |
| `challenge17.test.ts` | live dashboard client |
| `challenge18.test.ts` | WebSocket server/feed |
| `challenge19.test.ts` | OpenAPI/Swagger |
| `challenge20.test.ts` | demo data + informative dashboard |
| `challenge21.test.ts` | end-to-end integration |

A failure may originate in another module.

Do not patch the test's nearest file blindly.

Find the root cause.

---

# Non-negotiable organizer rules

## Protected organizer content

Do **not** modify supplied organizer tests.

Treat these as protected/read-only during Task 34:

- `tests/` organizer files;
- `config/`;
- `config/scores.ts`;
- `vitest.config.ts`;
- `tests/tsconfig.json` / test runner config if present;
- `package.json` `scripts.test`;
- grading/build/reporting scripts.

Do **not** execute:

```text
config/result.ts
```

or any equivalent grading/result-upload script that sends data externally.

Do not edit generated grading output to fake a result.

Do not edit `test-results.xml` to claim a pass.

## Package files

Do not change:

- dependencies;
- versions;
- package manager;
- lockfile

during Task 34 merely to fix tests.

If the official Challenge 0v package-script defect somehow remains and the current organizer test specifically proves it, inspect the previously authorized Task 2 correction and fix only that documented non-test script defect.

Never modify `scripts.test`.

Do not install new packages.

## Tests

Do not:

- skip;
- `.only`;
- `.skip`;
- weaken assertions;
- reduce property generators;
- freeze random/property seeds;
- change test data;
- change timeouts;
- reduce performance workloads;
- alter test discovery.

Do not add new participant test files in Task 34 unless the user explicitly asks later.

Use organizer tests as the specification.

## Production test detection

Do not add source behavior depending on:

- `NODE_ENV === "test"`;
- `VITEST`;
- test filenames;
- challenge numbers;
- exact known test account IDs;
- fixture values;
- known random seeds;
- exact expected benchmark sizes.

Do not return hardcoded success responses.

## Financial exactness

Never use:

- `Number(...)`;
- `parseFloat(...)`;
- floating-point arithmetic

for values that the current domain models as exact financial integers.

Preserve existing BigInt/integer-string behavior.

`Number` remains appropriate for non-financial values such as:

- timer milliseconds;
- sequence counters where the tested domain defines ordinary safe integers;
- array indices.

## Security

Do not weaken:

- JWT verification;
- HMAC signing;
- RBAC;
- account ownership;
- account closure;
- risk;
- CSP/security headers;
- request size/depth protection;
- rate limiting

to make another test pass.

Do not log:

- passwords;
- tokens;
- Authorization;
- HMAC signatures;
- HMAC/JWT secrets;
- raw `.env`;
- AWS credentials;
- full sensitive request bodies.

## Git

Do not use:

- `git reset --hard`;
- `git clean -fd`;
- force push;
- history rewrite;
- blind branch deletion;
- blanket stash that risks teammate changes.

Do not automatically commit, merge, or push.

Show reviewed commands first.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 34

Copy the complete block below into Cursor Agent mode.

````text
Act as my senior TypeScript/JavaScript release engineer, fintech correctness reviewer, test-failure diagnostician, performance/concurrency reviewer, and final regression engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 34 ONLY: perform the full regression pass across the entire current ClearHouse submission, diagnose every remaining official organizer failure, repair only genuine production defects, preserve all correct behavior from Tasks 1–33, and produce a truthful final regression report.

Task 34 is NOT a new feature task.

Do not stop at a plan.

Inspect, run, diagnose, repair, rerun, document and show reviewed Git commands.

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

task-34

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–33;
- work on task-34;
- final reviewed work later merges into master;
- official publication is `git push origin master`;
- do not automatically commit, merge, or push.

============================================================
B. TASK 34 SCOPE
============================================================

TASK 34 MUST:

1. establish the exact current Git state;
2. inspect repository instructions;
3. read the current test/config runner structure read-only;
4. run TypeScript;
5. run sanity;
6. obtain a truthful full-suite baseline;
7. classify every failure;
8. repair only real production defects;
9. rerun each owning focused test after a fix;
10. rerun directly affected dependent challenges;
11. run the complete official suite again;
12. investigate flakes/open handles/performance instability;
13. verify protected files were untouched by Task34;
14. create a final regression engineering note;
15. prepare safe task-34 → master → origin/master commands.

TASK 34 MUST NOT:

- invent new product features;
- perform cosmetic refactors;
- rewrite architecture without a failing contract;
- modify organizer tests/config;
- modify scoring;
- execute grading upload scripts;
- claim a score;
- begin Task 35 browser/demo verification;
- begin Task 36 final submission packaging.

============================================================
C. READ PROJECT INSTRUCTIONS FIRST
============================================================

Before editing:

Read any current:
- AGENTS.md;
- .cursor rules;
- README;
- Challenges.md;
- current guide/instructions present in workspace.

Do not overwrite project instructions.

Current official tests are the behavioral specification.

The challenge prose explains intent but does not override current test assertions.

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
git log -25 --oneline --decorate
git diff --stat
git diff --cached --stat
git diff --name-only
git diff --cached --name-only

Confirm:
- origin = official CodeCommit;
- master = final submission branch.

Verify Task33 is represented on master:

git log --oneline --decorate --max-count=30 master

If task-33 exists:

git log --oneline --decorate --max-count=10 task-33

Do not discard valid changes.

If master is correct/current:

git switch master
git pull --ff-only origin master
git switch -c task-34

If task-34 already exists:

git branch --list task-34
git log --oneline --decorate --max-count=15 task-34

Do not delete/recreate blindly.

Record:

TASK34_START_COMMIT=$(git rev-parse HEAD)

In PowerShell, just copy/store the actual hash in the engineering note.

Also record:
- pre-existing modified files;
- pre-existing staged files;
- current Node/npm versions.

Do not expose credential-bearing remote URLs beyond the known clean repository URL.

============================================================
E. VERIFY PROTECTED BOUNDARIES
============================================================

At Task34 start, inspect protected paths read-only.

Run:

git status --short -- tests config vitest.config.ts package.json package-lock.json

Review package test script read-only.

Do NOT execute:

config/result.ts

or any grading/report upload script.

Task34 must not change protected organizer content.

At the end compare:

git diff <TASK34_START_COMMIT> -- tests config vitest.config.ts package.json package-lock.json

Expected Task34-added diff there:

NONE

unless the current official Challenge0v proves the previously authorized non-test package script fix was still missing. If that exceptional case occurs:
- never change scripts.test;
- document exact test;
- keep change minimal;
- rerun Challenge0v.

Do not modify config/result files.

============================================================
F. READ TEST-RUNNER / TEST INVENTORY
============================================================

Read, do not edit:

- package.json test/typecheck scripts;
- vitest.config.ts;
- tests/setup.ts if present;
- tests/testBase.ts if present;
- tests/_sanity.test.ts;
- config/scores.ts;
- config/run-tests.mjs or equivalent read-only.

Identify every official test file.

Expected feature files:

challenge01 through challenge21

plus:

challenge00.test.ts
challenge00b.test.ts
challenge00c.test.ts
_sanity.test.ts

Also note bug checks embedded in:
- challenge07;
- challenge09;
- challenge11

according to current source.

Do not infer pass/fail from static score config.

============================================================
G. REVIEW TASK33 NOTE / KNOWN REMAINING ISSUES
============================================================

Read:

docs/clearhouse-task-33-integration.md

if present.

Extract:
- full-suite result;
- remaining failures;
- flaky/timing issues;
- changed integration surfaces.

Treat it as a handoff, not proof.

Reproduce failures yourself.

============================================================
H. BASELINE — TYPECHECK
============================================================

Run:

npm run typecheck

Record:
- exit code;
- diagnostics;
- file/line;
- whether each error is new or pre-existing.

Do not continue changing code blindly if TypeScript has broad compile errors.

Prioritize compile correctness.

============================================================
I. BASELINE — SANITY
============================================================

Run:

npm test _sanity.test.ts

Record:
- executed;
- passed;
- failed;
- open-handle warnings;
- environment/setup issues.

Do not call sanity passing if the process was interrupted or timed out.

============================================================
J. BASELINE — FULL OFFICIAL SUITE
============================================================

Run:

npm test

This is the primary Task34 baseline.

Record:
- exit code;
- test files passed/failed;
- tests passed/failed;
- first failures;
- timeout/open-handle warnings;
- randomized/property seeds/paths;
- performance assertion measurements where reported.

Do not immediately fix the first line you see.

Build a failure matrix first.

Do not edit `test-results.xml`.

Do not execute grading upload.

============================================================
K. BUILD THE FAILURE MATRIX
============================================================

Create a table in the Task34 note:

| # | Test file | Test name | Failure type | First observed symptom | Likely owner | Repro command | Status |
|---|---|---|---|---|---|---|---|

Classify each failure into one of:

1. TYPE/COMPILE
2. DETERMINISTIC CORRECTNESS
3. RANDOM/PROPERTY
4. CONCURRENCY/RACE
5. PERFORMANCE
6. TIMER/LIFECYCLE
7. DB/TRANSACTION
8. SERIALIZATION/FORMAT
9. AUTH/SECURITY
10. FRONTEND/DOM
11. INTEGRATION
12. ENVIRONMENT/SETUP
13. CASCADE/SECONDARY FAILURE

Do not fix cascade symptoms before the root cause.

============================================================
L. FAILURE OWNERSHIP MAP
============================================================

Use this initial owner map:

challenge00 / 00b / 00c:
cross-cutting shipped bugs

01:
money/assets/auth/authz

02:
ledger

03:
matching

04:
holds/deposit/withdraw/settlement

05:
risk

06:
events/replay

07:
security

08:
market-data/time

09:
reconciliation/migration/reporting

10:
operations

11:
API/cache/versioning/performance

12:
dashboard foundation

13:
account closure

14:
netting

15:
strategy orders

16:
fees

17:
live client

18:
WebSocket server

19:
OpenAPI

20:
seed/informative dashboard

21:
integration

But always inspect actual stack trace and test.

The test owner is not necessarily the defect owner.

============================================================
M. ROOT-CAUSE RULE
============================================================

Before modifying production code, answer:

1. What exact invariant is violated?
2. What is the first layer where actual state diverges from expected state?
3. Which earlier dedicated challenge owns that invariant?
4. Does that dedicated challenge reproduce the defect?
5. What is the smallest production change?

Do not patch:
- response formatting
when state is already wrong;
- UI
when API is wrong;
- integration
when the core algorithm is wrong.

Fix the earliest wrong layer.

============================================================
N. REPRODUCE EACH FAILURE FOCUSED
============================================================

For each failed full-suite test file:

run the smallest owning command.

Examples:

npm test challenge03.test.ts

or:

npm test challenge03.test.ts -t "exact current test label"

Do not invent labels.

Use labels copied from current test output/source.

A filtered run is only evidence for the filtered tests.

Do not call the whole challenge passed because one `-t` run passed.

============================================================
O. FIX → FOCUSED TEST → REGRESSION LOOP
============================================================

For every change:

1. implement smallest fix;
2. run `npm run typecheck`;
3. run the exact failing test;
4. run the full owning challenge file;
5. run direct dependent challenges;
6. inspect `git diff --check`;
7. only then move to next failure.

Avoid accumulating five unrelated fixes before retesting.

============================================================
P. DEPENDENCY REGRESSION MAP
============================================================

When fixing a foundation, rerun dependents.

### If Challenge01 changes

rerun:
- challenge05
- challenge07
- challenge10 if login touched
- challenge18 if JWT touched
- challenge21

### If Challenge02 changes

rerun:
- challenge04
- challenge09
- challenge13
- challenge16
- challenge20
- challenge21

### If Challenge03 changes

rerun:
- challenge05
- challenge08
- challenge15
- challenge17/18 if depth changed
- challenge20 if trades changed
- challenge21

### If Challenge04 changes

rerun:
- challenge13
- challenge16 if settlement/ledger interaction
- challenge20/21 if balances/trading touched

### If Challenge05 changes

rerun:
- challenge03
- challenge13
- challenge21

### If Challenge06 changes

rerun:
- challenge21 if integrated
- replay/determinism relevant tests

### If Challenge08 changes

rerun:
- challenge03 if trade data shape changed
- challenge17/18 if depth/feed format touched
- challenge20/21

### If Challenge10 changes

rerun:
- challenge01 login
- challenge11
- challenge18 lifecycle
- challenge21

### If Challenge11 changes

rerun:
- challenge12
- challenge19
- challenge20
- challenge21

### If Challenge12 changes

rerun:
- challenge17
- challenge20
- challenge21

### If Challenge14 changes

rerun:
- challenge21

### If Challenge15 changes

rerun:
- challenge03
- challenge05
- challenge21 if strategy path integrated

### If Challenge16 changes

rerun:
- challenge02
- challenge04 if ledger/settlement touched
- challenge21

### If Challenge17 changes

rerun:
- challenge12
- challenge18
- challenge21

### If Challenge18 changes

rerun:
- challenge01 auth
- challenge10 lifecycle
- challenge17
- challenge21

### If Challenge20 changes

rerun:
- challenge02
- challenge11
- challenge12
- challenge21

### If Challenge21 changes

rerun:
- every directly touched dedicated challenge.

============================================================
Q. CHALLENGE 00 BUG-HUNT DISCIPLINE
============================================================

Challenge00 tests are shipped-defect checks, not invitations to bypass normal contracts.

When a Challenge00 test fails:

1. read its exact test;
2. identify the shipped defect;
3. fix the real source;
4. rerun the bug test;
5. rerun the feature challenge sharing that source.

Do not hardcode the bug fixture.

Do not add a special branch named after `0p`, `0w`, etc.

============================================================
R. PROPERTY / RANDOMIZED TEST FAILURES
============================================================

When fast-check/property tests fail:

record:
- seed;
- path;
- shrunk counterexample;
- first state divergence.

Do not:
- freeze the seed;
- change generator limits;
- repeatedly rerun until lucky;
- special-case the shrunk example.

Repair the invariant.

After fix:
- rerun the owning property test;
- if it passes, rerun it more than once only when useful to assess stability;
- do not waste time repeatedly rerunning an already-stable expensive suite without reason.

============================================================
S. DETERMINISM FAILURES
============================================================

If replaying same operations differs:

look for:
- Date.now();
- Math.random();
- random UUIDs;
- unstable Map/Set iteration used as output order;
- module-global sequence leakage;
- shared mutable defaults;
- DB row order without ORDER BY;
- asynchronous action order.

Do not seed randomness globally to hide nondeterminism.

Fix deterministic state/order.

============================================================
T. CONCURRENCY / RACE FAILURES
============================================================

For:
- holds;
- idempotency;
- matching cancel/fill;
- risk admission;
- WS subscribe/publish races;

identify the atomic boundary.

Do not fix races with:
- arbitrary sleeps;
- larger test timeout;
- global mutex around unrelated operations;
- repeated retry until lucky.

Use existing transaction/state serialization architecture.

Be especially aware SQLite test configuration may use a single connection.

Avoid nested transaction deadlocks.

============================================================
U. DB / TRANSACTION FAILURES
============================================================

Check:
- transaction executor passed through all nested helpers;
- no nested independent transaction;
- rollback leaves no partial rows;
- in-memory state isn't incorrectly assumed to rollback with DB;
- exact BigInt string conversion;
- row ordering where deterministic output required.

Do not reset the database globally from production code.

Do not run destructive migrate/seed just to hide a failing test.

============================================================
V. FINANCIAL EXACTNESS FAILURES
============================================================

Search affected path for:

rg -n "Number\(|parseFloat\(|parseInt\(" src client

Do not blindly remove every occurrence.

Determine whether the value is financial.

Financial paths:
- money;
- price;
- quantity;
- balances;
- notional;
- fees;
- net transfers;
- risk financial limits.

Use existing exact helpers.

Timer/sequence/display pixel values may remain Number.

============================================================
W. SERIALIZATION FAILURES
============================================================

If BigInt JSON or API/WS formatting fails:

fix only the boundary serializer.

Do not convert internal financial state to Number.

Ensure:
- REST;
- WS;
- dashboard;
- OpenAPI

agree with the tested integer-string contract.

============================================================
X. SECURITY FAILURES
============================================================

Never make a security test pass by relaxing another gate.

Examples:

401 vs 403:
fix semantics.

HMAC:
fix canonicalization/nonce/window.

JWT:
verify signature/purpose/family.

CSP:
use exact tested headers/routes.

Malformed/oversized request:
reject safely.

Do not expose stack/path/secrets.

After any security fix rerun:
- challenge01
- challenge07
- relevant challenge00 bug test
- challenge10 if logging/errors changed
- challenge18 if auth upgrade changed.

============================================================
Y. PERFORMANCE FAILURES
============================================================

Do not increase organizer timeout.

Do not special-case workload size.

Measure/inspect the exact hot path.

Common causes:
- O(n) deep-book insert;
- O(n²) netting scale path;
- repeated JSON serialization per WS client;
- query-per-row;
- rebuilding expensive state inside loops;
- excess logging;
- accidental sleeps/retries.

Optimize the actual algorithm/data structure.

After performance fix:
verify correctness challenge first, then performance test.

Do not trade correctness for speed.

============================================================
Z. TIMER / OPEN-HANDLE FAILURES
============================================================

If Vitest hangs or warns:

inspect:
- heartbeat intervals;
- reconnect timers;
- stale timers;
- gap timers;
- HTTP servers;
- WebSocket servers;
- sockets;
- DB connections;
- unfinished transactions.

Fix lifecycle cleanup.

Do not:
- force `process.exit`;
- add test-only unref hacks;
- increase test timeout.

`unref()` may be legitimate only if already architecturally appropriate, not as a substitute for cleanup.

============================================================
AA. FRONTEND / DOM FAILURES
============================================================

Preserve:
- safe `textContent`;
- XSS protections;
- loading/empty/error;
- accessibility;
- stale/reconnecting behavior;
- existing tested IDs/classes.

Do not redesign markup globally for one selector failure.

Fix the minimal renderer/state issue.

Rerun:
- challenge12
- challenge17
- challenge20
- challenge21
as appropriate.

============================================================
AB. OPENAPI FAILURES
============================================================

Do not change working endpoints to fit docs.

The OpenAPI document must describe reality.

Fix:
- path coverage;
- schemas;
- examples/types;
- security requirements;
- docs CSP

without rewriting business API unless actual API is the wrong layer.

Rerun challenge19 + challenge11.

============================================================
AC. CACHE FAILURES
============================================================

Do not:
- TTL=0;
- clear all keys after every write;
- disable cache under tests.

Fix:
- exact cache key;
- TTL units;
- invalidation timing;
- fresh next read.

Rerun challenge11 and relevant data owner.

============================================================
AD. FULL-SUITE CASCADE FAILURES
============================================================

If a test passes alone but fails in full suite:

suspect state leakage/lifecycle.

Inspect:
- module-global mutable state;
- caches;
- risk registry;
- matching singleton;
- fee volume/idempotency state;
- WebSocket topic sequence;
- LiveFeed timers;
- database cleanup;
- event store state.

Do not blame test order without proving leakage.

Fix isolation/reset through real public lifecycle, not test-detection.

============================================================
AE. TEST ORDER DEPENDENCE
============================================================

If suspected:

run:
1. failing test alone;
2. likely preceding challenge then failing challenge;
3. full relevant group.

Do not modify Vitest test order.

Find leaked state.

============================================================
AF. FLAKINESS GATE
============================================================

A test that "usually passes" is not complete.

For any test that failed nondeterministically during Task34:

after fixing:
- rerun its focused command enough times to establish stability;
- keep the number reasonable;
- record if it had any intermittent failure.

Do not hide a flaky pass.

Timing/property tests that have never failed need not be spam-run repeatedly.

============================================================
AG. FAILURE PRIORITY
============================================================

Fix in this order unless dependency evidence says otherwise:

1. typecheck/compiler
2. sanity/setup/lifecycle blockers
3. foundation/security exactness
4. ledger/settlement correctness
5. matching/risk
6. event/reconciliation
7. API/server
8. algorithms (netting/fees/strategies)
9. WebSocket/live client
10. dashboard/OpenAPI/demo
11. final integration
12. isolated performance/flakiness

Why:
lower-level failures can create many downstream symptoms.

============================================================
AH. DO NOT REWRITE PASSING AREAS
============================================================

Before changing a module:

check its dedicated challenge.

If it passes and the integration issue can be fixed at an adapter boundary:
prefer the adapter.

Do not replace a proven algorithm with a large refactor during final regression.

============================================================
AI. DIFF SIZE CONTROL
============================================================

After every fix group:

git diff --check
git diff --stat
git diff --name-only

If Task34 diff grows unexpectedly:
stop and review.

Avoid:
- prettier-style whole-file churn;
- line-ending changes;
- unrelated comments;
- renames.

Task34 should be surgically small relative to the completed project.

============================================================
AJ. DEBUG OUTPUT CLEANUP
============================================================

Temporary local diagnostics may be used during reasoning.

Before final verification remove:
- console.log;
- console.debug;
- temporary dump files;
- instrumentation;
- test fixtures copied into source.

Keep legitimate structured Task10 request logging.

Do not delete required logs.

============================================================
AK. NO SCORE CLAIMS
============================================================

Do not report:
- "100%"
- "3195/3195"
- "4117 total"
- predicted judging score

unless an actual official grading output explicitly provides it and the user later asks.

Task34 reports tests.

The static available raw feature and bug points are not an earned-score calculation.

Do not execute result uploader to obtain a score.

============================================================
AL. INTERMEDIATE FULL SUITE
============================================================

After repairing the initial failure cluster:

run:

npm test

again.

If failures remain:
repeat failure-matrix process.

Do not make broad speculative changes between full runs.

============================================================
AM. FINAL INDIVIDUAL FEATURE MATRIX
============================================================

Before declaring Task34 complete, ensure every official challenge file's final status is known.

If the final `npm test` output clearly proves all are included and pass, do not redundantly rerun every file solely for ceremony.

If full output is ambiguous/truncated for a challenge, run that challenge file directly.

Final matrix must cover:

challenge00
challenge00b
challenge00c
challenge01
challenge02
challenge03
challenge04
challenge05
challenge06
challenge07
challenge08
challenge09
challenge10
challenge11
challenge12
challenge13
challenge14
challenge15
challenge16
challenge17
challenge18
challenge19
challenge20
challenge21
_sanity
typecheck

No unknown status.

============================================================
AN. FINAL TYPECHECK
============================================================

Run:

npm run typecheck

after all fixes.

Do not rely only on an earlier run.

============================================================
AO. FINAL FULL SUITE
============================================================

Run:

npm test

after the last production change.

This is mandatory.

Record exact final summary.

If any test fails:
Task34 is PARTIAL.

Do not call Task34 COMPLETE.

============================================================
AP. FINAL SANITY
============================================================

If the full suite includes sanity clearly, record it.

Otherwise run:

npm test _sanity.test.ts

after the final change.

============================================================
AQ. PROTECTED-FILE VERIFICATION
============================================================

Compare Task34 changes against the recorded start commit.

Run with the actual start hash:

git diff <TASK34_START_COMMIT> -- tests config vitest.config.ts package.json package-lock.json

Also:

git diff --check
git status --short
git diff --stat
git diff --name-only

Task34 should not introduce protected-file changes.

If there were pre-existing protected changes before Task34:
do not revert them automatically;
report them separately.

============================================================
AR. SECRET SCAN — REVIEW, NOT EXFILTRATION
============================================================

Review changed files for accidental:
- passwords;
- JWTs;
- HMAC secret;
- Authorization;
- AWS credentials;
- private tokens.

Do not print secret values.

If a secret is accidentally introduced by Task34:
remove it before staging.

Do not scan/show `.env` contents.

============================================================
AS. ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-34-full-regression.md

Include:

1. Task34 starting commit.
2. Working branch task-34.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Node/npm versions.
6. Protected-boundary status.
7. Initial typecheck.
8. Initial sanity.
9. Initial full-suite summary.
10. Initial failure matrix.
11. Root cause for every repaired failure.
12. Exact files changed per repair.
13. Focused test run after each repair.
14. Direct dependency regressions.
15. Any property seed/path encountered.
16. Any concurrency race encountered.
17. Any performance failure and measured result.
18. Any timing/open-handle issue.
19. Any full-suite-only state leakage.
20. Any flaky test observed and stability reruns.
21. Final typecheck.
22. Final sanity.
23. Final challenge00 status.
24. Final challenge00b status.
25. Final challenge00c status.
26. Final challenge01 status.
27. Final challenge02 status.
28. Final challenge03 status.
29. Final challenge04 status.
30. Final challenge05 status.
31. Final challenge06 status.
32. Final challenge07 status.
33. Final challenge08 status.
34. Final challenge09 status.
35. Final challenge10 status.
36. Final challenge11 status.
37. Final challenge12 status.
38. Final challenge13 status.
39. Final challenge14 status.
40. Final challenge15 status.
41. Final challenge16 status.
42. Final challenge17 status.
43. Final challenge18 status.
44. Final challenge19 status.
45. Final challenge20 status.
46. Final challenge21 status.
47. Final full-suite summary.
48. Remaining known issues, if any.
49. Confirmation no test/config/scoring/timeouts were changed.
50. Confirmation no grading-upload script executed.
51. Confirmation no score was guessed.
52. Exact Task34 changed files.
53. `git diff --check`.
54. Suggested commit.
55. master merge/push workflow.
56. Next Task35: browser/demo/smoke verification.

Do not include secrets.

Keep failure logs summarized; do not paste huge output.

============================================================
AT. TASK 34 COMPLETION CRITERIA
============================================================

Task34 is COMPLETE only when all of the following are true:

GIT / RULES

[ ] correct CodeCommit origin confirmed.
[ ] official final branch confirmed as master.
[ ] task-34 based on latest valid master.
[ ] Task33 represented.
[ ] protected starting state recorded.
[ ] organizer tests not modified.
[ ] config/scoring not modified.
[ ] vitest/test discovery not modified.
[ ] scripts.test not modified.
[ ] grading upload not executed.
[ ] no new dependencies.
[ ] no destructive Git.

BASELINE / TRIAGE

[ ] typecheck baseline run.
[ ] sanity baseline run.
[ ] full suite baseline run.
[ ] every initial failure recorded.
[ ] cascade failures distinguished from roots.
[ ] focused reproduction used before changes.

REPAIRS

[ ] every Task34 code change maps to a real failing organizer assertion.
[ ] smallest production fix used.
[ ] no hardcoded fixtures.
[ ] no test detection.
[ ] exact financial arithmetic preserved.
[ ] security not weakened.
[ ] relevant owning challenge rerun.
[ ] relevant dependent challenges rerun.
[ ] property failures fixed generally.
[ ] race failures fixed atomically.
[ ] performance failures fixed algorithmically.
[ ] timer/open-handle leaks fixed properly.
[ ] temporary debug output removed.

FINAL VERIFICATION

[ ] final typecheck passes.
[ ] challenge00 final status known.
[ ] challenge00b final status known.
[ ] challenge00c final status known.
[ ] challenges01–21 final statuses all known.
[ ] sanity final status known.
[ ] final `npm test` was run after LAST code change.
[ ] final full suite passes completely for COMPLETE status.
[ ] no unresolved flaky failure.
[ ] `git diff --check` passes.
[ ] Task34 protected-file diff verified.
[ ] no secrets added.
[ ] engineering note completed.

If any official test remains failing:
Task34 = PARTIAL.

Report:
- exact test;
- reproducibility;
- root cause;
- what was attempted;
- safest next action.

Do not fabricate green status.

============================================================
AU. FINAL CURSOR REPORT
============================================================

Return:

1. Task34 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact Task34 files changed.
5. Initial typecheck result.
6. Initial sanity result.
7. Initial full-suite result.
8. Initial failing tests/files.
9. Root causes found.
10. Repairs made.
11. Property/random issues encountered.
12. Concurrency issues encountered.
13. Performance issues encountered.
14. Timer/open-handle issues encountered.
15. Flakiness issues encountered.
16. Final typecheck.
17. Challenge00 result.
18. Challenge00b result.
19. Challenge00c result.
20. Challenge01 result.
21. Challenge02 result.
22. Challenge03 result.
23. Challenge04 result.
24. Challenge05 result.
25. Challenge06 result.
26. Challenge07 result.
27. Challenge08 result.
28. Challenge09 result.
29. Challenge10 result.
30. Challenge11 result.
31. Challenge12 result.
32. Challenge13 result.
33. Challenge14 result.
34. Challenge15 result.
35. Challenge16 result.
36. Challenge17 result.
37. Challenge18 result.
38. Challenge19 result.
39. Challenge20 result.
40. Challenge21 result.
41. Sanity result.
42. Final full-suite exact summary.
43. Remaining failures/issues.
44. Protected-file verification.
45. Confirmation grading upload was NOT run.
46. Confirmation no score was guessed.
47. Final diff summary.
48. Reviewed Git commands targeting master.

Suggested commit:

fix: resolve final regression failures

If Task34 only changes documentation because everything already passes:

Suggested commit:

docs: record final regression verification

Do not automatically commit, merge, or push.
````

---

# Task 34 recommended execution sequence

This is the efficient order Cursor should follow.

## Phase 1 — Establish truth

```powershell
npm run typecheck
npm test _sanity.test.ts
npm test
```

Do not immediately run 25 separate commands before knowing what is broken.

Use the full baseline to find failures.

## Phase 2 — Failure-driven repair

For each failed test:

```text
read exact assertion
→ focused reproduce
→ identify root
→ smallest fix
→ typecheck
→ focused run
→ full owner challenge
→ direct dependency regressions
```

## Phase 3 — Intermediate suite

```powershell
npm test
```

If failures remain, repeat Phase 2.

## Phase 4 — Final verification

After the final code edit:

```powershell
npm run typecheck
npm test
git diff --check
```

If the full output does not clearly expose every required test-file status, run the ambiguous file directly.

---

# Final challenge matrix template

Cursor should fill this in the engineering note.

| Scope | Final status | Evidence |
|---|---|---|
| TypeScript | PASS/FAIL | command + summary |
| Sanity | PASS/FAIL | command + summary |
| Challenge 00 | PASS/FAIL | command/full suite |
| Challenge 00b | PASS/FAIL | command/full suite |
| Challenge 00c | PASS/FAIL | command/full suite |
| Challenge 01 | PASS/FAIL | command/full suite |
| Challenge 02 | PASS/FAIL | command/full suite |
| Challenge 03 | PASS/FAIL | command/full suite |
| Challenge 04 | PASS/FAIL | command/full suite |
| Challenge 05 | PASS/FAIL | command/full suite |
| Challenge 06 | PASS/FAIL | command/full suite |
| Challenge 07 | PASS/FAIL | command/full suite |
| Challenge 08 | PASS/FAIL | command/full suite |
| Challenge 09 | PASS/FAIL | command/full suite |
| Challenge 10 | PASS/FAIL | command/full suite |
| Challenge 11 | PASS/FAIL | command/full suite |
| Challenge 12 | PASS/FAIL | command/full suite |
| Challenge 13 | PASS/FAIL | command/full suite |
| Challenge 14 | PASS/FAIL | command/full suite |
| Challenge 15 | PASS/FAIL | command/full suite |
| Challenge 16 | PASS/FAIL | command/full suite |
| Challenge 17 | PASS/FAIL | command/full suite |
| Challenge 18 | PASS/FAIL | command/full suite |
| Challenge 19 | PASS/FAIL | command/full suite |
| Challenge 20 | PASS/FAIL | command/full suite |
| Challenge 21 | PASS/FAIL | command/full suite |

---

# Targeted command reference

Use only when needed after the baseline/full run.

```powershell
npm test challenge00.test.ts
npm test challenge00b.test.ts
npm test challenge00c.test.ts

npm test challenge01.test.ts
npm test challenge02.test.ts
npm test challenge03.test.ts
npm test challenge04.test.ts
npm test challenge05.test.ts
npm test challenge06.test.ts
npm test challenge07.test.ts
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
npm test challenge21.test.ts

npm test _sanity.test.ts
```

Do not run all of these repeatedly if the complete suite already proves they pass.

Efficiency matters.

---

# Protected-file final check

Use the actual Task34 start commit hash:

```powershell
git diff <TASK34_START_COMMIT> -- tests
git diff <TASK34_START_COMMIT> -- config
git diff <TASK34_START_COMMIT> -- vitest.config.ts
git diff <TASK34_START_COMMIT> -- package.json
git diff <TASK34_START_COMMIT> -- package-lock.json
```

Do not paste `<TASK34_START_COMMIT>` literally.

For Task34, these should normally show no new changes.

If `package.json` contains the legitimate old Task2 database-script fix, that should already be part of the starting commit and therefore not appear in this Task34 diff.

---

# Official Git / CodeCommit workflow — Task 34

Official final branch:

**`master`**

Workflow:

**`master` → `task-34` → diagnose/fix/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 34 branch

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
task-34
```

Official final branch:

```text
master
```

---

## 2. Final verification before staging

After the LAST Task34 code change:

```powershell
npm run typecheck

npm test

git diff --check
git status --short
git diff --stat
git diff --name-only
```

If `npm test` fails:

do NOT commit as a "complete regression pass" without documenting the failure.

Continue diagnosis or mark Task34 PARTIAL.

---

## 3. Review every Task34 production change

```powershell
git diff --stat
git diff --name-only
```

Then inspect every changed production file individually:

```powershell
git diff -- "<actual-file-1>"
git diff -- "<actual-file-2>"
```

Do not paste placeholders literally.

Review engineering note:

```powershell
git diff -- docs/clearhouse-task-34-full-regression.md
```

Confirm there is no unrelated refactor noise.

---

## 4. Verify protected files before staging

With the actual recorded Task34 start hash:

```powershell
git diff <TASK34_START_COMMIT> -- tests config vitest.config.ts package.json package-lock.json
```

Do not paste placeholder literally.

Expected:

no Task34 changes.

Also confirm:

```powershell
git diff --check
```

---

## 5. Stage Task 34 files selectively

Always stage the note:

```powershell
git add -- docs/clearhouse-task-34-full-regression.md
```

Then stage only production files that Task34 actually changed:

```powershell
git add -- "<actual-fixed-production-file>"
```

Do not paste placeholders literally.

For multiple reviewed files, stage each explicitly.

If a file contains unrelated edits:

```powershell
git add -p -- "<file-path>"
```

Do NOT use:

```text
git add .
```

during a final regression pass.

---

## 6. Review staged content

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached
```

Stop if staged changes include unexpected:

- tests;
- config;
- grading scripts;
- package dependency/version changes;
- `.env`;
- secrets;
- Task35/36 work;
- unrelated formatting.

---

## 7. Commit Task 34

If production fixes were needed:

```powershell
git commit -m "fix: resolve final regression failures"
```

If everything already passed and only the regression note changed:

```powershell
git commit -m "docs: record final regression verification"
```

Verify:

```powershell
git show --stat --oneline HEAD
git status -sb
```

---

## 8. Update official master

```powershell
git switch master
git fetch origin
```

Inspect divergence:

```powershell
git log --oneline --left-right master...origin/master
```

If local master is only behind:

```powershell
git pull --ff-only origin master
```

Never reset teammate changes.

---

## 9. Merge Task 34

Prefer:

```powershell
git merge --ff-only task-34
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=40
```

If the history legitimately diverged:

```powershell
git merge task-34
```

Resolve intentionally.

No force/reset.

---

## 10. Mandatory post-merge verification on master

After merge:

```powershell
git branch --show-current
```

Expected:

```text
master
```

Then run again:

```powershell
npm run typecheck
npm test
git diff --check
git status -sb
```

This post-merge run is important because `master` is the actual submission branch.

If it fails:

do not push blindly.

Fix on a new/reopened task branch or carefully address the merge issue before publication.

---

## 11. Push official master

Only after the post-merge verification is acceptable:

```powershell
git push origin master
```

Do not push the final competition submission only to `main`.

Do not force push.

---

## 12. Verify remote master

```powershell
git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

The local full HEAD hash and remote `refs/heads/master` hash must match.

---

# If push is rejected

Do not force.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If it is safe to replay the local Task34 commit:

```powershell
git pull --rebase origin master
```

Then the rebase has changed commit identity.

Therefore rerun:

```powershell
npm run typecheck
npm test
git diff --check
```

Then:

```powershell
git push origin master
```

Verify the remote hash again.

---

# Task 34 fast checklist

## Rules

- [ ] current checkout authoritative
- [ ] origin CodeCommit verified
- [ ] final branch master
- [ ] task-34 created from latest valid master
- [ ] no tests edited
- [ ] no config/scoring edited
- [ ] no timeout/generator edits
- [ ] no test-detection
- [ ] grading upload not executed
- [ ] no score guessed
- [ ] no new dependencies
- [ ] no destructive Git

## Baseline

- [ ] typecheck baseline
- [ ] sanity baseline
- [ ] full npm test baseline
- [ ] failure matrix
- [ ] cascade failures separated

## Diagnosis

- [ ] each failure reproduced focused
- [ ] exact invariant identified
- [ ] root layer identified
- [ ] smallest fix chosen
- [ ] no passing subsystem rewritten unnecessarily

## Correctness

- [ ] exact financial arithmetic retained
- [ ] transaction atomicity retained
- [ ] concurrency fixed without sleeps
- [ ] property tests fixed generally
- [ ] determinism preserved
- [ ] security preserved
- [ ] caches not disabled
- [ ] lifecycle timers/resources cleaned
- [ ] frontend safety/accessibility preserved

## Final status

- [ ] typecheck final PASS
- [ ] Challenge00 known
- [ ] Challenge00b known
- [ ] Challenge00c known
- [ ] Challenge01 known
- [ ] Challenge02 known
- [ ] Challenge03 known
- [ ] Challenge04 known
- [ ] Challenge05 known
- [ ] Challenge06 known
- [ ] Challenge07 known
- [ ] Challenge08 known
- [ ] Challenge09 known
- [ ] Challenge10 known
- [ ] Challenge11 known
- [ ] Challenge12 known
- [ ] Challenge13 known
- [ ] Challenge14 known
- [ ] Challenge15 known
- [ ] Challenge16 known
- [ ] Challenge17 known
- [ ] Challenge18 known
- [ ] Challenge19 known
- [ ] Challenge20 known
- [ ] Challenge21 known
- [ ] sanity known
- [ ] final npm test after LAST code edit
- [ ] no unresolved flaky failure
- [ ] git diff --check PASS
- [ ] protected-file Task34 diff clean
- [ ] note created
- [ ] commit reviewed
- [ ] master post-merge typecheck
- [ ] master post-merge full npm test
- [ ] `git push origin master`
- [ ] remote master hash verified

**Next planned task:** Task 35 — browser/manual demo verification and submission-ready smoke test.
