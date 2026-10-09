/** Master Spec §282–§283 — canonical USD price tiers (minor units). */

export type MarketplacePriceTier = {
  id: string;
  currency: "USD";
  buyerPriceMinor: number;
  platformFeeMinor: number;
  sellerNetMinor: number;
  enabled: boolean;
  sortOrder: number;
};

export const MARKETPLACE_PRICE_TIERS: readonly MarketplacePriceTier[] = [
  {
    id: "USD_099",
    currency: "USD",
    buyerPriceMinor: 99,
    platformFeeMinor: 19,
    sellerNetMinor: 80,
    enabled: true,
    sortOrder: 1,
  },
  {
    id: "USD_299",
    currency: "USD",
    buyerPriceMinor: 299,
    platformFeeMinor: 59,
    sellerNetMinor: 240,
    enabled: true,
    sortOrder: 2,
  },
  {
    id: "USD_499",
    currency: "USD",
    buyerPriceMinor: 499,
    platformFeeMinor: 99,
    sellerNetMinor: 400,
    enabled: true,
    sortOrder: 3,
  },
  {
    id: "USD_999",
    currency: "USD",
    buyerPriceMinor: 999,
    platformFeeMinor: 199,
    sellerNetMinor: 800,
    enabled: true,
    sortOrder: 4,
  },
  {
    id: "USD_1499",
    currency: "USD",
    buyerPriceMinor: 1499,
    platformFeeMinor: 299,
    sellerNetMinor: 1200,
    enabled: true,
    sortOrder: 5,
  },
  {
    id: "USD_1999",
    currency: "USD",
    buyerPriceMinor: 1999,
    platformFeeMinor: 399,
    sellerNetMinor: 1600,
    enabled: true,
    sortOrder: 6,
  },
  {
    id: "USD_2999",
    currency: "USD",
    buyerPriceMinor: 2999,
    platformFeeMinor: 599,
    sellerNetMinor: 2400,
    enabled: true,
    sortOrder: 7,
  },
  {
    id: "USD_4999",
    currency: "USD",
    buyerPriceMinor: 4999,
    platformFeeMinor: 999,
    sellerNetMinor: 4000,
    enabled: true,
    sortOrder: 8,
  },
  {
    id: "USD_9999",
    currency: "USD",
    buyerPriceMinor: 9999,
    platformFeeMinor: 1999,
    sellerNetMinor: 8000,
    enabled: true,
    sortOrder: 9,
  },
] as const;

export function assertTierInvariant(tier: MarketplacePriceTier): void {
  if (tier.buyerPriceMinor !== tier.platformFeeMinor + tier.sellerNetMinor) {
    throw new Error(`TIER_INVARIANT_VIOLATION:${tier.id}`);
  }
}

export function getEnabledPriceTiers(): MarketplacePriceTier[] {
  return MARKETPLACE_PRICE_TIERS.filter((t) => t.enabled);
}

export function getPriceTierById(id: string): MarketplacePriceTier | undefined {
  return MARKETPLACE_PRICE_TIERS.find((t) => t.id === id);
}

export function getPriceTierByBuyerPriceMinor(
  buyerPriceMinor: number,
): MarketplacePriceTier | undefined {
  return MARKETPLACE_PRICE_TIERS.find((t) => t.buyerPriceMinor === buyerPriceMinor);
}

export function resolvePriceTier(input: {
  priceTierId?: string;
  buyerPriceMinor?: number;
}): MarketplacePriceTier | undefined {
  if (input.priceTierId) {
    return getPriceTierById(input.priceTierId);
  }
  if (input.buyerPriceMinor != null) {
    return getPriceTierByBuyerPriceMinor(input.buyerPriceMinor);
  }
  return undefined;
}
