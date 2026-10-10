import { describe, expect, it } from "vitest";
import { marketplaceServiceContract } from "./service-contract.js";

describe("marketplace service contract", () => {
  it("keeps identity, price, permissions, and availability on one version", () => {
    const contract = marketplaceServiceContract({
      identity: { name: "Research", seller: "Ada", description: "Public research" },
      version: { versionId: "ver-1" },
      io: { accepts: ["question"], outputs: ["report"] },
      permissions: ["skill:company-research"],
      dependencies: ["company-db"],
      network: "PUBLIC_WEB_RESEARCH",
      commercial: { priceCents: 800, sellerEarningCents: 640, platformFeeCents: 160 },
      availability: { status: "ONLINE", nextAvailableAt: null },
      delivery: { success: "declared output file is stored" },
    });
    expect(contract.version.immutable).toBe(true);
    expect(JSON.stringify(contract)).not.toContain("OpenClaw path");
    expect(() =>
      marketplaceServiceContract({
        ...contract,
        version: { versionId: "ver-1" },
        network: "ARBITRARY_REMOTE_CONTROL_OF_SELLER_NETWORK",
      }),
    ).toThrow(/NETWORK_NOT_A_SERVICE_PRIMITIVE/);
  });
});
