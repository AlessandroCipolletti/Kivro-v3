import { describe, expect, it, vi } from "vitest";
import { reconcileJobResultIntegrity } from "./reconcile-result-integrity.js";

describe("reconcileJobResultIntegrity (ASYNC-GOLD-009)", () => {
  it("flags completed job with missing stored asset", async () => {
    const prisma = {
      job: {
        findUnique: vi.fn(async () => ({
          id: "j1",
          status: "COMPLETED",
          resultRetentionExpiresAt: new Date(Date.now() + 86_400_000),
          result: {
            outputAssetManifest: [{ assetId: "a1", filename: "out.pdf" }],
          },
        })),
      },
      storedAsset: {
        findUnique: vi.fn(async () => null),
      },
    };
    const report = await reconcileJobResultIntegrity(prisma as never, "j1");
    expect(report.healthy).toBe(false);
    expect(report.issues.some((i) => i.includes("missing object"))).toBe(true);
  });
});
