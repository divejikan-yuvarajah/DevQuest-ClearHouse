import type { Request, Response } from "express";
import HttpStatus from "../enums/httpStatus.js";
import { issueTokens, rotateRefreshToken, RefreshReuseError, SessionConfigError, type Role } from "../domain/session.js";

interface LoginBody {
  accountId?: unknown;
  role?: unknown;
}

const ROLES: ReadonlySet<string> = new Set(["operator", "admin"]);

const login = async (req: Request<unknown, unknown, LoginBody>, res: Response): Promise<void> => {
  const body = req.body;
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: { code: "INVALID_REQUEST", details: [{ message: "body must be an object" }] } });
    return;
  }

  const { accountId, role } = body;
  if (typeof accountId !== "string" || accountId.trim() === "" || typeof role !== "string" || !ROLES.has(role)) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: { code: "INVALID_REQUEST", details: [{ message: "accountId and role are required" }] } });
    return;
  }

  try {
    const tokens = issueTokens({ accountId, role: role as Role });
    res.status(HttpStatus.OK).json({ data: tokens, meta: {} });
  } catch (error: unknown) {
    if (error instanceof SessionConfigError) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({ error: { code: "SERVER_MISCONFIGURED", details: [] } });
      return;
    }
    throw error;
  }
};

interface RefreshBody {
  refreshToken?: unknown;
}

const refresh = async (req: Request<unknown, unknown, RefreshBody>, res: Response): Promise<void> => {
  const body = req.body;
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: { code: "INVALID_REQUEST", details: [{ message: "body must be an object" }] } });
    return;
  }

  const { refreshToken } = body;
  if (typeof refreshToken !== "string") {
    res.status(HttpStatus.BAD_REQUEST).json({ error: { code: "INVALID_REQUEST", details: [] } });
    return;
  }

  try {
    const { tokens } = rotateRefreshToken(refreshToken);
    res.status(HttpStatus.OK).json({ data: tokens, meta: {} });
  } catch (error: unknown) {
    if (error instanceof SessionConfigError) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({ error: { code: "SERVER_MISCONFIGURED", details: [] } });
      return;
    }
    if (error instanceof RefreshReuseError) {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: { code: "REFRESH_REUSED", details: [{ message: error.message }] } });
      return;
    }
    res.status(HttpStatus.UNAUTHORIZED).json({ error: { code: "INVALID_REFRESH_TOKEN", details: [] } });
  }
};

export default { login, refresh };
