import { describe, expect, it, vi } from "vitest";
import { sampleCompletedJobIntegrity } from "./completed-integrity-sample.js";

describe("sampleCompletedJobIntegrity (ASYNC-028 / ASYNC-GOLD-009)", () => {
  it("counts unhealthy completed jobs in bounded sample", async () => {
    const prisma = {
      job: {
        findMany: vi.fn(async () => [{ id: "j-ok" }, { id: "j-bad" }]),
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => ({
          id: where.id,
          status: "COMPLETED",
          resultRetentionExpiresAt: new Date(Date.now() + 86_400_000),
          result: {
            outputAssetManifest:
              where.id === "j-bad" ? [{ assetId: "a1", filename: "out.pdf" }] : [],
          },
        })),
      },
      storedAsset: {
        findUnique: vi.fn(async () => null),
      },
    };

    const report = await sampleCompletedJobIntegrity(prisma as never, 2);
    expect(report.sampled).toBe(2);
    expect(report.unhealthy).toBe(1);
    expect(report.jobIds).toEqual(["j-bad"]);
  });
});
