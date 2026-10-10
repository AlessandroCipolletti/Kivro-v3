import { describe, expect, it, vi } from "vitest";

vi.mock("./job-payment.js", () => ({
  captureAndSettleJobPayment: vi.fn(async () => ({ settled: true })),
}));

/** M26-GOLD-002 duplicate job completion */
describe("markJobDeliveredAndSettle duplicate completion (M26-FAULT-002)", () => {
  it("M26-GOLD-002 re-invokes idempotent capture when already COMPLETED", async () => {
    const { captureAndSettleJobPayment } = await import("./job-payment.js");
    const { markJobDeliveredAndSettle } = await import("./job-completion.js");
    const prisma = {
      job: {
        findUnique: vi.fn(async () => ({
          id: "j1",
          workerDeviceId: "wd",
          status: "COMPLETED",
        })),
        update: vi.fn(),
      },
      jobStateTransition: { create: vi.fn() },
    };
    const result = await markJobDeliveredAndSettle(prisma as never, {
      jobId: "j1",
      workerDeviceId: "wd",
    });
    expect(result).toEqual({ status: "COMPLETED" });
    expect(captureAndSettleJobPayment).toHaveBeenCalledTimes(1);
  });
});
