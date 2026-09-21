import crypto from "node:crypto";
import type { Knex } from "knex";
import {
  applyHold,
  applyRelease,
  InsufficientAvailableError,
  InsufficientHeldError,
  type AccountBalance,
} from "../domain/settlement.js";
import { insertBalancedEntry } from "./ledgerRepository.js";
import type { PostingInput } from "../domain/ledger.js";
import { assertOpen } from "./accountsRepository.js";

interface BalanceRow {
  account_id: string;
  asset: string;
  available: string;
  held: string;
}

interface IdempotentRow {
  key: string;
  request_hash: string;
  response_json: string;
}

type InFlightEntry = {
  hash: string;
  promise: Promise<unknown>;
};

const inFlight = new Map<string, InFlightEntry>();

type Executor = Knex | Knex.Transaction;

function balanceKey(accountId: string, asset: string): string {
  return `${accountId}\u0000${asset}`;
}

export async function readBalance(trx: Knex.Transaction, accountId: string, asset: string): Promise<AccountBalance> {
  const row = await trx<BalanceRow>("account_balances").where({ account_id: accountId, asset }).first();
  return row ? { available: BigInt(row.available), held: BigInt(row.held) } : { available: 0n, held: 0n };
}

export async function writeBalance(trx: Knex.Transaction, accountId: string, asset: string, balance: AccountBalance): Promise<void> {
  const existing = await trx<BalanceRow>("account_balances").where({ account_id: accountId, asset }).first();
  const values = { available: balance.available.toString(), held: balance.held.toString() };
  if (existing) {
    await trx<BalanceRow>("account_balances").where({ account_id: accountId, asset }).update(values);
  } else {
    await trx<BalanceRow>("account_balances").insert({ account_id: accountId, asset, ...values });
  }
}

export async function getBalance(db: Knex, accountId: string, asset: string): Promise<AccountBalance> {
  return readBalance(db as Knex.Transaction, accountId, asset);
}

export async function hold(db: Knex, accountId: string, asset: string, amount: bigint): Promise<AccountBalance> {
  return db.transaction(async (trx) => {
    await assertOpen(trx, accountId);
    const current = await readBalance(trx, accountId, asset);
    const next = applyHold(current, amount, accountId, asset);
    await writeBalance(trx, accountId, asset, next);
    return next;
  });
}

export async function release(db: Knex, accountId: string, asset: string, amount: bigint): Promise<AccountBalance> {
  return db.transaction(async (trx) => {
    const current = await readBalance(trx, accountId, asset);
    const next = applyRelease(current, amount, accountId, asset);
    await writeBalance(trx, accountId, asset, next);
    return next;
  });
}

export async function deposit(trx: Executor, accountId: string, asset: string, amount: bigint): Promise<AccountBalance> {
  await assertOpen(trx as Knex, accountId);
  const current = await readBalance(trx as Knex.Transaction, accountId, asset);
  const next: AccountBalance = {
    available: current.available + amount,
    held: current.held,
  };
  await writeBalance(trx as Knex.Transaction, accountId, asset, next);
  return next;
}

export async function withdraw(trx: Executor, accountId: string, asset: string, amount: bigint): Promise<AccountBalance> {
  await assertOpen(trx as Knex, accountId);
  const current = await readBalance(trx as Knex.Transaction, accountId, asset);
  if (amount > current.available) {
    throw new InsufficientAvailableError(accountId, asset);
  }
  const next: AccountBalance = {
    available: current.available - amount,
    held: current.held,
  };
  await writeBalance(trx as Knex.Transaction, accountId, asset, next);
  return next;
}

export interface TradeSettlement {
  sellerAssetAccountId: string;
  buyerAssetAccountId: string;
  asset: string;
  quantity: bigint;
  buyerCashAccountId: string;
  sellerCashAccountId: string;
  cashAsset: string;
  cashAmount: bigint;
}

