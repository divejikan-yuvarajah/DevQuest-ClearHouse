# ClearHouse Task 31 — The WebSocket Feed

## Git

- Starting commit (branch tip before work): `875aa205f172480b8a3b71fd833c1171d53e391d`
- Base after fast-forward onto master (includes Task 30): `962464bebc6cb8ceb1aa2c779524afc7b46a4d31`
- Working branch: `task-31`
- Final submission branch: `master`

## Challenge 18 test count

**9** organizer tests / **190/190** points (`config/scores.ts`).

| ID | Points | Focus |
|---|---|---|
| 18a-1 | 15 | Pre-upgrade HTTP 401 |
| 18a-2 | 20 | Subscribe / snapshot / ACL / malformed |
| 18b-1 | 30 | Per-topic gapless sequences + late join |
| 18b-2 | 15 | Resync |
| 18c-1 | 25 | Heartbeat JSON + protocol ping/pong |
| 18c-2 | 30 | Backpressure / slow-client eviction |
| 18d-1 | 15 | `disconnectAll` 1012 / `close` 1001 |
| 18e-1 | 20 | 30×100 fan-out |
| 18f-1 | 20 | `diffDepth` |

## Public API

```ts
class WebSocketHub {
  constructor(options: HubOptions)
  publish(topic: string, data: unknown): number
  disconnectAll(): void
  connectionCount(): number
  close(): Promise<void>
}

diffDepth(before: Depth, after: Depth): BookDelta[]
```

- Path: `/ws` (hub option; production via `liveHub.startLiveHub`)
- Token: `?token=` (also accepts `Authorization: Bearer`)
- Auth: injected `authenticate`; production uses `verifyAccessToken` in `liveHub.ts`
- Defaults: `heartbeatIntervalMs=30000`, `maxBufferedBytes=256KiB`

## Protocol

- Subscribe: `{ type:"subscribe", topics:string[] }`
- Snapshot: `{ topic, seq, kind:"snapshot", data }`
- Delta: `{ topic, seq, kind:"delta", data }`
- Subscribed: `{ type:"subscribed", topics:string[] }`
- Errors: `{ type:"error", code, topic? }` — `FORBIDDEN` | `UNKNOWN_TOPIC` | `BAD_MESSAGE` | `NOT_SUBSCRIBED`
- Heartbeat frame: `{ kind:"heartbeat" }` plus WebSocket `ping`/`pong`
- Resync: `{ type:"resync", topic }` → fresh snapshot at current seq (no increment)

## Design notes

- **401 before upgrade** via `noServer` + HTTP `upgrade` handler; invalid token never upgrades.
- Principal stored on connection; authorize never trusts client-supplied identity.
- Per-topic `seq` starts at **0**; publish increments once; snapshot/resync observe only.
- Late-subscriber race: synchronous `seq` + `snapshot()` + subscriber add + send (no `await`).
- Backpressure: always send when OPEN; schedule `setImmediate` eviction when `bufferedAmount > max` so healthy sync bursts drain before eviction; paused clients stay over and are terminated.
- Fan-out: one `JSON.stringify` per publish; independent per-client send.
- `disconnectAll` → close **1012**, keep upgrade listener + heartbeat; `close` → **1001**, clear timer, `server.off("upgrade", exactHandler)`, close WSS.
- `diffDepth`: string prices/quantities; removals `"0"`; bids (desc) then asks (asc); BigInt price compare; inputs immutable.

## Files changed

| File | Change |
|---|---|
| `src/services/wsHub.ts` | Full `WebSocketHub` |
| `src/services/marketFeed.ts` | `diffDepth` |
| `docs/clearhouse-task-31-websocket-feed.md` | This note |

Unchanged: `src/server.ts`, `src/services/liveHub.ts` (already wired). No Task 32 client changes.

## Verification

| Check | Result |
|---|---|
| typecheck | PASS (earlier run) |
| Challenge 18 (9) | PASS (~2.5–3.2s) |
| Challenge 01/03/08/10 | PASS |
| Challenge 11/19/12/20 | PASS |
| Challenge 16/14 | PASS |
| Challenge 15 | PASS once Task 30 present on base |
| Challenge 04/02/05/09/13/06/sanity | PASS |
| Challenge 17 | FAIL — Task 32 client (out of scope) |

## Suggested commit

```text
feat: implement authenticated websocket feed
```

## Master workflow (after approval)

```powershell
git add -- docs/clearhouse-task-31-websocket-feed.md src/services/wsHub.ts src/services/marketFeed.ts
git commit -m "feat: implement authenticated websocket feed"
git switch master
git fetch origin
git pull --ff-only origin master
git merge --ff-only task-31
git push origin master
```
