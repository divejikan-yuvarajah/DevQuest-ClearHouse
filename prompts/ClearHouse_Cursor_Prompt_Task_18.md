# ClearHouse — Complete Enhanced Cursor Prompt for Task 18

**Task:** Challenge 13 — Account Closure  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-18`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 18 purpose

Task 18 implements **Challenge 13 — The Extension Round: Account Closure**.

This is a requirement-change challenge: account status already exists from earlier tasks, but now the system must enforce closure consistently across balance mutations, atomic trade settlement, and order placement **without regressing existing open-account behavior**.

The most important invariant is:

> An account may be closed only when every stored balance row for that account has both `available = 0` and `held = 0`. Once closed, operations that move balances or create new trading exposure must reject it before state mutation.

At the same time:

> An account ID that has never been registered is **not** treated as closed. The existing Task 8 `assertOpen()` behavior where missing status is allowed must remain intact.

---

# Published Challenge 13 contract — 100 points

## 13a — Closing requires a zero balance — 20 pts

### 13a-1 — 5 pts
An account with a non-zero **available** balance cannot be closed.

### 13a-2 — 5 pts
An account with a non-zero **held** balance cannot be closed.

### 13a-3 — 6 pts
An account whose balances are all exactly zero closes successfully.

### 13a-4 — 4 pts
A freshly created account with no balance rows/activity closes successfully.

---

## 13b — Closed accounts reject balance-moving operations — 12 pts

### 13b-1 — 6 pts
After closure:

- deposit rejects;
- withdrawal rejects;
- hold rejects;
- no balance moves.

### 13b-2 — 6 pts
A trade touching **any one** of the four settlement accounts must reject atomically if that account is closed.

No participant balance may move.

No partial settlement may occur.

---

## 13c — Closed accounts cannot place new orders — 8 pts

### 13c-1 — 5 pts
A registered account that has been closed cannot place a new order.

### 13c-2 — 3 pts
An account ID that was **never registered through the ledger/accounts API** remains unaffected by closure semantics and still trades according to the existing matching behavior.

This preserves Task 8's rule:

```text
status === null / account missing
!=
status === "closed"
```

---

## 13d — Existing functionality remains unaffected — 60 pts

### 13d-1 — 30 pts
A balanced ledger entry between two OPEN accounts still succeeds and trial balance remains zero.

### 13d-2 — 30 pts
A hold → release cycle on an OPEN account still works normally.

Task 18 must be narrow and must not accidentally reject every account or rewrite core ledger/settlement behavior.

---

# Challenge 13 total

```text
13a = 20
13b = 12
13c = 8
13d = 60
----------------
Total = 100 points
```

These are available points only, not an earned-score claim.

---

# Known earlier behavior that Task 18 must preserve

## Task 8 account status

Expected account helper semantics:

```text
status === "active" -> allowed
status === "closed" -> AccountClosedError
status === null / account missing -> NOT treated as closed
```

New accounts are active.

Do not reintroduce:

```text
missing account -> closed
```

because Challenge 13c-2 explicitly depends on missing/unregistered account IDs remaining unaffected.

## Tasks 11–13 settlement

Existing exact balance operations:

- hold
- release
- deposit
- withdraw
- settleTrade

must now use closure checks at the correct mutation boundary.

## Tasks 14–17 orders/risk

Order placement now needs a registered-account closure gate before:

- risk reservation;
- matching;
- stop storage;
- book mutation.

Cancellation of already-live orders should not be blocked merely because the owning account has since closed unless current tests explicitly say otherwise; cancellation reduces live exposure and should remain safe.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 18

Copy the entire block below into Cursor Agent mode.

````text
Act as my senior TypeScript fintech backend engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 18 ONLY: implement Challenge 13 — Account Closure — completely while preserving Tasks 1–17.

Implement:
- zero-balance-only account closure;
- closed-account blocking for deposit/withdraw/hold;
- atomic closed-account blocking for trade settlement;
- closed-account rejection for new order placement;
- preservation of unregistered-account order behavior;
- full regression of existing ledger and hold/release behavior for open accounts.

Do not stop at a plan. Perform implementation, verification, create the Task 18 engineering note, and show reviewed Git commands.

Do not automatically commit, merge, or push.

============================================================
A. REPOSITORY / SUBMISSION CONTEXT
============================================================

Working directory:

C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b

Official remote:

origin

Official repository:

https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b

OFFICIAL FINAL SUBMISSION BRANCH:

master

Task branch:

task-18

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–17;
- develop on task-18;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT TASK 18 SCOPE
============================================================

IMPLEMENT:

Challenge 13a:
- close only when all available/held balances are zero;
- fresh no-balance account may close.

Challenge 13b:
- closed account blocks deposit;
- closed account blocks withdrawal;
- closed account blocks hold;
- closed participant blocks trade atomically.

Challenge 13c:
- closed registered account cannot place new order;
- unregistered/missing account remains unaffected by closure semantics.

Challenge 13d:
- open-account balanced ledger postings continue to work;
- open-account hold/release continues to work.

DO NOT IMPLEMENT:

- reconciliation/migration (Task 19);
- operations/rate limiting (Task 20);
- API/config/cache work (Task 21);
- dashboard;
- event sourcing;
- netting;
- complex order types;
- fee engine;
- WebSockets.

============================================================
C. STRICT ORGANIZER / FILE RULES
============================================================

Do NOT modify any existing test file.

Do NOT add new test files.

Do NOT modify:

- config/
- package.json
- package-lock.json
- .env
- .gitignore
- tsconfig files
- vitest.config.ts
- knexfile.js
- migrations
- seeds
- scoring files
- grading scripts

Do NOT:

- skip tests;
- weaken assertions;
- increase organizer timeouts;
- reduce test discovery;
- alter property generators/seeds;
- relax TypeScript.

Do NOT add production logic checking:

- NODE_ENV === "test";
- VITEST;
- organizer test names;
- known account IDs;
- known asset names;
- fixture values.

Do NOT use Number() for stored financial balances.

Do NOT use destructive Git:

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
- master = official final branch.

Verify Task 17 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-17 exists:

git log --oneline --decorate --max-count=10 task-17

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-18

If task-18 already exists:

git branch --list task-18
git log --oneline --decorate --max-count=10 task-18

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

- docs/clearhouse-task-08-account-idempotency.md
- docs/clearhouse-task-11-holds-releases.md
- docs/clearhouse-task-12-deposit-withdraw-idempotency.md
- docs/clearhouse-task-13-atomic-settlement.md
- docs/clearhouse-task-16-advanced-matching.md
- docs/clearhouse-task-17-risk.md

Verify actual source.

Task 18 depends on:

TASK 8:
- getStatus();
- assertOpen();
- createAccount();
- missing account != closed.

TASK 11:
- hold/release exactness.

TASK 12:
- deposit/withdraw transaction/idempotency.

TASK 13:
- atomic settleTrade transaction.

TASKS 14–17:
- order placement/risk lifecycle.

Before editing run:

npm run typecheck

npm test challenge04.test.ts

npm test challenge03.test.ts

npm test challenge05.test.ts

Record pre-existing failures separately.

============================================================
F. READ THE EXACT CHALLENGE 13 CONTRACT
============================================================

Read COMPLETELY:

- tests/challenge13.test.ts

Read current:

- src/repositories/accountsRepository.ts
- src/repositories/settlementRepository.ts
- src/repositories/ledgerRepository.ts
- src/controller/ledgerController.ts
- src/routes/ledgerRoutes.ts
- src/controller/settlementController.ts
- src/routes/settlementRoutes.ts
- src/controller/orderController.ts
- src/services/matchingEngine.ts
- src/services/riskRegistry.ts

Also inspect:

- database schema/migration definitions for:
  - accounts
  - account_balances
- any close-account route/controller stub;
- current account status error mapping;
- AccountClosedError class;
- any AccountNotEmpty/close-related error class.

Search:

rg -n "closeAccount|AccountClosedError|assertOpen|getStatus|status.*closed|account_balances|close|CLOSED|ACCOUNT_CLOSED|balance" src tests

PowerShell fallback:

Get-ChildItem -Recurse src,tests -File |
  Select-String -Pattern "closeAccount|AccountClosedError|assertOpen|getStatus|status.*closed|account_balances|ACCOUNT_CLOSED|close"

Do not assume route/status/error names from this prompt.

Use the current test assertions exactly.

============================================================
G. BEFORE BASELINE
============================================================

Run:

npm test challenge13.test.ts

Record:

- total current tests;
- passed;
- failed;
- exact failure root causes;
- any current NotImplementedError;
- exact endpoint/status/error codes asserted.

If named groups exist:

npm test challenge13.test.ts -t "Challenge 13a"
npm test challenge13.test.ts -t "Challenge 13b"
npm test challenge13.test.ts -t "Challenge 13c"
npm test challenge13.test.ts -t "Challenge 13d"

Use actual labels.

============================================================
H. ACCOUNT STATUS MODEL
============================================================

Preserve existing account status model.

Expected conceptual values:

- active
- closed

Do not invent:
- suspended;
- deleting;
- pending_close

unless they already exist.

Newly created accounts remain active.

A closed account remains represented in the accounts table.

Do NOT physically delete account rows.

Closure is a state transition, not deletion.

============================================================
I. MISSING ACCOUNT IS NOT CLOSED
============================================================

This rule is essential.

Task 8 established:

getStatus(missingAccountId) => null

assertOpen(missingAccountId):
- does NOT throw AccountClosedError.

Challenge 13c-2 explicitly requires an unregistered account ID to retain existing trading behavior.

Therefore:

DO NOT write:

if (status !== "active") throw AccountClosedError

because that incorrectly rejects null/missing.

Use:

if (status === "closed")
  throw AccountClosedError

Preserve this exact distinction.

============================================================
J. CLOSE OPERATION MUST REQUIRE A REAL ACCOUNT
============================================================

Although missing accounts are not treated as closed for assertOpen(), the close-account endpoint must not create a phantom account.

Inspect current Challenge 13 tests for the expected behavior when closing a missing account.

Likely choices:
- 404 NOT_FOUND;
- current repository-specific error.

Follow actual tests.

Do not insert an account row merely because close was called.

============================================================
K. ZERO BALANCE MEANS EVERY ASSET ROW
============================================================

Challenge 13a is not only about USD.

To close a registered account:

for EVERY row in `account_balances` where:

account_id = targetAccountId

require:

available === 0n
AND
held === 0n

If ANY asset row has:

available != 0n
OR
held != 0n

closure must fail.

Do not:
- check only one asset;
- default to USD;
- sum assets together;
- allow +USD and -BTC to cancel;
- inspect only `total`.

Each row must be independently zero.

============================================================
L. EXACT BIGINT ZERO CHECK
============================================================

Read database strings exactly:

BigInt(row.available)
BigInt(row.held)

Compare:

=== 0n

Do not use:

Number(row.available)
parseInt(row.available)
Boolean(row.available)

A string `"0"` is truthy in JavaScript, so:

if (row.available)

is WRONG.

Use exact BigInt conversion.

============================================================
M. NON-ZERO AVAILABLE BLOCKS CLOSE — 13a-1
============================================================

If any row has:

available != 0n

closure must reject.

No status update occurs.

No balance modification occurs.

Preserve existing balances exactly.

Use the exact current API error/status contract from tests.

Do not zero the balance automatically.

Do not withdraw or transfer automatically.

============================================================
N. NON-ZERO HELD BLOCKS CLOSE — 13a-2
============================================================

If any row has:

held != 0n

closure must reject.

Do not:
- auto-release held funds;
- cancel every order automatically unless current test explicitly requires it;
- move held -> available;
- zero the row.

Closure is allowed only after the user/system has naturally resolved balances to zero.

============================================================
O. ALL BALANCE ROWS ZERO — 13a-3
============================================================

An account may have existing rows such as:

USD:
available = 0
held = 0

BTC:
available = 0
held = 0

That account should close successfully.

Do not treat the existence of balance rows itself as non-empty.

Check numeric values.

============================================================
P. FRESH ACCOUNT WITH NO BALANCE ROWS — 13a-4
============================================================

A freshly opened account may have zero rows in `account_balances`.

That is a valid zero-balance account.

No rows:

=> all balances are zero
=> may close.

Do not require at least one balance row.

Do not create a zero row merely to close.

============================================================
Q. CLOSE MUST BE TRANSACTIONAL
============================================================

Closing must atomically:

1. verify target account exists/current status as required;
2. inspect ALL its balance rows;
3. reject if any available/held amount is nonzero;
4. update account status to `closed`.

Use one database transaction.

Do not:

1. read balances outside transaction;
2. later update account status in another operation.

That creates a race where a balance could change between validation and close.

============================================================
R. CLOSURE VS BALANCE MUTATION RACE
============================================================

For robust semantics:

- close checks zero and updates status in one transaction;
- deposit/withdraw/hold assert open inside their mutation transaction.

Whichever operation serializes first determines outcome.

Valid outcomes conceptually:

A. deposit wins:
- balance becomes nonzero;
- close then rejects.

B. close wins:
- status becomes closed;
- deposit then rejects.

Invalid outcome:
- account closed with a newly nonzero balance due to a stale check.

Do not add sleeps.

Use transaction boundaries.

============================================================
S. closeAccount() REPOSITORY DESIGN
============================================================

Likely file:

src/repositories/accountsRepository.ts

Inspect existing stub/signature.

A strong conceptual implementation:

async function closeAccount(db, accountId) {
  return db.transaction(async trx => {
    const status = await getStatus(trx, accountId)

    // handle missing according to current API contract
    // handle already closed according to current test contract

    const rows = await trx("account_balances")
      .where({ account_id: accountId })
      .select("available", "held")

    for (const row of rows) {
      if (
        BigInt(row.available) !== 0n ||
        BigInt(row.held) !== 0n
      ) {
        throw existing NonZeroBalance/AccountNotEmpty error
      }
    }

    await trx("accounts")
      .where({ id: accountId })
      .update({ status: "closed" })
  })
}

Use actual table/column names and errors.

Do not blindly copy this pseudocode.

============================================================
T. ALREADY-CLOSED CLOSE REQUEST
============================================================

Read current test.

Possible semantics:
- idempotent success;
- conflict;
- not found-like state error.

Do not invent one.

Implement exactly current organizer contract.

Whatever choice:
- do not reopen;
- do not mutate balances.

============================================================
U. CLOSE ENDPOINT / CONTROLLER
============================================================

Inspect current `ledgerController` / routes.

Preserve exact:
- route path;
- HTTP method;
- response envelope;
- success status;
- error code.

Do not add a duplicate endpoint.

Do not expose raw database errors.

Do not return HTML.

============================================================
V. CLOSED DEPOSIT — 13b-1
============================================================

Deposit must reject if account status is `closed`.

The closure check must occur before balance mutation.

Because Task 12 deposit uses idempotency/transaction infrastructure:

ensure `assertOpen()` happens within the actual business mutation transaction/executor.

No balance change.

Do not write a new row for a closed account.

============================================================
W. CLOSED WITHDRAWAL — 13b-1
============================================================

Withdrawal must reject closed accounts before:

- balance read-modify-write that changes state;
- insufficient-funds mutation path.

No balance change.

Use existing AccountClosedError mapping.

Do not convert closure into InsufficientAvailableError.

============================================================
X. CLOSED HOLD — 13b-1
============================================================

Hold must reject closed accounts.

Check account status inside the same transaction used for hold balance mutation.

Do not:
- move available -> held;
- create balance row;
- reserve funds.

Preserve open-account Task 11 behavior.

============================================================
Y. RELEASE ON CLOSED ACCOUNT
============================================================

Published 13b-1 explicitly tests deposit, withdrawal and hold.

Held balance must be zero before closure, so normally there is nothing to release after a valid close.

Do not broaden behavior unnecessarily.

Inspect current challenge13 and existing architecture.

If tests require release to reject closed accounts:
- use assertOpen consistently.

If not:
- preserve existing behavior unless consistency change is safe.

Do not create a regression in 13d-2 open-account hold/release.

============================================================
Z. IDEMPOTENCY + CLOSED ACCOUNT
============================================================

Task 12 deposit/withdraw use idempotency.

Preserve existing exactly-once semantics.

Important distinction:

- a brand-new mutation against a closed account must reject with no balance effect;
- a replay of a historically successful idempotent request may have separate replay semantics.

Read the current tests before changing replay policy.

Do not destroy durable idempotency behavior merely to make every replay re-run account status checks.

============================================================
AA. TRADE SETTLEMENT — CHECK ALL FOUR ACCOUNTS
============================================================

Challenge 13b-2 uses:

- sellerAssetAccountId
- buyerAssetAccountId
- buyerCashAccountId
- sellerCashAccountId

Before ANY settlement balance writes:

assert every distinct registered account is open.

Do this inside the SAME trade settlement transaction.

Do not check only:
- seller;
- buyer;
- asset accounts;
- cash accounts.

Any one closed participant must abort the entire settlement.

============================================================
AB. DEDUPLICATE TRADE ACCOUNT CHECKS
============================================================

The four settlement IDs may overlap.

Create a Set of distinct account IDs and call assertOpen once per distinct ID if convenient.

Do not assume four unique accounts.

This does not change settlement balance aggregation.

============================================================
AC. TRADE CLOSED FAILURE IS ATOMIC
============================================================

If one participant is closed:

- no seller asset held consumption;
- no buyer asset credit;
- no buyer cash held consumption;
- no seller cash credit;
- no ledger settlement entry.

Throw before writes where possible.

The outer Task 13 transaction remains the final atomicity guarantee.

============================================================
AD. TRADE UNKNOWN ACCOUNT SEMANTICS
============================================================

Do not change Task 8 missing-account semantics globally.

`assertOpen()` only rejects actual `closed`.

If current trade contract separately validates account existence:
preserve that mechanism.

Do not make missing == closed just to implement Challenge 13.

============================================================
AE. CLOSED ACCOUNT ORDER PLACEMENT — 13c-1
============================================================

A registered closed account must be rejected BEFORE:

- Task 17 risk check/reservation;
- matching engine;
- stop storage;
- book insertion;
- market-feed publication.

Add/use account status gate in order placement.

Do not reserve risk then discover closure.

No matching state mutation.

============================================================
AF. UNREGISTERED ACCOUNT ORDER PLACEMENT — 13c-2
============================================================

This is a critical positive control.

If account ID is not present in accounts table:

getStatus() => null

closure gate must ALLOW existing trading behavior.

Do not require registration for all orders as part of Task 18.

Do not add:

if (!account) return 404

to order placement unless another existing contract already requires it—and Challenge 13c-2 says otherwise for the tested path.

============================================================
AG. CLOSED ORDER ERROR CONTRACT
============================================================

Read exact test assertion.

Use the existing AccountClosedError / API error code.

Do not invent:
- ACCOUNT_DISABLED;
- ACCOUNT_NOT_FOUND;
- FORBIDDEN

if current test expects ACCOUNT_CLOSED or another existing code.

Return controlled client error, not 500.

============================================================
AH. EXISTING RESTING ORDERS AFTER CLOSURE
============================================================

Challenge 13c says closed account cannot place NEW orders.

It does not say closeAccount must automatically cancel all prior orders.

Also closure requires zero held balances, which may naturally prevent closure while live reserved settlement obligations exist depending on architecture.

Do not invent mass cancellation unless current tests explicitly require it.

If Task 17 risk reservations exist without settlement holds:
read current close tests before adding risk-state checks.

The published close precondition is balance zero.

Do not silently add:
- no open orders;
- no risk reservations;
- no ledger history

as extra closure requirements unless current tests/source require them.

============================================================
AI. RISK STATE AND CLOSURE
============================================================

Do not make Task 18 a risk-engine redesign.

Order placement closure check should happen before Task 17 risk reservation.

If an account closes successfully while risk registry still contains stale entries due a prior lifecycle bug:
do not paper over that by clearing all risk state unless tests/architecture explicitly require it.

Fix only direct closure integration.

============================================================
AJ. DIRECT LEDGER POSTINGS AND CLOSED ACCOUNTS
============================================================

Challenge 13d-1 explicitly verifies balanced ledger entries between OPEN accounts remain unaffected.

Read challenge13 carefully to determine whether direct ledger posting to CLOSED accounts is tested/prohibited.

Do NOT automatically add a closed-account restriction to every ledger posting if the current contract does not require it.

The explicit 13b operations are:
- deposit;
- withdrawal;
- hold;
- trade.

Order placement is covered separately.

Keep scope evidence-based.

============================================================
AK. 13d-1 — OPEN LEDGER REGRESSION
============================================================

A balanced entry between two open accounts must still:

- post successfully;
- remain append-only;
- balance per asset;
- preserve trial balance = zero.

Do not alter Task 10 ledger balancing rules.

If you add account-status checks to ledger paths due actual tests:
ensure open accounts pass.

============================================================
AL. 13d-2 — OPEN HOLD/RELEASE REGRESSION
============================================================

For an OPEN account:

deposit/funding as test requires
-> hold
-> release

must behave exactly as before.

Closure integration must not cause:

- all accounts to appear closed;
- missing status to throw;
- status query errors;
- nested transaction deadlock.

============================================================
AM. ACCOUNT STATUS QUERY MUST ACCEPT TRANSACTION EXECUTOR
============================================================

To enforce closure atomically in settlement operations, `getStatus()` / `assertOpen()` should work with the current database executor type.

If current helper accepts only global Knex but mutation has a `trx`:
refactor minimally so it can use `trx`.

Do not start a separate nested transaction merely to read account status.

The status check must observe the same transactional context as the mutation.

============================================================
AN. DO NOT CATCH AccountClosedError AS GENERIC 500
============================================================

Inspect:

- settlementController;
- orderController;
- ledgerController/server error mapping.

Ensure closed-account errors are mapped to the exact expected controlled status/code.

Do not expose:
- stack;
- SQL;
- file paths.

============================================================
AO. CLOSE DOES NOT DELETE HISTORY
============================================================

Do not delete:

- ledger entries;
- ledger postings;
- balance history;
- idempotency records;
- account row.

Closure is status only.

Historical reporting must remain possible.

============================================================
AP. CLOSE DOES NOT ZERO BALANCES
============================================================

Never implement close as:

UPDATE account_balances SET available='0', held='0'

That destroys financial state.

Instead require zero BEFORE close.

If nonzero:
reject.

============================================================
AQ. ALL-ASSET CHECK PERFORMANCE / SAFETY
============================================================

Account balance rows should normally be small.

Use a simple exact query over account rows.

Do not build dynamic SQL from asset names.

Do not query one row per registered asset if a single account-scoped select is available.

============================================================
AR. CONCURRENCY / SQLITE
============================================================

Use legitimate database transaction semantics.

Do not add:
- arbitrary process sleeps;
- polling;
- test-only mutex.

If SQLite lock behavior causes a race test to fail:
inspect transaction mode/current repository conventions.

Do not modify global DB pool configuration for Task 18.

============================================================
AS. EXPECTED TASK 18 FILE SCOPE
============================================================

Primary likely:

- src/repositories/accountsRepository.ts
- src/controller/ledgerController.ts

Integration likely:

- src/repositories/settlementRepository.ts
- src/controller/settlementController.ts
- src/controller/orderController.ts

Possibly minimal:

- src/routes/ledgerRoutes.ts

only if an existing close endpoint stub/route genuinely requires implementation.

Normally do not change:

- matching engine core;
- risk domain;
- ledger domain;
- migrations.

Create/update:

- docs/clearhouse-task-18-account-closure.md

Do NOT add tests.

============================================================
AT. IMPLEMENTATION QUALITY
============================================================

Maintain strict TypeScript.

Avoid:

- any;
- @ts-ignore;
- Number balance conversion;
- status check outside mutation transaction;
- deleting account rows;
- zeroing balances on close;
- missing==closed bug;
- broad catch returning fake success;
- duplicated account-status logic.

Prefer:

- shared `getStatus`;
- shared `assertOpen`;
- exact BigInt;
- one close transaction;
- narrow controller error mapping.

============================================================
AU. REQUIRED VERIFICATION — CHALLENGE 13
============================================================

Run:

npm run typecheck

Then:

npm test challenge13.test.ts

This is the PRIMARY Task 18 gate.

If group labels exist:

npm test challenge13.test.ts -t "Challenge 13a"
npm test challenge13.test.ts -t "Challenge 13b"
npm test challenge13.test.ts -t "Challenge 13c"
npm test challenge13.test.ts -t "Challenge 13d"

Use actual current labels.

============================================================
AV. TASK 8 ACCOUNT-STATUS REGRESSION
============================================================

Run:

npm test challenge00b.test.ts -t "Challenge 0n"

Reference Task 8 0n verifies:

- missing account is not treated as closed;
- closed account is rejected.

Use actual current label if changed.

============================================================
AW. SETTLEMENT REGRESSION
============================================================

Run:

npm test challenge04.test.ts

This verifies:

- open account hold/release;
- deposits/withdrawals;
- atomic settlement

remain healthy.

============================================================
AX. MATCHING / RISK REGRESSION
============================================================

Run:

npm test challenge03.test.ts
npm test challenge05.test.ts

This ensures order closure gating did not break matching/risk for allowed accounts.

============================================================
AY. LEDGER / FOUNDATION REGRESSION
============================================================

Run:

npm test challenge02.test.ts
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

Run:

git diff --check

Finally:

npm test

Record Task 19+ failures honestly.

============================================================
AZ. FAILURE DIAGNOSIS — 13a
============================================================

If nonzero account closes:

check:

- query includes all assets;
- both available and held are checked;
- BigInt("0") exactness;
- transaction actually uses current DB;
- status update not occurring before validation.

If fresh account fails to close:

check:
- zero rows should be valid;
- do not require account_balances row.

============================================================
BA. FAILURE DIAGNOSIS — 13b
============================================================

If deposit/withdraw/hold succeeds after close:

check:
- assertOpen placement;
- check occurs inside transaction;
- AccountClosedError swallowed by idempotency callback;
- controller maps error correctly.

If trade partially moves:

check:
- all four account status checks happen inside outer settleTrade transaction BEFORE writes.

============================================================
BB. FAILURE DIAGNOSIS — 13c
============================================================

If closed registered account still trades:

check:
- order controller closure gate occurs before risk/matching.

If unregistered account is rejected:

check:
- assertOpen logic;
- status null handling;
- accidental existence requirement.

Do not weaken closed-account check to fix missing account; distinguish exactly.

============================================================
BC. FAILURE DIAGNOSIS — 13d
============================================================

If open ledger entry fails:

check:
- over-broad account-status restriction;
- open status lookup;
- ledger controller regression.

If open hold/release fails:

check:
- nested transaction/status query;
- account status query executor;
- new account active status.

============================================================
BD. TASK 18 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-18-account-closure.md

Include:

1. Starting commit.
2. Working branch task-18.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 13 test count.
6. 13a–13d point map.
7. Account status model.
8. Missing-account semantics.
9. closeAccount transaction design.
10. all-asset zero-balance check.
11. available-balance rejection.
12. held-balance rejection.
13. fresh-no-row close behavior.
14. already-closed behavior per actual test.
15. close endpoint/status/error.
16. deposit closure integration.
17. withdrawal closure integration.
18. hold closure integration.
19. release policy if changed.
20. trade four-account closure integration.
21. trade atomic rollback behavior.
22. order-placement closure gate.
23. unregistered-account positive control.
24. risk/matching order of checks.
25. direct ledger policy if relevant.
26. concurrency rationale.
27. files changed.
28. typecheck result.
29. 13a result.
30. 13b result.
31. 13c result.
32. 13d result.
33. full Challenge 13 result.
34. Task 8 0n regression.
35. Challenge 04 result.
36. Challenge 03 result.
37. Challenge 05 result.
38. Challenge 02 result.
39. foundation/sanity.
40. full-suite result.
41. protected-file confirmation.
42. suggested commit.
43. master merge/push workflow.
44. next Task 19: Reconciliation / Reporting / Migration.

Do not include secrets.

============================================================
BE. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat

Review:

git diff -- src/repositories/accountsRepository.ts
git diff -- src/controller/ledgerController.ts
git diff -- src/routes/ledgerRoutes.ts
git diff -- src/repositories/settlementRepository.ts
git diff -- src/controller/settlementController.ts
git diff -- src/controller/orderController.ts
git diff -- docs/clearhouse-task-18-account-closure.md

Only include route/controller files actually changed.

Confirm:

- no organizer test modified;
- no new test added;
- config unchanged;
- scoring unchanged;
- package files unchanged;
- .env/.gitignore unchanged;
- tsconfig/vitest unchanged;
- knexfile/migrations/seeds unchanged;
- no test detection;
- no Number money conversion;
- no account deletion;
- no balance zeroing;
- missing account still != closed;
- Task 19+ work not added.

============================================================
BF. TASK 18 COMPLETION CRITERIA
============================================================

Task 18 is COMPLETE only when:

CLOSING

[ ] challenge13 read completely.
[ ] registered account close path implemented.
[ ] nonzero available blocks closure.
[ ] nonzero held blocks closure.
[ ] every asset row checked.
[ ] zero rows do not block fresh account closure.
[ ] all-zero existing rows allow close.
[ ] exact BigInt checks used.
[ ] close check + status update transactional.
[ ] account row is not deleted.
[ ] balances are not forcibly zeroed.
[ ] missing close request follows current API contract.

STATUS SEMANTICS

[ ] active account allowed.
[ ] closed account rejected.
[ ] missing/unregistered account is NOT treated as closed.
[ ] Task 8 assertOpen semantics preserved.

BALANCE OPERATIONS

[ ] closed deposit rejected.
[ ] closed withdrawal rejected.
[ ] closed hold rejected.
[ ] no balance changes on rejection.
[ ] open-account hold/release still works.

TRADE

[ ] all four trade account roles checked.
[ ] distinct account IDs handled.
[ ] any closed participant aborts settlement.
[ ] no partial balances.
[ ] no settlement ledger entry on closed-account failure.
[ ] open trade settlement remains healthy.

ORDERS

[ ] registered closed account cannot place new order.
[ ] check happens before risk reservation.
[ ] check happens before matching/book mutation.
[ ] unregistered account ID still follows existing trading behavior.
[ ] cancellation not accidentally blocked by closure.

REGRESSION

[ ] 13d ledger regression passes.
[ ] 13d hold-release regression passes.
[ ] Task 8 0n regression passes.
[ ] Challenge 04 passes.
[ ] Challenge 03 passes.
[ ] Challenge 05 passes.
[ ] Challenge 02 passes.
[ ] typecheck passes.
[ ] sanity recorded.
[ ] full suite recorded honestly.
[ ] no tests modified.
[ ] no new tests added.
[ ] package/config/migrations unchanged.
[ ] Task 18 note created.
[ ] final Git target master.

If any Challenge 13 test remains failing:

- status = PARTIAL;
- state exact test;
- state root cause.

============================================================
BG. FINAL CURSOR REPORT
============================================================

Return:

1. Task 18 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Current Challenge 13 test count.
6. closeAccount implementation.
7. all-asset zero-balance strategy.
8. fresh/no-row close behavior.
9. missing-account semantics.
10. deposit/withdraw/hold closure integration.
11. trade closure integration.
12. atomicity strategy.
13. order placement closure gate.
14. unregistered-account behavior.
15. typecheck.
16. 13a result.
17. 13b result.
18. 13c result.
19. 13d result.
20. full Challenge 13 result.
21. Task 8 0n regression.
22. Challenge 04 result.
23. Challenge 03 result.
24. Challenge 05 result.
25. Challenge 02 result.
26. foundation/sanity.
27. full-suite result.
28. remaining future failures.
29. confirmation protected files unchanged.
30. final diff summary.
31. reviewed Git commands targeting master.

Suggested commit:

feat: implement account closure rules

Do not automatically commit, merge, or push.
````

---

# Task 18 reference acceptance matrix

| Area | Required behavior |
|---|---|
| Nonzero available | Cannot close |
| Nonzero held | Cannot close |
| Multiple assets | Every row must be zero |
| Existing zero rows | Can close |
| No balance rows | Can close |
| Close action | Status change, not deletion |
| Closed deposit | Reject, no mutation |
| Closed withdrawal | Reject, no mutation |
| Closed hold | Reject, no mutation |
| Closed trade participant | Entire settlement rejects |
| Trade failure | No balances/ledger move |
| Closed registered order account | Reject before risk/matching |
| Missing/unregistered order account | Preserve existing allowed behavior |
| Open ledger accounts | Existing balanced posting works |
| Open hold/release | Existing behavior works |
| Exact balance arithmetic | BigInt |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 18

Official final branch:

**`master`**

Workflow:

**`master` → `task-18` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 18 branch

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
task-18
```

