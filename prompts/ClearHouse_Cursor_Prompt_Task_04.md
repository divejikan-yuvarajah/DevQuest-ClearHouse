# ClearHouse — Enhanced Cursor Prompt for Task 4

**Task:** Asset registry and exact money arithmetic  
**Official submission remote:** `origin`  
**Official repository:** https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b  
**Confirmed branch:** `main`  
**Existing Windows checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git  
**Previously inspected reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

## Usage and scope

Open your existing CodeCommit checkout in Cursor. Paste the complete implementation prompt below into Agent mode after Tasks 1–3. Cursor must verify their actual status and inspect the current checkout before editing. Do not clone a replacement repository, change `origin`, or reset to the historical commit.

This task implements the money domain and corrects the asset registry. It covers Challenge 1a/1b and the directly related asset tests 0h/0x. Completing these checks does **not** complete all of Challenge 01: HMAC and session functionality follow in Tasks 5–6.

This file includes exact arithmetic guidance, edge cases, targeted and broader verification, handoff notes, and PowerShell Git commands. The push commands use your confirmed **CodeCommit `origin/main`** destination. GitHub is the historical code reference, not your official submission remote.

The author inspected the reference source and tests but has not executed your local implementation or tests. No earned-score or passing-test claim is made here.

## Asset precision required by the supplied tests

| Code | Name | Decimal exponent | Minor units per whole unit |
|---|---|---:|---:|
| USD | US Dollar | 2 | 100 |
| EUR | Euro | 2 | 100 |
| JPY | Japanese Yen | 0 | 1 |
| BHD | Bahraini Dinar | 3 | 1,000 |
| BTC | Bitcoin | 8 | 100,000,000 |

**Critical distinction:** `parseAmount("12345", "USD")` receives integer **minor units**, whereas `fromDecimal("123.45", "USD")` receives a decimal whole-unit representation. Both produce `{ amount: 12345n, asset: "USD" }`. Never multiply minor-unit input by the exponent again.

---

## Task 4 implementation prompt

Copy the entire block into Cursor.

````text
Act as my senior TypeScript engineer for the nine-hour DevQuest 2026 ClearHouse final.

Execute TASK 4 ONLY: implement exact money arithmetic, strict amount parsing/formatting, rational rounding/rates, and the asset registry corrections directly required by those contracts. Preserve the existing application interfaces and previous work. Target roughly 30–45 minutes if the environment is healthy; finish according to verified evidence, not the estimate.

CONFIRMED WORKSPACE AND SUBMISSION
- Existing checkout: C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b
- Remote origin: https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b
- Branch: main
- Historical reference only: GitHub DevQuest-ClearHouse at 36bfeafc70e88e405188b80707ea703adcc7a5df.
- Inspect the current CodeCommit files. Preserve origin/main. Do not add a GitHub remote, clone another checkout, switch branches, or reset history to match this prompt.

A. RULES AND PRE-FLIGHT

1. Read applicable AGENTS.md, existing project instructions, and docs/clearhouse-task-01-audit.md, docs/clearhouse-task-02-setup.md, docs/clearhouse-task-03-infrastructure.md when present. Do not assume a missing note means its work is complete or incomplete; inspect actual code/results.
2. Preserve unrelated edits and staged files. No hard reset, clean, force-push, automatic stash, bulk overwrite, or history rewriting.
3. Supplied tests/, config/, vitest.config.ts, tests/tsconfig.json, and package.json scripts.test are protected. Read but do not alter them. Do not execute config/result.ts or grading-report upload scripts.
4. Do not weaken strict TypeScript settings, property tests, assertions, timeouts, test selection configuration, or error checks. No production branches that recognise fixtures, VITEST, or test-only headers. Do not expand inherited test-environment scaffolding.
5. Preserve exported function names, types, error classes, route paths, HTTP envelopes, and spelling such as serialiseAmount.
6. Money arithmetic must use bigint. No Number(amount), parseFloat, floating-point multiplication, Math.round, toFixed, epsilon correction, JSON-number coercion, or decimal arithmetic library is needed.
7. Small numeric metadata such as asset exponent and compare's -1/0/1 result can be ordinary numbers. Never convert a monetary amount to Number to obtain those results.
8. Do not install packages, change dependencies, redesign schemas, alter authentication, or implement ledger/settlement/dashboard/fees in this task. Do not run destructive npm run migrate for a pure-domain change.
9. Keep credentials and .env contents out of logs, reports, and diffs shared in chat.
10. Complete local implementation/testing autonomously. Prepare reviewed commit/push commands at the end; do not automatically publish or send grading reports.

