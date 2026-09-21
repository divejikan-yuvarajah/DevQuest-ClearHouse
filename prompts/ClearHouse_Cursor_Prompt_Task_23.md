# ClearHouse — Complete Enhanced Cursor Prompt for Task 23

**Task:** Challenge 20a + 20b — Demo Seed Funding and Accounts API  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-23`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 23 purpose

Task 23 implements the **backend/demo-data foundation of Challenge 20 — Dashboard and Demo Data**.

Task 23 covers only:

- **20a — Initial demo data**
- **20b — Accounts API**

Task 24 will implement:

- **20c — Informative dashboard**

Do **not** steal Task 24 scope.

The goal of Task 23 is to make a fresh development/test database immediately useful:

1. Seed at least five real trading accounts.
2. Fund each trading account with at least two known assets.
3. Create that funding through real **balanced double-entry ledger postings**.
4. Keep stored balances consistent with those postings.
5. Make the seed completely **idempotent**.
6. Add `GET /api/ledger/accounts` to list every account and its balances in deterministic name order.

The seed must not fake financial state by directly inserting arbitrary balances with no matching ledger history.

---

# Published Challenge 20 contract — 160 points

## Task 23 scope — 20a + 20b = 80 points

### 20a — Initial data — 55 pts

#### 20a-1 — 15 pts

Running the demo seed creates:

- at least **five funded trading accounts**;
- each trading account holds at least **two known assets**.

#### 20a-2 — 25 pts

Initial funding must be genuine double-entry accounting:

- every funding ledger entry balances;
- the complete ledger trial balance sums to zero independently per asset;
- ledger postings agree with the stored balance projection.

#### 20a-3 — 15 pts

Running the demo seed again changes **nothing**.

This includes no duplicate:

- accounts;
- funding entries;
- postings;
- balance increments.

The second run must leave the database state logically identical.

---

### 20b — Accounts API — 25 pts

#### 20b-1 — 25 pts

`GET /api/ledger/accounts`

must list:

- every account required by the current test;
- each account's balances/holdings;
- accounts sorted by **name** according to the exact organizer contract.

Read the exact response envelope and balance-row shape from `tests/challenge20.test.ts`.

Do not guess.

---

# Task 24 scope — DO NOT IMPLEMENT NOW

The remaining Challenge 20 items are Task 24:

- 20c-1 account-list dashboard rendering;
- 20c-2 exact portfolio summary;
- 20c-3 risk-usage meters;
- 20c-4 recent-trades panel.

These total the other **80 points** of Challenge 20.

Task 23 may provide the backend data/API Task 24 will consume, but must not implement the Task 24 dashboard features.

---

# Challenge 20 score split

```text
20a = 55
20b = 25
----------------
Task 23 = 80

