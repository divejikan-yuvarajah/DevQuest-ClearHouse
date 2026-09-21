# ClearHouse — Complete Enhanced Cursor Prompt for Task 10

**Task:** Challenge 02 — Double-Entry Ledger core implementation  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-10`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 10 purpose

Task 10 implements the actual **Double-Entry Ledger** foundation used by later settlement, reconciliation, account-closure, fee, netting, and integration challenges.

The reference Challenge 02 contract contains:

- **2a — Balance rule**
  - balanced two-account entry succeeds;
  - unbalanced entry is rejected atomically;
  - multiple assets must each independently net to zero;
  - property-generated balanced posting sets must always produce exact derived balances.
- **2b — Append-only and reversal**
  - reversal is a new compensating entry, not mutation/deletion of history;
  - trial balance must remain zero per asset.
- **2c — Point-in-time balances and statement pagination**
  - an `asOfEntry` balance excludes later entries;
  - cursor pagination must yield every account posting exactly once.

The reference `tests/challenge02.test.ts` currently contains **8 organizer tests**. The challenge overview calls Challenge 02 a **150-point** challenge, while the visible itemized task values in the provided challenge text sum differently. Therefore, **do not calculate or claim earned points from the prose**. Cursor must inspect the current `tests/challenge02.test.ts` and `config/scores.ts` read-only and report the actual current scoring/coverage.

The reference implementation surfaces are:

- `src/domain/ledger.ts`
  - `isDebitNormal`
  - `assertBalanced`
  - `reversePostings`
  - `PostingInput`
  - `UnbalancedEntryError`
- `src/repositories/ledgerRepository.ts`
  - `insertBalancedEntry`
  - `postEntry`
  - `reverseEntry`
  - `deriveBalance`
  - `trialBalance`
  - `statementPage`
- HTTP integration:
  - `src/controller/ledgerController.ts`
  - `src/routes/ledgerRoutes.ts`

The current CodeCommit checkout remains authoritative.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 10

Copy the entire block below into Cursor Agent mode.

````text
Act as my senior TypeScript fintech backend engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 10 ONLY: implement Challenge 02, the Double-Entry Ledger, completely and correctly. Implement the ledger domain helpers and repository operations, preserve the existing HTTP contracts, run the official Challenge 02 tests, run regression checks, create the Task 10 engineering note, and prepare safe Git/CodeCommit commands targeting the official `master` branch.

Do not stop at a plan. Perform the implementation and verification.

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

task-10

Historical reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

IMPORTANT:
- The current local CodeCommit checkout is authoritative.
- Never reset to the historical GitHub commit.
- Do not replace `origin`.
- Do not clone over the existing project.
- Preserve verified Tasks 1-9.
- Develop on `task-10`.
- Final reviewed work must later be merged into `master`.
- Final publication is `git push origin master`.
- Do not automatically merge or push unless I explicitly tell you to after reviewing your report.

============================================================
B. NON-NEGOTIABLE COMPETITION RULES
============================================================

1. Read before modifying:
   - AGENTS.md if present;
   - README.md;
   - current Challenges.md;
   - current guide;
   - existing `docs/clearhouse-task-*` notes.

2. Organizer-controlled files are READ ONLY:
   - tests/
   - config/
   - vitest.config.ts
   - tests/tsconfig.json
   - grading scripts
   - package.json's `test` script

3. Do not:
   - weaken organizer assertions;
   - add `.skip`;
   - reduce test discovery;
   - inflate timeouts;
   - change property generators/seeds globally;
   - relax TypeScript;
   - edit test-results.xml;
   - execute grading-report upload scripts.

4. Do not add any production branch that detects:
   - NODE_ENV === "test";
   - VITEST;
   - fixture account names/IDs;
   - exact amounts from challenge02;
   - special test headers;
   - organizer test filenames.

5. Never hardcode current examples such as:
   - cash;
   - revenue;
   - sales;
   - USD;
   - 1000;
   - 500;
   - page limit 3;
   - seven postings.

Implement the invariant generically.

6. Money remains exact:
   - bigint internally;
   - decimal integer strings in the DB/JSON boundary where the current schema uses strings;
   - never Number/parseFloat for monetary posting amounts.

7. Preserve:
   - TypeScript/Express/Knex/SQLite architecture;
   - existing database schema unless current tests prove it is insufficient;
   - existing exported signatures;
   - current API route paths and envelope shape;
   - Tasks 4-9 behavior.

8. Do not introduce a mutable `balance` column/table as the ledger source of truth merely to make tests easy. Challenge 02 explicitly requires balances to be DERIVED from immutable postings.

9. No history mutation:
   - do not UPDATE old posting amounts;
   - do not DELETE an original entry when reversing;
   - do not rewrite entry IDs;
   - do not mutate prior rows to produce an as-of result.

10. Do not implement unrelated:
   - holds/releases;
   - deposits/withdrawals;
   - trade settlement;
   - matching;
   - full risk;
   - event sourcing;
   - reconciliation;
   - account closure;
   - fees;
   - netting.

Those use the ledger later but are separate tasks.

11. No destructive Git:
   - no `git reset --hard`;
   - no `git clean -fd`;
   - no force-push;
   - no history rewrite;
   - no blind branch deletion;
   - no automatic stash that may hide user/team work.

12. Never expose:
   - .env contents;
   - auth secrets;
   - HMAC/JWT keys;
   - tokens;
   - AWS/CodeCommit credentials.

============================================================
C. GIT PRE-FLIGHT — BASE TASK 10 ON MASTER
============================================================

Run:

Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"

git status --short
git status -sb
git branch --show-current
git branch --list
git rev-parse --verify HEAD
git remote -v
git log -10 --oneline --decorate
git diff --stat
git diff --cached --stat

Confirm:
- official remote = origin
- final submission branch = master

Before creating task-10, verify that master contains the latest valid Tasks 1-9 work.

Inspect:

git log --oneline --decorate --max-count=15 master

If `main` still exists:

git log --oneline --decorate --max-count=15 main 2>$null

If a verified prior task exists only on `main` or a task branch, do NOT discard it. Report the divergence and preserve those commits. Do not start Task 10 from an older master accidentally.

If master is current and clean enough to branch safely:

git switch master
git pull --ff-only origin master
git switch -c task-10

If task-10 already exists:

git branch --list task-10
git log --oneline --decorate --max-count=10 task-10

Do not delete/recreate it blindly.

Record:
- starting commit;
- starting branch;
- pre-existing changed files;
- pre-existing staged files.

============================================================
D. VERIFY TASKS 1-9 PREREQUISITES
============================================================

Read notes if present:

- docs/clearhouse-task-01-audit.md
- docs/clearhouse-task-02-setup.md
- docs/clearhouse-task-03-infrastructure.md
- docs/clearhouse-task-04-money.md
- docs/clearhouse-task-05-signing.md
- docs/clearhouse-task-06-sessions.md
- docs/clearhouse-task-07-shared-state.md
- docs/clearhouse-task-08-account-idempotency.md
- docs/clearhouse-task-09-input-security.md

Do not assume completion from a note alone.

Challenge 02 depends heavily on:

TASK 4
- exact bigint money;
- asset correctness.

TASK 6
- ledger balance ownership middleware must still work.

TASK 8
- account creation validation/status must still work.

TASK 9
- malformed input/error envelopes must remain controlled.

Verify `challenge01.test.ts` is reasonably healthy before blaming Challenge 02 for foundation problems.

Do not reimplement old tasks unless Task 10 directly reveals a regression caused by your changes.

============================================================
E. READ THE EXACT CHALLENGE 02 CONTRACT
============================================================

Read COMPLETELY:

- tests/challenge02.test.ts
- src/domain/ledger.ts
- src/repositories/ledgerRepository.ts
- src/controller/ledgerController.ts
- src/routes/ledgerRoutes.ts

Also inspect:
- account repository/schema;
- DB configuration;
- all migrations creating the ledger entry/posting tables;
- indexes and foreign keys;
- tests/testBase.ts reset behavior;
- any later source call sites importing `insertBalancedEntry`, `postEntry`, `deriveBalance`, `trialBalance`, or `statementPage`.

Use searches:

rg -n "insertBalancedEntry|postEntry|reverseEntry|deriveBalance|trialBalance|statementPage|assertBalanced|reversePostings|PostingInput|UnbalancedEntryError" src tests db

rg -n "entry_id|reversal|postings|ledger|created_at|seq" db src

PowerShell fallback if rg is unavailable:

Get-ChildItem -Recurse src,tests,db -File | Select-String -Pattern "insertBalancedEntry|postEntry|reverseEntry|deriveBalance|trialBalance|statementPage|assertBalanced|reversePostings|entry_id|reversal|postings"

Read config/scores.ts READ ONLY if you report scoring.

IMPORTANT:
The challenge overview says 150 points, but the visible prose task values do not obviously total 150. Do not invent a score. Report exactly what current scoring configuration says.

============================================================
F. BUILD A CHALLENGE 02 COVERAGE MAP BEFORE CODING
============================================================

Create a small table in your working notes:

official assertion
| source export
| DB tables/indexes used
| invariant
| current stub/defect
| intended implementation

At minimum map:

2a-1 -> balanced entry insert
2a-2 -> atomic unbalanced rejection
2a-3 -> per-asset balance
2a-4 -> property-generated exact balances
2b-1 -> reversal
2b-2 -> trial balance
2c-1 -> as-of-entry cutoff
2c-2 -> statement pagination

Also record any extra current Challenge 02 assertions that the historical reference does not contain.

============================================================
G. RUN A BEFORE BASELINE
============================================================

Run:

npm run typecheck

npm test challenge02.test.ts

Record:
- command;
- exit code;
- tests executed;
- passed;
- failed;
- setup errors;
- exact NotImplementedError sites.

Do not claim filtered or unrun tests passed.

Because Task 10 implements the whole challenge, prefer running the whole `challenge02.test.ts` rather than only one filter.

If the current file has additional subgroups, include them.

============================================================
H. DOMAIN LEDGER — isDebitNormal()
============================================================

File:

src/domain/ledger.ts

Implement `isDebitNormal(type: AccountType)` using standard account-type normal-balance behavior expected by this project's enum:

Debit-normal:
- ASSET
- EXPENSE

Credit-normal:
- LIABILITY
- EQUITY
- REVENUE

Return boolean only.

Do not:
- inspect account names;
- infer from posting sign;
- special-case fixtures.

Even if Challenge 02 does not directly assert every account type, later ledger/reporting code may rely on this helper.

============================================================
I. DOMAIN LEDGER — assertBalanced()
============================================================

File:

src/domain/ledger.ts

PostingInput:

{
  accountId: string;
  asset: string;
  amount: bigint;
}

Signed convention in the current domain:
- positive = debit
- negative = credit

Implement exact per-asset balancing.

Algorithm:
1. Create Map<string, bigint>.
2. For each posting:
   current = map.get(asset) ?? 0n
   map.set(asset, current + amount)
3. Determine assets whose final sum !== 0n.
4. If any nonzero sum exists:
   throw `UnbalancedEntryError` with a map of ONLY the nonzero imbalances.
5. Otherwise return normally.

CRITICAL:
Assets do NOT offset each other.

Incorrect:
USD +1000
EUR -1000
=> balanced

Correct:
USD sum must separately be zero.
EUR sum must separately be zero.

Do not:
- convert bigint to Number;
- sum string values;
- use floating point;
- accept cross-asset cancellation.

Preserve the existing `UnbalancedEntryError` class and message behavior unless current tests require a compatible improvement.

Do not write to the database before this invariant is known to hold.

============================================================
J. DOMAIN LEDGER — reversePostings()
============================================================

Implement:

reversePostings(postings)

Requirements:
- return a NEW array;
- keep accountId;
- keep asset;
- negate amount exactly;
- preserve posting order unless current contract says otherwise;
- do not mutate original PostingInput objects.

For each posting p:

{
  accountId: p.accountId,
  asset: p.asset,
  amount: -p.amount
}

BigInt negation only.

The resulting reversal set must balance whenever the original balanced.

============================================================
K. DATABASE SCHEMA REVIEW
============================================================

Before repository implementation, inspect the actual migration.

Identify:
- ledger entry table name;
- posting table name;
- primary keys;
- `entry_id` foreign key;
- posting `seq`;
- `created_at`;
- reversal link column if present;
- indexes;
- insertion defaults.

Do not guess schema names from this prompt.

The reference `PostingRow` type expects fields similar to:

- seq
- id
- entry_id
- account_id
- asset
- amount
- created_at

Use the current schema exactly.

Do NOT introduce a mutable running ledger balance table.

If schema has a reversal-of field, use it.

Only modify a migration if the current organizer contract cannot be implemented with the supplied intended schema. If a schema modification appears necessary, explain why before widening scope.

============================================================
L. insertBalancedEntry() — CORE ATOMIC INSERT
============================================================

File:

src/repositories/ledgerRepository.ts

Implement the existing signature:

insertBalancedEntry(executor, postings, reversalOfEntryId?)

This function is important because later settlement code may invoke it using an existing transaction.

Required behavior:

1. Validate balancing before writes:
   assertBalanced(postings)

2. Generate ONE unique entry ID using the project's existing UUID approach.

3. Insert one ledger-entry record.

4. Insert ALL posting records linked to that entry ID.

5. Store amount using exact decimal bigint string:
   posting.amount.toString()

6. Generate unique posting IDs according to the project's existing UUID convention.

7. Preserve posting order if `seq` is auto-generated.

8. If `reversalOfEntryId` is supplied and schema supports it:
   store the relation on the new entry.

9. Return new entry ID.

IMPORTANT:
This helper must use the supplied executor.

Do NOT silently use the global db inside this function if an executor/transaction was provided.

That matters because later settlement needs ledger insertion to participate in a larger transaction.

Do not start an unnecessary nested transaction here unless the existing architecture explicitly requires it.

============================================================
M. postEntry() — TRANSACTION BOUNDARY
============================================================

Implement:

postEntry(db, postings, reversalOfEntryId?)

Required:
- run the insert atomically;
- delegate core work to insertBalancedEntry;
- return the created entry ID.

Use a Knex transaction.

Conceptually:

return db.transaction(async (trx) => {
  return insertBalancedEntry(trx-compatible executor, postings, reversalOfEntryId)
})

Use the exact types required by the current Knex configuration.

Atomicity:
If any insertion fails:
- no entry row may remain;
- no partial posting subset may remain.

Unbalanced input should fail before any durable write.

Do not catch `UnbalancedEntryError` and convert it into success. The controller already knows how to map it to HTTP 422.

============================================================
N. UNBALANCED ENTRY — NOTHING IS WRITTEN
============================================================

Challenge 2a-2 is not only "return 422".

After an unbalanced request:
- account derived balance must remain unchanged;
- no partial entry;
- no posting row.

Implementation should make this naturally true through:
- `assertBalanced()` before writes;
- transaction protection.

Do not:
- insert then delete as normal control flow;
- write one side before validating the second;
- maintain an external running total.

============================================================
O. MULTI-ASSET ENTRY
============================================================

Challenge 2a-3:

One journal entry may contain multiple assets.

Example shape conceptually:
USD debit/credit pair
EUR debit/credit pair

Accept only when each touched asset sums to zero independently.

Database insertion can still use one entry ID containing all postings if that matches current schema.

Derived balances remain per account + asset.

Do not split a valid multi-asset journal into unrelated entry IDs unless current schema/test explicitly requires it.

============================================================
P. PROPERTY-GENERATED POSTING SETS
============================================================

Challenge 2a-4 uses fast-check.

Do NOT optimize for one visible array length/value.

Must work for:
- multiple credits/debits;
- arbitrary valid bigint magnitudes generated by tests;
- exact total beyond common small fixture values.

No Number conversion anywhere in the value path.

The derived cash balance must equal the exact reference bigint sum.

If property test fails:
- preserve seed;
- preserve path;
- preserve minimal counterexample;
- fix general arithmetic.

Do not change organizer property settings.

============================================================
Q. reverseEntry() — APPEND-ONLY COMPENSATING ENTRY
============================================================

Implement:

reverseEntry(db, entryId)

Required model:
A reversal is a NEW ledger entry whose postings are exact negatives of the original.

Do not:
- delete original posting rows;
- update original posting amounts;
- mark original amount zero;
- rewrite historical rows.

Inside a transaction:

1. Find original entry.
2. Load all postings belonging to original entry in deterministic sequence order.
3. Convert DB amount string -> BigInt exactly.
4. Build PostingInput[].
5. Call reversePostings().
6. Insert a new balanced entry using the SAME transaction/executor.
7. Set reversal relationship if schema provides `reversal_of_entry_id`/equivalent.
8. Return reversal entry ID.

Use `insertBalancedEntry` rather than duplicating insertion logic where practical.

If original entry does not exist:
- inspect current project's existing error pattern;
- ensure HTTP layer will not accidentally leak an uncontrolled 500;
- use an existing not-found domain error or a minimal compatible not-found mapping if the current tests/contracts require it.
Do not invent an incompatible public contract.

If the schema/test prevents duplicate reversals, obey it. If current Challenge 02 does not specify one-reversal-only semantics, do not impose an unnecessary new restriction that could break later legitimate flows.

============================================================
R. REVERSAL MUST RESTORE EXACT BALANCE
============================================================

Given original account balance B before entry:
- posting entry -> B + X
- reversal -> B + X - X = B

This must hold exactly for bigint amounts.

Reversal itself must satisfy double-entry balance.

Do not calculate reversal from current account balance.
Reverse ORIGINAL POSTINGS.

That preserves historical correctness even if additional entries were posted after the original.

============================================================
S. deriveBalance() — CURRENT BALANCE
============================================================

Implement:

deriveBalance(db, accountId, asset, options?)

Current balance is:

SUM(all postings for accountId + asset)

Use exact integer strings.

SQLite SUM over text/large integer values can introduce type/coercion risk depending on schema and values. Inspect schema/tests before relying on SQL numeric SUM.

For maximal exactness, a safe design is:
- query matching posting amount strings;
- accumulate with BigInt in TypeScript.

This guarantees values beyond JS safe integer remain exact and aligns with Task 4.

Do not convert:
- amount -> Number;
- SQL float -> BigInt.

Return `0n` when no matching posting exists.

Do not read settlement `account_balances`; ledger balance is derived from ledger postings.

============================================================
T. deriveBalance() — AS-OF ENTRY
============================================================

BalanceOptions includes:

- asOfTimestamp?
- asOfEntryId?

Challenge 2c-1 uses `asOfEntryId`.

Semantics:
The balance as of entry E includes postings belonging to E and all earlier ledger history, but excludes postings from entries posted afterward.

Do NOT compare UUID strings lexicographically.
UUID order is not chronological order.

Determine a stable ledger ordering using the current schema, such as:
- posting/entry sequence;
- insertion sequence;
- exact created_at + deterministic tie breaker.

For asOfEntryId:
1. Resolve that entry to its ledger cutoff.
2. Include rows up to that cutoff.
3. Exclude later rows.

The visible challenge expects:
entry1 +100
entry2 +50

asOf(entry1) => +100
current => +150

If the entry ID does not exist:
- follow current test/domain error policy;
- do not silently treat it as "current".

============================================================
U. deriveBalance() — AS-OF TIMESTAMP
============================================================

The interface also exposes `asOfTimestamp`.

Even if the visible reference Challenge 02 primarily tests asOfEntryId, implement timestamp support correctly because controller exposes query `asOf`.

Read current schema timestamp format.

Use DB comparison if timestamps are stored in safely sortable ISO format, or resolve appropriately.

Boundary:
"As of timestamp T" should include/exclude entries according to the existing API contract. Inspect tests/callers. Do not guess if there is an existing assertion.

If both asOfTimestamp and asOfEntryId are supplied:
- inspect current intended behavior;
- apply the narrowest/correct contract;
- do not silently create contradictory semantics.

If there is no current combined-option specification, preserve a deterministic simple policy and document it.

============================================================
V. trialBalance()
============================================================

Implement:

trialBalance(db): Promise<Map<string, bigint>>

Required:
- aggregate ALL ledger postings across ALL accounts;
- group by asset;
- exact bigint sum.

For a correct double-entry ledger each asset should total 0n.

Return a Map containing touched assets and their total.

Do not return only USD.
Do not assume the five registry assets have rows.
Do not hide a nonzero imbalance by forcing values to zero.

Use DB strings -> BigInt.

The controller determines:

balanced = every(sum === 0n)

and serializes byAsset values as strings.

============================================================
W. statementPage() — STABLE KEYSET PAGINATION
============================================================

Implement:

statementPage(db, accountId, limit, cursor?)

Returns:

{
  postings: PostingRow[],
  nextCursor: string | null
}

Challenge 2c-2 requires that repeatedly following nextCursor yields every posting for the account exactly once.

Use deterministic keyset pagination.

The `PostingRow` reference includes numeric `seq`. This is a natural cursor if current schema confirms it.

Recommended pattern if seq is monotonic:

1. Sanitize/interpret cursor according to current contract.
2. Query rows for account_id.
3. Apply:
   seq > cursorSeq
   when cursor exists.
4. ORDER BY seq ASC.
5. Fetch `limit + 1`.
6. Return first `limit`.
7. If extra row exists:
   nextCursor = sequence of LAST RETURNED row.
8. Otherwise:
   nextCursor = null.

Alternative descending order is acceptable only if consistent and current UI/tests permit it. Prefer current intended order.

Do not use OFFSET pagination for a cursor API unless the current contract explicitly encodes offset. Keyset is safer and avoids duplicates under append-only writes.

CRITICAL:
- cursor must advance;
- final page must return null;
- no posting repeated;
- no posting skipped;
- only postings for requested account.

============================================================
X. STATEMENT CURSOR VALIDATION
============================================================

The controller currently may pass a string cursor.

Repository must not generate SQL injection or uncontrolled errors from malformed cursors.

If cursor is encoded numeric seq:
- validate digits;
- convert safely to an appropriate integer range/type;
- invalid cursor should follow existing request-error contract, not raw SQL.

If current project uses an opaque encoded cursor:
- preserve that format.

Do not include secret state in cursor.

Do not use posting UUID lexical ordering when a stable seq exists.

============================================================
Y. STATEMENT PAGE LIMIT
============================================================

Controller currently applies a default/cap.

Repository should still behave sensibly:
- limit > 0;
- no infinite loop;
- no negative SQL limit.

Do not silently fetch the entire ledger when limit is invalid.

If controller guarantees the range, repository can retain a simple defensive clamp only if it does not conflict with tests.

============================================================
Z. APPEND-ONLY INVARIANT
============================================================

Task 10 ledger history must be append-only at application level.

Allowed:
- INSERT new entries;
- INSERT new postings;
- reversal as INSERT of compensating entry.

Not allowed:
- UPDATE prior posting amount;
- DELETE prior posting for business reversal;
- rewrite original entry ID;
- recalculate history destructively.

Do not add mutable cache state as the source of ledger truth.

============================================================
AA. ATOMICITY / TRANSACTION RULES
============================================================

Use Knex transactions for write groups.

`postEntry`:
- entry + all postings commit together.

`reverseEntry`:
- original read + reversal insert should be transactionally coherent.

Later Task 13 settlement will use ledger work inside a larger transaction, so `insertBalancedEntry(executor, ...)` must remain reusable with a transaction executor.

Do not call global `db` from inside a helper that accepts an executor.

Avoid nested transactions when the caller already supplied a transaction.

============================================================
AB. CONTROLLER INTEGRATION REVIEW
============================================================

`src/controller/ledgerController.ts` in the reference is already wired to:

- create account;
- create entry;
- reverse;
- get balance;
- statement;
- trial balance.

For Task 10, prefer implementing domain/repository stubs rather than rewriting controller logic.

Verify controller behavior:

POST /api/ledger/entries
- valid -> 201 `{ data: { id }, meta: {} }`
- unbalanced -> 422 `ENTRY_NOT_BALANCED`

GET /api/ledger/accounts/:accountId/balance?asset=USD
- amount serialized string

POST /api/ledger/entries/:entryId/reverse
- 201 with new id

GET /api/ledger/trial-balance
- `data.byAsset`
- `data.balanced`

GET /api/ledger/accounts/:accountId/statement
- array of postings
- `meta.nextCursor`
- `meta.hasMore`

Only edit controller if the CURRENT tests reveal an actual integration defect not solved by the repository.

Preserve Task 8 account validation and Task 9 input/security fixes.

============================================================
AC. ACCOUNT EXISTENCE / FOREIGN KEY BEHAVIOR
============================================================

Read current schema.

Posting to nonexistent accounts should not create phantom accounts.

Prefer existing FK/integrity mechanisms.

If FK enforcement is not reliable in the current test DB and current contract expects validation:
- validate account existence transactionally.

Do not special-case test UUIDs.

Challenge 02 opens accounts through the API before posting; do not add unnecessary expensive queries solely for visible fixtures.

============================================================
AD. LARGE INTEGER / EXACTNESS REVIEW
============================================================

All ledger values must survive beyond Number.MAX_SAFE_INTEGER.

Even if Challenge 02's generated magnitudes are smaller, later tasks rely on exactness.

Never write:

Number(row.amount)
parseInt(row.amount)
parseFloat(row.amount)

for money.

Use:

BigInt(row.amount)

Use `.toString()` for DB/JSON serialization.

Trial balance and deriveBalance must remain exact.

============================================================
AE. OPTIONAL PARTICIPANT-OWNED TESTS
============================================================

Do not edit organizer tests.

Only if useful, add:

tests/task10-ledger-extra.test.ts

Useful cases:

1. `assertBalanced`:
   - independent USD/EUR balance;
   - cross-asset offset rejected;
   - error imbalances contain only nonzero assets.

2. `reversePostings`:
   - exact negation;
   - input array/objects unchanged.

3. large bigint:
   - >2^53 posting round-trip.

4. reversal:
   - original rows still exist unchanged;
   - reversal has different entry ID;
   - reversal restores balance.

5. as-of:
   - later reversal not included before cutoff;
   - same asset/account exactness.

6. pagination:
   - 0/1/multiple pages;
   - no duplicates;
   - final cursor null;
   - account isolation.

7. transaction rollback:
   - induced insert failure produces no partial entry/postings, only if safely testable without modifying organizer schema.

Keep custom tests fast.

Do not add test-only production APIs.

============================================================
AF. EXPECTED TASK 10 FILE SCOPE
============================================================

Primary:

- src/domain/ledger.ts
- src/repositories/ledgerRepository.ts

Verification-first, edit only if current tests require:

- src/controller/ledgerController.ts
- src/routes/ledgerRoutes.ts

Create:

- docs/clearhouse-task-10-ledger.md

Optional:

- tests/task10-ledger-extra.test.ts

Schema/migration:
- inspect;
- edit only if absolutely required by current test contract and explain why.

Do not modify:
- package dependencies;
- unrelated matching/risk/settlement services;
- protected tests/config.

============================================================
AG. IMPLEMENTATION QUALITY
============================================================

Maintain strict TypeScript.

Avoid:
- any;
- @ts-ignore;
- non-null assertions hiding missing rows;
- Number conversion for amounts;
- SQL string concatenation;
- duplicated posting-insert logic;
- swallowing errors;
- broad catch returning fake success;
- mutable in-memory running balances.

Prefer:
- Map<string, bigint>;
- parameterized Knex queries;
- transaction executor reuse;
- deterministic `seq` ordering;
- small mapping helpers:
  PostingRow -> PostingInput
  PostingInput -> insert row

No unnecessary abstractions during a nine-hour challenge.

============================================================
AH. REQUIRED VERIFICATION AFTER IMPLEMENTATION
============================================================

Run:

npm run typecheck

Then full Challenge 02:

npm test challenge02.test.ts

Expected historical reference structure:
- Challenge 2a: 4 tests
- Challenge 2b: 2 tests
- Challenge 2c: 2 tests

Reference total: 8 tests.

Use actual current output if changed.

Do not claim the challenge's point score from test count.

If optional test exists:

npm test task10-ledger-extra.test.ts

============================================================
AI. FOUNDATION REGRESSION
============================================================

After Challenge 02 passes:

npm test challenge01.test.ts

Then earlier bug/security milestones:

npm test challenge00.test.ts
npm test challenge00b.test.ts
npm test challenge00c.test.ts

Run sanity:

npm test _sanity.test.ts

Then full suite:

npm test

Later features are still expected to fail until future tasks.

Do not implement Challenge 03+ just to make the full suite green.

If Challenge 02 caused a regression:
- diagnose;
- fix;
- rerun affected focused test;
- then rerun Challenge 02.

============================================================
AJ. TEST REPORTING
============================================================

For every run record:

- command;
- exit code;
- executed;
- passed;
- failed;
- skipped/not-exercised;
- failure reason.

For fast-check:
- record seed;
- path;
- counterexample.

Filtered-out tests are not passed.

Do not edit test-results.xml.

If a test hangs:
- inspect transaction lifecycle;
- missing awaited promise;
- DB lock;
- server handle;
- cursor non-advancement.

Do not increase protected timeout or force exit.

============================================================
AK. TASK 10 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-10-ledger.md

Include:

1. Starting commit.
2. Working branch `task-10`.
3. Official final branch `master`.
4. Pre-existing dirty/staged state preserved.
5. Current Challenge 02 test groups/count discovered.
6. Current scoring configuration note without claiming earned score.
7. Schema/table/index layout used.
8. `isDebitNormal` mapping.
9. `assertBalanced` algorithm.
10. Multi-asset invariant.
11. `reversePostings` behavior.
12. `insertBalancedEntry` transaction/executor design.
13. `postEntry` transaction boundary.
14. Unbalanced rollback behavior.
15. Reversal design and append-only guarantee.
16. `deriveBalance` exact BigInt accumulation.
17. As-of-entry ordering/cutoff design.
18. As-of-timestamp behavior.
19. `trialBalance` aggregation.
20. Statement pagination ordering/cursor design.
21. Cursor validation.
22. Exact changed files.
23. Typecheck result.
24. Challenge 02 result.
25. Participant-test result if any.
26. Challenge 01 regression.
27. bug-hunt/sanity regressions.
28. full-suite status.
29. Remaining later challenges.
30. Confirmation organizer files untouched.
31. Suggested commit message.
32. Exact `master` merge/push workflow.
33. Next planned task: Task 11 holds/releases.

No secrets, tokens, .env values, credentials, or huge logs.

============================================================
AL. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat

Review:

git diff -- src/domain/ledger.ts
git diff -- src/repositories/ledgerRepository.ts
git diff -- src/controller/ledgerController.ts
git diff -- src/routes/ledgerRoutes.ts
git diff -- docs/clearhouse-task-10-ledger.md

If custom test exists:

git diff -- tests/task10-ledger-extra.test.ts

If a migration was changed, review that exact file separately and justify it.

Confirm:
- tests/ organizer files unchanged;
- config/ unchanged;
- vitest config unchanged;
- package test script unchanged;
- no test-detection code;
- no floating-point money;
- no destructive ledger updates/deletes;
- no unrelated refactor;
- previous task behavior preserved.

============================================================
AM. TASK 10 COMPLETION CRITERIA
============================================================

Task 10 is COMPLETE only when:

[ ] Current Challenge 02 tests were read fully.
[ ] `isDebitNormal` implemented correctly.
[ ] `assertBalanced` uses exact per-asset bigint sums.
[ ] Cross-asset netting cannot fake balance.
[ ] `reversePostings` returns exact negated copies.
[ ] `insertBalancedEntry` implemented.
[ ] Supplied transaction executor is actually used.
[ ] `postEntry` is atomic.
[ ] Unbalanced entries write nothing.
[ ] Multi-asset balanced entries succeed.
[ ] Property-generated posting sets remain exact.
[ ] `reverseEntry` creates a compensating entry.
[ ] Original ledger history remains unchanged.
[ ] Reversal restores prior balance.
[ ] `deriveBalance` derives from postings.
[ ] Missing posting set returns 0n.
[ ] No Number conversion for posting amounts.
[ ] asOfEntry excludes later entries.
[ ] UUID lexical order is NOT used as time order.
[ ] asOfTimestamp supported per current contract.
[ ] `trialBalance` groups exactly by asset.
[ ] `statementPage` uses deterministic advancing cursor.
[ ] No statement duplicate/skip across pages.
[ ] Final page has null nextCursor.
[ ] Typecheck passes.
[ ] Full Challenge 02 passes.
[ ] Challenge 01 regression recorded.
[ ] Bug-hunt regressions recorded.
[ ] Sanity recorded.
[ ] Full-suite status recorded honestly.
[ ] Protected files unchanged.
[ ] Task 10 note created.
[ ] Final Git instructions target `master`.

If any gate remains broken:
- report Task 10 PARTIAL;
- identify exact failure;
- do not fake completion.

============================================================
AN. FINAL CURSOR RESPONSE
============================================================

Return concise results:

1. Task 10 status: COMPLETE/PARTIAL.
2. Starting commit.
3. Branch.
4. Files changed.
5. Domain functions implemented.
6. Repository functions implemented.
7. Schema assumptions confirmed.
8. Balance/per-asset strategy.
9. Reversal strategy.
10. As-of strategy.
11. Pagination cursor strategy.
12. Typecheck result.
13. Challenge 02 exact test result.
14. Challenge 01 regression result.
15. Challenge00/00b/00c + sanity result.
16. Full-suite result.
17. Remaining later challenges.
18. Confirmation protected files unchanged.
19. Copyable Git commands targeting MASTER.

Suggested commit:

feat: implement double-entry ledger core

Do NOT automatically merge or push.
````

---

# Task 10 reference acceptance matrix

| Requirement | Required behavior |
|---|---|
| Balanced entry | Accepted and atomically inserted |
| Unbalanced entry | `422`; no posting written |
| Multi-asset | Every asset independently sums to `0n` |
| Amount arithmetic | BigInt only |
| Balance | Derived from immutable postings |
| Reversal | New entry with exact negated postings |
| Original history | Never modified/deleted |
| Trial balance | Per-asset global sum |
| As-of entry | Includes cutoff entry, excludes later history |
| Statement | Stable account-specific pagination |
| Cursor | Advances; no duplicates/skips; final `null` |
| DB writes | Transactional |
| Executor helper | Uses caller-supplied Knex/transaction |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 10

The organisers require final changes on **`master`**.

Workflow:

**`master` → `task-10` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Confirm Task 10 working branch

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
task-10
```

