# ClearHouse — Complete Enhanced Cursor Prompt for Task 12

**Task:** Challenge 04b — Deposits, Withdrawals, and Idempotent Mutations  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-12`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 12 purpose

Task 12 implements the **idempotent deposit and withdrawal mutations** in Challenge 04b.

The current reference Challenge 04b requirements are:

- **4b-1 — Deposit replay**
  - replaying a deposit with the same `Idempotency-Key` and same request body applies it exactly once;
  - repeated response represents the original successful result.

- **4b-2 — Idempotency conflict**
  - the same `Idempotency-Key` reused with a different request body must not silently apply another mutation;
  - it must return/raise an idempotency conflict.

- **4b-3 — Withdrawal**
  - withdrawal is idempotent;
  - withdrawal may consume only `available`;
  - held funds are not withdrawable;
  - insufficient available funds must reject without modifying the balance.

Challenge 04 overall is **200 points**. The visible Challenge 4b items account for **40 points** in the supplied challenge description. Treat these as available challenge points, not earned points.

---

# Established task boundaries

- **Task 10:** Double-Entry Ledger.
- **Task 11:** Holds / Releases.
- **Task 12:** Deposits / Withdrawals / Idempotent balance mutations.
- **Task 13:** Atomic trade settlement.

Task 12 must **not** implement `settleTrade()`.

Task 12 should reuse work already completed in previous tasks:

### From Task 8

- exact `readBalance()`
- exact `writeBalance()`
- `withIdempotency()`
- request-body conflict detection
- concurrent same-key single-flight behavior
- idempotency persistence
- `IdempotencyConflictError`

### From Task 11

- correct transaction-aware balance mutation patterns
- `InsufficientAvailableError`
- hold/release behavior
- exact `available` / `held` preservation

The current CodeCommit checkout remains authoritative.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 12

Copy this entire block into Cursor Agent mode.

````text
Act as my senior TypeScript fintech backend engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 12 ONLY: implement Challenge 04b — idempotent deposits and withdrawals — using the existing balance and idempotency infrastructure. Preserve Tasks 1–11, do not implement atomic trade settlement, run the required organizer tests and regressions, document the implementation, and prepare reviewed Git commands targeting the official master branch.

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

task-12

Historical reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Important:
- current CodeCommit checkout is authoritative;
- never reset to the historical GitHub commit;
- do not replace origin;
- do not clone over the repository;
- preserve verified Tasks 1–11;
- develop on task-12;
- final reviewed work later merges into master;
- final submission push is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT ORGANIZER / CHANGE-SCOPE RULES
============================================================

Do NOT modify any existing test file.

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

Do NOT add new test files for Task 12.

Do NOT alter:
- test timeouts;
- test discovery;
- assertions;
- fast-check generators/seeds;
- TypeScript strictness.

Do NOT add production behavior detecting:
- NODE_ENV === "test";
- VITEST;
- test filenames;
- fixture values;
- known idempotency keys;
- known account IDs.

Do NOT use:
- Number()
- parseInt()
- parseFloat()
- floating point
for money.

Do NOT use:
- git reset --hard
- git clean -fd
- git push --force
- history rewriting
- blind branch deletion

Do NOT implement future challenge areas:
- settleTrade / Challenge 4c;
- matching engine;
- risk;
- account closure;
- fees;
- netting;
- WebSockets;
- dashboard;
- event sourcing.

Do not modify tests to make them pass.

============================================================
C. PRE-FLIGHT — VERIFY MASTER / TASK 12 BRANCH
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
- official remote is origin;
- final submission branch is master.

Check that Task 11 is already merged into master:

git log --oneline --decorate --max-count=15 master

If task-11 exists:

git log --oneline --decorate --max-count=10 task-11

If valid Task 11 work is not yet on master:
- do not discard it;
- report the situation;
- base Task 12 only on the latest valid verified state.

If master is correct:

git switch master
git pull --ff-only origin master
git switch -c task-12

If task-12 already exists:

git branch --list task-12
git log --oneline --decorate --max-count=10 task-12

Do not delete/recreate blindly.

Record:
- starting commit;
- current branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
D. VERIFY TASK 8 / TASK 11 DEPENDENCIES
============================================================

Inspect:

- docs/clearhouse-task-08-account-idempotency.md
- docs/clearhouse-task-11-holds-releases.md

if present.

Verify actual source implementations rather than trusting notes.

Task 8 prerequisites:

- readBalance() must preserve exact bigint values;
- writeBalance() must write both available and held;
- withIdempotency() must:
  - replay same key + same body;
  - reject same key + different body;
  - execute concurrent same-key same-body operation exactly once;
  - clean in-flight state correctly.

Task 11 prerequisites:

- InsufficientAvailableError exists;
- hold/release balance logic works;
- writeBalance remains transaction-compatible.

Run:

npm run typecheck

If current source is unchanged after Task 11 and recent evidence is available, still rerun relevant checks before Task 12 completion.

============================================================
E. READ THE EXACT TASK 12 CONTRACT
============================================================

Read completely:

- tests/challenge04.test.ts
- src/repositories/settlementRepository.ts
- src/controller/settlementController.ts
- src/routes/settlementRoutes.ts
- src/domain/settlement.ts

Also inspect:

- idempotency table schema in existing migration;
- account_balances schema;
- accountsRepository.ts;
- Task 8 idempotency helper implementation;
- Task 11 hold/release implementation;
- all usages of deposit() and withdraw().

Search:

rg -n "deposit\(|withdraw\(|withIdempotency|IdempotencyConflictError|idempotent_requests|readBalance|writeBalance|InsufficientAvailableError|Idempotency-Key" src tests

PowerShell fallback:

Get-ChildItem -Recurse src,tests -File |
  Select-String -Pattern "deposit\(|withdraw\(|withIdempotency|IdempotencyConflictError|idempotent_requests|readBalance|writeBalance|InsufficientAvailableError|Idempotency-Key"

Build a compact mapping:

4b requirement
| source function
| transaction
| idempotency body
| success state
| failure state

============================================================
F. BEFORE BASELINE
============================================================

Run:

npm run typecheck

Run:

npm test challenge04.test.ts -t "Challenge 4b"

Record:
- exit code;
- exact executed count;
- pass/fail;
- root causes.

Reference Challenge 4b contains 3 tests.

Do not treat Challenge 4c as part of Task 12.

Also run:

npm test challenge04.test.ts -t "Challenge 4a"

Task 12 should now remove the deposit dependency that previously blocked Task 11's official 4a verification.

Record the actual result.

============================================================
G. DEPOSIT SEMANTICS
============================================================

Implement the existing deposit() signature in:

src/repositories/settlementRepository.ts

Use the current signature exactly.

Required behavior:

deposit adds amount to AVAILABLE only.

If current balance is:

{
  available: A,
  held: H
}

after deposit X:

{
  available: A + X,
  held: H
}

Therefore:

total increases by X.

Do not change held.

Do not:
- route deposits into held;
- overwrite available with amount;
- zero held;
- use Number money arithmetic.

Use bigint only.

============================================================
H. DEPOSIT MUST BE IDEMPOTENT
============================================================

Every mutation must use the existing `withIdempotency()` infrastructure.

For a deposit request:

- first request executes the balance change once;
- same key + same request body returns the original result;
- balance is not changed again;
- same key + different request body conflicts.

Do not implement a second ad-hoc idempotency mechanism.

Do not keep deposit idempotency only in memory.

Use the existing durable `idempotent_requests` storage and Task 8's single-flight logic.

============================================================
I. IDEMPOTENCY BODY MUST REPRESENT THE MUTATION
============================================================

The body hashed/passed to `withIdempotency()` must uniquely represent the requested mutation.

At minimum, current mutation identity must include the values necessary to distinguish:

- operation kind;
- accountId;
- asset;
- amount.

If current established helper/controller already passes a complete request body, preserve that design.

Do NOT allow the following under one key to be considered the same mutation:

- deposit 100 vs deposit 200;
- USD vs BTC;
- account A vs account B;
- deposit vs withdrawal.

Read current Task 8 implementation and tests before changing hash semantics.

Do not redesign canonical JSON unless current contract requires it.

============================================================
J. DEPOSIT TRANSACTION BOUNDARY
============================================================

Deposit must be atomic with its idempotency record.

Required high-level flow:

withIdempotency(
  db,
  key,
  mutationBody,
  async (trx) => {
    // use trx
    // validate account state if current architecture requires
    const current = await readBalance(trx, accountId, asset)
    const next = {
      available: current.available + amount,
      held: current.held
    }
    await writeBalance(trx, accountId, asset, next)
    return serializable result
  }
)

Use the exact current `withIdempotency` signature.

Critical:
- balance write and idempotent result must participate in one coherent transaction;
- if operation fails, do not persist a successful idempotency replay;
- retries after a failed operation follow current Task 8 semantics.

Do not start an unnecessary nested independent transaction inside the operation callback.

============================================================
K. IDEMPOTENCY RESULT MUST BE JSON-SERIALIZABLE
============================================================

BigInt cannot be directly JSON.stringify()'d.

If `withIdempotency` persists `response_json`, do not return an object containing raw bigint values unless the helper explicitly supports them.

Use the current repository/controller contract.

If the mutation result stored by Task 8 is expected to contain balance values:
- convert bigint fields to decimal strings before persistence.

If repository deposit currently returns AccountBalance with bigint:
- inspect how withIdempotency stores/replays it;
- preserve consistent types without forcing JSON.stringify on bigint.

Use the smallest compatible design.

Do not change public API response types unnecessarily.

============================================================
L. REPLAY MUST RETURN THE ORIGINAL SUCCESSFUL RESULT
============================================================

If a deposit is:

available=0
deposit 100
=> result available=100

then another independent change happens later.

A replay of the original idempotency key should follow the established idempotency contract and return the original stored response, not recompute a new result.

Do not rerun operation() merely to generate response data.

============================================================
M. SAME KEY + DIFFERENT BODY => CONFLICT
============================================================

Task 8 should already implement:

same key + different body
=> IdempotencyConflictError

Task 12 must use it correctly.

Do not catch the conflict and apply the mutation anyway.

Controller should map it according to current established API error contract, likely an HTTP conflict status.

Read current controller and organizer assertions for exact:
- status;
- error code;
- details.

Do not invent a different code if one already exists.

============================================================
N. WITHDRAWAL SEMANTICS
============================================================

Implement the existing withdraw() signature.

Withdrawal consumes AVAILABLE only.

If current balance:

{
  available: A,
  held: H
}

and X <= A:

next:

{
  available: A - X,
  held: H
}

Total decreases by X.

Held is untouched.

Never use held funds to satisfy withdrawal.

============================================================
O. WITHDRAWAL — INSUFFICIENT AVAILABLE
============================================================

If:

amount > available

throw/use existing:

InsufficientAvailableError(accountId, asset)

Do not:

- release held automatically;
- consume available + held total;
- make available negative;
- clamp to zero;
- partially withdraw.

No balance write on failure.

The controller should produce the existing insufficient-available error response.

============================================================
P. WITHDRAWAL MUST BE IDEMPOTENT
============================================================

Withdrawal uses the same `withIdempotency()` mechanism.

Same key + same request:

- execute once;
- second attempt returns original response;
- available decreases only once.

Same key + different body:

- conflict;
- no new withdrawal effect.

Concurrent same-key duplicate withdrawals must not double-spend.

Reuse Task 8 single-flight logic.

Do not add a second mutex or new idempotency table.

============================================================
Q. WITHDRAWAL CANNOT TOUCH HELD
============================================================

Important Challenge 4b-3 invariant:

Example conceptually:

available = 50
held = 100

withdraw 75

MUST FAIL

even though total = 150.

Only available counts.

After failure:

available = 50
held = 100

unchanged.

A held amount represents reserved funds and is not withdrawable.

============================================================
R. POSITIVE AMOUNT VALIDATION
============================================================

Inspect current settlement controller parser.

Do not allow a negative direct bigint to invert deposit/withdraw semantics.

A negative deposit must not behave as withdrawal.
A negative withdrawal must not behave as deposit.

Use the project's current validation/error style.

Do not add a new public error format if Task 9 already standardized request errors.

If zero is currently accepted by organizer contract:
- preserve behavior unless tests say otherwise.

If the API requires positive amounts:
- enforce it consistently before repository mutation.

Read current tests instead of guessing.

============================================================
S. ACCOUNT STATUS / CLOSED ACCOUNT COMPATIBILITY
============================================================

Inspect current account mutation policy and Challenge 13 integration.

If deposit/withdraw is already expected to assert account open:
- call the existing account status helper inside the same idempotent transaction.

Do not reintroduce old Task 8 unknown-account behavior.

Do not implement account closure now.

Preserve current controller error handling.

============================================================
T. ACCOUNT / ASSET ISOLATION
============================================================

Deposit/withdraw must mutate only:

(accountId, asset)

Never alter:
- another account;
- another asset;
- held field except preserving it.

Use existing readBalance/writeBalance composite-key behavior.

============================================================
U. EXACT BIGINT REQUIREMENT
============================================================

No Number conversion.

Use:

BigInt(databaseString)

and:

amount.toString()

through existing helpers.

Deposit:

current.available + amount

Withdrawal:

current.available - amount

No floating point anywhere.

Preserve values larger than 2^53.

============================================================
V. CONCURRENT IDEMPOTENT REQUESTS
============================================================

Task 8 implemented concurrent same-key semantics.

Task 12 must not bypass them.

For concurrent duplicate deposit calls:

Promise.all([
  deposit(...same key/body...),
  deposit(...same key/body...),
  ...
])

the actual mutation must execute exactly once.

Same for withdraw.

Do not:
- mutate before entering withIdempotency;
- perform balance read outside the idempotent operation;
- perform operation first then try to record key afterward.

The idempotency wrapper must own the business effect.

============================================================
W. DIFFERENT IDEMPOTENCY KEYS ARE INDEPENDENT
============================================================

Different keys represent different mutation requests.

Two deposits:
- key-A amount 100
- key-B amount 100

should apply twice if both are valid.

Do not globally deduplicate based only on body hash.

Primary identity is idempotency key plus request-hash conflict semantics.

============================================================
X. IDEMPOTENCY KEY REQUIREMENT AT HTTP LAYER
============================================================

Inspect current controller/route contract for `Idempotency-Key`.

If organizer tests expect the header to be mandatory:
- preserve/implement that exact requirement;
- missing/blank key should return current standard request error.

Do not generate random idempotency keys server-side for missing client keys if the contract requires clients to provide them.

Do not normalize two distinct non-empty keys into one.

Do not leak the key in logs unnecessarily.

============================================================
Y. CONTROLLER INTEGRATION
============================================================

Prefer keeping current controller if already wired.

Verify deposit endpoint:

- parses accountId/asset/amount;
- extracts Idempotency-Key;
- calls repository deposit;
- returns standard JSON envelope;
- serializes balances as strings;
- does not expose bigint/raw error.

Verify withdrawal endpoint analogously.

Only edit `src/controller/settlementController.ts` if current organizer tests reveal an actual Task 12 integration defect.

Do not alter unrelated hold/release/settlement endpoints.

============================================================
Z. DO NOT IMPLEMENT LEDGER POSTINGS FOR DEPOSIT/WITHDRAW UNLESS CONTRACT REQUIRES IT
============================================================

Task 10 created the double-entry ledger.

However Challenge 4b visible requirements focus on balance mutation + idempotency.

Do not invent external cash/counterparty ledger postings for deposit/withdraw if the current tests/source contract does not require them.

If current code explicitly designs deposits/withdrawals to post ledger entries:
- follow the existing architecture/tests.

Otherwise keep Task 12 minimal and avoid creating unbalanced one-sided ledger entries.

Task 13 will integrate trade settlement with ledger.

============================================================
AA. KEEP TASK 11 HOLDS/RELEASES WORK INTACT
============================================================

After implementing deposit, official Challenge 4a should now be able to seed balances normally.

Do not rewrite hold/release logic unless Task 12 changes expose a real regression.

Deposit must preserve held.

Withdrawal must preserve held.

Task 11's concurrency and total-conservation behavior must remain correct.

============================================================
AB. EXPECTED TASK 12 FILE SCOPE
============================================================

Primary:

- src/repositories/settlementRepository.ts

Only if current Task 12 integration requires:

- src/controller/settlementController.ts

Possibly use existing:

- src/domain/settlement.ts

only for existing errors/validation and only if a tiny Task 12-specific domain correction is necessary.

Create/update:

- docs/clearhouse-task-12-deposit-withdraw-idempotency.md

Do NOT create new test files.

Do NOT edit:
- migrations;
- routes unless an actual current Task 12 route defect exists;
- package/config.

============================================================
AC. REQUIRED IMPLEMENTATION QUALITY
============================================================

Maintain strict TypeScript.

Avoid:
- any;
- @ts-ignore;
- duplicated idempotency code;
- duplicated SQL balance logic;
- Number money conversion;
- mutation outside transaction;
- swallowing conflicts;
- partial withdrawals;
- held-fund withdrawal;
- logging secrets/keys.

Prefer:
- Task 8 withIdempotency();
- Task 8 readBalance/writeBalance();
- existing domain errors;
- exact bigint;
- minimal repository changes.

============================================================
AD. POST-IMPLEMENTATION TEST SEQUENCE
============================================================

Run:

npm run typecheck

Task 12 official tests:

npm test challenge04.test.ts -t "Challenge 4b"

Reference expected:
- 3 tests.

Then verify Task 11 now fully through official tests:

npm test challenge04.test.ts -t "Challenge 4a"

Then run combined completed Challenge 04 sections:

npm test challenge04.test.ts -t "Challenge 4a|Challenge 4b"

Do NOT expect Challenge 4c to pass until Task 13.

Run Task 8 idempotency regressions:

npm test challenge00b.test.ts -t "Challenge 0m"

npm test challenge00c.test.ts -t "Challenge 0w"

If current labels differ, use actual current labels.

Then:

npm test challenge02.test.ts
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

Run:

git diff --check

Finally run:

npm test

Record remaining Task 13+ failures honestly.

============================================================
AE. TEST REPORTING RULES
============================================================

For each command report:

- exact command;
- exit code;
- executed;
- passed;
- failed;
- not exercised;
- root cause.

Filtered-out Challenge 4c is NOT passed.

Do not edit test-results.xml.

If an idempotency concurrency test hangs:
- inspect in-flight promise cleanup;
- transaction lifecycle;
- nested transactions;
- single-connection SQLite pool;
- unresolved promise.

Do not add sleep or increase organizer timeout.

============================================================
AF. TASK 12 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-12-deposit-withdraw-idempotency.md

Include:

1. Starting commit.
2. Current branch task-12.
3. Final branch master.
4. Existing dirty/staged state preserved.
5. Exact Challenge 4b organizer contract.
6. Files inspected.
7. Deposit state transition.
8. Withdrawal state transition.
9. Held-funds protection.
10. Idempotency wrapper reuse.
11. Request body used for idempotency identity.
12. Same-key replay semantics.
13. Different-body conflict semantics.
14. Concurrent same-key behavior.
15. Failure rollback semantics.
16. Exact BigInt handling.
17. Account/asset isolation.
18. Any account-open policy.
19. Exact files changed.
20. Typecheck result.
21. Challenge 4b result.
22. Challenge 4a regression/result.
23. Task 8 idempotency regression.
24. Challenge 02 regression.
25. Challenge 01 / challenge00 / sanity results.
26. Full-suite status.
27. Remaining Challenge 4c status.
28. Protected-file confirmation.
29. Suggested commit message.
30. master merge/push commands.
31. Next Task 13: atomic trade settlement.

Do not include secrets, tokens, credentials, or `.env` values.

============================================================
AG. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat

Review:

git diff -- src/repositories/settlementRepository.ts
git diff -- src/controller/settlementController.ts
git diff -- src/domain/settlement.ts
git diff -- docs/clearhouse-task-12-deposit-withdraw-idempotency.md

Confirm:

- no existing test file changed;
- no new test file added;
- config unchanged;
- package.json unchanged;
- package-lock unchanged;
- migrations unchanged;
- knexfile unchanged;
- tsconfig/vitest unchanged;
- .env/.gitignore unchanged;
- no test detection;
- no Number money conversion;
- no settleTrade implementation;
- hold/release remains intact;
- ledger remains intact.

============================================================
AH. TASK 12 COMPLETION CRITERIA
============================================================

Task 12 is COMPLETE only when:

[ ] Challenge 4b read completely.
[ ] deposit() implemented.
[ ] deposit increases available only.
[ ] deposit preserves held.
[ ] deposit uses withIdempotency.
[ ] same-key/same-body deposit applies once.
[ ] replay does not execute mutation again.
[ ] same key + different deposit body conflicts.
[ ] withdraw() implemented.
[ ] withdrawal decreases available only.
[ ] withdrawal preserves held.
[ ] withdrawal cannot use held funds.
[ ] insufficient available rejects without write.
[ ] withdrawal uses withIdempotency.
[ ] duplicate withdrawal applies once.
[ ] concurrent same-key mutations execute once.
[ ] different idempotency keys remain independent.
[ ] exact BigInt only.
[ ] Task 11 Challenge 4a now passes or any real failure is explained.
[ ] Challenge 4b passes.
[ ] Task 8 idempotency regressions pass.
[ ] Challenge 02 remains healthy.
[ ] Challenge 01 remains healthy.
[ ] typecheck passes.
[ ] sanity recorded.
[ ] full-suite result recorded honestly.
[ ] Challenge 4c remains outside this task.
[ ] no existing tests modified.
[ ] no new tests added.
[ ] no package/config/migration changes.
[ ] Task 12 note created.
[ ] final Git target is master.

If any core Task 12 requirement still fails:
- status = PARTIAL;
- name the exact blocker.

Never claim a test passed if it was not run.

============================================================
AI. FINAL CURSOR REPORT
============================================================

Return:

1. Task 12 status: COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact changed files.
5. Deposit implementation summary.
6. Withdrawal implementation summary.
7. Idempotency strategy reused.
8. Same-key replay behavior.
9. Different-body conflict behavior.
10. Held-funds protection.
11. Typecheck result.
12. Challenge 4b result.
13. Challenge 4a result.
14. Task 8 idempotency regression result.
15. Challenge 02 / Challenge 01 / sanity results.
16. Full-suite result.
17. Remaining Challenge 4c status.
18. Confirmation tests/config/package/migrations unchanged.
19. Final diff summary.
20. Reviewed Git commands targeting master.

Suggested commit:

feat: implement idempotent deposits and withdrawals

Do not commit or push automatically.
````

---

# Task 12 reference acceptance matrix

| Requirement | Expected behavior |
|---|---|
| Deposit | increases `available` only |
| Deposit held | unchanged |
| Same deposit key/body replay | effect exactly once |
| Same key/different body | idempotency conflict |
| Withdrawal | decreases `available` only |
| Withdrawal held | unchanged |
| Held funds | cannot satisfy withdrawal |
| Insufficient withdrawal | reject; no balance mutation |
| Concurrent same-key mutations | business operation once |
| Different keys | independent effects |
| Money | exact BigInt |
| Task 11 | hold/release preserved |
| Task 13 | `settleTrade` remains outside scope |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 12

The organisers require final changes on **`master`**.

Workflow:

**`master` → `task-12` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify the Task 12 branch

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
task-12
```

