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
 * Price-level map + sorted price index so inserts are O(levels) rather than O(orders).
 */
class BookSide {
  private readonly levels = new Map<string, RestingOrder[]>();
  /** Prices sorted best-first according to betterPrice. */
  private readonly prices: bigint[] = [];

  constructor(
    private readonly betterPrice: (a: bigint, b: bigint) => boolean,
    /** Whether a resting price would trade against an aggressor limit (undefined limit = market). */
    private readonly crossesLimit: (restingPrice: bigint, limit: bigint) => boolean
  ) {}

  insert(order: RestingOrder): void {
    const key = order.price.toString();
    let queue = this.levels.get(key);
    if (!queue) {
      queue = [];
      this.levels.set(key, queue);
      const index = this.priceInsertIndex(order.price);
      this.prices.splice(index, 0, order.price);
    }
    queue.push(order);
  }

  best(): RestingOrder | undefined {
    if (this.prices.length === 0) return undefined;
    const queue = this.levels.get(this.prices[0]!.toString());
    return queue?.[0];
  }

  removeById(id: string): RestingOrder | undefined {
    for (let priceIndex = 0; priceIndex < this.prices.length; priceIndex += 1) {
      const price = this.prices[priceIndex]!;
      const key = price.toString();
      const queue = this.levels.get(key);
      if (!queue) continue;
      const index = queue.findIndex((order) => order.id === id);
      if (index === -1) continue;
      const [removed] = queue.splice(index, 1);
      if (queue.length === 0) {
        this.levels.delete(key);
        this.prices.splice(priceIndex, 1);
      }
      return removed;
    }
    return undefined;
  }

  removeFront(): void {
    if (this.prices.length === 0) return;
    const price = this.prices[0]!;
    const key = price.toString();
    const queue = this.levels.get(key);
    if (!queue) return;
    queue.shift();
    if (queue.length === 0) {
      this.levels.delete(key);
      this.prices.shift();
    }
  }

  findById(id: string): RestingOrder | undefined {
    for (const price of this.prices) {
      const queue = this.levels.get(price.toString());
      if (!queue) continue;
      const found = queue.find((order) => order.id === id);
      if (found) return found;
    }
    return undefined;
  }

  availableLiquidity(limit: bigint | undefined, excludeAccountId: string): bigint {
    let total = 0n;
    for (const price of this.prices) {
      if (limit !== undefined && !this.crossesLimit(price, limit)) {
        break;
      }
      const queue = this.levels.get(price.toString());
      if (!queue) continue;
      for (const order of queue) {
        if (order.accountId === excludeAccountId) continue;
        total += remaining(order);
      }
    }
    return total;
  }

  snapshot(): RestingOrder[] {
    const out: RestingOrder[] = [];
    for (const price of this.prices) {
      const queue = this.levels.get(price.toString());
      if (!queue) continue;
      for (const order of queue) {
        out.push({ ...order });
      }
    }
    return out;
  }

  private priceInsertIndex(price: bigint): number {
    let low = 0;
    let high = this.prices.length;
    while (low < high) {
      const mid = (low + high) >> 1;
      const midPrice = this.prices[mid]!;
      if (this.betterPrice(price, midPrice)) {
        high = mid;
      } else if (price === midPrice) {
        return mid;
      } else {
        low = mid + 1;
      }
    }
    return low;
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
