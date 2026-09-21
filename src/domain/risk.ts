export type RiskViolation = "MAX_NOTIONAL" | "MAX_OPEN_ORDERS" | "MAX_POSITION";

export interface RiskLimits {
  maxNotional: bigint;
  maxOpenOrders: number;
  maxPositionAbs: bigint;
}

export interface RiskState {
  openOrderCount: number;
  committedExposure: bigint;
}

export interface OrderForRiskCheck {
  side: "buy" | "sell";
  price: bigint | undefined;
  quantity: bigint;
  willRest: boolean;
}

export function firstViolatedRule(state: RiskState, limits: RiskLimits, order: OrderForRiskCheck): RiskViolation | null {
  if (order.price !== undefined) {
    const notional = order.price * order.quantity;
    if (notional > limits.maxNotional) {
      return "MAX_NOTIONAL";
    }
  }

  if (!order.willRest) {
    return null;
  }

  if (state.openOrderCount >= limits.maxOpenOrders) {
    return "MAX_OPEN_ORDERS";
  }

  const delta = order.side === "buy" ? order.quantity : -order.quantity;
  const nextExposure = state.committedExposure + delta;
  const absExposure = nextExposure < 0n ? -nextExposure : nextExposure;
  if (absExposure > limits.maxPositionAbs) {
    return "MAX_POSITION";
  }

  return null;
}

export function reserve(state: RiskState, order: OrderForRiskCheck): RiskState {
  if (!order.willRest) return state;
  const delta = order.side === "buy" ? order.quantity : -order.quantity;
  return {
    openOrderCount: state.openOrderCount + 1,
    committedExposure: state.committedExposure + delta,
  };
}

export function release(state: RiskState, side: "buy" | "sell", quantity: bigint): RiskState {
  const delta = side === "buy" ? quantity : -quantity;
  return {
    openOrderCount: state.openOrderCount - 1,
    committedExposure: state.committedExposure - delta,
  };
}
