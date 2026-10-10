import { describe, expect, it, vi } from "vitest";
import { createJobDeliveryProblemReport } from "./job-problem-report.js";

describe("createJobDeliveryProblemReport (BUYERUX-015)", () => {
  it("returns existing OPEN report idempotently", async () => {
    const createReport = vi.fn();
    const prisma = {
      job: {
        findUnique: async () => ({
          id: "job-1",
          buyerId: "buyer-1",
          status: "COMPLETED",
          capabilityId: "cap-1",
          capabilityVersionId: "ver-1",
          versionNumber: 1,
          priceSnapshotCents: 100,
          currency: "USD",
          platformFeeSnapshotCents: 10,
          sellerNetSnapshotCents: 90,
          permissionManifestSnapshot: {},
          inputContractSnapshot: {},
          outputContractSnapshot: {},
          scheduledRunAt: null,
          buyerHardDeadlineAt: null,
          completedAt: new Date(),
          input: { structuredInput: {}, assetManifest: null },
          result: { structuredOutput: {}, outputAssetManifest: null },
        }),
      },
      jobDeliveryProblemReport: {
        findFirst: async () => ({ id: "report-existing" }),
        create: createReport,
      },
      auditEvent: { create: vi.fn() },
    } as never;
    const result = await createJobDeliveryProblemReport(prisma, {
      jobId: "job-1",
      reporterUserId: "buyer-1",
      reason: "OTHER",
    });
    expect(result).toEqual({ reportId: "report-existing" });
    expect(createReport).not.toHaveBeenCalled();
  });
});
