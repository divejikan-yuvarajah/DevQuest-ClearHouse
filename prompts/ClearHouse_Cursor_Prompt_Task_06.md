# ClearHouse — Enhanced Cursor Prompt for Task 6

**Task:** Access tokens, refresh rotation, role checks, and account isolation  
**Official repository (`origin`):** https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b  
**Confirmed branch:** `main`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git  
**Inspected reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

## How to use

Open your existing CodeCommit project in Cursor and paste the entire implementation prompt below into Agent mode. Cursor must inspect your current checkout and actual completion of Tasks 1–5. Saving a prompt or pushing setup notes does not implement the corresponding source changes.

Task 6 finishes Challenge 01's session/authorisation area. If Tasks 4–5 are implemented correctly, the complete `challenge01.test.ts` should now pass. Do not claim that outcome until it has been run successfully.

The Git commands below use your confirmed **CodeCommit `origin/main`** submission destination. Preserve it; GitHub is only the earlier inspection reference. This prompt file contains instructions, not a claim that local code changes, tests, or pushes have already occurred.

## Required behaviour from the supplied tests

| Scenario | Required result |
|---|---|
| Operator token calls an admin-only route | `403 FORBIDDEN` |
| No token calls an admin-only route | `403 FORBIDDEN` |
| Admin token calls the admin-only kill-switch route | Accepted |
| Valid token reads its own account balance | Accepted |
| Valid token reads another account balance | `403 FORBIDDEN` |
| Anonymous request reads the tested balance route | Existing anonymous behaviour remains accepted |
| Refresh token R0 is exchanged successfully | New token pair; R1 differs from R0 |
| R0 is reused after rotation | `401`; its refresh family is revoked |
| R1 is used after R0 reuse | `401` too |

The starter login endpoint accepts `{ accountId, role }` for this assessment. Preserve that explicit fixture/bootstrap interface. It is not proof of a production identity-verification system, and this task does not add password/OAuth flows or redesign the competition's access rules.

---

## Task 6 implementation prompt

Copy this complete block into Cursor.

````text
Act as my senior TypeScript backend engineer for the nine-hour DevQuest 2026 ClearHouse final.

Execute TASK 6 ONLY: implement session token issuance and verification, secure refresh rotation/reuse detection, and the existing role/account ownership integration. Complete the actual implementation and tests, not just a plan.

CONFIRMED PROJECT AND DELIVERY
- Current project path: C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b
- origin: https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b
- Branch: main
- Historical GitHub reference commit: 36bfeafc70e88e405188b80707ea703adcc7a5df; inspect actual current CodeCommit files before applying any assumptions.

A. PRE-FLIGHT, RULES, AND TASK BOUNDARIES

1. Read applicable AGENTS.md, current project instructions, and available docs/clearhouse-task-* notes. Verify previous task implementation from source/results, not merely the existence of prompt files.
2. Preserve all existing changes and teammate work, including pre-staged files. No hard reset, clean, automatic stash, force-push, replacement checkout, branch renaming, or history rewrite.
3. Supplied tests/, config/, vitest.config.ts, tests/tsconfig.json, and scripts.test in package.json are protected. Read only. Do not skip tests, weaken assertions, relax typechecking, alter property generators, inflate timeouts, or edit test-results.xml.
4. Do not execute config/result.ts or any code that submits grading reports. Do not change test scripts to run fewer tests under grading.
5. Do not introduce source branches detecting tests, NODE_ENV=test, VITEST, fixture account names, or special test headers. Preserve inherited scaffolding without expanding it into a bypass.
6. Keep the existing stack and package versions. Use the installed jsonwebtoken library and node:crypto; no new auth framework or dependencies.
7. Preserve synchronous public signatures, exported types, controller envelopes, route paths, and existing permission exceptions.
8. Do not implement a database-backed user identity system, require passwords, require UUID account IDs, or require login accounts to exist in the ledger. Official fixtures deliberately issue tokens for account IDs such as operator-acct and admin-acct without creating ledger accounts first.
9. Keep token values, secrets, credentials, request bodies, and authorization headers out of logs/reports. Use disposable test keys only in participant tests; never use real Git credentials as application keys.
10. Complete local implementation and verification autonomously. Prepare reviewed CodeCommit commands afterward; do not automatically commit/push or continue to Task 7.

