import { describe, expect, it, vi } from "vitest";
import { validateCloudDeliverables } from "./cloud-finalization.js";

describe("M29 cloud finalization barrier", () => {
  it("ASYNC-GOLD-005 rejects completion without deliverables", () => {
    const result = validateCloudDeliverables({
      outputContractSnapshot: { contractVersion: 1, fields: [] },
      deliverables: {},
    });
    expect(result.ok).toBe(false);
  });

  it("accepts structured-only deliverables for v1 contract", () => {
    const result = validateCloudDeliverables({
      outputContractSnapshot: { contractVersion: 1, fields: [] },
      deliverables: { structuredOutput: { summary: "ok" } },
    });
    expect(result.ok).toBe(true);
  });

  it("ASYNC-GOLD-006 requires required file outputs in manifest", () => {
    const result = validateCloudDeliverables({
      outputContractSnapshot: {
        contractVersion: 2,
        fields: [{ key: "report", type: "FILE", required: true }],
      },
      deliverables: { structuredOutput: { report: "x" } },
    });
    expect(result.ok).toBe(false);
  });
});

describe("runCloudFinalizationBarrier storage checks", () => {
  it("ASYNC-GOLD-009 flags missing stored assets", async () => {
    const { verifyDeliverableAssetsInStorage } = await import("./cloud-finalization.js");
    const prisma = {
      storedAsset: {
        findUnique: vi.fn(async () => null),
      },
    };
    const result = await verifyDeliverableAssetsInStorage(prisma as never, {
      assets: [{ assetId: "a1", filename: "out.pdf" }],
    });
    expect(result.ok).toBe(false);
  });
});
