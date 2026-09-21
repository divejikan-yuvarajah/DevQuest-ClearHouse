# ClearHouse — Enhanced Cursor Prompt for Task 7

**Task:** Registry, cache, and shared-state bug fixes  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official submission remote:** `origin`  
**Official repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official submission branch:** `master`  
**Working task branch:** `task-07`  
**Existing Windows checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`  

---

## What Task 7 is for

Task 7 is the focused bug-fix pass for **cache lifetime/cleanup, registry isolation, risk/shared-state correctness, and matching-engine reset/empty-state behaviour**.

Earlier tasks already handled:

- Task 3: core infrastructure defects, including `cache.invalidate()`.
- Task 4: money/asset correctness, including asset registry exponents, consistent lookup, and defensive copies.
- Task 5: HMAC signing and replay protection.
- Task 6: session tokens, refresh rotation/reuse detection, roles, and account ownership.

Therefore, **do not reimplement or undo earlier verified fixes**. Task 7 must inspect the current checkout and organizer tests first, then fix only the remaining registry/cache/shared-state defects.

The exact official assertions in the current repository are authoritative. If a test label, exported function name, or file differs from the historical reference, follow the current test/source contract instead of forcing this prompt's wording.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 7

Copy the entire block below into Cursor Agent mode.

````text
Act as my senior TypeScript backend engineer and debugging partner for the nine-hour DevQuest 2026 ClearHouse final.

Execute TASK 7 ONLY: repair the remaining registry, cache-expiry, risk/shared-state, reservation/reset, and matching-engine empty-state defects. Work directly in my existing competition checkout. Inspect the current source and official tests before changing anything. Complete the implementation, run focused verification, protect previous task work, and prepare a concise completion report.

============================================================
A. PROJECT AND DELIVERY CONTEXT
============================================================

Official competition repository:
https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b

Confirmed official remote:
origin

Official submission branch:
master

Task working branch:
task-07

Existing checkout:
C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b

Historical reference commit:
36bfeafc70e88e405188b80707ea703adcc7a5df

IMPORTANT:
- The current CodeCommit checkout is authoritative.
- Never reset the project to the historical commit.
- Never replace origin with GitHub.
- Never clone over the existing working directory.
- Preserve all existing verified work from Tasks 1-6.
- Do not push automatically unless I explicitly tell you to do so after reviewing the result.

============================================================
B. NON-NEGOTIABLE COMPETITION RULES
============================================================

1. Read applicable AGENTS.md, project instructions, README, Challenges.md, guide files, and existing docs/clearhouse-task-* notes before editing.

2. Official organizer-controlled files are specification evidence and must remain protected unless the competition explicitly allows otherwise. In particular do NOT modify:
   - tests/
   - config/
   - vitest.config.ts
   - tests/tsconfig.json
   - organizer grading/report scripts
   - the package.json test script

3. Never weaken tests, skip tests, reduce generated-property runs, change seeds globally, relax TypeScript, increase timeouts to hide hangs, or modify test discovery.

4. Never add production code that detects:
   - NODE_ENV === "test"
   - VITEST
   - a known test account
   - a fixture nonce
   - a special test header
   - a known generated value
   - test filenames

5. Do not hardcode random fixture IDs, account IDs, prices, quantities, cache keys, timestamps, or expected test data.

6. Do not change the stack, replace SQLite, introduce Redis, add a new cache library, add a new risk framework, or install unnecessary dependencies.

7. Do not use:
   - git reset --hard
   - git clean -fd
   - force push
   - history rewriting
   - automatic stash that could hide teammate/user work
   - destructive branch replacement

8. Preserve public exports, signatures, route contracts, response envelopes, domain types, and prior authentication/security behaviour unless an official Task 7 test proves a change is required.

9. Do not expose or print secrets, .env values, JWT keys, HMAC secrets, CodeCommit credentials, Authorization headers, access tokens, refresh tokens, or credential-bearing remote URLs in reports.

10. Do not execute grading-report upload scripts such as config/result.ts or equivalent external submission/reporting code.

11. Do not make broad refactors simply because the code could look cleaner. This is a nine-hour challenge: prefer the smallest robust fix that satisfies the invariant and preserves compatibility.

12. If an earlier Task 3/4/5/6 implementation is already correct, preserve it. Do not reintroduce an old reference defect to create a planned-looking diff.

============================================================
C. GIT PRE-FLIGHT AND SAFE TASK BRANCH
============================================================

First inspect the current state WITHOUT modifying anything:

Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"

git status --short
git status -sb
git branch --show-current
git rev-parse --verify HEAD
git remote -v
git log -5 --oneline
git diff --stat
git diff --cached --stat

Expected submission branch is master and official remote is origin.

If the current branch is main and there are no unresolved conflicts, create the Task 7 branch:

git switch -c task-07

If task-07 already exists locally, inspect it first:

git branch --list task-07
git log --oneline --decorate --max-count=5 task-07

Do NOT delete or recreate an existing task-07 blindly.

If the current branch is already task-07, continue there.

If the branch/remote differs unexpectedly, report the mismatch instead of changing remotes, renaming branches, or resetting history.

Record the starting commit and initial dirty/staged files. Preserve pre-existing user/team changes and distinguish them from Task 7 changes.

============================================================
D. VERIFY TASK 1-6 PREREQUISITES
============================================================

Check the existing implementation notes if present:

- docs/clearhouse-task-01-audit.md
- docs/clearhouse-task-02-setup.md
- docs/clearhouse-task-03-infrastructure.md
- docs/clearhouse-task-04-money.md
- docs/clearhouse-task-05-signing.md
- docs/clearhouse-task-06-sessions.md

Do not assume a task was completed merely because a prompt/note exists.

Verify that the current source still contains the intended previous fixes relevant to Task 7:

Task 3 carry-forward:
- cache.invalidate(key) deletes only that key.
- previous middleware/status/security fixes remain intact.

Task 4 carry-forward:
- correct asset exponents.
- getAsset/isKnownAsset remain consistent.
- getAsset returns a defensive copy.
- listAssets returns a fresh array with fresh asset objects.

Task 5 carry-forward:
- HMAC/signing and nonce behaviour remains intact.

Task 6 carry-forward:
- token/session/role/account ownership implementation remains intact.

If one of these prerequisites is broken because of a current checkout conflict, diagnose it. Fix only a Task 7-caused regression automatically; otherwise record the prerequisite blocker rather than silently rebuilding unrelated tasks.

============================================================
E. READ THE EXACT TASK 7 CONTRACT BEFORE EDITING
============================================================

Read the complete current versions of the likely Task 7 implementation files:

- src/services/cache.ts
- src/services/riskRegistry.ts
- src/services/matchingEngine.ts
- src/domain/assets.ts

Then search the entire src/ tree for imports/callers of their exported functions.

Also inspect any directly related state holders used by risk/matching, but do not widen scope until the test contract proves they are involved.

Read the organizer tests that cover the Task 7 bug fixes. In the reference project these are primarily bug-scored assertions inside:

- tests/challenge00b.test.ts
- tests/challenge00c.test.ts

Also inspect any directly related challenge tests/imports that exercise the same source functions.

Do NOT guess the labels. Search the actual tests for:

- cache
- ttl
- expiry
- expired
- cleanup
- asset registry
- defensive copy
- risk registry
- limits
- account
- reservation
- reserve
- consume
- release
- reset
- matching engine
- empty book
- order book
- shared state

Build a short Task 7 coverage table BEFORE coding:

official test/label | source export | current defect | expected invariant | Task 7 action

The current test is the specification. If the current repository differs from the historical reference, follow the current repository.

============================================================
F. RUN A FOCUSED BEFORE BASELINE
============================================================

Before making changes, identify the exact Task 7 test names/labels in challenge00b/challenge00c and run the smallest meaningful filters that exercise all Task 7 assertions.

Examples of the command form only:

npm test challenge00b.test.ts -t "<actual Task 7 labels>"
npm test challenge00c.test.ts -t "<actual Task 7 labels>"

Do not invent labels if they differ. Use the real labels found in the current tests.

Also run:

npm run typecheck

Record:
- command
- exit code
- passed tests
- failed tests
- skipped/not-exercised tests
- exact failure messages
- setup/import failures separately

Filtered-out tests are NOT passed. They are simply not exercised.

============================================================
G. CACHE CORRECTNESS — src/services/cache.ts
============================================================

Preserve the existing cache public API and the already-fixed invalidate(key) semantics.

Repair the remaining TTL/expiration defects according to the official tests.

Core invariants:

1. TTL is already expressed in milliseconds.

If set(key, value, ttlMs) receives ttlMs, expiration must be derived from the same unit:

expiresAt = current time + ttlMs

Do NOT multiply ttlMs by 1000 again.

Example behavioural meaning:
- ttlMs = 50 means approximately 50 milliseconds, not 50 seconds.

Do not hardcode specific test TTLs.

2. Expiration is checked when reading.

get(key) must:
- return the value while the entry is still valid.
- return undefined once expired.
- remove the expired entry from the backing store when discovered, so dead entries do not accumulate indefinitely.

3. Keep boundary semantics consistent with the official tests.

Inspect whether expiration at exactly expiresAt is treated as expired. Implement the tested rule consistently in get/cleanup.

Do not add arbitrary +1 ms fudge factors unless the official contract explicitly requires them.

4. invalidate(key) must continue deleting only the specified key.

Do not convert invalidate into clear-all behaviour.

5. clear/reset API, if present, must clear the complete cache and leave later reads empty.

6. Expired-entry cleanup must not delete still-live entries.

7. Avoid background intervals unless the project already uses one and the tests require it.

A cache cleanup strategy triggered by get/set/reset is preferred for this small in-memory cache if compatible with the existing API. A newly introduced setInterval can keep Vitest/Node alive and create lifecycle leaks.

8. Preserve arbitrary cached values.

Do not accidentally treat false, 0, "", null, or empty arrays as cache misses merely because they are falsy. Distinguish missing entry from stored value according to the existing generic contract.

9. Do not mutate cached values unless the existing API explicitly defines clone semantics.

Task 7 is about expiry/state correctness, not redesigning serialization.

============================================================
H. ASSET REGISTRY — VERIFY TASK 4, DO NOT REWRITE IT
============================================================

Task 4 already corrected asset-registry behaviour. Task 7 must verify those fixes because some broader registry bug tests may be grouped with this task.

Required retained behaviour:

- USD exponent = 2
- EUR exponent = 2
- JPY exponent = 0
- BHD exponent = 3
- BTC exponent = 8
- getAsset(code) and isKnownAsset(code) agree.
- Unknown/invalid codes are not silently normalized unless the actual current tests require normalization.
- getAsset returns a fresh object.
- listAssets returns a fresh array.
- every object in listAssets is a fresh copy.
- mutating a returned asset object cannot mutate future registry results.
- reordering/removing items from a returned array cannot mutate registry order/content.

If these already pass, make no new asset-domain changes.

Do NOT freeze returned copies merely to prevent mutation if the official test assigns to the returned object and expects the assignment itself to be allowed without touching registry state.

============================================================
I. RISK REGISTRY / ACCOUNT-SPECIFIC LIMIT ISOLATION
============================================================

Inspect src/services/riskRegistry.ts and every official Task 7 assertion before implementing.

The central rule is STATE ISOLATION.

One account's limits, reservations, counters, or resets must not leak into another account.

Implement the current API so that account-specific configuration remains account-specific.

Likely invariants to verify from the tests:

1. set/update limits for account A must not change account B.

2. Reading limits for A must return A's effective limits, not whichever account was most recently written.

3. If the registry has defaults, preserve them independently from account overrides. Do not mutate a single shared object and hand the same reference to every account.

4. Returned limit objects must not create shared-reference corruption if the contract expects isolation. Use defensive copies where the tests/source design require it.

5. Multiple accounts may have different max notional/open-order/position values simultaneously.

6. Resetting one account must not reset every account unless the API explicitly says global reset.

7. A global reset used by tests must return the entire registry to a deterministic clean state.

8. Do not hardcode fixture account IDs.

9. Preserve the public types and expected error behaviour.

Do not implement the full Challenge 05 risk engine here if risk rule evaluation is still scheduled for a later task. Task 7 fixes registry/shared-state mechanics only.

============================================================
J. RESERVATION / SHARED-STATE CORRECTNESS
============================================================

Inspect the current reservation API in riskRegistry.ts/matchingEngine.ts or related directly imported state holder.

Fix the exact official bug rather than inventing a new model.

Required invariants to confirm against the tests:

1. Reservation state belongs to the correct account/order/key.

A reservation made for A must not appear under B.

2. Consuming/releasing a reservation must affect the intended reservation exactly once.

If the API represents reservation consumption, a successfully consumed reservation must no longer be available for a second consume unless the contract explicitly supports partial consumption.

3. A failed lookup/consume must not accidentally consume another reservation.

4. Reset must clear all Task 7 in-memory reservation/shared state that the official reset function promises to clear.

5. Reset must not leave stale references that become visible after the next test/request.

6. Do not use array index positions as permanent identities if deletions/reordering can make them refer to the wrong reservation.

7. Avoid global mutable singleton objects being reused for independent accounts/orders unless the public design intentionally defines a singleton registry with correctly keyed internal maps.

8. If the test requires partial reservation consumption, preserve exact remaining state and reject over-consumption. If it requires whole-reservation consumption, remove it atomically after success. Derive this from the current test rather than assuming.

9. Never silently create a reservation during a read/consume operation unless the existing contract explicitly requires it.

============================================================
K. MATCHING ENGINE SHARED STATE / RESET / EMPTY BOOK
============================================================

Inspect src/services/matchingEngine.ts and its official Task 7 bug tests.

This task is NOT the full matching-engine implementation scheduled for later tasks. Only fix the shared-state/helper defects currently scored as bug fixes.

Required invariants to confirm against the tests:

1. Empty-book operations must return the contractually correct empty result rather than:
   - throwing accidentally,
   - returning stale data from a previous test,
   - returning undefined when the API promises an empty object/array,
   - returning a fabricated order/level.

Use the exact return shape from the official test/type.

2. Reset/clear must actually clear all matching-engine in-memory state covered by the reset API.

After reset:
- previous orders/reservations/book levels cannot reappear.
- IDs/counters are reset only if the existing contract says they are reset.
- independent future operations start from a deterministic clean state.

3. Do not retain references to arrays/maps from before reset if later operations can accidentally mutate/re-expose them.

4. Querying one symbol/market/account must not expose another one's state when keys are supposed to isolate them.

5. Do not implement price-time matching, market orders, IOC/FOK, stops, amendments, concurrency, or full matching performance in this task unless a Task 7 organizer bug test directly requires a small helper correction.

6. Preserve future matching-engine extension points and public exports.

============================================================
L. STATE-ISOLATION REVIEW
============================================================

After the direct fixes, perform a short structural review for the files touched by Task 7.

Look for patterns such as:

- one mutable object reused for many accounts.
- Map values storing the same default object reference.
- arrays returned directly from internal state.
- reset replacing only one field while another cache/map survives.
- consume/release mutating a copy instead of the stored record.
- deleting from the wrong Map key.
- cache timestamp values using seconds in one path and milliseconds in another.
- truthiness checks that mishandle valid false/0/empty values.
- state initialized at module scope without an official reset path used by tests.

Fix only demonstrated Task 7 defects. Do not rewrite every shared service in the application.

============================================================
M. OPTIONAL PARTICIPANT-OWNED TESTS
============================================================

Do not edit organizer tests.

Only if official Task 7 tests leave a meaningful gap, you may add ONE small participant-owned file:

tests/task07-shared-state-extra.test.ts

Useful cases include:

CACHE
- value is available immediately after set.
- expires at the correct millisecond-scale boundary.
- expired get returns undefined and removes the entry.
- expiring one key leaves another live key intact.
- invalidate one key does not clear another.
- a cached falsy value remains distinguishable from a miss if supported by the API.

RISK REGISTRY
- account A and B can hold different limits at the same time.
- mutating/retrieving A does not change B.
- reset of one scoped record does not leak if scoped reset exists.
- global reset clears everything if global reset exists.

RESERVATIONS
- consume once succeeds according to contract.
- second consume fails/returns missing according to contract.
- reservation for A cannot be consumed through B's identity/key.
- reset removes the reservation.

MATCHING STATE
- empty state returns the exact required empty shape.
- reset removes prior state.
- next independent use does not expose stale prior state.

Use fake time for TTL tests instead of wall-clock sleeps when compatible with the current test framework. Always restore fake timers/time in cleanup.

Do not add fixture-specific production hooks to support custom tests.

============================================================
N. IMPLEMENTATION FILE SCOPE
============================================================

Expected production files for Task 7 are primarily:

- src/services/cache.ts
- src/services/riskRegistry.ts
- src/services/matchingEngine.ts

Asset file is verification-first:

- src/domain/assets.ts

Only edit assets.ts if the current checkout has regressed from Task 4 and the official registry tests prove it.

Also create/update:

- docs/clearhouse-task-07-shared-state.md

Optional participant-owned test only if actually useful:

- tests/task07-shared-state-extra.test.ts

Do not change package.json/dependencies/migrations/controllers/routes/UI unless a current official Task 7 test demonstrates that one of those files is directly required. If so, explain the reason before broadening the diff.

============================================================
O. TYPE SAFETY AND IMPLEMENTATION QUALITY
============================================================

Maintain strict TypeScript compatibility.

Avoid:
- broad any casts.
- @ts-ignore to suppress real errors.
- non-null assertions used to hide missing-state bugs.
- JSON stringify/parse cloning of BigInt-containing structures.
- floating promises.
- unbounded timers.
- new singleton state without reset semantics.

Prefer:
- Map keyed by the real account/order/cache identity already defined by the project.
- small helper functions for copy/default construction where needed.
- immutable defaults plus copied per-account state.
- deterministic reset behaviour.
- exact current API types.

============================================================
P. VERIFICATION SEQUENCE AFTER IMPLEMENTATION
============================================================

1. Run typecheck:

npm run typecheck

2. Run the exact focused Task 7 official tests discovered in challenge00b/challenge00c.

Use the real current labels. Example command shape:

npm test challenge00b.test.ts -t "<all actual Task 7 challenge labels>"
npm test challenge00c.test.ts -t "<all actual Task 7 challenge labels>"

3. If the Task 4 asset registry assertions are part of Task 7 coverage, verify them again using the actual known reference filters if they still exist:

npm test challenge00b.test.ts -t "Challenge 0h"
npm test challenge00c.test.ts -t "Challenge 0x"

If labels changed, use the current labels instead.

4. Verify the earlier core cache invalidation fix remains correct:

npm test challenge00.test.ts

5. If the optional participant test exists:

npm test task07-shared-state-extra.test.ts

6. Verify earlier foundation challenge remains intact:

npm test challenge01.test.ts

7. Run sanity:

npm test _sanity.test.ts

8. Run the unchanged full suite once as the milestone regression:

npm test

A nonzero full-suite result may still be expected because many later challenge features remain unimplemented. Record the real result and identify remaining failures. Do not implement all later challenges merely to make Task 7's checkpoint green.

IMPORTANT TEST REPORTING RULES:
- Report actual counts.
- Filtered-out tests are NOT EXERCISED.
- Do not say "all tests pass" unless you actually ran the entire suite and it passed.
- Do not edit test-results.xml.
- Each filtered run may overwrite the XML report, so keep command scope in the written Task 7 note.
- If a test hangs, diagnose timers/server handles/shared-state cleanup. Do not increase protected timeouts or force-exit to fake success.
- If property tests fail, preserve their seed/path/counterexample and fix the invariant, not the generated example.

============================================================
Q. REQUIRED TASK 7 COMPLETION NOTE
============================================================

Create/update:

docs/clearhouse-task-07-shared-state.md

Include:

1. Starting commit and branch.
2. Initial dirty/staged files preserved.
3. Official Task 7 tests/labels discovered in the current checkout.
4. Source files mapped to each Task 7 assertion.
5. Cache defect(s): root cause and fix.
6. TTL unit rule and expiration boundary used.
7. Expired-entry cleanup behaviour.
8. Confirmation that Task 3 invalidate semantics were preserved.
9. Asset-registry verification and confirmation that Task 4 fixes were preserved.
10. Risk-registry account isolation changes.
11. Reservation consume/release/reset behaviour.
12. Matching-engine empty-state/reset correction.
13. Exact changed files.
14. Official focused test results.
15. Optional participant test result, clearly labelled participant-owned.
16. Challenge 00 result.
17. Challenge 01 result.
18. Sanity result.
19. Full-suite result with remaining unfinished challenge areas.
20. Confirmation protected organizer files and package.json test script were not modified by Task 7.
21. Any remaining blocker or follow-up for later Tasks 8+.
22. Suggested commit message.
23. Reviewed CodeCommit branch/merge/push commands.

Do not include secrets, token values, environment values, credential-bearing URLs, or huge test logs.

============================================================
R. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat
git diff -- src/services/cache.ts src/services/riskRegistry.ts src/services/matchingEngine.ts src/domain/assets.ts docs/clearhouse-task-07-shared-state.md

If an optional participant test exists:

git diff -- tests/task07-shared-state-extra.test.ts

Review the actual diff.

Confirm:
- no organizer tests changed.
- config/ unchanged.
- vitest config unchanged.
- package.json test script unchanged.
- no test-detection branch added.
- no secret/config value exposed.
- no unrelated formatting/refactor noise.
- previous Tasks 3-6 behaviour retained.

============================================================
S. TASK 7 COMPLETION CRITERIA
============================================================

Task 7 is COMPLETE only when the current official contract demonstrates all applicable items below:

[ ] Task 7 official organizer tests were identified from the current checkout.
[ ] Cache TTL uses milliseconds correctly.
[ ] Expired cache entries are not returned.
[ ] Expired entries are cleaned according to the contract.
[ ] invalidate(key) still removes only the intended key.
[ ] Asset registry Task 4 fixes remain passing.
[ ] Account-specific risk registry state is isolated.
[ ] Shared mutable default/reference leakage is removed where applicable.
[ ] Reservation consume/release behaviour matches the official tests.
[ ] Reset clears the state the API promises to clear.
[ ] Empty matching/book state returns the exact required empty result.
[ ] Matching-engine reset does not leak stale state.
[ ] TypeScript passes.
[ ] Focused official Task 7 tests pass.
[ ] Challenge 00 regression passes or any unrelated blocker is accurately identified.
[ ] Challenge 01 regression status is recorded honestly.
[ ] Sanity status is recorded honestly.
[ ] Full npm test milestone result is recorded honestly.
[ ] Protected files remain untouched by this task.
[ ] Task 7 note documents the implementation and evidence.

If any required gate fails, report Task 7 as PARTIAL and state the exact cause. Never claim a pass for a test that was not run.

============================================================
T. FINAL RESPONSE FROM CURSOR
============================================================

Return a concise report containing:

1. Task 7 status: COMPLETE or PARTIAL.
2. Starting commit and current task branch.
3. Exact files changed.
4. Exact defects fixed.
5. Official Task 7 tests discovered and their results.
6. Typecheck result.
7. Challenge 00/01/sanity/full-suite results separately.
8. Remaining blockers/unimplemented later features.
9. Confirmation that protected files were not modified.
10. Copyable Git commands for review/commit/merge/push.

Suggested Task 7 commit message:

fix: isolate shared state and correct cache expiry

Do not automatically merge or push. Stop after the verified implementation/report unless I explicitly instruct you to execute Git publication commands.
````

---

# Git / CodeCommit Workflow After Cursor Finishes

The competition repository is **AWS CodeCommit**, even if we casually call these “GitHub push commands.” Your official destination is `origin/master`.

## 1. Confirm you are on the Task 7 branch

Run in PowerShell:

```powershell
Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"

