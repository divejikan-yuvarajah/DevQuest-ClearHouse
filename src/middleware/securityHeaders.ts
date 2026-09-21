import type { NextFunction, Request, Response } from "express";

export default function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Content-Security-Policy", "default-src 'none'");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
}