Target roughly 30–45 minutes if prerequisites are healthy; report concrete blockers honestly rather than broadening into the whole platform.

Run:

git status --short
git branch --show-current
git rev-parse --verify HEAD
git diff --stat
git diff --cached --stat

Check origin and main against the confirmed destination. If they differ, explain the mismatch without overwriting remotes or switching branches. Capture the initial state of protected paths, scripts.test, and files you intend to edit so you can identify only your changes later.

B. READ THE CONTRACTS AND BASELINE

Read completely:
- src/domain/session.ts
- src/controller/authController.ts
- src/routes/authRoutes.ts
- src/middleware/rbac.ts
- src/types/express.d.ts
- Challenge 1d and its login helper in tests/challenge01.test.ts

Inspect related code:
- src/server.ts: dotenv loading order, attachPrincipal placement, auth routing, and auth rate-limit mount.
- src/routes/riskRoutes.ts and setKillSwitch controller behaviour.
- src/routes/ledgerRoutes.ts and the current balance/statement handlers.
- src/services/liveHub.ts: verifyAccessToken must remain a reusable synchronous Principal-returning function.
- src/middleware/asyncHandler.ts and HttpStatus enum from Task 3.
- Existing token/key references, current env key presence without printing values, and jsonwebtoken usage/options if any have already been implemented.
- tests/testBase.ts, setup.ts, lifecycle hooks, and relevant existing participant tests.
- Challenge 0a in tests/challenge00.test.ts; auth consumers in challenge05, challenge13, challenge21.

Run a BEFORE baseline:

npm test challenge01.test.ts -t "Challenge 1d"
npm test challenge00.test.ts -t "Challenge 0a"

Record actual exit codes, counts, and first meaningful failures. Distinguish missing prerequisites, controller crashes, token failures, and permissions errors. Do not invent a prior full-suite comparison if no completed baseline exists.

C. EXPECTED FILE SCOPE

Primary files:
- src/domain/session.ts
- src/controller/authController.ts, for controlled validation/configuration errors while preserving the existing request/response interface.
- src/middleware/rbac.ts, only as required to retain/correct the intended policy and real token integration.

Additional files only if directly justified:
- src/types/express.d.ts or existing routes if a genuine integration defect is found; the reference types/routes are already wired.
- A participant-owned tests/task06-session-extra.test.ts for meaningful security/state-machine coverage.
- docs/clearhouse-task-06-sessions.md.

Do not implement ledger arithmetic just to make an ownership test green, replace auth with canned token strings, or stub verifyAccessToken in production. Do not change the role/risk APIs or global rate limiter to simplify tests.

D. SESSION DESIGN — KEEP INTERFACES, EXPLICITLY DOCUMENT CHOICES

Preserve:
Role = "operator" | "admin";
Principal = { accountId: string; role: Role };
TokenPair = { accessToken: string; refreshToken: string };
issueTokens(principal): TokenPair;
verifyAccessToken(token): Principal;
rotateRefreshToken(token): { tokens: TokenPair };
RefreshReuseError;
resetAllSessions().

The existing family record has accountId, role, currentJti, and revoked. Keep the in-memory family model for this challenge. It may be extended locally with expiry metadata if needed, without changing public interfaces or introducing new persistence.

Use genuine signed tokens and cryptographically unpredictable family/JTI identifiers, such as crypto.randomUUID(). Never use Math.random(), a fixed account-derived token, an incrementing public counter alone, or unsigned Base64 JSON as authentication.

Inspect existing key/algorithm conventions first. When none are prescribed and JWT_PRIVATE_KEY is the opaque demo secret created during setup, a pinned HS256 configuration with that secret is a reasonable local design. If the current project explicitly uses a PEM/asymmetric configuration, preserve the intended compatible key and fixed algorithm. Do not select the algorithm from an untrusted token header or support an HS/RS mix with the same key material.