Run shell-compatible pre-flight commands:

git status --short
git branch --show-current
git rev-parse --verify HEAD
git diff --stat
git diff --cached --stat

Verify origin/main against the confirmed destination, reporting a mismatch without overwriting anything. Record the pre-task state of protected files, scripts.test, and intended implementation files so later diffs distinguish your changes from earlier user work. Confirm Task 2 dependencies exist and Task 3 changes are retained. If prerequisites are blocked, state the exact issue and complete any independent work possible without bypassing the rules.

B. INSPECT THE PRECISE CONTRACTS

Read completely:
- src/domain/assets.ts
- src/domain/money.ts
- src/controller/assetsController.ts
- src/routes/assetsRoutes.ts
- Challenge 1a and 1b in tests/challenge01.test.ts
- Challenge 0h in tests/challenge00b.test.ts
- Challenge 0x in tests/challenge00c.test.ts

Inspect imports and every use of parseAmount, serialiseAmount, add, sub, isNegative, compare, fromDecimal, toDecimal, divideWithRounding, applyRate, AssetError, and MoneyError throughout src/, tests/, and client/.
Read the relevant guide/challenge text if available. Read test lifecycle hooks before assuming a filtered file is free of database/server setup.
Inspect config/scores.ts read-only if reporting available points. Do not invent an earned score or confuse available feature points with bug-category points.

Run a focused BEFORE baseline:

npm test challenge01.test.ts -t "Challenge 1a|Challenge 1b"
npm test challenge00b.test.ts -t "Challenge 0h"
npm test challenge00c.test.ts -t "Challenge 0x"

Use the quotes around the filter to prevent the shell interpreting | as a pipeline. Record actual counts and failures, including setup/import errors separately from assertions. Filtered-out tests were not exercised.

C. REQUIRED SCOPE AND FILE BOUNDARIES

Primary implementation files:
- src/domain/assets.ts
- src/domain/money.ts

Other permitted changes only when justified:
- src/controller/assetsController.ts for a concrete amount-validation/error-envelope defect not solved in the domain. Preserve unrelated behaviour.
- A small participant-owned tests/task04-money-extra.test.ts for meaningful gaps in official coverage, following Part J.
- docs/clearhouse-task-04-money.md for the implementation and verification handoff.

The current assets controller already catches MoneyError/AssetError and translates them to 400. Prefer making the domain throw those classes correctly. Its 250ms registryChecksum busy loop is separate performance work for Task 21; do not refactor it in this task.

Registry copy isolation and consistent lookup were also listed in the broader Task 7 bug work. Complete these same-file asset fixes now because they protect money precision; record them as already addressed for Task 7. Do not repeat or undo them later. Cache/risk-registry fixes remain outside this task.

D. ASSET REGISTRY

Preserve the Asset interface and AssetError class. Keep stable registry order and the existing names.

Correct exponent values:
USD 2; EUR 2; JPY 0; BHD 3; BTC 8.

Implement consistent lookup:
- getAsset(code) returns the known asset or throws AssetError.
- isKnownAsset(code) must be true exactly when getAsset(code) succeeds for the same input.
- Preserve exact canonical code lookup unless the current official contract explicitly requires normalisation. In this starter, use uppercase codes as stored; lowercase, mixed case, whitespace-padded, empty, and unknown codes do not silently normalise.
- Do not uppercase only one lookup function or trim invalid input into validity.
- Reject invalid runtime types cleanly where an untyped boundary reaches the registry; do not call arbitrary methods on hostile input.

Protect registry data through copies:
- getAsset returns a fresh object.
- listAssets returns a fresh array containing fresh asset objects.
- Mutating returned names/exponents or reordering/deleting items in a returned array cannot mutate the registry.
- Do NOT freeze returned objects instead: the supplied test assigns to a returned object and expects that assignment not to alter the registry. A frozen result can throw in strict mode.

E. STRICT MINOR-UNIT PARSING

