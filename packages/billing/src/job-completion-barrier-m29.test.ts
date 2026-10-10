import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./job-payment.js", () => ({
  captureAndSettleJobPayment: vi.fn(async () => ({ settled: true })),
}));

vi.mock("@kivro/job-delivery", async () => {
  const actual = await vi.importActual<typeof import("@kivro/job-delivery")>("@kivro/job-delivery");
  return {
    ...actual,
    persistWorkerJobDeliverables: vi.fn(async () => ({ ok: true })),
    runCloudFinalizationBarrier: vi.fn(async () => ({
      ok: true as const,
      retentionExpiresAt: new Date(Date.now() + 86_400_000),
    })),
  };
});

describe("markJobDeliveredAndSettle M29 barrier", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ASYNC-GOLD-005 rejects UPLOADING_RESULT completion without deliverables", async () => {
    const { markJobDeliveredAndSettle } = await import("./job-completion.js");
    const prisma = {
      job: {
        findUnique: vi.fn(async () => ({
          id: "j1",
          workerDeviceId: "wd",
          status: "UPLOADING_RESULT",
          outputContractSnapshot: { contractVersion: 1, fields: [] },
        })),
        update: vi.fn(),
      },
      jobStateTransition: { create: vi.fn() },
    };
    const result = await markJobDeliveredAndSettle(prisma as never, {
      jobId: "j1",
      workerDeviceId: "wd",
    });
    expect(result).toEqual({ error: "DELIVERABLES_REQUIRED" });
  });

  it("transitions to RESULT_REJECTED when cloud barrier fails", async () => {
    const { runCloudFinalizationBarrier } = await import("@kivro/job-delivery");
    vi.mocked(runCloudFinalizationBarrier).mockResolvedValueOnce({
      ok: false,
      issues: ["missing stored asset a1"],
    });
    const { markJobDeliveredAndSettle } = await import("./job-completion.js");
    const prisma = {
      job: {
        findUnique: vi.fn(async () => ({
          id: "j1",
          workerDeviceId: "wd",
          status: "UPLOADING_RESULT",
          outputContractSnapshot: { contractVersion: 1, fields: [] },
        })),
        update: vi.fn(),
      },
      jobStateTransition: { create: vi.fn() },
    };
    const result = await markJobDeliveredAndSettle(prisma as never, {
      jobId: "j1",
      workerDeviceId: "wd",
      deliverables: { structuredOutput: { ok: true } },
    });
    expect(result).toEqual({ error: "RESULT_REJECTED" });
    expect(prisma.job.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "RESULT_REJECTED" }) }),
    );
  });
});
