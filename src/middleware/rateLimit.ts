import type { Request, Response, NextFunction } from "express";
import HttpStatus from "../enums/httpStatus.js";

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  keyFor: (req: Request) => string;
}

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

// Wired into the auth/orders routes (see server.ts) — must never throw or
// every other challenge's tests that log in or place orders break too.
// Implement real fixed-window rate limiting here (see Challenge 10)
// without changing that contract.
export default function rateLimit(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = options.keyFor(req);
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || now - bucket.windowStart >= options.windowMs) {
      bucket = { count: 0, windowStart: now };
      buckets.set(key, bucket);
    }

    if (bucket.count >= options.limit) {
      const remainingMs = bucket.windowStart + options.windowMs - now;
      const retryAfterSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        error: { code: "RATE_LIMITED", details: [] },
      });
      return;
    }

    bucket.count += 1;
    next();
  };
}
