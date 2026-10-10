import { describe, expect, it } from "vitest";
import { publicCapabilityForBuyer } from "./public-capability.js";

describe("public capability", () => {
  it("omits the worker manifest and the seller account id", () => {
    const view = publicCapabilityForBuyer({
      id: "cap",
      slug: "research",
      name: "Research",
      description: "Public",
      status: "PUBLISHED",
      visibility: "PUBLIC",
      marketplaceCategory: "Research",
      priceTierCents: 240,
      currency: "USD",
      rating: 4.9,
      reviewCount: 3,
      estimatedDuration: 60,
      currentVersion: {
        id: "ver",
        versionNumber: 2,
        priceSnapshotCents: 240,
        currency: "USD",
        inputSchema: { fields: [] },
        outputSchema: { fields: [] },
        workerManifest: { localPath: "/Users/seller/.openclaw" },
      },
      sellerProfile: { userId: "user-secret" },
    });
    const json = JSON.stringify(view);
    expect(json).not.toContain("openclaw");
    expect(json).not.toContain("user-secret");
    expect(json).not.toContain("workerManifest");
    expect(view.currentVersion?.inputSchema).toEqual({ fields: [] });
  });
});