Final submission branch:

```text
master
```

---

## 2. Run final Task 12 verification

```powershell
npm run typecheck

npm test challenge04.test.ts -t "Challenge 4b"

npm test challenge04.test.ts -t "Challenge 4a"

npm test challenge04.test.ts -t "Challenge 4a|Challenge 4b"

npm test challenge00b.test.ts -t "Challenge 0m"

npm test challenge00c.test.ts -t "Challenge 0w"

npm test challenge02.test.ts
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts

git diff --check
```

Run milestone suite:

```powershell
npm test
```

Challenge 4c may still fail because Task 13 is not implemented yet.

---

## 3. Review Task 12 changes

```powershell
git status --short
git diff --stat

git diff -- src/repositories/settlementRepository.ts
git diff -- src/controller/settlementController.ts
git diff -- src/domain/settlement.ts
git diff -- docs/clearhouse-task-12-deposit-withdraw-idempotency.md
```

Confirm no protected files changed.

---

## 4. Stage only Task 12 files

Primary expected:

```powershell
git add -- src/repositories/settlementRepository.ts
git add -- docs/clearhouse-task-12-deposit-withdraw-idempotency.md
```

Only if actually changed and required:

```powershell
git add -- src/controller/settlementController.ts
git add -- src/domain/settlement.ts
```

