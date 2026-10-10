/** SELLERUX-036/037 — seller owns many Workers; routing uses explicit assignments. */

export type AssignedWorkerCandidate = {
  workerDeviceId: string;
  deviceStatus: string;
  bindingStatus: "ACTIVE" | "INACTIVE";
  activeJobCount: number;
  securityBlocksDispatch: boolean;
};

/**
 * Pick one eligible assigned Worker.
 * Least-loaded ONLINE device wins; ties break on worker id.
 * Unassigned, revoked, offline, blocked, or full devices are skipped.
 */
export function selectEligibleAssignedWorker(input: {
  candidates: AssignedWorkerCandidate[];
  maxConcurrentJobs: number;
}): AssignedWorkerCandidate | null {
  const max = Math.max(1, input.maxConcurrentJobs);
  const eligible = input.candidates.filter(
    (candidate) =>
      candidate.bindingStatus === "ACTIVE" &&
      candidate.deviceStatus === "ONLINE" &&
      !candidate.securityBlocksDispatch &&
      candidate.activeJobCount < max,
  );
  eligible.sort((a, b) => {
    if (a.activeJobCount !== b.activeJobCount) {
      return a.activeJobCount - b.activeJobCount;
    }
    return a.workerDeviceId.localeCompare(b.workerDeviceId);
  });
  return eligible[0] ?? null;
}

/** Assignments that must follow a new published version, excluding the publishing Worker. */
export function assignmentsToCarryForward(input: {
  prior: Array<{
    workerDeviceId: string;
    localWorkerId: string;
    sellerProfileId: string;
    deviceStatus: string;
  }>;
  publishingWorkerDeviceId: string;
  sellerProfileId: string;
}): Array<{ workerDeviceId: string; localWorkerId: string }> {
  return input.prior
    .filter(
      (row) =>
        row.workerDeviceId !== input.publishingWorkerDeviceId &&
        row.sellerProfileId === input.sellerProfileId &&
        row.deviceStatus !== "REVOKED",
    )
    .map((row) => ({ workerDeviceId: row.workerDeviceId, localWorkerId: row.localWorkerId }));
}

/** Availability inputs derived from the whole assigned pool, not a singleton device. */
export function summarizeAssignedWorkerPool(input: {
  candidates: AssignedWorkerCandidate[];
  maxConcurrentJobs: number;
}): {
  selectedWorkerDeviceId: string | null;
  workerDeviceStatus: string;
  activeJobCount: number;
  hasActiveJob: boolean;
  securityBlocksDispatch: boolean;
} {
  const selected = selectEligibleAssignedWorker(input);
  if (selected) {
    return {
      selectedWorkerDeviceId: selected.workerDeviceId,
      workerDeviceStatus: selected.deviceStatus,
      activeJobCount: selected.activeJobCount,
      hasActiveJob: selected.activeJobCount > 0,
      securityBlocksDispatch: false,
    };
  }
  const max = Math.max(1, input.maxConcurrentJobs);
  const active = input.candidates.filter((c) => c.bindingStatus === "ACTIVE");
  const online = active.filter((c) => c.deviceStatus === "ONLINE");
  if (online.length > 0) {
    const withRoom = online.filter((c) => c.activeJobCount < max);
    const blockedDespiteRoom = withRoom.length > 0 && withRoom.every((c) => c.securityBlocksDispatch);
    return {
      selectedWorkerDeviceId: null,
      workerDeviceStatus: "ONLINE",
      activeJobCount: blockedDespiteRoom ? 0 : max,
      hasActiveJob: !blockedDespiteRoom,
      securityBlocksDispatch: blockedDespiteRoom,
    };
  }
  return {
    selectedWorkerDeviceId: null,
    workerDeviceStatus: "OFFLINE",
    activeJobCount: 0,
    hasActiveJob: false,
    securityBlocksDispatch: false,
  };
}
