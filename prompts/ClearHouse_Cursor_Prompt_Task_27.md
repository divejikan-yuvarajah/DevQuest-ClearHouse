# ClearHouse — Complete Enhanced Cursor Prompt for Task 27

**Task:** Challenge 08 — Market Data and Time  
**Competition:** DevQuest 2026 — 9-hour Final Buildathon  
**Official remote:** `origin`  
**Official CodeCommit repository:** `https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Official final submission branch:** `master`  
**Task working branch:** `task-27`  
**Existing checkout:** `C:\Users\ASUS\Desktop\DevQuest\5af51b5f-8b96-4c51-aef1-e5557702842b`  
**Historical GitHub reference:** `https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git`  
**Historical reference commit:** `36bfeafc70e88e405188b80707ea703adcc7a5df`

---

# Task 27 purpose

Task 27 implements the full **Challenge 08 — Market Data and Time** surface.

This task is about exact, deterministic time-series aggregation from trades:

- OHLCV candle construction;
- bucket boundaries;
- open/close ordering by **arrival sequence**;
- high/low extrema by exact price;
- exact volume summation;
- 1m / 5m / 1h / 1d aggregation;
- hierarchical consistency;
- gap filling using the previous close;
- exact VWAP quotient + remainder;
- empty-trade VWAP behavior;
- the candles HTTP endpoint;
- correct handling of late-arriving trades.

This is **not** a live-WebSocket task. It is **not** a database-market-data persistence redesign. It is the pure/domain + HTTP market-data challenge defined by the current tests.

The current CodeCommit checkout and `tests/challenge08.test.ts` are authoritative.

---

# Published Challenge 08 contract — 80 points

## 8a — OHLCV correctness — 20 pts

### 8a-1 — 10 pts

Open and close must be chosen by **arrival sequence**, not by arbitrary timestamp collision order.

Important distinction:

- `timestampMs` determines the candle bucket;
- `sequence` determines arrival order inside that bucket.

If two or more trades have the same timestamp, or if timestamps do not reflect arrival order:

- `open` = price from the lowest/earliest arrival sequence in that bucket;
- `close` = price from the highest/latest arrival sequence in that bucket.

Read the exact test for the current field names and sort semantics.

### 8a-2 — 4 pts

Property test:

- candle `high` is always the maximum trade price in the bucket;
- candle `low` is always the minimum trade price in the bucket.

Use exact integer comparison.

### 8a-3 — 6 pts

Property test over randomized trades across many buckets:

candles at:

- 1 minute;
- 5 minutes;
- 1 hour;
- 1 day

must match an independent oracle.

Do not hardcode only those visible values if the aggregation function accepts any positive resolution.

---

## 8b — Hierarchical consistency — 12 pts

### 8b-1 — 12 pts

Rolling up all 1-minute candles in an hour must reproduce the direct 1-hour candle's:

- volume;
- high;
- low.

This catches:

- wrong bucket boundaries;
- missing trades;
- double-counting;
- imprecise quantity arithmetic.

---

## 8c — Empty buckets — 10 pts

### 8c-1 — 10 pts

A gap between populated candles must be filled.

Gap candle values must use the **previous close**, not zero.

Conceptual gap candle:

```text
open   = previousClose
high   = previousClose
low    = previousClose
close  = previousClose
volume = 0
```

Use exact organizer field types.

Do not omit an intermediate bucket.

Do not fabricate a leading candle before the first observed candle unless the test explicitly requires it.

Do not extend beyond the tested/actual final bucket unless the contract says so.

---

## 8d — VWAP — 17 pts

### 8d-1 — 10 pts

VWAP must be exact.

For exact integer price `p` and quantity `q`:

```text
weightedSum = Σ(p * q)
volume      = Σ(q)

quotient  = weightedSum / volume
remainder = weightedSum % volume
```

Use the exact current return shape from the organizer test.

Do not silently discard the remainder.

Do not use floating point.

### 8d-2 — 7 pts

VWAP over an empty trade set must be zero, not:

- NaN;
- Infinity;
- divide-by-zero exception.

Read exact expected return shape for:
- value/quotient;
- remainder;
- denominator/volume if included.

---

## 8e — HTTP surface — 6 pts

### 8e-1 — 6 pts

The candles HTTP endpoint must:

- parse the real request body/parameters;
- aggregate trades correctly;
- serialize BigInt values safely;
- use the established Task 21 API envelope if the current test expects it;
- return controlled 400s for malformed market-data input as fixed in Task 9.

Do not change the endpoint path or body shape without reading the test.

---

## 8f — Late-arriving trades — 15 pts

### 8f-1 — 15 pts

A trade that arrives later but has an earlier `timestampMs` must be placed into the correct historical time bucket at **every tested resolution**.

Key rule:

- timestamp chooses bucket;
- sequence chooses open/close inside that bucket.

Do not bucket by arrival sequence.

Do not sort globally by timestamp and then infer arrival order from that sort.

Late arrival must cause the aggregation result to reflect the trade in its timestamp bucket.

---

# Challenge 08 score map

```text
8a = 20
8b = 12
8c = 10
8d = 17
8e =  6
8f = 15
-------------
Total = 80
```

These are available points, not an earned-score claim.

---

# Critical Task 27 mathematical invariants

## Candle bucket

Use the exact organizer/test boundary formula.

The likely invariant is the standard integer floor:

```text
bucketStart = floor(timestampMs / resolutionMs) * resolutionMs
```

But do not guess if the current test defines another boundary.

For positive millisecond timestamps this should be implemented with integer-safe arithmetic.

Do not use:

- locale dates;
- calendar-zone rounding;
- `Date#setMinutes`;
- local timezone conversions.

Challenge 08 is deterministic epoch-time bucketing.

## Open / close

Within one bucket:

- open is earliest arrival sequence;
- close is latest arrival sequence.

Timestamp does not decide open/close when arrival sequence differs.

## High / low

Within one bucket:

```text
high = max(price)
low  = min(price)
```

Use BigInt.

## Volume

Within one bucket:

```text
volume = Σ quantity
```

Use BigInt.

## Output ordering

Candles should be returned in deterministic ascending bucket-time order unless the test specifies otherwise.

Do not depend on Map insertion order produced by arbitrary shuffled input.

## Late arrival

The same trade must land in the same bucket no matter when it is presented to the aggregator.

Bucket placement is a pure function of:

```text
timestampMs
resolutionMs
```

---

# COMPLETE CURSOR AGENT PROMPT — TASK 27

Copy the complete block below into Cursor Agent mode.

````text
Act as my senior TypeScript market-data engineer, exact-arithmetic reviewer, and deterministic time-series engineer for the DevQuest 2026 ClearHouse nine-hour final.

Execute TASK 27 ONLY: implement Challenge 08 — Market Data and Time.

Preserve all completed Tasks 1–26.

