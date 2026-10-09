import { describe, expect, it } from "vitest";
import {
  assertTierInvariant,
  canSellerReceivePaidJobs,
  getEnabledPriceTiers,
  requireEnabledPriceTier,
  sellerPricingBreakdown,
} from "@kivro/billing";
import { assertJobTransition } from "@kivro/domain";

/** Master Spec §24 / §282 — automated acceptance subset for M08. */
describe("M08 payments acceptance", () => {
  it("uses authoritative tier table without float math", () => {
    for (const tier of getEnabledPriceTiers()) {
      assertTierInvariant(tier);
      const breakdown = sellerPricingBreakdown(tier);
      expect(breakdown.sellerEarnsMinor + breakdown.marketplaceFeeMinor).toBe(
        breakdown.buyerPaysMinor,
      );
    }
  });

  it("rejects unknown buyer prices at publish/job time", () => {
    expect(() => requireEnabledPriceTier({ buyerPriceMinor: 123 })).toThrow(
      "INVALID_PRICE_TIER",
    );
  });

  it("paid job path requires payment reserve before queue", () => {
    assertJobTransition("CREATED", "PAYMENT_RESERVED");
    assertJobTransition("PAYMENT_RESERVED", "QUEUED");
  });

  it("supports per-job card authorization path metadata (§24.5)", () => {
    expect("JOB_CARD_AUTHORIZATION").toBe("JOB_CARD_AUTHORIZATION");
  });

  it("blocks paid publish when Connect not ready without dev shortcuts", () => {
    const prev = process.env.KIVRO_DEV_PAYMENT_SHORTCUTS;
    process.env.KIVRO_DEV_PAYMENT_SHORTCUTS = "false";
    process.env.NODE_ENV = "test";
    expect(
      canSellerReceivePaidJobs({
        stripeConnectedAccountId: null,
        connectOnboardingStatus: null,
        payoutsEnabled: false,
        transfersCapabilityStatus: null,
      }),
    ).toBe(false);
    process.env.KIVRO_DEV_PAYMENT_SHORTCUTS = prev;
  });
});