Pin the verification algorithm allowlist to the intended algorithm; reject "none" and unintended algorithms. JWT_PRIVATE_KEY is the existing configuration key name; it does not by itself prove an RSA private key. Never print its value.

Choose and document access/refresh lifetimes if not specified by current tests or code, for example 15 minutes for access and 7 days for refresh. These are design choices, not official asserted durations. Keep them in clear internal constants; use correct JWT NumericDate seconds, not Date.now() milliseconds.

Use explicit token-purpose claims to distinguish access from refresh, plus account identity, role, family ID, JTI, issued-at, and expiration. Exact internal claim names may follow existing conventions. If none exist, a consistent scheme such as sub, role, tokenUse, sid, jti, iat, exp is suitable. No need to invent an external issuer/audience service; if fixed issuer/audience claims are added, verify them consistently everywhere.

Ensure both tokens change when a new pair is issued even within the same second. Do not rely on identical iat/exp alone to make them unique. Access and refresh must not be interchangeable.

Key lifecycle:
- Read the configured key after dotenv has been loaded; avoid capturing an undefined env value at module import merely because server.ts loads dotenv later.
- Do not generate a new key on each call or silently fall back to an embedded development/test secret.
- If the configured key is absent, identify a real setup/configuration error. Preserve existing values; provision a disposable local demo key only when necessary under the established setup rules.
- Keep HMAC_SECRET separate from JWT_PRIVATE_KEY and from CodeCommit credentials.

E. IMPLEMENT issueTokens(principal)

1. Validate accountId is a nonblank string and role is exactly operator/admin, without coercing arbitrary objects or accepting privilege fields from a body spread. Preserve valid identifier bytes; reject blank IDs rather than silently inventing one.
2. Do not demand ledger registration or an account-type lookup. Preserve the assessment's bootstrap login contract.
3. Create a fresh family ID and record the immutable issuing accountId/role.
4. Generate unique IDs for access/refresh tokens, with the refresh token's JTI becoming that family's currentJti.
5. Sign the pair with distinct purpose claims and appropriate expiry.
6. Register the complete active family only once token creation succeeds. Avoid orphan records if signing fails.
7. Return exactly { accessToken, refreshToken } as strings. Do not leak the family record, secret, decoded internal state, or expiry metadata through a changed public response.

Independent logins, even for the same account, should create independent families. A later replay in one family must not revoke another login's family unless an explicit current contract says otherwise.

F. IMPLEMENT verifyAccessToken(token)

1. Validate the runtime token value as a nonempty primitive string.
2. Verify its cryptographic signature with the pinned algorithm and configured key; enforce expiration and any applicable nbf/issuer/audience claims. Do not authenticate with jwt.decode(), ignoreExpiration, or a payload cast alone.
3. Validate the verified payload shape: object claims, access purpose, nonblank accountId, valid role, valid family/JTI IDs, and valid numeric time fields. Handle jsonwebtoken's string-payload possibility without blind casting.
4. Reject refresh tokens presented as access tokens and malformed/tampered/expired tokens.
5. Return a fresh { accountId, role } Principal, not the full decoded payload or a mutable reference to stored family state.
6. Do not mutate session state on a read/verification operation.

Family revocation design: the official replay assertion explicitly requires rejecting the newest refresh token after reuse. For coherent family-wide revocation, also consult family state during access verification and reject missing/revoked families or identity mismatches. Document this as the chosen stronger family policy where not separately asserted by the official test.

Do not require an access token's JTI to equal currentJti: that field tracks the CURRENT REFRESH token. Ordinary successful refresh need not revoke still-valid prior access tokens; they remain usable until expiry or explicit family revocation under this policy. Refresh reuse revokes the family and therefore its access tokens too if family-state checking is implemented.