export async function settleTrade(db: Knex, trade: TradeSettlement): Promise<string> {
  return db.transaction(async (trx) => {
    const {
      sellerAssetAccountId,
      buyerAssetAccountId,
      asset,
      quantity,
      buyerCashAccountId,
      sellerCashAccountId,
      cashAsset,
      cashAmount,
    } = trade;

    const participants = new Set([sellerAssetAccountId, buyerAssetAccountId, buyerCashAccountId, sellerCashAccountId]);
    for (const accountId of participants) {
      await assertOpen(trx, accountId);
    }

    const working = new Map<string, AccountBalance>();

    async function balanceFor(accountId: string, assetCode: string): Promise<AccountBalance> {
      const key = balanceKey(accountId, assetCode);
      let balance = working.get(key);
      if (!balance) {
        balance = await readBalance(trx, accountId, assetCode);
        working.set(key, balance);
      }
      return balance;
    }

    const sellerAsset = await balanceFor(sellerAssetAccountId, asset);
    if (sellerAsset.held < quantity) {
      throw new InsufficientHeldError(sellerAssetAccountId, asset);
    }

    const buyerCash = await balanceFor(buyerCashAccountId, cashAsset);
    if (buyerCash.held < cashAmount) {
      throw new InsufficientHeldError(buyerCashAccountId, cashAsset);
    }

    sellerAsset.held -= quantity;

    const buyerAsset = await balanceFor(buyerAssetAccountId, asset);
    buyerAsset.available += quantity;

    buyerCash.held -= cashAmount;

    const sellerCash = await balanceFor(sellerCashAccountId, cashAsset);
    sellerCash.available += cashAmount;

    for (const [key, balance] of working) {
      const sep = key.indexOf("\u0000");
      const accountId = key.slice(0, sep);
      const assetCode = key.slice(sep + 1);
      await writeBalance(trx, accountId, assetCode, balance);
    }

    const postings: PostingInput[] = [
      { accountId: buyerAssetAccountId, asset, amount: quantity },
      { accountId: sellerAssetAccountId, asset, amount: -quantity },
      { accountId: sellerCashAccountId, asset: cashAsset, amount: cashAmount },
      { accountId: buyerCashAccountId, asset: cashAsset, amount: -cashAmount },
    ];

    return insertBalancedEntry(trx, postings);
  });
}

function requestHash(body: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

export class IdempotencyConflictError extends Error {
  constructor() {
    super("Idempotency-Key was reused with a different request body");
  }
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return error instanceof Error && /UNIQUE constraint failed/i.test(error.message);
}

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

async function loadIdempotentResult<T extends Json>(db: Knex, key: string, hash: string): Promise<T | undefined> {
  const existing = await db<IdempotentRow>("idempotent_requests").where({ key }).first();
  if (!existing) return undefined;
  if (existing.request_hash !== hash) {
    throw new IdempotencyConflictError();
  }
  return JSON.parse(existing.response_json) as T;
}

export async function withIdempotency<T extends Json>(
  db: Knex,
  key: string,
  body: unknown,
  operation: (trx: Knex.Transaction) => Promise<T>
): Promise<T> {
  const hash = requestHash(body);

  const flying = inFlight.get(key);
  if (flying) {
    if (flying.hash !== hash) {
      throw new IdempotencyConflictError();
    }
    return flying.promise as Promise<T>;
  }

  let settle!: (value: T) => void;
  let fail!: (reason: unknown) => void;
  const promise = new Promise<T>((resolve, reject) => {
    settle = resolve;
    fail = reject;
  });
  inFlight.set(key, { hash, promise });

  void (async () => {
    try {
      const cached = await loadIdempotentResult<T>(db, key, hash);
      if (cached !== undefined) {
        settle(cached);
        return;
      }

      try {
        const result = await db.transaction(async (trx) => {
          const value = await operation(trx);
          await trx("idempotent_requests").insert({
            key,
            request_hash: hash,
            response_json: JSON.stringify(value),
          });
          return value;
        });
        settle(result);
      } catch (error: unknown) {
        if (!isUniqueConstraintViolation(error)) {
          fail(error);
          return;
        }
        try {
          const existing = await loadIdempotentResult<T>(db, key, hash);
          if (existing === undefined) {
            fail(error);
            return;
          }
          settle(existing);
        } catch (loadError: unknown) {
          fail(loadError);
        }
      }
    } catch (error: unknown) {
      fail(error);
    } finally {
      inFlight.delete(key);
    }
  })();

  return promise;
}