Final branch:

```text
master
```

---

## 2. Run Task 10 verification

```powershell
npm run typecheck
npm test challenge02.test.ts
git diff --check
```

If custom tests were created:

```powershell
npm test task10-ledger-extra.test.ts
```

Regression checks:

```powershell
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test challenge00b.test.ts
npm test challenge00c.test.ts
npm test _sanity.test.ts
```

Milestone full suite:

```powershell
npm test
```

Record real failures from future unimplemented challenges.

---

## 3. Review source changes

```powershell
git status --short
git diff --stat

git diff -- src/domain/ledger.ts
git diff -- src/repositories/ledgerRepository.ts
git diff -- src/controller/ledgerController.ts
git diff -- src/routes/ledgerRoutes.ts
git diff -- docs/clearhouse-task-10-ledger.md
```

If custom test:

```powershell
git diff -- tests/task10-ledger-extra.test.ts
```

If any migration changed:

```powershell
git diff -- <actual-migration-path>
```

Do not continue until you confirm organizer tests/config are untouched.

---

## 4. Stage only Task 10 files

Always stage the actual files that changed.

Expected primary staging:

```powershell
git add -- src/domain/ledger.ts
git add -- src/repositories/ledgerRepository.ts
git add -- docs/clearhouse-task-10-ledger.md
```

