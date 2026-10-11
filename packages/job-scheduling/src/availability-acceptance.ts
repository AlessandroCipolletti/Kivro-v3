import { deriveWorkerHealthLabel } from "@kivro/seller-health";
import { evaluateAcceptingNewJobs } from "./accepting-jobs.js";
import type { CapabilityScheduleConfig } from "./weekly-schedule.js";
import { availabilityAfterDependencyFailure } from "./dependency-isolation.js";

const openSchedule: CapabilityScheduleConfig = {
  mode: "ALWAYS_AVAILABLE",
  timezone: "UTC",
  windows: [],
};

export function claimDispatchSlot(active: number, max: number): { ok: boolean; active: number } {
  if (active >= max) {
    return { ok: false, active };
  }
  return { ok: true, active: active + 1 };
}

export function capacityAfterPaymentResult(input: {
  payment: "failed" | "captured";
  capacityReserved: boolean;
}): { capacityReserved: boolean } {
  if (input.payment === "failed") {
    return { capacityReserved: false };
  }
  return { capacityReserved: input.capacityReserved };
}

export function jobUpdateAfterPaymentRelease(status: string): {
  reservedAmountCents: null;
  workerDeviceId?: null;
} {
  const holdsCapacity = ["CREATED", "PAYMENT_RESERVED", "SCHEDULED", "QUEUED", "DISPATCHED"].includes(status);
  const capacity = capacityAfterPaymentResult({ payment: "failed", capacityReserved: holdsCapacity });
  if (holdsCapacity && !capacity.capacityReserved) {
    return { reservedAmountCents: null, workerDeviceId: null };
  }
  return { reservedAmountCents: null };
}

/** A disconnect follows the durable recovery rule. A running job is not rewritten here. */
export function jobStateAfterWorkerDisconnect(status: "DISPATCHED" | "RUNNING" | "QUEUED"): "QUEUED" | "RUNNING" {
  if (status === "RUNNING") {
    return "RUNNING";
  }
  return "QUEUED";
}

export function reconcileOnReconnect(durableStatus: string): { status: string; createdNewJob: false } {
  return { status: durableStatus, createdNewJob: false };
}

export function heartbeatAvailability(input: { lastSeenAt: Date | null; now: Date }): "ONLINE" | "OFFLINE" {
  const label = deriveWorkerHealthLabel({
    deviceStatus: "ONLINE",
    lastSeenAt: input.lastSeenAt,
    report: null,
    sellerEmergencyPause: false,
    warnings: [],
    now: input.now,
  });
  return label === "OFFLINE" ? "OFFLINE" : "ONLINE";
}

export function availabilityAcceptanceSnapshot(input: {
  workerDeviceStatus: string;
  schedule?: CapabilityScheduleConfig;
  activeJobCount?: number;
  maxConcurrentJobs?: number;
  queuedJobCount?: number;
  maxQueuedJobs?: number;
  securityBlocksDispatch?: boolean;
}): { accepting: boolean; status: string; reasons: string[] } {
  const evaluation = evaluateAcceptingNewJobs({
    capabilityPublished: true,
    schedule: input.schedule ?? openSchedule,
    workerDeviceStatus: input.workerDeviceStatus,
    hasActiveJobOnWorker: (input.activeJobCount ?? 0) > 0,
    activeJobCountOnWorker: input.activeJobCount,
    maxConcurrentJobs: input.maxConcurrentJobs,
    queuedJobCount: input.queuedJobCount,
    maxQueuedJobs: input.maxQueuedJobs,
    globalDispatchEnabled: true,
    securityBlocksDispatch: input.securityBlocksDispatch,
  });
  return {
    accepting: evaluation.accepting,
    status: evaluation.buyerAvailability,
    reasons: evaluation.reasons,
  };
}

export { availabilityAfterDependencyFailure };
