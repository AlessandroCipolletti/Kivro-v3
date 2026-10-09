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
  globalDispatchEnabled: boolean;
  sellerEmergencyPause?: boolean;
  securityBlocksDispatch?: boolean;
  now?: Date;
}): AcceptingJobsEvaluation {
  const reasons: string[] = [];
  if (!input.capabilityPublished) {
    reasons.push("NOT_PUBLISHED");
  }
  if (!input.globalDispatchEnabled) {
    reasons.push("GLOBAL_DISPATCH_DISABLED");
  }
  if (input.sellerEmergencyPause) {
    reasons.push("EMERGENCY_PAUSE");
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
  if (input.hasActiveJobOnWorker) {
    reasons.push("WORKER_BUSY");
  }
  const buyerAvailability = mapWorkerDeviceToBuyerAvailability({
    deviceStatus: input.workerDeviceStatus,
    sellerGlobalPause:
      input.sellerEmergencyPause === true || input.schedule.mode === "MANUALLY_PAUSED",
    scheduleAccepting: scheduleOpen,
    hasActiveJob: input.hasActiveJobOnWorker,
  });
  const accepting = reasons.length === 0;
  return { accepting, buyerAvailability, reasons };
}
