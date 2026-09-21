import { OrderBook, remainingQuantity, type RestingOrder, type Side, type TimeInForce } from "./orderBook.js";

export interface Trade {
  buyOrderId: string;
  sellOrderId: string;
  price: bigint; // always the resting (maker) order's price
  quantity: bigint;
}

export interface Cancellation {
  orderId: string;
  reason: "self_trade_prevention";
}

export interface IncomingOrder {
  id: string;
  accountId: string;
  side: Side;
  price?: bigint; // absent for a market order
  quantity: bigint;
  timeInForce: TimeInForce;
  sequence: number;
  orderType?: "limit" | "market" | "stop" | "stop_limit"; // defaults to "limit" (price set) or "market" (no price) when absent
  stopPrice?: bigint; // required when orderType is "stop" or "stop_limit"
}

export interface SubmitResult {
  trades: Trade[];
  cancellations: Cancellation[];
  restingOrder: RestingOrder | null; // non-null only if quantity remains and it joined the book
  rejected: boolean;
  rejectionReason?: "would_cross" | "insufficient_liquidity_for_fill_or_kill";
}

function crosses(aggressorSide: Side, aggressorPrice: bigint | undefined, restingPrice: bigint): boolean {
  if (aggressorPrice === undefined) return true;
  return aggressorSide === "buy" ? aggressorPrice >= restingPrice : aggressorPrice <= restingPrice;
}

export function submitOrder(book: OrderBook, incoming: IncomingOrder): SubmitResult {
  const opposite = book.oppositeSideFor(incoming.side);
  const trades: Trade[] = [];
  const cancellations: Cancellation[] = [];

  // POST_ONLY: reject before any book mutation if it would cross immediately.
  if (incoming.timeInForce === "POST_ONLY") {
    const best = opposite.best();
    if (best && crosses(incoming.side, incoming.price, best.price)) {
      return { trades: [], cancellations: [], restingOrder: null, rejected: true, rejectionReason: "would_cross" };
    }
  }

  // FOK: non-mutating liquidity preflight (excludes same-account; limit/market via availableLiquidity).
  if (incoming.timeInForce === "FOK") {
    const liquidity = opposite.availableLiquidity(incoming.price, incoming.accountId);
    if (liquidity < incoming.quantity) {
      return {
        trades: [],
        cancellations: [],
        restingOrder: null,
        rejected: true,
        rejectionReason: "insufficient_liquidity_for_fill_or_kill",
      };
    }
  }

  let remaining = incoming.quantity;

  while (remaining > 0n) {
    const best = opposite.best();
    if (!best || !crosses(incoming.side, incoming.price, best.price)) {
      break;
    }

    // STP: cancel resting maker, keep aggressor, continue (not a trade; not an IOC-remainder cancel).
    if (best.accountId === incoming.accountId) {
      opposite.removeFront();
      cancellations.push({ orderId: best.id, reason: "self_trade_prevention" });
      continue;
    }

    const makerRemaining = remainingQuantity(best);
    if (makerRemaining <= 0n) {
      opposite.removeFront();
      continue;
    }

    const tradeQty = remaining < makerRemaining ? remaining : makerRemaining;
    if (tradeQty <= 0n) {
      break;
    }

    best.filled += tradeQty;
    remaining -= tradeQty;

    trades.push({
      buyOrderId: incoming.side === "buy" ? incoming.id : best.id,
      sellOrderId: incoming.side === "buy" ? best.id : incoming.id,
      price: best.price, // always resting maker price
      quantity: tradeQty,
    });

    if (remainingQuantity(best) === 0n) {
      opposite.removeFront();
    }
    // else: maker stays at same price / FIFO position with updated filled
  }

  const mayRest =
    remaining > 0n &&
    incoming.price !== undefined &&
    incoming.timeInForce !== "IOC" &&
    incoming.timeInForce !== "FOK";

  if (!mayRest) {
    return { trades, cancellations, restingOrder: null, rejected: false };
  }

  // quantity stays original; filled is cumulative matched so far (do not rest only the remainder as quantity)
  const filled = incoming.quantity - remaining;
  const restingOrder: RestingOrder = {
    id: incoming.id,
    accountId: incoming.accountId,
    side: incoming.side,
    price: incoming.price!,
    quantity: incoming.quantity,
    filled,
    sequence: incoming.sequence,
    timeInForce: incoming.timeInForce,
  };
  book.sideFor(incoming.side).insert(restingOrder);
  return { trades, cancellations, restingOrder, rejected: false };
}

export interface CancelResult {
  cancelled: RestingOrder | null;
}

export function cancelOrder(book: OrderBook, side: Side, orderId: string): CancelResult {
  const cancelled = book.sideFor(side).removeById(orderId) ?? null;
  return { cancelled };
}

export interface AmendResult {
  amended: RestingOrder | null;
}

export function amendOrder(
  book: OrderBook,
  side: Side,
  orderId: string,
  newPrice: bigint | undefined,
  newQuantity: bigint | undefined,
  newSequence: number
): AmendResult {
  const bookSide = book.sideFor(side);
  const existing = bookSide.findById(orderId);
  if (!existing) {
    return { amended: null };
  }

  const nextPrice = newPrice !== undefined ? newPrice : existing.price;
  const nextQuantity = newQuantity !== undefined ? newQuantity : existing.quantity;

  if (nextQuantity <= 0n || nextQuantity <= existing.filled) {
    return { amended: null };
  }

  const priceChanged = nextPrice !== existing.price;
  const quantityIncreased = nextQuantity > existing.quantity;

  if (!priceChanged && !quantityIncreased) {
    // Quantity decrease (or no-op): preserve exact queue position.
    existing.quantity = nextQuantity;
    return { amended: existing };
  }

  bookSide.removeById(orderId);
  existing.price = nextPrice;
  existing.quantity = nextQuantity;
  existing.sequence = newSequence;
  bookSide.insert(existing);
  return { amended: existing };
}
