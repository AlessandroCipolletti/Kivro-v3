/** Master Spec §120 — one marketplace user may act as buyer, seller, or both. */

export type MarketplaceParticipation = "BUYER_ONLY" | "SELLER_ONLY" | "BOTH" | "NEITHER";

export interface UnifiedAccountView {
  userId: string;
  hasAcceptedMarketplaceTerms: boolean;
  sellerProfileId: string | null;
  participation: MarketplaceParticipation;
}

export function deriveMarketplaceParticipation(input: {
  marketplaceTermsAcceptedAt: Date | null;
  sellerProfileId: string | null;
  hasBuyerActivity: boolean;
}): MarketplaceParticipation {
  const canBuy = input.marketplaceTermsAcceptedAt !== null;
  const canSell = input.sellerProfileId !== null;

  if (canBuy && canSell) {
    return "BOTH";
  }
  if (canSell) {
    return "SELLER_ONLY";
  }
  if (canBuy || input.hasBuyerActivity) {
    return "BUYER_ONLY";
  }
  return "NEITHER";
}
