import { describe, expect, it } from "vitest";
import { assertPublicSellerPayloadSafe, buildPublicSellerIdentity } from "./marketplace-identity.js";

describe("marketplace identity SELLERUX-034..035", () => {
  it("public payload excludes KYC fields", () => {
    const profile = {
      id: "sp1",
      displayName: "Studio Alpha",
      verificationStatus: "UNVERIFIED",
      legalNameForKyc: "Legal Name Hidden",
      payoutStatus: "NOT_STARTED",
      connectOnboardingStatus: null,
    } as never;
    const pub = buildPublicSellerIdentity(profile);
    expect(pub.marketplaceDisplayName).toBe("Studio Alpha");
    expect(() =>
      assertPublicSellerPayloadSafe({
        ...pub,
        legalNameForKyc: "leak",
      } as Record<string, unknown>),
    ).toThrow(/PUBLIC_SELLER_LEAK/);
  });
});
