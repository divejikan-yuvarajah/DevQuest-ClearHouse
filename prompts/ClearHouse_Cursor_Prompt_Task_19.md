# ClearHouse — Complete Enhanced Cursor Prompt for Task 19

**Task:** Challenge 09 — Reconciliation, Reporting and Migration  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-19`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 19 purpose

Task 19 implements and verifies **Challenge 09 — Reconciliation, Reporting and Migration**.

This challenge has two published areas:

1. **Ledger reconciliation**
   - prove that the trial balance is zero independently per asset after randomized balanced entries;
   - prove that an empty ledger reconciles cleanly.

2. **Legacy-data migration**
   - add/backfill a derived normalized column without changing the original source column;
   - make the backfill safe to run again;
   - make migration rollback remove only the derived data/schema change while preserving every original legacy value exactly.

Task 10 already implemented the double-entry ledger and `trialBalance()`. Therefore Task 19 must **verify before rewriting**. If Challenge 9a already passes because Task 10 is correct, do not duplicate or redesign the ledger.

---

# Published Challenge 09 contract

## Challenge 09 — Reconciliation, Reporting and Migration — 100 points

**Category:** Reconciliation and Migration  
**Test file:** `tests/challenge09.test.ts`  
**Problem:** “Close the books, then inherit someone else’s.”

---

## 9a — The trial balance proves the ledger

### 9a-1 — 14 pts

After a randomized sequence of balanced ledger entries:

- compute the trial balance;
- each asset must independently sum to exactly zero;
- no cross-asset netting;
- use exact integer arithmetic.

### 9a-2 — 8 pts

An empty ledger reconciles trivially:

- no accounts/postings contributing to imbalance;
- no fabricated asset rows;
- no error;
- balanced/reconciled result according to the exact current API/domain contract.

---

## 9b — Legacy data migration

### 9b-1 — 14 pts

The legacy normalization backfill must be:

- **idempotent**;
- **non-destructive** to the original/source column.

Running the normalization/backfill again must not corrupt or compound data.

The derived normalized value must be deterministic from the original legacy value according to the exact organizer test.

### 9b-2 — 9 pts

Rollback must:

- remove the **derived column** introduced by the migration;
- preserve every original/source legacy value exactly;
- not rebuild/normalize/rewrite the original field during rollback.

---

# Scoring caution

The Challenge 09 overview says:

```text
100 points
```

The published visible subtasks above total:

```text
14 + 8 + 14 + 9 = 45 points
```

Therefore:

- do **not** claim that 45 is the complete current Challenge 09 score;
- do **not** invent the missing 55 points;
- read `config/scores.ts` **READ ONLY**;
- read all of `tests/challenge09.test.ts`;
- record every current test and score entry;
- completion is determined by the current organizer tests.

---

# Important migration exception

For most earlier tasks, migrations were out of scope.

**Task 19 is different. The migration is part of the challenge.**

Cursor MAY edit:

- the existing Challenge 09 legacy-normalization migration/backfill file(s) explicitly referenced by `tests/challenge09.test.ts`;
- a directly related migration helper already intended for Challenge 09.

Cursor must NOT:

- edit unrelated historical migrations;
- modify base schema migrations merely for convenience;
- rewrite account/ledger migrations;
- renumber migrations;
- delete existing migration files;
- create an unrelated “replacement migration” if the challenge already supplies a stub/designated migration.

The exact current test and migration file names are authoritative.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 19

Copy the full block below into Cursor Agent mode.

````text
Act as my senior TypeScript fintech data-integrity and database-migration engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 19 ONLY: Challenge 09 — Reconciliation, Reporting and Migration.

Your job is to:
- verify/fix trial-balance reconciliation;
- implement the exact supplied legacy normalization migration/backfill contract;
- ensure rerunning the backfill is idempotent;
- ensure the original legacy/source column is never destructively changed;
- ensure rollback removes only the derived column/schema effect and restores/preserves the original dataset exactly;
- preserve all Tasks 1–18.

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

task-19

Historical GitHub reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to the historical reference;
- never replace origin;
- preserve Tasks 1–18;
- work on task-19;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit/merge/push automatically.

============================================================
B. STRICT TASK 19 SCOPE
============================================================

IMPLEMENT / VERIFY:

Challenge 9a:
- randomized balanced-ledger reconciliation;
- exact zero per asset;
- empty-ledger reconciliation.

Challenge 9b:
- legacy normalization migration;
- derived-column creation according to the existing test/schema;
- deterministic backfill;
- idempotent rerun;
- original/source column preserved;
- rollback removes derived column;
- rollback leaves original values byte-for-byte/logically exactly as required.

PRESERVE:

- Task 10 ledger behavior;
- Task 18 account closure;
- Task 4 BigInt/exact money;
- existing DB schema/migration history unrelated to Challenge 09.

DO NOT IMPLEMENT:

- Challenge 10 observability/operations;
- Challenge 11 API/cache/performance;
- dashboard;
- event sourcing;
- market data;
- fees;
- netting;
- WebSockets;
- complex order strategies.

============================================================
C. ORGANIZER / PROTECTED-FILE RULES
============================================================

Do NOT modify:

- any existing organizer test in tests/;
- config/;
- config/scores.ts;
- package.json;
- package-lock.json;
- .env;
- .gitignore;
- tsconfig files;
- vitest.config.ts;
- knexfile.js;
- seeds;
- grading/result-upload scripts.

Do NOT:

- add test skips;
- weaken assertions;
- increase timeouts;
- change property generators/seeds;
- reduce test discovery;
- add production test-environment detection;
- hardcode organizer fixtures;
- use fixture-specific branch logic.

IMPORTANT MIGRATION EXCEPTION:

You MAY modify only the existing Challenge 09 migration/backfill file(s) or directly related migration helper that the current `tests/challenge09.test.ts` explicitly exercises.

Do NOT modify unrelated migrations.

Do NOT rename/renumber the migration chain unless the current test contract explicitly requires it.

Do NOT run destructive migration commands against the user's persistent development database merely to test this task.

Use the organizer test harness / disposable test database.

No:
- `npm run delete-db`;
- arbitrary `knex migrate:rollback --all` against a persistent local DB;
- database deletion/reset outside the normal isolated test harness.

Do NOT use:
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

Verify Task 18 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-18 exists:

git log --oneline --decorate --max-count=10 task-18

If valid prior work is not yet on master:
- do not discard it;
- report the divergence;
- do not base Task 19 on stale history.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-19

If task-19 already exists:

git branch --list task-19
git log --oneline --decorate --max-count=10 task-19

Do not delete/recreate it blindly.

Record:
- starting commit;
- branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
E. VERIFY TASK 10 / TASK 18 PREREQUISITES
============================================================

Read if present:

- docs/clearhouse-task-10-ledger.md
- docs/clearhouse-task-18-account-closure.md

Verify source, not only notes.

Task 19 depends on Task 10:

- assertBalanced();
- insertBalancedEntry();
- postEntry();
- trialBalance();
- exact bigint posting storage;
- multi-asset independent balancing.

Run before Task 19 edits:

npm run typecheck

npm test challenge02.test.ts

npm test challenge13.test.ts

If Challenge 02 already fails:
- record exact problem;
- only fix it inside Task 19 if it directly causes Challenge 9a and is a genuine shared ledger defect;
- do not broadly rewrite ledger code.

============================================================
F. READ THE ENTIRE CHALLENGE 09 TEST BEFORE EDITING
============================================================

Read COMPLETELY:

- tests/challenge09.test.ts

Do not read only the published four bullets.

Build a coverage map:

test label
| exact assertion
| source function/migration
| database/table/column
| expected transformation
| expected rollback
| current defect/stub

Read:

- config/scores.ts

READ ONLY.

Record:
- current Challenge 09 test count;
- current Challenge 09 scoring entries;
- any organizer assertions beyond the visible 9a/9b prose;
- the 100-point overview vs visible 45-point mismatch.

Do not claim earned score.

============================================================
G. DISCOVER THE EXACT MIGRATION CONTRACT
============================================================

Search the repository:

rg -n "legacy|normaliz|normalis|backfill|derived|migration|migrate|trialBalance|reconcil" src db migrations tests

If migration directory differs, inspect the actual project structure.

PowerShell fallback:

Get-ChildItem -Recurse src,db,migrations,tests -File -ErrorAction SilentlyContinue |
  Select-String -Pattern "legacy|normaliz|normalis|backfill|derived|trialBalance|reconcil"

Read:

- the exact Challenge 09 migration file(s);
- preceding migration creating the legacy table/column;
- any later migration depending on it;
- current table schema;
- test fixture setup and teardown.

Record exact:
- table name;
- primary key;
- original/source legacy column name;
- new derived/normalized column name;
- source column type;
- derived column type/nullability;
- exact normalization function;
- handling of null/empty/malformed/whitespace/case/separators/Unicode according to tests;
- migration `up` contract;
- migration `down` contract.

DO NOT GUESS ANY COLUMN NAME OR NORMALIZATION RULE.

============================================================
H. BASELINE CHALLENGE 09
============================================================

Run:

npm test challenge09.test.ts

Record:
- exact test count;
- passed;
- failed;
- exact first root cause per failing assertion.

If current group labels exist:

npm test challenge09.test.ts -t "Challenge 9a"

npm test challenge09.test.ts -t "Challenge 9b"

Do not claim filtered-out tests passed.

============================================================
I. CHALLENGE 9a — VERIFY BEFORE MODIFYING
============================================================

Task 10 may already satisfy 9a.

Read exactly how Challenge 09 invokes reconciliation.

Possible patterns:
- direct `trialBalance(db)`;
- HTTP endpoint;
- helper/wrapper specific to reconciliation.

If 9a passes:
- leave Task 10 ledger core alone;
- document that Task 19 verified it.

Do not duplicate trial-balance logic into a second reconciliation module unless current tests require it.

============================================================
J. TRIAL BALANCE — PER-ASSET ZERO
============================================================

The invariant is independent per asset.

For every posting row:

group by exact asset identifier.

Sum exact signed posting amounts:

Map<string, bigint>

For a correctly balanced ledger:

sum(asset) === 0n

for every touched asset.

Do NOT allow:

USD +100
EUR -100

to reconcile merely because global sum is zero.

Cross-asset netting is invalid.

============================================================
K. RANDOMIZED BALANCED ENTRIES
============================================================

Challenge 9a-1 uses randomized balanced entries.

Implementation must work generally for:
- arbitrary generated account IDs;
- arbitrary valid supported assets;
- many entries;
- positive/negative posting values per current ledger convention;
- multiple assets.

Do not hardcode:
- USD;
- two accounts;
- fixed posting counts;
- organizer values.

If a property test fails:
record:
- seed;
- path;
- minimal counterexample.

Fix the invariant.

============================================================
L. EXACT BIGINT RECONCILIATION
============================================================

Never use:

Number(row.amount)
parseInt(row.amount)
parseFloat(row.amount)

Use:

BigInt(row.amount)

Keep sums as bigint.

No rounding/tolerance.

Zero means exactly:

0n

not:
Math.abs(x) < epsilon.

============================================================
M. EMPTY LEDGER — 9a-2
============================================================

When there are no ledger postings:

reconciliation must succeed trivially.

Do not:
- throw because query returns [];
- fabricate a USD zero row unless the exact API contract requires it;
- divide by zero;
- return an imbalance.

If `trialBalance()` returns:

Map()

then the controller/wrapper must serialize the exact current expected empty representation.

Follow test assertions exactly.

============================================================
N. RECONCILIATION MUST BE READ-ONLY
============================================================

Running trial-balance reconciliation must not:

- modify postings;
- create balancing entries;
- delete bad rows;
- update balances;
- mutate accounts.

Reconciliation detects/proves consistency.

It does not “fix” the ledger.

Do not insert a compensating entry automatically.

============================================================
O. APPEND-ONLY LEDGER PRESERVATION
============================================================

Task 19 must preserve Task 10:

- original ledger entries immutable;
- reversals append compensating entries;
- trial balance derives from postings.

Do not add a denormalized mutable “current trial total” as the new source of truth.

============================================================
P. REPORTING SCOPE
============================================================

Challenge title contains “Reporting”, but the published current contract only exposes trial-balance reconciliation unless the actual test file contains more.

Do not invent:
- CSV exports;
- PDF reports;
- dashboards;
- new report routes

unless `tests/challenge09.test.ts` explicitly requires them.

Implement only current tests.

============================================================
Q. LEGACY MIGRATION — CORE NON-DESTRUCTIVE RULE
============================================================

The migration has:

ORIGINAL / SOURCE legacy column

and a NEW DERIVED normalized column.

The original column is historical source data.

The migration MUST NOT:

- trim it in place;
- lowercase it in place;
- replace separators in place;
- overwrite it with normalized content;
- delete it;
- convert it destructively.

Normalization output belongs only in the derived column.

============================================================
R. NORMALIZATION FUNCTION — USE EXACT TEST ORACLE
============================================================

Read the exact expected transformation from `tests/challenge09.test.ts`.

Examples of possible normalization dimensions include:
- trimming;
- case folding;
- whitespace collapse;
- separator normalization;
- canonical formatting.

These are examples ONLY.

Do not implement any transformation not supported by the current test.

Create/reuse one deterministic normalization helper if the migration architecture supports it cleanly.

Same input must always produce same derived output.

No:
- locale-dependent nondeterminism;
- current date/time;
- random values.

============================================================
S. MIGRATION UP — SCHEMA CHANGE
============================================================

Inspect current migration style.

`up` must create the derived column exactly as required.

If organizer test calls `up()` on a schema where the derived column is absent:

- add it;
- preserve original column;
- backfill existing rows.

If organizer test deliberately invokes the backfill/up logic again:

- it must remain safe/idempotent according to exact test.

Do not duplicate the derived column.

Use current Knex schema APIs / SQLite-compatible pattern.

============================================================
T. BACKFILL IDEMPOTENCY — 9b-1
============================================================

Idempotency means:

running the normalization/backfill repeatedly over unchanged source data produces the same final state.

It must NOT:

- append another suffix/prefix each run;
- normalize an already-normalized value as if it were original when that changes result;
- overwrite source;
- create duplicate rows;
- multiply content;
- progressively lose information.

Always derive from the designated ORIGINAL column.

Conceptually:

derived = normalize(original)

not:

derived = normalize(derived)

unless the current test explicitly says otherwise.

============================================================
U. BACKFILL AND PREEXISTING DERIVED VALUES
============================================================

Read current test.

Possible expected behavior:

A. recompute every derived value deterministically from original;
OR
B. fill only null/missing derived values.

Do not guess.

If the requirement says “backfill idempotent” and tests seed stale/incorrect derived data, follow exact expected semantics.

Whichever model:
- original column remains untouched.

============================================================
V. NULL / EMPTY / MALFORMED LEGACY VALUES
============================================================

Read tests.

Define exact behavior for:
- NULL source;
- empty string;
- whitespace-only string;
- already-normalized value;
- unusual Unicode/special characters;
- malformed historical value.

Do not crash the entire migration unless tests require validation failure.

Do not silently invent default values.

Preserve source exactly even if derived value is null/empty/error-coded.

============================================================
W. MIGRATION TRANSACTIONAL SAFETY
============================================================

Knex migrations normally execute transactionally where supported.

Keep schema + backfill consistent with current migration runner.

Do not manually commit partial batches outside expected migration transaction without a tested reason.

If a normalization error occurs:
- avoid leaving half-backfilled state if the migration framework supports rollback.

Do not add network/external calls to migration.

============================================================
X. DO NOT RUN APPLICATION SERVICES FROM MIGRATION
============================================================

Migration should not depend on:
- Express server;
- controllers;
- HMAC;
- JWT;
- live matching state;
- external APIs.

Keep it deterministic and database-local.

============================================================
Y. MIGRATION DOWN — 9b-2
============================================================

Rollback must:

- remove the DERIVED normalized column;
- preserve original/source column;
- preserve every original value exactly.

Do NOT:
- “restore” original from derived;
- rewrite original;
- drop/recreate the original column unnecessarily;
- delete legacy rows.

After down:
- original table rows and original values must match their pre-up state according to current test.

============================================================
Z. SQLITE DROP-COLUMN CAUTION
============================================================

Inspect:
- SQLite version;
- current migration conventions;
- Knex behavior.

If `dropColumn()` is supported in the current test environment, use established style.

If Knex performs a table rebuild internally:
verify it preserves:
- row count;
- primary keys;
- original values;
- relevant indexes/constraints required by tests.

Do not hand-write fragile table recreation if Knex already handles it correctly.

============================================================
AA. ROUND-TRIP MIGRATION INVARIANT
============================================================

Challenge 9b conceptually requires:

STATE S0:
legacy original data

UP:
adds derived normalized column
backfills deterministic values
original unchanged

RE-RUN / RE-BACKFILL:
same state as after first successful backfill

DOWN:
derived column gone
original data exactly equal to S0

No destructive source rewrite at any point.

============================================================
AB. DO NOT MODIFY EARLIER MIGRATIONS UNLESS TEST TARGETS THEM
============================================================

If the repository includes a designated unfinished Challenge 09 migration:

edit that file.

Do not modify:
- account migrations;
- ledger migrations;
- settlement migrations;
- idempotency migration;
- unrelated historical files.

If tests import a helper rather than the migration directly:
change only that helper plus the designated migration when required.

============================================================
AC. MIGRATION FILE NAME / ORDER
============================================================

Preserve the existing migration's sequence/timestamp filename.

Do not rename it just to make it run later.

Do not alter migration ordering unless current tests prove ordering is broken.

A competition migration test may import the file by exact path/name.

============================================================
AD. DO NOT MODIFY KNEX CONFIG
============================================================

Do not change:
- knexfile.js;
- SQLite pool;
- migration directories;
- DB filename

to make Challenge 09 pass.

The migration must work within the existing database setup.

============================================================
AE. TEST DATABASE SAFETY
============================================================

Use the organizer's test harness.

Do not run rollback against the user's persistent development database.

Before any manual migration command, identify the exact DB path and prove it is disposable.

Prefer:
- `npm test challenge09.test.ts`

over manual destructive migration experiments.

If a manual disposable DB is genuinely useful:
- create it under a clearly temporary path outside persistent app data;
- use current migrations;
- delete only that explicitly created test file afterward.

Do not touch `main.sqlite3` destructively unless the project guide explicitly defines it as disposable for that operation and the user has authorized it.

============================================================
AF. MIGRATION IDENTITY / SCHEMA INSPECTION
============================================================

Before editing, list:

Get-ChildItem -Recurse -File | Where-Object {
  $_.FullName -match "migration|migrations"
}

Then inspect likely files.

Use:

git grep -n "legacy"
git grep -n "normaliz"
git grep -n "normalis"

Do not paste secrets.

============================================================
AG. EXACTNESS OF ORIGINAL VALUES
============================================================

When proving non-destructive behavior, compare original values without normalization.

If test uses strings:

`"  Example VALUE  "`

must remain exactly that if it was original, including:
- case;
- spaces;
- punctuation

unless the source column itself was already defined differently.

The derived column is where normalized representation belongs.

============================================================
AH. ID / ROW ORDER IN MIGRATION
============================================================

Do not rely on implicit SQLite row order for correctness.

Update rows by stable primary key if per-row processing is needed.

If normalization can be expressed in deterministic SQL safely and tests accept it, use set-based update.

If JS per-row normalization is required:
- select stable key + source;
- update by primary key;
- do not identify by non-unique source value.

============================================================
AI. BULK UPDATE PERFORMANCE
============================================================

Challenge 09 published tests emphasize correctness/idempotency, not extreme scale.

Avoid needless N² behavior.

But do not overengineer a streaming migration if test data is small.

Prefer clear deterministic logic.

Do not add dependencies.

============================================================
AJ. CHALLENGE 9A AND MIGRATION MUST BE INDEPENDENT
============================================================

Migration tests should not require ledger data.

Trial balance tests should not require legacy migration table state.

Do not create unnecessary coupling.

============================================================
AK. EXPECTED TASK 19 FILE SCOPE
============================================================

Possible primary ledger file ONLY if 9a reveals a real shared defect:

- src/repositories/ledgerRepository.ts

Possible controller/route ONLY if Challenge 09 explicitly exercises HTTP reconciliation:

- src/controller/ledgerController.ts
- src/routes/ledgerRoutes.ts

Migration:

- the exact existing Challenge 09 migration file discovered from tests
- directly related existing migration helper, only if required

Create/update:

- docs/clearhouse-task-19-reconciliation-migration.md

Do NOT add test files.

Do NOT modify unrelated migrations.

============================================================
AL. TYPE SAFETY / QUALITY
============================================================

Maintain strict TypeScript.

Avoid:
- any;
- @ts-ignore;
- unsafe Number money conversion;
- destructive source-column update;
- migration behavior that depends on application global state;
- swallowed migration errors;
- broad catch returning fake success;
- duplicate normalization implementations.

Prefer:
- BigInt for ledger;
- deterministic pure normalization;
- explicit schema checks if current test requires rerunnable migration;
- stable primary-key updates.

============================================================
AM. REQUIRED VERIFICATION — CHALLENGE 09
============================================================

After implementation run:

npm run typecheck

Then:

npm test challenge09.test.ts

This is the PRIMARY Task 19 gate.

If exact group labels exist:

npm test challenge09.test.ts -t "Challenge 9a"

npm test challenge09.test.ts -t "Challenge 9b"

Record:
- exact current test count;
- pass/fail;
- any additional tests beyond published prose.

============================================================
AN. LEDGER REGRESSION
============================================================

Run:

npm test challenge02.test.ts

This proves Task 19 did not regress Task 10.

Also run:

npm test challenge13.test.ts

because Task 18's 13d includes open-account ledger behavior.

============================================================
AO. FOUNDATION / BUSINESS REGRESSIONS
============================================================

Run:

npm test challenge04.test.ts
npm test challenge03.test.ts
npm test challenge05.test.ts

Then:

npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

Run:

git diff --check

Finally:

npm test

Record future Task 20+ failures honestly.

============================================================
AP. MIGRATION-SPECIFIC VERIFICATION
============================================================

Use challenge09 organizer tests as the primary proof.

Additionally inspect final diff to verify:

- original column is never targeted by UPDATE/ALTER destructive rewrite except if current test specifically requires metadata-only schema recreation;
- derived column is the only newly added Challenge 09 field;
- down drops derived field only;
- no seed changes;
- no unrelated table changes.

If current tests expose functions/helpers for isolated migration verification, run them via the provided test, not custom production code.

============================================================
AQ. FAILURE DIAGNOSIS — 9a
============================================================

If randomized reconciliation fails:

check:
- per-asset grouping;
- exact BigInt conversion;
- posting sign convention;
- Task 10 trialBalance query;
- accidental filtering by account/status;
- cross-asset aggregation.

If empty reconciliation fails:

check:
- empty Map/object serialization;
- fabricated default asset;
- reduce() without initial value.

Do not create ledger mutations to "fix" reconciliation.

============================================================
AR. FAILURE DIAGNOSIS — 9b IDENTITY
============================================================

If second backfill changes data:

check:
- derived-from-derived bug;
- appending suffix each run;
- normalization not idempotent;
- update uses wrong source column;
- duplicate insert rather than update.

If original column changes:

check:
- UPDATE target column;
- table recreation mapping;
- schema rename logic;
- rollback reconstruction.

============================================================
AS. FAILURE DIAGNOSIS — ROLLBACK
============================================================

If original value differs after down:

check:
- original was mutated during up;
- down reconstructs original from normalized derived value;
- SQLite table rebuild lost formatting/nulls/type affinity;
- rows reinserted with transformed values.

Rollback should normally only drop derived state.

============================================================
AT. TEST REPORTING RULES
============================================================

For every command report:

- exact command;
- exit code;
- executed tests;
- passed;
- failed;
- skipped/not exercised;
- real cause.

For randomized/property failures:
- seed;
- path;
- minimal counterexample.

Do not edit:
- test-results.xml;
- config/scores.ts;
- organizer tests.

Filtered-out tests are not passed.

============================================================
AU. TASK 19 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-19-reconciliation-migration.md

Include:

1. Starting commit.
2. Working branch task-19.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 09 test count.
6. Current scoring entries from config/scores.ts, read-only.
7. 100-point overview vs visible 45-point note.
8. Exact migration filename.
9. Legacy table name.
10. Primary key used.
11. Original/source column.
12. Derived normalized column.
13. Exact normalization rule.
14. Null/empty/malformed handling.
15. Up migration schema behavior.
16. Backfill design.
17. Why backfill is idempotent.
18. Proof original column is non-destructive.
19. Down migration behavior.
20. Why rollback preserves originals.
21. SQLite/Knex drop-column behavior if relevant.
22. trialBalance behavior.
23. per-asset reconciliation.
24. empty-ledger behavior.
25. Whether Task 10 already satisfied 9a.
26. Exact changed files.
27. Typecheck.
28. Challenge 9a result.
29. Challenge 9b result.
30. full Challenge 09 result.
31. Challenge 02 regression.
32. Challenge 13 regression.
33. Challenge 04/03/05 results.
34. foundation/sanity.
35. full-suite result.
36. protected-file confirmation.
37. migration exception confirmation.
38. suggested commit.
39. master merge/push workflow.
40. next Task 20: Observability and Operations.

Do not include secrets.

============================================================
AV. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat

Review ledger files only if changed:

git diff -- src/repositories/ledgerRepository.ts
git diff -- src/controller/ledgerController.ts
git diff -- src/routes/ledgerRoutes.ts

Review the exact Challenge 09 migration path discovered from the test:

git diff -- "<actual-challenge09-migration-path>"

Review note:

git diff -- docs/clearhouse-task-19-reconciliation-migration.md

Confirm:

- no organizer tests changed;
- no new tests added;
- config unchanged;
- config/scores.ts unchanged;
- package files unchanged;
- .env/.gitignore unchanged;
- tsconfig/vitest unchanged;
- knexfile unchanged;
- seeds unchanged;
- unrelated migrations unchanged;
- original legacy source column is not destructively normalized;
- rollback does not rebuild source from derived values;
- no test-detection logic;
- no Task 20+ work.

============================================================
AW. TASK 19 COMPLETION CRITERIA
============================================================

Task 19 is COMPLETE only when:

DISCOVERY

[ ] challenge09 read completely.
[ ] exact current test count recorded.
[ ] config/scores inspected read-only.
[ ] score mismatch documented without guessing.
[ ] exact migration file identified.
[ ] exact table/source/derived columns identified.
[ ] exact normalization oracle identified.

RECONCILIATION

[ ] trial balance groups per asset.
[ ] exact bigint arithmetic used.
[ ] randomized balanced entries reconcile to zero.
[ ] cross-asset netting cannot fake balance.
[ ] empty ledger reconciles cleanly.
[ ] reconciliation is read-only.
[ ] Task 10 append-only semantics preserved.

MIGRATION UP

[ ] only designated Challenge 09 migration/helper changed.
[ ] derived column created exactly as required.
[ ] original column remains present.
[ ] original values remain unchanged.
[ ] existing rows backfilled.
[ ] normalization deterministic.
[ ] backfill rerun safe/idempotent.
[ ] no duplicate rows.
[ ] null/empty edge cases follow test.

MIGRATION DOWN

[ ] derived column removed.
[ ] original column remains.
[ ] original row count preserved.
[ ] original primary keys preserved.
[ ] every original value preserved exactly.
[ ] rollback does not derive original from normalized value.

REGRESSION

[ ] typecheck passes.
[ ] Challenge 09 passes.
[ ] Challenge 02 passes.
[ ] Challenge 13 passes.
[ ] Challenge 04 recorded.
[ ] Challenge 03 recorded.
[ ] Challenge 05 recorded.
[ ] foundation/sanity recorded.
[ ] full suite recorded honestly.
[ ] tests/config/package/knex/seeds unchanged.
[ ] unrelated migrations unchanged.
[ ] Task 19 note created.
[ ] final Git target master.

If any current Challenge 09 test remains failing:
- status = PARTIAL;
- name exact failure/root cause.

============================================================
AX. FINAL CURSOR REPORT
============================================================

Return:

1. Task 19 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Current Challenge 09 test count.
6. Current score-map note.
7. Exact migration filename.
8. Legacy table/source/derived column.
9. Exact normalization algorithm.
10. Backfill idempotency strategy.
11. Non-destructive source preservation.
12. Rollback strategy.
13. Trial-balance reconciliation implementation/verification.
14. Empty-ledger behavior.
15. Typecheck.
16. Challenge 9a result.
17. Challenge 9b result.
18. Full Challenge 09 result.
19. Challenge 02 result.
20. Challenge 13 result.
21. Challenge 04/03/05 results.
22. Foundation/sanity.
23. Full-suite result.
24. Remaining future failures.
25. Confirmation protected files unchanged.
26. Confirmation unrelated migrations unchanged.
27. Final diff summary.
28. Reviewed Git commands targeting master.

Suggested commit:

feat: implement reconciliation and legacy migration

Do not automatically commit, merge, or push.
````

---

# Task 19 reference acceptance matrix

| Area | Required behavior |
|---|---|
| Trial balance | Zero independently per asset |
| Randomized entries | General exact reconciliation |
| Empty ledger | Reconciles trivially |
| Arithmetic | BigInt / exact |
| Reconciliation | Read-only |
| Migration source column | Never destructively normalized |
| Derived column | Holds normalized result |
| Backfill | Deterministic |
| Repeat backfill | Same final result |
| Duplicate rows | Never |
| Rollback | Removes derived column |
| Rollback source values | Exactly preserved |
| Unrelated migrations | Untouched |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 19

Official final branch:

**`master`**

Workflow:

**`master` → `task-19` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 19 branch

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
task-19
```

