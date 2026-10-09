import type { MarketplacePriceTier } from "./price-tiers.js";

/** §280 — seller-facing fee breakdown (buyer sees retail only elsewhere). */
export function sellerPricingBreakdown(tier: MarketplacePriceTier): {
  buyerPaysMinor: number;
  marketplaceFeeMinor: number;
  sellerEarnsMinor: number;
  currency: "USD";
} {
  return {
    buyerPaysMinor: tier.buyerPriceMinor,
    marketplaceFeeMinor: tier.platformFeeMinor,
    sellerEarnsMinor: tier.sellerNetMinor,
    currency: tier.currency,
  };
}

/** §25 — illustrative margin helper (inference cost is seller-side, not platform fee). */
export function estimateSellerMarginMinor(
  tier: MarketplacePriceTier,
  estimatedProviderCostMinor: number,
): { sellerNetMinor: number; estimatedMarginMinor: number } {
  const sellerNetMinor = tier.sellerNetMinor;
  return {
    sellerNetMinor,
    estimatedMarginMinor: Math.max(0, sellerNetMinor - estimatedProviderCostMinor),
  };
}
