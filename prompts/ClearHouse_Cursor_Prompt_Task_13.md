# ClearHouse — Complete Enhanced Cursor Prompt for Task 13

**Task:** Challenge 04c — Atomic Trade Settlement  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-13`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 13 purpose

Task 13 completes **Challenge 04c — Atomic Trade Settlement**.

The reference organizer contract contains two tests:

### Challenge 4c-1

A successful trade must:

- consume the seller's **held traded asset**;
- credit the buyer's traded asset as **available**;
- consume the buyer's **held cash**;
- credit the seller's cash as **available**;
- perform all four balance effects atomically;
- insert one balanced double-entry ledger entry in the **same database transaction**;
- return the ledger entry ID;
- leave the global ledger trial balance balanced.

### Challenge 4c-2

If either required hold cannot cover settlement:

- reject the trade;
- return the existing conflict behavior;
- write **no partial balance changes**;
- write **no ledger entry**;
- preserve every affected balance exactly.

The supplied challenge description assigns:

- **4c-1:** 18 points
- **4c-2:** 12 points

for **30 visible Challenge 4c points**.

These are available points, not a claim about earned score.

---

# Confirmed reference trade shape

The existing `TradeSettlement` interface uses:

```ts
export interface TradeSettlement {
  sellerAssetAccountId: string;
  buyerAssetAccountId: string;
  asset: string;
  quantity: bigint;
  buyerCashAccountId: string;
  sellerCashAccountId: string;
  cashAsset: string;
  cashAmount: bigint;
}
```

The reference HTTP body is:

```json
{
  "sellerAssetAccountId": "...",
  "buyerAssetAccountId": "...",
  "asset": "SHARE-XYZ",
  "quantity": "100",
  "buyerCashAccountId": "...",
  "sellerCashAccountId": "...",
  "cashAsset": "USD",
  "cashAmount": "10000"
}
```

The controller already expects `settleTrade()` to return a ledger `entryId` and maps `InsufficientHeldError` to a conflict response.

The current CodeCommit checkout is authoritative; Cursor must inspect its actual current versions before modifying anything.

---

# Settlement state transition

For the traded asset:

```text
seller asset account:
    held -= quantity

buyer asset account:
    available += quantity
```

For cash:

```text
buyer cash account:
    held -= cashAmount

seller cash account:
    available += cashAmount
```

The seller's held asset and buyer's held cash are **consumed**.

They are NOT released back to the same accounts.

---

# Required balanced ledger entry

Under Task 10's signed posting convention:

- positive = debit
- negative = credit

the settlement ledger entry should conceptually contain:

```text
Traded asset:
buyer asset account   +quantity
seller asset account  -quantity

Cash asset:
seller cash account   +cashAmount
buyer cash account    -cashAmount
```

Therefore every asset balances independently:

```text
asset:
+quantity - quantity = 0