If an intended file contains unrelated edits:

```powershell
git add -p -- <file-path>
```

Do not use `git add .` when unrelated changes exist.

---

## 5. Review staged content

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
```

Review:

```powershell
git diff --cached -- src/repositories/settlementRepository.ts docs/clearhouse-task-12-deposit-withdraw-idempotency.md
```

Review controller/domain individually if staged.

Stop if you see:
- tests/
- config/
- migrations/
- package.json
- package-lock.json
- .env
- .gitignore
- tsconfig
- vitest config
- unrelated files.

---

## 6. Commit Task 12

```powershell
git commit -m "feat: implement idempotent deposits and withdrawals"
```

Verify:

```powershell
git show --stat --oneline HEAD
git status -sb
```

---

## 7. Switch to official final branch

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

---

## 8. Merge Task 12 into master

Prefer:

```powershell
git merge --ff-only task-12
```

If it fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If valid histories diverged:

```powershell
git merge task-12
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

Then:

```powershell
npm run typecheck
npm test challenge04.test.ts -t "Challenge 4a|Challenge 4b"
npm test challenge00c.test.ts -t "Challenge 0w"
npm test challenge02.test.ts
git diff --check
git status -sb
```

---

## 10. Push official submission branch

```powershell
git push origin master
```

Do not push `main` as the final submission.

