# ClearHouse — Complete Enhanced Cursor Prompt for Task 11

**Task:** Challenge 04a — Holds and Releases  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-11`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 11 purpose

Task 11 implements the **hold/release balance mechanics** that are the first part of Challenge 04: Settlement, Holds and Atomicity.

The current reference Challenge 04a requirements are:

- **4a-1** — a deposit increases available; a hold moves value from `available` to `held` without changing `total`.
- **4a-2** — a hold larger than `available` is rejected and the balance remains unchanged.
- **4a-3** — release moves value from `held` back to `available`; over-release is rejected.
- **4a-4** — under 100 concurrent holds against 40 available, exactly 40 one-unit holds succeed and 60 fail; final state is exactly `available=0`, `held=40`, `total=40`.

In our established implementation plan:

- **Task 11:** holds/releases.
- **Task 12:** deposits/withdrawals/idempotency.
- **Task 13:** atomic trade settlement.

This boundary matters. The official Challenge 04a HTTP tests use `deposit()` to seed funds before testing `hold()`. If Task 12 has not yet been implemented, the official filtered 4a suite may stop/fail in its setup action even when Task 11 itself is correct. Therefore Task 11 must:

1. fully implement `applyHold`, `applyRelease`, `hold`, and `release`;
2. verify them directly with participant-owned tests or repository/domain checks that do **not** require the still-stubbed `deposit()`;
3. run the official `Challenge 4a` filter and record the actual result;
4. clearly distinguish a `deposit()` prerequisite failure from a hold/release failure;
5. **not** silently implement Task 12 merely to make 4a green.

Challenge 04 overall is worth 200 points. The visible 4a items represent 60 points in the supplied challenge description, but Cursor must use the current `config/scores.ts` read-only if reporting scoring. Do not claim points merely because code was implemented.

---

# Reference implementation surfaces

The historical repository exposes:

### `src/domain/settlement.ts`

- `AccountBalance`
  - `available: bigint`
  - `held: bigint`
- `InsufficientAvailableError`
- `InsufficientHeldError`
- `applyHold(balance, amount, accountId, asset)`
- `applyRelease(balance, amount, accountId, asset)`

### `src/repositories/settlementRepository.ts`

Already-existing helpers from Tasks 8:

- `readBalance(trx, accountId, asset)`
- `writeBalance(trx, accountId, asset, balance)`
- `getBalance(db, accountId, asset)`

Task 11 targets:

- `hold(db, accountId, asset, amount)`
- `release(db, accountId, asset, amount)`

Later tasks target:

- `deposit`
- `withdraw`
- `settleTrade`

### `src/controller/settlementController.ts`

The hold/release routes are already wired and map:

- `InsufficientAvailableError` → `409 INSUFFICIENT_AVAILABLE`
- `InsufficientHeldError` → `409 INSUFFICIENT_HELD`

The current CodeCommit checkout is authoritative. Cursor must inspect actual current files before editing.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 11

Copy the entire block below into Cursor Agent mode.

````text
Act as my senior TypeScript fintech backend engineer and concurrency reviewer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 11 ONLY: implement the holds/releases layer of Challenge 04 completely and safely. Implement the pure settlement-domain transitions and transactionally safe repository operations for hold/release; prove exact balance invariants and concurrency behavior; preserve Tasks 1-10; document actual results; and prepare safe Git commands targeting the official master branch.

Do not stop at an analysis/plan. Perform the implementation and verification.

============================================================
A. REPOSITORY / SUBMISSION CONTEXT
============================================================

Existing checkout:

C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b

Official remote:

origin

Official repository:

https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b

OFFICIAL FINAL SUBMISSION BRANCH:

master

Task branch:

task-11

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Important:
- current CodeCommit checkout is authoritative;
- do not reset to the historical GitHub commit;
- do not replace origin;
- do not clone over this checkout;
- preserve verified Tasks 1-10;
- develop on task-11;
- final reviewed change later merges into master;
- final publication is `git push origin master`;
- do not automatically merge or push unless I explicitly authorise it after reviewing your result.

============================================================
B. STRICT TASK BOUNDARY
============================================================

TASK 11 INCLUDES:

- src/domain/settlement.ts:
  - applyHold
  - applyRelease
  - related existing error use

- src/repositories/settlementRepository.ts:
  - hold
  - release
  - integration with readBalance/writeBalance
  - transactional/concurrent correctness

- verification of:
  - total conservation;
  - insufficient available rejection;
  - insufficient held rejection;
  - exact BigInt behavior;
  - account/asset isolation;
  - 100-way concurrent hold correctness.

TASK 11 DOES NOT IMPLEMENT:

- deposit()
- withdraw()
- Task 12 idempotent mutations
- settleTrade()
- Task 13 atomic trade settlement
- full ledger changes beyond using Task 10
- matching engine
- risk engine
- account closure
- fees/netting
- event sourcing.

Do not broaden into those features merely because challenge04.test.ts contains them.

IMPORTANT DEPENDENCY:
The official Challenge 4a HTTP tests call deposit() to seed available funds.

If Task 12 is still stubbed:
- do NOT implement deposit just to get Challenge 4a green;
- prove Task 11 through direct domain/repository participant tests;
- run Challenge 4a and accurately report it as blocked by the Task 12 deposit prerequisite if that is the only failure.

If deposit was already implemented in my current checkout for some legitimate reason:
- preserve it;
- do not rewrite it;
- use the official 4a test normally.

============================================================
C. NON-NEGOTIABLE COMPETITION RULES
============================================================

1. Read:
   - AGENTS.md if present;
   - README;
   - current Challenges.md;
   - current guide;
   - docs/clearhouse-task-* notes.

2. Organizer-controlled files are read-only:
   - tests/
   - config/
   - vitest.config.ts
   - tests/tsconfig.json
   - grading scripts
   - package.json's test script

3. Do not:
   - add .skip;
   - weaken assertions;
   - change official test timeouts;
   - reduce test discovery;
   - change fast-check seeds/generators globally;
   - relax TypeScript;
   - edit test-results.xml;
   - run external grading-report upload scripts.

4. Nothing under src/ may detect:
   - NODE_ENV === "test";
   - VITEST;
   - Challenge 4a;
   - fixture IDs;
   - known amounts such as 40, 100, 400, 1000;
   - special test headers.

5. No floating-point money.

All balances/amounts remain bigint internally and decimal integer strings at persistent/JSON boundaries.

6. Preserve:
   - current repository interfaces;
   - current controller routes/envelopes;
   - Task 8 exact balance storage fixes;
   - Task 10 ledger work;
   - current database schema unless tests prove a direct defect.

7. No Redis/new ORM/new lock service/new database.

8. No destructive Git:
   - git reset --hard
   - git clean -fd
   - force push
   - history rewriting
   - blind branch deletion
   - automatic stash that may hide existing work.

9. Never expose:
   - .env contents;
   - JWT/HMAC secrets;
   - tokens;
   - AWS/CodeCommit credentials.

============================================================
D. GIT PRE-FLIGHT — BASE TASK 11 ON MASTER
============================================================

Run:

Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"

git status --short
git status -sb
git branch --show-current
git branch --list
git rev-parse --verify HEAD
git remote -v
git log -12 --oneline --decorate
git diff --stat
git diff --cached --stat

Confirm:
- origin is official remote;
- master is official final branch.

Check Task 10 has actually reached master:

git log --oneline --decorate --max-count=15 master

If task-10 still contains valid unmerged work:

git log --oneline --decorate --max-count=10 task-10

Do not discard prior work.

If master contains latest valid Tasks 1-10:

git switch master
git pull --ff-only origin master
git switch -c task-11

If task-11 exists:

git branch --list task-11
git log --oneline --decorate --max-count=10 task-11

Do not delete/recreate it blindly.

Record:
- starting commit;
- starting branch;
- existing modified files;
- existing staged files.

============================================================
E. VERIFY IMPORTANT PREREQUISITES
============================================================

Read notes if present through:

docs/clearhouse-task-10-ledger.md

Task 11 particularly depends on:

TASK 4
- BigInt exactness.

TASK 8
- readBalance uses BigInt(row string) directly;
- writeBalance writes BOTH available and held;
- getBalance exact;
- account status helpers corrected.

TASK 9
- safe input/error handling.

TASK 10
- ledger passes Challenge 02; do not regress it.

Check current implementations rather than assuming prompt files equal completed work.

Run or reuse recent unchanged-source evidence for:

npm run typecheck
npm test challenge02.test.ts

If Challenge 02 is not actually complete:
- record that prerequisite;
- still implement independent hold/release work if possible;
- do not rewrite the ledger unless Task 11 caused the regression.

============================================================
F. READ EXACT TASK 11 CONTRACT
============================================================

Read completely:

- tests/challenge04.test.ts
- src/domain/settlement.ts
- src/repositories/settlementRepository.ts
- src/controller/settlementController.ts
- src/routes/settlementRoutes.ts
- src/repositories/accountsRepository.ts
- db migration defining account_balances
- knexfile.js
- tests/testBase.ts

Also inspect:
- Task 8 implementation of readBalance/writeBalance;
- every caller of hold/release;
- later settleTrade call sites so Task 11 remains composable.

Search:

rg -n "applyHold|applyRelease|InsufficientAvailableError|InsufficientHeldError|hold\(|release\(|readBalance|writeBalance|account_balances" src tests db

PowerShell fallback:

Get-ChildItem -Recurse src,tests,db -File |
  Select-String -Pattern "applyHold|applyRelease|InsufficientAvailableError|InsufficientHeldError|hold\(|release\(|readBalance|writeBalance|account_balances"

Build a small mapping:

official requirement
| implementation function
| state before
| state after
| rejection rule
| concurrency rule

============================================================
G. BEFORE BASELINE
============================================================

Run:

npm run typecheck

Run current official hold filter:

npm test challenge04.test.ts -t "Challenge 4a"

Record actual result.

Expected reference:
- 4 organizer tests in Challenge 4a.

IMPORTANT:
If all four fail immediately because deposit() is still NotImplementedError:
- state explicitly that the official Task 11 route test has an unimplemented Task 12 seed dependency;
- do not call this a hold failure yet;
- do not implement deposit in Task 11.

Run no fake filtered workaround against protected tests.

============================================================
H. DOMAIN MODEL — ACCOUNT BALANCE INVARIANT
============================================================

AccountBalance:

{
  available: bigint;
  held: bigint;
}

For hold/release:

total = available + held

MUST remain constant.

Hold:
available decreases
held increases

Release:
held decreases
available increases

For any valid amount x:

applyHold({a,h}, x)
= { available: a - x, held: h + x }

applyRelease({a,h}, x)
= { available: a + x, held: h - x }

Conservation:

before.available + before.held
===
after.available + after.held

exactly as bigint.

Do not read or alter a separate "total" persisted field.

============================================================
I. applyHold()
============================================================

File:

src/domain/settlement.ts

Implement pure:

applyHold(
  balance,
  amount,
  accountId,
  asset
): AccountBalance

Required behavior:

1. Do not mutate input object.

2. Validate that hold cannot exceed `available`.

If:

amount > balance.available

throw:

new InsufficientAvailableError(accountId, asset)

3. On valid hold:

return {
  available: balance.available - amount,
  held: balance.held + amount
}

4. Preserve exact bigint arithmetic.

5. Returned object must be a fresh balance object.

6. Error path must leave caller state unchanged.

AMOUNT SIGN / ZERO:
Inspect current test/domain/input contract before deciding semantics.

The HTTP parser historically accepts digit strings including "0". Negative strings are rejected lexically.

A hold of zero mathematically leaves state unchanged, but if the current challenge/API expects positive-only amounts, enforce that consistently through the existing request-validation mechanism rather than misusing InsufficientAvailableError.

Do not invent a new public error code in Task 11 without an official/current contract.

Never allow a negative bigint passed directly at repository/domain level to increase available accidentally. Add a defensive non-negative/positive invariant using the project's existing validation/error style if necessary.

Document the exact choice.

============================================================
J. applyRelease()
============================================================

Implement pure:

applyRelease(
  balance,
  amount,
  accountId,
  asset
): AccountBalance

Required:

If:

amount > balance.held

throw:

new InsufficientHeldError(accountId, asset)

Otherwise:

return {
  available: balance.available + amount,
  held: balance.held - amount
}

Do not mutate input.

Over-release must have zero state effect.

As with hold, prevent a negative direct amount from reversing semantics.

Do not silently clamp an over-release to all held funds.

Do not return partial release success.

============================================================
K. ERROR CLASS CONTRACT
============================================================

Preserve existing:

InsufficientAvailableError
InsufficientHeldError

Keep useful:
- accountId context in message;
- asset context in message.

Do not return these Error objects directly in HTTP JSON.

Controller maps them to:

409
INSUFFICIENT_AVAILABLE

and:

409
INSUFFICIENT_HELD

Preserve this behavior.

If current Task 8/9 changed details array shape, follow current actual controller contract.

============================================================
L. hold() REPOSITORY OPERATION
============================================================

File:

src/repositories/settlementRepository.ts

Implement:

hold(db, accountId, asset, amount)

as a transactionally safe read-modify-write.

Required conceptual flow:

return db.transaction(async (trx) => {
  // optionally assert account open according to current architecture
  const current = await readBalance(trx, accountId, asset)
  const next = applyHold(current, amount, accountId, asset)
  await writeBalance(trx, accountId, asset, next)
  return next
})

Use actual current imports/types.

CRITICAL:
- read and write happen in the SAME transaction;
- use `trx`, not global db, inside transaction;
- no write occurs if applyHold throws;
- returned value reflects committed state.

If `db` passed into hold may already be a Knex Transaction in later task integrations, inspect the current type/call patterns before nesting transactions. Preserve composability if repository architecture already supports executor-based operations.

Task 12's withIdempotency passes a transaction to deposit/withdraw; hold is currently called from HTTP with db. Task 13 may need internal hold-like behavior during settleTrade. Avoid an implementation that makes future atomic composition impossible.

============================================================
M. release() REPOSITORY OPERATION
============================================================

Implement release with the same transaction discipline:

1. begin transaction;
2. read exact current balance;
3. applyRelease;
4. write both exact fields;
5. return next state;
6. rollback automatically on error.

Over-release must not write.

Do not:
- read outside trx then write inside;
- manually patch only held;
- make two independent update calls without one transaction.

============================================================
N. ACCOUNT STATUS / OPEN-ACCOUNT POLICY
============================================================

Inspect current accountsRepository and later Challenge 13 usage.

If existing settlement mutations are intended to reject closed accounts:
- call the existing `assertOpen` inside the same transaction/executor before mutation.

But do not reintroduce the old Task 8 bug that treated an unknown account as closed if Task 8 fixed it.

If controller release currently does not map AccountClosedError cleanly:
- do not create a new accidental 500 by changing release policy without inspecting current code/tests.
- If current Task 11/13 contract requires release to reject closed accounts, make the smallest consistent controller update and document it.

Do not implement closeAccount() now.

============================================================
O. ACCOUNT / ASSET ISOLATION
============================================================

hold/release must affect only:

(accountId, asset)

Never:
- another account;
- another asset;
- all rows for account;
- all rows for same asset.

`writeBalance` must use the composite key exactly.

Add participant checks:
- hold USD does not change BTC;
- hold account A does not change B.

============================================================
P. NO-ROW / ZERO BALANCE
============================================================

Task 8 readBalance returns:

{ available: 0n, held: 0n }

when row is absent.

Therefore:
- positive hold on an absent/zero balance => InsufficientAvailableError;
- positive release on absent/zero balance => InsufficientHeldError;
- error should not create a new account_balances row as side effect.

Do not create a row before validating.

============================================================
Q. CONCURRENCY — CHALLENGE 4a-4
============================================================

This is the most important Task 11 requirement.

Reference scenario:

- available = 40
- 100 concurrent hold requests
- each amount = 1
- exactly 40 succeed
- exactly 60 return conflict
- final:
  available = 0
  held = 40

Incorrect implementation pattern:

const balance = await getBalance(...)
if (balance.available >= amount) {
  await writeBalance(...)
}

without serialization/transaction.

That allows lost updates / oversubscription.

============================================================
R. CURRENT SQLITE TEST TOPOLOGY
============================================================

Inspect current knexfile.js.

Reference test DB uses:

filename: ":memory:"
pool: { min: 1, max: 1 }

Because an in-memory SQLite DB is connection-local, all test operations share one connection.

This means independent transactions through that test db are naturally serialized by the one-connection pool, which can make a correct transaction-based hold pass Challenge 4a-4.

Do NOT change the protected/test database pool to "fix" concurrency.

Do NOT depend on test detection.

Implement legitimate transactional correctness.

============================================================
S. DEVELOPMENT / GENERAL CONCURRENCY ROBUSTNESS
============================================================

Although current test pool is one connection, review whether your implementation remains reasonable with the development SQLite pool.

SQLite writes serialize, but a deferred read-modify-write transaction can still behave differently under multiple connections.

Prefer the simplest solution that:
- passes current official contract;
- retains exact BigInt semantics;
- does not add unsafe SQL arithmetic over text money columns;
- does not create in-memory state as the source of truth.

Do not change money columns to JavaScript Number.

Do not use SQL:
available = available - ?
if the TEXT storage/coercion could lose large-integer exactness.

If current DB/schema exposes a safe compare-and-update mechanism that preserves decimal integer exactness, you may use it, but document why it is safe.

Otherwise transaction serialization through the project's current SQLite topology is acceptable for this challenge, especially since the official test deliberately uses one shared connection.

Do not add a process-local mutex unless actual current concurrency tests prove the transaction approach insufficient. A mutex would not provide cross-process safety and should not be presented as a database guarantee.

============================================================
T. TRANSACTION ROLLBACK ON INSUFFICIENT AVAILABLE
============================================================

For hold exceeding available:

- read current balance;
- detect insufficiency;
- throw before write;
- transaction rolls back/no changes;
- HTTP = 409;
- following GET returns exact original available/held.

Do not:
- set available negative then throw;
- write then compensate;
- clamp to zero;
- convert amount to Number.

============================================================
U. TRANSACTION ROLLBACK ON INSUFFICIENT HELD
============================================================

For over-release:

- detect before write;
- throw InsufficientHeldError;
- zero state mutation;
- valid later release must still work.

Reference:
held=400
release 500 -> conflict
release 400 -> success
final available restored, held 0.

A failed over-release must not consume any held amount.

============================================================
V. TOTAL CONSERVATION
============================================================

Add explicit reasoning/tests:

Before hold:
A + H = T

After hold x:
(A - x) + (H + x) = T

After release x:
(A + x) + (H - x) = T

Do not use total from stale controller data; derive from exact fields.

Task 8 corrected balanceToJson total; preserve it.

============================================================
W. LARGE INTEGER EXACTNESS
============================================================

Use only bigint in domain.

Repository read/write helpers should already be fixed by Task 8:

BigInt(row.available)
BigInt(row.held)

and:

.toString()

Verify Task 11 does not reintroduce:

Number(...)
parseInt(...)
parseFloat(...)

for money.

Test one amount beyond 2^53 if practical.

============================================================
X. PURE DOMAIN TESTING
============================================================

Create participant-owned test if useful:

tests/task11-holds-releases-extra.test.ts

This is especially useful because official 4a uses Task 12 deposit as setup.

Required useful pure tests:

applyHold:
- 1000/0 hold 400 => 600/400
- total unchanged
- input object unchanged
- hold > available throws
- failed hold leaves original object unchanged
- large bigint exactness

applyRelease:
- 600/400 release 400 => 1000/0
- total unchanged
- release > held throws
- failed release leaves original unchanged

Do not hardcode production behavior to these values.

============================================================
Y. REPOSITORY TESTING WITHOUT deposit()
============================================================

In participant-owned tests, seed the account balance without implementing Task 12.

Use only legitimate existing infrastructure, for example:

- create account through the existing account API/repository;
- within a test transaction call the already-working `writeBalance` to seed an exact AccountBalance;
OR
- insert the account_balances row directly in participant test setup if that is clearer.

Then call real:

hold(db,...)
release(db,...)

Test:

1. hold modifies exact split.
2. hold rejection leaves row unchanged.
3. release modifies exact split.
4. release rejection leaves row unchanged.
5. account/asset isolation.
6. 100-way concurrency.

Do not add a production "seed balance" route/helper just for tests.

============================================================
Z. CONCURRENT PARTICIPANT TEST
============================================================

Participant test should mirror invariant but not copy fixture IDs:

- create account;
- seed 40 or another reasonable exact count;
- fire 100 (or a smaller additional stress number if execution time matters) concurrent `hold` calls;
- count fulfilled vs InsufficientAvailableError rejections;
- assert successes equal starting available / per-hold amount;
- assert final available/held exactly conserve total.

For Promise.allSettled:
- verify rejected errors are the expected insufficiency class;
- do not count unrelated DB errors as legitimate rejections.

No arbitrary sleep.

No retry loop masking lost updates.

============================================================
AA. CONTROLLER INTEGRATION REVIEW
============================================================

The reference controller already maps hold:

InsufficientAvailableError
-> 409
-> code INSUFFICIENT_AVAILABLE

and release:

InsufficientHeldError
-> 409
-> code INSUFFICIENT_HELD

Prefer leaving controller unchanged.

Only edit if current checkout has a real Task 11 integration defect.

Check:
- parsed amount is bigint;
- successful balance serialization includes correct total from Task 8;
- no raw error/stack leaks;
- response status is OK.

Do not implement deposit/withdraw controller changes in Task 11.

============================================================
AB. DO NOT DUPLICATE BALANCE LOGIC
============================================================

Use:

readBalance
writeBalance

Do not query `account_balances` directly inside hold/release if the file comments/current architecture require using these helpers.

This preserves:
- exact conversion;
- upsert/update behavior;
- future central changes.

============================================================
AC. COMPOSABILITY FOR TASK 13
============================================================

Later settleTrade needs multiple balance changes + a ledger entry atomically.

Review whether the current hold/release structure makes internal transaction composition possible.

Do NOT redesign all APIs now.

But avoid painting the project into a corner by:
- hardcoding global db;
- starting nested independent transactions from helpers that may need a caller trx later.

If helpful and compatible with current interfaces, create small INTERNAL transaction-executor helpers such as:

applyHoldInTransaction(trx,...)
applyReleaseInTransaction(trx,...)

and keep public:

hold(db,...)
release(db,...)

as wrappers.

Only do this if it genuinely reduces duplication and keeps current public exports stable.

Do not prematurely implement settleTrade.

============================================================
AD. EXPECTED TASK 11 FILE SCOPE
============================================================

Primary:

- src/domain/settlement.ts
- src/repositories/settlementRepository.ts

Only if current integration requires:

- src/controller/settlementController.ts

Create:

- docs/clearhouse-task-11-holds-releases.md

Strongly recommended participant verification because of Task 12 prerequisite:

- tests/task11-holds-releases-extra.test.ts

Do not modify organizer challenge04.test.ts.

Do not modify package dependencies.

Do not modify migrations unless a direct current Task 11 defect requires it.

============================================================
AE. TYPE SAFETY / QUALITY
============================================================

Keep strict TypeScript.

Avoid:
- any;
- @ts-ignore;
- unsafe casts hiding logic;
- Number money conversion;
- duplicated read/write logic;
- broad catch converting every failure to insufficiency;
- silent clamping;
- partial writes;
- unbounded retry loops;
- sleeps.

Prefer:
- pure domain transitions;
- bigint;
- exact errors;
- Knex transactions;
- existing helper reuse.

============================================================
AF. REQUIRED POST-IMPLEMENTATION VERIFICATION
============================================================

1. Typecheck:

npm run typecheck

2. Participant-owned Task 11 tests if created:

npm test task11-holds-releases-extra.test.ts

This is the primary independent verification if Task 12 deposit is still stubbed.

3. Official hold group:

npm test challenge04.test.ts -t "Challenge 4a"

Interpret honestly:

CASE A — deposit is already implemented:
- expect 4a tests to exercise hold/release fully.

CASE B — deposit remains Task 12 stub:
- record the exact deposit NotImplementedError/setup dependency;
- do not claim 4a passed;
- do not misclassify that as a Task 11 defect if participant direct tests prove hold/release.

4. Task 10 ledger regression:

npm test challenge02.test.ts

5. Foundation:

npm test challenge01.test.ts

6. Previous bug checks:

npm test challenge00.test.ts
npm test challenge00b.test.ts
npm test challenge00c.test.ts

7. Sanity:

npm test _sanity.test.ts

8. Full suite once:

npm test

Record remaining Task 12+ failures honestly.

============================================================
AG. OPTIONAL DIRECT HTTP CHECK WHEN deposit IS STUBBED
============================================================

Do not alter production deposit.

If you want to verify hold/release controller integration without deposit:
- seed account_balances directly in a participant test using DB setup;
- call `/api/settlement/holds`;
- call `/api/settlement/releases`;
- GET balance;
- verify statuses/envelopes.

This confirms actual HTTP/controller/repository integration independently.

Close resources according to existing test conventions.

Do not start a second unmanaged server.

============================================================
AH. TEST REPORTING RULES
============================================================

For every command report:

- command;
- exit code;
- executed;
- passed;
- failed;
- not exercised;
- primary reason.

A filtered run where setup fails in deposit did NOT prove hold assertions.

State:
"Blocked by Task 12 deposit prerequisite"

rather than:
"Task 11 failed"

only when evidence genuinely shows hold/release direct tests pass.

Do not call any unrun test passed.

Do not edit test-results.xml.

If concurrency test hangs:
- inspect single-connection transaction queue;
- leaked transaction;
- missing await;
- DB lock;
- nested transaction deadlock.

Do not:
- increase timeout;
- force exit;
- introduce sleeps.

============================================================
AI. TASK 11 COMPLETION NOTE
============================================================

Create/update:

docs/clearhouse-task-11-holds-releases.md

Include:

1. Starting commit.
2. Working branch task-11.
3. Final branch master.
4. Pre-existing changed/staged files preserved.
5. Exact current Challenge 4a contract.
6. Task 12 dependency status.
7. `applyHold` behavior/invariant.
8. `applyRelease` behavior/invariant.
9. Error semantics.
10. Total conservation proof.
11. Repository transaction design.
12. Current SQLite test pool/concurrency implications.
13. How 100-way correctness was verified.
14. BigInt exactness.
15. Account/asset isolation.
16. Any account-open policy used.
17. Exact changed files.
18. Typecheck result.
19. Participant Task 11 result.
20. Official 4a result and whether deposit blocked it.
21. Challenge 02 regression.
22. Challenge 01 regression.
23. bug-hunt/sanity regressions.
24. full-suite status.
25. Protected files confirmation.
26. Suggested commit message.
27. master merge/push commands.
28. Next Task 12: deposit/withdraw/idempotency.

Do not include credentials/secrets.

============================================================
AJ. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat

Review:

git diff -- src/domain/settlement.ts
git diff -- src/repositories/settlementRepository.ts
git diff -- src/controller/settlementController.ts
git diff -- docs/clearhouse-task-11-holds-releases.md

If participant test exists:

git diff -- tests/task11-holds-releases-extra.test.ts

Confirm:
- organizer tests untouched;
- config untouched;
- package test script untouched;
- no test-detection;
- no deposit/withdraw/settleTrade implementation accidentally added;
- no Number money conversion;
- no unrelated refactor;
- Task 8 helpers preserved;
- Task 10 ledger preserved.

============================================================
AK. TASK 11 COMPLETION CRITERIA
============================================================

Task 11 is COMPLETE when:

[ ] Current Challenge 4a tests read fully.
[ ] `applyHold` implemented.
[ ] Hold moves available -> held exactly.
[ ] Hold conserves total.
[ ] Hold cannot exceed available.
[ ] Failed hold leaves state unchanged.
[ ] `applyRelease` implemented.
[ ] Release moves held -> available exactly.
[ ] Release conserves total.
[ ] Release cannot exceed held.
[ ] Failed release leaves state unchanged.
[ ] Domain functions do not mutate input.
[ ] Negative direct amount cannot invert semantics.
[ ] `hold` uses transactional read-modify-write.
[ ] `release` uses transactional read-modify-write.
[ ] readBalance/writeBalance reused.
[ ] account+asset isolation verified.
[ ] BigInt exactness retained.
[ ] 100-way concurrency invariant verified directly.
[ ] Expected insufficiency errors differentiated from DB errors.
[ ] Typecheck passes.
[ ] Participant hold/release tests pass.
[ ] Official Challenge 4a run recorded honestly.
[ ] If official 4a is blocked only by deposit, blocker explicitly assigned to Task 12.
[ ] Challenge 02 remains healthy.
[ ] Challenge 01 regression recorded.
[ ] sanity/full-suite status recorded.
[ ] protected files unchanged.
[ ] Task 11 note created.
[ ] Git final target is master.

Do NOT mark COMPLETE if:
- concurrency direct test fails;
- hold/release has partial writes;
- money precision regresses;
- a Task 11 function is still NotImplementedError.

The official 4a deposit prerequisite may remain blocked until Task 12 as long as direct Task 11 verification is complete and documented.

============================================================
AL. FINAL CURSOR RESPONSE
============================================================

Return:

1. Task 11 status: COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Files changed.
5. applyHold implementation summary.
6. applyRelease implementation summary.
7. repository transaction/concurrency strategy.
8. direct concurrency result.
9. participant tests result.
10. official Challenge 4a result.
11. whether Task 12 deposit blocks official verification.
12. typecheck.
13. Challenge02 regression.
14. Challenge01 regression.
15. bug/sanity/full-suite results.
16. protected-file confirmation.
17. copyable Git commands targeting master.

Suggested commit:

feat: implement transactional holds and releases

Do not automatically merge or push.
````

---

# Task 11 reference acceptance matrix

| Requirement | Expected behavior |
|---|---|
| Hold 400 from 1000 available | `available=600`, `held=400`, total unchanged |
| Hold > available | `InsufficientAvailableError`, no change |
| Release 400 from held 400 | value returns to available |
| Release > held | `InsufficientHeldError`, no change |
| Concurrent holds | No oversubscription/lost update |
| 100 × hold(1) on 40 | exactly 40 success, 60 insufficiency |
| Final concurrent balance | `available=0`, `held=40` |
| Money | BigInt exact |
| Isolation | only selected account + asset changes |
| Persistence | one transaction per public mutation |
| Task 12 | deposit/withdraw remain outside Task 11 |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 11

Your final competition branch is **`master`**.

Workflow:

**`master` → `task-11` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 11 branch

```powershell
Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"

