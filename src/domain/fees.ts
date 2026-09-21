/** One volume tier. Rates are integer basis points; a negative rate is a rebate. */
export interface FeeTier {
  minVolume: bigint;
  makerBps: bigint;
  takerBps: bigint;
}

export interface FeeOptions {
  feeAccount: string;
  windowMs: number;
}

export interface FeeFill {
  fillId: string;
  timestampMs: number;
  makerAccount: string;
  takerAccount: string;
  asset: string;
  notional: bigint;
}

export interface LedgerLine {
  account: string;
  asset: string;
  amount: bigint;
}

export interface LedgerEntry {
  entryId: string;
  lines: LedgerLine[];
}

export interface FeeResult {
  fillId: string;
  makerFee: bigint;
  takerFee: bigint;
  entries: LedgerEntry[];
}

const BPS_DENOMINATOR = 10_000n;

/** Round-half-to-even division for a non-negative numerator. */
function halfEvenDivide(numerator: bigint, denominator: bigint): bigint {
  const up = (2n * numerator + denominator) / (2n * denominator);
  const isTie = (2n * numerator) % (2n * denominator) === denominator;
  return isTie && up % 2n === 1n ? up - 1n : up;
}

/** Exact fee in minor units: sign(bps) * halfEven(|notional * bps| / 10_000). */
export function computeFee(notional: bigint, bps: bigint): bigint {
  if (bps === 0n || notional === 0n) return 0n;
  if (bps < 0n) return -halfEvenDivide(notional * -bps, BPS_DENOMINATOR);
  return halfEvenDivide(notional * bps, BPS_DENOMINATOR);
}

interface VolumePoint {
  timestampMs: number;
  notional: bigint;
}

interface RollingVolume {
  points: VolumePoint[];
  head: number;
  total: bigint;
}

function createRolling(): RollingVolume {
  return { points: [], head: 0, total: 0n };
}

/** Expire points with timestampMs <= atMs - windowMs (keep timestampMs > atMs - windowMs). */
function expire(state: RollingVolume, atMs: number, windowMs: number): void {
  const cutoff = atMs - windowMs;
  const { points } = state;
  let { head } = state;
  while (head < points.length && points[head]!.timestampMs <= cutoff) {
    state.total -= points[head]!.notional;
    head += 1;
  }
  state.head = head;
  if (head > 64 && head * 2 >= points.length) {
    state.points = points.slice(head);
    state.head = 0;
  }
}

function append(state: RollingVolume, timestampMs: number, notional: bigint): void {
  state.points.push({ timestampMs, notional });
  state.total += notional;
}

function volumeOf(state: RollingVolume | undefined, atMs: number, windowMs: number): bigint {
  if (!state) return 0n;
  expire(state, atMs, windowMs);
  return state.total;
}

function selectTier(schedule: readonly FeeTier[], volume: bigint): FeeTier {
  let chosen = schedule[0]!;
  for (let i = 1; i < schedule.length; i += 1) {
    const tier = schedule[i]!;
    if (tier.minVolume <= volume) chosen = tier;
    else break;
  }
  return chosen;
}

function validateSchedule(schedule: readonly FeeTier[]): FeeTier[] {
  if (schedule.length === 0) throw new RangeError("fee schedule must not be empty");
  if (schedule[0]!.minVolume !== 0n) throw new RangeError("fee schedule must start at minVolume 0");
  const copy: FeeTier[] = [{ minVolume: schedule[0]!.minVolume, makerBps: schedule[0]!.makerBps, takerBps: schedule[0]!.takerBps }];
  for (let i = 1; i < schedule.length; i += 1) {
    const prev = schedule[i - 1]!;
    const tier = schedule[i]!;
    if (tier.minVolume <= prev.minVolume) {
      throw new RangeError("fee schedule minVolume values must be strictly increasing");
    }
    copy.push({ minVolume: tier.minVolume, makerBps: tier.makerBps, takerBps: tier.takerBps });
  }
  return copy;
}