20c = 80
----------------
Challenge 20 total = 160
```

These are available points only, not an earned-score claim.

---

# Critical Task 23 seed exception

Earlier tasks generally protected `db/seeds/`.

**Task 23 is explicitly a seed challenge.**

Cursor MAY modify:

- the existing designated demo seed file(s) exercised by `tests/challenge20.test.ts`;
- a directly related seed helper already intended for demo funding.

Cursor must NOT:

- rewrite unrelated seeds;
- change migrations merely to make seeding easier;
- truncate user/test data in the seed;
- delete all ledger/account tables before reseeding;
- create a separate shadow schema;
- modify `package.json` seed commands.

Read the exact current seed filename(s) first.

---

# Existing invariants Task 23 must preserve

## Task 4 — Exact money / known assets

Use:

- exact integer minor-unit strings;
- BigInt internally;
- only known/supported asset codes required by the current asset registry.

Do not use floating-point money.

## Task 8 — Accounts

Preserve:

- valid account types only;
- nonblank names;
- duplicate names generally allowed;
- new registered accounts active;
- missing/unregistered account semantics unchanged.

The demo accounts themselves should use deterministic unique IDs/names where safe for seed idempotency, based on the actual schema/test contract.

## Task 10 — Double-entry ledger

Preserve:

- balanced postings independently per asset;
- append-only entries;
- exact BigInt;
- `insertBalancedEntry(...)` / `postEntry(...)` semantics;
- `trialBalance()`.

Do not bypass the ledger with fake balance rows.

## Task 18 — Account closure

Seed-created trading accounts should be active/open.

Do not reopen existing user accounts that have been legitimately closed unless the organizer seed contract explicitly requires replacing/resetting a disposable demo record.

## Task 21 — API envelopes/versioning

The new accounts API must fit the established API response convention and route tree.

If Task 21 mounts the ledger router under both:

- `/api`
- `/api/v1`

the new route should naturally inherit the same versioning behavior unless tests indicate otherwise.

## Task 22 — Dashboard

Do not implement 20c yet.

Preserve Task 22 code while making the new accounts endpoint ready for Task 24.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 23

Copy the entire block below into Cursor Agent mode.

````text
Act as my senior TypeScript fintech backend engineer, database seeding engineer, and double-entry accounting reviewer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 23 ONLY: implement Challenge 20a and 20b — idempotent demo funding plus GET /api/ledger/accounts.

Preserve all completed Tasks 1–22.

Do not implement Challenge 20c dashboard aggregation/rendering yet. That is Task 24.

Your work must:
- create meaningful demo accounts;
- fund them using real balanced ledger entries;
- keep account_balances consistent with ledger postings;
- be idempotent on rerun;
- expose a deterministic accounts-with-balances API;
- preserve exact BigInt money and account status rules.

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

task-23

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–22;
- work on task-23;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit/merge/push automatically.

============================================================
B. STRICT TASK 23 SCOPE
============================================================

IMPLEMENT:

Challenge 20a:
- at least five funded trading accounts;
- at least two known assets per funded trading account;
- double-entry funding;
- ledger trial balance zero per asset;
- postings agree with account balances;
- rerunning demo seed changes nothing.

Challenge 20b:
- GET /api/ledger/accounts;
- list all organizer-required accounts;
- include each account's balances;
- deterministic name sorting;
- exact response envelope/field shape.

PRESERVE:
- Tasks 4/8/10/18/21/22;
- exact-money behavior;
- existing ledger history;
- account status rules;
- API envelopes/versioning;
- existing dashboard.

DO NOT IMPLEMENT:
- Challenge 20c account-list dashboard;
- portfolio summary;
- risk usage meters;
- recent trades UI;
- Swagger;
- fee engine;
- WebSockets;
- integration Challenge 21.

============================================================
C. ORGANIZER / PROTECTED-FILE RULES
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
- grading/result-upload scripts

SEED EXCEPTION:

You MAY edit only:
- the exact demo seed file(s) used by Challenge 20;
- a directly related existing demo-seed helper if the test/source architecture requires it.

Do NOT edit unrelated seed files.

Do NOT:
- truncate tables;
- delete existing accounts/ledger/balances as a normal seed strategy;
- call destructive reset scripts from the seed;
- run `npm run migrate` automatically as part of seed;
- use production test detection;
- hardcode organizer fixture checks.

Do NOT add source logic checking:

- NODE_ENV === "test";
- VITEST;
- test filenames;
- known generated account IDs from the organizer;
- current row counts from visible tests.

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

Verify Task 22 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-22 exists:

git log --oneline --decorate --max-count=10 task-22

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-23

If task-23 already exists:

git branch --list task-23
git log --oneline --decorate --max-count=10 task-23

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
- docs/clearhouse-task-18-account-closure.md
- docs/clearhouse-task-21-api-cache-performance.md
- docs/clearhouse-task-22-dashboard.md

Verify actual source, not just documentation.

Before editing run:

npm run typecheck

npm test challenge02.test.ts

npm test challenge13.test.ts

npm test challenge11.test.ts

These validate:
- ledger;
- account closure;
- API integration

before Task 23 changes.

============================================================
F. READ CHALLENGE 20 COMPLETELY
============================================================

Read:

tests/challenge20.test.ts

from first line to last line.

Task 23 implements only:
- Challenge 20a;
- Challenge 20b.

Still read 20c so your backend output remains compatible with Task 24.

Read:

config/scores.ts

READ ONLY.

Build a coverage table:

test label
| score
| seed/API function
| table(s)
| exact assertion
| current defect
| Task 23 or Task 24

Confirm:
- exact current Challenge 20 test count;
- exact 20a test names;
- exact 20b test name;
- exact seed import/path;
- exact expected account type;
- exact API response shape;
- exact sorting assertion;
- any status/balance fields 20b already requires.

Do not guess from prose if the test is more specific.

============================================================
G. DISCOVER THE CURRENT SEED ARCHITECTURE
============================================================

Inspect:

- db/seeds/
- all current seed filenames;
- package.json seed script READ ONLY;
- knexfile.js READ ONLY;
- db/db-config.ts;
- migration schema definitions for:
  - accounts
  - account_balances
  - ledger_entries
  - ledger_postings

Search:

rg -n "seed|accounts|account_balances|ledger_entries|ledger_postings|insertBalancedEntry|postEntry|writeBalance|trialBalance" db src tests

PowerShell fallback:

Get-ChildItem -Recurse db,src,tests -File |
  Select-String -Pattern "seed|accounts|account_balances|ledger_entries|ledger_postings|insertBalancedEntry|postEntry|writeBalance|trialBalance"

Record:
- exact demo seed file;
- whether seed is TS/JS;
- whether it can import src repositories;
- current seed execution order;
- existing starter/demo accounts;
- current deterministic IDs/names;
- any source/funding/house account already intended for balancing entries.

============================================================
H. RUN TASK 23 BASELINE
============================================================

Run:

npm test challenge20.test.ts -t "Challenge 20a|Challenge 20b"

If current labels differ, use the real labels.

Record:
- executed count;
- passed;
- failed;
- first real failure per test;
- current seed/API stubs.

Also run:

npm test challenge20.test.ts

Record 20c separately.

Do NOT classify 20c failures as Task 23 failures.

============================================================
I. FRESH-DATABASE SEED CONTRACT
============================================================

The normal project workflow is:

npm run migrate
npm run seed

The Task 23 seed must work on a correctly migrated database.

Do not:
- create tables itself;
- run migrations itself;
- alter schema dynamically.

Do not modify migration files.

============================================================
J. SEED MUST CREATE AT LEAST FIVE TRADING ACCOUNTS
============================================================

Challenge 20a-1 requires:

>= 5 funded trading accounts.

Read exact account type enum/test.

Use the exact trading-account type value required by current schema/domain.

Do not invent `"TRADER"` if enum says something else.

Each demo account must:
- have stable identity suitable for idempotent seeding;
- have nonblank human-readable name;
- be active/open;
- hold at least two known assets.

============================================================
K. DETERMINISTIC DEMO IDENTITIES
============================================================

For idempotency, prefer deterministic demo identifiers if current schema allows caller-supplied seed IDs.

Examples conceptually:

demo-alice
demo-bob
...

Do not use random UUIDs on every seed run unless you also have a durable stable marker that prevents duplicate creation.

Do not rely only on account name uniqueness because normal application rules allow duplicate names.

Use:
- stable IDs;
- or another exact unique seed marker supported by the current schema.

Do not add a migration solely for a seed marker.

============================================================
L. DO NOT REOPEN OR OVERWRITE USER ACCOUNTS
============================================================

The seed must not broadly update all accounts.

If a deterministic demo ID already exists:
- verify it belongs to the intended demo record according to current seed/test design;
- do not blindly overwrite a legitimate unrelated record.

Do not:
- set every account to active;
- rename existing accounts;
- zero balances;
- delete closed accounts.

Keep demo data isolated and deterministic.

============================================================
M. KNOWN ASSETS ONLY
============================================================

Each funded demo trading account must hold at least two assets that are recognized by the current asset registry.

Read:
- Task 4 registry;
- Challenge 20 test.

Use actual known codes.

Do not invent unsupported assets.

Do not hardcode decimal exponent assumptions into funding logic.

Funding amounts are integer minor units.

============================================================
N. MEANINGFUL POSITIVE FUNDING
============================================================

"Funded" should mean a real positive holding.

Do not satisfy "two assets" by inserting:
- zero balances;
- negative balances;
- held-only artificial rows unless test says so.

Use clear positive available balances suitable for later dashboard/demo trading.

Preserve held = 0 initially unless current test specifies otherwise.

============================================================
O. FUNDING MUST BE DOUBLE-ENTRY
============================================================

Every initial funding movement must be represented by balanced ledger postings.

For a given asset:

sum(posting amounts for an entry) === 0n

Do not create a one-sided positive posting for the trading account.

Each credit/debit must have an equal and opposite posting according to the current signed-posting convention.

============================================================
P. IDENTIFY THE FUNDING COUNTERPARTY MODEL
============================================================

Read current schema/test.

A valid design may use:
- one house/treasury/equity account;
- per-asset funding accounts;
- an existing designated seed funding account.

Do not invent extra accounts that break the exact organizer assertion if it expects only certain account types/list behavior.

If a funding/house account appears in GET /api/ledger/accounts:
follow exact test expectations for whether it should be included.

Do not hide a real account from the API merely because it is internal unless contract says so.

============================================================
Q. ACCOUNTING SIGN CONVENTION
============================================================

Read Task 10 ledger domain.

Do not assume positive means credit or debit from conventional accounting terminology.

Use the project's actual signed posting convention.

The test cares that:
- funding entries balance;
- derived/posting balances match stored balances.

Build postings accordingly.

============================================================
R. USE THE EXISTING LEDGER IMPLEMENTATION
============================================================

Prefer reusing:
- insertBalancedEntry(...);
- postEntry(...);
- or the exact repository helper current seed architecture can safely call.

Do not duplicate ledger-balance validation in the seed unless the seed runtime cannot import repository code and the existing seed pattern intentionally uses Knex directly.

If direct Knex insertion is required:
- reproduce the exact schema correctly;
- call/shared use `assertBalanced` if possible;
- preserve entry/posting invariants.

Do not weaken Task 10.

============================================================
S. SEED TRANSACTIONALITY
============================================================

Strong default:

run the Task 23 demo-seed work in one database transaction, or in clearly atomic per-demo-account transactions if current Knex seed runner/repository architecture requires that.

A failure should not leave:
- half-created accounts;
- one-sided funding postings;
- updated balances without ledger entries.

Do not start nested transactions that deadlock SQLite.

If using `insertBalancedEntry(trx, ...)`, pass the existing transaction executor.

============================================================
T. ACCOUNT_BALANCES MUST AGREE WITH LEDGER
============================================================

Challenge 20a-2 explicitly checks that postings agree with stored balances.

After seed:

for each tested account + asset:

stored projection
==
exact balance implied by seeded financial history according to current test/model.

Do not:
- update account_balances by a different amount;
- double-apply a ledger posting into projection;
- use Number.

============================================================
U. DETERMINE THE SOURCE OF TRUTH / PROJECTION RULE
============================================================

Inspect current architecture.

Task 10 ledger may derive balances from postings, while settlement uses `account_balances`.

Challenge 20 may compare both.

Before coding determine:

- Does posting a ledger entry automatically update account_balances?
- Does seed need to update both?
- Is `writeBalance()` appropriate?
- Is there an existing projection helper?
- Does the test calculate posting sums itself?

Do not assume.

Avoid double-counting by calling both:
- an automatic projection path
and
- a manual projection update

if the first already changes balances.

============================================================
V. EXACT BIGINT ONLY
============================================================

For all seeded amounts and reconciliation:

use:
- BigInt;
- decimal integer strings at DB boundaries.

Never use:
- Number;
- parseInt;
- parseFloat

for financial amounts.

Do not include decimal strings like `"100.50"` in columns that store minor units.

============================================================
W. FUNDING ENTRY GRANULARITY
============================================================

Read exact test.

Possible clean models:
- one balanced ledger entry per account+asset;
- one multi-posting entry per asset across all demo accounts and a house account;
- one multi-asset entry where each asset independently balances.

Choose the simplest model compatible with the current test/schema.

Remember:
multi-asset entry must balance EACH asset separately.

Do not rely on USD offsets against BTC.

============================================================
X. SEED IDEMPOTENCY — 20a-3
============================================================

Running the seed a second time must change nothing.

The second run must not:
- create more accounts;
- create more funding entries;
- create more postings;
- increase balances again;
- reset statuses;
- alter existing data;
- create duplicate internal funding accounts.

============================================================
Y. DO NOT IMPLEMENT IDEMPOTENCY BY DELETING AND RECREATING
============================================================

Forbidden seed pattern:

delete all accounts
delete all postings
reinsert demo state

Even if the final demo values look the same, the seed has "changed" database history and may destroy non-demo state.

Challenge 20a-3 requires a true safe rerun.

Use stable existence detection.

============================================================
Z. DO NOT USE INSERT OR REPLACE CARELESSLY
============================================================

SQLite `INSERT OR REPLACE` can:
- delete/reinsert rows;
- change relationships;
- trigger cascades;
- alter history.

Prefer:
- select/check;
- insert-on-conflict-ignore for stable immutable demo identities;
- explicit exact logic.

Do not overwrite historical ledger entries.

============================================================
AA. IDEMPOTENT FUNDING MARKER
============================================================

Determine how to recognize seed funding already applied.

Good approaches, depending on current schema:
- stable deterministic ledger entry IDs;
- stable demo account + exact expected posting existence;
- a pre-existing metadata/reference field.

Do not add a new schema column.

Do not detect completion by:
- "there are at least five accounts somewhere";
- current total row count only.

That can incorrectly skip partially missing demo data.

============================================================
AB. PARTIAL SEED STATE
============================================================

A robust seed should avoid making a partial state worse.

Read test expectations.

If demo account exists but its seed funding entry is missing:
- preferably add only the missing deterministic seed component.

If funding entry exists:
- do not apply it again.

Do not blindly assume all-or-nothing unless the seed runs in one transaction and the marker reliably proves complete state.

============================================================
AC. SEED SHOULD NOT MUTATE EXISTING NON-DEMO BALANCES
============================================================

If a developer already created extra accounts/trades:
rerunning `npm run seed` should not:
- delete them;
- change their balances;
- rewrite their ledger history.

Only ensure deterministic demo data exists.

============================================================
AD. VERIFY TRIAL BALANCE AFTER SEED
============================================================

After seed, Challenge 20 expects ledger zero per asset.

Reuse:
- `trialBalance()` in tests/runtime verification where appropriate.

Do not "fix" a nonzero trial balance by inserting an arbitrary compensating entry after the fact without understanding the seed posting design.

Seed entries themselves must be correct.

============================================================
AE. FUNDING AND ACCOUNT CLOSURE
============================================================

Seed-created funded accounts cannot be closed under Task 18 until balances are zero, which is correct.

Do not bypass closure rules in application code.

The seed itself runs at database initialization and creates active funded demo accounts.

Do not add an application endpoint that resets/funds closed accounts.

============================================================
AF. ACCOUNTS API — ROUTE
============================================================

Implement the exact organizer-tested endpoint:

GET /api/ledger/accounts

Use the existing ledger router.

Do not create:
- `/api/accounts/all`;
- duplicate `/api/demo/accounts`
unless already part of the current source contract.

If Task 21 mounts the same router under `/api/v1`, preserve that shared routing design.

============================================================
AG. ACCOUNTS API — READ THE EXACT RESPONSE SHAPE
============================================================

Read Challenge 20b.

Record whether each account requires:
- id;
- name;
- type;
- status;
- balances;
- available;
- held;
- total;
- exponent/asset metadata.

Do not guess.

Return exactly what the current test/API conventions require.

Preserve Task 21:

{
  data: ...,
  meta: ...
}

if this route is expected to use the standardized success envelope.

============================================================
AH. LIST EVERY REQUIRED ACCOUNT
============================================================

The endpoint must not return only:
- active trading accounts;
- one hardcoded demo subset

unless the organizer test explicitly says so.

The published contract says:

"lists every account with its balances"

Read test interpretation.

If internal funding accounts are expected/excluded:
follow exact test.

Do not invent hidden filtering.

============================================================
AI. ACCOUNT SORTING
============================================================

Sort by account `name` exactly as Challenge 20b expects.

Determine:
- case-sensitive vs locale-insensitive;
- secondary tie-breaker for duplicate names.

Because duplicate names are legal, include a deterministic tie-breaker if test/database order otherwise becomes unstable, likely:
- id ascending

after the required name ordering.

Do not use locale-dependent behavior if organizer expects simple lexical order.

Read test comparator.

============================================================
AJ. SORT IN DATABASE OR APPLICATION
============================================================

Prefer deterministic database order if straightforward:

ORDER BY name ...

plus stable tie-breaker if needed.

If current test expects JavaScript sorting semantics:
follow it.

Do not rely on SQLite implicit row order.

============================================================
AK. BALANCES PER ACCOUNT
============================================================

For each account:

include the exact required balance rows.

Each balance must remain exact string data at JSON boundaries.

Do not use Number.

If total is required:

total = BigInt(available) + BigInt(held)

serialized with `.toString()`.

Do not trust stale total storage unless schema explicitly stores it and test expects it.

============================================================
AL. ACCOUNTS WITH NO BALANCE ROWS
============================================================

Read Challenge 20b.

"lists every account with its balances" may include an account with no holdings as:

balances: []

Do not silently omit an account just because it has no balance rows unless test explicitly filters it.

This is important for Task 18/normal accounts.

============================================================
AM. AVOID N+1 IF SIMPLE JOIN/GROUP IS AVAILABLE
============================================================

The demo database is small, but use a clear bounded query.

Possible approaches:
- one account query + one balances query grouped by account;
- one left join then group safely.

Avoid querying balances once per account if a simple two-query solution exists.

Do not over-optimize if it risks incorrect grouping.

============================================================
AN. LEFT JOIN CAUTION
============================================================

If using a left join:

an account with zero balances can produce a row with null balance columns.

Do not turn that into:

balances: [{ asset: null, ... }]

It should become an empty balance list if contract expects that.

============================================================
AO. API BALANCE ORDER
============================================================

Read test.

If balance rows must be deterministic:
sort by asset code or the organizer-required order.

Do not depend on insertion order.

This will help Task 24 rendering.

============================================================
AP. ACCOUNT STATUS
============================================================

Preserve actual DB status:
- active;
- closed.

Do not make the API label every demo/non-demo account active.

Task 24 will display a status badge.

Task 23 should return status if the exact Challenge 20b test/current contract expects it.

Do not reopen closed records while listing.

============================================================
AQ. EXACT ASSET METADATA
============================================================

If 20b requires exponent or Task 24 relies on it:
read exact test/current route design.

Prefer current asset registry as source of exponent metadata.

Do not guess BTC=8 etc in the accounts repository if there is already a registry abstraction.

However, do not add extra response fields that break deep-equality tests if not expected.

============================================================
AR. API SECURITY / AUTH
============================================================

Read current ledger route middleware.

Do not accidentally:
- remove HMAC/JWT/RBAC;
- expose a previously protected ledger endpoint publicly;
- add stricter auth than the organizer test expects.

Follow the same route family policy Task 21 established.

Do not bypass auth in a test-only branch.

============================================================
AS. API CACHE
============================================================

Read whether Task 21 applies caching to this route family.

Do not add stale caching to `/api/ledger/accounts` unless current architecture/test requires it.

If you do use existing cache:
- key must cover the whole resource;
- relevant account/balance writes would need invalidation.

Task 23 does not need speculative caching.

Correctness first.

============================================================
AT. API ERROR HANDLING
============================================================

Normal read failures must use the standard safe envelope.

Do not expose:
- SQL;
- stack;
- local DB path.

Do not return HTML.

Do not catch DB errors and return fake empty account arrays.

============================================================
AU. SEED / API CONSISTENCY
============================================================

After running seed:

GET /api/ledger/accounts

should describe the actual stored demo accounts/balances.

Do not create a separate hardcoded API fixture disconnected from DB.

Challenge 21 later checks real system agreement.

============================================================
AV. TASK 24 COMPATIBILITY WITHOUT IMPLEMENTING TASK 24
============================================================

The Task 23 API should provide the exact data Challenge 20b requires and remain a clean source for Task 24.

Do not modify dashboard functions for:
- account list;
- portfolio summary;
- risk meters;
- recent trades

in this task.

Task 24 will consume the API.

If Challenge 20c currently fails after Task 23:
record it as expected future scope.

============================================================
AW. EXPECTED TASK 23 FILE SCOPE
============================================================

Primary:

- exact demo seed file discovered under db/seeds/
- src/repositories/accountsRepository.ts or exact ledger/account listing repository
- src/controller/ledgerController.ts
- src/routes/ledgerRoutes.ts

Potential:
- src/repositories/ledgerRepository.ts ONLY if a reusable read helper is genuinely needed and does not alter Task 10 semantics
- a directly related existing demo-seed helper

Create/update:

- docs/clearhouse-task-23-demo-seed-accounts-api.md

Do NOT add tests.

Do NOT change:
- migrations;
- package/config;
- dashboard 20c code.

============================================================
AX. DO NOT COUPLE SEED TO EXPRESS
============================================================

Seed code should not:
- start server;
- issue HTTP requests to localhost;
- depend on Express controllers;
- require HMAC/JWT.

Use database/repository/domain logic directly.

No network calls.

============================================================
AY. SEED IMPORTS / MODULE FORMAT
============================================================

Respect current Knex seed runtime.

If seeds are TypeScript:
use current imports.

If seed runner is CommonJS/compiled differently:
do not make an incompatible import from src merely because it is convenient.

Inspect existing seeds and package runtime.

A small seed-local helper using Knex is acceptable if repository imports are impossible, but accounting invariants must match Task 10 exactly.

============================================================
AZ. NO SECRET OR RANDOM CONFIG
============================================================

Seed does not need:
- HMAC secret;
- JWT key;
- external APIs;
- random environment-specific amounts.

Use deterministic demo data.

Do not print .env.

============================================================
BA. ID GENERATION
============================================================

For stable seed identity:

use deterministic IDs only if:
- schema accepts them;
- tests do not require UUID grammar.

If current schema/test expects UUID:
use stable UUID constants in seed.

Do not generate new UUIDs each rerun and then attempt to dedupe by name.

Read exact constraints.

============================================================
BB. LEDGER ENTRY IDS
============================================================

For true idempotent funding, deterministic seed entry IDs are often useful if the ledger schema permits them.

But:
- do not collide with application-generated entries;
- use clear demo namespace/UUIDs;
- do not modify normal postEntry generation semantics globally.

If insertBalancedEntry always generates IDs internally:
use another stable seed marker/check based on current schema.

Do not rewrite Task 10 merely to force deterministic IDs unless current test architecture requires a parameter already supported.

============================================================
BC. POSTING AGREEMENT CHECK
============================================================

Before declaring Task 23 complete, reason for every seeded account/asset:

stored available
stored held
ledger-derived net

The organizer's independent accounting model must agree.

Do not rely only on your own helper to validate data created by the same helper.

Run organizer test.

============================================================
BD. SEED RERUN STATE COMPARISON
============================================================

Challenge 20a-3 may snapshot counts/data before and after a second seed run.

Your seed must preserve:
- account row count;
- ledger entry row count;
- posting row count;
- balances;
- statuses;
- names/types.

Avoid updates that write the same values if test observes timestamps/updated_at.

If table has updated_at:
do not touch rows unnecessarily on second run.

============================================================
BE. Timestamps / created_at
============================================================

If seed rows have timestamps:

prefer deterministic/default first-run values and no second-run UPDATE.

Do not rewrite `updated_at` every time seed runs.

This can violate "changes nothing".

============================================================
BF. TEST DATABASE VS LOCAL DEVELOPMENT DB
============================================================

Organizer tests may invoke the seed programmatically against an isolated DB.

Do not hardcode:
- main.sqlite3 path;
- cwd assumptions beyond current Knex seed conventions.

Use the supplied Knex connection argument.

Never open a second global production DB from the seed if the seed runner provides `knex`.

============================================================
BG. DO NOT USE GLOBAL REPOSITORY DB BY ACCIDENT
============================================================

If importing repository functions that capture the global DB singleton, you may accidentally seed the wrong database during isolated tests.

This is critical.

Prefer repository functions that accept an executor/Knex instance.

If they do not:
- use seed-local transactional Knex logic consistent with domain invariants;
- or minimally refactor a helper to accept the provided executor without changing behavior.

Never make organizer seed test mutate `main.sqlite3` instead of its test DB.

============================================================
BH. EXECUTOR-AWARE HELPERS
============================================================

Task 10 `insertBalancedEntry(executor, ...)` was intentionally designed to accept a transaction/executor.

Use that pattern if possible.

Task 8/settlement balance helpers may also accept executor.

The provided seed Knex/trx should flow through all DB operations.

No hidden global connection.

============================================================
BI. NO NESTED SQLITE DEADLOCK
============================================================

If seed opens a transaction:

do not call a repository function that silently opens another transaction on the same single-connection test pool.

Use executor-aware lower-level helpers.

Inspect implementation before use.

============================================================
BJ. CHECK ACCOUNT TYPE ENUM
============================================================

Before creating demo records, inspect:

- AccountType;
- account validation;
- database constraints.

Use the exact trading type.

If counterpart funding account needs another type:
use a valid existing type.

Do not add new enum values for demo purposes.

============================================================
BK. SOURCE / HOUSE ACCOUNT BALANCE
============================================================

Balanced funding means the source/house side may have a negative ledger-derived balance depending on account/sign convention.

Read current model/test.

Do not assume every internal account must have positive available balance.

If `account_balances` has nonnegative constraints:
design funding projection according to the current accounting model/test rather than forcing impossible negative balances.

This is exactly why you must read Challenge 20 and schema before implementing.

Do not create an invalid stored balance just to balance ledger.

============================================================
BL. BALANCE PROJECTION MODEL
============================================================

The organizer may distinguish:
- ledger/accounting balance;
- settlement available/held balance.

Inspect 20a-2 closely.

If source/house ledger account is not represented in settlement `account_balances`, that may be legitimate depending on test.

Do not force all ledger counterparties into available/held projection unless expected.

For each funded trading account, however, the stored holdings must agree with its funding postings.

============================================================
BM. SEED FAILURE HANDLING
============================================================

Do not swallow failures and print "seed complete".

Let genuine seed errors reject so:
- Knex reports failure;
- transaction rolls back;
- CI can detect it.

Do not broad-catch and continue with partial data.

============================================================
BN. ACCOUNTS API DATA TYPES
============================================================

JSON monetary fields:
- strings.

IDs/names/status/type:
- strings according to schema.

Arrays:
- stable.

Do not serialize BigInt directly via JSON.

============================================================
BO. API META
============================================================

Read 20b exact expected envelope.

If Task 21 standard API requires:

{
  data: accounts,
  meta: {}
}

return exactly that.

Do not invent pagination if the endpoint returns every account.

Do not add count unless expected.

============================================================
BP. API NAME SORT WITH DUPLICATES
============================================================

Because names need not be unique:

sort primarily by required name comparator.

For ties:
use stable deterministic ID ordering unless test says insertion order.

This prevents non-determinism.

============================================================
BQ. NO DIRECT DEMO SPECIAL-CASING IN API
============================================================

The endpoint must read DB accounts.

Do not:

if (isDemo) return HARDCODED_DEMO_ACCOUNTS

Challenge 21 later checks DB/API agreement.

============================================================
BR. REQUIRED VERIFICATION — TASK 23
============================================================

After implementation:

npm run typecheck

Primary Task 23:

npm test challenge20.test.ts -t "Challenge 20a|Challenge 20b"

Use actual labels if different.

Then individual groups if available:

npm test challenge20.test.ts -t "Challenge 20a"

npm test challenge20.test.ts -t "Challenge 20b"

Record:
- exact executed count;
- passed/failed.

============================================================
BS. FULL CHALLENGE 20 STATUS
============================================================

Run:

npm test challenge20.test.ts

Expected Task 23 interpretation:

- 20a should pass;
- 20b should pass;
- 20c may still fail because it is Task 24.

Do not mark Task 23 partial merely because untouched 20c fails.

Do not claim full Challenge 20 complete until Task 24.

============================================================
BT. LEDGER / RECONCILIATION REGRESSION
============================================================

Run:

npm test challenge02.test.ts

npm test challenge09.test.ts

This verifies:
- double-entry ledger;
- trial balance reconciliation.

============================================================
BU. ACCOUNT / CLOSURE REGRESSION
============================================================

Run:

npm test challenge13.test.ts

And Task 8 account helper checks if labels still match:

npm test challenge00b.test.ts -t "Challenge 0n|Challenge 0o"

Use actual labels.

============================================================
BV. API REGRESSION
============================================================

Run:

npm test challenge11.test.ts

The new route must preserve:
- envelopes;
- versioning;
- caching behavior of existing routes.

============================================================
BW. DASHBOARD REGRESSION
============================================================

Run:

npm test challenge12.test.ts

Task 23 must not regress Task 22.

20c remains Task 24.

============================================================
BX. BROADER REGRESSION
============================================================

Run:

npm test challenge10.test.ts
npm test challenge05.test.ts
npm test challenge04.test.ts
npm test challenge03.test.ts
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

Then:

git diff --check

Finally:

npm test

Record future Task 24+ failures honestly.

============================================================
BY. MANUAL SEED IDEMPOTENCY CHECK — SAFE APPROACH
============================================================

The organizer test is primary.

If using your local disposable development DB for an additional check, only do so if it is safe under the project guide.

A safe normal development sequence is:

npm run migrate
npm run seed

Inspect demo state.

Then:

npm run seed

Inspect again.

But `npm run migrate` is destructive to local DB.

Do NOT execute it automatically if the current local DB may contain work the user wants preserved.

Prefer the isolated organizer test.

If you do use local DB:
- state clearly that it is disposable;
- do not print secrets;
- compare row counts/data before and after second seed.

============================================================
BZ. FAILURE DIAGNOSIS — 20a-1
============================================================

If fewer than five funded trading accounts:

check:
- wrong account type;
- duplicate stable IDs colliding;
- seed order;
- accounts not inserted;
- balances zero;
- unknown asset codes.

If account has fewer than two assets:
- confirm balance rows actually created;
- confirm positive funded values;
- confirm known asset registry.

============================================================
CA. FAILURE DIAGNOSIS — 20a-2
============================================================

If entries not balanced:
- posting sign convention wrong;
- multi-asset cross-netting;
- missing source posting.

If trial balance nonzero:
- some funding entry one-sided;
- source/house side missing.

If postings disagree with stored balances:
- projection updated by wrong amount;
- ledger helper already projected and seed double-applied;
- stored balance omitted;
- Number precision loss;
- wrong account/asset key.

============================================================
CB. FAILURE DIAGNOSIS — 20a-3
============================================================

If second seed changes state:

check:
- random account IDs;
- random entry IDs;
- duplicate posting insert;
- deposit/funding operation reapplied;
- upsert updating timestamps;
- `INSERT OR REPLACE`;
- name-based dedupe while duplicate names allowed;
- delete/recreate behavior.

Do not solve by truncating before seed.

============================================================
CC. FAILURE DIAGNOSIS — 20b
============================================================

If account list wrong:

check:
- route not mounted;
- Task 21 `/api` router;
- wrong envelope;
- missing account status/type;
- balance grouping;
- null left-join row;
- sort comparator;
- balance values converted to Number.

If only demo accounts returned:
- remove unjustified demo filter if test wants every account.

============================================================
CD. TASK 23 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-23-demo-seed-accounts-api.md

Include:

1. Starting commit.
2. Working branch task-23.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 20 test count.
6. Task 23 = 20a+20b = 80 available points.
7. Task 24 = 20c = 80 future points.
8. Exact demo seed filename.
9. Seed runtime/module style.
10. Demo trading account IDs/names/types.
11. Funding/source account design.
12. Known funded assets.
13. Funding minor-unit amounts.
14. Ledger posting sign convention.
15. Funding entry design.
16. Transaction strategy.
17. Stored balance projection strategy.
18. Proof postings/balances agree.
19. Trial-balance proof.
20. Seed idempotency marker/strategy.
21. Partial-state behavior.
22. Why second run changes nothing.
23. Confirmation no non-demo state is deleted/reset.
24. Exact `GET /api/ledger/accounts` route.
25. Exact response shape.
26. Account sort semantics.
27. Balance sort/group semantics.
28. Empty-balance account behavior.
29. Status/type behavior.
30. Exact files changed.
31. Typecheck.
32. Challenge 20a result.
33. Challenge 20b result.
34. Full Challenge 20 result with 20c noted as Task 24.
35. Challenge 02 result.
36. Challenge 09 result.
37. Challenge 13 result.
38. Challenge 11 result.
39. Challenge 12 result.
40. broader regressions.
41. full-suite result.
42. protected-file confirmation.
43. seed exception confirmation.
44. suggested commit.
45. master merge/push workflow.
46. next Task 24: Challenge 20c dashboard portfolio/risk/recent trades.

Do not include secrets.

============================================================
CE. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat
git diff --name-only

Review the exact demo seed path:

git diff -- "<actual-demo-seed-path>"

Review likely backend files only if changed:

git diff -- src/repositories/accountsRepository.ts
git diff -- src/repositories/ledgerRepository.ts
git diff -- src/controller/ledgerController.ts
git diff -- src/routes/ledgerRoutes.ts

Review note:

git diff -- docs/clearhouse-task-23-demo-seed-accounts-api.md

Confirm:

- organizer tests unchanged;
- no new tests;
- config unchanged;
- package files unchanged;
- migrations unchanged;
- unrelated seeds unchanged;
- no table truncation/delete-all;
- no Number money arithmetic;
- no global DB singleton accidentally used by isolated seed;
- no 20c dashboard implementation;
- no Task 24+ work.

============================================================
CF. TASK 23 COMPLETION CRITERIA
============================================================

Task 23 is COMPLETE only when:

DISCOVERY

[ ] challenge20 read completely.
[ ] exact 20a/20b tests identified.
[ ] exact demo seed file identified.
[ ] exact account type identified.
[ ] exact known assets identified.
[ ] exact accounts API response shape identified.

SEED ACCOUNTS

[ ] at least five trading accounts created.
[ ] stable demo identity.
[ ] active/open status.
[ ] at least two known assets each.
[ ] positive meaningful holdings.
[ ] no unrelated accounts overwritten.

DOUBLE ENTRY

[ ] every funding entry balances.
[ ] per-asset balancing, no cross-asset netting.
[ ] exact BigInt.
[ ] source/counterparty modeled correctly.
[ ] trial balance zero per asset.
[ ] append-only ledger preserved.

BALANCE PROJECTION

[ ] stored balances agree with postings.
[ ] no double application.
[ ] correct account+asset key.
[ ] available/held semantics correct.
[ ] no floating point.

IDEMPOTENCY

[ ] second seed run adds no account.
[ ] second seed run adds no ledger entry.
[ ] second seed run adds no posting.
[ ] second seed run does not increase balances.
[ ] second seed run does not rewrite timestamps/status/names.
[ ] no delete/recreate/truncate strategy.
[ ] non-demo state preserved.

ACCOUNTS API

[ ] GET /api/ledger/accounts exists.
[ ] uses real database state.
[ ] lists every required account.
[ ] balances nested/grouped exactly as expected.
[ ] accounts sorted by required name semantics.
[ ] deterministic duplicate-name tie handling if necessary.
[ ] account with no balances handled correctly.
[ ] exact amount strings preserved.
[ ] Task 21 envelope/versioning preserved.

REGRESSION

[ ] typecheck passes.
[ ] Challenge 20a passes.
[ ] Challenge 20b passes.
[ ] full Challenge 20 run recorded with 20c assigned to Task 24.
[ ] Challenge 02 passes.
[ ] Challenge 09 passes.
[ ] Challenge 13 passes.
[ ] Challenge 11 passes.
[ ] Challenge 12 passes.
[ ] sanity recorded.
[ ] full suite recorded honestly.
[ ] protected files unchanged except designated demo seed.
[ ] Task 23 note created.
[ ] final Git target master.

If a 20a or 20b organizer assertion still fails:
- Task 23 status = PARTIAL;
- name exact failing test/root cause.

Do not mark Task 23 partial only because 20c is not implemented yet.

============================================================
CG. FINAL CURSOR REPORT
============================================================

Return:

1. Task 23 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Exact Challenge 20 test count.
6. Exact Task 23 organizer tests.
7. Demo seed path.
8. Demo account design.
9. Funded assets/amount model.
10. Source/house account design.
11. Double-entry funding strategy.
12. Stored-balance projection strategy.
13. Trial-balance result.
14. Seed idempotency design.
15. Second-run result.
16. GET /api/ledger/accounts implementation.
17. Exact API response shape.
18. Account sorting behavior.
19. Empty-balance behavior.
20. Typecheck.
21. Challenge 20a result.
22. Challenge 20b result.
23. Full Challenge 20 result with 20c future scope.
24. Challenge 02 result.
25. Challenge 09 result.
26. Challenge 13 result.
27. Challenge 11 result.
28. Challenge 12 result.
29. broader regressions.
30. full-suite result.
31. remaining future failures.
32. confirmation protected files unchanged except designated demo seed.
33. final diff summary.
34. reviewed Git commands targeting master.

Suggested commit:

feat: add idempotent demo funding and accounts API

Do not automatically commit, merge, or push.
````

---

# Task 23 reference acceptance matrix

| Area | Required behavior |
|---|---|
| Demo trading accounts | At least 5 |
| Funded assets/account | At least 2 known assets |
| Initial holdings | Positive/exact minor units |
| Funding | Real double-entry ledger postings |
| Per-entry balance | Zero per asset |
| Global trial balance | Zero per asset |
| Stored balances | Agree with postings |
| Money arithmetic | BigInt only |
| Seed rerun | No logical/database change |
| Existing non-demo data | Preserved |
| Seed reset/truncate | Forbidden |
| Accounts endpoint | `GET /api/ledger/accounts` |
| Account source | Real DB |
| Account order | Sorted by name |
| Balances | Exact strings, correctly grouped |
| API envelope | Preserve Task 21 contract |
| Task 20c dashboard | Not implemented until Task 24 |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 23

Official final branch:

**`master`**

Workflow:

**`master` → `task-23` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 23 branch

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
task-23
```

