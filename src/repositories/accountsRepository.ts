import type { Knex } from "knex";

export type AccountStatus = "active" | "closed";

interface AccountRow {
  id: string;
  status: AccountStatus;
}

interface BalanceRow {
  account_id: string;
  asset: string;
  available: string;
  held: string;
}

export async function getStatus(db: Knex, accountId: string): Promise<AccountStatus | null> {
  const row = await db<AccountRow>("accounts").where({ id: accountId }).first("status");
  return row ? row.status : null;
}

export class AccountClosedError extends Error {
  constructor(public readonly accountId: string) {
    super(`Account ${accountId} is closed`);
  }
}

export class AccountHasBalanceError extends Error {
  constructor(public readonly accountId: string) {
    super(`Account ${accountId} still has a nonzero balance in at least one asset`);
  }
}

export async function assertOpen(db: Knex, accountId: string): Promise<void> {
  const status = await getStatus(db, accountId);
  if (status === "closed") {
    throw new AccountClosedError(accountId);
  }
}

export async function closeAccount(db: Knex, accountId: string): Promise<void> {
  await db.transaction(async (trx) => {
    const account = await trx<AccountRow>("accounts").where({ id: accountId }).first("id", "status");
    if (!account) {
      return;
    }

    const balances = await trx("account_balances").where("account_id", accountId).select("available", "held");
    for (const row of balances as BalanceRow[]) {
      if (BigInt(row.available) !== 0n || BigInt(row.held) !== 0n) {
        throw new AccountHasBalanceError(accountId);
      }
    }

    if (account.status !== "closed") {
      await trx("accounts").where({ id: accountId }).update({ status: "closed" });
    }
  });
}