Your job is to make the market-data domain and current candles HTTP endpoint correct for:
- OHLCV;
- arrival-sequence open/close;
- exact high/low;
- exact volume;
- deterministic time bucketing;
- 1m/5m/1h/1d property tests;
- hierarchical rollup consistency;
- gap filling;
- exact VWAP with remainder;
- empty VWAP;
- HTTP serialization;
- late-arriving trades.

Do not implement WebSockets/live updates, fees, netting, strategy orders, or final integration.

Do not stop at a plan. Inspect, implement, test, document, and show reviewed Git commands.

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

task-27

Historical public reference only:

https://github.com/divejikan-yuvarajah/DevQuest-ClearHouse.git

Historical reference commit:

36bfeafc70e88e405188b80707ea703adcc7a5df

Rules:

- current CodeCommit checkout is authoritative;
- never reset to historical GitHub;
- never replace origin;
- preserve Tasks 1–26;
- work on task-27;
- final reviewed work later merges into master;
- final publication is `git push origin master`;
- do not commit, merge, or push automatically.

============================================================
B. STRICT TASK 27 SCOPE
============================================================

IMPLEMENT:

Challenge 8a:
- OHLCV;
- open/close by arrival sequence;
- exact high/low;
- exact volume;
- multi-resolution aggregation.

Challenge 8b:
- hierarchical consistency.

Challenge 8c:
- gap filling using previous close.

Challenge 8d:
- exact VWAP quotient;
- exact discarded remainder;
- empty input.

Challenge 8e:
- existing candles HTTP endpoint.

Challenge 8f:
- late-arrival rebucketing.

PRESERVE:
- Task 9 market-data input validation;
- Task 21 API envelopes/versioning;
- Task 25 OpenAPI accuracy;
- Task 22/24 dashboard behavior;
- Tasks 14–16 trade/matching semantics;
- exact BigInt rules.

DO NOT IMPLEMENT:
- Task 28 fee engine;
- Task 29 netting;
- Task 30 strategy orders;
- Task 31 WebSocket server;
- Task 32 live dashboard client;
- Task 33 integration;
- persistent time-series DB redesign.

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
- skip property tests;
- freeze fast-check seeds;
- weaken assertions;
- increase timeouts;
- reduce test discovery;
- relax TypeScript.

Do NOT add production code checking:
- NODE_ENV === "test";
- VITEST;
- challenge08 filename;
- known timestamps;
- known sequence numbers;
- visible property-test values;
- exact 1m/5m/1h/1d fixtures.

Do NOT use:
- Number(price);
- Number(quantity);
- parseInt(price);
- parseFloat(price);
- floating-point VWAP.

Timestamp/resolution may be ordinary safe integers if the current interface uses JS numbers.
Financial price/quantity/volume remain exact BigInt/string according to current domain.

No destructive Git.

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

Verify Task 26 is represented on master:

git log --oneline --decorate --max-count=20 master

If task-26 exists:

git log --oneline --decorate --max-count=10 task-26

Do not discard valid prior work.

If master is current:

git switch master
git pull --ff-only origin master
git switch -c task-27

If task-27 already exists:

git branch --list task-27
git log --oneline --decorate --max-count=10 task-27

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
- docs/clearhouse-task-09-input-security.md
- docs/clearhouse-task-14-basic-matching.md
- docs/clearhouse-task-15-execution-policies.md
- docs/clearhouse-task-16-advanced-matching.md
- docs/clearhouse-task-21-api-cache-performance.md
- docs/clearhouse-task-25-openapi-swagger.md
- docs/clearhouse-task-26-event-sourcing.md

Verify actual source.

Task 27 depends on:
- exact financial values;
- valid trade representations;
- controlled request parsing;
- existing API envelope.

Before editing run:

npm run typecheck

npm test challenge00b.test.ts -t "Challenge 0r"

npm test challenge03.test.ts

Use actual labels if different.

Record baseline.

============================================================
F. READ CHALLENGE 08 COMPLETELY
============================================================

Read:

tests/challenge08.test.ts

from first line to last line.

Read:

config/scores.ts

READ ONLY.

Build a table:

test label
| points
| imported function
| input type
| output type
| exact time/bucket oracle
| exact arithmetic rule
| current defect

Record:
- exact test count;
- exact export/function names;
- Trade type;
- Candle type;
- VWAP return type;
- exact field names;
- exact HTTP route/body/response;
- exact supported resolutions;
- exact bucket formula;
- exact open/close tie semantics;
- exact fillGaps inputs/outputs;
- exact empty behavior;
- exact late-arrival test structure.

Do not implement from Challenges.md summary alone.

============================================================
G. INSPECT MARKET DATA SOURCE
============================================================

Read completely:

- src/domain/marketData.ts
- src/controller/marketDataController.ts
- src/routes/marketDataRoutes.ts

if those exact files exist.

Also inspect:
- any services/repositories used by market-data code;
- current trade type from matching engine;
- server route mounting;
- Task 25 OpenAPI definition for market data.

Search:

rg -n "aggregateCandles|fillGaps|vwap|VWAP|Candle|timestampMs|resolutionMs|marketData|candles|sequence|price|quantity" src tests

PowerShell fallback:

Get-ChildItem -Recurse src,tests -File |
  Select-String -Pattern "aggregateCandles|fillGaps|vwap|VWAP|Candle|timestampMs|resolutionMs|marketData|candles|sequence|price|quantity"

Write down exact current signatures BEFORE changing them.

============================================================
H. RUN TASK 27 BASELINE
============================================================

Run:

npm test challenge08.test.ts

If current labels exist:

npm test challenge08.test.ts -t "Challenge 8a"
npm test challenge08.test.ts -t "Challenge 8b"
npm test challenge08.test.ts -t "Challenge 8c"
npm test challenge08.test.ts -t "Challenge 8d"
npm test challenge08.test.ts -t "Challenge 8e"
npm test challenge08.test.ts -t "Challenge 8f"

Record:
- executed test count;
- passes/failures;
- property test seed/path;
- first root cause.

Filtered-out tests are NOT passed.

============================================================
I. IDENTIFY THE EXACT TRADE MODEL
============================================================

Read current type/test.

A trade likely contains concepts such as:
- price;
- quantity;
- timestampMs;
- sequence.

But do not assume field names.

Determine:
- price type;
- quantity type;
- timestamp type;
- sequence type;
- optional market/id fields.

Do not widen/change public Trade type unless required.

============================================================
J. FINANCIAL EXACTNESS
============================================================

Price and quantity must remain exact.

Use BigInt internally where current domain uses bigint.

Never use:
- Number(price);
- Number(quantity);
- Math.max(...BigInt converted values);
- parseFloat.

For maximum/minimum:
compare BigInt directly.

For volume:
BigInt addition.

For VWAP numerator:
BigInt multiplication + addition.

============================================================
K. TIMESTAMP VALIDATION
============================================================

