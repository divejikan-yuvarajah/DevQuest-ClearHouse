# ClearHouse — Enhanced Cursor Prompt for Task 5

**Task:** HMAC signing, signature verification, timestamp validation, and replay protection  
**Official submission remote/branch:** `origin/main`  
**Official repository:** https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b  
**Existing Windows checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical source reference:** https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git at `36bfeafc70e88e405188b80707ea703adcc7a5df`

## How to use

Open the existing CodeCommit checkout in Cursor. Paste the complete implementation prompt below into Agent mode. Cursor must inspect the current checkout and preserve the work from Tasks 1–4. Receiving or saving an earlier prompt file does not prove that its implementation has been executed.

Task 5 implements the three signing-domain exports, integrates their real behaviour with the middleware, and verifies replay protection through the HTTP endpoint. It also includes the small browser signer separator correction, directly tested by Challenge 0t. Dashboard rendering and request-builder header work remain with Task 22.

This file contains implementation instructions, protocol details, negative cases, test commands, reporting criteria, and PowerShell commit/push commands. Your confirmed push destination is **CodeCommit**, so use `git push origin main`, even when referring to these as “GitHub commands.”

The source/tests were inspected to prepare this prompt. No implementation changes or passing tests in your local checkout are claimed here. Do not reset to the historical reference or replace the competition repository with a GitHub clone.

## Protocol at a glance

The signed message has **five fields separated by four LF characters (`\n`)**, with no extra trailing newline:

```text
UPPERCASE_HTTP_METHOD
EXACT_REQUEST_PATH_WITH_QUERY_IF_PRESENT
LOWERCASE_SHA256_HEX_OF_RAW_BODY
TIMESTAMP_AS_STRING
NONCE
```

The signature is the lowercase hexadecimal output of **HMAC-SHA256 over that message**, using the configured shared secret. Hash the raw body as UTF-8; an absent body uses the empty string. The request timestamp is milliseconds since the Unix epoch. The configured default acceptance window is **30,000 ms**.

These functions have different responsibilities:

| Function/component | Responsibility |
|---|---|
| `sign()` | Deterministic cryptographic signature; no freshness check or nonce consumption |
| `verifySignature()` | Algorithm/shape checks and signature comparison; no replay state |
| `isWithinWindow()` | Timestamp validity and acceptance window |
| `hmacAuth` | Request-level ordering, freshness, replay protection, and controlled HTTP rejection |

---

## Task 5 implementation prompt

Copy this entire block into Cursor.

````text
Act as my senior TypeScript engineer for the nine-hour DevQuest 2026 ClearHouse final.

Execute TASK 5 ONLY: implement real HMAC signing/verification and timestamp validation, integrate them with the existing replay-protection middleware, and correct the browser signer's matching protocol defect. Use the official tests and interfaces as the specification. Complete the local work and verify it; do not stop at a plan.

CONFIRMED PROJECT
- Checkout: C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b
- origin: https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b
- Branch: main
- Earlier GitHub reference commit: 36bfeafc70e88e405188b80707ea703adcc7a5df. Treat it only as historical evidence; inspect the actual current CodeCommit files.

A. SAFETY, SCOPE, AND PRE-FLIGHT

1. Read applicable AGENTS.md, project instructions, and existing task notes in docs/. Verify actual progress rather than assuming Tasks 3–4 are implemented because their prompts exist.
2. Preserve previous source changes, unrelated edits, and staged work. No hard reset, git clean, automatic stash, force-push, branch replacement, or history rewriting.
3. Supplied tests/, config/, vitest.config.ts, tests/tsconfig.json, and scripts.test in package.json are protected. Read them but do not edit, weaken, skip, or regenerate them. Do not execute config/result.ts or other grading-report upload code.
4. Never introduce production code that recognises tests, VITEST, special fixture headers, test signatures, fixed nonces, or fixture-specific secrets. Preserve inherited environment scaffolding without expanding it into a bypass.
5. Preserve exports, existing types, route paths, request/response envelopes, and previous money/infrastructure fixes. Use built-in node:crypto for the server and existing Web Crypto for the browser. No new package is required.
6. Do not implement JWT sessions/refresh, new RBAC policies, ledger, matching, a new dashboard, WebSockets, or a different authentication scheme in this task.
7. Do not reset the local DB, rewrite package/lockfiles, or loosen the test runner because HMAC tests fail. Diagnose the real cause.
8. Never print the actual HMAC secret, JWT key, Git credentials, .env contents, full signed authentication headers, or sensitive request bodies in notes/logs. No real credentials in test fixtures.
9. Complete reversible local edits and checks without repeated approval questions. Prepare commit/push commands, but do not automatically publish or upload grading reports.
10. Aim for a bounded implementation of roughly 25–40 minutes if prerequisites are healthy. Be honest about blockers and remaining work instead of declaring success to meet a time estimate.

