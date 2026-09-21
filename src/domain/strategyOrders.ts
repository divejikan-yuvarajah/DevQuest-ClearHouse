export type Side = "buy" | "sell";

/** An order the engine asks the matching layer to place. */
export interface ChildOrder {
  orderId: string;
  parentId: string;
  role: string;
  side: Side;
  kind: "limit" | "market";
  price?: bigint;
  quantity: bigint;
  sequence: number;
}

export type Action = { type: "place"; order: ChildOrder } | { type: "cancel"; orderId: string; parentId: string };

interface Base {
  id: string;
  accountId: string;
  sequence: number;
  quantity: bigint;
}

export interface OcoOrder extends Base {
  kind: "oco";
  side: Side;
  limitPrice: bigint;
  stopPrice: bigint;
}

export interface BracketOrder extends Base {
  kind: "bracket";
  side: Side;
  entryPrice: bigint;
  takeProfitPrice: bigint;
  stopLossPrice: bigint;
}

export interface IcebergOrder extends Base {
  kind: "iceberg";
  side: Side;
  price: bigint;
  clipQuantity: bigint;
}

export interface TrailingStopOrder extends Base {
  kind: "trailing_stop";
  side: Side;
  offset: bigint;
  referencePrice: bigint;
}

export type StrategyOrder = OcoOrder | BracketOrder | IcebergOrder | TrailingStopOrder;

export interface Fill {
  orderId: string;
  fillId: string;
  quantity: bigint;
}

function oppositeSide(side: Side): Side {
  return side === "buy" ? "sell" : "buy";
}

function isStopHit(exitSide: Side, price: bigint, stop: bigint): boolean {
  return exitSide === "sell" ? price <= stop : price >= stop;
}