Preserve synchronous return/throw behaviour so attachPrincipal() and liveHub authenticate() can use it unchanged. No database query or Promise return in this existing synchronous API.

G. IMPLEMENT rotateRefreshToken(token) AS A STATE TRANSITION

Follow this exact order to avoid replay and forged-revocation bugs:
1. Validate token shape and cryptographically verify it with the pinned algorithm/key. Require refresh purpose and valid claims, including expiry.
2. Only after successful verification, locate the referenced family. Do not use jwt.decode() claims to revoke a family before verifying the signature.
3. Reject unknown families and identity mismatches without mutating another family's state. Do not recreate a missing family from token claims.
4. Reject a revoked family. Use the existing RefreshReuseError when appropriate for revoked/reused refresh-family state; the controller has a specific mapping for it.
5. Compare the verified refresh JTI with family.currentJti.
6. If they differ for a genuine valid token belonging to that family, this is reuse: mark the family revoked BEFORE throwing RefreshReuseError. Do not merely reject the old token and leave the current one active.
7. If they match, create a fresh access/refresh pair IN THE SAME FAMILY, using the stored accountId/role. New refresh JTI must differ; both token strings must rotate even when issued in the same second.
8. Once signing succeeds, atomically replace currentJti with the new refresh JTI and return { tokens: { accessToken, refreshToken } }.

Do not call public issueTokens() to perform refresh if that creates an unrelated family. Use a private helper that can construct a pair for an existing family. Otherwise replay of the old family would fail to revoke the newly issued refresh token and the official test would fail.

Keep synchronous verify/check/sign/update execution with no await between checking currentJti and consuming it. The existing API is synchronous; two calls with the same old refresh token cannot both succeed. In a deliberate race, one can issue a pair and the second can detect reuse and revoke that family, making the newly issued pair unusable. This is consistent with reuse detection; document it rather than promising both callers a valid session.

An expired, malformed, wrong-purpose, or bad-signature token is rejected without revoking an unrelated active family. Treat family revocation on genuine stale JTI reuse separately from general invalid input.

Keep revoked family information for the required validity horizon, or ensure missing-family rejection has equivalent behaviour. Do not add a background cleanup timer that leaves tests running or delete active state during routine validation. Any optional bounded cleanup must preserve token lifetime/reuse semantics and must not consume event time during Task 6.

H. PRESERVE resetAllSessions()

Keep this existing function and export. It should clear the actual family/session state, including any new indexes you add. It must not rotate the signing key or leave a second active-token registry behind.

Do not expose it as an HTTP route, invoke it per request, or introduce a new production test-environment branch. Under the family-state policy, previously issued tokens fail after reset because their families are absent. Restore/reset state in participant tests so cases remain isolated.

I. CONTROLLERS AND HTTP CONTRACTS

Preserve these routes and envelopes:

POST /api/auth/login
body: { accountId, role }
success: 200 with { data: { accessToken, refreshToken }, meta: {} }

POST /api/auth/refresh
body: { refreshToken }
success: 200 with { data: { accessToken, refreshToken }, meta: {} }

Malformed input should return 400 with { error: { code: "INVALID_REQUEST", details: [...] } } using the established details shape. Null/missing/array/non-object bodies must not crash on destructuring. Blank strings and invalid roles are controlled client errors. Construct the Principal from explicitly selected validated fields; ignore unexpected extra fields rather than applying them to the family or role state.

The login role field is deliberately part of the assessment's bootstrap protocol. Preserve allowed admin/operator issuance. Do not add an unrequested production password flow, hardcode a privileged account, or silently downgrade requested admin and break the positive-control tests.

Refresh errors:
- RefreshReuseError -> 401 REFRESH_REUSED with the existing envelope.
- A string token that is malformed, invalid, expired, or wrong-purpose -> 401 INVALID_REFRESH_TOKEN.
- Bad request-body type/missing required token field -> 400 INVALID_REQUEST.

