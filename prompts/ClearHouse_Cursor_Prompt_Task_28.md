# ClearHouse — Complete Enhanced Cursor Prompt for Task 28

**Task:** Challenge 16 — Fee and Rebate Engine  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-28`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 28 purpose

Task 28 implements the full **Challenge 16 — Fee and Rebate Engine**.

The fee system must correctly handle:

- exact fee and rebate arithmetic far beyond `Number.MAX_SAFE_INTEGER`;
- exact signed round-half-to-even (“banker’s rounding”);
- independent maker and taker fee tiers;
- per-account trailing-volume windows;
- exact expiry at the window boundary;
- fees and rebates as real balanced double-entry ledger entries;
- fill redelivery/idempotency;
- no repeated volume/tier/ledger/time effects on duplicate fills;
- 200,000-fill scale without quadratic rescanning;
- strict `RangeError` validation for invalid schedules, options and fills.

This is a financial-arithmetic challenge. **Floating-point arithmetic is forbidden.**

The current `tests/challenge16.test.ts` and current CodeCommit checkout are the authoritative specification.

Do not guess:

- the fee-rate unit;
- the rate denominator;
- the exact schedule structure;
- the volume metric used for tiers;
- the fill schema;
- the fee asset;
- fee-account identity;
- timestamp behavior;
- public class/function names.

Read the organizer test and existing source first.

---

# Published Challenge 16 contract — 200 points

## 16a — Exact fee arithmetic — 55 pts

### 16a-1 — 30 pts

Fees must match the organizer’s exact integer oracle for arbitrary notionals, including values greater than `2^53`.

Rebates must mirror fees correctly.

This requires:

- exact integer multiplication;
- exact rational division;
- correct sign handling;
- no `Number`;
- no `parseFloat`;
- no floating-rate conversion.

### 16a-2 — 25 pts

An exact half must round to the **even integer**, in both directions and for rebates.

This is **round-half-to-even**, not:

- `Math.round`;
- always half-up;
- always away from zero;
- truncation.

The signed behavior matters for negative fee amounts / rebates.

Read the exact organizer oracle and implement one reusable signed rational-rounding helper.

---

## 16b — Volume tiers — 60 pts

### 16b-1 — 45 pts

Each side’s fee tier is determined using **that account’s own trailing volume before the current fill**.

Important:

1. prune expired historical volume;
2. read maker’s pre-fill trailing volume;
3. choose maker tier;
4. read taker’s pre-fill trailing volume;
5. choose taker tier;
6. calculate current fill fees;
7. only then add the current fill’s eligible volume to each participant’s rolling history according to the exact test contract.

The current fill must not promote itself into a cheaper tier.

### 16b-2 — 15 pts

Window boundary is exact:

- a fill exactly one full window old has expired;
- a fill one millisecond younger remains.

If `windowMs = W` and current fill time is `T`, then the organizer contract implies that an old record at exactly `T - W` is expired, while `T - W + 1` remains.

Use the exact test and timestamp type.

---

## 16c — Fees as balanced ledger entries — 30 pts

### 16c-1 — 30 pts

Every fee/rebate posting must:

- be a first-class ledger entry;
- balance independently per asset;
- move value in the correct direction;
- cause the fee account to net to exactly the fees collected after accounting for rebates.

Positive fee:

- participant pays fee account.

Negative fee / rebate:

- fee account pays participant.

Do not create one-sided postings.

Do not mutate historical ledger entries.

Reuse Task 10’s balanced-entry machinery.

---

## 16d — Fill idempotency — 20 pts

### 16d-1 — 20 pts

A redelivered fill must return the **original result** and change nothing:

- no second fee;
- no second rebate;
- no second ledger entry;
- no extra trailing volume;
- no tier change;
- no timestamp-clock change.

Duplicate processing must be detected at the correct fill-identity boundary defined by the test.

Do not recompute using current tier state and then merely suppress posting; replay must return the original result.

---

## 16e — Scale — 25 pts

### 16e-1 — 25 pts

**200,000 fills** with a wide trailing window must be priced:

- exactly;
- within the organizer’s performance budget.

A naive implementation that sums an account’s entire history on every fill becomes `O(n²)` and is not acceptable.

Use an efficient rolling-window design with:

- a queue/deque-like history;
- a running exact volume total;
- an advancing head index or another amortized O(1) expiry structure.

Avoid repeated `Array.shift()` on very large arrays if it creates linear compaction costs.

---

## 16f — Input validation — 10 pts

### 16f-1 — 10 pts

Invalid:

- schedules;
- engine/options;
- fills

must throw `RangeError`.

Read all invalid cases from `challenge16.test.ts`.

Do not substitute:

- generic `Error`;
- TypeError;
- silent coercion;
- fallback defaults

where the organizer requires `RangeError`.

---

# Challenge 16 score map

```text
16a = 55
16b = 60
16c = 30
16d = 20
16e = 25
16f = 10
----------------
Total = 200
```

These are available points only, not a claim about earned score.

---

# Critical mathematical rule — signed round-half-to-even

Task 28 must not guess the rate denominator.

Let the exact organizer-defined fee fraction be:

```text
numerator   = notional * rate
denominator = exact rate scale/denominator from test
```

The final fee minor-unit integer must use **round-to-nearest, ties-to-even**.

A robust signed strategy conceptually is:

1. separate sign from magnitude;
2. perform division on nonnegative magnitudes;
3. `q = absNumerator / denominator`;
4. `r = absNumerator % denominator`;
5. compare `2*r` with denominator:
   - `<` → `q`
   - `>` → `q + 1`
   - `==` → choose the even integer:
     - if `q` is even → `q`
     - if `q` is odd → `q + 1`
6. restore the original sign.

This naturally produces symmetric signed behavior for rebates.

Examples of HALF-TO-EVEN behavior conceptually:

```text
+2.5 -> +2
+3.5 -> +4
-2.5 -> -2
-3.5 -> -4
```

Do not hardcode these examples into runtime behavior.

Use the actual integer rate scale from the current challenge.

---

# Critical trailing-volume rule

For account `A` and current fill at timestamp `T`:

1. expire records according to exact window rule;
2. determine `A`’s current trailing total;
3. select `A`’s fee tier from that **pre-fill** total;
4. calculate `A`’s current fee/rebate;
5. append the current fill’s eligible volume contribution to `A` only after pricing.

Maker and taker tier evaluation is independent.

Do not use:

- global market volume;
- maker’s volume for taker;
- taker’s volume for maker;
- post-fill volume to choose the current tier.

---

# COMPLETE CURSOR AGENT PROMPT — TASK 28

Copy the complete block below into Cursor Agent mode.

````text
Act as my senior TypeScript fintech fee-engine engineer, exact-arithmetic reviewer, rolling-window performance engineer, and double-entry ledger integration engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 28 ONLY: implement Challenge 16 — Fee and Rebate Engine — completely and correctly.

Preserve all completed Tasks 1–27.

Your implementation must provide:
- exact fee/rebate arithmetic;
- signed round-half-to-even;
- independent maker/taker trailing-volume tiers;
- exact rolling-window expiry;
- balanced fee/rebate ledger entries;
- fill idempotency;
- efficient 200,000-fill processing;
- strict RangeError validation.

Do NOT guess field names, rate scales, schedule shapes, fee assets or identities.
Read `tests/challenge16.test.ts` and current source before editing.

Do not stop at a plan. Inspect, implement, run official tests/regressions, write the Task 28 engineering note, and show reviewed Git commands.

Do not automatically commit, merge, or push.

============================================================
A. REPOSITORY / SUBMISSION CONTEXT
============================================================

Working directory:

C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b

Official remote:

origin

Official CodeCommit repository:

https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b

OFFICIAL FINAL SUBMISSION BRANCH:

master

Task branch:

task-28

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–27;
- work on task-28;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT TASK 28 SCOPE
============================================================

IMPLEMENT:

Challenge 16a:
- exact fee arithmetic;
- exact rebates;
- half-to-even rounding.

Challenge 16b:
- trailing volume;
- independent account tiers;
- pre-fill tier selection;
- exact window expiry.

Challenge 16c:
- balanced fee/rebate ledger entries;
- correct participant/fee-account direction.

Challenge 16d:
- fill redelivery idempotency;
- original result replay;
- no duplicate side effects.

Challenge 16e:
- 200,000-fill performance.

Challenge 16f:
- RangeError validation.

PRESERVE:
- Challenge 02 ledger;
- Challenge 03 matching/trades;
- Challenge 04 settlement;
- Challenge 05 risk;
- Challenge 08 market data;
- Challenge 13 account closure;
- Task 21 API behavior;
- Task 25 OpenAPI.

DO NOT IMPLEMENT:
- Task 29 Challenge 14 netting;
- Task 30 Challenge 15 strategy order state machines;
- Task 31 WebSocket server;
- Task 32 live client;
- Task 33 final integration;
- unrelated business APIs.

============================================================
C. STRICT ORGANIZER / FILE RULES
============================================================

Do NOT modify any organizer test.

Do NOT add new test files.

Do NOT modify:

- config/
- config/scores.ts
- package.json
- package-lock.json
- .env
- .gitignore
- tsconfig files
- vitest.config.ts
- knexfile.js
- migrations
- seeds
- grading/result-upload scripts

Do NOT:
- alter benchmark timeout;
- reduce 200,000-fill count;
- skip property/randomized tests;
- fix fast-check seeds;
- weaken assertions.

Do NOT add source behavior checking:
- NODE_ENV === "test";
- VITEST;
- challenge16 filename;
- known fill IDs;
- visible tier thresholds;
- visible account IDs;
- known benchmark count.

Do NOT use:
- Number(financialValue);
- parseFloat for fees/rates/notional;
- Math.round for fee rounding;
- floating-point percentages/rates.

No destructive Git:
- no reset --hard;
- no clean -fd;
- no force-push;
- no history rewrite.

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
- master = official final submission branch.

Verify Task 27 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-27 exists:

git log --oneline --decorate --max-count=10 task-27

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-28

If task-28 already exists:

git branch --list task-28
git log --oneline --decorate --max-count=10 task-28

Do not delete/recreate blindly.

Record:
- starting commit;
- current branch;
- pre-existing modified files;
- pre-existing staged files.

============================================================
E. VERIFY PREREQUISITES
============================================================

Read if present:

- docs/clearhouse-task-04-money.md
- docs/clearhouse-task-10-ledger.md
- docs/clearhouse-task-13-atomic-settlement.md
- docs/clearhouse-task-14-basic-matching.md
- docs/clearhouse-task-16-advanced-matching.md
- docs/clearhouse-task-17-risk.md
- docs/clearhouse-task-18-account-closure.md
- docs/clearhouse-task-27-market-data-time.md

Verify actual source, not notes alone.

Task 28 depends heavily on:
- exact BigInt;
- trade/fill identity;
- maker/taker semantics;
- balanced ledger insertion.

Before editing run:

npm run typecheck
npm test challenge02.test.ts
npm test challenge03.test.ts

Record any pre-existing failures.

============================================================
F. READ CHALLENGE 16 COMPLETELY
============================================================

Read:

tests/challenge16.test.ts

from first line to last line.

Read:

config/scores.ts

READ ONLY.

Build an exact contract matrix:

test
| points
| imported class/function
| constructor/options
| schedule shape
| fill shape
| rate unit
| denominator
| volume measure
| timestamp rule
| result shape
| ledger expectations
| current defect

Record:
- exact Challenge 16 test count;
- exact public exports/signatures;
- fee schedule interface;
- tier interface;
- maker rate field;
- taker rate field;
- rate scale/denominator;
- whether negative maker rates represent rebates;
- trailing-volume measure;
- trailing window option;
- fee account identity;
- fee asset;
- Fill interface;
- fill unique identity;
- maker/taker account fields;
- notional field or notional derivation;
- timestamp type;
- result object;
- ledger integration signature;
- idempotency return behavior;
- engine clock semantics;
- every invalid case.

DO NOT GUESS.

============================================================
G. DISCOVER THE CURRENT FEE SOURCE
============================================================

Search:

rg -n "fee|Fee|rebate|Rebate|tier|Tier|maker|taker|trailing|volumeWindow|feeAccount|processFill|priceFill|roundHalf" src tests

PowerShell fallback:

Get-ChildItem -Recurse src,tests -File |
  Select-String -Pattern "fee|Fee|rebate|Rebate|tier|Tier|maker|taker|trailing|volumeWindow|feeAccount|processFill|priceFill|roundHalf"

Read every current Challenge 16 source/stub completely.

Potential file names may resemble:
- src/domain/fees.ts
- src/services/feeEngine.ts
- src/repositories/feeRepository.ts

These are examples only.

Use actual paths.

Also read:
- src/domain/ledger.ts
- src/repositories/ledgerRepository.ts
- current Trade/Fill types
- DB executor conventions.

============================================================
H. RUN TASK 28 BASELINE
============================================================

Run:

npm test challenge16.test.ts

If labels exist:

npm test challenge16.test.ts -t "Challenge 16a"
npm test challenge16.test.ts -t "Challenge 16b"
npm test challenge16.test.ts -t "Challenge 16c"
npm test challenge16.test.ts -t "Challenge 16d"
npm test challenge16.test.ts -t "Challenge 16e"
npm test challenge16.test.ts -t "Challenge 16f"

Use actual labels.

Record:
- exact executed count;
- pass/fail;
- property-test seed/path if any;
- benchmark timing;
- first real defect.

Filtered-out tests are not passed.

============================================================
I. IDENTIFY THE RATE REPRESENTATION
============================================================

Before writing arithmetic, determine EXACTLY how a fee rate is represented.

Possibilities include:
- integer basis points;
- ppm;
- numerator with explicit denominator;
- another integer scale.

DO NOT assume 10,000 denominator.

Read test/source.

Record:

rate integer type
rate denominator
allowed sign
allowed range

Keep rates exact.

If rates are JSON/string inputs:
validate exactly and convert to BigInt only after validation.

============================================================
J. NOTIONAL SOURCE
============================================================

Determine whether Fill supplies:
- notional directly;
- price and quantity requiring multiplication;
- another exact amount.

DO NOT guess.

If deriving:
- use BigInt multiplication;
- apply any scale exactly as organizer oracle requires.

Do not reuse Challenge 08 VWAP scaling incorrectly.

Do not use floating point.

============================================================
K. EXACT FEE FUNCTION — 16a
============================================================

Create/reuse one pure fee arithmetic helper.

Conceptually:

exactFee(notional, rate, denominator) -> bigint

using organizer-defined types.

Compute full exact numerator first.

No intermediate division.

Correct:

notional * rate
then exact signed half-even division.

Incorrect:
divide notional first;
convert rate to decimal float;
Math.round(notional * 0.001).

============================================================
L. SIGNED REBATES
============================================================

A negative fee amount represents a rebate if that is the current contract.

Do not:
- take absolute value and lose sign;
- clamp negative result to zero.

Rebate arithmetic must mirror fee arithmetic exactly.

Positive rate/fee and negative rate/rebate must obey the same exact rational rounding rule.

============================================================
M. ROUND-HALF-TO-EVEN — 16a-2
============================================================

Implement a reusable signed integer rational rounder.

Do not use Math.round.

Recommended conceptual algorithm:

function roundHalfEven(numerator, denominator):
    validate denominator > 0
    sign = numerator < 0 ? -1 : 1
    n = abs(numerator)
    q = n / denominator
    r = n % denominator
    twice = r * 2

    if twice < denominator:
        rounded = q
    else if twice > denominator:
        rounded = q + 1
    else:
        rounded = (q % 2 == 0) ? q : q + 1

    return sign * rounded

Adapt types/syntax to current source.

This produces symmetric signed tie behavior.

Do not perform `abs()` on the final fee and then reapply an incorrectly inferred sign.

============================================================
N. NON-HALF ROUNDING
============================================================

For remainder:
- below half → nearest lower magnitude integer;
- above half → nearest higher magnitude integer;
- exactly half → even integer.

Test with positive and negative organizer fixtures.

Do not accidentally implement floor for negatives.

============================================================
O. VERY LARGE VALUES
============================================================

16a tests values beyond 2^53.

All financial arithmetic must stay in BigInt.

No:
- Number(notional);
- Number(rate);
- Number(numerator);
- Number(result).

Only timestamp/array indices may use normal JS number if current interface does.

============================================================
P. FEE SCHEDULE VALIDATION — 16f
============================================================

Read every schedule-invalid test.

Validate exact current rules before storing schedule.

Potential categories MAY include:
- empty schedule;
- unsorted thresholds;
- duplicate thresholds;
- negative thresholds;
- invalid rate;
- invalid maker/taker fields;
- unreachable tier;
- first threshold requirement.

These are examples only.

Use actual test.

Throw `RangeError`.

Do not silently sort an invalid schedule if organizer expects rejection.

============================================================
Q. TIER THRESHOLD SEMANTICS
============================================================

Read exact independent oracle.

Determine whether a tier applies when:

volume >= threshold

or another boundary.

Do not guess.

Record threshold inclusivity.

The exact current fill uses PRE-FILL trailing volume.

============================================================
R. PER-ACCOUNT TRAILING VOLUME
============================================================

Maintain rolling state independently for each account.

Do not use:
- one global trailing total;
- market total;
- maker-only history;
- taker-only history shared across accounts.

Maker and taker each query their own history.

If the same account can theoretically be both sides:
read current fill validation/self-trade assumptions.

Do not double-add unless test says so.

============================================================
S. WHAT COUNTS AS TRAILING VOLUME
============================================================

Read Challenge 16 oracle.

Could be:
- fill notional;
- fill quantity;
- absolute fee basis amount;
- another exact measure.

Do not infer from challenge wording alone.

Use EXACT organizer-defined value.

Store that value as BigInt.

============================================================
T. PRE-FILL TIER SELECTION — 16b-1
============================================================

Critical order:

1. validate fill;
2. handle duplicate fill ID BEFORE state mutation;
3. enforce timestamp/clock rules;
4. expire old volume for maker;
5. expire old volume for taker;
6. read maker pre-fill volume;
7. choose maker tier;
8. read taker pre-fill volume;
9. choose taker tier;
10. calculate maker/taker fees;
11. produce required ledger effects/result;
12. add current fill volume to histories;
13. advance engine clock only once according to current contract;
14. remember idempotency result.

Adapt ordering around DB transaction as required.

Do NOT add current fill volume before selecting its tiers.

============================================================
U. MAKER AND TAKER TIERS ARE INDEPENDENT
============================================================

Maker account may be:
- high-volume tier.

Taker may be:
- low-volume tier.

Use each participant’s own trailing volume.

Do not select one fill-wide tier and apply it to both.

Use maker rate from maker tier.
Use taker rate from taker tier.

============================================================
V. CURRENT FILL VOLUME UPDATE
============================================================

After pricing, update each side's rolling volume according to test.

Determine whether both sides receive:
- same notional contribution;
- different contribution;
- any special same-account handling.

Do not guess.

Current fill must affect future fills, not its own tier.

============================================================
W. EXACT TRAILING WINDOW EXPIRY — 16b-2
============================================================

Read test.

Published rule:

a fill exactly one window old has expired;
one millisecond younger remains.

If current time = T and window = W:

record at T-W:
EXPIRED.

record at T-W+1:
INCLUDED.

Therefore expiry condition is conceptually:

timestamp <= T - W

for the published semantics.

Confirm exact type/test.

Do not use `<` if organizer expects `<=`.

This is a classic off-by-one failure.

============================================================
X. CLOCK SEMANTICS
============================================================

Challenge 16d explicitly says duplicate redelivery changes neither tiers nor the timestamp clock.

Read the engine's clock design.

Possible:
- max processed timestamp;
- last processed timestamp;
- monotonic timestamp property.

Do not invent Date.now.

Use fill timestamps/test-injected time.

Determine:
- whether timestamps must be monotonic;
- whether older timestamps throw RangeError;
- whether equal timestamp allowed;
- when clock updates.

Redelivery must return before advancing clock.

============================================================
Y. DUPLICATE CHECK BEFORE CLOCK MUTATION
============================================================

If a fill with already-seen identity is redelivered:

return original stored result immediately according to contract.

Do NOT:
- advance lastTimestamp;
- expire windows;
- alter volume;
- reevaluate tiers;
- append ledger;
- increment counters.

This is essential for 16d.

============================================================
Z. FILL IDENTITY — 16d
============================================================

Read exact fill unique key.

Possibilities:
- fill.id;
- tradeId;
- executionId.

Do not use array index.

Do not dedupe by payload because two identical economic fills can be separate events.

Store original result under stable fill identity.

============================================================
AA. DUPLICATE SAME ID / DIFFERENT BODY
============================================================

Read Challenge 16 test.

If tested:
- throw RangeError/conflict;
- or return first result

according to exact contract.

Do not invent behavior.

If not explicitly tested:
prefer not silently accepting contradictory same-ID payloads if existing architecture has a fingerprint, but do not overcomplicate Task 28.

============================================================
AB. ORIGINAL RESULT REPLAY
============================================================

A duplicate fill must return the original result exactly.

Do not recompute using current:
- tier;
- schedule;
- trailing volume.

Store a safe immutable/copyable result.

If result contains arrays/objects:
avoid returning mutable internal object if caller mutation could corrupt future replay.

Read test.

============================================================
AC. STATE STORAGE
============================================================

Challenge 16 may be a pure in-memory engine.

Do not add DB persistence unless current source/test expects it.

Use:
- Maps;
- arrays/deques;
- current repository

according to existing architecture.

No migration by default.

============================================================
AD. PERFORMANCE — NO HISTORY RESCAN
============================================================

For each account, do NOT calculate trailing volume by:

history.filter(...).reduce(...)

on every fill.

At 200,000 fills this can become quadratic.

Maintain:

history = entries ordered by processed timestamp
head = first nonexpired index
runningVolume = bigint

On expiry:
while head < history.length and entry.timestamp expired:
    runningVolume -= entry.volume
    head++

On append:
history.push(current contribution)
runningVolume += current contribution

Then current trailing total is O(1).

============================================================
AE. AVOID ARRAY.SHIFT AT SCALE
============================================================

Repeated `Array.shift()` can move all remaining elements.

Prefer:
- head index;
- ring buffer;
- deque abstraction implemented dependency-free.

Occasionally compact when head becomes large if needed:

history = history.slice(head)
head = 0

but not every fill.

Keep amortized behavior.

============================================================
AF. PER-ACCOUNT STATE MAP
============================================================

Use:

Map<accountId, RollingVolumeState>

or current equivalent.

Each state contains:
- running total;
- ordered entries;
- head.

Do not scan all accounts on every fill.

Expire only the accounts involved in the current fill unless organizer requires global cleanup.

============================================================
AG. TIER LOOKUP PERFORMANCE
============================================================

Read schedule size.

Could use:
- linear scan if tier count tiny;
- binary search for sorted thresholds.

Do not prematurely complicate.

200k test likely dominated by volume history, not a handful of tiers.

But do not sort schedule per fill.

Validate/preprocess schedule once in constructor.

============================================================
AH. IMMUTABLE SCHEDULE
============================================================

Do not let caller mutate the schedule after engine construction and alter fee behavior unexpectedly.

If current contract expects defensive copy:
copy/freeze internal schedule structures.

Read test.

Do not mutate caller's schedule during validation/sorting.

============================================================
AI. INPUT OPTIONS VALIDATION — 16f
============================================================

Read exact constructor/options invalid tests.

Validate:
- trailing window;
- fee account;
- rate scale/options;
- clock options;
- any required asset/account values.

Throw `RangeError`.

Do not silently default invalid numeric values.

Do not convert `NaN`/Infinity to integers.

============================================================
AJ. FILL VALIDATION — 16f
============================================================

Read every invalid fill test.

Potential checks MAY include:
- blank/missing ID;
- missing maker/taker account;
- same account if forbidden;
- negative/zero notional;
- invalid timestamp;
- timestamp regression;
- unsupported asset;
- malformed exact integers.

Examples only.

Follow exact test.

Throw `RangeError`.

Do not mutate state before all validation that must precede mutation.

============================================================
AK. RANGEERROR MUST OCCUR BEFORE SIDE EFFECTS
============================================================

Invalid schedule/options:
constructor/setup must leave no partially initialized external side effects.

Invalid fill:
- no trailing volume;
- no clock mutation;
- no ledger entry;
- no idempotency record.

Validation first.

============================================================
AL. LEDGER INTEGRATION — 16c
============================================================

Read Task 10 ledger implementation.

Reuse:
- insertBalancedEntry(executor, postings, ...)
or actual current equivalent.

Do not:
- manually insert unbalanced postings;
- update old ledger entries;
- bypass `assertBalanced`.

Every fee/rebate ledger entry must balance independently per asset.

============================================================
AM. IDENTIFY FEE ASSET
============================================================

Read test/current Fill/options.

Do not assume USD.

Fee may be:
- quote asset;
- a configured fee asset;
- a fill asset.

Use exact contract.

Do not cross-net different assets in a ledger entry.

============================================================
AN. IDENTIFY FEE ACCOUNT
============================================================

Use exact configured/test fee account identity.

Do not hardcode:
"FEES"
unless the current contract says so.

Do not create a new account behind the organizer’s back.

If fee account must already exist:
follow test setup.

If engine receives feeAccountId option:
validate exactly.

============================================================
AO. POSITIVE FEE DIRECTION
============================================================

For a positive participant fee amount `F`:

economic effect:
participant loses F;
fee account gains F.

Map that economic flow to the project’s SIGNED LEDGER POSTING convention.

Do not guess debit/credit sign from accounting vocabulary.

Read Task 10 signed posting convention.

The two postings for that asset must sum to zero.

============================================================
AP. NEGATIVE FEE / REBATE DIRECTION
============================================================

For a negative calculated fee (rebate magnitude R):

economic effect:
fee account loses R;
participant gains R.

Do not post:
- participant paying a negative amount in a way that reverses incorrectly;
- fee account collecting a rebate.

Test checks direction.

Use one clear helper that converts signed fee to balanced participant/fee-account postings.

============================================================
AQ. MAKER AND TAKER LEDGER EFFECTS
============================================================

Read test.

Possible designs:
- one balanced ledger entry per participant fee/rebate;
- one combined multi-posting fee entry per fill.

Use exact expected entry shape/count if test checks it.

Regardless:
every entry must balance;
fee account net across all entries must equal total collected fees minus rebates.

Do not combine unrelated assets.

============================================================
AR. ZERO FEE
============================================================

Read test.

If rounded fee = 0:
determine whether organizer expects:
- no ledger entry;
- balanced zero postings;
- result only.

Do not guess.

Avoid meaningless zero-value ledger pollution unless required.

============================================================
AS. LEDGER ENTRY METADATA
============================================================

If ledger API supports:
- reference;
- memo;
- external ID

use exact test/current source if required.

Do not change ledger schema.

No migration.

============================================================
AT. LEDGER TRANSACTIONALITY
============================================================

If fill pricing and fee ledger insertion are part of one DB-backed operation:

ensure failure does not leave:
- volume updated but ledger absent;
- ledger posted but idempotency/result absent.

Read current architecture.

If Challenge 16 fee engine is purely in-memory with a provided ledger callback/executor:
follow test contract.

Do not create nested SQLite transactions.

============================================================
AU. IDEMPOTENCY + LEDGER ORDER
============================================================

Duplicate check must occur before new ledger posting.

On first fill:
- compute/result;
- post once;
- remember result/state.

On replay:
- return original;
- do not call ledger again.

If first processing fails during ledger write:
do not permanently mark fill processed or add rolling volume.

Use rollback/current transaction design.

============================================================
AV. FEE ACCOUNT NET CHECK
============================================================

After multiple fills:
fee account’s derived ledger balance/net should reflect exact sum of fees/rebates according to Task 10 sign convention.

Do not maintain a separate "feeTotal" as source of truth if test derives ledger.

A cached total can be diagnostic only.

============================================================
AW. TRAILING VOLUME AND LEDGER ARE DIFFERENT
============================================================

Do not derive trailing volume from fee ledger amounts.

Trailing volume is based on the organizer-defined fill volume measure.

Keep:
- trading volume state;
- fee ledger state

conceptually separate.

============================================================
AX. FILL RESULT SHAPE
============================================================

Read exact `challenge16.test.ts`.

Result may include concepts such as:
- maker tier/rate/fee;
- taker tier/rate/fee;
- trailing volume;
- ledger entry IDs.

Do not invent fields.

Preserve exact public API and types.

============================================================
AY. DO NOT MUTATE INPUT FILL
============================================================

Do not attach:
- fee;
- tier;
- processed flag

to caller Fill object unless current interface explicitly expects mutation.

Prefer immutable result.

Property/idempotency tests may reuse fills.

============================================================
AZ. RESULT BIGINT / STRING TYPES
============================================================

Direct domain tests may expect bigint fees.

Do not stringify BigInt prematurely.

If HTTP/API later serializes:
convert at boundary.

Challenge 16 likely tests the fee engine directly; follow exact types.

============================================================
BA. RATE TIER BOUNDARY EXAMPLES
============================================================

Do not hardcode visible values.

Use generic threshold selection.

If tiers are ascending minimum volumes, conceptually select the highest threshold satisfied by PRE-FILL volume.

But read exact test.

Do not accidentally choose next tier via post-fill volume.

============================================================
BB. WINDOW EXPIRY ORDER
============================================================

Before choosing current tier:
prune expired records.

Do not:
choose tier first, then expire.

At exact boundary this would use stale volume and fail 16b-2.

============================================================
BC. TIMESTAMP MONOTONICITY
============================================================

Efficient queue expiry assumes processed fill times are nondecreasing.

Read validation test/engine clock.

If out-of-order new fill timestamps are invalid:
throw RangeError before mutation.

If out-of-order timestamps must be accepted:
the data structure needs a different ordered expiry approach.

DO NOT assume.

Challenge 16d's timestamp-clock language strongly suggests a defined time ordering; use current test.

============================================================
BD. DUPLICATE OLDER FILL
============================================================

Even if a replayed fill’s timestamp is older than current clock:

duplicate identity handling must occur according to test before rejecting timestamp regression if the requirement is to return original result.

This is likely critical:
a redelivered old fill should replay successfully without clock change.

Read exact test ordering.

============================================================
BE. CLOCK ADVANCEMENT
============================================================

Advance internal clock exactly once for a first-time valid fill if contract requires.

Do not:
- add 1;
- use Date.now;
- use processing duration.

Use organizer-defined timestamp semantics.

Replay:
no advancement.

============================================================
BF. HISTORY ENTRY TIMESTAMP
============================================================

Store the exact timestamp used for window expiry.

Do not replace fill timestamp with:
- current system time;
- engine counter.

Use contract.

============================================================
BG. HISTORY COMPACTION
============================================================

For a head-index queue:
old expired prefix can grow.

Optional safe compaction:
if head is sufficiently large and e.g. > half array:
slice live suffix and reset head.

Do not compact on every fill.

Do not mutate objects stored in idempotency results.

============================================================
BH. SCALE TEST DISCIPLINE — 16e
============================================================

If scale test fails:
profile algorithmic work mentally/from test.

Look for:
- history reduce per fill;
- Array.shift per expiry;
- schedule sort per fill;
- scanning all accounts;
- ledger/test callback overhead;
- copying entire history on every result.

Do not:
- increase timeout;
- skip ledger correctness;
- bypass idempotency;
- use floats for speed.

Aim amortized O(1) rolling-volume maintenance plus O(number_of_tiers) or O(log tiers) tier lookup.

============================================================
BI. MEMORY AT SCALE
============================================================

Wide window may retain all 200k entries.

This is acceptable if compact representation is reasonable.

Do not store huge duplicate result/history snapshots per fill unnecessarily.

Idempotency map must store enough to return original result.

Avoid cloning entire rolling history into each result.

============================================================
BJ. INVALID RATE / OVERFLOW
============================================================

BigInt avoids integer overflow.

But validate denominator/rate range according to test.

Denominator:
must not be zero/negative if configurable.

Do not silently normalize invalid rate.

Throw RangeError.

============================================================
BK. FEE SCHEDULE TIER SEARCH
============================================================

Validate schedule once.

Precompute only safe immutable information.

Do not:
- resort on each fill;
- parse rate strings on each fill if constructor can validate/store BigInt once.

This improves scale.

============================================================
BL. CONCURRENCY
============================================================

Read Challenge 16.

If engine methods are synchronous:
no extra locking needed.

If asynchronous ledger insert introduces concurrent `processFill()` calls:
state mutations must be linearizable/idempotent.

Do not create races where two same fill IDs both pass duplicate check before first is recorded.

Use current architecture; if async concurrent test exists, implement single-flight/mutex per engine or transactional protection without adding dependencies.

Do not invent concurrency scope if tests are synchronous.

============================================================
BM. IN-FLIGHT FAILURE
============================================================

If implementing async single-flight:
failed first attempt must clean in-flight state so retry can execute.

Do not cache rejected Promise permanently unless contract says failure is replayed.

Use exact current architecture.

============================================================
BN. ACCOUNT CLOSURE
============================================================

Challenge 16 may be independent of account status.

Do not add closure checks to fee pricing unless test/current integration requires it.

Fees on an already executed fill may still need posting even if account status changed after trade.

Do not accidentally reject historical fill fee processing due to Task 18 unless organizer defines that relationship.

============================================================
BO. MATCHING INTEGRATION
============================================================

Do not modify matching behavior merely to generate fees.

Challenge 16 may directly pass fills to fee engine.

If test expects automatic fee processing from matching callback:
integrate minimally at the tested boundary.

Do not rewrite Task 14–16 matching.

Preserve maker/taker identity:
maker = liquidity resting before fill;
taker = aggressor.

Do not infer maker/taker solely from buy/sell side.

============================================================
BP. MARKET DATA INTEGRATION
============================================================

Do not use Challenge 08 VWAP for fee arithmetic.

Notional fee basis must follow Challenge 16.

Do not change candle/trade timestamps.

Task 27 remains intact.

============================================================
BQ. SETTLEMENT INTEGRATION
============================================================

Challenge 16 tests ledger fee entries.

Do not automatically deduct fees from settlement balances unless current test/source explicitly requires that as part of fee engine.

A ledger posting is required by published scope; settlement projection integration must follow exact organizer assertions.

Do not invent balance movement that double-charges participants.

============================================================
BR. OPENAPI / HTTP
============================================================

If Challenge 16 exposes no new HTTP route:
do not change Task 25 OpenAPI.

If an existing stub route is explicitly tested:
implement exact route and keep Challenge 19 documentation accurate.

No speculative fee admin API.

============================================================
BS. DATABASE / MIGRATIONS
============================================================

Default:
no new migration.

Use existing ledger and current fee engine in-memory/state design.

Do not create:
- fee_history table;
- tier table;
- processed_fills table

unless current Challenge 16 source/test explicitly expects persistence.

Do not modify migrations/seeds.

============================================================
BT. PURE HELPER SEPARATION
============================================================

Strong design if current source permits:

1. pure signed half-even division helper;
2. pure fee calculation helper;
3. schedule validation/tier selection;
4. rolling-volume state helper;
5. engine/process-fill orchestrator;
6. ledger posting helper.

Keep each responsibility clear.

Do not over-refactor unrelated modules.

============================================================
BU. DEFENSIVE COPIES
============================================================

If caller passes schedule/options arrays/objects:
read whether mutability tests exist.

Prefer an internal defensive copy after validation.

Do not mutate caller arrays by sorting in place.

============================================================
BV. DETERMINISM
============================================================

Given:
- same schedule;
- same options;
- same unique fill history

results must be deterministic.

No:
- Date.now;
- Math.random;
- locale;
- unordered dependence.

Use fill-provided timestamp.

============================================================
BW. EXACT HALF TESTS FOR REBATES
============================================================

Pay particular attention to negative numerator ties.

Do not implement:
`(n + d/2)/d`
because that is wrong for:
- even ties;
- negatives.

Use explicit remainder comparison and parity.

============================================================
BX. PARITY CHECK
============================================================

For BigInt quotient:

q % 2n === 0n

determines even.

Do not convert q to Number for parity.

============================================================
BY. ABSOLUTE BIGINT
============================================================

JS BigInt has no Math.abs.

Use:
n < 0n ? -n : n

or a safe helper.

Do not pass BigInt to Math.abs.

============================================================
BZ. ZERO NOTIONAL / ZERO RATE
============================================================

Read validation.

If zero notional fill is invalid:
RangeError.

If zero rate tier is valid:
fee = 0 exactly.

Do not confuse the two.

Use test.

============================================================
CA. NEGATIVE NOTIONAL
============================================================

Likely invalid.

Read Challenge 16f.

Do not take absolute value silently.

Throw RangeError if organizer expects.

============================================================
CB. TIER VOLUME BIGINT
============================================================

Trailing volume may exceed 2^53.

Store:
- thresholds;
- running totals;
- history contribution

as BigInt if test types are exact integers.

Do not convert threshold to Number.

============================================================
CC. TIMESTAMP NUMBER SAFETY
============================================================

If timestamps are numbers:
validate:
- finite;
- integer;
- safe range if organizer requires.

Do not use BigInt timestamps unless current interface does.

Window arithmetic should remain exact within tested range.

============================================================
CD. WINDOW MS VALIDATION
============================================================

Read test.

Likely must be:
- positive;
- finite;
- integer.

Do not allow:
- 0;
- negative;
- NaN;
- Infinity;
- fractional

if invalid per contract.

RangeError.

============================================================
CE. TIER HISTORY FOR MAKER/TAKER ROLE
============================================================

Trailing volume normally belongs to an account regardless of whether it was maker or taker.

But read the oracle.

If the schedule tracks maker/taker volumes separately:
implement that exact design.

Do not infer.

Record this explicitly in engineering note.

============================================================
CF. SAME FILL CONTRIBUTION TO BOTH ACCOUNTS
============================================================

Read test.

If both maker and taker each receive the fill's notional toward their own trailing volume:
append to both histories.

If fee account is also participant:
follow contract.

Do not add volume to fee account unless it is a trade participant and test says so.

============================================================
CG. LEDGER ENTRY BALANCE CHECK
============================================================

Before calling insert:
construct postings such that per asset sum is 0n.

Task 10 `assertBalanced` should enforce.

Do not catch `UnbalancedEntryError` and proceed.

A fee-processing failure should fail atomically according to engine contract.

============================================================
CH. FEE ACCOUNT NET ORACLE
============================================================

Track expected net conceptually:

feeAccountNet = Σ positive participant fees - Σ rebates paid

under economic sign.

Map to actual ledger sign convention when checking derived balance.

Do not assume ledger positive means economic receipt without reading Task 10 normal-balance semantics/test.

Challenge 16 likely tests exact posting amounts/direction.

============================================================
CI. TWO-SIDED FEE ENTRY OPTIONS
============================================================

If combining maker and taker effects in one entry:

For a single asset:
- participant maker posting;
- participant taker posting;
- fee account balancing posting

can form one balanced entry if organizer expects.

If maker gets rebate and taker pays fee:
fee account posting equals net.

But if test expects every fee/rebate as a first-class separate entry:
use separate entries.

Read exact `challenge16.test.ts`.

Do not optimize entry count against test.

============================================================
CJ. IDENTITY OF LEDGER POSTINGS
============================================================

If test links entries to fill ID:
use stable reference exactly.

Do not generate a new fee record on replay.

No duplicate fill ledger reference.

============================================================
CK. RANGEERROR VALIDATION OF SCHEDULE ORDER
============================================================

Do not "helpfully" normalize an invalid schedule if organizer wants validation.

If thresholds must be strictly increasing:
validate before copying/preprocessing.

Do not sort caller schedule in place.

============================================================
CL. RATE TYPES
============================================================

If rates are bigint:
validate directly.

If rates are numbers but integer basis points:
ensure:
- finite;
- integer.

If rates are strings:
strict integer grammar then BigInt.

Follow source/test.

Never convert a large exact rate string through Number.

============================================================
CM. FILL TIMESTAMP AND WINDOW PRUNING
============================================================

Perform pruning before tier selection for each account.

If maker == taker is permitted and one account should only prune once:
ensure result still follows oracle.

Do not subtract expired contribution twice.

Use shared state carefully.

============================================================
CN. HISTORY DUPLICATE FILL
============================================================

Idempotency prevents duplicate current volume insertion.

Do not rely on history dedup each time.

Primary duplicate guard should be processed-fill identity.

============================================================
CO. ORIGINAL RESULT IMMUTABILITY
============================================================

If result contains BigInt, Map, arrays:
store a safe representation.

If returning same object reference is permitted:
ensure caller cannot mutate internal future replay result if test probes this.

A shallow immutable copy may be enough depending on shape.

Read test.

============================================================
CP. ERROR / SIDE-EFFECT ORDER
============================================================

Strong first-time fill order:

- duplicate lookup;
- validate fill;
- timestamp/clock rule;
- prune;
- select tiers;
- calculate fees;
- prepare balanced ledger;
- commit external/ledger effect;
- update volume histories;
- update clock;
- store processed result;

BUT if DB transaction can wrap ledger + engine durable state, align with current architecture.

The exact test may have in-memory engine + fake ledger, so do not force DB.

Most important:
a failed processing attempt must not leave visible partial state.

============================================================
CQ. ROLLBACK OF IN-MEMORY STATE
============================================================

If ledger write can throw after you mutate volume/clock:
you need either:
- post ledger before state commit;
- stage mutations then apply after success;
- restore state on failure.

Do not leave partial volume if ledger rejects.

Read test for failure injection.

Do not overbuild if no async failure path.

============================================================
CR. TEST PERFORMANCE WITHOUT DEBUG LOGGING
============================================================

Do not add per-fill console logging.

200,000 lines will destroy performance.

Engineering report can summarize benchmark.

No debug logs in hot loop.

============================================================
CS. NO JSON SERIALIZATION IN HOT LOOP
============================================================

Do not repeatedly stringify entire history/result for idempotency fingerprints unless test requires body collision detection.

Use fill ID stable key.

If fingerprint required:
compute only necessary fields once.

============================================================
CT. NO LINEAR HISTORY CLONES
============================================================

Do not include `history.slice()` in each returned result.

Scale test must remain near-linear total work.

============================================================
CU. BENCHMARK HONESTY
============================================================

Report actual Challenge 16e timing from test output if available.

Do not claim an independent benchmark you did not run.

Do not modify timer threshold.

============================================================
CV. EXPECTED TASK 28 FILE SCOPE
============================================================

Primary:
- actual fee domain/engine source discovered by challenge16.

Likely examples only:
- src/domain/fees.ts
- src/services/feeEngine.ts

Potential:
- src/repositories/ledgerRepository.ts ONLY if a tiny reusable helper is genuinely necessary without changing Challenge 02 semantics.

Do NOT normally change:
- matching;
- settlement;
- server/routes;
- OpenAPI;
- database migrations;
- client.

Create/update:

docs/clearhouse-task-28-fee-rebate-engine.md

Do NOT add test files.

============================================================
CW. REQUIRED VERIFICATION — CHALLENGE 16
============================================================

After implementation:

npm run typecheck

Primary gate:

npm test challenge16.test.ts

If current labels exist:

npm test challenge16.test.ts -t "Challenge 16a"
npm test challenge16.test.ts -t "Challenge 16b"
npm test challenge16.test.ts -t "Challenge 16c"
npm test challenge16.test.ts -t "Challenge 16d"
npm test challenge16.test.ts -t "Challenge 16e"
npm test challenge16.test.ts -t "Challenge 16f"

Use actual labels.

Record benchmark time and property-test seed/path if applicable.

============================================================
CX. LEDGER REGRESSION
============================================================

Run:

npm test challenge02.test.ts

Fee entries must preserve:
- balanced ledger;
- append-only history;
- trial balance;
- exact BigInt.

============================================================
CY. MATCHING REGRESSION
============================================================

Run:

npm test challenge03.test.ts

Do not regress maker/taker/trade behavior.

============================================================
CZ. SETTLEMENT REGRESSION
============================================================

Run:

npm test challenge04.test.ts

Do not double-charge settlement.

============================================================
DA. RISK REGRESSION
============================================================

Run:

npm test challenge05.test.ts

Fee logic must not mutate risk exposure incorrectly.

============================================================
DB. ACCOUNT-CLOSURE REGRESSION
============================================================

Run:

npm test challenge13.test.ts

Do not accidentally break account semantics.

============================================================
DC. MARKET-DATA REGRESSION
============================================================

Run:

npm test challenge08.test.ts

Trade field/timestamp changes must not regress Task 27.

============================================================
DD. API / OPENAPI REGRESSION
============================================================

Run:

npm test challenge11.test.ts
npm test challenge19.test.ts

If Task 28 adds no HTTP surface, these should remain unaffected.

============================================================
DE. DEMO / DASHBOARD REGRESSION
============================================================

Run:

npm test challenge20.test.ts
npm test challenge12.test.ts

Do not modify client/demo state.

============================================================
DF. EVENT / RECONCILIATION REGRESSION
============================================================

Run:

npm test challenge06.test.ts
npm test challenge09.test.ts

Fee work must not break event replay or base ledger reconciliation.

============================================================
DG. BROADER REGRESSION
============================================================

Run:

npm test challenge10.test.ts
npm test challenge01.test.ts
npm test _sanity.test.ts

Then:

git diff --check

Finally:

npm test

Record Task 29+ failures honestly.

============================================================
DH. FAILURE DIAGNOSIS — 16a-1
============================================================

If large notional fails:
- Number conversion;
- float rate;
- intermediate overflow;
- wrong denominator;
- early division.

If rebate sign wrong:
- abs/clamp;
- wrong sign restoration;
- rate sign lost.

Compare exact numerator/denominator.

============================================================
DI. FAILURE DIAGNOSIS — 16a-2
============================================================

If half tie fails:
- half-up used;
- Math.round;
- negative tie incorrectly toward -Infinity/away from zero;
- quotient parity checked after sign incorrectly.

Use magnitude + parity then restore sign.

============================================================
DJ. FAILURE DIAGNOSIS — 16b-1
============================================================

If tier differs from oracle:
- current fill added before tier lookup;
- maker/taker histories mixed;
- wrong volume metric;
- wrong threshold inclusivity;
- expired history not pruned first.

Find first divergent fill.

============================================================
DK. FAILURE DIAGNOSIS — 16b-2
============================================================

Boundary failure:
- `< cutoff` instead of `<= cutoff`;
- timestamp unit mismatch;
- current clock wrong;
- window subtraction off by 1.

Exactly window-old is expired under published rule.

============================================================
DL. FAILURE DIAGNOSIS — 16c-1
============================================================

If ledger entry unbalanced:
- sign wrong;
- fee account leg missing;
- maker/taker combined incorrectly.

If fee account net wrong:
- rebate direction reversed;
- zero fee posted strangely;
- same fee posted twice;
- wrong asset.

Use Task 10 sign convention.

============================================================
DM. FAILURE DIAGNOSIS — 16d-1
============================================================

If duplicate changes state:
- duplicate check too late;
- pruning/clock occurs before duplicate lookup;
- current fill volume re-added;
- ledger callback called twice;
- result recomputed rather than replayed.

Duplicate should short-circuit before side effects according to exact test.

============================================================
DN. FAILURE DIAGNOSIS — 16e-1
============================================================

If correctness passes but scale fails:
- O(n) history scan per fill;
- Array.shift repeatedly;
- schedule sorted per fill;
- all-account cleanup;
- deep clones/logging.

Use running total + head-index queue.

Do not weaken correctness.

============================================================
DO. FAILURE DIAGNOSIS — 16f-1
============================================================

If wrong error type:
- throw RangeError explicitly.

If state changed before RangeError:
move validation earlier.

Read every invalid fixture.

Do not generalize invalid rules beyond actual contract unnecessarily.

============================================================
DP. PROPERTY / RANDOM TEST DISCIPLINE
============================================================

If challenge uses randomized cases:
record:
- seed;
- path;
- shrunk notional/rate/fill sequence;
- expected;
- actual.

Do not freeze generator seed.

Fix invariant.

============================================================
DQ. TASK 28 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-28-fee-rebate-engine.md

Include:

1. Starting commit.
2. Working branch task-28.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 16 test count.
6. Exact 200-point score map.
7. Fee engine public API.
8. Schedule interface.
9. Tier interface.
10. Fill interface.
11. Result interface.
12. Rate representation.
13. Rate denominator/scale.
14. Notional source.
15. Signed fee formula.
16. Half-even algorithm.
17. Positive/negative tie behavior.
18. Trailing volume metric.
19. Per-account volume state design.
20. Pre-fill tier semantics.
21. Tier threshold inclusivity.
22. Window length.
23. Exact expiry predicate.
24. Engine clock semantics.
25. Maker/taker independent tier logic.
26. Current-fill history update.
27. Fee asset.
28. Fee account.
29. Ledger entry design.
30. Positive fee flow.
31. Rebate flow.
32. Fee-account net proof.
33. Fill identity.
34. Idempotency storage.
35. Duplicate replay behavior.
36. Timestamp-clock replay behavior.
37. Rolling queue/head/running-sum design.
38. Complexity.
39. 200k timing.
40. Schedule/options/fill validation.
41. Exact files changed.
42. Typecheck.
43. 16a result.
44. 16b result.
45. 16c result.
46. 16d result.
47. 16e result.
48. 16f result.
49. Full Challenge 16 result.
50. Challenge 02 result.
51. Challenge 03 result.
52. Challenge 04/05 result.
53. Challenge 13 result.
54. Challenge 08 result.
55. Challenge 11/19 result.
56. Challenge 20/12 result.
57. Challenge 06/09 result.
58. sanity/full suite.
59. protected-file confirmation.
60. suggested commit.
61. master merge/push workflow.
62. next Task 29: Challenge 14 Netting and Multilateral Settlement.

Do not include secrets.

============================================================
DR. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat
git diff --name-only

Review the actual fee source files discovered from Challenge 16:

git diff -- "<actual-fee-domain-path>"
git diff -- "<actual-fee-engine-path>"

Only if genuinely changed:

git diff -- src/repositories/ledgerRepository.ts

Review:

git diff -- docs/clearhouse-task-28-fee-rebate-engine.md

Do not paste placeholders literally.

Confirm:
- organizer tests unchanged;
- no new tests;
- config unchanged;
- package unchanged;
- migrations unchanged;
- seeds unchanged;
- no Number financial arithmetic;
- no Math.round fee arithmetic;
- no full-history rescan per fill;
- no global mutable tier state shared across accounts;
- no duplicate ledger posting on replay;
- no Task 29+ implementation.

============================================================
DS. TASK 28 COMPLETION CRITERIA
============================================================

Task 28 is COMPLETE only when:

DISCOVERY

[ ] challenge16 read completely.
[ ] exact test count recorded.
[ ] exact fee engine API known.
[ ] exact schedule/tier structure known.
[ ] exact rate scale known.
[ ] exact volume metric known.
[ ] exact Fill/result types known.
[ ] exact ledger integration known.

ARITHMETIC

[ ] notional exact BigInt.
[ ] rate exact.
[ ] denominator exact.
[ ] no Number conversion.
[ ] positive fee exact.
[ ] negative rebate exact.
[ ] below-half rounding correct.
[ ] above-half rounding correct.
[ ] +half ties to even.
[ ] -half ties to even.
[ ] values >2^53 exact.

TIERS

[ ] maker uses own trailing volume.
[ ] taker uses own trailing volume.
[ ] tier uses pre-fill volume.
[ ] current fill doesn't promote itself.
[ ] threshold inclusivity exact.
[ ] expired values pruned before lookup.
[ ] exactly-window-old expired.
[ ] one-ms-younger retained.
[ ] current fill volume added only after pricing.
[ ] clock semantics exact.

LEDGER

[ ] fee asset exact.
[ ] fee account exact.
[ ] positive fee flows participant -> fee account.
[ ] rebate flows fee account -> participant.
[ ] each entry balanced per asset.
[ ] fee-account net matches exact fees collected.
[ ] no destructive ledger mutation.

IDEMPOTENCY

[ ] stable fill identity used.
[ ] first result stored safely.
[ ] duplicate returns original result.
[ ] duplicate does not reevaluate tier.
[ ] duplicate does not add volume.
[ ] duplicate does not post ledger.
[ ] duplicate does not advance timestamp clock.
[ ] failure does not poison processed state.

SCALE

[ ] per-account running volume maintained.
[ ] no O(n) history rescan per fill.
[ ] no repeated Array.shift at scale.
[ ] schedule prevalidated/preprocessed once.
[ ] 200,000-fill test passes within time.
[ ] no debug log in hot loop.

VALIDATION

[ ] invalid schedule throws RangeError.
[ ] invalid options throw RangeError.
[ ] invalid fill throws RangeError.
[ ] validation before side effects.
[ ] caller inputs not silently coerced/mutated.

REGRESSION

[ ] typecheck passes.
[ ] Challenge 16 passes.
[ ] Challenge 02 passes.
[ ] Challenge 03 passes.
[ ] Challenge 04 passes.
[ ] Challenge 05 passes.
[ ] Challenge 13 passes.
[ ] Challenge 08 passes.
[ ] Challenge 11/19 pass.
[ ] Challenge 20/12 pass.
[ ] Challenge 06/09 pass.
[ ] sanity/full suite recorded.
[ ] protected files unchanged.
[ ] Task 28 note created.
[ ] final Git target master.

If any Challenge 16 assertion remains failing:
- Task 28 status = PARTIAL;
- report exact failing test/root cause.

============================================================
DT. FINAL CURSOR REPORT
============================================================

Return:

1. Task 28 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Exact Challenge 16 test count.
6. Fee engine public API.
7. Schedule/tier model.
8. Fill/result model.
9. Rate representation/denominator.
10. Notional source.
11. Exact fee formula.
12. Half-even implementation.
13. Signed rebate behavior.
14. Trailing volume metric.
15. Per-account rolling state.
16. Pre-fill tier selection.
17. Window expiry rule.
18. Timestamp clock behavior.
19. Maker/taker independent tier behavior.
20. Current-fill volume update.
21. Fee asset/account.
22. Ledger posting design.
23. Positive-fee direction.
24. Rebate direction.
25. Fee-account net result.
26. Fill identity/idempotency.
27. Duplicate replay behavior.
28. Scale data structure/complexity.
29. 200k timing/result.
30. Validation/RangeError behavior.
31. Typecheck.
32. 16a result.
33. 16b result.
34. 16c result.
35. 16d result.
36. 16e result.
37. 16f result.
38. Full Challenge 16 result.
39. Challenge 02 result.
40. Challenge 03 result.
41. Challenge 04/05 result.
42. Challenge 13 result.
43. Challenge 08 result.
44. Challenge 11/19 result.
45. Challenge 20/12 result.
46. Challenge 06/09 result.
47. broader regressions.
48. full-suite result.
49. remaining future failures.
50. confirmation protected files unchanged.
51. final diff summary.
52. reviewed Git commands targeting master.

Suggested commit:

feat: implement exact fee and rebate engine

Do not automatically commit, merge, or push.
````

---

# Task 28 acceptance matrix

| Area | Required behavior |
|---|---|
| Fee arithmetic | Exact integer |
| Large notional | >2^53 exact |
| Fee rounding | Nearest, ties-to-even |
| Negative rebate | Signed symmetric rounding |
| Maker tier | Maker’s own pre-fill volume |
| Taker tier | Taker’s own pre-fill volume |
| Current fill | Excluded from current tier |
| Window boundary | Exactly window-old expired |
| One ms younger | Still included |
| Rolling total | BigInt |
| History lookup | Amortized O(1) expiry |
| 200k fills | Exact + within time budget |
| Fee ledger | First-class balanced entries |
| Positive fee | Participant → fee account |
| Rebate | Fee account → participant |
| Fee account net | Exact collected fees minus rebates |
| Duplicate fill | Original result replay |
| Duplicate volume | No change |
| Duplicate ledger | No new entry |
| Duplicate clock | No change |
| Invalid schedule | RangeError |
| Invalid options | RangeError |
| Invalid fill | RangeError |
| Input mutation | None unless contract |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 28

Official final branch:

**`master`**

Workflow:

**`master` → `task-28` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 28 branch

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
task-28
```

