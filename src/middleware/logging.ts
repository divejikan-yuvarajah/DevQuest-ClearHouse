import type { Request, Response, NextFunction } from "express";

export interface LogRecord {
  timestamp: string;
  method: string;
  path: string;
  actor: string | null;
  status: number;
  durationMs: number;
}

// Wired globally into every request (see server.ts) — must never throw or
// every other challenge's tests break too. Implement real structured
// logging here (see Challenge 10) without changing that contract.
export default function structuredLogging(req: Request, res: Response, next: NextFunction): void {
  const startedAt = Date.now();

  res.once("finish", () => {
    const record: LogRecord = {
      timestamp: new Date(Date.now()).toISOString(),
      method: req.method,
      path: req.path,
      actor: req.principal?.accountId ?? null,
      status: res.statusCode,
      durationMs: Math.max(0, Date.now() - startedAt),
    };
    console.log(JSON.stringify(record));
  });

  next();
}