Run:

git status --short
git branch --show-current
git rev-parse --verify HEAD
git diff --stat
git diff --cached --stat

Verify the confirmed origin URL and main branch locally. Report unexpected differences without changing remotes/branches. Record the pre-task state of intended files and protected content, including scripts.test. Preserve pre-existing differences rather than silently reverting them.

B. INSPECT ALL RELEVANT CONTRACTS

Read:
- src/domain/signing.ts
- src/middleware/hmacAuth.ts
- src/server.ts: dotenv loading, raw-body capture, secure router mounting, and error behaviour.
- src/routes/secureRoutes.ts
- src/types/express.d.ts
- src/enums/httpStatus.ts and Task 3's nonce/async corrections.
- tests/challenge01.test.ts: independentSign helper, signedHeaders helper, and every Challenge 1c assertion.
- tests/challenge00.test.ts: especially its test-local signing mock and nonce test.
- tests/testBase.ts, tests/setup.ts, vitest.config.ts, and lifecycle hooks.
- client/js/signer.js and Challenge 0t in tests/challenge00b.test.ts.
- Challenge 12d in tests/challenge12.test.ts and buildSignedRequestInit in client/js/dashboard.js, to record the later header compatibility work accurately.
- Any additional callers of sign, verifySignature, and isWithinWindow.

Important: the official Challenge 01 tests compute HMAC independently. Passing by making your signer and verifier agree on the same incorrect format will fail. Challenge 00 mocks signing to isolate middleware; a pass there alone does not establish actual verification.

Run BEFORE checks:

npm test challenge01.test.ts -t "Challenge 1c"
npm test challenge00.test.ts -t "Challenge 0b"
npm test challenge00b.test.ts -t "Challenge 0t"

Record real counts, exit codes, and error causes. These filtered files may still execute application/database hooks. Separate environment errors from signature assertion failures.

C. FILE SCOPE

Primary changes:
- src/domain/signing.ts
- src/middleware/hmacAuth.ts, only where real verification/replay integration requires it.
- client/js/signer.js, only the protocol-consistency fix and directly necessary validation.

Additional changes only with concrete justification:
- src/server.ts for a demonstrated raw-body capture/order defect; the reference already captures raw JSON text before parsing, so avoid unnecessary edits.
- tests/task05-signing-extra.test.ts, a participant-owned test file for meaningful missing coverage.
- docs/clearhouse-task-05-signing.md.

Preserve existing Task 3 corrections and avoid rewriting already-correct functions. Browser request-builder headers/rendering remain Task 22. Any already-working later functionality must stay intact.

D. IMPLEMENT sign(input)

Preserve SignInput and the return type string. Use the existing ALLOWED_ALGORITHMS and SIGNATURE_WINDOW_MS exports without changing their values.

Construct the exact signed payload:
1. method.toUpperCase().
2. input.path verbatim.
3. SHA-256 digest of input.rawBody ?? "", encoded as UTF-8, output as lowercase hexadecimal.
4. String(input.timestamp), preserving the supplied valid string representation.
5. input.nonce verbatim.
Join these fields with LF ("\n"), not "|", CRLF, escaped literal backslash-n text, spaces, or JSON encoding. No trailing separator.

Compute HMAC-SHA256 with the supplied secret over the UTF-8 message, returning lowercase hex.

