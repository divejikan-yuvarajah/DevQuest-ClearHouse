/**
 * Deterministic in-memory demo market bootstrap for competition presentation.
 *
 * Persistent accounts/funding live in `db/seeds/01_initial_accounts.ts`.
 * Matching-engine books, risk reservations, trade history, and WebSocket
 * deltas are process-local — they cannot be written by the Knex seed.
 *
 * Activate with: CLEARHOUSE_DEMO_MARKET=1 npm start
 * (skipped automatically when NODE_ENV=test)
 *
 * Flow: real risk.tryAdmit → engine.placeOrder → recordTrades → publishBookChange
 * No frontend hardcoding; no direct book map mutation.
 */

import * as engine from "../services/matchingEngine.js";
import * as risk from "../services/riskRegistry.js";
import { publishBookChange } from "../services/marketFeed.js";
import type { Side, TimeInForce } from "../domain/orderBook.js";

export const DEMO_MARKET = "BTC-USD";

const ATLAS = "a0000000-0000-4000-8000-000000000101";
const NOVA = "a0000000-0000-4000-8000-000000000102";
const MERIDIAN = "a0000000-0000-4000-8000-000000000103";
const ORION = "a0000000-0000-4000-8000-000000000104";
const VERTEX = "a0000000-0000-4000-8000-000000000105";
const COBALT = "a0000000-0000-4000-8000-000000000106";
const SUMMIT = "a0000000-0000-4000-8000-000000000107";

