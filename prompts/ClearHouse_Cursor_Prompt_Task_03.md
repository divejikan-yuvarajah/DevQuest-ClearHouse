# ClearHouse — Enhanced Cursor Prompt for Task 3

**Task:** Core infrastructure bug fixes  
**Repository:** https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git  
**Inspected reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`  
**Prerequisites:** Tasks 1–2 audit, dependencies, local configuration, database setup, typecheck, and sanity checks. Verify their actual status; do not assume they were completed.

## How to use

Open the existing ClearHouse checkout in Cursor and paste the complete **Task 3 implementation prompt** below into Agent mode. Let Cursor inspect your current files before making changes. The reference commit is evidence of the original defects, not a commit to reset to.

The prompt includes implementation, focused verification, regression checks, a completion report, and Git commands. It does not ask Cursor to commit or push automatically. Review the result and use the Git appendix, or separately authorise Cursor to execute the reviewed publication commands.

No fixes or tests have been executed by the author of this prompt pack. Your local checkout may already contain some of the corrections.

## Exact scope and known defects

| Requirement | Implementation file | Observed defect in reference commit | Required outcome |
|---|---|---|---|
| Challenge 0a: role guard | `src/middleware/rbac.ts` | Rejects a principal whose role equals the required role and lets a mismatched principal through | Matching role proceeds; absent or mismatched principal is forbidden |
| Challenge 0b: replay protection | `src/middleware/hmacAuth.ts` | Records accepted nonces with an expiry in the past | A still-valid signed request cannot reuse its nonce |
| Challenge 0c: async errors | `src/middleware/asyncHandler.ts` | Invokes an async handler without forwarding its rejected promise | Rejections reach Express `next(error)` |
| Challenges 0d and 0g: status constants | `src/enums/httpStatus.ts` | Swapped 401/403 and incorrect 412/501/503 mappings | All existing enum entries have their correct literal values |
| Challenge 0e: CSP header | `src/middleware/securityHeaders.ts` | Misspells `Content-Security-Policy` as `Content-Security-Policyy` | Sends the correct CSP header and preserves its policy |
| Challenge 0f: cache invalidation | `src/services/cache.ts` | Reads the key instead of deleting it | Invalidating a key removes only that cached entry |

The six tests in `tests/challenge00.test.ts` represent **200 available bug-category points** in the inspected scoring file. The adjacent all-status-codes test, Challenge 0g, represents **15 additional available bug points**. These are not points already earned, a guaranteed grading result, or a final overall percentage.

Cache TTL units and expired-entry cleanup belong to **Task 7**. Full HMAC cryptography belongs to **Task 5**; token issuance/refresh belongs to **Task 6**; broader security headers and payload protection belong to **Task 9**. Preserve any already-correct implementation of those features.

---

## Task 3 implementation prompt

Copy this entire block into Cursor.

````text
Act as my senior TypeScript and Express engineer for the nine-hour DevQuest 2026 ClearHouse final.

Execute TASK 3: repair the six core infrastructure defects and the remaining incorrect constants in the same HTTP status enum. Implement real corrections, run the supplied tests, inspect regressions, and produce a concise completion note. Target approximately 20–35 minutes if setup is healthy; do not claim success merely to meet the estimate.

Repository: https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git
Reference inspected commit: 36bfeafc70e88e405188b80707ea703adcc7a5df.
The current checkout is authoritative. Never reset it to that commit.

PART A — RULES, INITIAL STATE, AND PREREQUISITES

1. Read applicable AGENTS.md and existing project/Cursor instructions. Read docs/clearhouse-task-01-audit.md and docs/clearhouse-task-02-setup.md if present. If the notes are missing, inspect the actual setup rather than inventing their results.
2. Preserve existing work, including unrelated staged changes and teammate edits. Do not use git reset --hard, git clean, automatic stash, force-push, branch replacement, or history rewriting.
3. Do not modify supplied tests/, config/, vitest.config.ts, tests/tsconfig.json, or package.json's test script. Read them as specifications. Do not execute config/result.ts or another script that submits grading data externally.
4. Do not weaken assertions, skip official tests, change property generators/seeds globally, inflate test timeouts, change test discovery, relax typechecking, or edit result XML.
5. Never add production branches detecting VITEST, NODE_ENV=test, test-only headers, fixture values, or mocked signatures. Preserve the starter's existing environment scaffolding without expanding it into a bypass. Do not blindly remove inherited scaffolding during this task.
6. Do not hardcode account IDs, test signatures, fixed nonces, timestamps, or known fixture bodies. Implement each rule generally.
7. No dependency upgrades, stack changes, extra framework, database replacement, or unrelated refactoring. Keep existing filenames, exports, generic signatures, and response envelopes.
8. Do not expose .env values, credentials, JWT/HMAC secrets, tokens, or credential-bearing remote URLs in logs or notes.
9. Do not reset the development database for these middleware fixes. The official tests manage their own in-memory database. Do not run npm run migrate simply because a feature test fails.
10. Do not automatically commit or push. Prepare exact commands after verifying the actual remote and branch. Routine local implementation and testing are authorised; complete them without repeated permission questions.

Initial commands, adapted to the active shell:

git status --short
git branch --show-current
git rev-parse --verify HEAD
git diff --stat
git diff --cached --stat
node --version
npm --version

Identify clean/dirty state, conflicts, staged work, current branch, and current commit. Inspect remote destinations locally and redact any credentials in the report. Do not assume origin is GitHub or main is the active branch.

Record the pre-task state of protected files and scripts.test so that you can distinguish pre-existing changes from your own. Use an untracked manifest outside protected paths if necessary. Do not overwrite prior baseline notes.

Verify dependencies and Task 2 prerequisites. If packages are missing, follow the existing setup note using the current manifest/lockfile, without upgrading versions. If .env or the required development DB is missing, report the precise Task 2 prerequisite and follow its established preservation/setup instructions. Do not fabricate a blank database file to satisfy sanity checks.

PART B — READ BEFORE EDITING

Read these complete files:
- tests/challenge00.test.ts
- src/middleware/rbac.ts
- src/middleware/hmacAuth.ts
- src/middleware/asyncHandler.ts
- src/enums/httpStatus.ts
- src/middleware/securityHeaders.ts
- src/services/cache.ts

Read these related contracts and call sites:
- Challenge 0g in tests/challenge00b.test.ts.
- Challenge 1c and 1d in tests/challenge01.test.ts.
- src/domain/signing.ts and src/domain/session.ts: interfaces only where still stubbed.
- src/routes/secureRoutes.ts, role-guard call sites, asyncHandler call sites, and src/server.ts middleware/error wiring.
- Cache call sites; note the separate TTL/cleanup tests in challenge00b/00c for the Task 7 handoff.
- tests/setup.ts, tests/testBase.ts, tests/_sanity.test.ts, and vitest.config.ts.
- Relevant scoring entries in config/scores.ts, read-only.

Run a focused BEFORE baseline:

npm test challenge00.test.ts
npm test challenge00b.test.ts -t "Challenge 0g"

Record the actual pass/fail counts, errors, and exit codes. The 0g file imports the application and has database hooks even when filtered; a setup failure must be distinguished from an enum assertion failure.

Crucial test interpretation: challenge00.test.ts mocks the signing module in the supplied TEST FILE to isolate middleware behaviour. Leave that mock where it is. Passing Challenge 0b proves nonce tracking, not production HMAC correctness. Do not copy its mock into src/ or implement a verification bypass.

PART C — IMPLEMENT THE CORRECTIONS

C1. HTTP STATUS ENUM
File: src/enums/httpStatus.ts.

Ensure every existing member has the required literal mapping:

OK=200
CREATED=201
NOT_MODIFIED=304
BAD_REQUEST=400
UNAUTHORIZED=401
FORBIDDEN=403
NOT_FOUND=404
CONFLICT=409
PRECONDITION_FAILED=412
TOO_MANY_REQUESTS=429
INTERNAL_SERVER_ERROR=500
NOT_IMPLEMENTED=501
SERVICE_UNAVAILABLE=503

Preserve names and the default export. Keep already-correct values. Do not rewrite controller policies or remap every error to a success just because global numeric changes expose a failing route.
Correct all incorrect members in this one enum now; this also addresses Challenge 0g without expanding into unrelated functionality.

C2. ROLE GUARD
File: src/middleware/rbac.ts; target requireRole().

Required behaviour:
- No principal: reject with FORBIDDEN (403), error code FORBIDDEN, and the existing error-envelope shape. Do not call next().
- Principal role differs from required role: reject identically; do not call next().
- Principal role equals required role: call next() once and do not write a response.
- Keep the decision generic for the supplied Role type. Do not special-case an account ID or grant admin an undocumented role hierarchy.

The starter's comparison is inverted. Make the smallest correct change.
Keep attachPrincipal(), requireOwnAccount(), and requireOwnAccountParam() semantics intact. In particular, the supplied specification explicitly permits anonymous access on some balance routes and expects missing identity on an admin-only route to produce 403. Do not impose a new global authentication policy or change that route to 401.
Do not implement token issuance, token verification, refresh rotation, or new authentication endpoints in Task 3.

C3. NONCE REPLAY PROTECTION
File: src/middleware/hmacAuth.ts.

The starter stores accepted nonces with now - SIGNATURE_WINDOW_MS, so sweepExpired() can immediately erase them. Fix the lifetime logic.

Preserve this ordering:
1. Require signature/timestamp/nonce/algorithm headers.
2. Sweep genuinely expired nonce records.
3. Validate the timestamp through the existing signing-domain contract.
4. Reject a nonce still recorded as used.
5. Obtain the configured secret and verify the signature using the existing interface.
6. Record the nonce ONLY after successful verification.
7. Call next() exactly once for the accepted request.

Required invariants:
- A second still-valid request using an accepted nonce is rejected with UNAUTHORIZED (401) and NONCE_REPLAYED.
- An invalid or missing signature must not consume a nonce and block a later valid request.
- Independent valid nonces continue to work.
- Keep the nonce map shared across requests; do not recreate or clear it per request.
- Expiry is a future timestamp in milliseconds derived from SIGNATURE_WINDOW_MS; do not hardcode 30000 in a second place.
- Retain the nonce for the complete time during which the original signed timestamp could still be accepted. Inspect the contract's clock-skew and boundary semantics: if future timestamps inside the window are allowed, retention may need to extend beyond receipt-time plus one window. If acceptance includes an equality boundary, avoid deleting the nonce at that same still-valid boundary.
- Use a bounded retention policy consistent with the signing window, not a permanently growing collection. Keep the existing request-driven cleanup pattern unless a change is demonstrably required; do not add a background timer that keeps the process alive.
- Do not make signature verification asynchronous without also designing an atomic check/reservation mechanism. The current synchronous verification allows the check and acceptance bookkeeping to remain in one uninterrupted request execution.

The minimal past-to-future expiry correction fixes the visible defect. Ensure the chosen lifetime also respects the accepted timestamp window; explain the reasoning in the completion note. If the signing window implementation is still a stub, use its types/constants and the official contract and clearly identify what must be verified again in Task 5.

Preserve rawBody, method, originalUrl, algorithm, and error-code handling. Do not stringify a different request body or bypass verifySignature(). Preserve the existing development/test configuration behaviour without adding new test-detection paths.

C4. ASYNC ERROR FORWARDING
File: src/middleware/asyncHandler.ts.

Implement an Express-compatible wrapper that forwards the original rejected error to next(error), with no unhandled rejected promise.

Requirements:
- Keep existing generic parameter types, imports as needed, export shape, and call-site compatibility.
- Invoke the wrapped handler exactly once with the original req/res/next objects.
- A resolved handler should not cause the wrapper to call next() automatically; handlers may already send responses or call next themselves.
- A rejected handler must forward its original rejection to Express without sending a second response or swallowing it.
- Catch a synchronous throw during handler invocation as well as an asynchronously rejected promise.
- Use a normal promise chain or try/catch plus Promise.resolve(...).catch(next). Remember that Promise.resolve(handler(...)) by itself evaluates handler(...) before Promise.resolve can catch a synchronous throw.
- Avoid floating promises, blanket any casts, global process unhandledRejection handlers, and catch blocks that merely log or return fake success.
- Do not redesign the central error handler or change route-specific response policies in this task.

C5. SECURITY HEADER NAME
File: src/middleware/securityHeaders.ts.

Send Content-Security-Policy with exactly the existing required policy: default-src 'none'. Remove the misspelled Content-Security-Policyy write. Preserve Referrer-Policy: no-referrer, other already-correct headers in my current checkout, and normal next() behaviour.

Do not loosen the global policy to unsafe-inline, unsafe-eval, or wildcard origins to make future Swagger or browser work easier. Documentation-specific CSP adjustments belong to Task 25. Additional security headers and framework-fingerprint removal belong to Task 9 unless already implemented; preserve them if present.

C6. CACHE INVALIDATION
File: src/services/cache.ts; target invalidate().

Actually delete the requested key from the shared store. Preserve the public signature and other exports.
Invalidating a missing key should remain harmless. Invalidating one key must not clear unrelated entries. Do not replace invalidation with expiration tricks or make all get() calls return undefined.

Do not expand this edit into the separately scheduled TTL unit correction or expired-entry cleanup. At the reference commit set() multiplies ttlMs by 1000 and get() leaves expired entries in the map; record those as Task 7 work if still present. Preserve any fixes already made in my checkout.

PART D — IMPLEMENTATION REVIEW AND SCOPE CONTROL

Expected modified production files are only the six files listed in Part B. Also create/update docs/clearhouse-task-03-infrastructure.md.

If a fix is already correct, verify it and leave it alone. Do not reintroduce the reference defect to make the diff look like a planned change. Do not modify package.json, dependencies, database schemas, tests, controllers, UI files, or feature domains without a concrete in-scope dependency reason; report such a reason before broadening scope.

The supplied tests are sufficient for the main six corrections. Do not add a large redundant test suite. If the chosen nonce boundary handling or async synchronous-throw handling creates a concrete uncovered risk, add a small, separately named participant-owned test file such as tests/task03-extra.test.ts only if useful. Never edit an organiser test. Restore fake timers/mocks in cleanup and avoid wall-clock sleeps or fixture-specific production branches. Clearly distinguish custom coverage from scored official tests.

PART E — VERIFY IN ORDER

After the changes, run sequentially:

npm run typecheck
npm test challenge00.test.ts
npm test challenge00b.test.ts -t "Challenge 0g"
npm test _sanity.test.ts

If an optional participant test was added, run that exact file as well.

Required focused outcome in the inspected test version:
- Typecheck: pass.
- challenge00.test.ts: all six tests pass, with no unhandled-error warning.
- Filtered Challenge 0g: its one enum test passes; all filtered-out tests are NOT EXERCISED, not passed.
- Sanity: all eleven checks pass, unless the current official version has a different count, which must be reported accurately.

Fix failures caused by this task and rerun the affected tests. A hanging test is not a pass. Diagnose missing error forwarding, resource cleanup, imports, configuration, or DB hooks rather than increasing official timeouts or using force-exit options.

The guide requires a whole-suite regression after completing a challenge. Run the unchanged command once after the focused checks:

npm test

Many later challenges may still fail because their implementations are stubbed. Record the complete suite's exit code and counts, compare with existing baseline evidence, and identify regressions versus expected remaining work. Do not implement the rest of the platform to make this Task 3 checkpoint fully green. If no complete earlier baseline exists, state that an exact regression count cannot be proven and use focused evidence and failure causes instead.

Once a concrete regression is fixed, rerun the relevant checks; repeat the full suite only when required to verify the change. Do not keep rerunning every unimplemented challenge without a reason. If a full run is blocked or interrupted, mark it INCOMPLETE and give the cause. Do not silently substitute a filtered run.

Every npm test invocation can overwrite test-results.xml. Keep separate textual records or copies outside protected paths if needed. Never claim the last filtered report represents the whole suite. Do not modify grading configuration or run report-upload scripts.

If Tasks 5–6 have already been implemented in my current checkout, also verify the corresponding real HMAC/authorisation integration tests in challenge01.test.ts. If they remain stubbed, report that limitation explicitly: a passing mocked middleware test does not establish end-to-end authentication security.

PART F — COMPLETION NOTE AND FINAL REPORT

Create/update docs/clearhouse-task-03-infrastructure.md with:
1. Starting commit and branch, and baseline dirty/staged state.
2. Each of the six defects: root cause, correction, why it works, affected file, and official test.
3. The extra same-file status corrections and Challenge 0g result.
4. Nonce expiry/window reasoning and any Task 5 follow-up.
5. Before/after command table: command, scope, exit code, passed/failed/not-exercised counts, and any warning.
6. Full-suite result and known remaining failures; no invented regression comparison.
7. Preserved compatibility: missing-principal 403, anonymous balance behaviour, generic signatures, correct CSP, and cache API.
8. Protected-file verification and the list of files actually changed by this task.
9. Outstanding work for Tasks 4–9, especially money, full signing, sessions, TTL/cleanup, and broader security.
10. Suggested commit message and exact Git commands for the verified remote/current branch, with no secrets.

Run git diff --check, git diff --stat, and git status --short. Verify that supplied protected content and scripts.test match their pre-task state. Review the actual diff; do not automatically restore a file that contained someone else's earlier edits.

In the final chat response, state:
- Status: focused Task 3 checks passed, or partial with exact blockers.
- Changed files and the six corrections.
- Actual test results, including full-suite failures separately.
- Any unverified security or browser behaviour; do not imply deployment/readiness beyond the evidence.
- Available scoring entries addressed, clearly separated from an official awarded score.
- Copyable staging, commit, push, and remote-commit verification commands.
- Next planned task: Task 4, asset registry and exact money arithmetic.

Do not automatically push, rewrite history, publish grading reports, or continue into Task 4.
````

---

## GitHub commands after Cursor finishes

Execute commands one at a time from the project root. Inspect the output before proceeding. The examples work in Git Bash and PowerShell because they avoid shell-specific substitutions.

### 1. Identify the exact working tree and destination

```bash
git status --short
git branch --show-current
git remote -v
git log -5 --oneline
git diff --stat
git diff --cached --stat
```

Do not publish credential-bearing remote output. Reuse the remote that actually points to `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git` or its equivalent SSH URL. Preserve existing CodeCommit remotes and intended submission branches.

If this GitHub repository has no remote and `github` is an unused remote name, add it:

```bash
git remote add github https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git
```

Do not replace `origin` or another existing remote. Do not rename your current branch to fit an example. Resolve a detached HEAD against the team's intended branch before committing.

### 2. Review Task 3's verification

Use the results Cursor just produced if they apply to the unchanged working tree. Rerun these checks if code changed afterward:

```bash
npm run typecheck
npm test challenge00.test.ts
npm test challenge00b.test.ts -t "Challenge 0g"
npm test _sanity.test.ts
```

Confirm the required whole-suite `npm test` result is recorded after the fixes. A nonzero full-suite exit can reflect later unfinished challenges; preserve that evidence instead of claiming that the entire project passes.

### 3. Inspect and stage only reviewed Task 3 changes

```bash
git diff --check
git diff -- src/enums/httpStatus.ts src/middleware/rbac.ts src/middleware/hmacAuth.ts src/middleware/asyncHandler.ts src/middleware/securityHeaders.ts src/services/cache.ts
git add -- src/enums/httpStatus.ts
git add -- src/middleware/rbac.ts
git add -- src/middleware/hmacAuth.ts
git add -- src/middleware/asyncHandler.ts
git add -- src/middleware/securityHeaders.ts
git add -- src/services/cache.ts
git add -- docs/clearhouse-task-03-infrastructure.md
```

If one of those files contains unrelated uncommitted work, use `git add -p -- <actual-file-path>` to stage only the relevant hunks instead of staging the entire file. If unrelated work was already staged before this task, reconcile the intended commit contents locally before committing; do not blindly unstage or include a teammate's work.

Only if Cursor actually created and verified the optional participant-owned test file:

```bash
git add -- tests/task03-extra.test.ts
```

Do not stage an optional file that does not exist. Do not stage changed organiser tests, scoring files, secrets, database backups, `node_modules`, or raw generated logs. Task 3 does not require new changes to the already-established `.env` or development database.

### 4. Review and commit

```bash
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached -- src/enums/httpStatus.ts src/middleware/rbac.ts src/middleware/hmacAuth.ts src/middleware/asyncHandler.ts src/middleware/securityHeaders.ts src/services/cache.ts docs/clearhouse-task-03-infrastructure.md
git commit -m "fix: correct ClearHouse core infrastructure bugs"
git show --stat --oneline HEAD
```

If there are no changes because these fixes already exist, do not create an empty implementation commit. Record verification instead. If Git requests author identity, configure your actual name and verified email locally; do not invent an email address.

### 5. Push — choose the verified destination

**Variant A: the GitHub remote is `origin` and your actual branch is `main`:**

```bash
git push origin main
git rev-parse --verify HEAD
git ls-remote origin refs/heads/main
git status -sb
```

**Variant B: the GitHub remote is `github` and your actual branch is `main`:**

```bash
git push github main
git rev-parse --verify HEAD
git ls-remote github refs/heads/main
git status -sb
```

Use one verified variant, substituting your actual branch if it is not `main`. If no upstream exists and you want GitHub to be the tracking destination, use `git push -u origin main` or `git push -u github main` for that initial push. Do not change an existing CodeCommit/team upstream merely for convenience; explicit pushes work without changing it.

Compare the full local HEAD hash to the hash returned for the intended remote branch. A push is verified only when the command succeeds and the intended commit is present remotely. A GitHub push alone is not proof that the competition's CodeCommit grading pipeline received the submission.

### 6. Handle a rejected push without losing work

For an `origin/main` destination, fetch and inspect:

```bash
git fetch origin
git log --oneline --left-right HEAD...origin/main
git status --short
```

Substitute the real remote and branch. If only behind and the working tree is clean, fast-forward with `git merge --ff-only origin/main`. If both branches have new commits, integrate the teammate changes using the team's normal merge workflow, resolve conflicts, rerun affected tests and typecheck, then push. Do not force-push or rewrite shared commits.

For authentication failures, use your existing credential manager or browser sign-in. Never put a personal access token in source, a remote URL, a prompt, or a commit.

## Completion checklist

- [ ] Current checkout and Tasks 1–2 status inspected; existing work preserved.
- [ ] Role guard accepts matching roles and rejects absent/mismatched principals with the required response.
- [ ] Accepted nonces remain recorded for their relevant validity lifetime.
- [ ] Async errors reach `next(error)` without unhandled rejections or duplicate success responses.
- [ ] All existing HTTP enum values are correct.
- [ ] Correct CSP header is sent without globally weakening the policy.
- [ ] Cache invalidation deletes only the requested key.
- [ ] Typecheck, all six Challenge 00 tests, the focused 0g test, and sanity checks pass.
- [ ] Whole-suite regression result is recorded; unfinished features are identified honestly.
- [ ] Protected organiser files and the test script were not modified by this task.
- [ ] Completion note explains changes and remaining limitations.
- [ ] Reviewed commit and intended GitHub branch are verified, if you chose to push.

Next prompt request: **“Give me the complete enhanced Cursor prompt for Task 4 in one Markdown file, including GitHub push commands.”**