Key/server configuration errors are different from invalid client tokens. Avoid an unhandled 500 or leaking the JWT library's stack. If current tests do not specify a config-failure response, use a controlled 503 SERVER_MISCONFIGURED and document this choice. Do not turn every internal programming error into successful login or an invented default token. Keep any dedicated internal errors small and local to auth; no global error-handler rewrite.

Do not add token strings to logging. If existing middleware already logs bodies/headers, identify the concrete leak and apply the smallest necessary redaction or hand it off with explicit evidence; do not implement the whole observability challenge here. Preserve prior logging behaviour that is already correct.

J. ROLE AND ACCOUNT ISOLATION INTEGRATION

attachPrincipal:
- Read the existing Bearer Authorization header interface.
- Only attach a principal produced by real verifyAccessToken; never jwt.decode alone or req.body role/account values.
- Preserve the starter's compatibility policy: no bearer token means no principal and next(); an invalid bearer token is treated as no valid principal at this middleware layer, with routes deciding access.
- Do not change that to a global 401 policy in Task 6. Explicitly document that this permissive anonymous compatibility is assessment-specific, not proof of production isolation for every route.
- Do not leave an unverified/stale principal attached after a failed verification. Do not reuse a shared mutable Principal object between requests.

requireRole(role):
- Matching principal role -> next once.
- Missing principal or mismatched role -> 403 FORBIDDEN, with no next and no route side effect.
- Preserve the Task 3 correction. Do not reintroduce the inverted comparison.
- Do not invent a role hierarchy or admin bypass for ownership checks absent a contract.

requireOwnAccount/requireOwnAccountParam:
- No principal -> preserve the tested anonymous behaviour.
- Verified own-account principal -> permit access.
- Verified different-account principal -> 403 FORBIDDEN and stop.
- Compare exact stored account IDs, not body parameters, display names, or account-name lookups.
- Preserve helper signatures and existing route mounting for balance and statement.

Do not put global authentication in front of the entire ledger API. Do not remove requireRole from the kill-switch route. Verify permitted requests still succeed; rejecting everyone cannot pass the official positive controls.

K. MEANINGFUL PARTICIPANT TESTS

Add tests/task06-session-extra.test.ts if equivalent tests do not already exist. The organiser tests cover the main seven scenarios, but signature/purpose/expiry/family-isolation errors warrant focused extra coverage. Keep most tests pure-domain to avoid unnecessary auth HTTP traffic and rate-limit interference.

Cover:
1. Issued access verifies to exactly its expected Principal; two same-second issuance/rotation operations produce distinct appropriate tokens.
2. Refresh cannot authenticate as access; access cannot be used to refresh.
3. Tampered/wrong-key/unsigned/wrong-algorithm/expired tokens are rejected. Use independent jsonwebtoken construction with a disposable test key for hostile vectors, not an oracle that calls production issuance for every expected result.
4. Valid R0 -> R1 -> R2 rotation; each superseded token is single-use.
5. Reusing R0 revokes the family, so current R1 (or R2) fails; under the chosen policy the family's access tokens fail too.
6. Replay in family A leaves an independent family B active, including two families for the same account.
7. A forged/tampered token claiming a real family ID cannot revoke that family before signature verification.
8. Refresh authority comes from the stored family identity; claims/body manipulation cannot change account or role.
9. Reset clears all relevant state and old families cannot refresh again.
10. Role/ownership helpers permit the required positive paths and reject the forbidden ones without duplicate next()/response calls.

Use deterministic time controls for expiry instead of waiting 15 minutes or changing production lifetimes to satisfy tests. Restore environment values, fake clocks, mocks, and family state after each relevant case. Do not fake all timers around sockets unless necessary. Do not expose a reset route or add test-dependent production code.

If HTTP supplemental tests are needed, follow existing server teardown conventions and keep login/refresh counts within the real configured limit. The auth router is mounted with a shared limiter; do not disable or inflate it just to run repeated tests. Diagnose a 429 separately from invalid-token 401/forbidden 403. Rate-limiter implementation remains Task 20 if stubbed.

L. VERIFICATION SEQUENCE