function validateOptions(options: FeeOptions): FeeOptions {
  if (typeof options.windowMs !== "number" || !Number.isFinite(options.windowMs) || !Number.isInteger(options.windowMs) || options.windowMs <= 0) {
    throw new RangeError("windowMs must be a positive integer");
  }
  if (typeof options.feeAccount !== "string" || options.feeAccount.length === 0) {
    throw new RangeError("feeAccount must be a non-empty string");
  }
  return { feeAccount: options.feeAccount, windowMs: options.windowMs };
}

function buildEntry(entryId: string, account: string, feeAccount: string, asset: string, fee: bigint): LedgerEntry {
  return {
    entryId,
    lines: [
      { account, asset, amount: -fee },
      { account: feeAccount, asset, amount: fee },
    ],
  };
}

/** Maker/taker fee engine. See tests/challenge16.test.ts. */
export class FeeEngine {
  private readonly schedule: FeeTier[];
  private readonly feeAccount: string;
  private readonly windowMs: number;
  private readonly volumes = new Map<string, RollingVolume>();
  private readonly processed = new Map<string, FeeResult>();
  private lastTimestampMs: number | undefined;

  constructor(schedule: readonly FeeTier[], options: FeeOptions) {
    this.schedule = validateSchedule(schedule);
    const opts = validateOptions(options);
    this.feeAccount = opts.feeAccount;
    this.windowMs = opts.windowMs;
  }

  processFill(fill: FeeFill): FeeResult {
    const prior = this.processed.get(fill.fillId);
    if (prior !== undefined) return prior;

    if (fill.notional <= 0n) throw new RangeError("notional must be positive");
    if (fill.makerAccount.length === 0) throw new RangeError("makerAccount must be non-empty");
    if (fill.takerAccount.length === 0) throw new RangeError("takerAccount must be non-empty");
    if (fill.makerAccount === fill.takerAccount) throw new RangeError("maker and taker must differ");
    if (this.lastTimestampMs !== undefined && fill.timestampMs < this.lastTimestampMs) {
      throw new RangeError("fill timestamp must not move backwards");
    }

    const makerState = this.volumes.get(fill.makerAccount) ?? createRolling();
    const takerState = this.volumes.get(fill.takerAccount) ?? createRolling();
    if (!this.volumes.has(fill.makerAccount)) this.volumes.set(fill.makerAccount, makerState);
    if (!this.volumes.has(fill.takerAccount)) this.volumes.set(fill.takerAccount, takerState);

    const makerVolume = volumeOf(makerState, fill.timestampMs, this.windowMs);
    const takerVolume = volumeOf(takerState, fill.timestampMs, this.windowMs);
    const makerTier = selectTier(this.schedule, makerVolume);
    const takerTier = selectTier(this.schedule, takerVolume);

    const makerFee = computeFee(fill.notional, makerTier.makerBps);
    const takerFee = computeFee(fill.notional, takerTier.takerBps);

    const entries: LedgerEntry[] = [];
    if (makerFee !== 0n) {
      entries.push(buildEntry(`${fill.fillId}:maker`, fill.makerAccount, this.feeAccount, fill.asset, makerFee));
    }
    if (takerFee !== 0n) {
      entries.push(buildEntry(`${fill.fillId}:taker`, fill.takerAccount, this.feeAccount, fill.asset, takerFee));
    }

    append(makerState, fill.timestampMs, fill.notional);
    append(takerState, fill.timestampMs, fill.notional);
    this.lastTimestampMs = fill.timestampMs;

    const result: FeeResult = {
      fillId: fill.fillId,
      makerFee,
      takerFee,
      entries,
    };
    this.processed.set(fill.fillId, result);
    return result;
  }

  trailingVolume(account: string, atMs: number): bigint {
    return volumeOf(this.volumes.get(account), atMs, this.windowMs);
  }
}
