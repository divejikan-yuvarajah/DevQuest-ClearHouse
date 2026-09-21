# ClearHouse — Enhanced Cursor Prompts for Tasks 1–2

Official submission repository (confirmed `origin`): https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b  
Confirmed submission branch: `main`  
Existing Windows checkout: `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
Historical GitHub reference: https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git  
Competition: DevQuest 2026 Final — nine-hour challenge  
Previously inspected GitHub reference commit (verify against the current CodeCommit checkout): `36bfeafc70e88e405188b80707ea703adcc7a5df`  
Purpose: audit the existing project, establish a reliable local setup, and prepare verified Git checkpoints.

## How to use this file

1. Open your existing CodeCommit checkout in Cursor: `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`. You have already cloned it; do not create another checkout.
2. Paste **Prompt 1** into Cursor's agent chat and let it finish its audit. It must inspect your current checkout; the reference commit is context, not a version to reset to.
3. Review its evidence and unresolved questions, then paste **Prompt 2** into the same chat. If you use a fresh chat, attach the audit notes that Prompt 1 created.
4. Run commands in the repository root. Cursor must identify whether your terminal is PowerShell, Git Bash, WSL, or another shell and adapt syntax accordingly.
5. Use the Git appendix after reviewing the changes. The prompts prepare commit and push commands; they do not automatically publish your work.

These are instructions for Cursor, not a claim that setup or tests have already passed. No project code was changed and no tests were run when this prompt pack was prepared.

## Repository facts to verify before acting

- The starter uses TypeScript, Express, Knex, SQLite, Vitest, and a plain browser client. Preserve this stack and its interfaces.
- `npm run typecheck` checks both application and test TypeScript projects.
- `npm test` invokes `vitest`; the protected `vitest.config.ts` sets `watch: false` and produces `test-results.xml`. Do not rewrite the test script to change its behaviour.
- `npm run migrate` invokes `delete-db` before applying migrations. It is a destructive local database reset, not an incremental-only migration command.
- At the reference commit, `delete-db` targets `main.sqlite`, but `knexfile.js` configures `main.sqlite3`. Fixing that specific package script is allowed and is tested by Challenge 0v.
- The reference commit's tracked root files do not include `.env`, `package-lock.json`, or `main.sqlite3`. The guide says `.env` is supplied; inspect the actual checkout and provision local configuration if it is absent.
- Tests use the supplied in-memory SQLite configuration with a single-connection pool. They also explicitly check that the local `main.sqlite3` file exists.
- The official reset helper runs only `00_noop.ts`. The demo seed `01_initial_accounts.ts` is currently a no-op and belongs to Task 23, not these setup tasks.
- `src/server.ts` exports an HTTP server, not just an Express app. Existing lifecycle and test assumptions must be preserved.
- `src/services/liveHub.ts` already tolerates the unimplemented WebSocket hub. Missing streaming is not a reason to rewrite startup or introduce a fake hub during setup.
- The inspected scoring file lists 45 bug entries totalling 922 points and 193 feature entries totalling 2,737 points. These are static scoring entries, not earned points or a test result. Recompute from the current checkout if needed.
- The guide gives bug fixes and feature implementation equal category weighting. Do not combine raw points into a single percentage without the actual grading formula.

---

## Prompt 1 — Task 1: Repository audit and implementation map

Copy the complete block below into Cursor.

````text
Act as my senior TypeScript engineer and project architect for the nine-hour DevQuest 2026 ClearHouse final.

Execute TASK 1 ONLY: audit the actual repository, identify dependencies and defects, and produce a concise implementation map. Do not implement the business logic in this task. Aim to finish the audit in roughly 10–15 minutes without repeatedly asking me to approve routine read-only work.

CONTEXT
- Official submission repository: https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b
- Confirmed remote: origin. Confirmed branch: main. Preserve both.
- Existing Windows checkout: C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b
- The earlier GitHub inspection is historical context; verify all file facts against this actual checkout.
- I will request later task prompts separately.
- The official tests are the exact behavioural specification. The challenge Markdown and guide explain the intent and competition rules.
- The repository may contain changes made after reference commit 36bfeafc70e88e405188b80707ea703adcc7a5df. Work from the current checkout and preserve all existing work.

NON-NEGOTIABLE RULES
1. Read applicable AGENTS.md and existing Cursor/project instructions before acting. Do not overwrite them or create conflicting rules.
2. Do not edit supplied tests/, config/, vitest.config.ts, or scripts.test in package.json. Read protected files as evidence. Do not execute config/result.ts: it sends a report to an external grading service.
3. Do not weaken TypeScript checks, assertions, timeouts, property generators, or test discovery. Do not add skips or test-only behaviour to production code.
4. Identify inherited NODE_ENV/test scaffolding separately from proposed changes. Do not remove existing scaffolding in this audit, and never use it to bypass business requirements.
5. Do not hardcode generated test inputs, accounts, signatures, dates, or success responses.
6. Preserve the existing architecture, database, exports, route contracts, and browser interfaces. No framework migration or dependency upgrade.
7. No git reset --hard, clean, force-push, automatic stash, branch replacement, commits, or pushes. Do not overwrite teammate changes.
8. Inspect configuration without printing credentials, JWT keys, HMAC secrets, tokens, or credential-bearing remote URLs. Redact values in notes.
9. Do not install packages, reset the database, start the server, or run a long full suite during this audit. Task 2 performs setup and baseline checks.
10. The only intended new file is docs/clearhouse-task-01-audit.md. If it already exists, preserve useful content and update it without erasing history or another person's work.

A. ESTABLISH CURRENT STATE
Run or obtain the equivalent of:

git status --short
git branch --show-current
git rev-parse --verify HEAD
git log -5 --oneline
git diff --stat
git diff --cached --stat

Inspect remotes locally, redacting credentials before reporting. The user confirmed origin points to https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b and the current branch is main. Recheck these values before preparing push commands; preserve this submission destination. If they differ, report the mismatch without overwriting remotes, switching branches, or guessing a replacement. Note detached HEAD, conflicts, dirty files, staged files, and missing upstream configuration. A personal GitHub push is not the official submission.

B. INSPECT THE PROJECT
Use rg/rg --files where available. On PowerShell without rg, use Get-ChildItem and Select-String equivalents.
Read:
- README.md; supplied Challenges.md and guide if present in the workspace.
- package.json, any existing lockfile, knexfile.js, tsconfig.json.
- vitest.config.ts, tests/tsconfig.json, tests/setup.ts, tests/testBase.ts, tests/_sanity.test.ts — read-only.
- config/scores.ts, config/buildspec.yml, config/run-tests.mjs and other relevant grading configuration — read-only; do not run grading upload scripts.
- src/server.ts and its imports; route/controller/domain/repository/service/middleware boundaries.
- db/db-config.ts, all migration filenames and their up/down behaviour, both seed files.
- client/index.html, client/js/app.js, dashboard.js, signer.js, liveFeed.js, and dashboard.css.

Inventory all NotImplementedError throw sites and other explicit TODOs. Distinguish:
1. A genuine missing feature.
2. Working-looking code with a demonstrable defect.
3. An environment/setup problem.
4. A suspected issue requiring a test run or deeper reading.

Do not present a suspected bug as proven. For each observed defect, give the location, current behaviour, expected rule, and corresponding test.

C. READ THE TEST STRUCTURE AND BUILD A COVERAGE MAP
Inspect all challenge test groups, imports, helpers, and assertions relevant to their entry points. Record tests beyond the prose summary, including Challenge 3j's stateful model and Challenge 12d's browser signing.

Create a compact table containing:
challenge/test file | bug or feature category | implementation files/exports | dependencies | key invariants | current stub/defect evidence | later task number.

Use these established task numbers:
1 audit; 2 setup/baseline; 3 core infrastructure bugs; 4 assets/money; 5 HMAC; 6 tokens/permissions; 7 registry/cache/shared-state bugs; 8 account/balance/idempotency helper bugs; 9 input/security;
10 ledger; 11 holds/releases; 12 deposits/withdrawals/idempotency; 13 settlement; 14 basic order book/matching; 15 execution policies; 16 stops/amendments/concurrency/performance; 17 risk; 18 closure; 19 reconciliation/migration; 20 operations; 21 API/config/cache;
22 dashboard/signing; 23 seed/accounts API; 24 portfolio/risk/trades dashboard; 25 OpenAPI; 26 events/replay; 27 market data; 28 fees; 29 netting; 30 strategies; 31 WebSocket server; 32 live client; 33 integration; 34 regression; 35 browser/demo; 36 submission.

Map Challenge 00/00b/00c and bug-scored tests embedded in other challenge files explicitly. Read the scoring arrays statically; do not modify or regenerate them. List the category counts and point sums from the actual checkout, with no earned-score claim.

D. IDENTIFY THE MOST IMPORTANT CONTRACTS
Record these implementation constraints with references to actual interfaces/tests:
- BigInt internally, exact amount strings at JSON boundaries, asset exponents and rounding.
- Balanced ledger postings per asset; consistency with available/held projections.
- Atomic mutations and idempotency; SQLite concurrency and single-connection considerations.
- Price-time priority, order lifecycle, risk reservations, and order-book consistency.
- Database rollback does not automatically restore in-memory matching state.
- API success/error envelopes and permission exceptions explicitly required by tests.
- Snapshot/delta sequence contracts, reconnect states, browser DOM IDs, signing payload shape.
- Property-test seeds/counterexamples and algorithmic performance requirements.

E. DEFINE TASK 2'S EXACT SCOPE
Confirm the database filename mismatch, actual presence of .env and lockfiles, Node/npm requirements, startup behaviour, protected files, and install strategy.
Inspect env variable usage without printing values. Distinguish basic startup requirements from later authenticated endpoint requirements; HMAC_SECRET is used by normal signed requests in the current middleware.
Confirm whether the existing liveHub wrapper tolerates the unimplemented hub; do not invent a startup blocker.
Inspect the sanity suite's 11 checks and which require the development database file.
Record that successful npm run seed currently does not prove demo funding exists.

F. WRITE THE AUDIT NOTE
Create/update docs/clearhouse-task-01-audit.md with:
1. Current commit, branch, clean/dirty state, runtime availability, and redacted remote roles.
2. Observed structure and command scripts.
3. Protected boundaries and existing baseline modifications.
4. Challenge-to-file-to-task coverage table and dependency order.
5. Static scoring totals, clearly marked as available points.
6. Verified defects versus hypotheses.
7. Task 2 setup plan and bounded failure handling.
8. Highest-priority next implementation tasks.
9. Uncertainties and an explicit statement that no tests have been run during this audit.

Keep the note concise enough to use during a nine-hour event. Do not copy entire source or test files into it. Do not include secrets or personal account credentials.

G. VERIFY AND REPORT
Run git diff --check. Inspect git status and confirm only the intended audit note was added/updated by this task. Existing unrelated changes must remain intact.
Return:
- What you inspected and the current commit.
- The audit note path.
- The three most consequential findings.
- The exact next actions for Task 2.
- Any real blocker requiring information I have not supplied.
- Suggested commit message: docs: map ClearHouse challenges and setup requirements.
- Commands to stage only the audit note, review, commit, and push to the confirmed CodeCommit origin/main. Present commands; do not execute commit/push automatically. Include:
  npm run typecheck
  git add -- docs/clearhouse-task-01-audit.md
  git diff --cached --check
  git diff --cached --stat
  git commit -m "docs: map ClearHouse challenges and setup requirements"
  git push origin main
  git rev-parse --verify HEAD
  git ls-remote origin refs/heads/main
  If dependencies are not ready, defer the commit until Task 2 enables typechecking; do not claim it passed. Inspect unrelated staged work before committing.

Do not implement Task 2, claim tests passed, or wait for confirmation before completing the read-only audit and its note.
````

---

## Prompt 2 — Task 2: Environment setup and baseline verification

Copy the complete block below after Task 1 finishes.

````text
Act as my senior implementation engineer for the DevQuest 2026 ClearHouse final.

Execute TASK 2 ONLY: make the local development setup reproducible, apply the specifically allowed database-script correction, run meaningful setup checks, and record a truthful baseline. Read docs/clearhouse-task-01-audit.md and applicable project instructions first. Target roughly 15–25 minutes; use actual progress rather than sacrificing correctness to the estimate.

Official submission repository: https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b
Confirmed remote: origin. Confirmed submission branch: main.
Existing checkout: C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b
Preserve origin and main; personal GitHub is not the submission destination. Recheck the remote and branch before preparing commands and report any mismatch without automatically changing them.

Use the current checkout. Reference commit 36bfeafc70e88e405188b80707ea703adcc7a5df is historical context, not a reset target. Preserve changes made by me or teammates.

RULES AND SCOPE
- Supplied tests/, config/, vitest.config.ts, and package.json's test script are protected and read-only. Do not execute grading-report upload scripts.
- Preserve the existing stack, runtime interfaces, database strategy, strict TypeScript settings, and test runner configuration.
- No test skipping, assertion weakening, timeout inflation, hardcoded fixture responses, new production test-detection branches, or disabling security middleware.
- The intended functional code change is only correcting scripts.delete-db to use the actual development DB filename. Other application bugs belong to later tasks; report a concrete setup blocker instead of implementing a whole challenge.
- Environment work may add missing local .env configuration, a minimal .gitignore, an installation-generated lockfile, and a setup note. Do not replace existing versions blindly.
- Do not change application code just to turn expected challenge failures green. Do not replace NotImplementedError with placeholder success results.
- Do not automatically commit, push, force-push, reset, stash, rename branches, or overwrite remotes. Prepare reviewed commands at the end.
- Never print secret values. The competition .env contains disposable demo-only configuration; it must never contain personal cloud, GitHub, banking, or production credentials.

A. PREFLIGHT AND PRESERVATION
1. Identify shell and OS; provide compatible commands.
2. Run git status --short, git branch --show-current, git rev-parse --verify HEAD, git diff --stat, and git diff --cached --stat.
3. Record the initial state of protected paths and scripts.test. Compare final changes with this initial state, not merely with a possibly already-modified HEAD. Do not revert pre-existing modifications automatically.
4. Run node --version, npm --version, and git --version. Check package.json engines. The guide requires Node >=18.19 and recommends 20/22; prefer an already-installed compatible Node 22 version. Do not upgrade global tooling unnecessarily.
5. Inspect whether dependencies, a lockfile, .env, and main.sqlite3 exist without dumping their contents.
6. Check whether a project server or DB writer is active. Stop only a process you own or that is positively identified as this project's process before resetting its local database. Do not kill all Node processes.

B. DEPENDENCY INSTALLATION
- If package-lock.json exists and matches package.json, use npm ci for a clean reproducible installation, unless the current installation already verifies and reinstalling would add no value.
- If no lockfile exists, use npm install and retain the generated package-lock.json after review.
- If npm ci reports a mismatch, diagnose it. Do not delete the lockfile or silently rewrite dependency versions. Follow the actual current package manifest and explain any necessary lockfile regeneration.
- Do not run npm audit fix --force, upgrade to latest versions, change package managers, or replace sqlite3/bcrypt to evade installation failures.
- If a required package version is unavailable or incompatible, capture the package/version and exact error. Treat that as a blocker requiring a targeted resolution; do not invent a version or broadly downgrade the stack.
- For sqlite3 or bcrypt native binding failures, check the active Node version and install output. Use the compatible runtime/toolchain before proposing dependency edits. Never install with --ignore-scripts as a way to declare the native modules usable.
- Validate core modules can load using imports or the sanity dependency check. A completed install process alone is insufficient.

C. SAFE ENVIRONMENT CONFIGURATION
The guide says .env is supplied, but it is not tracked at the reference commit. Inspect the current filesystem.
- If .env exists, retain its values. Check required key names and non-empty values without logging them.
- If it is absent, create a local demo-only .env with PORT=3001 and a cryptographically random disposable JWT_PRIVATE_KEY using Node's crypto module. Write the value directly to the file without printing it.
- Inspect current HMAC middleware. If HMAC_SECRET is required for normal signed requests, add a separate cryptographically random demo-only value if missing. State that basic startup and later signed-route readiness are distinct.
- Do not replace existing keys on every run. Do not add real external-service secrets; none are needed for these setup tasks.
- Do not use NODE_ENV=test to run the normal development server. Leave the supplied test environment setup to the official runner.
- Confirm PORT is numeric and available. If occupied, identify the process; select an unused port only when necessary and document the actual backend URL and any later client configuration impact.
- The event guide requires the local competition .env and main.sqlite3 for submission. Do not add ignore rules for them. Confirm they contain only disposable competition data before staging them later.

D. IGNORE GENERATED AND PRIVATE LOCAL MATERIAL
Create/extend a minimal .gitignore only if needed, preserving existing legitimate rules. Include node_modules/. Exclude local backup directories, raw logs, temporary output, and test-results.xml when those are not required tracked artifacts under the current repository's instructions.
Do not ignore package-lock.json, the required competition .env, or main.sqlite3. Do not blindly copy a generic Node .gitignore that ignores all *.sqlite3 or .env files. Do not ignore application source, tests, or grading configuration.
Keep private pre-reset database backups outside the repo, or under a clearly excluded backup directory. Do not commit those backups.

E. FIX THE CONFIRMED DATABASE SCRIPT DEFECT
1. Read knexfile.js to obtain the real development filename.
2. Compare it with package.json scripts.delete-db. At the reference commit it is incorrectly del-cli main.sqlite.
3. Change only scripts.delete-db to del-cli main.sqlite3 if the mismatch still exists.
4. Preserve scripts.test and all unrelated package fields/versions. If already corrected, make no redundant edit.
5. Inspect the exact package.json diff. Do not use a formatter that rewrites the entire manifest unnecessarily.

F. INITIALISE THE DEVELOPMENT DATABASE SAFELY
IMPORTANT: npm run migrate deletes and recreates the configured local DB.
- If the database is absent, proceed with fresh creation.
- If it contains existing work, first stop its known writers and create a verified backup outside the repository. Use SQLite's backup mechanism, or copy only after a clean shutdown with any WAL state handled correctly. Do not blindly copy an actively written database file.
- If safe preservation is impossible or another teammate is actively using it, report that specific blocker before a destructive reset. Do not proceed by assumption.

Once fresh setup or preservation is established, run sequentially:

npm run migrate
npm run seed

Stop on migration failure, inspect the real cause, and avoid repeated destructive resets. Check that main.sqlite3 exists and the migrations succeeded. Do not manually fabricate a blank file just to satisfy the existence check.
The current demo seed is a no-op. Record seed execution separately from demo-data readiness. Do not implement funded accounts, ledger posting, or Challenge 20 in this task.
Preserve the in-memory test configuration and its single-connection pool; do not point tests at the development DB.

G. RUN SETUP VERIFICATION
Run sequentially and record command, exit code, duration, and actual result:

npm run typecheck
npm test _sanity.test.ts

The sanity suite contains 11 checks in the inspected version. Use the actual output if the current checkout differs. The expected outcome after setup is a successful typecheck and all sanity checks passing.

If checks fail:
- Separate environment failures, pre-existing implementation defects, and new regressions.
- Do not edit the test or weaken the typechecker.
- Diagnose import/module/native binding issues before business logic.
- If a protected file or declared dependency is itself inconsistent, report it with evidence; do not change protected settings to conceal it.
- A remaining true application defect must be named and handed to its planned task. Do not declare setup fully verified while a sanity check is failing.
- For property failures, retain the seed/path/counterexample and command. Do not hardcode the counterexample in production.

H. RECORD A BOUNDED CHALLENGE BASELINE
Run focused commands separately:

npm test challenge00.test.ts
npm test challenge01.test.ts
npm test challenge00b.test.ts -t "Challenge 0v"

The last command must exercise the database-script test and report its actual pass/fail result. Vitest's name filter is for local diagnosis only; it does not change the supplied tests or constitute a full grading run. Report excluded tests as not exercised, not as passed.

Many Challenge 00/01 tests are expected to fail at this stage. Categorise their failures for Tasks 3–6 and beyond. Do not implement those tasks here.

Do not run a full multi-minute challenge suite repeatedly on the untouched stubs. If a baseline full suite is run because it fits the remaining budget or the project instructions require it, run the unchanged npm test command once and report its complete result. If it is interrupted, label it INCOMPLETE; do not infer a score.

Each filtered run may overwrite test-results.xml. Keep a small textual command/result table or separate copies of reports outside protected paths if useful. Never present the last filtered report as whole-suite evidence and never edit XML results.

I. STARTUP AND BROWSER SMOKE CHECK
1. Start npm start in a separate terminal/session after tests have completed. Record the actual port.
2. Confirm the server stays running and GET /api/assets responds with the real supported-asset data.
3. Confirm an unknown API path returns the required not-found response. Inspect an empty-book read if useful, but record known placeholder defects instead of fixing Task 7 early.
4. Do not require /health or /ready to work yet; their handlers are unimplemented Task 20 features in the reference starter.
5. Open client/index.html through an HTTP static server such as Cursor/VS Code Live Server, as the guide instructs. Do not use a file:// URL and do not assume Express serves the client.
6. Inspect client/js/app.js to identify the existing backend URL/configuration. Do not redesign the UI or hardcode a second backend origin.
7. Record page loading, module loading, and visible console/network errors. Missing dashboard features/signing/live streaming may be expected. Distinguish a loaded page from a fully working dashboard.
8. If no browser capability is available, mark browser verification NOT RUN and provide the exact manual URL/steps; do not claim a visual pass.
9. Stop only server/static-server processes started by this task when finished, unless I need them left running; if left running, identify them clearly. Clean up listeners before another test run.

J. WRITE docs/clearhouse-task-02-setup.md
Include:
- Current commit/branch, runtime versions, shell, and installation command.
- Whether a lockfile was created or reused; no invented dependency guarantees.
- Exact changed files and why each change belongs to setup.
- Env key names only, required local files, and actual backend/client URLs.
- Database filename, backup status/location without confidential data, migration result, seed result, and current demo-seed limitation.
- Verification table: command | exit code | result | scope | remaining issue.
- Sanity count, typecheck outcome, focused challenge baseline, and explicit indication of whether the full suite/browser were run.
- Known starter defects and next-task handoff.
- Confirmation that protected files and scripts.test were not modified by this task.
- Reviewed Git staging/commit/push commands for the confirmed CodeCommit origin/main, with publication left for me to execute or explicitly authorise. Include the task-specific commit message and the exact command git push origin main, followed by local/remote commit-hash verification.

K. FINAL DIFF AND COMPLETION CRITERIA
Run git diff --check, git status --short, and inspect the changed-file list. Verify protected-file content against the pre-task snapshot. Do not print .env contents or credential-bearing diffs in the report.

Task 2 is COMPLETE only if:
1. Compatible runtime and loadable dependencies are available.
2. Required local config exists without exposing secret values.
3. The database-script mismatch is corrected or was already correct.
4. Development migrations and seeds have run successfully and the actual DB exists.
5. Typecheck and all sanity checks pass.
6. Focused baseline results are recorded honestly; unimplemented feature failures remain visible.
7. Startup is verified, or a genuine runtime blocker is explicitly reported and completion is marked partial.
8. Existing user changes and all protected boundaries remain intact.

Return a concise status report with changed files, actual verification results, unresolved issues, next task, and exact Git commands. Include targeted staging for the files actually changed, review commands, and:
git commit -m "chore: establish ClearHouse setup and fix database reset path"
git push origin main
git rev-parse --verify HEAD
git ls-remote origin refs/heads/main
Run required checks before committing, and compare the full local and remote hashes after pushing. Do not report a successful submission from a local commit alone.

Do not call all challenges complete, compute earned points from partial runs, automatically push, or expand into the next feature task.
````

---

## AWS CodeCommit commit and push commands

Your confirmed submission destination is:

| Setting | Confirmed value |
|---|---|
| Remote | `origin` |
| Branch | `main` |
| Repository | `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b` |
| Local checkout | `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b` |

These commands publish your reviewed local work when **you run them**. Run each step separately and inspect its output. Preserve the configured remote and branch. Your personal GitHub repository is separate; no GitHub remote setup is needed for submission.

### 1. Open the existing checkout and verify the destination

You have already cloned the repository. In PowerShell:

```powershell
Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"
git status --short
git branch --show-current
git remote -v
git log -5 --oneline
git diff --stat
git diff --cached --stat
```

Confirm the branch is `main` and both origin URLs match the CodeCommit URL above. If they differ, inspect the situation before proceeding. Do not run `git remote set-url`, rename branches, create a replacement repository, or overwrite existing work. Keep any credentials in remote URLs out of shared output.

### 2. Verify, commit, and push Task 1's audit

First check for unrelated staged changes. Commit only the intended task files; do not accidentally include another person's staged work.

The guide requests typechecking before every commit. If dependencies are not yet available, retain the audit uncommitted until Task 2 installs them and typecheck can run. Record separate audit and setup commits afterward if practical. Never claim a check ran when it did not.

```powershell
npm run typecheck
git diff --check
git add -- docs/clearhouse-task-01-audit.md
git diff --cached --check
git diff --cached --stat
git diff --cached -- docs/clearhouse-task-01-audit.md
git commit -m "docs: map ClearHouse challenges and setup requirements"
git push origin main
```

Stop on failed checks or a failed commit/push and inspect the result before continuing.

### 3. Verify and stage Task 2 changes

```powershell
npm run typecheck
npm test _sanity.test.ts
npm test challenge00b.test.ts -t "Challenge 0v"
git diff --check
git status --short
git diff -- package.json
```

Run only the following staging lines whose files actually exist and belong to this task:

```powershell
git add -- package.json
git add -- package-lock.json
git add -- .gitignore
git add -- docs/clearhouse-task-02-setup.md
```

The guide requires the disposable competition `.env` and local `main.sqlite3`. Inspect them locally first; ensure no real credentials or personal data have been added. Stop database writers before committing a consistent database file, then stage the required files:

```powershell
git add -- .env main.sqlite3
```

If ignored, inspect the specific ignore rule and align it with the competition guide. Do not use a blanket force-add for unrelated secrets or generated files. Do not commit node_modules, backups, raw logs, or personal authentication files.

Review staged filenames and non-secret diffs. A plain full staged diff can print the .env values, so use targeted review:

```powershell
git diff --cached --check
git diff --cached --stat
git diff --cached --name-only
git diff --cached -- package.json package-lock.json .gitignore docs/clearhouse-task-02-setup.md
git commit -m "chore: establish ClearHouse setup and fix database reset path"
git push origin main
```

If checks fail, fix issues within scope or report the blocker. A checkpoint of incomplete work must be clearly labelled and must not claim a passing setup. Expected failures in unimplemented challenges should remain visible in the baseline report.

### 4. Verify each successful push

```powershell
git rev-parse --verify HEAD
git ls-remote origin refs/heads/main
git status -sb
```

Compare the full local HEAD hash with the hash returned for `refs/heads/main`. Matching hashes confirm that the intended commit is present on the remote branch. This confirms repository delivery; it does not prove grading completed or tests passed. If the remote advances again, fetch and inspect before drawing conclusions.

Repeat the verification, task-specific commit, and `git push origin main` workflow after each verified milestone. Use explicit remote/branch commands even if an upstream is configured. There is no need to change upstream tracking or add a GitHub remote.

### 5. If the push is rejected because the remote advanced

Do not force-push. First fetch the confirmed remote and inspect the divergence:

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/main
```

