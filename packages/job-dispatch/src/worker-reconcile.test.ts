import { describe, expect, it, vi } from "vitest";

vi.mock("./dispatch-service.js", () => ({
  recoverWorkerOfflineJob: vi.fn(async () => ({ status: "QUEUED" })),
}));

import { recoverWorkerOfflineJob } from "./dispatch-service.js";
import { reconcileWorkerSessionOnReconnect } from "./worker-reconcile.js";

/** M26-FAULT-004 / process restart — worker reconnect reconciles expired offers. */
describe("reconcileWorkerSessionOnReconnect", () => {
  it("M26-FAULT-010 M26-GOLD-007 recovers expired DISPATCHED offers on reconnect", async () => {
    const prisma = {
      job: {
        findMany: vi.fn(async () => [
          { id: "j-expired", dispatchExpiresAt: new Date(0) },
          { id: "j-open", dispatchExpiresAt: new Date(Date.now() + 60_000) },
        ]),
        count: vi.fn(async () => 1),
      },
    };
    const result = await reconcileWorkerSessionOnReconnect(prisma as never, "wd-1");
    expect(result.openDispatched).toBe(2);
    expect(result.expiredOffersRecovered).toBe(1);
    expect(recoverWorkerOfflineJob).toHaveBeenCalledWith(prisma, "j-expired");
  });
});