Official final branch:

```text
master
```

---

## 2. Final Task 19 verification

```powershell
npm run typecheck

npm test challenge09.test.ts

npm test challenge02.test.ts

npm test challenge13.test.ts

npm test challenge04.test.ts

npm test challenge03.test.ts

npm test challenge05.test.ts

npm test challenge01.test.ts

npm test challenge00.test.ts

npm test _sanity.test.ts

git diff --check
```

If exact current group labels exist:

```powershell
npm test challenge09.test.ts -t "Challenge 9a"

npm test challenge09.test.ts -t "Challenge 9b"
```

Then:

```powershell
npm test
```

---

## 3. Identify the actual migration file before staging

Do not guess its name.

Run:

```powershell
git status --short
git diff --name-only
```

Inspect migration directories:

```powershell
Get-ChildItem -Recurse -File | Where-Object {
    $_.FullName -match "migration|migrations"
}
```

The only migration you should stage is the **actual Challenge 09 migration/helper changed for the organizer contract**.

---

## 4. Review Task 19 diff

```powershell
git status --short
git diff --stat

git diff -- src/repositories/ledgerRepository.ts
git diff -- src/controller/ledgerController.ts
git diff -- src/routes/ledgerRoutes.ts
git diff -- docs/clearhouse-task-19-reconciliation-migration.md
```

