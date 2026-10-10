import type { CapabilityScheduleConfig } from "./weekly-schedule.js";
import { isScheduleOpen } from "./weekly-schedule.js";
import { mapWorkerDeviceToBuyerAvailability, type BuyerAvailabilityStatus } from "./availability-status.js";

export type AcceptingJobsEvaluation = {
  accepting: boolean;
  buyerAvailability: BuyerAvailabilityStatus;
  reasons: string[];
};

/** Master Spec §402 — deterministic acceptance gate (MVP concurrency = 1). */
export function evaluateAcceptingNewJobs(input: {
  capabilityPublished: boolean;
  schedule: CapabilityScheduleConfig;
  workerDeviceStatus: string;
  hasActiveJobOnWorker: boolean;
  activeJobCountOnWorker?: number;
  maxConcurrentJobs?: number;
  globalDispatchEnabled: boolean;
  sellerEmergencyPause?: boolean;
  platformSecurityPause?: boolean;
  securityBlocksDispatch?: boolean;
  sellerMaintenanceMode?: boolean;
  now?: Date;
}): AcceptingJobsEvaluation {
  const reasons: string[] = [];
  if (!input.capabilityPublished) {
    reasons.push("NOT_PUBLISHED");
  }
  if (!input.globalDispatchEnabled) {
    reasons.push("GLOBAL_DISPATCH_DISABLED");
  }
  if (input.platformSecurityPause) {
    reasons.push("PLATFORM_SECURITY_PAUSE");
  }
  if (input.sellerEmergencyPause) {
    reasons.push("EMERGENCY_PAUSE");
  }
  if (input.sellerMaintenanceMode) {
    reasons.push("SELLER_MAINTENANCE");
  }
  if (input.securityBlocksDispatch) {
    reasons.push("SECURITY_NOT_READY");
  }
  if (input.schedule.mode === "MANUALLY_PAUSED") {
    reasons.push("MANUALLY_PAUSED");
  }
  const scheduleOpen = isScheduleOpen(input.schedule, input.now);
  if (!scheduleOpen) {
    reasons.push("SCHEDULE_CLOSED");
  }
  if (input.workerDeviceStatus !== "ONLINE") {
    reasons.push("WORKER_NOT_ONLINE");
  }
  const activeCount = input.activeJobCountOnWorker ?? (input.hasActiveJobOnWorker ? 1 : 0);
  const maxConcurrent = Math.max(1, input.maxConcurrentJobs ?? 1);
  if (activeCount >= maxConcurrent) {
    reasons.push("CONCURRENCY_LIMIT");
  }
  const buyerAvailability = mapWorkerDeviceToBuyerAvailability({
    deviceStatus: input.workerDeviceStatus,
    sellerGlobalPause:
      input.platformSecurityPause === true ||
      input.sellerEmergencyPause === true ||
      input.schedule.mode === "MANUALLY_PAUSED",
    scheduleAccepting: scheduleOpen,
    hasActiveJob: input.hasActiveJobOnWorker,
  });
  const accepting = reasons.length === 0;
  return { accepting, buyerAvailability, reasons };
}
