import type { SecurityWarning } from "./security-warnings.js";
import { hasBlockingSecurityWarning } from "./security-warnings.js";
import type { WorkerHealthReport } from "./worker-health-report.js";

export type WorkerHealthLabel =
  | "HEALTHY"
  | "DEGRADED"
  | "NOT_READY"
  | "OFFLINE"
  | "PAUSED"
  | "SECURITY_WARNING";

export function deriveWorkerHealthLabel(input: {
  deviceStatus: string;
  lastSeenAt: Date | null;
  report: WorkerHealthReport | null;
  sellerEmergencyPause: boolean;
  warnings: SecurityWarning[];
  staleAfterMs?: number;
  now?: Date;
}): WorkerHealthLabel {
  const now = input.now ?? new Date();
  const staleMs = input.staleAfterMs ?? 120_000;

  if (input.sellerEmergencyPause || input.report?.globalPauseActive) {
    return "PAUSED";
  }
  if (input.deviceStatus === "REVOKED") {
    return "SECURITY_WARNING";
  }
  if (hasBlockingSecurityWarning(input.warnings)) {
    return "SECURITY_WARNING";
  }
  if (input.deviceStatus === "OFFLINE" || input.deviceStatus === "PAIRED") {
    const seen = input.lastSeenAt;
    if (!seen || now.getTime() - seen.getTime() > staleMs) {
      return "OFFLINE";
    }
  }
  if (input.report && (!input.report.dockerOk || !input.report.sandboxOk)) {
    return "NOT_READY";
  }
  if (input.warnings.some((w) => w.severity === "WARNING" || w.severity === "INFO")) {
    return "DEGRADED";
  }
  if (input.deviceStatus === "ONLINE") {
    return "HEALTHY";
  }
  return "OFFLINE";
}