cashAsset:
+cashAmount - cashAmount = 0
```

Use the existing Task 10 `insertBalancedEntry()` with the **same Knex transaction** as the balance writes.

Do **not** use `postEntry()` if it starts a separate transaction.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 13

Copy the full block below into Cursor Agent mode.

````text
Act as my senior TypeScript fintech settlement engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 13 ONLY: implement Challenge 04c — Atomic Trade Settlement. Use the completed Task 10 ledger and Tasks 11–12 balance/hold infrastructure. Settlement must atomically consume both required holds, credit both counterparties, and insert a balanced multi-asset ledger entry in the SAME database transaction. Any failure must roll back every effect.

Do not stop at a plan. Perform the implementation, run the organizer tests and regressions, produce the Task 13 engineering note, and show reviewed Git commands. Do not automatically commit, merge, or push.

============================================================
A. REPOSITORY / SUBMISSION CONTEXT
============================================================

Existing checkout:

C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b

Official remote:

origin

Official CodeCommit repository:

https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b

OFFICIAL FINAL SUBMISSION BRANCH:

master

Task branch:

task-13

Historical GitHub reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Important:
- the current CodeCommit checkout is authoritative;
- do not reset to the historical reference;
- do not replace origin;
- do not clone over this repository;
- preserve all verified Tasks 1–12;
- work on task-13;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT ORGANIZER / CHANGE-SCOPE RULES
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
- knexfile.js / database configuration
- migrations
- seed files
- scoring files
- grading scripts

Do NOT:
- skip tests;
- weaken assertions;
- increase organizer timeouts;
- reduce test discovery;
- change property generators/seeds;
- relax TypeScript.

Do NOT create production branches checking:
- NODE_ENV === "test";
- VITEST;
- Challenge 4c;
- organizer test names;
- fixture account names;
- known quantities;
- known assets;
- known account IDs.

Do NOT use:
- Number()
- parseInt()
- parseFloat()
- floating point

for monetary or settlement quantities.

Do NOT use:
- git reset --hard;
- git clean -fd;
- force-push;
- history rewriting;
- blind branch deletion.

Do NOT implement future challenges such as:
- matching engine;
- execution policies;
- stop orders;
- risk;
- account closure;
- fees;
- netting;
- event sourcing;
- market data;
- WebSockets;
- dashboard.

Do not change tests to make them pass.

============================================================
C. PRE-FLIGHT — VERIFY MASTER / TASK 13
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
- official remote = origin;
- official final branch = master.

Verify Task 12 is already represented on master:

git log --oneline --decorate --max-count=20 master

If task-12 exists:

git log --oneline --decorate --max-count=10 task-12

If valid Task 12 work is still only on task-12:
- do not discard it;
- report that master is stale;
- do not accidentally implement Task 13 on top of an older branch.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-13

If task-13 already exists:

git branch --list task-13
git log --oneline --decorate --max-count=10 task-13

Do not delete/recreate it blindly.

Record:
- starting commit;
- current branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
D. VERIFY TASK 10–12 PREREQUISITES
============================================================

Read if present:

- docs/clearhouse-task-10-ledger.md
- docs/clearhouse-task-11-holds-releases.md
- docs/clearhouse-task-12-deposit-withdraw-idempotency.md

Verify source, not only documentation.

TASK 10 requirements needed by Task 13:

- insertBalancedEntry(executor, postings, reversalOf?) works;
- per-asset balancing works;
- bigint posting amounts remain exact;
- supplied transaction executor is actually used;
- Challenge 02 passes.

TASK 11 requirements:

- exact held/available behavior;
- InsufficientHeldError exists;
- readBalance/writeBalance remain transaction-compatible.

TASK 12 requirements:

- deposits can seed available balances;
- holds can create held obligations;
- Challenge 4a + 4b pass.

Run baseline prerequisites:

npm run typecheck

npm test challenge02.test.ts

npm test challenge04.test.ts -t "Challenge 4a|Challenge 4b"

If these fail due to pre-existing unrelated issues:
- report exact blocker;
- do not silently rewrite unrelated subsystems;
- complete any independent Task 13 work that remains possible.

============================================================
E. READ THE EXACT TASK 13 CONTRACT
============================================================

Read COMPLETELY:

- tests/challenge04.test.ts
- src/repositories/settlementRepository.ts
- src/controller/settlementController.ts
- src/routes/settlementRoutes.ts
- src/domain/settlement.ts
- src/repositories/ledgerRepository.ts
- src/domain/ledger.ts
- src/repositories/accountsRepository.ts

Inspect:
- account_balances schema;
- ledger_entries schema;
- ledger_postings schema;
- Task 10 insertBalancedEntry implementation;
- Task 11/12 transaction patterns;
- every current call site of settleTrade().

Search:

rg -n "settleTrade|TradeSettlement|insertBalancedEntry|postEntry|readBalance|writeBalance|InsufficientHeldError|assertOpen|ledger_entries|ledger_postings" src tests db

PowerShell fallback:

Get-ChildItem -Recurse src,tests,db -File |
  Select-String -Pattern "settleTrade|TradeSettlement|insertBalancedEntry|postEntry|readBalance|writeBalance|InsufficientHeldError|assertOpen|ledger_entries|ledger_postings"

Create a short pre-edit map:

requirement
| balance keys
| required hold
| resulting balance delta
| ledger posting
| failure rollback rule

============================================================
F. BASELINE TASK 13 TEST
============================================================

Run:

npm test challenge04.test.ts -t "Challenge 4c"

Record:
- exit code;
- exact executed count;
- pass/fail;
- current root cause.

Reference expected:
- 2 Challenge 4c tests.

Do not modify Challenge 4a/4b code merely because full challenge04 contains them unless your Task 13 changes actually regress them.

============================================================
G. CURRENT TRADE SETTLEMENT MODEL
============================================================

The existing public interface is expected to remain:

TradeSettlement {
  sellerAssetAccountId: string;
  buyerAssetAccountId: string;
  asset: string;
  quantity: bigint;
  buyerCashAccountId: string;
  sellerCashAccountId: string;
  cashAsset: string;
  cashAmount: bigint;
}

Do not rename fields or alter the route payload.

The settlement operation represents two simultaneous transfers:

ASSET LEG:
seller's held asset
    -> buyer's available asset

CASH LEG:
buyer's held cash
    -> seller's available cash

Settlement does NOT:
- move seller asset held back to seller available;
- move buyer cash held back to buyer available;
- withdraw from buyer available;
- withdraw from seller available.

It CONSUMES the pre-existing holds.

============================================================
H. SUCCESSFUL BALANCE TRANSITIONS
============================================================

For quantity Q:

seller asset balance:

before:
{
  available: SA,
  held: SH
}

require:

SH >= Q

after:

{
  available: SA,
  held: SH - Q
}

buyer asset balance:

before:
{
  available: BA,
  held: BH
}

after:

{
  available: BA + Q,
  held: BH
}

For cash amount C:

buyer cash balance:

before:
{
  available: CA,
  held: CH
}

require:

CH >= C

after:

{
  available: CA,
  held: CH - C
}

seller cash balance:

before:
{
  available: SCA,
  held: SCH
}

after:

{
  available: SCA + C,
  held: SCH
}

All arithmetic is exact bigint.

============================================================
I. REQUIRED HELD-FUND VALIDATION
============================================================

Before durable mutation, verify all required held obligations.

At minimum:

seller traded asset held >= quantity

buyer cash held >= cashAmount

If either fails:

throw existing InsufficientHeldError with the relevant account/asset.

Do not:
- partially consume one hold then discover the other is insufficient outside a transaction;
- use available funds as a fallback;
- automatically create a hold;
- automatically release funds;
- allow negative held balances.

============================================================
J. VALIDATE ALL HOLD REQUIREMENTS BEFORE WRITES
============================================================

Prefer:

1. read all affected balances;
2. calculate required held consumption;
3. validate every requirement;
4. calculate all next balances;
5. write balances;
6. insert ledger entry;
7. commit.

Even though the transaction would roll back later writes, validating all hold requirements before mutation:
- reduces unnecessary writes;
- makes failure semantics clearer;
- avoids transient partial state inside the transaction.

Do not persist a successful partial first leg.

============================================================
K. HANDLE OVERLAPPING ACCOUNT/ASSET KEYS ROBUSTLY
============================================================

Do not assume the four trade accounts are always unique.

A robust implementation should identify balance rows by:

(accountId, asset)

and aggregate changes per unique balance key.

Potential hidden/generated cases may reuse:
- buyer/seller account IDs;
- the same account for asset/cash;
- asset equal to cashAsset.

Avoid this incorrect pattern:

read seller asset
read buyer asset
read buyer cash
read seller cash

then independently write four snapshots

when two logical legs could reference the same physical row.

That can overwrite one update with another.

Preferred robust strategy:

1. Build a key such as a stable tuple representation:
   accountId + asset
   using a collision-safe internal representation.

2. Aggregate:
   - held consumption;
   - available credit

per unique `(accountId, asset)`.

3. Read each unique balance once.

4. Verify:

current.held >= totalHeldConsumptionForKey

5. Compute:

next.available =
  current.available + totalAvailableCreditForKey

next.held =
  current.held - totalHeldConsumptionForKey

6. Write each unique balance once.

Do not use ambiguous raw concatenation such as:

accountId + ":" + asset

if either component can contain the separator.

Use a nested Map, JSON tuple encoding, or another unambiguous internal key.

============================================================
L. TRADE AMOUNT VALIDITY
============================================================

The controller accepts digit strings and converts to bigint.

Never allow a negative direct bigint passed to settleTrade() to reverse transfer direction.

Inspect current Task 9/input policy and current organizer tests.

If current API contract requires positive trade amounts:
- reject zero and negative values through the established INVALID_TRADE/request validation behavior.

At minimum:
- repository must not silently process negative quantity/cashAmount.

Do not invent incompatible public error codes.

Do not use InsufficientHeldError to represent malformed negative input if an input-validation error already exists.

============================================================
M. ONE DATABASE TRANSACTION FOR EVERYTHING
============================================================

settleTrade() must use exactly one outer transaction for:

- all account-open checks if applicable;
- all balance reads;
- all hold validation;
- all balance writes;
- ledger entry insertion.

Conceptually:

return db.transaction(async (trx) => {
  ...
})

Every database operation inside must use `trx`.

Do NOT use global `db` inside the transaction.

Do NOT call public functions that start their own independent transactions if that would break atomicity.

============================================================
N. DO NOT CALL hold() / release() TO PERFORM SETTLEMENT
============================================================

Public hold/release operations represent different business transitions.

`release()` moves held funds back to the SAME account's available balance.

Settlement must consume held value and credit the COUNTERPARTY.

Therefore this is wrong:

await release(db, sellerAssetAccountId, asset, quantity)

because it returns the asset to the seller's available balance.

Likewise do not release buyer cash to the buyer.

Use direct transaction-local balance state calculation through:

readBalance(trx,...)
writeBalance(trx,...)

or existing internal transaction helpers specifically designed for settlement consumption.

============================================================
O. DO NOT CALL postEntry() INSIDE SETTLEMENT
============================================================

Task 10 `postEntry()` normally creates its own transaction.

Task 13 requires ledger + balance mutations to be one atomic transaction.

Use:

insertBalancedEntry(trx, postings)

with the current transaction.

Do NOT:

await postEntry(db, postings)

from inside or after the balance transaction.

That can create a ledger entry independently from balance settlement.

============================================================
P. BALANCED LEDGER POSTINGS
============================================================

Use Task 10 PostingInput.

Under the established signed convention:

positive = debit
negative = credit

Create postings equivalent to:

ASSET LEG

buyer asset account:
{
  accountId: trade.buyerAssetAccountId,
  asset: trade.asset,
  amount: +trade.quantity
}

seller asset account:
{
  accountId: trade.sellerAssetAccountId,
  asset: trade.asset,
  amount: -trade.quantity
}

CASH LEG

seller cash account:
{
  accountId: trade.sellerCashAccountId,
  asset: trade.cashAsset,
  amount: +trade.cashAmount
}

buyer cash account:
{
  accountId: trade.buyerCashAccountId,
  asset: trade.cashAsset,
  amount: -trade.cashAmount
}

Per-asset sums:

trade.asset:
+Q - Q = 0

cashAsset:
+C - C = 0

If trade.asset === cashAsset:
all postings still collectively sum to zero for that single asset.

Do not convert amounts through Number.

============================================================
Q. LEDGER POSTING SEMANTICS MUST MATCH BALANCE MOVEMENT
============================================================

The balance store and ledger serve different purposes but must describe the same transfer direction.

Asset moves:

seller -> buyer

Therefore:
- buyer asset ledger debit +Q;
- seller asset ledger credit -Q.

Cash moves:

buyer -> seller

Therefore:
- seller cash debit +C;
- buyer cash credit -C.

Do not reverse these signs merely to satisfy a total-zero check.

A balanced but directionally inverted entry is still semantically wrong.

============================================================
R. RETURN THE NEW LEDGER ENTRY ID
============================================================

settleTrade() returns:

Promise<string>

Return the ID created by:

insertBalancedEntry(trx, postings)

The controller already sends:

HTTP 201

{
  data: {
    entryId
  },
  meta: {}
}

Preserve this contract.

Do not generate an unrelated second ID.

============================================================
S. ATOMIC FAILURE — INSUFFICIENT SELLER ASSET HOLD
============================================================

Reference Challenge 4c-2 creates a seller with no held SHARE-XYZ.

Settlement must fail with existing conflict behavior.

Required:

- seller asset unchanged;
- buyer asset unchanged;
- buyer cash unchanged;
- seller cash unchanged;
- no new ledger entry;
- no partially updated rows.

Even though the visible reference assertion checks one balance, implement the full atomic invariant.

============================================================
T. ATOMIC FAILURE — INSUFFICIENT BUYER CASH HOLD
============================================================

Implement the symmetric protection even if the visible reference fixture primarily demonstrates seller-asset insufficiency.

If buyer held cash < cashAmount:

- reject;
- no asset transfer;
- no cash transfer;
- no ledger entry.

Use the existing InsufficientHeldError for the relevant buyer cash account/asset.

This is required by the general settlement rule.

============================================================
U. LEDGER FAILURE MUST ROLL BACK BALANCES
============================================================

Atomicity is bidirectional.

If:

insertBalancedEntry(trx, postings)

throws for any reason after balance calculations/writes:

the outer transaction must roll back all balance writes.

Do not catch ledger failure and commit balances anyway.

Do not insert the ledger after committing balances.

Do not compensate manually with another transaction.

Let the database transaction provide all-or-nothing behavior.

============================================================
V. BALANCE WRITE FAILURE MUST ROLL BACK LEDGER
============================================================

Similarly:

if any balance write fails, no ledger entry may survive.

Using one transaction ensures this.

Do not commit ledger separately.

============================================================
W. ACCOUNT STATUS POLICY
============================================================

The reference settlement controller already handles AccountClosedError.

Inspect current Tasks 8/11/12 behavior.

If settlement mutations consistently assert account open:
- check all distinct participant accounts inside the SAME transaction before writes.

Likely accounts:

- sellerAssetAccountId
- buyerAssetAccountId
- buyerCashAccountId
- sellerCashAccountId

Deduplicate account IDs before repeated status queries.

Use the current fixed `assertOpen()` semantics from Task 8.

Do not reintroduce:
missing account == closed
unless current contract explicitly requires it.

Do not implement closeAccount() in Task 13.

============================================================
X. ACCOUNT / ASSET ROW ISOLATION
============================================================

Only rows corresponding to settlement legs may change.

Do not:
- update every balance for an account;
- update every row for an asset;
- alter unrelated held balances;
- alter unrelated available balances.

Use exact composite key:

account_id + asset.

============================================================
Y. EXACT BIGINT THROUGHOUT
============================================================

Never convert:
- quantity;
- cashAmount;
- available;
- held;
- ledger posting amount

through Number.

Use bigint arithmetic only.

Persistence goes through existing exact:

readBalance()
writeBalance()

and Task 10 ledger serialization.

Preserve values larger than Number.MAX_SAFE_INTEGER.

============================================================
Z. CONCURRENCY / RACE SAFETY
============================================================

Settlement is a database mutation.

All reads validating held funds and all writes consuming them must occur in the same transaction.

Do not:

1. read held outside transaction;
2. verify;
3. later begin transaction and write.

That creates a race window.

The current SQLite test topology may serialize work, but the implementation must still use legitimate transaction boundaries.

Do not create a process-local lock as the primary correctness mechanism.

Do not change database pool configuration.

============================================================
AA. REUSE EXISTING HELPERS
============================================================

Use:

readBalance(trx,...)
writeBalance(trx,...)
insertBalancedEntry(trx,...)

Do not duplicate SQL if the project comments/architecture say these helpers are infrastructure.

Do not bypass Task 8 exact balance conversion.

Do not bypass Task 10 balanced-entry validation.

============================================================
AB. CONTROLLER INTEGRATION
============================================================

The current reference controller already:

- validates required trade fields are strings;
- validates quantity/cashAmount lexical integer format;
- converts them to BigInt;
- calls settlement.settleTrade();
- maps InsufficientHeldError to 409;
- returns CREATED with entryId.

Prefer leaving controller unchanged.

Only edit:

src/controller/settlementController.ts

if the CURRENT Task 13 organizer test exposes a real integration problem.

Do not rewrite Task 12 deposit/withdraw controller behavior.

============================================================
AC. DO NOT ADD IDEMPOTENCY TO TRADE SETTLEMENT UNLESS CURRENT CONTRACT REQUIRES IT
============================================================

Challenge 4c does not specify an Idempotency-Key for `/trades`.

Do not silently force Task 8 idempotency behavior onto this endpoint unless current tests/source explicitly require it.

Task 13 is atomicity, not a new trade-retry protocol.

============================================================
AD. DO NOT INVOLVE MATCHING ENGINE
============================================================

The trade settlement endpoint receives a completed settlement instruction.

Do not:
- place orders;
- match orders;
- create trades from book logic;
- modify book state;
- add market-price logic.

Challenge 03 matching is implemented later in Tasks 14–16.

Task 13 only settles the provided trade instruction.

============================================================
AE. DO NOT ADD FEES / NETTING
============================================================

Do not:
- charge fees;
- net obligations;
- add clearing accounts;
- alter quantity/cashAmount;
- introduce rounding.

Those belong to later challenges.

Settle exactly the supplied quantities.

============================================================
AF. EXPECTED TASK 13 FILE SCOPE
============================================================

Primary expected production file:

- src/repositories/settlementRepository.ts

Only if a current integration defect requires:

- src/controller/settlementController.ts
- src/domain/settlement.ts

Use, but normally do not change:

- src/repositories/ledgerRepository.ts
- src/domain/ledger.ts
- src/repositories/accountsRepository.ts

Create/update:

- docs/clearhouse-task-13-atomic-settlement.md

Do NOT add test files.

Do NOT modify migrations.

Do NOT modify routes unless the current route is actually defective.

Do NOT modify package/config/database configuration.

============================================================
AG. IMPLEMENTATION DESIGN — RECOMMENDED STRUCTURE
============================================================

Keep settleTrade() readable.

A strong implementation structure is:

1. validate direct repository invariants such as nonnegative/positive amounts according to current contract;
2. open one Knex transaction;
3. assert relevant accounts open if current mutation policy requires it;
4. build unique balance-key requirements/deltas;
5. read each unique balance exactly once;
6. validate aggregate held consumption for every unique key;
7. compute every next balance in memory;
8. write each unique balance once;
9. build four ledger postings;
10. call insertBalancedEntry(trx, postings);
11. return entryId;
12. transaction commits automatically.

Do not over-abstract.

A few small local helpers for unique keys/deltas are acceptable if they improve correctness.

============================================================
AH. ROBUST DELTA AGGREGATION
============================================================

For each unique balance key maintain conceptually:

{
  heldConsumption: bigint,
  availableCredit: bigint
}

Settlement contributes:

seller asset:
heldConsumption += quantity

buyer asset:
availableCredit += quantity

buyer cash:
heldConsumption += cashAmount

seller cash:
availableCredit += cashAmount

Then:

if current.held < heldConsumption
  throw InsufficientHeldError

next:

{
  available: current.available + availableCredit,
  held: current.held - heldConsumption
}

This avoids lost updates if logical legs overlap.

If current tests guarantee all accounts are distinct, this approach still behaves correctly.

============================================================
AI. ERROR CHOICE FOR AGGREGATED HELD FAILURE
============================================================

If one unique key aggregates more than one held requirement and lacks enough held:

throw InsufficientHeldError using that balance key's accountId and asset.

Do not expose internal map state.

Do not return 500.

The controller should preserve standard conflict envelope.

============================================================
AJ. NO PARTIAL SUCCESS RESPONSE
============================================================

Settlement has only two outcomes:

SUCCESS:
- every balance leg applied;
- ledger entry created;
- entryId returned.

FAILURE:
- no settlement state effect.

Never return:
- "asset settled, cash failed";
- partial balances;
- a ledger ID if balances failed.

============================================================
AK. POST-IMPLEMENTATION TEST SEQUENCE
============================================================

Run:

npm run typecheck

Task 13 focused:

npm test challenge04.test.ts -t "Challenge 4c"

Expected reference:
- 2 tests.

Then completed Challenge 04:

npm test challenge04.test.ts

This should now exercise:
- Challenge 4a;
- Challenge 4b;
- Challenge 4c.

Then ledger regression:

npm test challenge02.test.ts

Then Task 8 idempotency regressions:

npm test challenge00b.test.ts -t "Challenge 0m"

npm test challenge00c.test.ts -t "Challenge 0w"

If current labels differ, use actual labels.

Then:

npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

Then:

git diff --check

Finally:

npm test

Record future challenge failures honestly.

============================================================
AL. FAILURE DIAGNOSIS RULES
============================================================

If Challenge 4c-1 fails:

check:
- seller held asset consumption;
- buyer asset available credit;
- buyer held cash consumption;
- seller cash available credit;
- ledger posting signs;
- insertBalancedEntry using same trx;
- controller entryId.

If Challenge 4c-2 fails:

check:
- all hold validation occurs before writes;
- transaction rollback;
- insufficient seller asset hold;
- no call to release();
- no partial balance write.

If trial balance reports false:

check:
- posting signs;
- per-asset balance;
- Task 10 ledger regression.

Do not weaken tests.

============================================================
AM. TEST REPORTING RULES
============================================================

For each command report:

- exact command;
- exit code;
- executed;
- passed;
- failed;
- not exercised;
- actual cause.

Do not claim the whole suite passed based on a filter.

Do not edit test-results.xml.

If a transaction test hangs:
- inspect nested transactions;
- single-connection SQLite deadlock;
- unawaited operation;
- calling postEntry() from inside transaction;
- calling public hold/release wrappers inside transaction.

Do not increase timeout or add sleeps.

============================================================
AN. TASK 13 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-13-atomic-settlement.md

Include:

1. Starting commit.
2. Working branch task-13.
3. Official final branch master.
4. Existing dirty/staged state preserved.
5. Exact Challenge 4c organizer contract.
6. Current TradeSettlement fields.
7. Asset-leg state transition.
8. Cash-leg state transition.
9. Held-fund validation.
10. Overlapping balance-key strategy.
11. Single-transaction boundary.
12. Reason public release() is not used.
13. Reason postEntry() is not used.
14. Exact ledger posting directions/signs.
15. insertBalancedEntry transaction reuse.
16. Ledger/balance rollback behavior.
17. Account-open policy if used.
18. BigInt exactness.
19. Exact files changed.
20. Typecheck result.
21. Challenge 4c result.
22. Full Challenge 04 result.
23. Challenge 02 regression.
24. Task 8 idempotency regressions.
25. Challenge 01 / challenge00 / sanity results.
26. Full-suite result.
27. Remaining future challenge failures.
28. Confirmation protected files unchanged.
29. Suggested commit message.
30. master merge/push commands.
31. Next Task 14: basic order book / matching.

Do not include credentials/secrets.

============================================================
AO. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat

Review:

git diff -- src/repositories/settlementRepository.ts
git diff -- src/controller/settlementController.ts
git diff -- src/domain/settlement.ts
git diff -- docs/clearhouse-task-13-atomic-settlement.md

Confirm:

- no existing test file changed;
- no new test file added;
- config unchanged;
- package.json/package-lock unchanged;
- .env/.gitignore unchanged;
- tsconfig/vitest unchanged;
- knexfile unchanged;
- migrations/seeds unchanged;
- scoring/grading files unchanged;
- no test detection;
- no Number money conversion;
- no matching/risk/fees/netting;
- Task 10 ledger still intact;
- Task 11 hold/release intact;
- Task 12 deposit/withdraw/idempotency intact.

============================================================
AP. TASK 13 COMPLETION CRITERIA
============================================================

Task 13 is COMPLETE only when:

[ ] Challenge 4c read completely.
[ ] settleTrade() implemented.
[ ] seller asset held is consumed.
[ ] buyer asset available is credited.
[ ] buyer cash held is consumed.
[ ] seller cash available is credited.
[ ] seller asset available is not incorrectly credited.
[ ] buyer cash available is not incorrectly credited.
[ ] required seller asset hold validated.
[ ] required buyer cash hold validated.
[ ] no held balance becomes negative.
[ ] all balance operations are in one transaction.
[ ] ledger insertion is in the SAME transaction.
[ ] insertBalancedEntry(trx, ...) reused.
[ ] postEntry() is not used as a separate transaction.
[ ] public release() is not misused to consume settlement holds.
[ ] ledger asset leg balances exactly.
[ ] ledger cash leg balances exactly.
[ ] ledger posting directions match transfer direction.
[ ] entryId returned to controller.
[ ] insufficient held rejects atomically.
[ ] failed settlement leaves all four effects untouched.
[ ] failed settlement creates no ledger entry.
[ ] ledger failure would roll back balance writes.
[ ] overlapping account/asset keys cannot lose one leg's update.
[ ] exact BigInt only.
[ ] typecheck passes.
[ ] Challenge 4c passes.
[ ] full Challenge 04 passes.
[ ] Challenge 02 remains healthy.
[ ] prior idempotency regressions remain healthy.
[ ] foundation/sanity results recorded.
[ ] full-suite status recorded honestly.
[ ] no existing tests changed.
[ ] no new tests added.
[ ] no config/package/migration changes.
[ ] Task 13 note created.
[ ] final Git target is master.

If any atomicity or ledger requirement fails:
- status = PARTIAL;
- report exact blocker;
- do not claim completion.

============================================================
AQ. FINAL CURSOR REPORT
============================================================

Return:

1. Task 13 status: COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. settleTrade implementation summary.
6. Asset-leg state transition.
7. Cash-leg state transition.
8. Held validation strategy.
9. Overlapping-key handling.
10. Transaction boundary.
11. Ledger posting structure/signs.
12. Atomic rollback behavior.
13. Typecheck result.
14. Challenge 4c result.
15. Full Challenge 04 result.
16. Challenge 02 result.
17. idempotency regressions.
18. Challenge 01 / Challenge 00 / sanity results.
19. Full-suite result.
20. Remaining future failures.
21. Confirmation tests/config/package/migrations unchanged.
22. Final diff summary.
23. Reviewed Git commands targeting master.

Suggested commit:

feat: implement atomic trade settlement

Do not commit, merge, or push automatically.
````

---

# Task 13 reference acceptance matrix

| Area | Required outcome |
|---|---|
| Seller traded asset | held decreases by quantity |
| Buyer traded asset | available increases by quantity |
| Buyer cash | held decreases by cashAmount |
| Seller cash | available increases by cashAmount |
| Seller asset available | unchanged |
| Buyer cash available | unchanged |
| Required holds | both validated |
| Insufficient hold | conflict, zero partial effects |
| Ledger asset postings | buyer +Q / seller -Q |
| Ledger cash postings | seller +C / buyer -C |
| Ledger balance | zero independently per asset |
| Transaction | balances + ledger in one transaction |
| Ledger helper | `insertBalancedEntry(trx, postings)` |
| Separate ledger transaction | prohibited |
| Public release for settlement | prohibited |
| Overlapping keys | aggregate before writing |
| Money | exact BigInt |
| Return | created ledger entry ID |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 13

The organisers require the final changes on **`master`**.

Workflow:

**`master` → `task-13` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 13 branch

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
task-13
```