Task 9 already hardened malformed HTTP input.

Preserve:
- finite timestamp requirements;
- integer timestamp requirements;
- finite positive resolution.

Read exact current controller validation.

Do not remove Task 9 safeguards.

Do not silently coerce strings to timestamps unless current API permits them.

============================================================
L. RESOLUTION VALIDATION
============================================================

Resolution must use the current interface.

It may be:
- numeric milliseconds;
- predefined string;
- another enum.

Read test/controller.

If `resolutionMs` is a number:
require the exact current valid rule.

Likely:
- finite;
- integer;
- > 0.

Do not accept 0 because bucket division would fail.

Do not hardcode only 60_000 etc if generic positive resolutions are valid.

============================================================
M. BUCKET FUNCTION
============================================================

Create/reuse one deterministic helper for bucket start.

Conceptually:

bucketStart = Math.floor(timestampMs / resolutionMs) * resolutionMs

ONLY if this matches test.

Use this same rule everywhere:
- aggregateCandles;
- gap filling boundary reasoning;
- late arrivals;
- HTTP output.

Do not implement different bucketing for each resolution.

============================================================
N. UTC / TIMEZONE RULE
============================================================

Epoch-millisecond bucket boundaries are timezone-independent.

Do not use:
- local Date getters;
- local midnight;
- timezone offset.

For one-day resolution:
the expected bucket is likely aligned to epoch/UTC using resolution arithmetic.

Read organizer oracle.

Do not make test result depend on machine timezone.

============================================================
O. SAFE TIMESTAMP RANGE
============================================================

If timestamp is a JS number:
read test range.

Do not convert BigInt financial values into timestamps.

Use Number only for timestamp/resolution if their API type is number and values are safe.

Do not mix financial precision concerns with valid time arithmetic.

============================================================
P. GROUP TRADES BY TIMESTAMP BUCKET
============================================================

For each trade:
1. validate/assume domain-valid trade according to pure function contract;
2. compute bucket from timestamp;
3. add trade to that bucket.

Do not place a late-arriving trade into "current" bucket based on call time.

Do not use sequence to calculate bucket.

============================================================
Q. OPEN/CLOSE BY ARRIVAL SEQUENCE — 8a-1
============================================================

This is critical.

Within a bucket:

open =
price from trade with minimum/earliest arrival sequence.

close =
price from trade with maximum/latest arrival sequence.

Do not use timestamp to pick open/close.

Do not sort by:
- timestamp then sequence

if that lets timestamp override arrival sequence.

Timestamps only decide bucket membership.

Once inside same bucket:
sequence determines open/close.

============================================================
R. SEQUENCE COLLISIONS
============================================================

Read test.

If sequence is guaranteed unique:
use it directly.

If equal sequence can occur:
read exact deterministic tie rule.

Do not invent timestamp tie-breaking unless required.

Do not mutate sequence values.

============================================================
S. DO NOT MUTATE INPUT TRADES
============================================================

aggregateCandles must not:
- sort caller array in place;
- change trade fields;
- overwrite timestamp/sequence.

If sorting is useful:
copy first.

A single-pass bucket reducer often avoids global sorting entirely.

============================================================
T. HIGH / LOW — 8a-2
============================================================

For each bucket:

high = exact maximum price.
low  = exact minimum price.

No averaging.

No first/last shortcut.

No Number conversion.

Property tests may contain:
- equal prices;
- very large integer values;
- randomized order.

Initialize high/low from the first actual trade in bucket, not arbitrary zero.

============================================================
U. ZERO / NEGATIVE PRICE
============================================================

Read domain contract.

Task 9 rejects malformed input; current pure tests may generate only valid positive values.

Do not use `0n` as high/low initializer because:
- if zero/negative were valid, it can distort extrema;
- it fabricates value before seeing data.

Use first trade's price.

============================================================
V. VOLUME
============================================================

Volume is:

Σ quantity

for each bucket.

Use BigInt.

Initialize:

0n

because volume is additive.

Do not count number of trades as volume.

Do not use price*quantity as volume.

============================================================
W. CANDLE OUTPUT TYPE
============================================================

Read current `Candle` interface.

Likely concepts:
- bucket start/time;
- open;
- high;
- low;
- close;
- volume.

Preserve exact field names/types.

If domain returns BigInt:
keep BigInt.

If HTTP must serialize strings:
serialize only at controller boundary.

Do not turn domain BigInt into strings just to make Express JSON happy if tests call the domain directly.

============================================================
X. OUTPUT CANDLE ORDER
============================================================

Return populated candles sorted by bucket start ascending unless test says otherwise.

Do not rely on:
- input order;
- Map insertion order.

Late-arriving trades may cause a historical bucket to be first/earlier than a bucket first encountered.

Explicit sort ensures deterministic chronology.

Do not mutate Candle objects during sort.

============================================================
Y. MULTI-RESOLUTION CORRECTNESS — 8a-3
============================================================

The same aggregation algorithm must work for:
- 1 minute;
- 5 minutes;
- 1 hour;
- 1 day.

Do not create four separate code paths.

Use generic resolution.

The property test may randomize:
- trade counts;
- timestamps;
- sequences;
- values;
- buckets.

Follow mathematical invariants.

============================================================
Z. COMMON BUCKET-BOUNDARY BUGS
============================================================

Check:
- trade exactly at bucket start;
- trade exactly one millisecond before next bucket;
- trade exactly at next bucket start;
- timestamps separated by many buckets;
- multiple trades same timestamp;
- timestamps out of arrival order.

The standard half-open convention is likely:

[bucketStart, bucketStart + resolution)

Read test.

Do not use <= upper boundary if it moves boundary trade into prior bucket.

============================================================
AA. HIERARCHICAL CONSISTENCY — 8b-1
============================================================

The direct 1-hour aggregation and aggregation of its underlying 1-minute data must agree on:
- volume;
- high;
- low.

This property follows naturally if:
- every trade belongs to exactly one bucket;
- volume uses exact sum;
- high/low use exact extrema;
- bucket boundaries align.

Do not write a special "hourly fix" just to pass the visible example.

============================================================
AB. DIRECT VS ROLLUP CANDLE
============================================================

Read exact test.

It may:
- aggregate trades directly to 1h;
- aggregate trades to 1m;
- roll 1m candles manually with oracle.

Your direct 1h result must match.

Do not implement 1h by summing filled gap volume incorrectly.

Gap candle volume is zero.

High/low of filled gaps equal previous close, but 8b may compare only specific components.

Use test.

============================================================
AC. GAP FILLING — 8c-1
============================================================

Read `fillGaps(...)` signature.

Likely input:
- existing candle array;
- resolution.

Do not invent start/end range arguments unless current signature has them.

Gap filling must insert every missing bucket BETWEEN actual candles.

============================================================
AD. GAP CANDLE VALUES
============================================================