Requirements:
- Sign raw body text exactly. Do not parse/re-stringify it, reorder JSON keys, trim whitespace, or replace an absent body with "undefined", "null", or "{}".
- Preserve path encoding, query order, and the API prefix. The server passes req.originalUrl. Do not sign only req.path, a decoded/normalised URL, a host-qualified URL, or a route template.
- Uppercase only the method. Do not case-normalise paths, nonce text, secret, or body.
- Use the passed secret; do not read a global secret inside this pure function or embed a known fixture secret.
- Do not generate timestamps/nonces inside sign(), mutate input, access Date.now for freshness, or consume nonce state. Older fixture timestamps must still be signable for deterministic tests and explicit expiry verification.
- Keep validation consistent with the input contract. Reject invalid direct programmer inputs clearly rather than silently coercing arbitrary objects. Timestamp freshness is a separate concern from representing a timestamp.
- Header-like fields such as method, path, nonce, and timestamp must not introduce ambiguous CR/LF field boundaries. Validate/reject prohibited control characters as needed without altering the protocol's bytes for valid inputs. Raw body text can legitimately contain newlines because it is hashed first.

E. IMPLEMENT verifySignature(input)

Preserve VerifyResult: { valid: true } or { valid: false, reason: string }.

1. Explicitly allow only algorithm "HMAC-SHA256" from the allowed algorithm contract. Reject unrecognised/absent runtime values even if the digest would otherwise match. Never feed the requested algorithm directly to createHmac.
2. Validate the supplied signature's complete encoding before decoding: exactly 64 ASCII hexadecimal characters for a 32-byte SHA-256 digest. Reject odd length, invalid characters, prefix/suffix garbage, whitespace, truncation, trailing newline, missing/wrong types, and oversized values.
3. Node Buffer.from(hex) can silently truncate malformed text. Do not treat it as validation. A regex $ boundary can accept before a final newline; enforce an actual full-string match.
4. Sign the supplied valid fields with your production sign() function to derive the expected digest.
5. Decode expected and received signatures to buffers, confirm equal lengths, then compare with crypto.timingSafeEqual. No plain string equality or byte-by-byte early-exit digest comparison.
6. Return { valid: true } on match; otherwise return a stable failure reason. Never return a truthy failure object and then treat its existence as success: the middleware must inspect result.valid.

Lowercase hex is the signer's output. Unless current contracts explicitly require lowercase-only input, accepting uppercase A–F as an equivalent hex representation is a reasonable documented verifier policy; do not silently trim or accept a different encoding.

Malformed caller-controlled fields should produce a failure result rather than an uncaught exception. Validate before cryptographic operations and handle expected invalid-input errors deliberately. Do not swallow every unexpected internal bug as successful authentication or mask server misconfiguration as an ordinary signature mismatch.

Search actual tests/callers for reason-code requirements. Preserve any explicit required strings. If the current contract leaves reason names open, use clear stable codes (for example UNSUPPORTED_ALGORITHM and INVALID_SIGNATURE) and document that choice. Do not expose expected digests, secret values, stack traces, or full requests in errors.

Keep verifySignature deterministic and free of time/replay state. The middleware already checks freshness, and a direct signature check must not fail merely because a historical vector was used.

F. IMPLEMENT isWithinWindow(timestamp, now, windowMs)

Preserve the signature, default now=Date.now(), and default windowMs=SIGNATURE_WINDOW_MS (30_000).

Inspect current explicit boundary requirements. If the tests/interfaces do not further specify them, adopt and document this policy:
- Accept nonnegative safe-integer epoch milliseconds as a number, or a canonical ASCII digit string representing such an integer.
- Reject empty/whitespace-only strings, surrounding whitespace, signs, fractional values, exponent notation, Infinity/NaN, booleans, null/undefined, arrays/objects, bigint inputs, unsafe integers, non-ASCII digits, or control characters.
- Canonical digit strings use "0" or a nonzero first digit followed by digits. Do not normalise a signed header before signature computation; validation and signing must agree on representation.
- Validate now and windowMs as finite safe integers, with a nonnegative window; reject invalid parameters by returning false.
- Return true when abs(timestamp-now) <= windowMs, including exact endpoints. Accept a small future skew inside the same symmetric window and reject timestamps beyond it.
- A zero window accepts only equality.
- Use the provided now for deterministic calls; do not overwrite it with a new Date.now().

