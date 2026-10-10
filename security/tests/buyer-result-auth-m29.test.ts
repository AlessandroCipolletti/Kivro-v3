import { describe, expect, it, vi } from "vitest";

/** ASYNC-GOLD-006 authorization isolation (unit-level). */
describe("buyer result download authorization", () => {
  it("returns NOT_FOUND for wrong buyer via getBuyerJobDetail gate", async () => {
    const { createBuyerJobAssetDownload } = await import(
      "../../apps/api/src/services/buyer-job-download.js"
    );
    const prisma = {
      job: {
        findUnique: vi.fn(async () => ({
          id: "j1",
          buyerId: "buyer-a",
          status: "COMPLETED",
          resultRetentionExpiresAt: new Date(Date.now() + 86_400_000),
          capabilityVersion: { capability: { sellerProfile: { displayName: "s" } } },
          input: null,
          result: { structuredOutput: {}, outputAssetManifest: [] },
          transitions: [],
          auditEvents: [],
          review: null,
        })),
      },
      storedAsset: { findUnique: vi.fn() },
    };
    const result = await createBuyerJobAssetDownload(prisma as never, {
      jobId: "j1",
      buyerId: "buyer-b",
      assetRef: "a1",
    });
    expect(result).toEqual({ error: "NOT_FOUND", httpStatus: 404 });
  });
});