git status -sb
git branch --show-current
git remote -v
git log -5 --oneline
```

Expected working branch:

```text
task-07
```

Do not continue if there are unresolved merge conflicts.

---

## 2. Run final verification before staging

Use the actual Task 7 labels Cursor discovered from the current organizer tests.

```powershell
npm run typecheck
npm test challenge00.test.ts
npm test challenge01.test.ts
npm test _sanity.test.ts
git diff --check
```

Also run the exact Task 7 filters from `challenge00b.test.ts` and `challenge00c.test.ts` that Cursor identified.

If `tests/task07-shared-state-extra.test.ts` was actually created:

```powershell
npm test task07-shared-state-extra.test.ts
```

Do not commit a claimed “complete” Task 7 if its required focused tests are failing.

---

## 3. Inspect exactly what changed

```powershell
git status --short
git diff --stat
git diff -- src/services/cache.ts src/services/riskRegistry.ts src/services/matchingEngine.ts src/domain/assets.ts docs/clearhouse-task-07-shared-state.md
```

Only inspect the optional test if it exists:

```powershell
git diff -- tests/task07-shared-state-extra.test.ts
```

Make sure no organizer test/config file was accidentally edited.

---

## 4. Stage only Task 7 files

Prefer explicit staging rather than `git add .` during the competition.

```powershell
git add -- src/services/cache.ts
git add -- src/services/riskRegistry.ts
git add -- src/services/matchingEngine.ts
git add -- docs/clearhouse-task-07-shared-state.md
```

Only stage `src/domain/assets.ts` if Cursor actually made a justified Task 7 correction there:

```powershell
git add -- src/domain/assets.ts
```

Only if the optional participant-owned test exists:

```powershell
git add -- tests/task07-shared-state-extra.test.ts
```

If one of these files contains unrelated changes, use interactive staging:

```powershell
git add -p -- <file-path>
```

Review staged content:

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached
```

