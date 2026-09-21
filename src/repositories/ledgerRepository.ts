import type { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";
import { assertBalanced, reversePostings, type PostingInput } from "../domain/ledger.js";

interface PostingRow {
  seq: number;
  id: string;
  entry_id: string;
  account_id: string;
  asset: string;
  amount: string;
  created_at: string;
}

interface LedgerEntryRow {
  seq: number;
  id: string;
  reversal_of_entry_id: string | null;
  created_at: string;
}

export class EntryNotFoundError extends Error {
  constructor(public readonly entryId: string) {
    super(`Ledger entry '${entryId}' was not found`);
  }
}

export async function insertBalancedEntry(
  executor: Knex | Knex.Transaction,
  postings: readonly PostingInput[],
  reversalOfEntryId?: string
): Promise<string> {
  assertBalanced(postings);

  const entryId = uuidv4();
  const entryRow: Record<string, string> = { id: entryId };
  if (reversalOfEntryId !== undefined) {
    entryRow.reversal_of_entry_id = reversalOfEntryId;
  }

  await executor("ledger_entries").insert(entryRow);

  for (const posting of postings) {
    await executor("postings").insert({
      id: uuidv4(),
      entry_id: entryId,
      account_id: posting.accountId,
      asset: posting.asset,
      amount: posting.amount.toString(),
    });
  }

  return entryId;
}

export async function postEntry(
  db: Knex,
  postings: readonly PostingInput[],
  reversalOfEntryId?: string
): Promise<string> {
  return db.transaction(async (trx) => insertBalancedEntry(trx, postings, reversalOfEntryId));
}

export async function reverseEntry(db: Knex, entryId: string): Promise<string> {
  return db.transaction(async (trx) => {
    const entry = await trx<LedgerEntryRow>("ledger_entries").where({ id: entryId }).first();
    if (!entry) {
      throw new EntryNotFoundError(entryId);
    }

    const rows = await trx<PostingRow>("postings").where({ entry_id: entryId }).orderBy("seq", "asc");
    const original: PostingInput[] = rows.map((row) => ({
      accountId: row.account_id,
      asset: row.asset,
      amount: BigInt(row.amount),
    }));

    return insertBalancedEntry(trx, reversePostings(original), entryId);
  });
}

export interface BalanceOptions {
  asOfTimestamp?: string;
  asOfEntryId?: string;
}

export async function deriveBalance(
  db: Knex,
  accountId: string,
  asset: string,
  options: BalanceOptions = {}
): Promise<bigint> {
  let query = db<PostingRow>("postings")
    .where("postings.account_id", accountId)
    .andWhere("postings.asset", asset);

  if (options.asOfEntryId !== undefined) {
    const cutoff = await db<LedgerEntryRow>("ledger_entries").where({ id: options.asOfEntryId }).first();
    if (!cutoff) {
      throw new EntryNotFoundError(options.asOfEntryId);
    }
    query = query
      .join("ledger_entries", "postings.entry_id", "ledger_entries.id")
      .andWhere("ledger_entries.seq", "<=", cutoff.seq);
  }

  if (options.asOfTimestamp !== undefined) {
    query = query.andWhere("postings.created_at", "<=", options.asOfTimestamp);
  }

  const rows = await query.select("postings.amount");
  let sum = 0n;
  for (const row of rows) {
    sum += BigInt(row.amount);
  }
  return sum;
}

export async function trialBalance(db: Knex): Promise<Map<string, bigint>> {
  const rows = await db<{ asset: string; amount: string }>("postings").select("asset", "amount");
  const sums = new Map<string, bigint>();
  for (const row of rows) {
    sums.set(row.asset, (sums.get(row.asset) ?? 0n) + BigInt(row.amount));
  }
  return sums;
}

export interface StatementPage {
  postings: PostingRow[];
  nextCursor: string | null;
}

export async function statementPage(
  db: Knex,
  accountId: string,
  limit: number,
  cursor?: string
): Promise<StatementPage> {
  let query = db<PostingRow>("postings").where({ account_id: accountId }).orderBy("seq", "asc");

  if (cursor !== undefined && cursor !== "") {
    const cursorSeq = Number.parseInt(cursor, 10);
    if (!Number.isFinite(cursorSeq) || !Number.isInteger(cursorSeq)) {
      return { postings: [], nextCursor: null };
    }
    query = query.andWhere("seq", ">", cursorSeq);
  }

  const rows = await query.limit(limit + 1);
  if (rows.length <= limit) {
    return { postings: rows, nextCursor: null };
  }

  const page = rows.slice(0, limit);
  const last = page[page.length - 1]!;
  return { postings: page, nextCursor: String(last.seq) };
}