For each missing intermediate bucket:

previousClose = immediately preceding candle's close

gap:
- open = previousClose
- high = previousClose
- low = previousClose
- close = previousClose
- volume = 0

Use exact same BigInt/string domain type.

Never fabricate:
- zero prices;
- NaN;
- previous open.

============================================================
AE. MULTIPLE CONSECUTIVE GAPS
============================================================

If there are multiple gaps:

each filled candle has the same previous close until a real candle appears.

After inserting gap1:
its close is previous close,
so gap2 uses same close.

Do not skip from first real candle directly to next real candle.

============================================================
AF. NO LEADING FABRICATION
============================================================

If fillGaps has only a candle at time T:
there is no known previous close before T.

Do not fabricate candles before the first candle unless:
- signature includes explicit requested start;
- test requires filling from start.

Read exact contract.

============================================================
AG. NO UNBOUNDED TRAILING FABRICATION
============================================================

Do not generate candles after the last known candle indefinitely.

If signature has explicit end:
follow it.

Otherwise likely fill only internal gaps.

Do not use Date.now as trailing bound.

That would make tests nondeterministic.

============================================================
AH. FILLGAPS INPUT SORTING
============================================================

Read test.

If input candles may be unsorted:
sort a copy by bucket start.

Do not mutate input.

If function assumes sorted:
still maintain deterministic behavior allowed by test.

Do not duplicate existing bucket.

============================================================
AI. DUPLICATE CANDLE BUCKETS
============================================================

Normally aggregateCandles returns one candle per bucket.

If fillGaps receives duplicate bucket starts:
read expected behavior.

Do not silently merge arbitrary Candle objects unless test defines it.

Keep Task 27 focused.

============================================================
AJ. VWAP — EXACT WEIGHTED AVERAGE
============================================================

Read current `vwap(...)` export/return shape.

Mathematically:

numerator = Σ(price * quantity)
denominator = Σ(quantity)

quotient = numerator / denominator
remainder = numerator % denominator

All with BigInt.

Do not:
- divide each trade first;
- average trade prices equally;
- convert to float.

============================================================
AK. WHY REMAINDER MATTERS
============================================================

Integer division discards fractional remainder.

Challenge 8d requires that discarded information be returned.

If:
weightedSum = 101
volume = 10

then:
quotient = 10
remainder = 1

according to integer division.

Do not round quotient unless organizer contract says so.

Do not convert remainder to decimal.

============================================================
AL. VWAP EMPTY INPUT — 8d-2
============================================================

When no trades:
- no divide-by-zero;
- no NaN;
- no exception.

Return the exact expected zero object/value.

Read test.

If return type is:

{ value, remainder }

then likely both zero.

If includes:
- volume/denominator;
follow exact output.

Do not invent fields.

============================================================
AM. ZERO TOTAL VOLUME
============================================================

Read pure-function contract.

If trades can have zero quantity such that total volume == 0:
treat according to exact test.

Do not divide by zero.

Task 9/controller may reject zero quantity, but domain property tests could differ.

Do not guess.

At minimum implement a safe explicit zero-denominator path compatible with expected empty semantics if current contract supports it.

============================================================
AN. NEGATIVE QUANTITY / PRICE
============================================================

Financial trade data should likely be positive.

Read test/domain.

Do not silently take `abs()`.

Do not change values.

Validation belongs at correct boundary.

VWAP pure function should follow current accepted input assumptions.

============================================================
AO. LATE-ARRIVING TRADES — 8f-1
============================================================

This is critical.

"Late-arriving" means:
- a trade is encountered/arrives after newer-timestamp trades;
- its timestamp belongs to an earlier time bucket.

Correct result:
- recompute/update its actual timestamp bucket.

Do NOT assign based on:
- latest bucket seen;
- last emitted bucket;
- arrival order bucket;
- Date.now.

============================================================
AP. LATE ARRIVAL AND OPEN/CLOSE INTERACTION
============================================================

Within the historical bucket where the late trade lands:

open/close still use ARRIVAL SEQUENCE.

Example conceptually:
- trade A seq 1, ts bucket X
- trade B seq 2, ts bucket Y
- late trade C seq 3, ts bucket X

For bucket X:
- open may remain A;
- close becomes C

even though C's timestamp may be earlier than A's timestamp if both are inside X.

Do not sort bucket trades by timestamp to pick close.

============================================================
AQ. ALL RESOLUTIONS MUST REBUCKET LATE TRADE
============================================================

A late trade can affect:
- 1m candle;
- 5m candle;
- 1h candle;
- 1d candle

depending on its timestamp.

Use the same pure bucket formula at every resolution.

No incremental cache that only updates "current" candle unless it supports arbitrary historical correction.

============================================================
AR. STATELESS AGGREGATION PREFERRED
============================================================

If current Challenge 08 domain functions accept `Trade[]`:
implement aggregation as a pure calculation over the complete trade set.

This naturally supports late arrivals.

Do not introduce persistent candle caches unless the source already requires them.

If a current stateful store exists:
late arrival must invalidate/update all affected resolution views according to test.

Read current source before choosing.

============================================================
AS. DO NOT SORT GLOBAL INPUT BY TIMESTAMP FOR OPEN/CLOSE
============================================================

You MAY sort output candles by bucket time.

You should NOT globally sort trades by timestamp and then use first/last as open/close.

That violates arrival sequence.

A good structure is:
- group by timestamp-derived bucket;
- inside each bucket track min sequence / max sequence;
- high/low/volume independently.

============================================================
AT. ONE-PASS BUCKET ACCUMULATOR
============================================================

A strong generic approach if signatures permit:

For each trade:
- bucket = bucketStart(timestamp);
- existing accumulator?
  - no: initialize open/close/high/low price, minSeq/maxSeq, volume
  - yes:
    - if sequence < minSeq: update open
    - if sequence > maxSeq: update close
    - high = max(high, price)
    - low = min(low, price)
    - volume += quantity

After iteration:
- remove internal minSeq/maxSeq fields;
- sort candles by bucket.

Do not expose helper sequence fields if Candle type does not include them.

============================================================
AU. SEQUENCE TYPE / COMPARATOR
============================================================

If sequence is number:
use numeric comparator.

If bigint/string:
follow exact source type.

Do not lexicographically compare:
"10" < "2"

if sequence is decimal string.

Read test.

============================================================
AV. PRICE COMPARATOR
============================================================

Use:

if (price > high) ...

BigInt direct comparison.

Do not use:
Math.max.

Math.max cannot accept BigInt.

============================================================
AW. CANDLE SERIALIZATION
============================================================

At HTTP boundary:
BigInt cannot be directly JSON serialized.

Read current controller.

Convert exact financial values to decimal strings.

Likely:
- open
- high
- low
- close
- volume

must become strings.

Keep:
- timestamp/bucket/resolution numeric if current API does.

Do not stringify the whole response blindly.

