# ClearHouse Task 32 — Live Dashboard Updates (Challenge 17)

## Identity

| Field | Value |
| --- | --- |
| Starting tip for Task 32 work | `7901fa6` (`feat: implement authenticated websocket feed` — Task 31 / Challenge 18) |
| Prior master tip before Task 31 branch tip | `962464b` (`feat: implement complex order strategy state machines`) |
| Task branch | `task-32` |
| Official final branch | `master` |
| Challenge | 17 — Live Dashboard Updates |
| Points | **150 / 150** (8 tests) |
| Scope | Client-side: `LiveFeedClient`, `applyOrderBookDelta`, dashboard connection UI |

## Point split

| Slice | Points | Count |
| --- | ---: | --- |
| 17a Connection status | 20 | 1 |
| 17b Per-topic ordering | 45 | 2 (25 + 20) |
| 17c Reconnecting | 40 | 2 (25 + 15) |
| 17d Stopping | 10 | 1 |
| 17e Order-book deltas | 15 | 1 |
| 17f Dashboard connection UI | 20 | 1 |
| **Total** | **150** | **8** |

## LiveFeedClient public API

```js
new LiveFeedClient({
  url,
  topics,
  createSocket,   // (url) => socket
  setTimer,       // (fn, ms) => id
  clearTimer,     // (id) => void
  random,         // () => number in [0,1)
  onMessage,      // (topic, message) => void
  onStatus,       // (status) => void
  staleAfterMs = 5000,
  gapTimeoutMs = 1000,
  baseDelayMs = 500,
  maxDelayMs = 4000,
})
client.start()
client.stop()
applyOrderBookDelta(book, delta)
```

### Injection

- **Socket factory:** `createSocket(url)` — tests inject a fake socket.
- **Timers:** `setTimer` / `clearTimer` — virtual clock for stale / gap / reconnect.
- **Random:** injected `random()` only — never `Math.random()` for backoff jitter.

## Status model

Statuses: `connecting` | `live` | `stale` | `reconnecting` | `stopped`

### Transitions

- `start()` → `connecting`, opens socket.
- Socket `open` alone is **not** `live`; sends subscribe and arms stale timer.
- Valid activity (`heartbeat`, snapshot, delta) → `live`, resets stale timer, resets backoff.
- Silence for `staleAfterMs` while socket up → `stale`.
- Socket `close` → `reconnecting` (clears stale timer; never reports `stale` while down).
- `stop()` → `stopped` (terminal).

### Status dedup

`setStatus(next)` no-ops when `next === this.status`. Consecutive duplicate status notifications never fire.

### Stale timer

- Armed on open and on every valid activity.
- Exactly one timer; previous cleared before re-arm.
- Cleared on disconnect / stop / while reconnecting.
- Stale does not wipe dashboard data (UI layer).

## Socket generation guard

`generation` increments on each `openSocket` / `stop`. Handlers for `open` / `message` / `close` require `generation === this.generation && socket === this.socket`.

## Per-topic state

Independent map entry per topic:

| Field | Role |
| --- | --- |
| `lastDeliveredSeq` | Last delivered seq (kept across reconnect) |
| `hasBaseline` | Trusted live baseline from snapshot |
| `pendingBySeq` | Out-of-order future frames |
| `gapTimer` | Per-topic gap timeout |
| `resyncRequested` | Exactly-one resync latch |
| `awaitingSnapshot` | Ignore deltas until snapshot after resync |

A gap in topic A never blocks topic B.

## Snapshot / baseline

On snapshot:

1. Clear gap timer + pending + resync flags.
2. `hasBaseline = true`, `lastDeliveredSeq = seq`.
3. Deliver snapshot, then drain pending in order.

After disconnect: `hasBaseline = false` but `lastDeliveredSeq` preserved for resume.

## Duplicate / out-of-order

For last delivered `L`:

- `seq <= L` → drop (duplicate/old).
- `seq === L + 1` → deliver, drain pending.
- `seq > L + 1` → buffer once in `pendingBySeq` (no second copy of same seq).

## Gap / resync