Do not commit secrets, organizer test edits, generated reports, `node_modules`, or unrelated work.

---

## 5. Commit Task 7 on the task branch

```powershell
git commit -m "fix: isolate shared state and correct cache expiry"
git show --stat --oneline HEAD
```

If Git reports there is nothing to commit because the fixes were already present, do not create an empty commit. Keep the verification evidence in the Task 7 note and proceed only according to the actual repository state.

---

## 6. Merge the verified Task 7 branch into `main`

First switch to `main`:

```powershell
git switch master
```

Fetch the latest CodeCommit state:

```powershell
git fetch origin
```

Inspect divergence before changing anything:

```powershell
git status -sb
git log --oneline --left-right master...origin/master
```

If local `main` is simply behind `origin/master` and has no conflicting local work:

```powershell
git pull --ff-only origin master
```

Then merge Task 7 using fast-forward when possible:

```powershell
git merge --ff-only task-07
```

If `--ff-only` fails, **do not force it and do not reset**. Inspect history:

```powershell
git log --oneline --graph --decorate --all -15
```

Resolve the real branch relationship safely. Do not rewrite competition history merely to make the example command work.

---

## 7. Re-run the critical checks on merged `main`

After the merge and before pushing:

```powershell
npm run typecheck
npm test challenge00.test.ts
npm test challenge01.test.ts
npm test _sanity.test.ts
git diff --check
git status -sb
```

