import type { SellerProfile } from "@kivro/database";
import { canSellerReceivePaidJobs, requireEnabledPriceTier } from "@kivro/billing";

export function assertPublishPaymentReady(
  seller: SellerProfile,
  priceTierCents: number,
): ReturnType<typeof requireEnabledPriceTier> {
  if (!canSellerReceivePaidJobs(seller)) {
    throw new Error("SELLER_PAYOUT_NOT_READY");
  }
  return requireEnabledPriceTier({ buyerPriceMinor: priceTierCents });
}