Timestamp arithmetic is metadata, not monetary arithmetic. It may use safe integers. Avoid rounding/overflow in extreme safe-integer difference calculations: using BigInt for the comparison after validating integer inputs is one straightforward option. Do not parse date strings or use a locale/time-zone conversion.

Tests must cover both boundaries, one millisecond outside, far future, malformed input, and numeric/string equivalence. These stricter malformed-input and boundary choices are documented implementation policy where not explicit in supplied assertions, not invented official test claims.

G. INTEGRATE WITH hmacAuth AND NONCE LIFETIME

Keep the existing secure route mounting and error-envelope shape. In the inspected starter, the server reads:
X-Signature, X-Timestamp, X-Nonce, X-Algorithm.

Preserve the request flow:
1. Reject missing required headers with 401 and SIGNATURE_REQUIRED.
2. Clean up genuinely expired nonce records.
3. Validate timestamp freshness; reject invalid/out-of-window timestamps with the existing 401 SIGNATURE_EXPIRED behaviour.
4. Reject a nonce already consumed and still retained with 401 NONCE_REPLAYED.
5. Obtain the actual configured HMAC secret.
6. Call real verifySignature with method, originalUrl, captured rawBody, timestamp, nonce, algorithm, signature, and secret.
7. On invalid verification, send the normal 401 error envelope and stop.
8. Only after successful verification, record the nonce and call next() exactly once.

Nonce invariants:
- Invalid signatures, unsupported algorithms, missing headers, and rejected timestamps must not consume an unused nonce. A later valid request with that nonce can still succeed.
- Retain the accepted nonce throughout the entire interval in which the original signed timestamp can still be accepted, including the chosen inclusive boundary.
- A future-skewed timestamp near now+window remains acceptable until approximately now+2*window. Expiring only at receipt time+window can permit a late replay; prevent this.
- Keep expiry/cleanup semantics consistent. For example, retaining through signedTimestamp+window and deleting only when current time is strictly greater than that bound matches inclusive timestamp acceptance. Another equivalent safely computed expiry policy is acceptable. Avoid unsafe overflow at large timestamp bounds.
- Do not restore the reference bug now-SIGNATURE_WINDOW_MS. Preserve a correct Task 3 implementation, extending it only if boundary/skew tests show a gap.
- Keep the map process-wide as in the starter, not per request. Avoid a permanent no-expiry collection or a new background interval that leaves test processes running.
- Keep the check/verify/mark operation synchronous with no intervening await, matching node:crypto's current API. If the current checkout made it asynchronous, reason about an atomic nonce reservation rather than permitting concurrent duplicate acceptance.
- Do not insert known test nonces, clear the map on each request, or add a test-only reset route.

Configuration:
- Tests already establish a test secret through official setup and inherited middleware behaviour. Read that arrangement; do not change supplied tests or add a new production test branch.
- Normal signed requests require HMAC_SECRET in the local configuration. Inspect only its presence/non-empty status, never print it. Do not use JWT_PRIVATE_KEY as a substitute.
- If the demo-only HMAC_SECRET is missing, report the configuration gap and add a cryptographically generated disposable local value only as needed, preserving existing keys and the event's .env submission requirement. Do not copy the known test fallback into normal runtime.
- Do not rotate an existing key automatically. Never embed CodeCommit credentials in .env for HMAC.
- Missing server configuration is distinct from an invalid client signature. The reference middleware returns SERVER_MISCONFIGURED with 500, while the guide prohibits 500 responses. Resolve the touched path deliberately: unless the actual current contract dictates otherwise, retain SERVER_MISCONFIGURED with a controlled 503 availability response. Document that local error-policy choice, preserve other route policies, and ensure no secret disclosure. Do not remap every application exception globally.

