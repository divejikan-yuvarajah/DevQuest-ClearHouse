import type { NextFunction, Request, Response } from "express";
import HttpStatus from "../enums/httpStatus.js";

/** Application bound for parsed JSON object/array nesting depth. */
const MAX_JSON_DEPTH = 64;

/**
 * Reject excessively nested JSON bodies after parse, before controllers.
 * Iterative traversal avoids stack overflow on pathological nesting.
 */
export default function rejectDeepJson(req: Request, res: Response, next: NextFunction): void {
  if (req.body === undefined || req.body === null) {
    next();
    return;
  }

  if (exceedsMaxDepth(req.body, MAX_JSON_DEPTH)) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: { code: "REQUEST_ERROR", details: [] } });
    return;
  }

  next();
}

function exceedsMaxDepth(root: unknown, maxDepth: number): boolean {
  const stack: { value: unknown; depth: number }[] = [{ value: root, depth: 0 }];

  while (stack.length > 0) {
    const frame = stack.pop()!;
    const { value, depth } = frame;

    if (value === null || typeof value !== "object") {
      continue;
    }

    if (depth > maxDepth) {
      return true;
    }

    if (Array.isArray(value)) {
      for (const element of value) {
        stack.push({ value: element, depth: depth + 1 });
      }
      continue;
    }

    for (const key of Object.keys(value as object)) {
      stack.push({ value: (value as Record<string, unknown>)[key], depth: depth + 1 });
    }
  }

  return false;
}
