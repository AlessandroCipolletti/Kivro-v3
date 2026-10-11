import { describe, expect, it } from "vitest";
import { buyerPurchaseAction, rankAgentCandidates } from "@kivro/marketplace";
import {
  availabilityAcceptanceSnapshot,
  availabilityAfterDependencyFailure,
  capacityAfterPaymentResult,
  claimDispatchSlot,
  heartbeatAvailability,
  jobStateAfterWorkerDisconnect,
  jobUpdateAfterPaymentRelease,
  reconcileOnReconnect,
} from "./availability-acceptance.js";

const listing = {
  id: "cap",
  slug: "cap",
  name: "Research",
  description: "Research",
  category: "Research",
  priceTierCents: 100,
  currency: "USD",
  rating: 5,
  jobCount: 1,
  estimatedDuration: 30,
  sellerDisplayName: "Seller",
};

describe("availability acceptance", () => {
  it("follows heartbeat, pause, queue, payment, and reconnect rules", () => {
    const now = new Date("2026-10-10T12:00:00Z");
    expect(heartbeatAvailability({ lastSeenAt: now, now })).toBe("ONLINE");
    expect(heartbeatAvailability({ lastSeenAt: new Date(now.getTime() - 130_000), now })).toBe("OFFLINE");

    const offline = availabilityAcceptanceSnapshot({ workerDeviceStatus: "OFFLINE" });
    expect(offline.accepting).toBe(false);
    expect(buyerPurchaseAction({ accepting: offline.accepting, availabilityStatus: "OFFLINE" })).toBe("UNAVAILABLE");

    const paused = availabilityAcceptanceSnapshot({
      workerDeviceStatus: "ONLINE",
      schedule: { mode: "MANUALLY_PAUSED", timezone: "UTC", windows: [] },
    });
    expect(paused.accepting).toBe(false);
    expect(paused.status).toBe("PAUSED");
    expect(buyerPurchaseAction({ accepting: false, availabilityStatus: "PAUSED" })).toBe("UNAVAILABLE");

    const resumed = availabilityAcceptanceSnapshot({ workerDeviceStatus: "ONLINE", securityBlocksDispatch: true });
    expect(resumed.accepting).toBe(false);
    const ready = availabilityAcceptanceSnapshot({ workerDeviceStatus: "ONLINE" });
    expect(ready.accepting).toBe(true);

    const busy = availabilityAcceptanceSnapshot({ workerDeviceStatus: "ONLINE", activeJobCount: 1, maxConcurrentJobs: 1 });
    expect(busy.reasons).toContain("CONCURRENCY_LIMIT");
    const queued = availabilityAcceptanceSnapshot({ workerDeviceStatus: "ONLINE", queuedJobCount: 2, maxQueuedJobs: 2 });
    expect(queued.reasons).toContain("QUEUE_MAXIMUM");

    const first = claimDispatchSlot(0, 1);
    const second = claimDispatchSlot(first.active, 1);
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    expect(capacityAfterPaymentResult({ payment: "failed", capacityReserved: true })).toEqual({
      capacityReserved: false,
    });
    expect(jobUpdateAfterPaymentRelease("QUEUED")).toEqual({
      reservedAmountCents: null,
      workerDeviceId: null,
    });
    expect(jobUpdateAfterPaymentRelease("RUNNING")).toEqual({ reservedAmountCents: null });

    const isolated = availabilityAfterDependencyFailure({
      capabilities: [
        { id: "a", dependencyIds: ["db"] },
        { id: "b", dependencyIds: ["files"] },
      ],
      failedDependencyId: "db",
    });
    expect(isolated).toEqual([
      { id: "a", availability: "DEPENDENCY_FAILED" },
      { id: "b", availability: "ONLINE" },
    ]);

    const agent = rankAgentCandidates(
      [{ ...listing, availabilityStatus: ready.status, accepting: ready.accepting }],
      { query: "research", constraints: {} },
    );
    expect(agent[0]?.id).toBe("cap");
    expect(jobStateAfterWorkerDisconnect("DISPATCHED")).toBe("QUEUED");
    expect(jobStateAfterWorkerDisconnect("RUNNING")).toBe("RUNNING");
    expect(reconcileOnReconnect("QUEUED")).toEqual({ status: "QUEUED", createdNewJob: false });
    expect(ready.status).toBe(availabilityAcceptanceSnapshot({ workerDeviceStatus: "ONLINE" }).status);
  });
});
