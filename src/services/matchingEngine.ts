import { OrderBook, type Side } from "../domain/orderBook.js";
import {
  submitOrder,
  cancelOrder,
  amendOrder,
  type IncomingOrder,
  type SubmitResult,
} from "../domain/matching.js";

const books = new Map<string, OrderBook>();
const registry = new Map<string, { market: string; side: Side }>(); // orderId -> where to find it, for cancel

let sequenceCounter = 0;
function nextSequence(): number {
  sequenceCounter += 1;
  return sequenceCounter;
}

function bookFor(market: string): OrderBook {
  let book = books.get(market);
  if (!book) {
    book = new OrderBook();
    books.set(market, book);
  }
  return book;
}

interface PendingStop {
  order: IncomingOrder;
}

const pendingStops = new Map<string, PendingStop[]>();
const lastTradePrices = new Map<string, bigint>();

function shouldTriggerStop(market: string, side: Side, stopPrice: bigint): boolean {
  const last = lastTradePrices.get(market);
  if (last === undefined) return false;
  return side === "buy" ? last >= stopPrice : last <= stopPrice;
}

function toLiveOrder(order: IncomingOrder): IncomingOrder {
  if (order.orderType === "stop") {
    return {
      ...order,
      orderType: "market",
      price: undefined,
      timeInForce: order.timeInForce === "POST_ONLY" ? "GTC" : order.timeInForce,
    };
  }
  // stop_limit → limit at its limit price
  return {
    ...order,
    orderType: "limit",
    timeInForce: order.timeInForce === "POST_ONLY" ? "GTC" : order.timeInForce,
  };
}

function recordLastTrade(market: string, trades: SubmitResult["trades"]): void {
  if (trades.length === 0) return;
  const last = trades[trades.length - 1]!;
  lastTradePrices.set(market, last.price);
}

function applyResultToRegistry(market: string, side: Side, orderId: string, result: SubmitResult): void {
  for (const cancellation of result.cancellations) {
    registry.delete(cancellation.orderId);
  }
  for (const trade of result.trades) {
    const makerId = side === "buy" ? trade.sellOrderId : trade.buyOrderId;
    if (makerId !== orderId) {
      // Maker may be fully filled and gone from the book.
      const location = registry.get(makerId);
      if (location) {
        const stillThere = bookFor(location.market).sideFor(location.side).findById(makerId);
        if (!stillThere) registry.delete(makerId);
      }
    }
  }
  if (result.restingOrder) {
    registry.set(orderId, { market, side });
  } else {
    registry.delete(orderId);
  }
}

function executeLive(market: string, order: IncomingOrder): SubmitResult {
  const book = bookFor(market);
  const result = submitOrder(book, order);
  applyResultToRegistry(market, order.side, order.id, result);
  recordLastTrade(market, result.trades);
  return result;
}

function drainTriggeredStops(market: string): void {
  const pending = pendingStops.get(market);
  if (!pending || pending.length === 0) return;

  let progressed = true;
  while (progressed) {
    progressed = false;
    for (let i = 0; i < pending.length; ) {
      const candidate = pending[i]!;
      const stopPrice = candidate.order.stopPrice;
      if (stopPrice === undefined || !shouldTriggerStop(market, candidate.order.side, stopPrice)) {
        i += 1;
        continue;
      }
      pending.splice(i, 1);
      executeLive(market, toLiveOrder(candidate.order));
      progressed = true;
      // Restart from the front so original submission order is preserved among remaining.
      break;
    }
  }
}

export function placeOrder(market: string, order: Omit<IncomingOrder, "sequence">): SubmitResult {
  const sequenced: IncomingOrder = { ...order, sequence: nextSequence() };

  if (order.orderType === "stop" || order.orderType === "stop_limit") {
    if (!order.stopPrice) {
      return { trades: [], cancellations: [], restingOrder: null, rejected: true, rejectionReason: "would_cross" };
    }

    if (!shouldTriggerStop(market, order.side, order.stopPrice)) {
      const list = pendingStops.get(market) ?? [];
      list.push({ order: sequenced });
      pendingStops.set(market, list);
      return { trades: [], cancellations: [], restingOrder: null, rejected: false };
    }

    const result = executeLive(market, toLiveOrder(sequenced));
    drainTriggeredStops(market);
    return result;
  }

  const result = executeLive(market, sequenced);
  drainTriggeredStops(market);
  return result;
}

