import { describe, expect, it } from "vitest";
import { canSellerReceivePaidJobs, mapSellerConnectStatus } from "./connect-eligibility.js";

describe("Connect eligibility §24.7", () => {
  it("maps ready when payouts and transfers active", () => {
    const status = mapSellerConnectStatus({
      stripeConnectedAccountId: "acct_1",
      connectOnboardingStatus: "READY",
      payoutsEnabled: true,
      transfersCapabilityStatus: "active",
    });
    expect(status).toBe("READY");
  });

  it("respects dev payment shortcuts", () => {
    const prevNode = process.env.NODE_ENV;
    const prevDev = process.env.KIVRO_DEV_PAYMENT_SHORTCUTS;
    process.env.NODE_ENV = "development";
    process.env.KIVRO_DEV_PAYMENT_SHORTCUTS = "true";
    expect(
      canSellerReceivePaidJobs({
        stripeConnectedAccountId: null,
        connectOnboardingStatus: null,
        payoutsEnabled: false,
        transfersCapabilityStatus: null,
      }),
    ).toBe(true);
    process.env.NODE_ENV = prevNode;
    process.env.KIVRO_DEV_PAYMENT_SHORTCUTS = prevDev;
  });
});