Official final branch:

```text
master
```

---

## 2. Final Task 18 verification

```powershell
npm run typecheck

npm test challenge13.test.ts

npm test challenge00b.test.ts -t "Challenge 0n"

npm test challenge04.test.ts

npm test challenge03.test.ts

npm test challenge05.test.ts

npm test challenge02.test.ts

npm test challenge01.test.ts

npm test challenge00.test.ts

npm test _sanity.test.ts

git diff --check
```

If current Challenge 13 labels are present:

```powershell
npm test challenge13.test.ts -t "Challenge 13a"
npm test challenge13.test.ts -t "Challenge 13b"
npm test challenge13.test.ts -t "Challenge 13c"
npm test challenge13.test.ts -t "Challenge 13d"
```

Then:

```powershell
npm test
```

---

## 3. Review Task 18 changes

```powershell
git status --short
git diff --stat

git diff -- src/repositories/accountsRepository.ts
git diff -- src/controller/ledgerController.ts
git diff -- src/routes/ledgerRoutes.ts
git diff -- src/repositories/settlementRepository.ts
git diff -- src/controller/settlementController.ts
git diff -- src/controller/orderController.ts
git diff -- docs/clearhouse-task-18-account-closure.md
```

Only files actually changed should appear.

Confirm no protected files changed.