Raw body:
- Preserve the express.json verify hook capturing buf.toString("utf8") before JSON parsing.
- Do not replace it with JSON.stringify(req.body); semantically identical JSON can contain different signed bytes.
- For the current JSON/UTF-8 protocol, an absent body maps to "" for hashing. Do not claim support for arbitrary binary payload signing without a corresponding contract change.
- Do not mount HMAC globally on routes that the official tests call anonymously.

H. CORRECT THE BROWSER SIGNER'S SHARED PROTOCOL DEFECT

File: client/js/signer.js.

The reference implementation joins its five fields with "|". Change it to the required LF separator while preserving createHmacSigner(secret, cryptoImpl=globalThis.crypto), Web Crypto, UTF-8 hashing, hex output, and absent-body handling.
No Node imports in browser code, no exposed hardcoded server secret, no API endpoint that returns the shared secret, and no UI redesign. Preserve existing injected crypto support for tests.

Verify Challenge 0t against its independent Node crypto oracle. This completes that bounded bug now; record it so Task 22 will not repeat it.

Known separate header issue:
- The server/Challenge 1c use X-Algorithm.
- Challenge 12d currently asserts X-Signature-Algorithm on the dashboard request builder.
- Preserve both official contracts. Do not rename the server's required header and break Challenge 1c to make the dashboard appear consistent.
- Record a Task 22 handoff to reconcile the client request builder, for example by providing both identically-valued headers when required by the actual implementation, without removing its tested header.
- Do not claim a fully working browser-authenticated flow based only on fixing the signer. Request-builder wiring and real browser verification remain separate.

I. MEANINGFUL SUPPLEMENTAL COVERAGE

Use the official six Challenge 1c tests as the main HTTP acceptance gate. Add a small participant-owned tests/task05-signing-extra.test.ts when equivalent coverage is missing; never edit organiser tests.

Use built-in crypto directly in the test oracle without calling production sign() to compute the expected digest. Fixed harmless test secrets are allowed inside participant test fixtures only; never use actual .env or Git credentials. Cover:

1. Deterministic signatures match the independent exact-format oracle; method case normalisation; raw whitespace/Unicode; absent body versus empty body; exact paths/queries; no trailing newline.
2. Verifier rejects changed method/path/query/body/timestamp/nonce/secret, unsupported algorithm, and malformed hex/length; each case has a successful valid control.
3. Historical signatures can still be verified cryptographically when freshness is checked separately.
4. Timestamp past/future/equality boundaries and malformed/unsafe values under the documented policy.
5. Real middleware accepts a correctly signed request and rejects its replay. No test-local signing mock in this participant integration check.
6. Bad signature followed by a good signature using the same previously-unused nonce: first rejected, second accepted. A third identical valid request is a replay.
7. Future-skew retention: original timestamp at T+window accepted at T; replay at T+window+1 must still be blocked because its timestamp remains valid; replay at the exact final timestamp boundary must remain blocked. Use unique nonces and deterministic fake time that is always restored.
8. A new valid nonce continues to work after another is rejected. Expired entries can be cleaned without allowing an expired signed request through.

Prefer pure-domain tests and direct middleware harnesses for precise fake-time cases; avoid faking all timers around live sockets. Restore fake clocks/mocks and environment values in finally/cleanup. Do not add wall-clock sleeps, production test-detection, or fixture-specific bypasses. If adding a real HTTP server in a participant test, close only its own server/connections and match existing lifecycle conventions.

J. VERIFICATION AND REGRESSION

Run sequentially after implementation:

npm run typecheck
npm test challenge01.test.ts -t "Challenge 1c"
npm test challenge00.test.ts
npm test challenge00b.test.ts -t "Challenge 0t"

If the participant file exists:

npm test task05-signing-extra.test.ts

Then verify earlier foundation behaviour:

npm test challenge01.test.ts -t "Challenge 1a|Challenge 1b|Challenge 1c"
npm test _sanity.test.ts

Quote the filter containing | so the shell does not create a pipeline.