/** Deterministic order UUID namespace for this bootstrap. */
function oid(n: number): string {
  return `b0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

interface DemoOrder {
  id: string;
  accountId: string;
  side: Side;
  price: bigint;
  quantity: bigint;
}

let bootstrapped = false;

function place(order: DemoOrder): void {
  const willRest = true;
  const admit = risk.tryAdmit(order.accountId, order.id, {
    side: order.side,
    price: order.price,
    quantity: order.quantity,
    willRest,
  });
  if (!admit.ok) {
    console.warn(`[demo-market] risk rejected ${order.id}: ${admit.code}`);
    return;
  }

  engine.rememberOrder(order.id, order.accountId);
  const bookBefore = engine.depth(DEMO_MARKET);
  const result = engine.placeOrder(DEMO_MARKET, {
    id: order.id,
    accountId: order.accountId,
    side: order.side,
    price: order.price,
    quantity: order.quantity,
    timeInForce: "GTC" as TimeInForce,
    orderType: "limit",
  });

  engine.recordTrades(DEMO_MARKET, result.trades, order.side);
  publishBookChange(DEMO_MARKET, bookBefore, engine.depth(DEMO_MARKET));

  for (const cancellation of result.cancellations) {
    risk.releaseReservation(cancellation.orderId);
  }

  for (const trade of result.trades) {
    const makerId = order.side === "buy" ? trade.sellOrderId : trade.buyOrderId;
    if (makerId === order.id) continue;
    if (engine.marketOf(makerId) === undefined) {
      risk.releaseReservation(makerId);
    }
  }

  const stillLive = result.restingOrder !== null || engine.marketOf(order.id) !== undefined;
  if (result.rejected || !stillLive) {
    risk.releaseReservation(order.id);
  }

  if (result.rejected) {
    console.warn(`[demo-market] engine rejected ${order.id}: ${result.rejectionReason}`);
  }
}

function configureRiskProfiles(): void {
  // Admission checks price*quantity against maxNotional and quantity against
  // maxPositionAbs. Realistic BTC-USD sizes need large ceilings; UI diversity
  // comes mainly from open-order headroom (orders meter 80%/100% thresholds).
  const room = { maxNotional: 10n ** 18n, maxPositionAbs: 10n ** 15n };
  risk.setLimits(ATLAS, { ...room, maxOpenOrders: 40 });
  risk.setLimits(NOVA, { ...room, maxOpenOrders: 8 });
  risk.setLimits(MERIDIAN, { ...room, maxOpenOrders: 5 });
  risk.setLimits(ORION, { ...room, maxOpenOrders: 4 });
  risk.setLimits(VERTEX, { ...room, maxOpenOrders: 3 });
  risk.setLimits(COBALT, { ...room, maxOpenOrders: 6 });
  risk.setLimits(SUMMIT, { ...room, maxOpenOrders: 20 });
}

/**
 * Phase 1 — intentional crosses to create ~8–10 canonical trades.
 * Phase 2 — non-crossing resting liquidity (best bid < best ask).
 */
function buildBookAndTrades(): void {
  // Seed a mid book that will be crossed, then cleared into trades.
  const makers: DemoOrder[] = [
    { id: oid(1), accountId: ATLAS, side: "sell", price: 66_950n, quantity: 25_000_000n },
    { id: oid(2), accountId: NOVA, side: "sell", price: 67_000n, quantity: 40_000_000n },
    { id: oid(3), accountId: MERIDIAN, side: "sell", price: 67_050n, quantity: 30_000_000n },
    { id: oid(4), accountId: ORION, side: "sell", price: 67_100n, quantity: 55_000_000n },
    { id: oid(5), accountId: VERTEX, side: "sell", price: 67_150n, quantity: 20_000_000n },
    { id: oid(6), accountId: SUMMIT, side: "buy", price: 66_900n, quantity: 35_000_000n },
    { id: oid(7), accountId: COBALT, side: "buy", price: 66_850n, quantity: 45_000_000n },
  ];

  for (const order of makers) place(order);

  // Crossing takers — each generates real engine trades.
  const takers: DemoOrder[] = [
    { id: oid(10), accountId: SUMMIT, side: "buy", price: 66_950n, quantity: 20_000_000n },
    { id: oid(11), accountId: COBALT, side: "buy", price: 67_000n, quantity: 35_000_000n },
    { id: oid(12), accountId: ATLAS, side: "buy", price: 67_050n, quantity: 25_000_000n },
    { id: oid(13), accountId: NOVA, side: "buy", price: 67_100n, quantity: 40_000_000n },
    { id: oid(14), accountId: VERTEX, side: "buy", price: 67_150n, quantity: 15_000_000n },
    { id: oid(15), accountId: ORION, side: "sell", price: 66_900n, quantity: 30_000_000n },
    { id: oid(16), accountId: MERIDIAN, side: "sell", price: 66_850n, quantity: 25_000_000n },
    { id: oid(17), accountId: SUMMIT, side: "buy", price: 67_050n, quantity: 10_000_000n },
    { id: oid(18), accountId: ATLAS, side: "sell", price: 66_900n, quantity: 10_000_000n },
  ];

  for (const order of takers) place(order);

  // Resting terminal book — bids strictly below asks.
  const resting: DemoOrder[] = [
    { id: oid(30), accountId: ATLAS, side: "buy", price: 67_050n, quantity: 50_000_000n },
    { id: oid(31), accountId: NOVA, side: "buy", price: 67_000n, quantity: 85_000_000n },
    { id: oid(32), accountId: MERIDIAN, side: "buy", price: 66_950n, quantity: 125_000_000n },
    { id: oid(33), accountId: ORION, side: "buy", price: 66_900n, quantity: 200_000_000n },
    { id: oid(34), accountId: VERTEX, side: "buy", price: 66_850n, quantity: 75_000_000n },
    { id: oid(40), accountId: SUMMIT, side: "sell", price: 67_100n, quantity: 60_000_000n },
    { id: oid(41), accountId: COBALT, side: "sell", price: 67_150n, quantity: 90_000_000n },
    { id: oid(42), accountId: ATLAS, side: "sell", price: 67_200n, quantity: 110_000_000n },
    { id: oid(43), accountId: NOVA, side: "sell", price: 67_250n, quantity: 150_000_000n },
    { id: oid(44), accountId: MERIDIAN, side: "sell", price: 67_300n, quantity: 80_000_000n },
  ];

  for (const order of resting) place(order);
}

/**
 * Idempotent per process. Safe to call once after the HTTP server starts.
 * Skips when the demo market already has depth (e.g. prior bootstrap).
 */
export function bootstrapDemoMarket(): void {
  if (bootstrapped) return;
  if (process.env.NODE_ENV === "test") return;

  const existing = engine.depth(DEMO_MARKET);
  if (existing.bids.length > 0 || existing.asks.length > 0) {
    bootstrapped = true;
    return;
  }

  configureRiskProfiles();
  buildBookAndTrades();
  bootstrapped = true;

  const depth = engine.depth(DEMO_MARKET);
  console.log(
    `[demo-market] ${DEMO_MARKET} ready — bids=${depth.bids.length} asks=${depth.asks.length}`,
  );
}

export function resetDemoMarketBootstrapFlag(): void {
  bootstrapped = false;
}
