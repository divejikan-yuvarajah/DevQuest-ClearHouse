/** `from` owes `to` the given amount (in the asset's minor units). */
export interface Obligation {
  id: string;
  from: string;
  to: string;
  asset: string;
  amount: bigint;
}

/** A physical payment: `from` pays `to`. */
export interface Transfer {
  from: string;
  to: string;
  asset: string;
  amount: bigint;
}

interface Position {
  id: string;
  bal: bigint;
}

const EXACT_LIMIT = 14;

function validateObligation(o: Obligation): void {
  if (typeof o.from !== "string" || o.from.length === 0) {
    throw new RangeError("obligation from must be a non-empty string");
  }
  if (typeof o.to !== "string" || o.to.length === 0) {
    throw new RangeError("obligation to must be a non-empty string");
  }
  if (typeof o.asset !== "string" || o.asset.length === 0) {
    throw new RangeError("obligation asset must be a non-empty string");
  }
  if (typeof o.amount !== "bigint") {
    throw new RangeError("obligation amount must be a bigint");
  }
  if (o.amount <= 0n) {
    throw new RangeError("obligation amount must be positive");
  }
  if (o.from === o.to) {
    throw new RangeError("obligation cannot be self-directed");
  }
}

function cmpId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function cmpTransfer(a: Transfer, b: Transfer): number {
  if (a.asset !== b.asset) return cmpId(a.asset, b.asset);
  if (a.from !== b.from) return cmpId(a.from, b.from);
  if (a.to !== b.to) return cmpId(a.to, b.to);
  if (a.amount < b.amount) return -1;
  if (a.amount > b.amount) return 1;
  return 0;
}

function minBig(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

/** Deterministic greedy settlement of a zero-sum position set (at most n-1 transfers). */
function settleGreedy(positions: readonly Position[], asset: string): Transfer[] {
  const debtors: Position[] = [];
  const creditors: Position[] = [];
  for (const p of positions) {
    if (p.bal < 0n) debtors.push({ id: p.id, bal: p.bal });
    else if (p.bal > 0n) creditors.push({ id: p.id, bal: p.bal });
  }
  debtors.sort((a, b) => cmpId(a.id, b.id));
  creditors.sort((a, b) => cmpId(a.id, b.id));

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i]!;
    const c = creditors[j]!;
    const pay = minBig(-d.bal, c.bal);
    transfers.push({ from: d.id, to: c.id, asset, amount: pay });
    d.bal += pay;
    c.bal -= pay;
    if (d.bal === 0n) i += 1;
    if (c.bal === 0n) j += 1;
  }
  return transfers;
}

/**
 * Maximum number of disjoint zero-sum groups via submask DP (accounts pre-sorted by id).
 * Also records, for each zero-sum mask, the lexicographically smallest first group submask
 * that achieves the optimum (by sorted-id key, then by submask value).
 */
function maxPartition(balances: readonly bigint[]): { best: Int32Array; firstGroup: Int32Array } {
  const n = balances.length;
  const size = 1 << n;
  const sum = new Array<bigint>(size).fill(0n);
  for (let mask = 1; mask < size; mask += 1) {
    const bit = mask & -mask;
    let i = 0;
    let b = bit;
    while ((b & 1) === 0) {
      b >>= 1;
      i += 1;
    }
    sum[mask] = sum[mask ^ bit]! + balances[i]!;
  }

  const best = new Int32Array(size);
  const firstGroup = new Int32Array(size).fill(-1);

  for (let mask = 1; mask < size; mask += 1) {
    if (sum[mask] !== 0n) continue;
    const low = mask & -mask;
    const rest = mask ^ low;
    let top = 0;
    let chosen = mask; // whole mask as one group
    let chosenKey: string | null = null;

    for (let sub = rest; ; sub = (sub - 1) & rest) {
      const group = sub | low;
      if (sum[group] === 0n) {
        const candidate = 1 + best[mask ^ group]!;
        if (candidate > top) {
          top = candidate;
          chosen = group;
          chosenKey = null;
        } else if (candidate === top) {
          // Prefer lexicographically smallest group by member indices (accounts are id-sorted).
          const key = groupKey(group, n);
          if (chosenKey === null) chosenKey = groupKey(chosen, n);
          if (key < chosenKey || (key === chosenKey && group < chosen)) {
            chosen = group;
            chosenKey = key;
          }
        }
      }
      if (sub === 0) break;
    }
    best[mask] = top;
    firstGroup[mask] = chosen;
  }

  return { best, firstGroup };
}

