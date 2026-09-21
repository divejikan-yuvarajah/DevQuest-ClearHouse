import type { Knex } from "knex";
import { insertBalancedEntry } from "../../src/repositories/ledgerRepository.js";

/**
 * Deterministic demo funding for Challenge 20a / competition presentation.
 *
 * Trading accounts are type "asset". Funding is real double-entry:
 *   +amount on the trading account (debit)
 *   -amount on the house equity account (credit)
 * for the same asset, then account_balances.available is set to match the
 * trading account's posting sum. held starts at 0.
 *
 * Holds and closed zero-balance accounts are intentionally omitted: Challenge
 * 20a-1 requires every asset account to have ≥2 funded assets, and 20a-2
 * requires available ≡ posting sum (holds would break that equality).
 *
 * Idempotency: stable UUIDs + skip funding when a posting already exists for
 * that trading account + asset. Never truncate or rebuild.
 *
 * In-memory matching / WebSocket state is NOT seeded here — see
 * `src/demo/bootstrapDemoMarket.ts` (CLEARHOUSE_DEMO_MARKET=1).
 */

const HOUSE_ID = "a0000000-0000-4000-8000-000000000001";
const HOUSE_NAME = "ClearHouse Demo Treasury";

interface Holding {
  asset: string;
  available: bigint;
}

interface DemoTrader {
  id: string;
  name: string;
  holdings: readonly Holding[];
}

/**
 * Minor-unit targets (exact BigInt — no floats):
 * USD/EUR exponent 2, JPY 0, BHD 3, BTC 8.
 */
const DEMO_TRADERS: readonly DemoTrader[] = [
  {
    id: "a0000000-0000-4000-8000-000000000101",
    name: "Atlas Capital",
    holdings: [
      { asset: "USD", available: 250_000_00n },
      { asset: "BTC", available: 1_250_000_000n }, // 12.5 BTC
      { asset: "EUR", available: 75_000_00n },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000102",
    name: "Nova Securities",
    holdings: [
      { asset: "USD", available: 180_000_00n },
      { asset: "BTC", available: 425_000_000n }, // 4.25 BTC
      { asset: "JPY", available: 8_500_000n },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000103",
    name: "Meridian Markets",
    holdings: [
      { asset: "USD", available: 320_000_00n },
      { asset: "EUR", available: 125_000_00n },
      { asset: "BHD", available: 18_500_000n }, // 18,500.000
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000104",
    name: "Orion Trading",
    holdings: [
      { asset: "USD", available: 145_000_00n },
      { asset: "BTC", available: 775_000_000n }, // 7.75 BTC
      { asset: "JPY", available: 5_000_000n },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000105",
    name: "Vertex Financial",
    holdings: [
      { asset: "USD", available: 210_000_00n },
      { asset: "EUR", available: 95_000_00n },
      { asset: "BTC", available: 250_000_000n }, // 2.5 BTC
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000106",
    name: "Cobalt Partners",
    holdings: [
      { asset: "EUR", available: 110_000_00n },
      { asset: "BHD", available: 22_000_000n },
      { asset: "USD", available: 130_000_00n },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000107",
    name: "Summit Brokerage",
    holdings: [
      { asset: "USD", available: 275_000_00n },
      { asset: "JPY", available: 11_000_000n },
      { asset: "BTC", available: 600_000_000n }, // 6.0 BTC
    ],
  },
];

async function ensureAccount(
  trx: Knex.Transaction,
  id: string,
  type: string,
  name: string,
): Promise<void> {
  const existing = await trx("accounts").where({ id }).first("id", "name");
  if (existing) {
    if (existing.name === name) return;
    const patch: Record<string, string> = { name };
    if (await trx.schema.hasColumn("accounts", "normalized_name")) {
      patch.normalized_name = name.trim().toLowerCase();
    }
    await trx("accounts").where({ id }).update(patch);
    return;
  }

  const row: Record<string, string> = {
    id,
    type,
    name,
    status: "active",
  };

  if (await trx.schema.hasColumn("accounts", "normalized_name")) {
    row.normalized_name = name.trim().toLowerCase();
  }

  await trx("accounts").insert(row);
}

async function setTradingAvailable(
  trx: Knex.Transaction,
  accountId: string,
  asset: string,
  available: bigint,
): Promise<void> {
  const existing = await trx("account_balances").where({ account_id: accountId, asset }).first();
  const values = { available: available.toString(), held: "0" };
  if (existing) {
    if (existing.available === values.available && existing.held === values.held) return;
    await trx("account_balances").where({ account_id: accountId, asset }).update(values);
  } else {
    await trx("account_balances").insert({ account_id: accountId, asset, ...values });
  }
}

async function fundIfMissing(
  trx: Knex.Transaction,
  tradingId: string,
  asset: string,
  amount: bigint,
): Promise<void> {
  const alreadyPosted = await trx("postings").where({ account_id: tradingId, asset }).first("id");
  if (alreadyPosted) {
    const rows = await trx("postings").where({ account_id: tradingId, asset }).select("amount");
    let sum = 0n;
    for (const row of rows) sum += BigInt(row.amount);
    await setTradingAvailable(trx, tradingId, asset, sum);
    return;
  }

  await insertBalancedEntry(trx, [
    { accountId: tradingId, asset, amount },
    { accountId: HOUSE_ID, asset, amount: -amount },
  ]);
  await setTradingAvailable(trx, tradingId, asset, amount);
}

export async function seed(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    await ensureAccount(trx, HOUSE_ID, "equity", HOUSE_NAME);

    for (const trader of DEMO_TRADERS) {
      await ensureAccount(trx, trader.id, "asset", trader.name);
      for (const holding of trader.holdings) {
        await fundIfMissing(trx, trader.id, holding.asset, holding.available);
      }
    }
  });
}