- Gap begins when a future frame is buffered beyond `L + 1` with a valid baseline.
- One gap timer per topic; cancelled if gap fills before timeout.
- On timeout (with generation/socket/gap/resync guards): send exactly one `{ type: "resync", topic }`, set `awaitingSnapshot`, clear pending, ignore subsequent deltas until snapshot.

## Reconnect

On close:

1. Invalidate baseline; clear pending/gap/resync transients.
2. Keep `lastDeliveredSeq`.
3. Status `reconnecting`; schedule reconnect.
4. On open: `{ type: "subscribe", topics, resumeFrom }` where `resumeFrom` maps delivered topics to their last delivered seq (else `{}`).
5. No trusted baseline until fresh snapshot — reconnect deltas ignored until then.

### Backoff

```
cap = min(maxDelayMs, baseDelayMs * 2 ** attempt)
delay = floor(cap * (0.5 + 0.5 * random()))
```

Defaults: base `500`, max `4000`. Attempt increments each schedule. Cap applied **before** jitter.

### Failed reconnect

`createSocket` throw → schedule another reconnect (attempt advances). At most one reconnect timer. Generation/socket guards prevent double-scheduling from late close/error.

### Backoff reset

`reconnectAttempt = 0` when **data flows** (`noteActivity`), not merely on `open`.

## stop()

Terminal, idempotent:

1. Mark stopped first.
2. Clear reconnect + stale + all gap timers.
3. Close current socket exactly once.
4. Bump generation; ignore late frames/callbacks.
5. Status `stopped` once.

Reconnect timer callbacks also check `stopped`.

## applyOrderBookDelta

- Pure: does not mutate book, levels, or delta.
- Quantity `"0"` removes level; nonzero upserts.
- Quantity `"007"` → `"7"` via `BigInt`.
- Bids descending, asks ascending (canonical integer-string compare).
- Invalid side/price/quantity → `RangeError` (no partial apply).

## Dashboard connection UI (17f)

`setConnectionStatus(doc, status)`:

- Updates `#connection-status` (`data-state` + `textContent`).
- `stale` / `reconnecting` / `stopped→stale`: overlay `.stale-note` on ready/stale/reconnecting panels; **keep table/book DOM**.
- `live`: restore `ready`, remove notes.
- `connecting`: banner only.
- Leaves `loading` / `empty` / `error` panels alone.

`setStatus` supports non-destructive `stale` / `reconnecting` / `ready`.

XSS: `textContent` only. Accessibility: preserves `role` / `aria-busy` rules for loading/error.

## Changed files

- `client/js/liveFeed.js` — full `LiveFeedClient` + `applyOrderBookDelta`
- `client/js/dashboard.js` — `setStatus` stale/ready behavior + `setConnectionStatus`
- `docs/clearhouse-task-32-live-dashboard-updates.md` — this note

## Protected files (unchanged)

- Organizer tests
- `config/`
- package files / Vitest / TS config
- migrations / seeds
- Task 31 WebSocket server — not rewritten for Task 32
- No Task 33+ work

## Verification results

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| Challenge 17 (8 tests) | PASS |
| Challenge 17a–17f | PASS (full file 8/8) |
| Challenge 18 | PASS (Task 31 tip under `task-32`) |
| Challenge 12 | PASS |
| Challenge 20 | PASS |
| Challenge 11 / 19 | PASS |
| Challenge 03 | PASS |
| Broader suite | PASS (full `npm test`: 31 files / 279 tests) |
| `git diff --check` | clean |

## Remaining Task 33+

Not implemented (out of scope).

## Suggested commit

```text
feat: implement resilient live dashboard feed
```

## Master merge/push workflow (after approval)

```bash
git status -sb
git branch --show-current
git diff --check
git diff --stat
git diff --name-only

git add -- docs/clearhouse-task-32-live-dashboard-updates.md
git add -- client/js/liveFeed.js
git add -- client/js/dashboard.js

git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git diff --cached

git commit -m "$(cat <<'EOF'
feat: implement resilient live dashboard feed

EOF
)"

git switch master
git fetch origin
git pull --ff-only origin master
git merge --ff-only task-32
git push origin master

git rev-parse HEAD
git ls-remote origin refs/heads/master
git status -sb
```

Never push the final competition submission to `main`. Organisers require `master`.