Reference counts, to compare against actual current output:
- Challenge 1c: six tests.
- Challenge 00: six tests.
- Challenge 0t: one test.
- Challenge 1a/1b/1c combined: sixteen tests.
- Sanity: eleven tests.

Filtered-out tests are NOT EXERCISED, not passed. If prior Task 4 is not actually implemented, identify its failures instead of claiming a Task 5 regression or implementing all of Task 4 without explanation.

Run unchanged npm test once for the broader milestone regression. Record complete output counts/exit status; later features may still fail. Do not implement JWT refresh, ledger, or every challenge simply to make this checkpoint green. If Task 6 remains stubbed, expect Challenge 1d to remain incomplete and state it.

If a property test fails, retain its seed/path/counterexample and fix the exposed rule. Do not globally fix the seed to obtain a favourable run. If any run is interrupted/hangs, record INCOMPLETE and diagnose lifecycle/configuration/error propagation rather than increasing protected timeouts or force-exiting.

Each test command may overwrite test-results.xml. Record command scope or preserve separate reports outside protected paths; never alter result XML or treat a filtered file as full grading evidence. Do not run official report-upload scripts.

Resolve concrete regressions and rerun the affected checks. Avoid repeated full-suite runs without a new reason. Do not log real signature headers, secrets, or body data while debugging.

K. FINAL NOTE, REVIEW, AND HANDOFF

Create/update docs/clearhouse-task-05-signing.md with:
- Current start commit/branch, baseline state, and actual prerequisite status.
- Exact five-field signing protocol and UTF-8/raw-body rules.
- Changes to each function and the browser separator.
- Signature input/reason-code policy, timestamp boundaries, nonce expiry reasoning, and missing-config handling.
- Official versus participant test results, before/after counts, commands, exit codes, and whole-suite limitations.
- Real HMAC integration evidence separately from the mocked Challenge 00 middleware test.
- Task 22 header-name handoff and confirmation that browser end-to-end operation is not yet claimed.
- Confirmation that existing protected files and scripts.test were not modified by this task.
- Changed-file list, remaining blockers, and next task: Task 6 tokens/refresh/roles/account isolation.
- Reviewed CodeCommit commands for origin/main, with no credentials in the note.

Run git diff --check and review git status and diffs. Compare protected content to the pre-task snapshot; preserve earlier unrelated edits. No unsolicited package, migration, schema, or global auth changes.

Completion requires real signing functions with no remaining stubs, passing Challenge 1c and 0t, retained Challenge 00 fixes, typecheck success, timestamp/replay correctness, and honest regression evidence. A full Challenge 01 pass still depends on Task 6.

Return a concise completion summary and exact reviewed PowerShell staging/commit/push commands. Suggested commit message: feat: implement HMAC request signing and replay protection.
Prepare publication commands without executing them. Do not continue into Task 6 automatically.
````

---

## Final review checklist

- [ ] Current CodeCommit checkout is used; previous tasks' actual status was checked.
- [ ] `sign`, `verifySignature`, and `isWithinWindow` are implemented with their existing interfaces.
- [ ] Message uses five exact fields joined by LF; body is hashed as received.
- [ ] Unknown algorithms and malformed signatures are rejected before unsafe decoding/comparison.
- [ ] Equal-length digest buffers are compared using `timingSafeEqual`.
- [ ] Timestamp validation covers both past and future window limits.
- [ ] Nonces are consumed only after verification and retained through the full valid interval.
- [ ] Local shared secrets stay out of source/logs and are not confused with Git credentials.
- [ ] Browser signer matches the independent oracle; request-builder header work is explicitly handed off.
- [ ] Real HMAC HTTP tests pass; mock-only evidence is not mistaken for end-to-end verification.
- [ ] Typecheck, focused regressions, and the broader suite result are recorded.
- [ ] Protected organiser files and test scripts remain unchanged by this task.

## PowerShell Git commands — official CodeCommit submission

Run commands one at a time, inspecting results before proceeding. These publish your reviewed local work when you execute them; saving this Markdown prompt does not implement or submit the application changes.

### 1. Confirm working directory and remote