Keep parseAmount(raw: unknown, assetCode: string): Money.

The supplied public-input contract is:
- raw must be a primitive string.
- Accepted grammar: exactly "0", or an ASCII digit 1–9 followed by zero or more ASCII digits 0–9.
- Allowed range: 0 through 9223372036854775807 inclusive (2^63 - 1).
- Validate the asset via the registry and preserve its canonical code.
- Convert to bigint only after format validation; throw MoneyError for invalid amount input.
- Unknown assets must surface as the existing AssetError or a contract-compatible INVALID_ASSET error through the existing controller. Do not mislabel a known valid amount as an internal failure.

Reject without coercion:
- JSON numbers, bigint raw inputs, booleans, null, undefined, arrays, objects, and boxed strings.
- Negative signs, positive signs, leading zeros other than "0", decimal points, exponent notation, hexadecimal/binary prefixes, separators, commas, empty strings, whitespace, Infinity/NaN text, and non-ASCII digits.
- Overflow at 9223372036854775808 or larger.
- Trailing newline/CR as well as leading or internal whitespace. A JavaScript regex using $ can match before a final newline; require a true full-string match, not merely an apparently anchored test.

Avoid unsafe shortcuts:
- Do not String(raw), trim(), parseInt(), parseFloat(), Number(), or trust BigInt(raw) as the validator. BigInt accepts representations the challenge forbids.
- Do not reapply asset scaling: "123" always means 123 minor units, including for BTC.
- For canonical nonnegative input, a length check against the maximum's 19 digits can reject obvious huge values before allocating an enormous bigint. Keep the exact bigint bound check for equal-length values.
- Do not reject MAX_SAFE_INTEGER+1: values above 2^53 are valid when within the signed-64 positive maximum.

Use MoneyError's existing constructor and code field. Preserve INVALID_AMOUNT as its default; use more specific codes only when required by inspected contracts. Normal invalid input must become the expected 400 error envelope, not a native conversion exception escaping as 500.

F. INTERNAL MONEY VALUES, SERIALISATION, AND ARITHMETIC

Money is { amount: bigint; asset: string }.

Separate boundary validation from internal arithmetic:
- parseAmount forbids negative external amounts.
- Internal Money values can be negative: the comparison tests explicitly generate negatives, subtraction can produce them, and ledger debits/rebates need them.
- Do not pass arithmetic outputs through parseAmount or impose its nonnegative input rule on signed results.
- The official tests bound external parsing, not every intermediate bigint calculation. Unless current contracts explicitly impose another bound, preserve exact signed bigint intermediate/results instead of inventing overflow restrictions on add/sub/rates.

Implement every exported operation:

serialiseAmount(money):
- Return a new plain object { amount: money.amount.toString(), asset: money.asset }.
- Canonical base-10 integer string, including a minus sign for valid negative internal values.
- No bigint in JSON output, no decimal whole-unit conversion, and no global BigInt.prototype.toJSON patch.

add(a,b) and sub(a,b):
- Require compatible asset codes before arithmetic; asset mismatch throws MoneyError with the established code convention, if any.
- Return new Money objects; never mutate either operand.
- Use bigint addition/subtraction exactly, including negative results and large internal values.
- Preserve algebraic identities, including sub(add(a,b),b) = a for matching assets.

isNegative(money):
- True exactly when amount < 0n; zero is not negative.

compare(a,b):
- Require matching assets and compare with bigint relational operators.
- Return exactly -1, 0, or 1; do not convert the difference to Number.
- Maintain antisymmetry, transitivity, and equality for negative/zero/positive values.

Validate runtime/internal values to the extent supported by existing contracts, without adding arbitrary restrictions that break valid signed arithmetic. Avoid a broad rewrite to immutable classes; the existing plain-object API is sufficient.

G. DECIMAL CONVERSION WITHOUT FLOATING POINT

Implement fromDecimal(raw, assetCode) and toDecimal(money). Inspect their current callers/tests first. The official assertions directly cover asset precision; some lexical/formatting choices are underspecified. If the current checkout gives additional explicit requirements, follow them. Otherwise use the following consistent documented design choices, without claiming they are all supplied-test requirements:

fromDecimal as an external-input helper:
- Accept a primitive string with a canonical nonnegative integer part and an optional decimal point followed by at least one ASCII digit.
- Do not accept sign prefixes, leading integer zeros, whitespace, .5, 1., scientific notation, or numeric inputs under this chosen policy.
- Reject fractional digit count greater than the asset exponent, even if excess digits are zeros. JPY exponent 0 therefore permits no decimal point.
- Split the integer/fractional strings, right-pad the fraction to the exponent, and form the scaled bigint using exact powers of ten/string construction.
- No silent rounding or truncation of over-precision input.
- Apply the external minor-unit range 0..2^63-1 after scaling under this chosen boundary policy; do not accidentally range-check only the whole part.
- Normalise leading zeros in the constructed scaled integer as an INTERNAL step so decimal "0.01" produces 1n; this does not relax the external lexical rule.
- Reject malformed or overflow input via MoneyError and unknown assets via the existing asset error handling.

toDecimal for internal Money:
- Support signed bigint input, including negative values and zero.
- Use absolute magnitude for formatting and prepend the sign once for negative amounts.
- Exponent 0: output the integer string without a decimal point.
- Exponent >0: output exactly exponent fractional digits, including trailing zeros; preserve small fractions with left-padding.
- Return a string, never a number. Do not create negative zero text from bigint zero.
- Do not insert locale commas/grouping or call floating-point formatting helpers.

Examples for this chosen formatting policy:
fromDecimal("123.45","USD") -> 12345n USD
fromDecimal("1.2","USD") -> 120n USD
fromDecimal("0.001","BHD") -> 1n BHD
fromDecimal("0.00000001","BTC") -> 1n BTC
fromDecimal("1","JPY") -> 1n JPY
toDecimal({amount:1n,asset:"USD"}) -> "0.01"
toDecimal({amount:-1n,asset:"USD"}) -> "-0.01"
toDecimal({amount:100n,asset:"USD"}) -> "1.00"
toDecimal({amount:0n,asset:"BTC"}) -> "0.00000000"
toDecimal({amount:-7n,asset:"JPY"}) -> "-7"

Do not assert fromDecimal(toDecimal(m)) works for negative internal m when fromDecimal intentionally implements a nonnegative input policy. For nonnegative in-range values, the conversion should round-trip. Explain that distinction in the note.

H. EXACT ROUNDED DIVISION

Preserve divideWithRounding(dividend: bigint, divisor: bigint, mode = Rounding.HALF_EVEN): DivisionResult.

Required rules:
- Zero divisor throws MoneyError.
- HALF_UP means nearest integer, exact halves AWAY FROM ZERO, including negative inputs.
- HALF_EVEN means nearest integer, exact halves to the even integer.
- Default is HALF_EVEN.
- Compute using bigint only; no floating quotient or Math.round.
- After rounding, return remainder = dividend - quotient * divisor using the ORIGINAL operands.
- Preserve quotient * divisor + remainder === dividend exactly.
- Do not return the pre-rounding '%' remainder after changing the quotient.
- Remainder can be negative even for a positive dividend; this is necessary for the reconstruction identity.

Suggested algorithm:
1. Reject divisor 0n and an unsupported rounding mode with MoneyError; do not silently pick another mode.
2. Work with nonnegative magnitudes a=abs(dividend), b=abs(divisor).
3. Calculate q0=a/b and r0=a%b using bigint.
4. Compare 2n*r0 with b.
5. Below half: retain q0. Above half: increment q0. Exact half: increment for HALF_UP; for HALF_EVEN increment only when q0 is odd.
6. Restore the quotient's sign from the signs of the original operands.
7. Recompute the remainder against the original signed divisor.

The current official property test uses positive divisors. Supporting nonzero negative divisors consistently with this algorithm is a reasonable utility policy unless an inspected contract forbids it; document and test that choice. Do not confuse the remainder bounds with the sign of a negative divisor: use abs(divisor) for the general bound.

Concrete arithmetic checks (q,r):
5 / 2 HALF_EVEN -> (2, 1)
5 / 2 HALF_UP -> (3, -1)
7 / 2 HALF_EVEN -> (4, -1)
-5 / 2 HALF_EVEN -> (-2, -1)
-5 / 2 HALF_UP -> (-3, 1)
-7 / 2 HALF_EVEN -> (-4, 1)
1 / 3, either mode -> (0, 1)
2 / 3, either mode -> (1, -1)
0 / 7 -> (0, 0)
100 / 4 -> (25, 0)