Final branch:

```text
master
```

---

## 2. Final Task 13 verification

```powershell
npm run typecheck

npm test challenge04.test.ts -t "Challenge 4c"

npm test challenge04.test.ts

npm test challenge02.test.ts

npm test challenge00b.test.ts -t "Challenge 0m"

npm test challenge00c.test.ts -t "Challenge 0w"

npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

git diff --check
```

Then milestone full suite:

```powershell
npm test
```

Do not interpret future unimplemented challenge failures as Task 13 failures without inspecting their scope.

---

## 3. Review Task 13 changes

```powershell
git status --short
git diff --stat

git diff -- src/repositories/settlementRepository.ts
git diff -- src/controller/settlementController.ts
git diff -- src/domain/settlement.ts
git diff -- docs/clearhouse-task-13-atomic-settlement.md
```

Confirm no protected files changed.

---

## 4. Stage only Task 13 files

Primary expected:

```powershell
git add -- src/repositories/settlementRepository.ts
git add -- docs/clearhouse-task-13-atomic-settlement.md
```

Only if actually required and changed:

```powershell
git add -- src/controller/settlementController.ts
git add -- src/domain/settlement.ts
```

If a file contains unrelated edits:

```powershell
git add -p -- <file-path>
```

Do not use `git add .` when unrelated changes exist.

