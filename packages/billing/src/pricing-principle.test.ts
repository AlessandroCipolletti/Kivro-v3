import { describe, expect, it } from "vitest";
import { getPriceTierById } from "./price-tiers.js";
import { pricingProductPrincipleCopy } from "./buyer-billing-read.js";
import { listPublicPriceTiers } from "./tier-validation.js";

/** Master Spec §298 */
describe("pricing product principle", () => {
  it("buyer-facing tiers expose only job price", () => {
    const publicTiers = listPublicPriceTiers();
    expect(publicTiers.every((t) => t.buyerPriceMinor > 0)).toBe(true);
    expect(publicTiers[0]).not.toHaveProperty("platformFeeMinor");
  });

  it("seller copy matches tier economics for USD_999", () => {
    const tier = getPriceTierById("USD_999");
    expect(tier).toBeDefined();
    const copy = pricingProductPrincipleCopy(tier!);
    expect(copy.buyerMessage).toContain("9.99");
    expect(copy.sellerMessage).toContain("8.00");
    expect(copy.breakdown.sellerEarnsMinor).toBe(800);
  });
});
