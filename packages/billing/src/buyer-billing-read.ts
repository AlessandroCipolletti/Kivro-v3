import type { PrismaClient } from "@kivro/database";
import { getBuyerCreditBalanceCents } from "./ledger-service.js";
import { listPublicPriceTiers } from "./tier-validation.js";
import type { MarketplacePriceTier } from "./price-tiers.js";
import { sellerPricingBreakdown } from "./seller-economics.js";

export async function getBuyerBillingSummary(prisma: PrismaClient, buyerId: string) {
  const balance = await getBuyerCreditBalanceCents(prisma, buyerId);
  const entries = await prisma.ledgerEntry.findMany({
    where: { userId: buyerId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return {
    currency: "USD" as const,
    ...balance,
    tiers: listPublicPriceTiers(),
    transactions: entries.map((e) => ({
      id: e.id,
      type: e.type,
      amountCents: e.amountCents,
      jobId: e.jobId,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

/** §298 — buyer sees job price; seller sees deterministic tier economics. */
export function pricingProductPrincipleCopy(tier: MarketplacePriceTier): {
  buyerMessage: string;
  sellerMessage: string;
  breakdown: ReturnType<typeof sellerPricingBreakdown>;
} {
  const breakdown = sellerPricingBreakdown(tier);
  const buyerDollars = (tier.buyerPriceMinor / 100).toFixed(2);
  const sellerDollars = (tier.sellerNetMinor / 100).toFixed(2);
  return {
    buyerMessage: `The price you see ($${buyerDollars}) is the price of the job.`,
    sellerMessage: `Choose tier ${tier.id}. When the job succeeds, you earn $${sellerDollars}.`,
    breakdown,
  };
}