function minQty(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

function mkPlace(
  parentId: string,
  role: string,
  side: Side,
  kind: "limit" | "market",
  quantity: bigint,
  sequence: number,
  price?: bigint,
): Action {
  const order: ChildOrder = {
    orderId: `${parentId}:${role}`,
    parentId,
    role,
    side,
    kind,
    quantity,
    sequence,
  };
  if (price !== undefined) order.price = price;
  return { type: "place", order };
}

function mkCancel(parentId: string, role: string): Action {
  return { type: "cancel", orderId: `${parentId}:${role}`, parentId };
}

interface ChildState {
  parentId: string;
  role: string;
  quantity: bigint;
  filled: bigint;
  live: boolean;
}

interface BracketPair {
  k: number;
  quantity: bigint;
  tpFilled: bigint;
  armed: boolean;
}

interface OcoState {
  kind: "oco";
  order: OcoOrder;
  limitFilled: bigint;
  limitLive: boolean;
  stopFired: boolean;
  cancelled: boolean;
}

interface BracketState {
  kind: "bracket";
  order: BracketOrder;
  entryFilled: bigint;
  entryLive: boolean;
  pairs: BracketPair[];
  nextK: number;
  cancelled: boolean;
}

interface IcebergState {
  kind: "iceberg";
  order: IcebergOrder;
  clipIndex: number;
  clipSize: bigint;
  clipFilled: bigint;
  placed: bigint;
  filledTotal: bigint;
  clipLive: boolean;
  cancelled: boolean;
}

interface TrailingState {
  kind: "trailing_stop";
  order: TrailingStopOrder;
  mark: bigint;
  fired: boolean;
  cancelled: boolean;
}

type ParentState = OcoState | BracketState | IcebergState | TrailingState;

function assertOco(order: OcoOrder): void {
  if (order.quantity <= 0n) throw new RangeError("oco quantity must be positive");
  if (order.side === "sell") {
    if (order.limitPrice <= order.stopPrice) throw new RangeError("sell oco requires limitPrice > stopPrice");
  } else if (order.limitPrice >= order.stopPrice) {
    throw new RangeError("buy oco requires limitPrice < stopPrice");
  }
}

function assertBracket(order: BracketOrder): void {
  if (order.quantity <= 0n) throw new RangeError("bracket quantity must be positive");
  if (order.side === "buy") {
    if (!(order.takeProfitPrice > order.entryPrice && order.stopLossPrice < order.entryPrice)) {
      throw new RangeError("buy bracket requires takeProfit > entry > stopLoss");
    }
  } else if (!(order.takeProfitPrice < order.entryPrice && order.stopLossPrice > order.entryPrice)) {
    throw new RangeError("sell bracket requires takeProfit < entry < stopLoss");
  }
}

function assertIceberg(order: IcebergOrder): void {
  if (order.quantity <= 0n) throw new RangeError("iceberg quantity must be positive");
  if (order.clipQuantity <= 0n) throw new RangeError("iceberg clipQuantity must be positive");
  if (order.clipQuantity > order.quantity) throw new RangeError("iceberg clipQuantity must not exceed quantity");
}

function assertTrailing(order: TrailingStopOrder): void {
  if (order.quantity <= 0n) throw new RangeError("trailing quantity must be positive");
  if (order.offset <= 0n) throw new RangeError("trailing offset must be positive");
}

function trailingStop(state: TrailingState): bigint {
  return state.order.side === "sell" ? state.mark - state.order.offset : state.mark + state.order.offset;
}

/** Turns compound orders (OCO, bracket, iceberg, trailing stop) into simple child orders. See tests/challenge15.test.ts. */
export class StrategyEngine {
  private readonly parents = new Map<string, ParentState>();
  private readonly orderIds: string[] = [];
  private readonly children = new Map<string, ChildState>();
  private readonly seenFills = new Set<string>();

  submit(order: StrategyOrder): Action[] {
    if (this.parents.has(order.id)) throw new RangeError(`duplicate parent id ${order.id}`);

    switch (order.kind) {
      case "oco": {
        assertOco(order);
        this.parents.set(order.id, {
          kind: "oco",
          order,
          limitFilled: 0n,
          limitLive: true,
          stopFired: false,
          cancelled: false,
        });
        this.orderIds.push(order.id);
        this.trackChild(order.id, "limit", order.quantity);
        return [mkPlace(order.id, "limit", order.side, "limit", order.quantity, order.sequence, order.limitPrice)];
      }
      case "bracket": {
        assertBracket(order);
        this.parents.set(order.id, {
          kind: "bracket",
          order,
          entryFilled: 0n,
          entryLive: true,
          pairs: [],
          nextK: 1,
          cancelled: false,
        });
        this.orderIds.push(order.id);
        this.trackChild(order.id, "entry", order.quantity);
        return [mkPlace(order.id, "entry", order.side, "limit", order.quantity, order.sequence, order.entryPrice)];
      }
      case "iceberg": {
        assertIceberg(order);
        const clipSize = minQty(order.clipQuantity, order.quantity);
        this.parents.set(order.id, {
          kind: "iceberg",
          order,
          clipIndex: 1,
          clipSize,
          clipFilled: 0n,
          placed: clipSize,
          filledTotal: 0n,
          clipLive: true,
          cancelled: false,
        });
        this.orderIds.push(order.id);
        this.trackChild(order.id, "clip:1", clipSize);
        return [mkPlace(order.id, "clip:1", order.side, "limit", clipSize, order.sequence, order.price)];
      }
      case "trailing_stop": {
        assertTrailing(order);
        this.parents.set(order.id, {
          kind: "trailing_stop",
          order,
          mark: order.referencePrice,
          fired: false,
          cancelled: false,
        });
        this.orderIds.push(order.id);
        return [];
      }
      default: {
        const _x: never = order;
        throw new RangeError(`unknown strategy ${(_x as StrategyOrder).kind}`);
      }
    }
  }

  onFill(fill: Fill): Action[] {
    if (this.seenFills.has(fill.fillId)) return [];

    const child = this.children.get(fill.orderId);
    if (child === undefined) throw new RangeError(`unknown child order ${fill.orderId}`);
    if (fill.quantity <= 0n) throw new RangeError("fill quantity must be positive");
    if (!child.live) return [];

    const remaining = child.quantity - child.filled;
    if (fill.quantity > remaining) throw new RangeError("fill exceeds remaining quantity");

    this.seenFills.add(fill.fillId);
    child.filled += fill.quantity;
    if (child.filled === child.quantity) child.live = false;

    const parent = this.parents.get(child.parentId);
    if (parent === undefined || parent.cancelled) return [];

    if (parent.kind === "oco") return this.applyOcoFill(parent, child, fill.quantity);
    if (parent.kind === "bracket") return this.applyBracketFill(parent, child, fill.quantity);
    if (parent.kind === "iceberg") return this.applyIcebergFill(parent, child, fill.quantity);
    return [];
  }

  onMarketPrice(price: bigint): Action[] {
    const out: Action[] = [];
    for (const id of this.orderIds) {
      const parent = this.parents.get(id);
      if (parent === undefined || parent.cancelled) continue;
      if (parent.kind === "oco") out.push(...this.applyOcoPrice(parent, price));
      else if (parent.kind === "bracket") out.push(...this.applyBracketPrice(parent, price));
      else if (parent.kind === "trailing_stop") out.push(...this.applyTrailingPrice(parent, price));
    }
    return out;
  }

  cancel(parentId: string): Action[] {
    const parent = this.parents.get(parentId);
    if (parent === undefined) throw new RangeError(`unknown parent ${parentId}`);
    if (parent.cancelled) return [];
    parent.cancelled = true;

    const out: Action[] = [];
    if (parent.kind === "oco") {
      if (parent.limitLive) {
        parent.limitLive = false;
        this.kill(`${parentId}:limit`);
        out.push(mkCancel(parentId, "limit"));
      }
    } else if (parent.kind === "bracket") {
      if (parent.entryLive) {
        parent.entryLive = false;
        this.kill(`${parentId}:entry`);
        out.push(mkCancel(parentId, "entry"));
      }
      for (const pair of parent.pairs) {
        if (!pair.armed) continue;
        pair.armed = false;
        this.kill(`${parentId}:take_profit:${pair.k}`);
        out.push(mkCancel(parentId, `take_profit:${pair.k}`));
      }
    } else if (parent.kind === "iceberg") {
      if (parent.clipLive) {
        parent.clipLive = false;
        this.kill(`${parentId}:clip:${parent.clipIndex}`);
        out.push(mkCancel(parentId, `clip:${parent.clipIndex}`));
      }
    } else {
      parent.fired = true;
    }
    return out;
  }

  stopLevel(parentId: string): bigint | undefined {
    const parent = this.parents.get(parentId);
    if (parent === undefined || parent.kind !== "trailing_stop") return undefined;
    if (parent.cancelled || parent.fired) return undefined;
    return trailingStop(parent);
  }

  private trackChild(parentId: string, role: string, quantity: bigint): void {
    this.children.set(`${parentId}:${role}`, {
      parentId,
      role,
      quantity,
      filled: 0n,
      live: true,
    });
  }

  private kill(orderId: string): void {
    const child = this.children.get(orderId);
    if (child !== undefined) child.live = false;
  }

  private applyOcoFill(state: OcoState, child: ChildState, quantity: bigint): Action[] {
    if (child.role !== "limit" || state.stopFired) return [];
    state.limitFilled += quantity;
    if (state.limitFilled >= state.order.quantity) state.limitLive = false;
    return [];
  }

  private applyOcoPrice(state: OcoState, price: bigint): Action[] {
    if (state.stopFired) return [];
    const remaining = state.order.quantity - state.limitFilled;
    if (remaining <= 0n) return [];
    if (!isStopHit(state.order.side, price, state.order.stopPrice)) return [];

    state.stopFired = true;
    const out: Action[] = [];
    if (state.limitLive) {
      state.limitLive = false;
      this.kill(`${state.order.id}:limit`);
      out.push(mkCancel(state.order.id, "limit"));
    }
    this.trackChild(state.order.id, "stop", remaining);
    this.kill(`${state.order.id}:stop`);
    out.push(mkPlace(state.order.id, "stop", state.order.side, "market", remaining, state.order.sequence));
    return out;
  }

  private applyBracketFill(state: BracketState, child: ChildState, quantity: bigint): Action[] {
    if (child.role === "entry") {
      if (!state.entryLive) return [];
      state.entryFilled += quantity;
      if (state.entryFilled >= state.order.quantity) state.entryLive = false;

      const k = state.nextK;
      state.nextK += 1;
      state.pairs.push({ k, quantity, tpFilled: 0n, armed: true });
      this.trackChild(state.order.id, `take_profit:${k}`, quantity);
      const exit = oppositeSide(state.order.side);
      return [
        mkPlace(
          state.order.id,
          `take_profit:${k}`,
          exit,
          "limit",
          quantity,
          state.order.sequence,
          state.order.takeProfitPrice,
        ),
      ];
    }

    const match = /^take_profit:(\d+)$/.exec(child.role);
    if (match === null) return [];
    const k = Number(match[1]);
    const pair = state.pairs.find((p) => p.k === k);
    if (pair === undefined || !pair.armed) return [];
    pair.tpFilled += quantity;
    if (pair.tpFilled >= pair.quantity) pair.armed = false;
    return [];
  }

  private applyBracketPrice(state: BracketState, price: bigint): Action[] {
    const exit = oppositeSide(state.order.side);
    const out: Action[] = [];
    let any = false;

    for (const pair of state.pairs) {
      if (!pair.armed || !isStopHit(exit, price, state.order.stopLossPrice)) continue;
      pair.armed = false;
      any = true;
      this.kill(`${state.order.id}:take_profit:${pair.k}`);
      out.push(mkCancel(state.order.id, `take_profit:${pair.k}`));
      const remaining = pair.quantity - pair.tpFilled;
      if (remaining > 0n) {
        this.trackChild(state.order.id, `stop_loss:${pair.k}`, remaining);
        this.kill(`${state.order.id}:stop_loss:${pair.k}`);
        out.push(mkPlace(state.order.id, `stop_loss:${pair.k}`, exit, "market", remaining, state.order.sequence));
      }
    }

    if (any && state.entryLive) {
      state.entryLive = false;
      this.kill(`${state.order.id}:entry`);
      out.push(mkCancel(state.order.id, "entry"));
    }
    return out;
  }

  private applyIcebergFill(state: IcebergState, child: ChildState, quantity: bigint): Action[] {
    if (!state.clipLive) return [];
    if (child.role !== `clip:${state.clipIndex}`) return [];

    state.clipFilled += quantity;
    state.filledTotal += quantity;
    if (state.clipFilled < state.clipSize) return [];

    state.clipLive = false;
    if (state.placed >= state.order.quantity) return [];

    const nextSize = minQty(state.order.clipQuantity, state.order.quantity - state.placed);
    if (nextSize <= 0n) return [];

    state.clipIndex += 1;
    state.clipSize = nextSize;
    state.clipFilled = 0n;
    state.placed += nextSize;
    state.clipLive = true;
    this.trackChild(state.order.id, `clip:${state.clipIndex}`, nextSize);
    return [
      mkPlace(
        state.order.id,
        `clip:${state.clipIndex}`,
        state.order.side,
        "limit",
        nextSize,
        state.order.sequence,
        state.order.price,
      ),
    ];
  }

  private applyTrailingPrice(state: TrailingState, price: bigint): Action[] {
    if (state.fired) return [];

    if (state.order.side === "sell") {
      if (price > state.mark) state.mark = price;
    } else if (price < state.mark) {
      state.mark = price;
    }

    const stop = trailingStop(state);
    if (!isStopHit(state.order.side, price, stop)) return [];

    state.fired = true;
    this.trackChild(state.order.id, "trigger", state.order.quantity);
    this.kill(`${state.order.id}:trigger`);
    return [mkPlace(state.order.id, "trigger", state.order.side, "market", state.order.quantity, state.order.sequence)];
  }
}
