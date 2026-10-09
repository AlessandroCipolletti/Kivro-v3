import { describe, expect, it } from "vitest";
import { requireEnabledPriceTier } from "./tier-validation.js";

describe("requireEnabledPriceTier", () => {
  it("accepts canonical tier id", () => {
    const tier = requireEnabledPriceTier({ priceTierId: "USD_499" });
    expect(tier.buyerPriceMinor).toBe(499);
  });

  it("rejects non-table prices", () => {
    expect(() => requireEnabledPriceTier({ buyerPriceMinor: 500 })).toThrow("INVALID_PRICE_TIER");
  });
});
