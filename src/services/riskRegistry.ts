import type { RiskLimits, RiskState } from "../domain/risk.js";

const DEFAULT_LIMITS: RiskLimits = { maxNotional: 10_000_000n, maxOpenOrders: 50, maxPositionAbs: 1_000_000n };

function copyLimits(limits: RiskLimits): RiskLimits {
  return {
    maxNotional: limits.maxNotional,
    maxOpenOrders: limits.maxOpenOrders,
    maxPositionAbs: limits.maxPositionAbs,
  };
}

function emptyState(): RiskState {
  return { openOrderCount: 0, committedExposure: 0n };
}

const states = new Map<string, RiskState>();
const limitsByAccount = new Map<string, RiskLimits>();
let killSwitchEngaged = false;

export function getState(accountId: string): RiskState {
  const existing = states.get(accountId);
  if (!existing) {
    return emptyState();
  }
  return { openOrderCount: existing.openOrderCount, committedExposure: existing.committedExposure };
}

export function setState(accountId: string, state: RiskState): void {
  states.set(accountId, { openOrderCount: state.openOrderCount, committedExposure: state.committedExposure });
}

export function getLimits(accountId: string): RiskLimits {
  const custom = limitsByAccount.get(accountId);
  return custom ? copyLimits(custom) : copyLimits(DEFAULT_LIMITS);
}

export function setLimits(accountId: string, limits: RiskLimits): void {
  limitsByAccount.set(accountId, copyLimits(limits));
}

export function isKillSwitchEngaged(): boolean {
  return killSwitchEngaged;
}

export function setKillSwitch(engaged: boolean): void {
  killSwitchEngaged = engaged;
}

interface Reservation {
  accountId: string;
  side: "buy" | "sell";
  quantity: bigint;
}

const reservations = new Map<string, Reservation>();

export function registerReservation(orderId: string, reservation: Reservation): void {
  reservations.set(orderId, { ...reservation });
}

export function takeReservation(orderId: string): Reservation | undefined {
  const reservation = reservations.get(orderId);
  if (!reservation) return undefined;
  reservations.delete(orderId);
  return reservation;
}

export function resetAll(): void {
  states.clear();
  limitsByAccount.clear();
  reservations.clear();
  killSwitchEngaged = false;
}
