export enum AccountType {
  ASSET = "asset",
  LIABILITY = "liability",
  EQUITY = "equity",
  REVENUE = "revenue",
  EXPENSE = "expense",
}

export function isDebitNormal(type: AccountType): boolean {
  return type === AccountType.ASSET || type === AccountType.EXPENSE;
}

export interface PostingInput {
  accountId: string;
  asset: string;
  amount: bigint; // signed: positive is a debit, negative a credit
}

export class UnbalancedEntryError extends Error {
  constructor(public readonly imbalances: Map<string, bigint>) {
    const detail = [...imbalances.entries()].map(([asset, sum]) => `${asset}=${sum}`).join(", ");
    super(`Entry does not balance per asset: ${detail}`);
  }
}

export function assertBalanced(postings: readonly PostingInput[]): void {
  const sums = new Map<string, bigint>();
  for (const posting of postings) {
    sums.set(posting.asset, (sums.get(posting.asset) ?? 0n) + posting.amount);
  }

  const imbalances = new Map<string, bigint>();
  for (const [asset, sum] of sums) {
    if (sum !== 0n) {
      imbalances.set(asset, sum);
    }
  }

  if (imbalances.size > 0) {
    throw new UnbalancedEntryError(imbalances);
  }
}

export function reversePostings(postings: readonly PostingInput[]): PostingInput[] {
  return postings.map((posting) => ({
    accountId: posting.accountId,
    asset: posting.asset,
    amount: -posting.amount,
  }));
}
