import type { Agent } from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import app from "../src/server.js";
import db from "../db/db-config.js";
import testBase from "./testBase.js";
import HttpStatus from "../src/enums/httpStatus.js";
import * as risk from "../src/services/riskRegistry.js";
import * as engine from "../src/services/matchingEngine.js";

let testSession: Agent;

beforeAll(async () => {
  testSession = testBase.createSuperTestSession(app);
  await testBase.resetDatabase(db);
});
afterEach(async () => {
  risk.resetAll();
  engine.resetAllBooks();
  await testBase.resetDatabase(db);
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    app.close((err) => (err ? reject(err) : resolve()));
  });
});

describe("Task 9 extras: input validation and security", () => {
  test("zero open-order limit is accepted as a non-negative integer", async () => {
    const response = await testSession.post("/api/risk/limits").send({
      accountId: "acct",
      maxNotional: "1000",
      maxPositionAbs: "1000",
      maxOpenOrders: 0,
    });
    expect(response.status).toBe(HttpStatus.OK);
  });

  test("security headers include CSP and omit powered-by", async () => {
    const response = await testSession.get("/api/assets");
    expect(response.headers["content-security-policy"]).toBe("default-src 'none'");
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  test("shallow ledger create still succeeds after depth guard", async () => {
    const response = await testSession.post("/api/ledger/accounts").send({ type: "asset", name: "ok" });
    expect(response.status).toBe(HttpStatus.CREATED);
  });
});