---

## 4. Stage only Task 18 files

Primary expected:

```powershell
git add -- src/repositories/accountsRepository.ts
git add -- docs/clearhouse-task-18-account-closure.md
```

Only if actually changed and required:

```powershell
git add -- src/controller/ledgerController.ts
git add -- src/routes/ledgerRoutes.ts
git add -- src/repositories/settlementRepository.ts
git add -- src/controller/settlementController.ts
git add -- src/controller/orderController.ts
```

If another legitimate Task 18 production file changed:

```powershell
git add -- <actual-file-path>
```

If a file contains unrelated work:

```powershell
git add -p -- <file-path>
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

Stop if staged content unexpectedly includes:

- tests/
- config/
- package files
- migrations
- seeds
- scoring files
- .env
- .gitignore
- unrelated work.

---

## 6. Commit Task 18

```powershell
git commit -m "feat: implement account closure rules"
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

## 8. Merge Task 18

Prefer:

```powershell
git merge --ff-only task-18
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-18
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
npm test challenge13.test.ts
npm test challenge04.test.ts
npm test challenge03.test.ts
git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge05.test.ts
npm test challenge02.test.ts
npm test _sanity.test.ts
```

---

## 10. Push official master

```powershell
git push origin master
```

Do not push final submission to `main`.

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