---

## 5. Review staged changes

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
```

Review:

```powershell
git diff --cached -- src/repositories/settlementRepository.ts docs/clearhouse-task-13-atomic-settlement.md
```

Review controller/domain individually if staged.

Stop if staged files unexpectedly include:
- tests/
- config/
- migrations/
- package files;
- .env;
- .gitignore;
- tsconfig;
- Vitest config;
- knexfile;
- seeds;
- grading/scoring files.

---

## 6. Commit Task 13

```powershell
git commit -m "feat: implement atomic trade settlement"
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

## 8. Merge Task 13 into master

Prefer:

```powershell
git merge --ff-only task-13
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If valid histories diverged and a normal merge is appropriate:

```powershell
git merge task-13
```

Resolve conflicts deliberately.

Never force/reset just to avoid a merge.

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
npm test challenge04.test.ts
npm test challenge02.test.ts
git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge01.test.ts
npm test _sanity.test.ts
```

---

## 10. Push official submission branch

```powershell
git push origin master
```

Do not use `main` for final submission.

Do not force-push.

---

## 11. Verify remote master

```powershell
git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

The local HEAD hash and remote `refs/heads/master` hash should match.

---

# If `git push origin master` is rejected

Do not force-push.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If rebasing your local-only Task 13 commit is appropriate:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge04.test.ts
npm test challenge02.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve any conflict before pushing.

---

# Fast Task 13 checklist

- [ ] working branch is `task-13`
- [ ] final submission branch is `master`
- [ ] Challenge 4c read completely
- [ ] Task 10 insertBalancedEntry verified
- [ ] Tasks 11–12 verified
- [ ] settleTrade implemented
- [ ] seller held asset consumed
- [ ] buyer available asset credited
- [ ] buyer held cash consumed
- [ ] seller available cash credited
- [ ] both held obligations validated
- [ ] available cannot replace missing held
- [ ] all effects use one Knex transaction
- [ ] ledger insert uses same transaction
- [ ] `insertBalancedEntry(trx, ...)`
- [ ] no separate `postEntry()` transaction
- [ ] no misuse of `release()`
- [ ] asset ledger leg balances
- [ ] cash ledger leg balances
- [ ] signs reflect actual transfer direction
- [ ] insufficient hold leaves every balance unchanged
- [ ] insufficient hold creates no ledger entry
- [ ] ledger error rolls back balances
- [ ] overlapping account/asset keys handled safely
- [ ] exact BigInt only
- [ ] entryId returned
- [ ] typecheck passes
- [ ] Challenge 4c passes
- [ ] full Challenge 04 passes
- [ ] Challenge 02 passes
- [ ] prior idempotency regressions pass
- [ ] foundation/sanity recorded
- [ ] full suite recorded
- [ ] no existing tests changed
- [ ] no new tests added
- [ ] package/config/migrations unchanged
- [ ] Task 13 note created
- [ ] committed on task-13
- [ ] merged into master
- [ ] `git push origin master`
- [ ] local HEAD matches remote master

**Next planned task:** Task 14 — Basic Order Book and Matching Engine.