Verify arbitrary signed dividends satisfy exact reconstruction and abs(remainder) < abs(divisor). Half-even and half-up can differ only on exact ties, and need not differ at every tie.

I. EXACT RATIONAL RATE APPLICATION

Implement applyRate(money, numerator, denominator, mode = HALF_EVEN): RateApplication.

- Reuse the same rounding utility, rather than duplicating a different policy.
- Compute product = money.amount * numerator in bigint before division.
- result.amount is the rounded quotient; remainder.amount is the residual numerator from the division result.
- Both returned Money objects retain the input asset; return fresh objects and leave the input untouched.
- Preserve result.amount * denominator + remainder.amount === money.amount * numerator.
- Reject denominator 0n via MoneyError; support signs consistently with divideWithRounding unless current contracts explicitly constrain rates.
- Do not treat numerator or denominator as a JavaScript floating rate, percentage, basis points, or exponent conversion unless a caller explicitly supplies that scale.
- Preserve intermediate precision beyond 2^53 and beyond the parser's external-input range.

Interpretation matters: the residual is in the numerator scale of this rational calculation. It is NOT automatically a whole minor-unit balance that can be posted directly to the ledger. The pair plus denominator reconstructs the exact result. Preserve the supplied RateApplication type; document its arithmetic meaning instead of changing the interface.

Examples:
money=5n USD, rate=1n/2n, HALF_EVEN -> result 2n USD, residual 1n USD; 2*2+1=5.
money=5n USD, rate=1n/2n, HALF_UP -> result 3n USD, residual -1n USD; 3*2-1=5.
money=100n USD, rate=0n/7n -> result 0n, residual 0n.

J. MEANINGFUL SUPPLEMENTAL TESTS

Official tests do not fully establish serialisation, toDecimal, applyRate, or all signed rounding boundaries. Add a small participant-owned tests/task04-money-extra.test.ts if the current checkout lacks equivalent meaningful coverage. This is permitted; do not edit any organiser file.

Keep it as pure-domain tests importing assets/money, without starting the server or database. Cover:
- MAX=9223372036854775807 accepted; MAX+1 rejected; values beyond 2^53 remain exact.
- "1\n", "1\r\n", whitespace, numeric inputs, leading zeros, and non-ASCII digits are rejected at the parser boundary.
- Internal negative arithmetic and serialisation remain valid; asset mismatch for add, sub, and compare throws.
- Decimal scaling and signed fixed-exponent formatting, exponent 0, smallest fractions, and scaled overflow under the documented policy.
- Negative midpoint rounding and the listed remainder examples.
- A generated reconstruction property for both modes and nonzero divisors, with large signed inputs.
- applyRate reconstruction, asset preservation, no mutation, zero numerator, zero denominator, and large intermediates.
- Registry copies can be mutated without altering later lookups.

Use independent expected bigint constants or independent identities. Do not build the oracle by calling the same helper twice and comparing it to itself. Avoid duplicating every official example in a large redundant suite. Do not change global seeds, run counts, or protected test configuration. Use bounded generators suitable for the event.

K. VERIFICATION SEQUENCE

Run focused checks after implementation:

npm run typecheck
npm test challenge01.test.ts -t "Challenge 1a|Challenge 1b"
npm test challenge00b.test.ts -t "Challenge 0h"
npm test challenge00c.test.ts -t "Challenge 0x"

If the supplemental file was created, run:

npm test task04-money-extra.test.ts

Then check previous task stability:

npm test challenge00.test.ts
npm test challenge00b.test.ts -t "Challenge 0g|Challenge 0v"
npm test _sanity.test.ts

Expected focused counts at the inspected reference:
- Challenge 1a/1b: 10 tests (7 parsing/arithmetic + 3 rounding).
- Challenge 0h: 1 exponent test.
- Challenge 0x: 2 registry consistency/copy tests.
- Challenge 00: all 6 core infrastructure tests.
- Challenge 0g/0v: 2 adjacent status/setup tests.
- Sanity: 11 tests.
Use actual current output if the official version differs. Never count filtered-out tests as passed or claim full Challenge 01 is complete.