function groupKey(mask: number, _n: number): string {
  const parts: number[] = [];
  for (let i = 0, m = mask; m !== 0; i += 1, m >>= 1) {
    if (m & 1) parts.push(i);
  }
  return parts.join(",");
}

function settleExact(positions: Position[], asset: string): Transfer[] {
  const ordered = [...positions].filter((p) => p.bal !== 0n).sort((a, b) => cmpId(a.id, b.id));
  const n = ordered.length;
  if (n === 0) return [];
  if (n === 1) {
    // Should not happen for a conserved book; treat as nothing to settle.
    return [];
  }
  if (n > EXACT_LIMIT) {
    return settleGreedy(ordered, asset);
  }

  const balances = ordered.map((p) => p.bal);
  const { best, firstGroup } = maxPartition(balances);
  const full = (1 << n) - 1;
  if (best[full]! <= 0) {
    return settleGreedy(ordered, asset);
  }

  const transfers: Transfer[] = [];
  const groups: number[] = [];
  let mask = full;
  while (mask !== 0) {
    const group = firstGroup[mask]!;
    groups.push(group);
    mask ^= group;
  }

  // Peel groups in lexicographic order of their member-id keys for stable transfer ordering.
  groups.sort((a, b) => {
    const ka = groupKey(a, n);
    const kb = groupKey(b, n);
    return ka < kb ? -1 : ka > kb ? 1 : a - b;
  });

  for (const group of groups) {
    const members: Position[] = [];
    for (let i = 0; i < n; i += 1) {
      if (group & (1 << i)) members.push({ id: ordered[i]!.id, bal: ordered[i]!.bal });
    }
    transfers.push(...settleGreedy(members, asset));
  }

  return transfers;
}

function connectedComponents(accounts: readonly string[], edges: readonly [string, string][]): string[][] {
  const index = new Map<string, number>();
  accounts.forEach((id, i) => index.set(id, i));
  const parent = accounts.map((_, i) => i);

  const find = (x: number): number => {
    let r = x;
    while (parent[r] !== r) r = parent[r]!;
    let c = x;
    while (parent[c] !== c) {
      const next = parent[c]!;
      parent[c] = r;
      c = next;
    }
    return r;
  };
  const union = (a: number, b: number): void => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };

  for (const [a, b] of edges) {
    const ia = index.get(a);
    const ib = index.get(b);
    if (ia === undefined || ib === undefined) continue;
    union(ia, ib);
  }

  const buckets = new Map<number, string[]>();
  for (let i = 0; i < accounts.length; i += 1) {
    const root = find(i);
    const list = buckets.get(root) ?? [];
    list.push(accounts[i]!);
    buckets.set(root, list);
  }
  return [...buckets.values()];
}

function netAsset(obligations: readonly Obligation[], asset: string): Transfer[] {
  const nets = new Map<string, bigint>();
  const edgeList: [string, string][] = [];

  for (const o of obligations) {
    nets.set(o.from, (nets.get(o.from) ?? 0n) - o.amount);
    nets.set(o.to, (nets.get(o.to) ?? 0n) + o.amount);
    edgeList.push([o.from, o.to]);
  }

  const accounts = [...nets.keys()].sort(cmpId);
  const components = connectedComponents(accounts, edgeList);
  const transfers: Transfer[] = [];

  for (const members of components) {
    const positions: Position[] = [];
    for (const id of members) {
      const bal = nets.get(id) ?? 0n;
      if (bal !== 0n) positions.push({ id, bal });
    }
    if (positions.length === 0) continue;
    transfers.push(...settleExact(positions, asset));
  }

  transfers.sort(cmpTransfer);
  return transfers;
}

/** Multilateral netting: turns a batch of bilateral obligations into payments. See tests/challenge14.test.ts. */
export function netObligations(obligations: readonly Obligation[]): Transfer[] {
  if (!Array.isArray(obligations)) {
    throw new RangeError("obligations must be an array");
  }
  if (obligations.length === 0) return [];

  for (const o of obligations) validateObligation(o);

  const byAsset = new Map<string, Obligation[]>();
  for (const o of obligations) {
    const list = byAsset.get(o.asset) ?? [];
    list.push(o);
    byAsset.set(o.asset, list);
  }

  const assets = [...byAsset.keys()].sort(cmpId);
  const transfers: Transfer[] = [];
  for (const asset of assets) {
    transfers.push(...netAsset(byAsset.get(asset)!, asset));
  }
  return transfers;
}