Also rerun the exact focused Task 7 official test filters if the merge included any concurrent changes since Task 7 verification.

---

## 8. Push the official submission branch

```powershell
git push origin master
```

This is the important competition delivery command.

---

## 9. Verify that the remote received the exact commit

```powershell
git rev-parse --verify HEAD
git ls-remote origin refs/heads/master
git status -sb
```

Compare the full commit hash from:

```text
git rev-parse --verify HEAD
```

with the hash shown for:

```text
refs/heads/master
```

They should match after a successful push, assuming nobody else pushed another commit in between.

A matching hash confirms repository delivery. It does **not** by itself prove the grader awarded points or that every test passed.

---

# If `git push origin master` is rejected

Do **not** force-push.

Run:

```powershell
git fetch origin
git status -sb
git log --oneline --left-right HEAD...origin/master
```

If another teammate/new remote commit exists, inspect it and integrate it safely before pushing again.

Typical safe flow when appropriate:

```powershell
git pull --ff-only origin master
```

If fast-forward is impossible because both sides have new commits, inspect the graph and perform a normal merge/reconciliation. Do not use `git reset --hard origin/master` because that can destroy your Task 7 work.

---

# Task 7 Quick Review Checklist

- [ ] Work performed on `task-07`.
- [ ] Current organizer Task 7 tests inspected before coding.
- [ ] Cache TTL uses milliseconds, not milliseconds × 1000.
- [ ] Expired cache values are not returned.
- [ ] Expired cache entries are removed.
- [ ] `invalidate()` still deletes only the requested key.
- [ ] Asset registry Task 4 fixes remain correct.
- [ ] Account-specific risk limits do not leak between accounts.
- [ ] Reservation state is isolated and consumed/released correctly.
- [ ] Reset clears promised shared state.
- [ ] Empty matching/book state returns the official required empty shape.
- [ ] Matching reset prevents stale-state leakage.
- [ ] No organizer tests/config were changed.
- [ ] No test-detection production code was introduced.
- [ ] `npm run typecheck` passes.
- [ ] Focused Task 7 official tests pass.
- [ ] Previous foundation regressions checked.
- [ ] Task 7 note created/updated.
- [ ] Task 7 commit reviewed.
- [ ] `task-07` merged into `main`.
- [ ] `git push origin master` succeeds.
- [ ] Local HEAD and remote `refs/heads/master` hashes verified.

---

## Recommended commit message

```text
fix: isolate shared state and correct cache expiry
```

## Official push command

```powershell
git push origin master
```

