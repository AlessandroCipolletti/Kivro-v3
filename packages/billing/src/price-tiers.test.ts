import { describe, expect, it } from "vitest";
import { MARKETPLACE_PRICE_TIERS, assertTierInvariant } from "./price-tiers.js";

describe("canonical price tiers §282", () => {
  it("every tier satisfies buyer = fee + seller", () => {
    for (const tier of MARKETPLACE_PRICE_TIERS) {
      expect(() => assertTierInvariant(tier)).not.toThrow();
    }
  });

  it("includes $9.99 tier mapping", () => {
    const tier = MARKETPLACE_PRICE_TIERS.find((t) => t.id === "USD_999");
    expect(tier?.buyerPriceMinor).toBe(999);
    expect(tier?.platformFeeMinor).toBe(199);
    expect(tier?.sellerNetMinor).toBe(800);
  });
});
