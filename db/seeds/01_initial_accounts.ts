import type { Knex } from "knex";
import { insertBalancedEntry } from "../../src/repositories/ledgerRepository.js";

/**
 * Deterministic demo funding for Challenge 20a.
 *
 * Trading accounts are type "asset". Funding is real double-entry:
 *   +amount on the trading account (debit)
 *   -amount on the house equity account (credit)
 * for the same asset, then account_balances.available is set to match the
 * trading account's posting sum. held starts at 0.
 *
 * Idempotency: stable UUIDs + skip funding when a posting already exists for
 * that trading account + asset. Never truncate or rebuild.
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

const DEMO_TRADERS: readonly DemoTrader[] = [
  {
    id: "a0000000-0000-4000-8000-000000000101",
    name: "Aurora Capital",
    holdings: [
      { asset: "USD", available: 250_000_00n },
      { asset: "BTC", available: 150_000_000n },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000102",
    name: "Beacon Markets",
    holdings: [
      { asset: "EUR", available: 180_000_00n },
      { asset: "USD", available: 90_000_00n },
      { asset: "BTC", available: 75_000_000n },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000103",
    name: "Cascade Securities",
    holdings: [
      { asset: "JPY", available: 12_500_000n },
      { asset: "USD", available: 40_000_00n },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000104",
    name: "Delta Desk",
    holdings: [
      { asset: "BHD", available: 5_000_000n },
      { asset: "EUR", available: 75_000_00n },
    ],
  },
  {
    id: "a0000000-0000-4000-8000-000000000105",
    name: "Evergreen Trading",
    holdings: [
      { asset: "BTC", available: 2_500_000_00n },
      { asset: "USD", available: 500_000_00n },
      { asset: "JPY", available: 3_000_000n },
    ],
  },
];

async function ensureAccount(
  trx: Knex.Transaction,
  id: string,
  type: string,
  name: string,
): Promise<void> {
  const existing = await trx("accounts").where({ id }).first("id");
  if (existing) return;

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
    // Only repair when the projection drifted; avoid no-op churn on re-seed.
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
    // Keep projection aligned with existing postings without creating new entries.
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
