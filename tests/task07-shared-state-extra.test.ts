import { afterEach, describe, expect, test, vi } from "vitest";
import * as cache from "../src/services/cache.js";
import * as risk from "../src/services/riskRegistry.js";
import * as engine from "../src/services/matchingEngine.js";

describe("Task 7 participant shared-state extras", () => {
  afterEach(() => {
    vi.useRealTimers();
    cache.clearAll();
    risk.resetAll();
    engine.resetAllBooks();
  });

  test("cache TTL is millisecond-scale and expired get removes the entry", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    cache.set("a", 0, 50);
    cache.set("b", false, 200);
    expect(cache.get("a")).toBe(0);
    expect(cache.get("b")).toBe(false);
    expect(cache.size()).toBe(2);

    vi.setSystemTime(1_000_050);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.size()).toBe(1);
    expect(cache.get("b")).toBe(false);

    cache.invalidate("b");
    expect(cache.get("b")).toBeUndefined();
    expect(cache.size()).toBe(0);
  });

  test("risk limits and reservations stay isolated and reset clears kill switch", () => {
    risk.setLimits("a", { maxNotional: 1n, maxOpenOrders: 2, maxPositionAbs: 3n });
    expect(risk.getLimits("b").maxOpenOrders).toBe(50);
    expect(risk.getLimits("a").maxOpenOrders).toBe(2);

    risk.registerReservation("o1", { accountId: "a", side: "buy", quantity: 9n });
    expect(risk.takeReservation("o1")?.quantity).toBe(9n);
    expect(risk.takeReservation("o1")).toBeUndefined();

    risk.setKillSwitch(true);
    risk.resetAll();
    expect(risk.isKillSwitchEngaged()).toBe(false);
    expect(risk.takeReservation("o1")).toBeUndefined();
  });

  test("empty matching book returns null prices and unknown cancel is not found", () => {
    expect(engine.bestPrices("NONE")).toEqual({ bestBid: null, bestAsk: null });
    expect(engine.cancel("missing")).toEqual({ found: false, cancelled: false });
  });
});
