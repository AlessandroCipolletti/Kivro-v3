import { describe, expect, it } from "vitest";
import { validateBuyerSubmissionAssets } from "./buyer-asset-validation.js";

describe("validateBuyerSubmissionAssets (BUYERUX-017)", () => {
  it("rejects expired buyer upload assets", async () => {
    const prisma = {
      storedAsset: {
        findUnique: async () => ({
          buyerId: "buyer-1",
          uploadConfirmedAt: new Date(),
          retentionExpiresAt: new Date(Date.now() - 1000),
          sizeBytes: 100n,
          mimeType: "application/pdf",
        }),
      },
    } as never;
    const result = await validateBuyerSubmissionAssets(prisma, {
      buyerId: "buyer-1",
      assets: { doc: [{ assetId: "a1", filename: "x.pdf" }] },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("INPUT_ASSET_EXPIRED");
    }
  });

  it("rejects assets not owned by buyer", async () => {
    const prisma = {
      storedAsset: {
        findUnique: async () => ({
          buyerId: "other",
          uploadConfirmedAt: new Date(),
          retentionExpiresAt: null,
          sizeBytes: 1n,
          mimeType: null,
        }),
      },
    } as never;
    const result = await validateBuyerSubmissionAssets(prisma, {
      buyerId: "buyer-1",
      assets: { doc: [{ assetId: "a1", filename: "x.pdf" }] },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("INPUT_ASSET_INVALID");
    }
  });

  it("normalizes sizeBytes from storage when omitted", async () => {
    const prisma = {
      storedAsset: {
        findUnique: async () => ({
          buyerId: "buyer-1",
          uploadConfirmedAt: new Date(),
          retentionExpiresAt: null,
          sizeBytes: 2048n,
          mimeType: "text/plain",
        }),
      },
    } as never;
    const result = await validateBuyerSubmissionAssets(prisma, {
      buyerId: "buyer-1",
      assets: { doc: [{ assetId: "a1", filename: "x.txt" }] },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.normalized.doc?.[0]?.sizeBytes).toBe(2048);
    }
  });
});