On a property failure, retain the printed seed, path, counterexample, and command. Fix the rule, not the generated example. Reproduce using a supported per-run mechanism already provided by the checkout if needed; do not modify tests/setup.ts or globally force a favourable seed. Rerun the normal test after the fix.

Inspect the actual /api/assets/validate assertions for valid and invalid JSON amounts. Domain tests alone must not hide a raw-bigint JSON response or native BigInt exception escaping the controller. The official 1a tests exercise several HTTP rejection cases; supplement one valid HTTP response check only if coverage is missing and it resolves a concrete risk.

Run the unchanged npm test once as the broader milestone regression required by the workflow. Record its exit code, complete counts, and remaining unimplemented areas. Do not try to implement HMAC, session, ledger, matching, or all later challenges as part of making Task 4 green. If the run is blocked/interrupted, label it INCOMPLETE rather than replacing it with a filtered success.

Every filtered run can overwrite test-results.xml; record command scope separately or preserve reports outside protected paths. Never edit XML or submit a filtered report as a whole-suite result. Repeat checks only to resolve a concrete regression or required gate.

L. COMPLETION NOTE AND HANDOFF

Write/update docs/clearhouse-task-04-money.md with:
- Starting commit/branch and preserved baseline changes.
- Changed files and explanation of every implemented export.
- Asset precision table and exact lookup/copy semantics.
- Public nonnegative 64-bit parsing versus signed/unbounded internal arithmetic.
- Documented choices where decimal/rate details were not specified by official assertions.
- Rounding algorithm, signed examples, reconstruction identity, and residual interpretation.
- Commands, exit codes, actual pass/fail/not-exercised counts, and whole-suite outcome.
- Any remaining unknowns; do not call untested code verified.
- Confirmation that protected content and scripts.test were not modified by this task.
- Task 7 asset fixes already addressed; cache/risk work still pending.
- Next task: Task 5 HMAC request signing and verification; Task 6 will complete session/role integration.
- Exact CodeCommit commit/push commands, using origin/main and assessment-page Git credentials if authentication is requested.

Run git diff --check and review status/diffs. Compare protected content against pre-task state, not only HEAD if it was already dirty. Do not revert someone else's changes automatically.

Task 4 completion requires:
1. All money exports implemented without placeholders.
2. Required external parsing/range/precision rules satisfied.
3. Correct registry exponents and isolated copies.
4. Signed exact arithmetic, rounding reconstruction, and rate reconstruction.
5. Typecheck and all in-scope official checks passing; previous verified basics retained.
6. Honest documentation of supplemental tests, full-suite limitations, and design choices.

Return a concise summary with exact changed files, actual results, any blocker, and reviewed PowerShell Git commands. Suggested commit message: feat: implement exact money arithmetic and asset validation.

Prepare publication commands but do not execute commit/push without my separate instruction. Do not continue into Task 5 automatically.
````

---

## Edge-case review sheet

Use this to review Cursor's result. Values are examples of general rules, never production fixtures to special-case.

| Input / operation | Expected behaviour |
|---|---|
| `parseAmount("0", "USD")` | `0n` minor units |
| `parseAmount("123", "BTC")` | `123n`, not `123 × 10^8` |
| `parseAmount("9007199254740993", "USD")` | Accepted exactly |
| `parseAmount("9223372036854775807", "USD")` | Accepted exactly |
| `parseAmount("9223372036854775808", "USD")` | Reject overflow |
| Raw `100`, `"01"`, `"-1"`, `"+1"`, `"1e3"`, `"1.5"`, `"1\n"` | Reject as external minor-unit input |
| `fromDecimal("0.001", "USD")` | Reject excess precision |
| `fromDecimal("0.001", "BHD")` | `1n` minor unit |
| `fromDecimal("0.00000001", "BTC")` | `1n` minor unit |
| `sub({amount:1n,asset:"USD"}, {amount:2n,asset:"USD"})` | Signed internal `-1n` USD |
| Add/subtract/compare USD and JPY | Reject asset mismatch |
| `5n / 2n`, half-even | Quotient `2n`, remainder `1n` |
| `5n / 2n`, half-up | Quotient `3n`, remainder `-1n` |
| `-5n / 2n`, half-up | Quotient `-3n`, remainder `1n` |
| Division by zero | `MoneyError` |
| Mutate an asset returned by `getAsset`/`listAssets` | Registry remains unchanged; returned object is a usable copy |