If safe for your local-only Task 18 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge13.test.ts
npm test challenge04.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts deliberately.

---

# Fast Task 18 checklist

- [ ] branch = task-18
- [ ] final branch = master
- [ ] challenge13 fully read
- [ ] nonzero available blocks close
- [ ] nonzero held blocks close
- [ ] all assets checked
- [ ] exact BigInt zero checks
- [ ] existing zero rows close
- [ ] fresh no-row account closes
- [ ] status update transactional
- [ ] account not deleted
- [ ] balances not zeroed
- [ ] missing account != closed
- [ ] closed deposit rejected
- [ ] closed withdrawal rejected
- [ ] closed hold rejected
- [ ] no balance movement on rejection
- [ ] all trade participant accounts checked
- [ ] closed trade rejects atomically
- [ ] no settlement ledger entry on closed failure
- [ ] closed registered account cannot place order
- [ ] closure checked before risk
- [ ] closure checked before matching
- [ ] unregistered account still trades normally
- [ ] open ledger path unaffected
- [ ] open hold/release unaffected
- [ ] Task 8 0n passes
- [ ] Challenge13 passes
- [ ] Challenge04 passes
- [ ] Challenge03 passes
- [ ] Challenge05 passes
- [ ] Challenge02 passes
- [ ] typecheck passes
- [ ] full suite recorded
- [ ] no existing tests modified
- [ ] no new tests added
- [ ] config/package/migrations unchanged
- [ ] Task 18 note created
- [ ] committed on task-18
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 19 — Reconciliation, Reporting, and Migration.