Only if actually edited:

```powershell
git add -- src/controller/ledgerController.ts
git add -- src/routes/ledgerRoutes.ts
```

Only if created:

```powershell
git add -- tests/task10-ledger-extra.test.ts
```

Only if a migration legitimately changed:

```powershell
git add -- <actual-migration-path>
```

If an edited file also contains unrelated work:

```powershell
git add -p -- <file-path>
```

Avoid:

```text
git add .
```

when the checkout contains unrelated/protected modifications.

---

## 5. Inspect staged Task 10 content

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
```

Review:

```powershell
git diff --cached -- src/domain/ledger.ts src/repositories/ledgerRepository.ts docs/clearhouse-task-10-ledger.md
```

If other legitimate files were staged, review them individually.

Stop if:
- tests/challenge*.test.ts appears;
- config appears;
- secrets appear;
- unrelated files appear.

---

## 6. Commit Task 10 on `task-10`

```powershell
git commit -m "feat: implement double-entry ledger core"
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

Inspect:

```powershell
git log --oneline --left-right master...origin/master
```

If local master is only behind:

```powershell
git pull --ff-only origin master
```

Do not reset or force if history diverged.

---

## 8. Merge Task 10 into `master`

Prefer:

```powershell
git merge --ff-only task-10
```

If fast-forward is impossible, inspect:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If valid histories diverged and a normal merge is appropriate:

