import { describe, expect, it } from "vitest";
import {
  assignmentsToCarryForward,
  selectEligibleAssignedWorker,
  summarizeAssignedWorkerPool,
} from "./worker-routing.js";

const worker = (
  id: string,
  status: string,
  activeJobCount: number,
  extras: Partial<{ bindingStatus: "ACTIVE" | "INACTIVE"; securityBlocksDispatch: boolean }> = {},
) => ({
  workerDeviceId: id,
  deviceStatus: status,
  bindingStatus: extras.bindingStatus ?? ("ACTIVE" as const),
  activeJobCount,
  securityBlocksDispatch: extras.securityBlocksDispatch ?? false,
});

describe("multi-worker routing SELLERUX-036/037", () => {
  it("selects the other Worker when the first is offline", () => {
    const selected = selectEligibleAssignedWorker({
      maxConcurrentJobs: 1,
      candidates: [worker("worker-a", "OFFLINE", 0), worker("worker-b", "ONLINE", 0)],
    });
    expect(selected?.workerDeviceId).toBe("worker-b");
  });

  it("does not route to an unassigned or full Worker", () => {
    const selected = selectEligibleAssignedWorker({
      maxConcurrentJobs: 1,
      candidates: [
        worker("worker-a", "ONLINE", 0, { bindingStatus: "INACTIVE" }),
        worker("worker-b", "ONLINE", 1),
      ],
    });
    expect(selected).toBeNull();
  });

  it("prefers the least-loaded eligible Worker", () => {
    const selected = selectEligibleAssignedWorker({
      maxConcurrentJobs: 2,
      candidates: [worker("worker-b", "ONLINE", 1), worker("worker-a", "ONLINE", 0)],
    });
    expect(selected?.workerDeviceId).toBe("worker-a");
  });

  it("treats independent health: a blocked Worker does not hide a healthy one", () => {
    const summary = summarizeAssignedWorkerPool({
      maxConcurrentJobs: 1,
      candidates: [
        worker("worker-a", "ONLINE", 0, { securityBlocksDispatch: true }),
        worker("worker-b", "ONLINE", 0),
      ],
    });
    expect(summary.selectedWorkerDeviceId).toBe("worker-b");
    expect(summary.securityBlocksDispatch).toBe(false);
  });

  it("reports a security block when the only Worker with room is blocked", () => {
    const summary = summarizeAssignedWorkerPool({
      maxConcurrentJobs: 1,
      candidates: [
        worker("worker-a", "ONLINE", 0, { securityBlocksDispatch: true }),
        worker("worker-b", "ONLINE", 1),
      ],
    });
    expect(summary.selectedWorkerDeviceId).toBeNull();
    expect(summary.securityBlocksDispatch).toBe(true);
    expect(summary.activeJobCount).toBe(0);
  });

  it("carries other seller-owned Workers onto the next version", () => {
    const carried = assignmentsToCarryForward({
      publishingWorkerDeviceId: "worker-a",
      sellerProfileId: "seller-1",
      prior: [
        {
          workerDeviceId: "worker-a",
          localWorkerId: "local-a",
          sellerProfileId: "seller-1",
          deviceStatus: "ONLINE",
        },
        {
          workerDeviceId: "worker-b",
          localWorkerId: "local-b",
          sellerProfileId: "seller-1",
          deviceStatus: "ONLINE",
        },
        {
          workerDeviceId: "worker-c",
          localWorkerId: "local-c",
          sellerProfileId: "seller-2",
          deviceStatus: "ONLINE",
        },
        {
          workerDeviceId: "worker-d",
          localWorkerId: "local-d",
          sellerProfileId: "seller-1",
          deviceStatus: "REVOKED",
        },
      ],
    });
    expect(carried).toEqual([{ workerDeviceId: "worker-b", localWorkerId: "local-b" }]);
  });
});