## Official CodeCommit commit and push commands

Run each command separately in PowerShell and inspect the result. Your user request calls these “GitHub push commands,” but your confirmed competition destination is **CodeCommit**. Keep the remote configuration you already established.

### 1. Verify your checkout

```powershell
Set-Location "C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b"
git status --short
git branch --show-current
git remote -v
git diff --stat
git diff --cached --stat
```

Confirm branch `main` and origin fetch/push URL:

```text
https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b
```

If different, inspect before proceeding. Do not replace `origin`, create a replacement checkout, switch branches, add GitHub remotes, or change upstream tracking to make an example fit. Do not expose credentials in remote output.

### 2. Verify the implementation before committing

Reuse Cursor's just-completed results if the working tree is unchanged; rerun affected checks after subsequent edits. Typecheck must be current before the commit.

```powershell
npm run typecheck
npm test challenge01.test.ts -t "Challenge 1a|Challenge 1b"
npm test challenge00b.test.ts -t "Challenge 0h"
npm test challenge00c.test.ts -t "Challenge 0x"
npm test challenge00.test.ts
npm test _sanity.test.ts
git diff --check
```

If the participant test exists:

```powershell
npm test task04-money-extra.test.ts
```

Keep the broader `npm test` result recorded as instructed in the prompt. A passing filtered group does not mean all of Challenge 01 or the whole platform passed.

### 3. Review and stage only Task 4 changes

```powershell
git diff -- src/domain/assets.ts src/domain/money.ts src/controller/assetsController.ts
git add -- src/domain/assets.ts
git add -- src/domain/money.ts
git add -- docs/clearhouse-task-04-money.md
```

Only if created/changed and verified for this task:

```powershell
git add -- tests/task04-money-extra.test.ts
git add -- src/controller/assetsController.ts
```

Do not run an optional staging line for a nonexistent file. If a file contains unrelated work, use `git add -p -- <actual-file-path>` to stage the intended hunks. Review pre-existing staged work before committing; do not accidentally include or discard another person's changes.

Do not stage altered organiser tests/configuration, dependencies, `.env`, the database, backups, `node_modules`, logs, or unrelated UI changes as part of this pure-domain task. Preserve required competition files already committed in Task 2.

### 4. Review and commit

```powershell
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached -- src/domain/assets.ts src/domain/money.ts src/controller/assetsController.ts tests/task04-money-extra.test.ts docs/clearhouse-task-04-money.md
git commit -m "feat: implement exact money arithmetic and asset validation"
git show --stat --oneline HEAD
```

Stop on failed checks or a failed commit. If the implementation was already present and no changes were needed, do not create an empty implementation commit. Record the actual verification outcome.

### 5. Push to the official submission repository

```powershell
git push origin main
git rev-parse --verify HEAD
git ls-remote origin refs/heads/main
git status -sb
```

Compare the full local HEAD hash with the remote `refs/heads/main` hash. Matching hashes confirm repository delivery; they do not prove that grading finished or tests passed. If the remote advances afterward, fetch and inspect rather than assuming the push failed.

If HTTPS authentication is requested, use the **Git username and password from the DevQuest assessment page** for this CodeCommit repository. GitHub credentials are not the credentials for this destination. Enter credentials only through the appropriate Git prompt/credential manager; do not put them in Cursor chat, source, remote URLs, or this file. Git commit author name/email is separate from the assessment Git login.

### 6. Recover from a non-fast-forward rejection

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/main
git status --short
```

If only behind and the working tree is clean, use `git merge --ff-only origin/main`. If both branches contain new commits, integrate teammate changes using your normal merge workflow, resolve conflicts, rerun affected tests/typecheck, and then `git push origin main`. Never force-push, automatically stash unfinished work, or rewrite shared history.

## Send back after completion

- Cursor's Task 4 summary and changed-file list.
- Typecheck, focused official tests, and supplemental test results.
- First complete failure/counterexample if blocked, with secrets removed.
- Full-suite status separately from focused checks.
- Commit hash and CodeCommit `origin/main` push result, if committed/pushed.

Next request: **“Give me the complete enhanced Cursor prompt for Task 5 in one Markdown file, including official CodeCommit push commands.”**
