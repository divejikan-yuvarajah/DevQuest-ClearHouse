import type { Request, Response } from "express";
import HttpStatus from "../enums/httpStatus.js";
import db from "../../db/db-config.js";
import metrics from "../services/metrics.js";

const health = async (_req: Request, res: Response): Promise<void> => {
  res.status(HttpStatus.OK).json({ data: { status: "ok" }, meta: {} });
};

const ready = async (_req: Request, res: Response): Promise<void> => {
  try {
    await db.raw("SELECT 1");
    res.status(HttpStatus.OK).json({ data: { status: "ready" }, meta: {} });
  } catch {
    res.status(HttpStatus.SERVICE_UNAVAILABLE).json({ error: { code: "NOT_READY", details: [] } });
  }
};

const getMetrics = async (_req: Request, res: Response): Promise<void> => {
  res.status(HttpStatus.OK).json({ data: metrics.snapshot(), meta: {} });
};

export default { health, ready, getMetrics };