Then review the exact discovered migration file:

```powershell
git diff -- "<actual-challenge09-migration-path>"
```

Do not paste the angle-bracket placeholder literally. Use the actual path Cursor reports.

Confirm:
- source legacy column is not rewritten;
- only derived column/backfill behavior changed;
- down removes the derived column;
- unrelated migrations are untouched.

---

## 5. Stage only Task 19 files

Always stage the engineering note if created:

```powershell
git add -- docs/clearhouse-task-19-reconciliation-migration.md
```

Stage the actual Challenge 09 migration:

```powershell
git add -- "<actual-challenge09-migration-path>"
```

Only if genuinely changed because Challenge 9a required a real ledger fix:

```powershell
git add -- src/repositories/ledgerRepository.ts
```

Only if current Challenge 09 HTTP integration genuinely required them:

```powershell
git add -- src/controller/ledgerController.ts
git add -- src/routes/ledgerRoutes.ts
```

If another legitimate Challenge 09 helper changed:

```powershell
git add -- "<actual-helper-path>"
```

If a file contains unrelated changes:

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

Stop if staged content unexpectedly includes:

- tests/
- config/
- package files
- knexfile.js
- seeds
- unrelated migrations
- .env
- .gitignore
- unrelated work.

---

## 7. Commit Task 19

