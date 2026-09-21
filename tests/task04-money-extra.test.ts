import { describe, expect, test } from "vitest";
import fc from "fast-check";
import { getAsset, isKnownAsset, listAssets } from "../src/domain/assets.js";
import {
  parseAmount,
  serialiseAmount,
  add,
  sub,
  compare,
  isNegative,
  fromDecimal,
  toDecimal,
  divideWithRounding,
  applyRate,
  Rounding,
  MoneyError,
} from "../src/domain/money.js";

describe("Task 4 participant money extras", () => {
  test("parseAmount accepts MAX and exact values beyond 2^53; rejects MAX+1", () => {
    const max = "9223372036854775807";
    expect(parseAmount(max, "USD").amount).toBe(9223372036854775807n);
    expect(parseAmount("9007199254740993", "USD").amount).toBe(9007199254740993n);
    expect(() => parseAmount("9223372036854775808", "USD")).toThrow(MoneyError);
  });

  test("parseAmount rejects whitespace, newlines, numbers, leading zeros, and non-ASCII digits", () => {
    for (const raw of ["1\n", "1\r\n", " 1", "1 ", "01", "1e3", 100, true, null, undefined, "١٢٣"] as unknown[]) {
      expect(() => parseAmount(raw, "USD")).toThrow(MoneyError);
    }
  });

  test("internal negatives serialise and compare; asset mismatch throws", () => {
    const a = { amount: 1n, asset: "USD" };
    const b = { amount: 2n, asset: "USD" };
    const neg = sub(a, b);
    expect(isNegative(neg)).toBe(true);
    expect(serialiseAmount(neg)).toEqual({ amount: "-1", asset: "USD" });
    expect(compare(neg, a)).toBe(-1);
    expect(() => add(a, { amount: 1n, asset: "JPY" })).toThrow(MoneyError);
    expect(() => compare(a, { amount: 1n, asset: "JPY" })).toThrow(MoneyError);
  });

  test("fromDecimal/toDecimal scaling and signed formatting", () => {
    expect(fromDecimal("123.45", "USD").amount).toBe(12345n);
    expect(fromDecimal("1.2", "USD").amount).toBe(120n);
    expect(fromDecimal("0.001", "BHD").amount).toBe(1n);
    expect(fromDecimal("0.00000001", "BTC").amount).toBe(1n);
    expect(toDecimal({ amount: 1n, asset: "USD" })).toBe("0.01");
    expect(toDecimal({ amount: -1n, asset: "USD" })).toBe("-0.01");
    expect(toDecimal({ amount: 100n, asset: "USD" })).toBe("1.00");
    expect(toDecimal({ amount: 0n, asset: "BTC" })).toBe("0.00000000");
    expect(toDecimal({ amount: -7n, asset: "JPY" })).toBe("-7");
  });

  test("divideWithRounding midpoints and reconstruction examples", () => {
    expect(divideWithRounding(5n, 2n, Rounding.HALF_EVEN)).toEqual({ quotient: 2n, remainder: 1n });
    expect(divideWithRounding(5n, 2n, Rounding.HALF_UP)).toEqual({ quotient: 3n, remainder: -1n });
    expect(divideWithRounding(7n, 2n, Rounding.HALF_EVEN)).toEqual({ quotient: 4n, remainder: -1n });
    expect(divideWithRounding(-5n, 2n, Rounding.HALF_EVEN)).toEqual({ quotient: -2n, remainder: -1n });
    expect(divideWithRounding(-5n, 2n, Rounding.HALF_UP)).toEqual({ quotient: -3n, remainder: 1n });
    expect(divideWithRounding(-7n, 2n, Rounding.HALF_EVEN)).toEqual({ quotient: -4n, remainder: 1n });
    expect(divideWithRounding(1n, 3n, Rounding.HALF_EVEN)).toEqual({ quotient: 0n, remainder: 1n });
    expect(divideWithRounding(2n, 3n, Rounding.HALF_EVEN)).toEqual({ quotient: 1n, remainder: -1n });
    expect(divideWithRounding(0n, 7n)).toEqual({ quotient: 0n, remainder: 0n });
  });

  test("property — signed reconstruction for nonzero divisors", () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: -1_000_000_000n, max: 1_000_000_000n }),
        fc.bigInt({ min: 1n, max: 1_000_000n }),
        fc.constantFrom(Rounding.HALF_EVEN, Rounding.HALF_UP),
        (dividend, divisor, mode) => {
          const { quotient, remainder } = divideWithRounding(dividend, divisor, mode);
          expect(quotient * divisor + remainder).toBe(dividend);
          expect(remainder < divisor && remainder > -divisor).toBe(true);
        },
      ),
    );
  });

  test("applyRate reconstructs, preserves asset, and rejects zero denominator", () => {
    const money = { amount: 5n, asset: "USD" };
    const even = applyRate(money, 1n, 2n, Rounding.HALF_EVEN);
    expect(even.result).toEqual({ amount: 2n, asset: "USD" });
    expect(even.remainder).toEqual({ amount: 1n, asset: "USD" });
    expect(even.result.amount * 2n + even.remainder.amount).toBe(5n);

    const up = applyRate(money, 1n, 2n, Rounding.HALF_UP);
    expect(up.result.amount * 2n + up.remainder.amount).toBe(5n);

    const zeroNum = applyRate({ amount: 100n, asset: "USD" }, 0n, 7n);
    expect(zeroNum).toEqual({ result: { amount: 0n, asset: "USD" }, remainder: { amount: 0n, asset: "USD" } });

    expect(() => applyRate(money, 1n, 0n)).toThrow(MoneyError);
    expect(money.amount).toBe(5n);
  });

  test("registry copies are isolated; lookup agrees with isKnownAsset", () => {
    const copy = getAsset("BTC");
    copy.exponent = 0;
    expect(getAsset("BTC").exponent).toBe(8);
    listAssets().pop();
    expect(listAssets().some((a) => a.code === "BTC")).toBe(true);

    for (const code of ["USD", "usd", " BTC", "XXX", ""]) {
      let found = true;
      try {
        getAsset(code);
      } catch {
        found = false;
      }
      expect(isKnownAsset(code)).toBe(found);
    }
  });
});
