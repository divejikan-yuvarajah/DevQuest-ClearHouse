import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

export type Role = "operator" | "admin";

export interface Principal {
  accountId: string;
  role: Role;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface Family {
  accountId: string;
  role: Role;
  currentJti: string;
  revoked: boolean;
}

const families = new Map<string, Family>();

const ALGORITHM = "HS256" as const;
const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

type TokenUse = "access" | "refresh";

interface SessionClaims {
  sub: string;
  role: Role;
  tokenUse: TokenUse;
  sid: string;
  jti: string;
}

export class SessionConfigError extends Error {
  constructor(message = "JWT_PRIVATE_KEY is not configured") {
    super(message);
  }
}

function getSigningKey(): string {
  const key = process.env.JWT_PRIVATE_KEY;
  if (typeof key !== "string" || key.length === 0) {
    throw new SessionConfigError();
  }
  return key;
}

function assertPrincipal(principal: Principal): void {
  if (typeof principal.accountId !== "string" || principal.accountId.trim() === "") {
    throw new Error("accountId must be a nonblank string");
  }
  if (principal.role !== "operator" && principal.role !== "admin") {
    throw new Error("role must be operator or admin");
  }
}

function signToken(claims: SessionClaims, expiresInSeconds: number): string {
  return jwt.sign(claims, getSigningKey(), {
    algorithm: ALGORITHM,
    expiresIn: expiresInSeconds,
  });
}

function createTokenPair(principal: Principal, familyId: string, refreshJti: string): TokenPair {
  const accessJti = randomUUID();
  const accessToken = signToken(
    {
      sub: principal.accountId,
      role: principal.role,
      tokenUse: "access",
      sid: familyId,
      jti: accessJti,
    },
    ACCESS_TTL_SECONDS,
  );
  const refreshToken = signToken(
    {
      sub: principal.accountId,
      role: principal.role,
      tokenUse: "refresh",
      sid: familyId,
      jti: refreshJti,
    },
    REFRESH_TTL_SECONDS,
  );
  return { accessToken, refreshToken };
}

function verifyClaims(token: string, expectedUse: TokenUse): SessionClaims & jwt.JwtPayload {
  if (typeof token !== "string" || token.length === 0) {
    throw new Error("token must be a nonempty string");
  }

  const decoded = jwt.verify(token, getSigningKey(), {
    algorithms: [ALGORITHM],
  });

  if (typeof decoded === "string" || decoded === null || typeof decoded !== "object") {
    throw new Error("invalid token payload");
  }

  const payload = decoded as jwt.JwtPayload & Partial<SessionClaims>;
  if (
    typeof payload.sub !== "string" ||
    payload.sub.trim() === "" ||
    (payload.role !== "operator" && payload.role !== "admin") ||
    payload.tokenUse !== expectedUse ||
    typeof payload.sid !== "string" ||
    payload.sid.length === 0 ||
    typeof payload.jti !== "string" ||
    payload.jti.length === 0 ||
    typeof payload.iat !== "number" ||
    typeof payload.exp !== "number"
  ) {
    throw new Error("token claims are invalid");
  }

  return payload as SessionClaims & jwt.JwtPayload;
}

export function issueTokens(principal: Principal): TokenPair {
  assertPrincipal(principal);
  const familyId = randomUUID();
  const refreshJti = randomUUID();
  const tokens = createTokenPair(principal, familyId, refreshJti);
  families.set(familyId, {
    accountId: principal.accountId,
    role: principal.role,
    currentJti: refreshJti,
    revoked: false,
  });
  return tokens;
}

export function verifyAccessToken(token: string): Principal {
  const claims = verifyClaims(token, "access");
  const family = families.get(claims.sid);
  if (!family || family.revoked) {
    throw new Error("session family is missing or revoked");
  }
  if (family.accountId !== claims.sub || family.role !== claims.role) {
    throw new Error("token identity does not match the session family");
  }
  return { accountId: claims.sub, role: claims.role };
}

export interface RotateResult {
  tokens: TokenPair;
}

export class RefreshReuseError extends Error {
  constructor() {
    super("This refresh token has already been rotated — the whole token family is now invalid");
  }
}

export function rotateRefreshToken(refreshToken: string): RotateResult {
  let claims: SessionClaims & jwt.JwtPayload;
  try {
    claims = verifyClaims(refreshToken, "refresh");
  } catch (error: unknown) {
    if (error instanceof SessionConfigError) throw error;
    throw new Error("invalid refresh token");
  }

  const family = families.get(claims.sid);
  if (!family) {
    throw new Error("unknown session family");
  }
  if (family.accountId !== claims.sub || family.role !== claims.role) {
    throw new Error("token identity does not match the session family");
  }
  if (family.revoked) {
    throw new RefreshReuseError();
  }
  if (family.currentJti !== claims.jti) {
    family.revoked = true;
    throw new RefreshReuseError();
  }

  const principal: Principal = { accountId: family.accountId, role: family.role };
  const nextRefreshJti = randomUUID();
  const tokens = createTokenPair(principal, claims.sid, nextRefreshJti);
  family.currentJti = nextRefreshJti;
  return { tokens };
}

/** Test/debug-only escape hatch — resets all in-memory session state between test runs. */
export function resetAllSessions(): void {
  families.clear();
}