============================================================
AX. HTTP ROUTE — 8e-1
============================================================

Read:
- src/routes/marketDataRoutes.ts
- src/controller/marketDataController.ts
- challenge08 HTTP test.

Use exact:
- method;
- route path;
- request body;
- auth middleware;
- response envelope;
- status.

Do not invent a new `/candles` path.

============================================================
AY. HTTP TRADE PARSING
============================================================

Reuse/preserve Task 9's strict `parseTrades`.

Malformed:
- non-numeric price;
- fractional quantity;
- invalid numeric string

must return controlled 400.

Do not weaken it to get valid Challenge 08 fixtures through.

If Challenge 08 fixture reveals valid form currently rejected:
update validation only to the exact real contract, without allowing malformed forms.

============================================================
AZ. HTTP RESOLUTION PARSING
============================================================

Validate resolution before domain call.

Do not let:
- zero;
- negative;
- NaN;
- Infinity;
- fractional if integer required

reach bucketing.

Return established `INVALID_REQUEST`/current standard error.

Read current error code test.

============================================================
BA. HTTP RESPONSE ENVELOPE
============================================================

Task 21 standardized API responses.

Read challenge08 and current controller.

If expected:

{
  data: candles,
  meta: {}
}

preserve it.

If Challenge 08 test predates/explicitly expects another exact shape:
follow current authoritative test and maintain Task 21 compatibility.

Do not guess.

============================================================
BB. HTTP ERROR ENVELOPE
============================================================

Preserve Task 9 standard:

{
  error: {
    code,
    details
  }
}

Do not return raw BigInt exception messages.

Do not expose stack.

============================================================
BC. OPENAPI TASK 25 CONSISTENCY
============================================================

Task 25 documented the market-data route as it existed then.

Task 27 should normally preserve:
- route path;
- request shape;
- response shape.

If Task 27 changes only implementation:
no OpenAPI update needed.

If Challenge 08 requires correcting an actually inaccurate existing market-data response schema that Task 25 documented:
update OpenAPI only if necessary to keep it truthful and Challenge 19 passing.

Do not casually broaden Task 25.

Any OpenAPI change must be explicitly documented and rerun Challenge 19.

============================================================
BD. DASHBOARD COMPATIBILITY
============================================================

Task 22 order-book dashboard and Task 24 recent trades may share price/quantity concepts.

Do not change global trade field names merely for market-data convenience.

Use adapters if needed.

Do not modify dashboard in Task 27 unless current test proves an integration issue directly caused by a required market-data contract.

============================================================
BE. MATCHING TRADE TYPE
============================================================

If market data consumes trades produced by matching:
read actual Trade type.

Do not create a second conflicting `Trade` interface if one can be safely reused.

However, do not tightly couple domain market data to mutable matching-engine state if tests construct simple trade fixtures directly.

Preserve current architecture.

============================================================
BF. TIMESTAMP SOURCE
============================================================

Challenge 08 tests likely supply explicit timestamps.

Do not replace them with:
- Date.now;
- processing time.

If production matching generates timestamps:
that is separate.

Market aggregation must respect the event's stored `timestampMs`.

============================================================
BG. ARRIVAL SEQUENCE SOURCE
============================================================

Do not infer arrival sequence from:
- array index

if the Trade object supplies a `sequence`.

Property tests may shuffle arrays.

Use explicit sequence field.

This is essential for order-tolerant aggregation.

============================================================
BH. INPUT ARRAY SHUFFLING
============================================================

Challenge 8f or property tests may provide trades in arbitrary array order.

Correct candles must be independent of input list ordering, except as encoded by trade.sequence.

Do not use:
- first element as open;
- last element as close

without comparing sequence.

============================================================
BI. DETERMINISM
============================================================

Given the same logical trade set and resolution:
- same candles;
- same candle order;
- same VWAP;
- same gaps.

No:
- Date.now;
- locale;
- random;
- global cache;
- object enumeration ambiguity.

============================================================
BJ. PERFORMANCE
============================================================

Expected aggregation can be O(n + b log b), where:
- n = trades;
- b = populated buckets.

Do not write O(n²) scans per bucket unnecessarily.

Do not over-optimize.

Correctness is primary.

============================================================
BK. NUMBER OF BUCKETS / GAP SAFETY
============================================================

If fillGaps iterates from first to last bucket:
resolution must be positive.

Read generated timestamp bounds.

Do not allow malformed resolution to produce infinite loop.

If domain function is directly called with invalid resolution and test expects error:
implement exact error.

Do not arbitrarily cap valid gap count unless test/security contract defines a limit.

============================================================
BL. EMPTY AGGREGATE INPUT
============================================================

Read test.

aggregateCandles([]):
likely returns [].

Do not throw.

Do not fabricate candle.

fillGaps([]):
likely returns [].

vwap([]):
exact zero output.

Follow actual test.

============================================================
BM. SINGLE TRADE CANDLE
============================================================

For one trade:
- open = high = low = close = price;
- volume = quantity;
- bucket correct.

Use as reasoning check.

No need to add test file.

============================================================
BN. EQUAL PRICES
============================================================

If all bucket trades same price:
- high = low = that price;
- open/close still selected by sequence but values equal.

Do not require distinct prices.

============================================================
BO. EQUAL TIMESTAMPS
============================================================

8a-1 specifically protects against timestamp collision mistakes.

Two trades can share same timestamp but have different sequences.

Open/close must use sequence.

Do not rely on JavaScript stable sort by timestamp preserving input order, because input order can be shuffled.

============================================================
BP. TIMESTAMP BEFORE / AFTER
============================================================

Late trade can have earlier timestamp than an earlier-sequence or later-sequence trade.

Do not assume:
sequence increasing => timestamp increasing.

They are independent dimensions.

============================================================
BQ. HIERARCHICAL VOLUME
============================================================

Because volume is exact additive quantity:
sum of 1m volumes inside hour must equal direct 1h volume.

If not:
- bucket boundaries wrong;
- trades omitted/doubled;
- BigInt conversion wrong;
- gap candles incorrectly have nonzero volume.

============================================================
BR. HIERARCHICAL HIGH/LOW
============================================================

Direct 1h high equals max of underlying real trade prices.

Rolling 1m high's maximum should reproduce it.

Direct low similarly.

Gap candle previous-close values should not exceed real extrema in a way that violates the current test if rollup includes gaps—read organizer implementation.

Do not build special-case corrections.

============================================================
BS. VWAP PROPERTY EXACTNESS
============================================================

Use full numerator before division:

correct:

Σ(p*q) / Σq

not:

Σ((p*q)/q)...
not:
average of price values.

Remainder is based on total denominator.

Do not lose remainder per trade.

============================================================
BT. VWAP OVER LARGE VALUES
============================================================

Property tests may use products beyond 2^53.

BigInt multiplication handles this exactly.