If your tree is clean and you are only behind, fast-forward with `git merge --ff-only origin/main`. If both sides contain commits, review and integrate the teammate changes using the team's normal merge workflow, resolve conflicts, rerun affected tests/typecheck, then push with `git push origin main`. Do not automatically rewrite shared history or stash uncommitted work.

### 6. Authentication and author identity

If Git requests HTTPS authentication, use the **Git username and password provided on the DevQuest assessment page** for this CodeCommit repository. Do not use a GitHub password/token for this destination. Do not place credentials in Cursor chat, tracked files, this prompt file, or the remote URL. If authentication fails, record the error with sensitive values removed and inspect the credentials used for this repository; do not replace the submission remote.

If Git author identity is missing, configure your actual name and email locally; do not guess an email address. Author identity is separate from the assessment page's Git login.

## What to send back after Cursor finishes

- Task 1 audit summary and Task 2 setup result.
- Typecheck output and sanity pass/fail counts.
- The first complete relevant error if a step is blocked.
- Focused Challenge 00/01 baseline counts and the Challenge 0v result.
- Changed-file list and commit hash, if committed.
- CodeCommit `origin/main` push result and matching local/remote commit hashes, if pushed.

Do not send .env values, authentication tokens, or personal credentials. Next request: **“Give me the complete enhanced Cursor prompt for Task 3 in one Markdown file.”**