Official final branch:

```text
master
```

---

## 2. Final Task 23 verification

```powershell
npm run typecheck

npm test challenge20.test.ts -t "Challenge 20a|Challenge 20b"

npm test challenge20.test.ts -t "Challenge 20a"

npm test challenge20.test.ts -t "Challenge 20b"

npm test challenge02.test.ts

npm test challenge09.test.ts

npm test challenge13.test.ts

npm test challenge11.test.ts

npm test challenge12.test.ts

npm test challenge10.test.ts

npm test challenge05.test.ts

npm test challenge04.test.ts

npm test challenge03.test.ts

npm test challenge01.test.ts

npm test challenge00.test.ts

npm test _sanity.test.ts

git diff --check
```

If the exact current Challenge 20 labels differ, use the real labels Cursor reports.

Then run:

```powershell
npm test challenge20.test.ts
```

Interpret any remaining `20c` failures as Task 24 scope.

Finally:

```powershell
npm test
```

---

## 3. Identify the exact demo seed file before staging

Do not guess.

```powershell
Get-ChildItem -Recurse db\seeds -File
git status --short
git diff --name-only
```

Cursor should report the exact Challenge 20 demo seed path.

---

## 4. Review Task 23 diff

```powershell
git status --short
git diff --stat
```

Review the actual demo seed:

