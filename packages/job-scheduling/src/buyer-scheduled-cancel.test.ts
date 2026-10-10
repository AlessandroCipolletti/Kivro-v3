import { describe, expect, it, vi } from "vitest";
import { buyerCancelScheduledOrQueuedJob } from "./buyer-scheduled-cancel.js";

describe("buyerCancelScheduledOrQueuedJob (BUYERUX-008)", () => {
  it("uses atomic updateMany for cancel-vs-claim safety", async () => {
    const updateMany = vi.fn(async () => ({ count: 1 }));
    const create = vi.fn(async () => ({}));
    const prisma = {
      job: {
        findUnique: vi.fn(async () => ({
          id: "j1",
          buyerId: "b1",
          status: "QUEUED",
        })),
      },
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          job: { updateMany },
          jobStateTransition: { create },
        }),
      ),
    };
    const result = await buyerCancelScheduledOrQueuedJob(prisma as never, {
      jobId: "j1",
      buyerId: "b1",
    });
    expect(result).toEqual({ status: "CANCELLED" });
    expect(updateMany).toHaveBeenCalled();
  });
});