After implementation run:

npm run typecheck
npm test challenge01.test.ts -t "Challenge 1d"
npm test challenge00.test.ts

If the participant file exists:

npm test task06-session-extra.test.ts

Then run the full foundation challenge and sanity suite:

npm test challenge01.test.ts
npm test _sanity.test.ts

Expected reference counts:
- Filtered Challenge 1d: 7 tests.
- Challenge 00: 6 tests.
- Complete Challenge 01: 23 tests (1a=7, 1b=3, 1c=6, 1d=7).
- Sanity: 11 tests.
Use actual current counts if organiser files differ. Filtered-out tests are NOT EXERCISED, not passed. Full Challenge 01 must actually run before claiming its gate is complete.

If earlier money/HMAC prerequisites fail, state their real status and task ownership; do not weaken tests or silently claim regression from a baseline that never passed. Fix regressions caused by this task. A balance ownership test failure may originate in existing account/balance helpers; diagnose before extending scope.

Run unchanged npm test once for the whole-suite regression required after the completed foundation challenge. Record exit status, counts, warnings, and remaining unfinished features. Do not implement every downstream challenge to obtain a full-suite pass during Task 6.

Compare against available baseline evidence, not an invented earlier score. If blocked/interrupted, record INCOMPLETE and the reason. Handle hanging tests by fixing lifecycle/errors, not by changing protected timeouts, forcing exit, or ignoring open handles.

Keep command scope beside results because each run can overwrite test-results.xml. Do not edit result files or upload a filtered report as full grading evidence. Rerun only to resolve concrete regressions or required gates.

M. COMPLETION NOTE, REVIEW, AND HANDOFF

Create/update docs/clearhouse-task-06-sessions.md with:
- Starting commit/branch, actual prerequisite status, and preserved unrelated work.
- Changed files and explanation of every session export.
- Chosen algorithm/key handling, token purposes, claim names, expiry policy, and family-state model, without any real keys or token values.
- Refresh transition R0 -> R1, and R0 reuse -> family revoked -> R1 rejected.
- Ordinary refresh versus replay revocation effects on access tokens.
- Controller envelopes, configuration-error choice, and assessment-specific login/anonymous-access behaviour.
- Before/after focused tests, participant tests, full Challenge 01, sanity, and whole-suite results with commands and exit codes.
- Any remaining blockers; no claim that unrun tests passed or that a production auth system was delivered.
- Confirmation that protected files and scripts.test were not modified by this task.
- Next task: Task 7 registry, cache, and shared-state fixes; retain asset-registry corrections already completed in Task 4.
- Reviewed CodeCommit staging/commit/push commands for origin/main.

Run git diff --check, review git status and actual diffs, and compare protected content to the pre-task snapshot. Do not revert a pre-existing modification automatically.

Task 6 completion requires implemented synchronous session APIs, exact refresh-family reuse behaviour, real role/ownership integration, typecheck success, all seven 1d tests passing, and honest full Challenge 01/regression evidence. If any gate is blocked, report partial status with the exact cause.

Suggested commit message: feat: implement session tokens and refresh family revocation.
Return concise results plus copyable PowerShell commands. Do not automatically commit/push, run grading uploads, or start Task 7.
````

---

## Refresh-state review example

This is a behavioural example, not token content to hardcode:

| Action | Family state afterward | Result |
|---|---|---|
| Login creates family A and refresh R0 | A active; current JTI belongs to R0 | Return access A0 and R0 |
| Refresh R0 | A active; current JTI belongs to R1 | Return new access A1 and R1 |
| Reuse R0 | A revoked | Reject with `401 REFRESH_REUSED` |
| Try R1 after that reuse | A remains revoked | Reject with `401` |
| Use a valid refresh from independent family B | B remains active | Normal rotation still succeeds |

The common incorrect implementation is to reject only R0 while allowing R1 to remain usable. The supplied test explicitly checks that R1 must fail after reuse of R0.

## PowerShell commit and push commands