```powershell
git merge task-10
```

Resolve conflicts carefully.

Never use force/reset simply to avoid resolving real history.

---

## 9. Re-test merged `master`

```powershell
git branch --show-current
```

Must show:

```text
master
```

Run:

```powershell
npm run typecheck
npm test challenge02.test.ts
git diff --check
git status -sb
```

Recommended regressions if time allows:

```powershell
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts
```

---

## 10. Push official final branch

```powershell
git push origin master
```

Do **not** substitute `main` for final submission.

Do not force-push.

---

## 11. Verify remote delivery

Local:

```powershell
git rev-parse HEAD
```

Remote:

```powershell
git ls-remote origin refs/heads/master
```

The hashes should match.

Then:

```powershell
git status -sb
```

Expected synchronized state conceptually:

```text
## master...origin/master
```

---

# If `git push origin master` is rejected

Do not force-push.

Run:

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

Inspect remote changes.

If a rebase is safe because your unpublished Task 10 commit is local-only:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge02.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

If conflicts exist, resolve deliberately and rerun Challenge 02.

---

# Fast Task 10 checklist

- [ ] Final branch confirmed as `master`
- [ ] Work branch `task-10`
- [ ] `tests/challenge02.test.ts` read completely
- [ ] Current schema/migrations inspected
- [ ] `isDebitNormal` implemented
- [ ] `assertBalanced` per asset
- [ ] `reversePostings` implemented
- [ ] `insertBalancedEntry` implemented
- [ ] caller executor preserved
- [ ] `postEntry` atomic
- [ ] unbalanced write rollback guaranteed
- [ ] multi-asset balancing correct
- [ ] no Number conversion for money
- [ ] `reverseEntry` compensating/append-only
- [ ] original history untouched
- [ ] `deriveBalance` exact
- [ ] asOfEntry correct
- [ ] no UUID lexical chronology
- [ ] trial balance per asset
- [ ] statement cursor stable
- [ ] every posting exactly once across pages
- [ ] final nextCursor null
- [ ] typecheck passes
- [ ] Challenge 02 passes
- [ ] Challenge 01 regression recorded
- [ ] bug/sanity regression recorded
- [ ] full suite recorded honestly
- [ ] organizer files untouched
- [ ] Task 10 note created
- [ ] Task 10 committed
- [ ] merged to `master`
- [ ] `git push origin master`
- [ ] local HEAD matches remote master

**Next planned task:** Task 11 — Holds and Releases.
