import express, { type ErrorRequestHandler } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import assetsRoutes from "./routes/assetsRoutes.js";
import secureRoutes from "./routes/secureRoutes.js";
import ledgerRoutes from "./routes/ledgerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import settlementRoutes from "./routes/settlementRoutes.js";
import riskRoutes from "./routes/riskRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import marketDataRoutes from "./routes/marketDataRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import docsRoutes from "./routes/docsRoutes.js";
import opsRoutes from "./routes/opsRoutes.js";

import hmacAuth from "./middleware/hmacAuth.js";
import securityHeaders from "./middleware/securityHeaders.js";
import rejectDeepJson from "./middleware/rejectDeepJson.js";
import { attachPrincipal } from "./middleware/rbac.js";
import structuredLogging from "./middleware/logging.js";
import rateLimit from "./middleware/rateLimit.js";
import metrics from "./services/metrics.js";
import { startLiveHub } from "./services/liveHub.js";
import db from "../db/db-config.js";

const clientRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "client");

/** Same-origin dashboard only: scripts/styles/connect; API routes keep default-src 'none'. */
const DASHBOARD_CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self' ws: wss:",
  "font-src 'self'",
].join("; ");

dotenv.config();

const app = express();
app.disable("x-powered-by");
app.use(securityHeaders);

app.use(
  express.json({
    limit: "1mb",
    verify: (req, _res, buf) => {
      (req as express.Request).rawBody = buf.toString("utf8");
    },
  }),
);
app.use(rejectDeepJson);
app.use(metrics.requestTimer);
metrics.instrumentDatabase(db);
app.use(cors());
app.use(attachPrincipal);
app.use(structuredLogging);

app.use("/", opsRoutes);

// Shared route tree for unversioned /api and supported /api/v1.
const apiRouter = express.Router();
apiRouter.use("/auth", rateLimit({ limit: 10, windowMs: 60_000, keyFor: (req) => `login:${req.ip}` }), authRoutes);
apiRouter.use("/assets", assetsRoutes);
apiRouter.use("/secure", hmacAuth, secureRoutes);
apiRouter.use("/ledger", ledgerRoutes);
// Unauthenticated callers share one IP-keyed bucket, so this must sit well above a single test file's request volume.
apiRouter.use("/orders", rateLimit({ limit: 1000, windowMs: 60_000, keyFor: (req) => `orders:${req.principal?.accountId ?? req.ip}` }), orderRoutes);
apiRouter.use("/settlement", settlementRoutes);
apiRouter.use("/risk", riskRoutes);
apiRouter.use("/events", eventRoutes);
apiRouter.use("/market-data", marketDataRoutes);
apiRouter.use("/config", configRoutes);
apiRouter.use("/", docsRoutes);

// Mount the supported version before the unversioned prefix so /api/v1/...
// is not swallowed as an unknown unversioned path, and /api/v2/... still 404s.
app.use("/api/v1", apiRouter);
app.use("/api", apiRouter);

// Operator dashboard (Challenge 12/17/20): served over HTTP so modules/fetch/WS share API origin.
app.use(
  express.static(clientRoot, {
    setHeaders(res) {
      res.setHeader("Content-Security-Policy", DASHBOARD_CSP);
    },
  }),
);

const notFound: express.RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", details: [] } });
};
app.use(notFound);

function statusOf(err: unknown): number {
  if (!err || typeof err !== "object") return 500;

  const candidate = err as { status?: unknown; statusCode?: unknown; type?: unknown };
  const typed = typeof candidate.type === "string" ? candidate.type : undefined;
  if (typed === "entity.too.large") return 413;
  if (typed === "entity.parse.failed") return 400;

  const raw = candidate.status ?? candidate.statusCode;
  if (typeof raw === "number" && Number.isInteger(raw) && raw >= 400 && raw < 600) {
    return raw;
  }

  return 500;
}

const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  const status = statusOf(err);
  if (status >= 500) console.error(err);
  const code = status === 413 ? "PAYLOAD_TOO_LARGE" : status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR";
  res.status(status).json({ error: { code, details: [] } });
};
app.use(errorHandler);

const port = process.env.PORT || 3001;

const server =
  process.env.NODE_ENV === "test"
    ? app.listen(0, () => {
        const address = server.address();
        const boundPort = typeof address === "object" && address ? address.port : port;
        console.log(`Server is running on port ${boundPort}`);
      })
    : app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });

startLiveHub(server);

export default server;
