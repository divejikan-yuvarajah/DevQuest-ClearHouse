export type Side = "buy" | "sell";
export type TimeInForce = "GTC" | "IOC" | "FOK" | "POST_ONLY";

export interface RestingOrder {
  id: string;
  accountId: string;
  side: Side;
  price: bigint; // resting orders always carry a limit price
  quantity: bigint;
  filled: bigint;
  sequence: number; // insertion order, for FIFO within a price level
  timeInForce: TimeInForce;
}

function remaining(order: RestingOrder): bigint {
  return order.quantity - order.filled;
}

/**
 * Indexed binary heap: O(log n) insert / remove-best / remove-by-id,
 * O(1) best and same-priority quantity updates. Comparator is price-time.
 */
class BookSide {
  private readonly heap: RestingOrder[] = [];
  private readonly indexById = new Map<string, number>();

  constructor(
    private readonly betterPrice: (a: bigint, b: bigint) => boolean,
    /** Whether a resting price would trade against an aggressor limit (undefined limit = market). */
    private readonly crossesLimit: (restingPrice: bigint, limit: bigint) => boolean
  ) {}

  private isBetter(a: RestingOrder, b: RestingOrder): boolean {
    if (a.price !== b.price) return this.betterPrice(a.price, b.price);
    return a.sequence < b.sequence;
  }

  private swap(i: number, j: number): void {
    const a = this.heap[i]!;
    const b = this.heap[j]!;
    this.heap[i] = b;
    this.heap[j] = a;
    this.indexById.set(b.id, i);
    this.indexById.set(a.id, j);
  }

  private siftUp(index: number): void {
    let i = index;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.isBetter(this.heap[i]!, this.heap[parent]!)) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  private siftDown(index: number): void {
    let i = index;
    const n = this.heap.length;
    for (;;) {
      const left = i * 2 + 1;
      const right = left + 1;
      let best = i;
      if (left < n && this.isBetter(this.heap[left]!, this.heap[best]!)) best = left;
      if (right < n && this.isBetter(this.heap[right]!, this.heap[best]!)) best = right;
      if (best === i) break;
      this.swap(i, best);
      i = best;
    }
  }

  private removeAt(index: number): RestingOrder {
    const removed = this.heap[index]!;
    this.indexById.delete(removed.id);
    const last = this.heap.pop();
    if (last === undefined || index === this.heap.length) {
      return removed;
    }
    this.heap[index] = last;
    this.indexById.set(last.id, index);
    this.siftUp(index);
    this.siftDown(index);
    return removed;
  }

  insert(order: RestingOrder): void {
    const index = this.heap.length;
    this.heap.push(order);
    this.indexById.set(order.id, index);
    this.siftUp(index);
  }

  best(): RestingOrder | undefined {
    return this.heap[0];
  }

  removeById(id: string): RestingOrder | undefined {
    const index = this.indexById.get(id);
    if (index === undefined) return undefined;
    return this.removeAt(index);
  }

  removeFront(): void {
    if (this.heap.length === 0) return;
    this.removeAt(0);
  }

  findById(id: string): RestingOrder | undefined {
    const index = this.indexById.get(id);
    if (index === undefined) return undefined;
    return this.heap[index];
  }

  availableLiquidity(limit: bigint | undefined, excludeAccountId: string): bigint {
    let total = 0n;
    for (const order of this.heap) {
      if (limit !== undefined && !this.crossesLimit(order.price, limit)) continue;
      if (order.accountId === excludeAccountId) continue;
      total += remaining(order);
    }
    return total;
  }

  /** Canonical price-time order (best price first, then earlier sequence); defensive copies. */
  snapshot(): RestingOrder[] {
    return this.heap
      .map((order) => ({ ...order }))
      .sort((a, b) => {
        if (a.price !== b.price) return this.betterPrice(a.price, b.price) ? -1 : 1;
        return a.sequence - b.sequence;
      });
  }
}

export class OrderBook {
  readonly bids = new BookSide(
    (a, b) => a > b,
    (restingPrice, limit) => restingPrice >= limit
  );
  readonly asks = new BookSide(
    (a, b) => a < b,
    (restingPrice, limit) => restingPrice <= limit
  );

  sideFor(side: Side): BookSide {
    return side === "buy" ? this.bids : this.asks;
  }

  oppositeSideFor(side: Side): BookSide {
    return side === "buy" ? this.asks : this.bids;
  }

  bestBid(): bigint | undefined {
    return this.bids.best()?.price;
  }

  bestAsk(): bigint | undefined {
    return this.asks.best()?.price;
  }

  isCrossed(): boolean {
    const bid = this.bestBid();
    const ask = this.bestAsk();
    return bid !== undefined && ask !== undefined && bid >= ask;
  }
}

export function remainingQuantity(order: RestingOrder): bigint {
  return remaining(order);
}
