export interface Asset {
  code: string;
  name: string;
  exponent: number;
}

export class AssetError extends Error {}

const REGISTRY = new Map<string, Asset>([
  ["USD", { code: "USD", name: "US Dollar", exponent: 2 }],
  ["EUR", { code: "EUR", name: "Euro", exponent: 2 }],
  ["JPY", { code: "JPY", name: "Japanese Yen", exponent: 0 }],
  ["BHD", { code: "BHD", name: "Bahraini Dinar", exponent: 3 }],
  ["BTC", { code: "BTC", name: "Bitcoin", exponent: 8 }],
]);

function copyAsset(asset: Asset): Asset {
  return { code: asset.code, name: asset.name, exponent: asset.exponent };
}

export function getAsset(code: string): Asset {
  if (typeof code !== "string") {
    throw new AssetError(`Unknown asset code: ${String(code)}`);
  }
  const asset = REGISTRY.get(code);
  if (!asset) {
    throw new AssetError(`Unknown asset code: ${code}`);
  }
  return copyAsset(asset);
}

export function isKnownAsset(code: string): boolean {
  if (typeof code !== "string") {
    return false;
  }
  return REGISTRY.has(code);
}

export function listAssets(): Asset[] {
  return [...REGISTRY.values()].map(copyAsset);
}
