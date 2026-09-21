import { createHash } from "node:crypto";

export interface StoredEvent {
  seq: number;
  type: string;
  accountId: string;
  asset: string;
  amount: string; // decimal-string minor units, kept as text through hashing and storage
  hash: string;
  prevHash: string | null;
}

/**
 * Canonical event hash.
 * Material (LF-joined, UTF-8): prevHash|seq|type|accountId|asset|amount
 * Genesis predecessor is represented as an empty string in the material.
 * Digest: lowercase hex SHA-256. The stored `hash` field is never hashed into itself.
 */
export function computeHash(prevHash: string | null, seq: number, type: string, accountId: string, asset: string, amount: string): string {
  const material = [prevHash ?? "", String(seq), type, accountId, asset, amount].join("\n");
  return createHash("sha256").update(material, "utf8").digest("hex");
}

export type Balances = Map<string, bigint>; // key: `${accountId}:${asset}`

export function emptyBalances(): Balances {
  return new Map();
}

/**
 * Pure reducer: copies starting balances, deduplicates by `seq`, sorts by `seq`,
 * and applies each `deposited` event exactly once with BigInt arithmetic.
 * Does not mutate the input array or event objects.
 */
export function replay(events: readonly StoredEvent[], startingBalances: Balances = emptyBalances()): Balances {
  const balances: Balances = new Map(startingBalances);

  const bySeq = new Map<number, StoredEvent>();
  for (const event of events) {
    if (!bySeq.has(event.seq)) {
      bySeq.set(event.seq, event);
    }
  }

  const ordered = [...bySeq.values()].sort((a, b) => a.seq - b.seq);
  for (const event of ordered) {
    if (event.type !== "deposited") continue;
    const key = `${event.accountId}:${event.asset}`;
    const current = balances.get(key) ?? 0n;
    balances.set(key, current + BigInt(event.amount));
  }

  return balances;
}

export interface ChainVerification {
  valid: boolean;
  firstBrokenSeq: number | null;
}

/**
 * Verifies predecessor links and recomputes each event content hash.
 * Returns the earliest broken sequence on the first failure.
 */
export function verifyChain(events: readonly StoredEvent[]): ChainVerification {
  const ordered = [...events].sort((a, b) => a.seq - b.seq);
  let expectedPrev: string | null = null;

  for (const event of ordered) {
    if (event.prevHash !== expectedPrev) {
      return { valid: false, firstBrokenSeq: event.seq };
    }
    const expectedHash = computeHash(event.prevHash, event.seq, event.type, event.accountId, event.asset, event.amount);
    if (event.hash !== expectedHash) {
      return { valid: false, firstBrokenSeq: event.seq };
    }
    expectedPrev = event.hash;
  }

  return { valid: true, firstBrokenSeq: null };
}

export function balancesToJson(balances: Balances): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of balances) {
    out[key] = value.toString();
  }
  return out;
}

export function balancesFromJson(json: Record<string, string>): Balances {
  const balances = emptyBalances();
  for (const [key, value] of Object.entries(json)) {
    balances.set(key, BigInt(value));
  }
  return balances;
}