```powershell
git commit -m "feat: implement reconciliation and legacy migration"
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

## 9. Merge Task 19

Prefer:

```powershell
git merge --ff-only task-19
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If valid histories diverged:

```powershell
git merge task-19
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

Run:

```powershell
npm run typecheck

npm test challenge09.test.ts

npm test challenge02.test.ts

npm test challenge13.test.ts

git diff --check
git status -sb
```

Do not manually roll back the persistent development database just for this post-merge check.

---

## 11. Push official master

```powershell
git push origin master
```

Do not push the final competition submission to `main`.

Do not force-push.

---

## 12. Verify remote master

```powershell
git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

The local HEAD and remote `refs/heads/master` hashes must match.

---

# If push is rejected

Do not force.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If rebasing the local-only Task 19 commit is appropriate:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge09.test.ts
npm test challenge02.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts carefully.

---

# Fast Task 19 checklist

- [ ] branch = task-19
- [ ] final branch = master
- [ ] Challenge 09 read completely
- [ ] current score entries inspected read-only
- [ ] 100 vs visible 45 points documented
- [ ] exact Challenge 09 migration identified
- [ ] exact source column identified
- [ ] exact derived column identified
- [ ] exact normalization rule identified
- [ ] trial balance exact per asset
- [ ] randomized reconciliation passes
- [ ] empty ledger reconciles
- [ ] reconciliation is read-only
- [ ] original legacy values never changed
- [ ] derived column created correctly
- [ ] backfill deterministic
- [ ] repeated backfill idempotent
- [ ] no duplicate rows
- [ ] rollback drops derived column
- [ ] rollback preserves original values exactly
- [ ] unrelated migrations untouched
- [ ] persistent DB not destructively rolled back
- [ ] typecheck passes
- [ ] Challenge09 passes
- [ ] Challenge02 passes
- [ ] Challenge13 passes
- [ ] business regressions recorded
- [ ] full suite recorded
- [ ] tests/config/package/knex/seeds unchanged
- [ ] Task 19 note created
- [ ] committed on task-19
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 20 — Challenge 10: Observability and Operations.
