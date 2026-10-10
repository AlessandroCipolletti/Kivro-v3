import { describe, expect, it } from "vitest";
import { aggregateCapabilityRating, assertPublicSellerPayloadSafe, publicSellerPage } from "./marketplace-identity.js";

describe("public seller page", () => {
  it("shows marketplace activity and rejects machine details", () => {
    const page = publicSellerPage({
      displayName: "Ada",
      memberSince: new Date("2026-01-02T00:00:00.000Z"),
      aggregateRating: 4.83,
      completedJobs: 12,
      publishedCapabilityCount: 2,
      verificationStatus: "VERIFIED",
    });
    expect(page.memberSince).toBe("2026-01-02T00:00:00.000Z");
    expect(page.aggregateRating).toBe(4.8);
    expect(page.completedJobs).toBe(12);
    expect(() =>
      assertPublicSellerPayloadSafe({
        ...page,
        localIp: "192.168.1.20",
      }),
    ).toThrow(/PUBLIC_SELLER_LEAK/);
    expect(aggregateCapabilityRating([{ rating: 5, reviewCount: 1 }, { rating: 4, reviewCount: 1 }])).toBe(4.5);
  });
});