git status -sb
git branch --show-current
git branch --list
git remote -v
git log -10 --oneline --decorate
```

Expected development branch:

```text
task-11
```

Official final branch:

```text
master
```

---

## 2. Final Task 11 verification

```powershell
npm run typecheck
```

If participant test exists:

```powershell
npm test task11-holds-releases-extra.test.ts
```

Run official focused test:

```powershell
npm test challenge04.test.ts -t "Challenge 4a"
```

If this fails because `deposit()` is still Task 12's `NotImplementedError`, do not implement Task 12 in this commit. Confirm direct Task 11 tests pass and record the dependency.

Regression:

```powershell
npm test challenge02.test.ts
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts
git diff --check
```

Milestone:

```powershell
npm test
```

---

## 3. Review Task 11 changes

```powershell
git status --short
git diff --stat

git diff -- src/domain/settlement.ts
git diff -- src/repositories/settlementRepository.ts
git diff -- src/controller/settlementController.ts
git diff -- docs/clearhouse-task-11-holds-releases.md
```

If created:

```powershell
git diff -- tests/task11-holds-releases-extra.test.ts
```

Confirm no organizer test/config change.

---

## 4. Stage only Task 11 files

Primary:

```powershell
git add -- src/domain/settlement.ts
git add -- src/repositories/settlementRepository.ts
git add -- docs/clearhouse-task-11-holds-releases.md
```

Only if legitimately changed:

```powershell
git add -- src/controller/settlementController.ts
```

Only if created:

```powershell
git add -- tests/task11-holds-releases-extra.test.ts
```

If files contain unrelated edits:

```powershell
git add -p -- <file-path>
```

Avoid `git add .` when unrelated/protected changes exist.

---

## 5. Review staged changes

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
```