Do not intermediate through Number.

============================================================
BU. RETURNING BIGINT FROM DOMAIN
============================================================

Direct domain tests may expect bigint.

Do not pre-stringify direct function results unless current signature says string.

Keep serialization concern in controller.

============================================================
BV. ERROR TYPE / INVALID RESOLUTION
============================================================

Read current domain stubs/tests.

If pure aggregate functions throw:
- RangeError;
- Error;
- return []

according to exact contract.

Do not invent broad swallowing.

HTTP controller can map validation to 400.

============================================================
BW. LATE-ARRIVAL STATEFUL CACHE IF PRESENT
============================================================

If current domain has cache/materialized candles:
late arrival must update every affected resolution.

Do not only update 1m.

Do not only update latest candle.

Do not use "ignore older timestamps".

But if no stateful cache exists:
do not create one.

Pure recomputation is simpler and safer.

============================================================
BX. NO DATABASE CHANGE
============================================================

Challenge 08 does not require schema migration according to published scope.

Do not:
- add trades table;
- add candles table;
- modify migrations

unless current organizer test/source explicitly proves an existing designated persistence surface is required.

Default Task 27 is domain + controller.

============================================================
BY. NO LIVE FEED
============================================================

Do not modify:
- WebSocket hub;
- client live feed;
- reconnect code.

Late-arrival correctness here is aggregation correctness, not WebSocket streaming.

Task 31/32 later.

============================================================
BZ. TASK 27 EXPECTED FILE SCOPE
============================================================

Primary:

- src/domain/marketData.ts
- src/controller/marketDataController.ts

Possible if actually required:
- src/routes/marketDataRoutes.ts
- src/openapi.ts or current OpenAPI module ONLY if response contract truly changes

Create/update:

- docs/clearhouse-task-27-market-data-time.md

Normally do NOT change:
- matching engine;
- database;
- migrations;
- seeds;
- client;
- fees;
- netting.

Do NOT add tests.

============================================================
CA. REQUIRED VERIFICATION — CHALLENGE 08
============================================================

After implementation:

npm run typecheck

Then:

npm test challenge08.test.ts

This is PRIMARY Task 27 gate.

If labels exist:

npm test challenge08.test.ts -t "Challenge 8a"
npm test challenge08.test.ts -t "Challenge 8b"
npm test challenge08.test.ts -t "Challenge 8c"
npm test challenge08.test.ts -t "Challenge 8d"
npm test challenge08.test.ts -t "Challenge 8e"
npm test challenge08.test.ts -t "Challenge 8f"

Use actual labels.

For property failures record:
- fast-check seed;
- path;
- counterexample.

============================================================
CB. MARKET INPUT REGRESSION
============================================================

Run:

npm test challenge00b.test.ts -t "Challenge 0r"

Task 9 malformed market-data inputs must still return 400.

============================================================
CC. MATCHING REGRESSION
============================================================

Run:

npm test challenge03.test.ts

Do not regress trade model/matching.

============================================================
CD. API / OPENAPI REGRESSION
============================================================

Run:

npm test challenge11.test.ts

npm test challenge19.test.ts

The market-data HTTP route must preserve:
- envelopes/versioning;
- documentation accuracy.

============================================================
CE. DASHBOARD REGRESSION
============================================================

Run:

npm test challenge12.test.ts
npm test challenge20.test.ts

Market-data changes must not break existing client contracts.

============================================================
CF. EVENT / TIME INDEPENDENCE REGRESSION
============================================================

Run:

npm test challenge06.test.ts

Task 27 must not disturb Task 26 event sequence/timestamp logic.

Do not couple market-data sequence to event-store sequence unless source already defines them as same.

============================================================
CG. BROADER REGRESSION
============================================================

Run:

npm test challenge10.test.ts
npm test challenge09.test.ts
npm test challenge05.test.ts
npm test challenge04.test.ts
npm test challenge02.test.ts
npm test challenge01.test.ts
npm test _sanity.test.ts

Then:

git diff --check

Finally:

npm test

Record future Task 28+ failures honestly.

============================================================
CH. FAILURE DIAGNOSIS — 8a-1
============================================================

If open/close wrong:
- array order used instead of sequence;
- timestamp sort used for open/close;
- stable-sort assumption;
- min/max sequence logic reversed;
- sequence parsed lexicographically.

If same timestamp fixture fails:
focus on arrival sequence.

============================================================
CI. FAILURE DIAGNOSIS — 8a-2
============================================================

If high/low property fails:
- wrong initializer 0n;
- Number conversion;
- high/low swapped;
- not all bucket trades processed.

Use first trade initialization.

============================================================
CJ. FAILURE DIAGNOSIS — 8a-3
============================================================

If randomized multi-resolution oracle fails:
- bucket floor;
- upper-bound inclusivity;
- timezone logic;
- output order;
- open/close sequence;
- resolution integer handling.

Capture counterexample seed/path.

Do not special-case the failed resolution.

============================================================
CK. FAILURE DIAGNOSIS — 8b-1
============================================================

If hourly hierarchy fails:
- missing/duplicated trades;
- boundary trade in wrong bucket;
- volume not BigInt sum;
- gap volume nonzero;
- direct hour code differs from generic resolution logic.

Use one generic aggregation algorithm.

============================================================
CL. FAILURE DIAGNOSIS — 8c-1
============================================================

If gaps omitted:
- only iterating populated candles.

If gap price is zero:
- should carry previous close.

If too many gaps:
- leading/trailing generation beyond current contract.

If infinite loop:
- resolution validation.

============================================================
CM. FAILURE DIAGNOSIS — 8d-1
============================================================

If VWAP value wrong:
- unweighted average;
- per-trade division;
- float conversion;
- numerator/denominator reversed.

If remainder wrong:
- computing per-trade remainder;
- using quotient remainder formula incorrectly.

Correct:
remainder = totalWeightedSum % totalVolume.

============================================================
CN. FAILURE DIAGNOSIS — 8d-2
============================================================

If empty throws/NaN:
check zero denominator BEFORE division.

Return exact expected zero shape.

Do not catch arbitrary errors and pretend zero.

============================================================
CO. FAILURE DIAGNOSIS — 8e-1
============================================================

If HTTP fails while domain passes:
- parseTrades field names;
- resolution parsing;
- BigInt JSON serialization;
- response envelope;
- route mounting;
- signing/auth middleware;
- wrong status.

Preserve 0r validation.

============================================================
CP. FAILURE DIAGNOSIS — 8f-1
============================================================

If late trade stays in newest bucket:
- stateful "current bucket" logic;
- arrival sequence used for bucket.

If it lands correctly but open/close wrong:
- timestamp sort dominates sequence.

If only some resolutions fail:
- hardcoded resolution logic;
- stale cached higher-level candle.

Use timestamp-derived rebucketing generically.

============================================================
CQ. PROPERTY TEST DISCIPLINE
============================================================

