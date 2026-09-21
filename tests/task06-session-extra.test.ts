import { describe, expect, test, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import {
  issueTokens,
  verifyAccessToken,
  rotateRefreshToken,
  resetAllSessions,
  RefreshReuseError,
  type Principal,
} from "../src/domain/session.js";
import { requireRole, requireOwnAccount } from "../src/middleware/rbac.js";
import type { Request, Response, NextFunction } from "express";

const TEST_KEY = "task06-participant-only-jwt-key";

function withKey<T>(fn: () => T): T {
  const previous = process.env.JWT_PRIVATE_KEY;
  process.env.JWT_PRIVATE_KEY = TEST_KEY;
  try {
    return fn();
  } finally {
    if (previous === undefined) delete process.env.JWT_PRIVATE_KEY;
    else process.env.JWT_PRIVATE_KEY = previous;
  }
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

describe("Task 6 participant session extras", () => {
  afterEach(() => {
    resetAllSessions();
  });

  test("issueTokens verifies to the expected principal and rotates distinct pairs", () => {
    withKey(() => {
      const principal: Principal = { accountId: "acct-1", role: "operator" };
      const first = issueTokens(principal);
      const second = issueTokens(principal);
      expect(verifyAccessToken(first.accessToken)).toEqual(principal);
      expect(first.accessToken).not.toBe(second.accessToken);
      expect(first.refreshToken).not.toBe(second.refreshToken);
      expect(first.accessToken).not.toBe(first.refreshToken);
    });
  });

  test("access and refresh purposes are not interchangeable", () => {
    withKey(() => {
      const { accessToken, refreshToken } = issueTokens({ accountId: "acct-2", role: "admin" });
      expect(() => verifyAccessToken(refreshToken)).toThrow();
      expect(() => rotateRefreshToken(accessToken)).toThrow();
    });
  });

  test("hostile tokens are rejected without forging family revocation", () => {
    withKey(() => {
      const { refreshToken, accessToken } = issueTokens({ accountId: "acct-3", role: "operator" });
      const decoded = jwt.decode(refreshToken) as jwt.JwtPayload;
      const forged = jwt.sign(
        { sub: "acct-3", role: "operator", tokenUse: "refresh", sid: decoded.sid, jti: "forged-jti" },
        "wrong-key",
        { algorithm: "HS256", expiresIn: 60 },
      );
      expect(() => rotateRefreshToken(forged)).toThrow();
      expect(() => verifyAccessToken(accessToken)).not.toThrow();

      const { tokens } = rotateRefreshToken(refreshToken);
      expect(tokens.refreshToken).not.toBe(refreshToken);
    });
  });

  test("R0 reuse revokes the family so R1 also fails; independent family stays active", () => {
    withKey(() => {
      const familyA = issueTokens({ accountId: "same", role: "operator" });
      const familyB = issueTokens({ accountId: "same", role: "operator" });

      const rotated = rotateRefreshToken(familyA.refreshToken);
      expect(() => rotateRefreshToken(familyA.refreshToken)).toThrow(RefreshReuseError);
      expect(() => rotateRefreshToken(rotated.tokens.refreshToken)).toThrow(RefreshReuseError);
      expect(() => verifyAccessToken(familyA.accessToken)).toThrow();
      expect(() => verifyAccessToken(rotated.tokens.accessToken)).toThrow();

      const stillOk = rotateRefreshToken(familyB.refreshToken);
      expect(stillOk.tokens.refreshToken).not.toBe(familyB.refreshToken);
      expect(verifyAccessToken(stillOk.tokens.accessToken)).toEqual({ accountId: "same", role: "operator" });
    });
  });

  test("resetAllSessions clears families", () => {
    withKey(() => {
      const pair = issueTokens({ accountId: "acct-4", role: "admin" });
      resetAllSessions();
      expect(() => verifyAccessToken(pair.accessToken)).toThrow();
      expect(() => rotateRefreshToken(pair.refreshToken)).toThrow();
    });
  });

  test("requireRole and requireOwnAccount positive and negative paths", () => {
    const adminGuard = requireRole("admin");
    const forbidden = fakeRes();
    let nextCalled = false;
    adminGuard({ principal: { accountId: "op", role: "operator" } } as Request, forbidden.res, (() => {
      nextCalled = true;
    }) as NextFunction);
    expect(nextCalled).toBe(false);
    expect(forbidden.getStatus()).toBe(403);

    const allowed = fakeRes();
    let allowedNext = false;
    adminGuard({ principal: { accountId: "ad", role: "admin" } } as Request, allowed.res, (() => {
      allowedNext = true;
    }) as NextFunction);
    expect(allowedNext).toBe(true);

    const anon = { } as Request;
    const anonRes = fakeRes();
    expect(requireOwnAccount("acct", anon, anonRes.res)).toBe(true);

    const ownerReq = { principal: { accountId: "acct", role: "operator" } } as Request;
    expect(requireOwnAccount("acct", ownerReq, fakeRes().res)).toBe(true);

    const otherReq = { principal: { accountId: "acct", role: "operator" } } as Request;
    const otherRes = fakeRes();
    expect(requireOwnAccount("other", otherReq, otherRes.res)).toBe(false);
    expect(otherRes.getStatus()).toBe(403);
  });
});