Review:

```powershell
git diff --cached -- src/domain/settlement.ts src/repositories/settlementRepository.ts docs/clearhouse-task-11-holds-releases.md
```

Review controller/custom test separately if staged.

---

## 6. Commit Task 11

```powershell
git commit -m "feat: implement transactional holds and releases"
```

Verify:

```powershell
git show --stat --oneline HEAD
git status -sb
```

---

## 7. Switch to official `master`

```powershell
git switch master
git fetch origin
```

Inspect divergence:

```powershell
git log --oneline --left-right master...origin/master
```

If master is simply behind:

```powershell
git pull --ff-only origin master
```

---

## 8. Merge Task 11

Prefer:

```powershell
git merge --ff-only task-11
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If valid histories diverged:

```powershell
git merge task-11
```

Resolve deliberately.

No force/reset.

---

## 9. Re-test merged master

```powershell
git branch --show-current
```

Must show:

```text
master
```

Then:

```powershell
npm run typecheck
```

If participant test exists:

```powershell
npm test task11-holds-releases-extra.test.ts
```

Run:

```powershell
npm test challenge04.test.ts -t "Challenge 4a"
npm test challenge02.test.ts
git diff --check
git status -sb
```

Again, if 4a is blocked only by Task 12 deposit, record that truthfully.

---

## 10. Push official final branch

```powershell
git push origin master
```

Do not push `main` as the final submission.

Do not force-push.

---

## 11. Verify remote `master`

```powershell
git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

