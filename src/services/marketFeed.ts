import * as liveHub from "./liveHub.js";

export interface Level {
  price: string;
  quantity: string;
}

export interface Depth {
  bids: Level[];
  asks: Level[];
}

export interface BookDelta {
  side: "bids" | "asks";
  price: string;
  quantity: string;
}

function sideDeltas(
  side: "bids" | "asks",
  before: readonly Level[],
  after: readonly Level[],
): BookDelta[] {
  const previous = new Map<string, string>();
  for (const level of before) previous.set(level.price, level.quantity);
  const current = new Map<string, string>();
  for (const level of after) current.set(level.price, level.quantity);

  const prices = [...new Set([...previous.keys(), ...current.keys()])].sort((a, b) => {
    if (a === b) return 0;
    const ai = BigInt(a);
    const bi = BigInt(b);
    return ai < bi ? -1 : ai > bi ? 1 : 0;
  });

  if (side === "bids") prices.reverse();

  const deltas: BookDelta[] = [];
  for (const price of prices) {
    const prev = previous.get(price);
    const next = current.get(price);
    if (prev === next) continue;
    if (next === undefined) deltas.push({ side, price, quantity: "0" });
    else deltas.push({ side, price, quantity: next });
  }
  return deltas;
}

/** The book levels that differ between two snapshots, as deltas. See tests/challenge18.test.ts. */
export function diffDepth(before: Depth, after: Depth): BookDelta[] {
  return [...sideDeltas("bids", before.bids, after.bids), ...sideDeltas("asks", before.asks, after.asks)];
}

/** Publishes what changed between two snapshots of a market's book. The feed must never break order flow. */
export function publishBookChange(market: string, before: Depth, after: Depth): void {
  try {
    for (const delta of diffDepth(before, after)) liveHub.publish(`orderbook:${market}`, delta);
  } catch {
    /* the live feed is optional */
  }
}
