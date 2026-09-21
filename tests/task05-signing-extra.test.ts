import { createHash, createHmac } from "node:crypto";
import { describe, expect, test, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { sign, verifySignature, isWithinWindow, SIGNATURE_WINDOW_MS } from "../src/domain/signing.js";
import hmacAuth from "../src/middleware/hmacAuth.js";

const SECRET = "task05-participant-only-secret";

function oracleSign(method: string, path: string, rawBody: string, timestamp: number | string, nonce: string): string {
  const bodyDigest = createHash("sha256").update(rawBody, "utf8").digest("hex");
  const message = [method.toUpperCase(), path, bodyDigest, String(timestamp), nonce].join("\n");
  return createHmac("sha256", SECRET).update(message, "utf8").digest("hex");
}

function fakeRes() {
  let statusCode: number | undefined;
  let jsonBody: unknown;
  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(body: unknown) {
      jsonBody = body;
      return res;
    },
  } as unknown as Response;
  return { res, getStatus: () => statusCode, getBody: () => jsonBody };
}

describe("Task 5 participant signing extras", () => {
  afterEach(() => {
    delete process.env.HMAC_SECRET;
  });

  test("sign matches an independent oracle and normalises method case", () => {
    const input = {
      method: "post",
      path: "/api/secure/echo?x=1",
      rawBody: '{ "a": 1 }',
      timestamp: 1_700_000_000_000,
      nonce: "n-1",
      secret: SECRET,
    };
    expect(sign(input)).toBe(oracleSign("POST", input.path, input.rawBody, input.timestamp, input.nonce));
    expect(sign({ ...input, rawBody: undefined })).toBe(oracleSign("POST", input.path, "", input.timestamp, input.nonce));
    expect(sign({ ...input, rawBody: "" })).toBe(oracleSign("POST", input.path, "", input.timestamp, input.nonce));
  });

  test("verifySignature rejects algorithm, hex shape, and field tampering", () => {
    const base = {
      method: "POST",
      path: "/api/secure/echo",
      rawBody: "{}",
      timestamp: "1700000000000",
      nonce: "n-2",
      secret: SECRET,
      algorithm: "HMAC-SHA256",
      signature: "",
    };
    const good = sign(base);
    expect(verifySignature({ ...base, signature: good })).toEqual({ valid: true });
    expect(verifySignature({ ...base, signature: good, algorithm: "HMAC-MD5" }).valid).toBe(false);
    expect(verifySignature({ ...base, signature: good.slice(0, 63) }).valid).toBe(false);
    expect(verifySignature({ ...base, signature: `${good}\n` }).valid).toBe(false);
    expect(verifySignature({ ...base, signature: good, rawBody: "{}" }).valid).toBe(true);
    expect(verifySignature({ ...base, signature: good, rawBody: '{"a":1}' }).valid).toBe(false);
    expect(verifySignature({ ...base, signature: good.toUpperCase() })).toEqual({ valid: true });
  });

  test("historical signatures still verify when freshness is checked separately", () => {
    const oldTs = 1_600_000_000_000;
    const signature = sign({
      method: "GET",
      path: "/api/secure/echo",
      rawBody: "",
      timestamp: oldTs,
      nonce: "old",
      secret: SECRET,
    });
    expect(
      verifySignature({
        method: "GET",
        path: "/api/secure/echo",
        rawBody: "",
        timestamp: oldTs,
        nonce: "old",
        secret: SECRET,
        algorithm: "HMAC-SHA256",
        signature,
      }),
    ).toEqual({ valid: true });
    expect(isWithinWindow(oldTs, Date.now())).toBe(false);
  });

  test("isWithinWindow inclusive boundaries and malformed rejection", () => {
    const now = 1_000_000;
    expect(isWithinWindow(now, now, 0)).toBe(true);
    expect(isWithinWindow(now - SIGNATURE_WINDOW_MS, now)).toBe(true);
    expect(isWithinWindow(now + SIGNATURE_WINDOW_MS, now)).toBe(true);
    expect(isWithinWindow(now - SIGNATURE_WINDOW_MS - 1, now)).toBe(false);
    expect(isWithinWindow(now + SIGNATURE_WINDOW_MS + 1, now)).toBe(false);
    expect(isWithinWindow(String(now), now)).toBe(true);
    expect(isWithinWindow("01", now)).toBe(false);
    expect(isWithinWindow("1e3", now)).toBe(false);
    expect(isWithinWindow(-1, now)).toBe(false);
  });

  test("middleware accepts once, rejects replay, and does not consume nonce on bad signature", () => {
    process.env.HMAC_SECRET = SECRET;
    const timestamp = String(Date.now());
    const nonce = `nonce-${Date.now()}-a`;
    const path = "/api/secure/echo";
    const rawBody = "{\"ok\":true}";
    const goodSig = sign({ method: "POST", path, rawBody, timestamp, nonce, secret: SECRET });

    const headers = {
      "X-Signature": goodSig,
      "X-Timestamp": timestamp,
      "X-Nonce": nonce,
      "X-Algorithm": "HMAC-SHA256",
    };
    const makeReq = (signature: string): Request =>
      ({
        method: "POST",
        originalUrl: path,
        rawBody,
        header: (name: string) => ({ ...headers, "X-Signature": signature })[name],
      }) as unknown as Request;

    const first = fakeRes();
    let firstNext = false;
    hmacAuth(makeReq(goodSig), first.res, (() => {
      firstNext = true;
    }) as NextFunction);
    expect(firstNext).toBe(true);

    const replay = fakeRes();
    let replayNext = false;
    hmacAuth(makeReq(goodSig), replay.res, (() => {
      replayNext = true;
    }) as NextFunction);
    expect(replayNext).toBe(false);
    expect(replay.getBody()).toMatchObject({ error: { code: "NONCE_REPLAYED" } });

    const unusedNonce = `nonce-${Date.now()}-b`;
    const badThenGoodHeaders = {
      "X-Signature": "00".repeat(32),
      "X-Timestamp": String(Date.now()),
      "X-Nonce": unusedNonce,
      "X-Algorithm": "HMAC-SHA256",
    };
    const badReq = {
      method: "POST",
      originalUrl: path,
      rawBody,
      header: (name: string) => badThenGoodHeaders[name as keyof typeof badThenGoodHeaders],
    } as unknown as Request;
    const bad = fakeRes();
    hmacAuth(badReq, bad.res, (() => undefined) as NextFunction);
    expect(bad.getStatus()).toBe(401);

    const goodForUnused = sign({
      method: "POST",
      path,
      rawBody,
      timestamp: badThenGoodHeaders["X-Timestamp"],
      nonce: unusedNonce,
      secret: SECRET,
    });
    badThenGoodHeaders["X-Signature"] = goodForUnused;
    const recovered = fakeRes();
    let recoveredNext = false;
    hmacAuth(badReq, recovered.res, (() => {
      recoveredNext = true;
    }) as NextFunction);
    expect(recoveredNext).toBe(true);
  });
});