```powershell
git diff -- "<actual-demo-seed-path>"
```

Do not paste the placeholder literally.

Review backend files if changed:

```powershell
git diff -- src/repositories/accountsRepository.ts
git diff -- src/repositories/ledgerRepository.ts
git diff -- src/controller/ledgerController.ts
git diff -- src/routes/ledgerRoutes.ts
git diff -- docs/clearhouse-task-23-demo-seed-accounts-api.md
```

If another directly related helper changed, review it separately.

Confirm:
- no table truncate/delete-all logic;
- no random seed IDs that duplicate on rerun;
- no direct fake balance funding without ledger;
- no unrelated seed changes;
- no 20c dashboard code.

---

## 5. Stage only Task 23 files

Always stage the engineering note:

```powershell
git add -- docs/clearhouse-task-23-demo-seed-accounts-api.md
```

Stage the actual designated demo seed:

```powershell
git add -- "<actual-demo-seed-path>"
```

Do not paste the placeholder literally.

Only if genuinely changed:

```powershell
git add -- src/repositories/accountsRepository.ts
git add -- src/repositories/ledgerRepository.ts
git add -- src/controller/ledgerController.ts
git add -- src/routes/ledgerRoutes.ts
```

If a directly related helper changed:

```powershell
git add -- "<actual-task23-helper-path>"
```