When a property test fails:

record:
- seed;
- path;
- shrunk trade list;
- resolution;
- expected candle;
- actual candle.

Fix invariant.

Do NOT:
- set seed globally;
- rerun repeatedly until pass;
- hardcode counterexample.

============================================================
CR. TASK 27 ENGINEERING NOTE
============================================================

Create/update:

docs/clearhouse-task-27-market-data-time.md

Include:

1. Starting commit.
2. Working branch task-27.
3. Final branch master.
4. Pre-existing dirty/staged state.
5. Exact Challenge 08 test count.
6. Exact 80-point score map.
7. Trade interface.
8. Candle interface.
9. VWAP return interface.
10. Timestamp type.
11. Sequence type.
12. Resolution type.
13. Bucket formula.
14. Boundary convention.
15. Timezone strategy.
16. Open/close arrival-sequence algorithm.
17. High/low algorithm.
18. Volume algorithm.
19. Output sorting.
20. Multi-resolution strategy.
21. Hierarchical consistency reasoning.
22. fillGaps signature.
23. Internal-gap behavior.
24. previous-close propagation.
25. leading/trailing behavior.
26. VWAP numerator/denominator.
27. VWAP quotient.
28. remainder semantics.
29. empty VWAP behavior.
30. late-arrival behavior.
31. Input immutability.
32. BigInt strategy.
33. HTTP endpoint/path/method.
34. Request validation.
35. response serialization/envelope.
36. OpenAPI impact if any.
37. Exact changed files.
38. Typecheck.
39. 8a result.
40. 8b result.
41. 8c result.
42. 8d result.
43. 8e result.
44. 8f result.
45. Full Challenge 08 result.
46. Challenge 0r result.
47. Challenge 03 result.
48. Challenge 11/19 results.
49. Challenge 12/20 results.
50. Challenge 06 regression.
51. broader regressions.
52. full-suite result.
53. protected-file confirmation.
54. suggested commit.
55. master merge/push workflow.
56. next Task 28: Challenge 16 Fee and Rebate Engine.

Do not include secrets.

============================================================
CS. FINAL DIFF REVIEW
============================================================

Run:

git diff --check
git status --short
git diff --stat
git diff --name-only

Review:

git diff -- src/domain/marketData.ts
git diff -- src/controller/marketDataController.ts
git diff -- src/routes/marketDataRoutes.ts

If OpenAPI changed:

git diff -- "<actual-openapi-source-path>"

Review:

git diff -- docs/clearhouse-task-27-market-data-time.md

Only use paths that exist/change.

Confirm:
- organizer tests unchanged;
- no new tests;
- config unchanged;
- package unchanged;
- migrations unchanged;
- seeds unchanged;
- no floating-point financial arithmetic;
- no array-order dependence for open/close;
- no local timezone dependence;
- no WebSocket/live-feed work;
- no fees/netting;
- no Task 28+ work.

============================================================
CT. TASK 27 COMPLETION CRITERIA
============================================================

Task 27 is COMPLETE only when:

DISCOVERY

[ ] challenge08 read completely.
[ ] exact tests/functions/signatures recorded.
[ ] Trade/Candle/VWAP types understood.
[ ] exact HTTP route/body known.
[ ] exact bucket rule known.

OHLCV

[ ] timestamp determines bucket.
[ ] sequence determines open.
[ ] sequence determines close.
[ ] equal timestamp case correct.
[ ] shuffled input order doesn't change result.
[ ] high = exact max price.
[ ] low = exact min price.
[ ] volume = exact quantity sum.
[ ] BigInt used.
[ ] output chronologically deterministic.
[ ] 1m correct.
[ ] 5m correct.
[ ] 1h correct.
[ ] 1d correct.

HIERARCHY

[ ] direct 1h volume equals minute rollup.
[ ] direct 1h high equals minute rollup.
[ ] direct 1h low equals minute rollup.
[ ] no missing/double-counted boundary trades.

GAPS

[ ] every internal missing bucket filled.
[ ] gap O/H/L/C = previous close.
[ ] gap volume = zero.
[ ] multiple gaps handled.
[ ] no fabricated leading data unless contract.
[ ] no unbounded trailing data.
[ ] input not mutated.

VWAP

[ ] weightedSum = Σ(price*quantity).
[ ] total volume exact.
[ ] quotient exact integer division.
[ ] discarded remainder returned.
[ ] no float.
[ ] empty input returns exact zero contract.
[ ] no divide-by-zero.

HTTP

[ ] existing endpoint implemented.
[ ] valid trade parsing preserved.
[ ] malformed numeric data stays 400.
[ ] resolution validated.
[ ] BigInt serialized as strings.
[ ] success envelope correct.
[ ] error envelope correct.

LATE ARRIVAL

[ ] late trade placed by timestamp.
[ ] historical bucket updated/recomputed.
[ ] sequence still controls open/close.
[ ] every resolution correct.
[ ] no "ignore old timestamp" logic.

REGRESSION

[ ] typecheck passes.
[ ] Challenge 08 passes.
[ ] Challenge 0r passes.
[ ] Challenge 03 passes.
[ ] Challenge 11 passes.
[ ] Challenge 19 passes.
[ ] Challenge 12/20 pass.
[ ] Challenge 06 passes.
[ ] sanity/full suite recorded.
[ ] protected files unchanged.
[ ] Task 27 note created.
[ ] final Git target master.

If any Challenge 08 assertion remains failing:
- Task 27 status = PARTIAL;
- report exact failing test/root cause.

============================================================
CU. FINAL CURSOR REPORT
============================================================

Return:

1. Task 27 status COMPLETE/PARTIAL.
2. Starting commit.
3. Current branch.
4. Exact files changed.
5. Exact Challenge 08 test count.
6. Trade model.
7. Candle model.
8. VWAP return model.
9. Bucket formula.
10. Bucket boundary semantics.
11. Open/close sequence logic.
12. High/low logic.
13. Volume logic.
14. Output ordering.
15. Multi-resolution behavior.
16. Hierarchical consistency.
17. Gap-filling behavior.
18. Leading/trailing gap policy.
19. VWAP numerator/denominator.
20. Quotient/remainder behavior.
21. Empty VWAP behavior.
22. Late-arrival behavior.
23. HTTP route/request.
24. HTTP serialization/envelope.
25. Task 9 validation preservation.
26. BigInt strategy.
27. Typecheck.
28. 8a result.
29. 8b result.
30. 8c result.
31. 8d result.
32. 8e result.
33. 8f result.
34. Full Challenge 08 result.
35. Challenge 0r result.
36. Challenge 03 result.
37. Challenge 11/19 results.
38. Challenge 12/20 results.
39. Challenge 06 result.
40. broader regressions.
41. full-suite result.
42. remaining future failures.
43. confirmation protected files unchanged.
44. final diff summary.
45. reviewed Git commands targeting master.

