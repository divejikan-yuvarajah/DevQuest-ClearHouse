import type { Request, Response } from "express";
import HttpStatus from "../enums/httpStatus.js";
import * as cache from "../services/cache.js";

// A deliberately trivial, self-contained resource for Challenge 11's
// caching requirement — no other challenge reads or writes it.

const store = new Map<string, string>();

const CACHE_TTL_MS = 60_000;

function cacheKeyFor(key: string): string {
  return `config:${key}`;
}

const getConfig = async (req: Request<{ key: string }>, res: Response): Promise<void> => {
  const { key } = req.params;
  const cacheKey = cacheKeyFor(key);

  const cached = cache.get<{ value: string }>(cacheKey);
  if (cached !== undefined) {
    res.setHeader("x-cache", "HIT");
    res.status(HttpStatus.OK).json({ data: cached, meta: {} });
    return;
  }

  const value = store.get(key);
  if (value === undefined) {
    res.status(HttpStatus.NOT_FOUND).json({ error: { code: "NOT_FOUND", details: [] } });
    return;
  }

  const data = { value };
  cache.set(cacheKey, data, CACHE_TTL_MS);
  res.setHeader("x-cache", "MISS");
  res.status(HttpStatus.OK).json({ data, meta: {} });
};

interface PutConfigBody {
  value?: unknown;
}

const putConfig = async (req: Request<{ key: string }, unknown, PutConfigBody>, res: Response): Promise<void> => {
  const { key } = req.params;
  const { value } = req.body ?? {};

  if (typeof value !== "string") {
    res.status(HttpStatus.BAD_REQUEST).json({ error: { code: "INVALID_REQUEST", details: [] } });
    return;
  }

  store.set(key, value);
  cache.invalidate(cacheKeyFor(key));
  res.status(HttpStatus.OK).json({ data: { value }, meta: {} });
};

export default { getConfig, putConfig, store };