If any file includes unrelated work:

```powershell
git add -p -- "<file-path>"
```

Avoid:

```text
git add .
```

---

## 6. Review staged content

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
- unrelated seeds
- `.env`
- `.gitignore`
- Task 24 dashboard work
- unrelated source.

---

## 7. Commit Task 23

```powershell
git commit -m "feat: add idempotent demo funding and accounts API"
```

Verify:

```powershell
git show --stat --oneline HEAD
git status -sb
```

---

## 8. Switch to official master

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

## 9. Merge Task 23

Prefer:

```powershell
git merge --ff-only task-23
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-23
```

Resolve conflicts deliberately.

Never force/reset.

---

## 10. Re-test merged master

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

npm test challenge20.test.ts -t "Challenge 20a|Challenge 20b"

npm test challenge02.test.ts

npm test challenge09.test.ts

npm test challenge11.test.ts

npm test challenge12.test.ts

git diff --check
git status -sb
```

Use actual current labels if different.

---

## 11. Push official master

```powershell
git push origin master
```

Do not push final competition submission to `main`.

Do not force-push.

---

## 12. Verify remote master

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

If rebasing the local-only Task 23 commit is safe:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge20.test.ts -t "Challenge 20a|Challenge 20b"
npm test challenge02.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts carefully.

---

# Fast Task 23 checklist

- [ ] branch = task-23
- [ ] final branch = master
- [ ] challenge20 fully read
- [ ] Task 23 scope = 20a + 20b only
- [ ] exact demo seed identified
- [ ] exact account type identified
- [ ] at least 5 trading accounts
- [ ] stable deterministic demo identities
- [ ] at least 2 known assets each
- [ ] positive funded holdings
- [ ] funding uses balanced ledger entries
- [ ] each asset balances independently
- [ ] global trial balance zero
- [ ] stored balances agree with postings
- [ ] BigInt only
- [ ] no random duplicate funding on rerun
- [ ] no table truncate/delete/reset strategy
- [ ] second seed run creates no account
- [ ] second seed run creates no entry/posting
- [ ] second seed run does not change balance/status/timestamp
- [ ] non-demo data preserved
- [ ] `GET /api/ledger/accounts`
- [ ] real DB data
- [ ] all required accounts included
- [ ] sorted by name
- [ ] balance grouping exact
- [ ] account with no balances handled
- [ ] response envelope matches Task 21/current test
- [ ] no Task 24 20c implementation
- [ ] Challenge20a passes
- [ ] Challenge20b passes
- [ ] Challenge02 passes
- [ ] Challenge09 passes
- [ ] Challenge13 passes
- [ ] Challenge11 passes
- [ ] Challenge12 passes
- [ ] sanity/full suite recorded
- [ ] protected files unchanged except designated demo seed
- [ ] Task 23 note created
- [ ] committed on task-23
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 24 — Challenge 20c: Account List, Portfolio Summary, Risk Usage and Recent Trades Dashboard.
