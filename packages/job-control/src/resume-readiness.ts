import type { JobStatus } from "@kivro/domain";
import { isGlobalDispatchEnabled } from "@kivro/platform-policy";

export type ResumeReadinessResult =
  | { ready: true }
  | { ready: false; code: "RESUME_NOT_READY" | "DEPENDENCY_UNAVAILABLE" | "SECURITY_BLOCK" };

/** Master Spec §440 — recheck readiness before resume. */
export function evaluateResumeReadiness(input: {
  jobStatus: JobStatus;
  workerDeviceStatus?: "ONLINE" | "OFFLINE" | "PAIRED" | "REVOKED";
  securityPauseReason?: string | null;
  globalPauseActive?: boolean;
  confirmGlobalPauseOverride?: boolean;
}): ResumeReadinessResult {
  if (input.jobStatus === "SECURITY_PAUSED") {
    return { ready: false, code: "SECURITY_BLOCK" };
  }
  if (input.jobStatus !== "PAUSED" && input.jobStatus !== "RESUME_REQUESTED") {
    return { ready: false, code: "RESUME_NOT_READY" };
  }
  if (input.globalPauseActive && !input.confirmGlobalPauseOverride) {
    return { ready: false, code: "RESUME_NOT_READY" };
  }
  if (!isGlobalDispatchEnabled()) {
    return { ready: false, code: "DEPENDENCY_UNAVAILABLE" };
  }
  if (input.workerDeviceStatus === "OFFLINE" || input.workerDeviceStatus === "REVOKED") {
    return { ready: false, code: "DEPENDENCY_UNAVAILABLE" };
  }
  if (input.securityPauseReason === "SECURITY_BLOCK") {
    return { ready: false, code: "SECURITY_BLOCK" };
  }
  return { ready: true };
}