export function cancel(orderId: string): { found: boolean; cancelled: boolean } {
  const location = registry.get(orderId);
  if (!location) {
    // May be a pending stop
    for (const [market, list] of pendingStops) {
      const index = list.findIndex((entry) => entry.order.id === orderId);
      if (index !== -1) {
        list.splice(index, 1);
        if (list.length === 0) pendingStops.delete(market);
        return { found: true, cancelled: true };
      }
    }
    return { found: false, cancelled: false };
  }

  const book = bookFor(location.market);
  const { cancelled } = cancelOrder(book, location.side, orderId);
  registry.delete(orderId);
  return { found: true, cancelled: cancelled !== null };
}

export function bestPrices(market: string): { bestBid: string | null; bestAsk: string | null } {
  const book = books.get(market);
  return {
    bestBid: book?.bestBid()?.toString() ?? null,
    bestAsk: book?.bestAsk()?.toString() ?? null,
  };
}

// Aggregated depth for the dashboard: one entry per price level, best price first, with the remaining
// (unfilled) quantity of every resting order at that price summed.
export function depth(market: string): { bids: { price: string; quantity: string }[]; asks: { price: string; quantity: string }[] } {
  const book = books.get(market);
  const levels = (orders: { price: bigint; quantity: bigint; filled: bigint }[]): { price: string; quantity: string }[] => {
    const byPrice = new Map<string, bigint>();
    for (const order of orders) {
      const key = order.price.toString();
      byPrice.set(key, (byPrice.get(key) ?? 0n) + (order.quantity - order.filled));
    }
    return [...byPrice.entries()].map(([price, quantity]) => ({ price, quantity: quantity.toString() }));
  };
  return { bids: levels(book?.bids.snapshot() ?? []), asks: levels(book?.asks.snapshot() ?? []) };
}

export interface TradeRecord {
  market: string;
  buyOrderId: string;
  sellOrderId: string;
  buyAccountId: string | null;
  sellAccountId: string | null;
  takerSide: "buy" | "sell";
  price: string;
  quantity: string;
  timestampMs: number;
}

const orderAccounts = new Map<string, string>();

export function rememberOrder(orderId: string, accountId: string): void {
  orderAccounts.set(orderId, accountId);
}

export function marketOf(orderId: string): string | undefined {
  const location = registry.get(orderId);
  if (location) return location.market;
  for (const [market, list] of pendingStops) {
    if (list.some((entry) => entry.order.id === orderId)) return market;
  }
  return undefined;
}

const tradeLog: TradeRecord[] = [];
const MAX_TRADE_LOG = 200;

export function recordTrades(market: string, trades: { buyOrderId: string; sellOrderId: string; price: bigint; quantity: bigint }[], takerSide: "buy" | "sell"): void {
  for (const trade of trades) {
    tradeLog.push({
      market,
      buyOrderId: trade.buyOrderId,
      sellOrderId: trade.sellOrderId,
      buyAccountId: orderAccounts.get(trade.buyOrderId) ?? null,
      sellAccountId: orderAccounts.get(trade.sellOrderId) ?? null,
      takerSide,
      price: trade.price.toString(),
      quantity: trade.quantity.toString(),
      timestampMs: Date.now(),
    });
  }
  if (tradeLog.length > MAX_TRADE_LOG) tradeLog.splice(0, tradeLog.length - MAX_TRADE_LOG);
}

export function recentTrades(limit: number): TradeRecord[] {
  return tradeLog.slice(-limit).reverse();
}

export function isCrossed(market: string): boolean {
  return books.get(market)?.isCrossed() ?? false;
}

export function resetAllBooks(): void {
  books.clear();
  registry.clear();
  tradeLog.length = 0;
  orderAccounts.clear();
  sequenceCounter = 0;
  pendingStops.clear();
  lastTradePrices.clear();
}

export function amend(
  orderId: string,
  newPrice: bigint | undefined,
  newQuantity: bigint | undefined
): { found: boolean; amended: import("../domain/matching.js").AmendResult["amended"] } {
  const location = registry.get(orderId);
  if (!location) return { found: false, amended: null };

  const book = bookFor(location.market);
  const { amended } = amendOrder(book, location.side, orderId, newPrice, newQuantity, nextSequence());
  if (!amended) {
    // Order may have disappeared between lookup and amend, or invalid quantity.
    const stillThere = book.sideFor(location.side).findById(orderId);
    if (!stillThere) {
      registry.delete(orderId);
      return { found: false, amended: null };
    }
    return { found: true, amended: null };
  }
  return { found: true, amended };
}