Do not force-push.

---

## 11. Verify remote master

```powershell
git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

Local HEAD and remote `refs/heads/master` should match.

---

# If push is rejected

Do not force-push.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If safe for your local-only Task 12 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge04.test.ts -t "Challenge 4a|Challenge 4b"
npm test challenge00c.test.ts -t "Challenge 0w"
git diff --check
```

Then:

```powershell
git push origin master
```

---

# Fast Task 12 checklist

- [ ] working on `task-12`
- [ ] final branch confirmed `master`
- [ ] Challenge 4b read fully
- [ ] deposit implemented
- [ ] deposit changes available only
- [ ] deposit preserves held
- [ ] deposit idempotent
- [ ] duplicate same key/body executes once
- [ ] same key/different body conflicts
- [ ] withdrawal implemented
- [ ] withdrawal changes available only
- [ ] withdrawal preserves held
- [ ] held cannot fund withdrawal
- [ ] insufficient withdrawal leaves state unchanged
- [ ] withdrawal idempotent
- [ ] concurrency uses Task 8 single-flight
- [ ] exact BigInt only
- [ ] Task 11 Challenge 4a passes
- [ ] Challenge 4b passes
- [ ] Task 8 idempotency regressions pass
- [ ] Challenge 02 passes
- [ ] Challenge 01 passes
- [ ] sanity recorded
- [ ] full suite recorded
- [ ] Challenge 4c not implemented
- [ ] no existing tests modified
- [ ] no new tests added
- [ ] package/config/migrations unchanged
- [ ] Task 12 note created
- [ ] Task 12 committed
- [ ] merged into master
- [ ] `git push origin master`
- [ ] local/remote master hashes verified

**Next planned task:** Task 13 — Atomic Trade Settlement.