Suggested commit:

feat: implement exact market data aggregation

Do not automatically commit, merge, or push.
````

---

# Task 27 acceptance matrix

| Area | Required behavior |
|---|---|
| Bucket | Derived from timestamp |
| Open | Earliest arrival sequence |
| Close | Latest arrival sequence |
| High | Exact max price |
| Low | Exact min price |
| Volume | Exact Σ quantity |
| Financial arithmetic | BigInt |
| Output order | Deterministic chronological |
| 1m | Correct |
| 5m | Correct |
| 1h | Correct |
| 1d | Correct |
| Hierarchy | Direct hour agrees with minute rollup |
| Gaps | Internal missing buckets filled |
| Gap OHLC | Previous close |
| Gap volume | 0 |
| VWAP | Σ(p*q)/Σq |
| VWAP remainder | Returned exactly |
| Empty VWAP | Zero contract |
| HTTP | Aggregates + serializes correctly |
| Malformed data | Controlled 400 |
| Late trade | Rebuckets by timestamp |
| Late trade open/close | Still sequence-based |
| Timezone | Deterministic / no local-zone dependency |
| Input mutation | None |
| WebSockets | Not implemented |
| Final branch | `master` |

---

# Official Git / CodeCommit workflow — Task 27

Official final branch:

**`master`**

Workflow:

**`master` → `task-27` → implement/test → commit → merge into `master` → push `origin master`**

---

## 1. Verify Task 27 branch

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
task-27
```

Official final branch:

```text
master
```

---

## 2. Run final Task 27 verification

```powershell
npm run typecheck

npm test challenge08.test.ts

npm test challenge00b.test.ts -t "Challenge 0r"

npm test challenge03.test.ts

npm test challenge11.test.ts

npm test challenge19.test.ts

npm test challenge12.test.ts

npm test challenge20.test.ts

npm test challenge06.test.ts

npm test challenge10.test.ts

npm test challenge09.test.ts

npm test challenge05.test.ts

npm test challenge04.test.ts

npm test challenge02.test.ts

npm test challenge01.test.ts

npm test _sanity.test.ts

git diff --check
```

If Challenge 08 labels exist:

```powershell
npm test challenge08.test.ts -t "Challenge 8a"

npm test challenge08.test.ts -t "Challenge 8b"

npm test challenge08.test.ts -t "Challenge 8c"

npm test challenge08.test.ts -t "Challenge 8d"

npm test challenge08.test.ts -t "Challenge 8e"

npm test challenge08.test.ts -t "Challenge 8f"
```

Use actual labels if different.

Then:

```powershell
npm test
```

---

## 3. Review Task 27 changes

```powershell
git status --short
git diff --stat
git diff --name-only
```

Review primary files:

```powershell
git diff -- src/domain/marketData.ts
git diff -- src/controller/marketDataController.ts
```

Only if genuinely changed:

```powershell
git diff -- src/routes/marketDataRoutes.ts
```

If OpenAPI changed:

```powershell
git diff -- "<actual-openapi-source-path>"
```

Do not paste placeholder literally.

Review note:

```powershell
git diff -- docs/clearhouse-task-27-market-data-time.md
```

---

## 4. Stage only Task 27 files

Always stage the engineering note:

```powershell
git add -- docs/clearhouse-task-27-market-data-time.md
```

Primary:

```powershell
git add -- src/domain/marketData.ts
git add -- src/controller/marketDataController.ts
```

Only if changed:

```powershell
git add -- src/routes/marketDataRoutes.ts
```

Only if Challenge 08 implementation required a truthful Task 25 OpenAPI correction:

```powershell
git add -- "<actual-openapi-source-path>"
```

Do not paste placeholder literally.

If a file contains unrelated changes:

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
- WebSocket code
- fee/netting code
- unrelated source.

---

## 6. Commit Task 27

```powershell
git commit -m "feat: implement exact market data aggregation"
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

## 8. Merge Task 27

Prefer:

```powershell
git merge --ff-only task-27
```

If fast-forward fails:

```powershell
git status
git log --oneline --graph --decorate --all --max-count=30
```

If legitimate histories diverged:

```powershell
git merge task-27
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

npm test challenge08.test.ts

npm test challenge00b.test.ts -t "Challenge 0r"

npm test challenge03.test.ts

npm test challenge19.test.ts

git diff --check
git status -sb
```

For extra confidence:

```powershell
npm test challenge20.test.ts
npm test challenge06.test.ts
npm test _sanity.test.ts
```

---

## 10. Push official master

```powershell
git push origin master
```

Do not push final competition submission to `main`.

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

If safe for the local-only Task 27 commit:

```powershell
git pull --rebase origin master
```

Then rerun:

```powershell
npm run typecheck
npm test challenge08.test.ts
npm test challenge00b.test.ts -t "Challenge 0r"
git diff --check
```

Then:

```powershell
git push origin master
```

Resolve conflicts carefully.

---

# Fast Task 27 checklist

- [ ] branch = task-27
- [ ] final branch = master
- [ ] challenge08 fully read
- [ ] exact test count recorded
- [ ] config/scores read-only
- [ ] exact Trade type known
- [ ] exact Candle type known
- [ ] exact VWAP result known
- [ ] timestamp determines bucket
- [ ] arrival sequence determines open
- [ ] arrival sequence determines close
- [ ] same timestamp collision correct
- [ ] input array order irrelevant
- [ ] high exact max
- [ ] low exact min
- [ ] volume BigInt sum
- [ ] no Number financial conversion
- [ ] bucket boundary exact
- [ ] no local timezone dependence
- [ ] 1m correct
- [ ] 5m correct
- [ ] 1h correct
- [ ] 1d correct
- [ ] hourly hierarchy consistent
- [ ] internal gaps filled
- [ ] gap O/H/L/C previous close
- [ ] gap volume zero
- [ ] no fabricated leading/trailing range outside contract
- [ ] VWAP weighted numerator exact
- [ ] VWAP denominator exact
- [ ] quotient exact
- [ ] remainder returned
- [ ] empty VWAP zero
- [ ] candles endpoint correct
- [ ] BigInt JSON serialization safe
- [ ] malformed market input remains 400
- [ ] late arrival rebucketed by timestamp
- [ ] late arrival open/close still sequence-based
- [ ] all resolutions late-arrival correct
- [ ] Challenge08 passes
- [ ] Challenge0r passes
- [ ] Challenge03 passes
- [ ] Challenge11/19 pass
- [ ] Challenge12/20 pass
- [ ] Challenge06 passes
- [ ] sanity/full suite recorded
- [ ] protected files unchanged
- [ ] Task27 note created
- [ ] committed on task-27
- [ ] merged into master
- [ ] `git push origin master`
- [ ] remote master verified

**Next planned task:** Task 28 — Challenge 16: Fee and Rebate Engine.