Local HEAD and remote `refs/heads/master` should match.

---

# If `git push origin master` is rejected

Do not force.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If safe for a local-only task commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
```

If custom test:

```powershell
npm test task11-holds-releases-extra.test.ts
```

Then:

```powershell
npm test challenge02.test.ts
git diff --check
git push origin master
```

Resolve any conflicts before pushing.

---

# Fast Task 11 checklist

- [ ] `master` confirmed as final branch
- [ ] working on `task-11`
- [ ] Challenge 4a read completely
- [ ] `applyHold` implemented
- [ ] `applyRelease` implemented
- [ ] pure functions do not mutate input
- [ ] hold conserves total
- [ ] release conserves total
- [ ] over-hold rejected
- [ ] over-release rejected
- [ ] failed operations write nothing
- [ ] `hold()` transactional
- [ ] `release()` transactional
- [ ] Task 8 read/write balance helpers reused
- [ ] exact BigInt only
- [ ] account isolation verified
- [ ] asset isolation verified
- [ ] 100-way concurrency verified
- [ ] 40 funds → exactly 40 successful one-unit holds
- [ ] final concurrent split exact
- [ ] participant Task 11 tests pass
- [ ] official Challenge 4a result recorded
- [ ] Task 12 deposit dependency identified if applicable
- [ ] Task 10 ledger regression passes
- [ ] typecheck passes
- [ ] sanity/full-suite recorded
- [ ] organizer tests/config untouched
- [ ] Task 11 note created
- [ ] committed on task-11
- [ ] merged to master
- [ ] `git push origin master`
- [ ] local/remote master hashes verified

**Next planned task:** Task 12 — Deposits, Withdrawals, and Idempotent Mutations.
