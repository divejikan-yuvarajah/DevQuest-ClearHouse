export class InsufficientAvailableError extends Error {
  constructor(accountId: string, asset: string) {
    super(`Account ${accountId} does not have enough available ${asset} to hold this amount`);
  }
}

export class InsufficientHeldError extends Error {
  constructor(accountId: string, asset: string) {
    super(`Account ${accountId} does not have enough held ${asset} to release this amount`);
  }
}

export interface AccountBalance {
  available: bigint;
  held: bigint;
}

export function applyHold(
  balance: AccountBalance,
  amount: bigint,
  accountId: string,
  asset: string
): AccountBalance {
  if (amount > balance.available) {
    throw new InsufficientAvailableError(accountId, asset);
  }
  return {
    available: balance.available - amount,
    held: balance.held + amount,
  };
}

export function applyRelease(
  balance: AccountBalance,
  amount: bigint,
  accountId: string,
  asset: string
): AccountBalance {
  if (amount > balance.held) {
    throw new InsufficientHeldError(accountId, asset);
  }
  return {
    available: balance.available + amount,
    held: balance.held - amount,
  };
}
