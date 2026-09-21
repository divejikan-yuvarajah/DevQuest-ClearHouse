export interface Trade {
  sequence: number; // strictly increasing arrival order — ties in timestamp break by this, not by insertion order
  price: bigint;
  quantity: bigint;
  timestampMs: number;
}

export interface Candle {
  bucketStartMs: number;
  open: bigint;
  high: bigint;
  low: bigint;
  close: bigint;
  volume: bigint;
  tradeCount: number;
}

/** Deterministic UTC-ms floor: Math.floor(timestampMs / resolutionMs) * resolutionMs */
export function bucketStart(timestampMs: number, resolutionMs: number): number {
  return Math.floor(timestampMs / resolutionMs) * resolutionMs;
}

interface BucketAcc {
  bucketStartMs: number;
  open: bigint;
  high: bigint;
  low: bigint;
  close: bigint;
  volume: bigint;
  tradeCount: number;
  minSequence: number;
  maxSequence: number;
}

/** Returns one candle per non-empty bucket, in ascending bucketStartMs order. */
export function aggregateCandles(trades: readonly Trade[], resolutionMs: number): Candle[] {
  if (trades.length === 0) return [];

  const buckets = new Map<number, BucketAcc>();

  for (const trade of trades) {
    const start = bucketStart(trade.timestampMs, resolutionMs);
    const existing = buckets.get(start);
    if (!existing) {
      buckets.set(start, {
        bucketStartMs: start,
        open: trade.price,
        high: trade.price,
        low: trade.price,
        close: trade.price,
        volume: trade.quantity,
        tradeCount: 1,
        minSequence: trade.sequence,
        maxSequence: trade.sequence,
      });
      continue;
    }

    if (trade.sequence < existing.minSequence) {
      existing.minSequence = trade.sequence;
      existing.open = trade.price;
    }
    if (trade.sequence > existing.maxSequence) {
      existing.maxSequence = trade.sequence;
      existing.close = trade.price;
    }
    if (trade.price > existing.high) existing.high = trade.price;
    if (trade.price < existing.low) existing.low = trade.price;
    existing.volume += trade.quantity;
    existing.tradeCount += 1;
  }

  return [...buckets.values()]
    .sort((a, b) => a.bucketStartMs - b.bucketStartMs)
    .map(({ bucketStartMs, open, high, low, close, volume, tradeCount }) => ({
      bucketStartMs,
      open,
      high,
      low,
      close,
      volume,
      tradeCount,
    }));
}

/**
 * Fill missing intermediate buckets between the first and last known candle.
 * Gap candles carry the previous close with zero volume / tradeCount.
 * Does not mutate the input array. No leading or trailing extension.
 */
export function fillGaps(candles: readonly Candle[], resolutionMs: number): Candle[] {
  if (candles.length === 0) return [];

  const ordered = [...candles].sort((a, b) => a.bucketStartMs - b.bucketStartMs);
  const byStart = new Map(ordered.map((c) => [c.bucketStartMs, c]));
  const first = ordered[0]!.bucketStartMs;
  const last = ordered[ordered.length - 1]!.bucketStartMs;

  const filled: Candle[] = [];
  let previousClose = ordered[0]!.close;

  for (let t = first; t <= last; t += resolutionMs) {
    const existing = byStart.get(t);
    if (existing) {
      filled.push({ ...existing });
      previousClose = existing.close;
    } else {
      filled.push({
        bucketStartMs: t,
        open: previousClose,
        high: previousClose,
        low: previousClose,
        close: previousClose,
        volume: 0n,
        tradeCount: 0,
      });
    }
  }

  return filled;
}

/**
 * Collapse an ordered contiguous candle series into a single OHLCV candle.
 * Open/close follow first/last candle in bucket time order.
 */
export function rollUp(candles: readonly Candle[]): Candle | null {
  if (candles.length === 0) return null;

  const ordered = [...candles].sort((a, b) => a.bucketStartMs - b.bucketStartMs);
  const first = ordered[0]!;
  const last = ordered[ordered.length - 1]!;

  let high = first.high;
  let low = first.low;
  let volume = 0n;
  let tradeCount = 0;

  for (const candle of ordered) {
    if (candle.high > high) high = candle.high;
    if (candle.low < low) low = candle.low;
    volume += candle.volume;
    tradeCount += candle.tradeCount;
  }

  return {
    bucketStartMs: first.bucketStartMs,
    open: first.open,
    high,
    low,
    close: last.close,
    volume,
    tradeCount,
  };
}

export function vwap(trades: readonly Trade[]): { price: bigint; remainder: bigint } {
  if (trades.length === 0) {
    return { price: 0n, remainder: 0n };
  }

  let weightedSum = 0n;
  let totalVolume = 0n;
  for (const trade of trades) {
    weightedSum += trade.price * trade.quantity;
    totalVolume += trade.quantity;
  }

  if (totalVolume === 0n) {
    return { price: 0n, remainder: 0n };
  }

  return {
    price: weightedSum / totalVolume,
    remainder: weightedSum % totalVolume,
  };
}