```powershell
Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"
git status --short
git branch --show-current
git remote -v
git diff --stat
git diff --cached --stat
```

Expected branch: `main`. Expected origin fetch/push URL:

```text
https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b
```

If different, inspect the mismatch before proceeding. Do not replace origin, rename branches, or add a GitHub remote. Keep credentials out of shared output.

### 2. Check the current implementation

Reuse just-completed results if the source is unchanged; rerun after further edits. Typecheck must be current before committing.

```powershell
npm run typecheck
npm test challenge01.test.ts -t "Challenge 1c"
npm test challenge00.test.ts
npm test challenge00b.test.ts -t "Challenge 0t"
npm test _sanity.test.ts
git diff --check
```

If the additional test file exists:

```powershell
npm test task05-signing-extra.test.ts
```

Ensure the combined foundation test and whole-suite results requested in the prompt are also recorded. A filtered success is not a full application pass.

### 3. Review and stage Task 5 files

```powershell
git diff -- src/domain/signing.ts src/middleware/hmacAuth.ts client/js/signer.js
git add -- src/domain/signing.ts
git add -- src/middleware/hmacAuth.ts
git add -- client/js/signer.js
git add -- docs/clearhouse-task-05-signing.md
```

Only if these files were actually created/changed for a justified Task 5 reason:

```powershell
git add -- tests/task05-signing-extra.test.ts
git add -- src/server.ts
```

Do not stage nonexistent optional files. If existing files contain unrelated work, use `git add -p -- <actual-file-path>` to stage only relevant hunks. Review any pre-existing staged changes before committing.

Do not automatically stage organiser tests/config, logs, backups, database changes, node_modules, or credentials. If `.env` genuinely needed a new demo-only HMAC_SECRET, review the change locally without sharing its values, confirm it contains no real credentials, and stage it separately under the competition's existing configuration-submission rule. If it did not change, leave it alone.

### 4. Commit

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached -- src/domain/signing.ts src/middleware/hmacAuth.ts client/js/signer.js src/server.ts tests/task05-signing-extra.test.ts docs/clearhouse-task-05-signing.md
git commit -m "feat: implement HMAC request signing and replay protection"
git show --stat --oneline HEAD
```

Stop on failed checks or a failed commit. Do not create an empty implementation commit if everything was already correctly implemented. Review the commit summary: a commit containing only a prompt or note does not prove signing code was changed.

### 5. Push and verify delivery

```powershell
git push origin main
git rev-parse --verify HEAD
git ls-remote origin refs/heads/main
git status --short
```

Matching local/remote hashes confirm that the intended commit reached CodeCommit `main`. Empty status means no uncommitted/untracked files remain in the working tree. Neither proves grading completed or the whole test suite passed.

Your earlier remote listing also showed `origin/HEAD` pointing at `origin/master`. That identifies the remote default branch; it does not by itself establish the assessment's grading trigger. Keep your confirmed `main` submission workflow, and verify the assessment's monitored branch with the organisers before final submission. Do not switch or push to `master` based on this clue alone.

### 6. Authentication and push failures

If prompted for HTTPS credentials, use the **Git username and password provided on the DevQuest assessment page** for CodeCommit. Do not use GitHub credentials, and never put passwords in Cursor chat, tracked files, remote URLs, or this prompt. Commit author name/email is separate from the assessment Git login.

If the push is rejected because the remote advanced:

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/main
git status --short
```

If only behind with a clean tree, fast-forward using `git merge --ff-only origin/main`. If both sides have commits, integrate teammate changes using the normal merge workflow, resolve conflicts, rerun affected tests/typecheck, and push with `git push origin main`. Do not force-push, automatically stash, or rewrite shared history.

## What to send back

- Cursor's actual changed-file summary.
- Typecheck, Challenge 1c/00/0t, supplemental, and regression results.
- Any blocker/error with secret values removed.
- Commit hash and CodeCommit push result, if committed/pushed.

Next request: **“Give me the complete enhanced Cursor prompt for Task 6 in one Markdown file, including official CodeCommit push commands.”**
