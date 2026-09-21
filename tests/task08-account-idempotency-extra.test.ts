import type { Knex } from "knex";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { v4 as uuidv4 } from "uuid";
import app from "../src/server.js";
import db from "../db/db-config.js";
import testBase from "./testBase.js";
import {
  readBalance,
  writeBalance,
  withIdempotency,
  IdempotencyConflictError,
} from "../src/repositories/settlementRepository.js";
import { assertOpen, AccountClosedError } from "../src/repositories/accountsRepository.js";

beforeAll(async () => {
  await testBase.resetDatabase(db);
});
afterEach(async () => {
  await testBase.resetDatabase(db);
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    app.close((err) => (err ? reject(err) : resolve()));
  });
});

describe("Task 8 extras: balances / idempotency / accounts", () => {
  test("updating one account+asset does not change another", async () => {
    const a = uuidv4();
    const b = uuidv4();
    await db("accounts").insert([
      { id: a, type: "asset", name: "a", status: "active" },
      { id: b, type: "asset", name: "b", status: "active" },
    ]);
    const trx = db as unknown as Knex.Transaction;

    await writeBalance(trx, a, "USD", { available: 10n, held: 1n });
    await writeBalance(trx, a, "BTC", { available: 2n, held: 0n });
    await writeBalance(trx, b, "USD", { available: 99n, held: 9n });
    await writeBalance(trx, a, "USD", { available: 7n, held: 3n });

    expect(await readBalance(trx, a, "USD")).toEqual({ available: 7n, held: 3n });
    expect(await readBalance(trx, a, "BTC")).toEqual({ available: 2n, held: 0n });
    expect(await readBalance(trx, b, "USD")).toEqual({ available: 99n, held: 9n });
  });

  test("failed operation clears in-flight state and does not persist success", async () => {
    let attempts = 0;
    await expect(
      withIdempotency(db, "fail-key", { n: 1 }, async () => {
        attempts += 1;
        throw new Error("boom");
      })
    ).rejects.toThrow("boom");

    expect(await db("idempotent_requests").where({ key: "fail-key" }).first()).toBeUndefined();

    const result = await withIdempotency(db, "fail-key", { n: 1 }, async () => {
      attempts += 1;
      return { ok: true };
    });
    expect(result).toEqual({ ok: true });
    expect(attempts).toBe(2);
  });

  test("assertOpen: active ok, closed throws, missing is not closed", async () => {
    const activeId = uuidv4();
    const closedId = uuidv4();
    await db("accounts").insert([
      { id: activeId, type: "asset", name: "open", status: "active" },
      { id: closedId, type: "asset", name: "shut", status: "closed" },
    ]);

    await expect(assertOpen(db, activeId)).resolves.toBeUndefined();
    await expect(assertOpen(db, "missing-id")).resolves.toBeUndefined();
    await expect(assertOpen(db, closedId)).rejects.toBeInstanceOf(AccountClosedError);
  });

  test("in-flight same-key different body conflicts without running the second op", async () => {
    let runs = 0;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    const first = withIdempotency(db, "race-diff", { amount: "1" }, async () => {
      runs += 1;
      await gate;
      return { runs };
    });

    // Yield so the first caller claims the in-flight map before we conflict.
    await Promise.resolve();

    await expect(
      withIdempotency(db, "race-diff", { amount: "2" }, async () => {
        runs += 1;
        return { runs };
      })
    ).rejects.toBeInstanceOf(IdempotencyConflictError);

    release();
    await expect(first).resolves.toEqual({ runs: 1 });
    expect(runs).toBe(1);
  });
});
