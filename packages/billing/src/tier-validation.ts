import type { MarketplacePriceTier } from "./price-tiers.js";
import {
  assertTierInvariant,
  getEnabledPriceTiers,
  getPriceTierByBuyerPriceMinor,
  getPriceTierById,
} from "./price-tiers.js";

export function requireEnabledPriceTier(input: {
  priceTierId?: string;
  buyerPriceMinor?: number;
}): MarketplacePriceTier {
  const tier =
    input.priceTierId != null
      ? getPriceTierById(input.priceTierId)
      : input.buyerPriceMinor != null
        ? getPriceTierByBuyerPriceMinor(input.buyerPriceMinor)
        : undefined;
  if (!tier || !tier.enabled) {
    throw new Error("INVALID_PRICE_TIER");
  }
  assertTierInvariant(tier);
  if (input.buyerPriceMinor != null && tier.buyerPriceMinor !== input.buyerPriceMinor) {
    throw new Error("PRICE_TIER_MISMATCH");
  }
  return tier;
}

export function listPublicPriceTiers(): Array<{
  id: string;
  currency: "USD";
  buyerPriceMinor: number;
  sortOrder: number;
}> {
  return getEnabledPriceTiers().map((t) => ({
    id: t.id,
    currency: t.currency,
    buyerPriceMinor: t.buyerPriceMinor,
    sortOrder: t.sortOrder,
  }));
}
