import { getAsset } from "./assets.js";

export interface Money {
  amount: bigint;
  asset: string;
}

export class MoneyError extends Error {
  code: string;

  constructor(message: string, code: string = "INVALID_AMOUNT") {
    super(message);
    this.code = code;
  }
}

/** Signed 64-bit maximum for external nonnegative minor-unit amounts. */
const MAX_EXTERNAL_AMOUNT_DIGITS = "9223372036854775807";
const MAX_EXTERNAL_DIGITS = 19;

function assertMatchingAssets(a: Money, b: Money): void {
  if (a.asset !== b.asset) {
    throw new MoneyError(`Asset mismatch: ${a.asset} vs ${b.asset}`, "ASSET_MISMATCH");
  }
}

/** True full-string canonical nonnegative integer: "0" or [1-9][0-9]*. No regex `$` newline quirk. */
function isCanonicalNonNegativeIntegerString(raw: string): boolean {
  if (raw === "0") return true;
  if (raw.length === 0) return false;
  const first = raw.charCodeAt(0);
  if (first < 49 || first > 57) return false; // '1'..'9'
  for (let i = 1; i < raw.length; i += 1) {
    const c = raw.charCodeAt(i);
    if (c < 48 || c > 57) return false; // '0'..'9'
  }
  return true;
}

function parseExternalMinorUnits(raw: unknown): bigint {
  if (typeof raw !== "string") {
    throw new MoneyError("amount must be a canonical nonnegative integer string");
  }
  if (!isCanonicalNonNegativeIntegerString(raw)) {
    throw new MoneyError("amount must be a canonical nonnegative integer string");
  }
  if (raw.length > MAX_EXTERNAL_DIGITS) {
    throw new MoneyError("amount exceeds the signed 64-bit maximum");
  }
  if (raw.length === MAX_EXTERNAL_DIGITS && raw > MAX_EXTERNAL_AMOUNT_DIGITS) {
    throw new MoneyError("amount exceeds the signed 64-bit maximum");
  }
  return BigInt(raw);
}

export function parseAmount(raw: unknown, assetCode: string): Money {
  const asset = getAsset(assetCode);
  const amount = parseExternalMinorUnits(raw);
  return { amount, asset: asset.code };
}

export function serialiseAmount(money: Money): { amount: string; asset: string } {
  return { amount: money.amount.toString(), asset: money.asset };
}

export function add(a: Money, b: Money): Money {
  assertMatchingAssets(a, b);
  return { amount: a.amount + b.amount, asset: a.asset };
}

export function sub(a: Money, b: Money): Money {
  assertMatchingAssets(a, b);
  return { amount: a.amount - b.amount, asset: a.asset };
}

export function isNegative(money: Money): boolean {
  return money.amount < 0n;
}

export function compare(a: Money, b: Money): -1 | 0 | 1 {
  assertMatchingAssets(a, b);
  if (a.amount < b.amount) return -1;
  if (a.amount > b.amount) return 1;
  return 0;
}

function tenPow(exponent: number): bigint {
  let result = 1n;
  for (let i = 0; i < exponent; i += 1) {
    result *= 10n;
  }
  return result;
}

export function fromDecimal(raw: unknown, assetCode: string): Money {
  const asset = getAsset(assetCode);
  if (typeof raw !== "string") {
    throw new MoneyError("decimal amount must be a string");
  }

  const dot = raw.indexOf(".");
  let integerPart: string;
  let fractionPart: string;

  if (dot === -1) {
    integerPart = raw;
    fractionPart = "";
  } else {
    if (asset.exponent === 0) {
      throw new MoneyError("this asset does not allow a fractional part");
    }
    integerPart = raw.slice(0, dot);
    fractionPart = raw.slice(dot + 1);
    if (fractionPart.length === 0) {
      throw new MoneyError("decimal point must be followed by at least one digit");
    }
    if (fractionPart.length > asset.exponent) {
      throw new MoneyError("fractional precision exceeds the asset exponent");
    }
    for (let i = 0; i < fractionPart.length; i += 1) {
      const c = fractionPart.charCodeAt(i);
      if (c < 48 || c > 57) {
        throw new MoneyError("fractional digits must be ASCII 0-9");
      }
    }
  }

  if (!isCanonicalNonNegativeIntegerString(integerPart)) {
    throw new MoneyError("integer part must be a canonical nonnegative integer string");
  }

  const paddedFraction = fractionPart.padEnd(asset.exponent, "0");
  const scaledDigits = integerPart + paddedFraction;
  // Strip leading zeros from the constructed minor-unit digit string (internal only).
  let normalised = scaledDigits.replace(/^0+/, "");
  if (normalised === "") normalised = "0";

  if (normalised.length > MAX_EXTERNAL_DIGITS) {
    throw new MoneyError("scaled amount exceeds the signed 64-bit maximum");
  }
  if (normalised.length === MAX_EXTERNAL_DIGITS && normalised > MAX_EXTERNAL_AMOUNT_DIGITS) {
    throw new MoneyError("scaled amount exceeds the signed 64-bit maximum");
  }

  return { amount: BigInt(normalised), asset: asset.code };
}

export function toDecimal(money: Money): string {
  const asset = getAsset(money.asset);
  const negative = money.amount < 0n;
  let abs = negative ? -money.amount : money.amount;

  if (asset.exponent === 0) {
    return `${negative ? "-" : ""}${abs.toString()}`;
  }

  const scale = tenPow(asset.exponent);
  const whole = abs / scale;
  let fraction = (abs % scale).toString();
  fraction = fraction.padStart(asset.exponent, "0");
  return `${negative ? "-" : ""}${whole.toString()}.${fraction}`;
}

export enum Rounding {
  HALF_UP = "HALF_UP",
  HALF_EVEN = "HALF_EVEN",
}

export interface DivisionResult {
  quotient: bigint;
  remainder: bigint;
}

function absBigInt(value: bigint): bigint {
  return value < 0n ? -value : value;
}

export function divideWithRounding(dividend: bigint, divisor: bigint, mode: Rounding = Rounding.HALF_EVEN): DivisionResult {
  if (divisor === 0n) {
    throw new MoneyError("division by zero");
  }
  if (mode !== Rounding.HALF_EVEN && mode !== Rounding.HALF_UP) {
    throw new MoneyError("unsupported rounding mode");
  }

  const a = absBigInt(dividend);
  const b = absBigInt(divisor);
  let q0 = a / b;
  const r0 = a % b;

  if (r0 !== 0n) {
    const twice = 2n * r0;
    if (twice > b) {
      q0 += 1n;
    } else if (twice === b) {
      if (mode === Rounding.HALF_UP) {
        q0 += 1n;
      } else if (q0 % 2n !== 0n) {
        // HALF_EVEN: round away from zero only when the truncated quotient is odd.
        q0 += 1n;
      }
    }
  }

  const negativeQuotient = (dividend < 0n) !== (divisor < 0n);
  const quotient = negativeQuotient ? -q0 : q0;
  const remainder = dividend - quotient * divisor;
  return { quotient, remainder };
}

export interface RateApplication {
  result: Money;
  remainder: Money;
}

export function applyRate(money: Money, numerator: bigint, denominator: bigint, mode: Rounding = Rounding.HALF_EVEN): RateApplication {
  if (denominator === 0n) {
    throw new MoneyError("division by zero");
  }
  const product = money.amount * numerator;
  const { quotient, remainder } = divideWithRounding(product, denominator, mode);
  return {
    result: { amount: quotient, asset: money.asset },
    remainder: { amount: remainder, asset: money.asset },
  };
}