Official final branch:

```text
master
```

---

## 2. Run final Task 28 verification

```powershell
npm run typecheck

npm test challenge16.test.ts

npm test challenge02.test.ts

npm test challenge03.test.ts

npm test challenge04.test.ts

npm test challenge05.test.ts

npm test challenge13.test.ts

npm test challenge08.test.ts

npm test challenge11.test.ts

npm test challenge19.test.ts

npm test challenge20.test.ts

npm test challenge12.test.ts

npm test challenge06.test.ts

npm test challenge09.test.ts

npm test challenge10.test.ts

npm test challenge01.test.ts

npm test _sanity.test.ts

git diff --check
```

If Challenge 16 labels exist:

```powershell
npm test challenge16.test.ts -t "Challenge 16a"

npm test challenge16.test.ts -t "Challenge 16b"

npm test challenge16.test.ts -t "Challenge 16c"

npm test challenge16.test.ts -t "Challenge 16d"

npm test challenge16.test.ts -t "Challenge 16e"

npm test challenge16.test.ts -t "Challenge 16f"
```

Use actual current labels if they differ.

Then:

```powershell
npm test
```

---

## 3. Review Task 28 changes

```powershell
git status --short
git diff --stat
git diff --name-only
```

Review actual fee files identified by Cursor:

```powershell
git diff -- "<actual-fee-domain-path>"
git diff -- "<actual-fee-engine-path>"
```

Do not paste placeholders literally.

Only if genuinely changed:

```powershell
git diff -- src/repositories/ledgerRepository.ts
```

Review note:

```powershell
git diff -- docs/clearhouse-task-28-fee-rebate-engine.md
```

Confirm:
- no benchmark weakening;
- no financial Number conversion;
- no unrelated source.

---

## 4. Stage only Task 28 files

Always stage the engineering note:

```powershell
git add -- docs/clearhouse-task-28-fee-rebate-engine.md
```

Stage actual fee source files:

```powershell
git add -- "<actual-fee-domain-path>"
git add -- "<actual-fee-engine-path>"
```

Do not paste placeholders literally.

Only if genuinely changed for a Task 28 reusable ledger integration need:

```powershell
git add -- src/repositories/ledgerRepository.ts
```

If another legitimate Task 28 helper changed:

```powershell
git add -- "<actual-task28-helper-path>"
```

If a file contains unrelated work:

```powershell
git add -p -- "<file-path>"
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

STOP if staged content unexpectedly contains:

- tests/
- config/
- package files
- migrations
- seeds
- `.env`
- `.gitignore`
- Task 29+ implementation
- unrelated matching/client/API code.

---

## 6. Commit Task 28

```powershell
git commit -m "feat: implement exact fee and rebate engine"
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

