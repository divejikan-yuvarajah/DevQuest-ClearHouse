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

export interface AccountBalanceView {
  asset: string;
  available: string;
  held: string;
  total: string;
}

export interface AccountListItem {
  id: string;
  type: string;
  name: string;
  status: string;
  balances: AccountBalanceView[];
}

interface AccountListRow {
  id: string;
  type: string;
  name: string;
  status: string;
}

/** Every account with its balances; name ASC (case-insensitive), then id; balances by asset. */
export async function listAccountsWithBalances(db: Knex): Promise<AccountListItem[]> {
  const accounts = (await db<AccountListRow>("accounts").select("id", "type", "name", "status")) as AccountListRow[];
  const balanceRows = (await db<BalanceRow>("account_balances").select(
    "account_id",
    "asset",
    "available",
    "held",
  )) as BalanceRow[];

  const balancesByAccount = new Map<string, AccountBalanceView[]>();
  for (const row of balanceRows) {
    const list = balancesByAccount.get(row.account_id) ?? [];
    list.push({
      asset: row.asset,
      available: row.available,
      held: row.held,
      total: (BigInt(row.available) + BigInt(row.held)).toString(),
    });
    balancesByAccount.set(row.account_id, list);
  }

  const listed: AccountListItem[] = accounts.map((account) => {
    const balances = [...(balancesByAccount.get(account.id) ?? [])].sort((a, b) =>
      a.asset < b.asset ? -1 : a.asset > b.asset ? 1 : 0,
    );
    return {
      id: account.id,
      type: account.type,
      name: account.name,
      status: account.status,
      balances,
    };
  });

  listed.sort((a, b) => {
    const x = a.name.toLowerCase();
    const y = b.name.toLowerCase();
    if (x < y) return -1;
    if (x > y) return 1;
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });

  return listed;
}
