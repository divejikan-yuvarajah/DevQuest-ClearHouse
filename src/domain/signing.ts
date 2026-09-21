import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ALLOWED_ALGORITHMS = ["HMAC-SHA256"] as const;
export type SigningAlgorithm = (typeof ALLOWED_ALGORITHMS)[number];

export const SIGNATURE_WINDOW_MS = 30_000;

export interface SignInput {
  method: string;
  path: string;
  rawBody: string | undefined;
  timestamp: number | string;
  nonce: string;
  secret: string;
}

export interface VerifyInput extends SignInput {
  algorithm: string;
  signature: string;
}

export type VerifyResult = { valid: true } | { valid: false; reason: string };

const HEX_64 = /^[0-9a-fA-F]{64}$/;
const CANONICAL_DIGIT_TIMESTAMP = /^(0|[1-9][0-9]*)$/;

function assertNoFieldSeparators(label: string, value: string): void {
  if (value.includes("\n") || value.includes("\r")) {
    throw new Error(`${label} must not contain CR or LF`);
  }
}

function timestampToCanonicalString(timestamp: number | string): string {
  if (typeof timestamp === "number") {
    if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
      throw new Error("timestamp must be a nonnegative safe integer");
    }
    return String(timestamp);
  }
  if (typeof timestamp === "string") {
    if (!CANONICAL_DIGIT_TIMESTAMP.test(timestamp)) {
      throw new Error("timestamp string must be canonical nonnegative digits");
    }
    // Reject values that cannot be represented as a safe integer for window checks later.
    if (timestamp.length > 16) {
      throw new Error("timestamp out of safe integer range");
    }
    return timestamp;
  }
  throw new Error("timestamp must be a number or digit string");
}

export function sign(input: SignInput): string {
  if (typeof input.method !== "string" || input.method.length === 0) {
    throw new Error("method is required");
  }
  if (typeof input.path !== "string") {
    throw new Error("path is required");
  }
  if (typeof input.nonce !== "string" || input.nonce.length === 0) {
    throw new Error("nonce is required");
  }
  if (typeof input.secret !== "string" || input.secret.length === 0) {
    throw new Error("secret is required");
  }
  if (input.rawBody !== undefined && typeof input.rawBody !== "string") {
    throw new Error("rawBody must be a string when provided");
  }

  assertNoFieldSeparators("method", input.method);
  assertNoFieldSeparators("path", input.path);
  assertNoFieldSeparators("nonce", input.nonce);

  const timestamp = timestampToCanonicalString(input.timestamp);
  assertNoFieldSeparators("timestamp", timestamp);

  const bodyDigest = createHash("sha256")
    .update(input.rawBody ?? "", "utf8")
    .digest("hex");

  const message = [input.method.toUpperCase(), input.path, bodyDigest, timestamp, input.nonce].join("\n");
  return createHmac("sha256", input.secret).update(message, "utf8").digest("hex");
}

export function verifySignature(input: VerifyInput): VerifyResult {
  try {
    if (typeof input.algorithm !== "string" || !(ALLOWED_ALGORITHMS as readonly string[]).includes(input.algorithm)) {
      return { valid: false, reason: "UNSUPPORTED_ALGORITHM" };
    }

    if (typeof input.signature !== "string" || !HEX_64.test(input.signature)) {
      return { valid: false, reason: "INVALID_SIGNATURE" };
    }

    const expectedHex = sign({
      method: input.method,
      path: input.path,
      rawBody: input.rawBody,
      timestamp: input.timestamp,
      nonce: input.nonce,
      secret: input.secret,
    });

    const expected = Buffer.from(expectedHex, "hex");
    const received = Buffer.from(input.signature, "hex");
    if (expected.length !== received.length || expected.length !== 32) {
      return { valid: false, reason: "INVALID_SIGNATURE" };
    }

    if (!timingSafeEqual(expected, received)) {
      return { valid: false, reason: "INVALID_SIGNATURE" };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "INVALID_SIGNATURE" };
  }
}

function parseEpochMs(value: unknown): number | undefined {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) return undefined;
    return value;
  }
  if (typeof value === "string") {
    if (!CANONICAL_DIGIT_TIMESTAMP.test(value)) return undefined;
    if (value.length > 16) return undefined;
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 0) return undefined;
    return parsed;
  }
  return undefined;
}

export function isWithinWindow(timestamp: unknown, now: number = Date.now(), windowMs: number = SIGNATURE_WINDOW_MS): boolean {
  if (!Number.isSafeInteger(now) || !Number.isSafeInteger(windowMs) || windowMs < 0) {
    return false;
  }
  const ts = parseEpochMs(timestamp);
  if (ts === undefined) {
    return false;
  }
  const delta = ts > now ? BigInt(ts) - BigInt(now) : BigInt(now) - BigInt(ts);
  return delta <= BigInt(windowMs);
}