## 8. Merge Task 28

Prefer:

```powershell
git merge --ff-only task-28
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-28
```

Resolve conflicts deliberately.

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

npm test challenge16.test.ts

npm test challenge02.test.ts

npm test challenge03.test.ts

git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge04.test.ts
npm test challenge08.test.ts
npm test _sanity.test.ts
```

---

## 10. Push official master

```powershell
git push origin master
```

Do not push the final competition submission to `main`.

Do not force-push.

---

## 11. Verify remote master

```powershell
git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

Local HEAD and remote `refs/heads/master` must match.

---

# If push is rejected

Do not force.

```powershell
git fetch origin
git log --oneline --left-right HEAD...origin/master
git status -sb
```

If safe for the local-only Task 28 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge16.test.ts
npm test challenge02.test.ts
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts carefully.

---

# Fast Task 28 checklist

- [ ] branch = task-28
- [ ] final branch = master
- [ ] challenge16 fully read
- [ ] config/scores read-only
- [ ] exact test count recorded
- [ ] exact fee-engine exports known
- [ ] exact schedule structure known
- [ ] exact tier structure known
- [ ] exact rate denominator known
- [ ] exact volume metric known
- [ ] exact fill ID/timestamp known
- [ ] exact fee asset/account known
- [ ] no financial Number conversion
- [ ] exact fee works >2^53
- [ ] rebate sign correct
- [ ] below-half correct
- [ ] above-half correct
- [ ] +half → even
- [ ] -half → even
- [ ] maker own trailing volume
- [ ] taker own trailing volume
- [ ] tiers chosen pre-fill
- [ ] current fill not included in own tier
- [ ] threshold inclusivity exact
- [ ] exactly window-old expired
- [ ] one ms younger retained
- [ ] rolling history running total
- [ ] no O(n²) rescan
- [ ] no repeated shift at scale
- [ ] positive fee ledger direction correct
- [ ] rebate ledger direction correct
- [ ] every fee/rebate entry balanced
- [ ] fee-account net exact
- [ ] duplicate returns original result
- [ ] duplicate no volume mutation
- [ ] duplicate no tier mutation
- [ ] duplicate no ledger entry
- [ ] duplicate no clock change
- [ ] invalid schedule RangeError
- [ ] invalid options RangeError
- [ ] invalid fill RangeError
- [ ] 200k scale test passes
- [ ] Challenge16 passes
- [ ] Challenge02 passes
- [ ] Challenge03 passes
- [ ] Challenge04/05 pass
- [ ] Challenge13 passes
- [ ] Challenge08 passes
- [ ] Challenge11/19 pass
- [ ] Challenge20/12 pass
- [ ] Challenge06/09 pass
- [ ] sanity/full suite recorded
- [ ] protected files unchanged
- [ ] Task28 note created
- [ ] committed on task-28
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 29 — Challenge 14: Netting and Multilateral Settlement.