These commands target your official **CodeCommit** repository. Run one at a time and inspect the result. Saving this Markdown file alone does not implement Task 6.

### 1. Confirm the checkout

```powershell
Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"
git status --short
git branch --show-current
git remote -v
git diff --stat
git diff --cached --stat
```

Confirm `main` and the expected origin URL. Do not change remotes/upstreams, add a GitHub remote, or switch to another branch to match an example. Keep credential-bearing output private.

### 2. Verify the source before committing

Use Cursor's just-completed results if they apply to unchanged source. Rerun after further edits; typecheck must be current.

```powershell
npm run typecheck
npm test challenge01.test.ts
npm test challenge00.test.ts
npm test _sanity.test.ts
git diff --check
```

If the participant file exists:

```powershell
npm test task06-session-extra.test.ts
```

Keep the required whole-suite result recorded separately. Expected failures in later unimplemented challenges do not establish a failure of a verified token implementation, but they must not be hidden.

### 3. Stage only reviewed changes

```powershell
git diff -- src/domain/session.ts src/controller/authController.ts src/middleware/rbac.ts
git add -- src/domain/session.ts
git add -- src/controller/authController.ts
git add -- src/middleware/rbac.ts
git add -- docs/clearhouse-task-06-sessions.md
```

Only if actually created and verified:

```powershell
git add -- tests/task06-session-extra.test.ts
```

If another file was legitimately needed for integration, inspect its diff and stage its exact path separately. Use `git add -p -- <actual-file-path>` where a file also contains unrelated edits. Review previously staged work before committing; do not include or discard teammate changes accidentally.

Do not stage organiser tests/config, `.env`, databases, dependencies, generated logs, or backups by default for this task. If missing disposable JWT configuration genuinely needed a local `.env` edit, inspect it locally without exposing values, confirm it contains no real credentials, and stage it separately under the already-established competition rule. Never publish assessment Git credentials as application configuration.

### 4. Review and commit

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached -- src/domain/session.ts src/controller/authController.ts src/middleware/rbac.ts tests/task06-session-extra.test.ts docs/clearhouse-task-06-sessions.md
git commit -m "feat: implement session tokens and refresh family revocation"
git show --stat --oneline HEAD
```

If no implementation changes were needed because the task was already complete, do not create an empty feature commit. If tests are blocked, report the blocker and do not label an incomplete checkpoint as fully verified. Check that a claimed implementation commit contains relevant source changes, not just prompt files.

### 5. Push to CodeCommit and verify

```powershell
git push origin main
git rev-parse --verify HEAD
git ls-remote origin refs/heads/main
git status --short
```

Matching local/remote hashes confirm repository delivery. Empty status confirms no remaining uncommitted/untracked working-tree files. These checks do not prove that grading has completed.

If authentication is requested, use the **Git username and password supplied on the DevQuest assessment page** for CodeCommit, through the normal Git prompt or credential manager. Do not use GitHub credentials or put passwords in Cursor chat, files, or remote URLs. Commit author identity is separate from this Git login.

The earlier `origin/HEAD -> origin/master` listing identifies the remote default branch, not necessarily the grading trigger. Preserve your confirmed `main` workflow and confirm the assessment's monitored branch before final submission; do not switch or push to `master` based on that clue alone.

### 6. If the remote advanced

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/main
git status --short
```

If only behind with a clean working tree, use `git merge --ff-only origin/main`. If both sides contain new commits, integrate teammate changes using the team's normal merge workflow, resolve conflicts, rerun affected tests and typecheck, then push with `git push origin main`. Do not force-push, rewrite shared history, or automatically stash work.

## What to send back

- Cursor's changed-file summary and Task 6 result.
- Typecheck and full Challenge 01 results, including any actual failures.
- Supplemental security/family tests and whole-suite status separately.
- Any blocker with secret values removed.
- Commit hash and CodeCommit push result, if committed/pushed.

Next request: **“Give me the complete enhanced Cursor prompt for Task 7 in one Markdown file, including official CodeCommit push commands.”**
