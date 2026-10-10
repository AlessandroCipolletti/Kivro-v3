import type { WorkerHealthReport } from "./worker-health-report.js";

export type SecurityWarningSeverity = "INFO" | "WARNING" | "CRITICAL";

export type SecurityWarning = {
  severity: SecurityWarningSeverity;
  code: string;
  title: string;
  description: string;
  blocking: boolean;
  requiredAction: string;
  detectedAt: string;
};

import {
  compareWorkerVersions,
  evaluateWorkerVersion,
  resolveWorkerVersionPolicy,
} from "@kivro/compatibility";

/** Minimum Worker semver prefix allowed to accept paid jobs (§371). */
export const MIN_SECURITY_WORKER_VERSION = resolveWorkerVersionPolicy().minSupportedWorkerVersion;

export const LATEST_SUPPORTED_WORKER_VERSION =
  resolveWorkerVersionPolicy().latestSupportedWorkerVersion;

export { compareWorkerVersions };

export function isWorkerBelowSecurityMinimum(workerVersion: string): boolean {
  const evaluation = evaluateWorkerVersion(workerVersion);
  return !evaluation.ok && evaluation.code === "WORKER_VERSION_BELOW_MINIMUM";
}

export function buildSecurityWarnings(input: {
  report: WorkerHealthReport | null;
  deviceStatus: string;
  sellerEmergencyPause: boolean;
  platformSecurityPause?: boolean;
  platformSecurityReason?: string | null;
  now?: Date;
}): SecurityWarning[] {
  const now = (input.now ?? new Date()).toISOString();
  const warnings: SecurityWarning[] = [];
  const report = input.report;

  if (input.platformSecurityPause) {
    warnings.push({
      severity: "CRITICAL",
      code: "PLATFORM_SECURITY_PAUSE",
      title: "Platform security pause active",
      description:
        input.platformSecurityReason ??
        "Kivro blocked new jobs until the reported security condition is resolved.",
      blocking: true,
      requiredAction: "Fix the security issue reported on the dashboard; manual resume is blocked.",
      detectedAt: now,
    });
  }

  if (input.sellerEmergencyPause) {
    warnings.push({
      severity: "WARNING",
      code: "EMERGENCY_PAUSE",
      title: "Emergency pause active",
      description: "All new marketplace jobs are paused for this seller account.",
      blocking: true,
      requiredAction: "Resume from dashboard when safe.",
      detectedAt: now,
    });
  }

  if (input.deviceStatus === "REVOKED") {
    warnings.push({
      severity: "CRITICAL",
      code: "DEVICE_REVOKED",
      title: "Worker device revoked",
      description: "This device credential is no longer trusted.",
      blocking: true,
      requiredAction: "Pair a new Worker device.",
      detectedAt: now,
    });
  }

  if (!report) {
    return warnings;
  }

  const versionEval = evaluateWorkerVersion(report.workerVersion);
  if (!versionEval.ok && versionEval.code === "WORKER_VERSION_REVOKED") {
    warnings.push({
      severity: "CRITICAL",
      code: "WORKER_VERSION_REVOKED",
      title: "Worker version revoked",
      description: versionEval.message,
      blocking: true,
      requiredAction: "Install a supported non-revoked Worker release.",
      detectedAt: report.reportedAt,
    });
  } else if (!versionEval.ok && versionEval.code === "WORKER_VERSION_BELOW_MINIMUM") {
    warnings.push({
      severity: "CRITICAL",
      code: "WORKER_VERSION_BELOW_MINIMUM",
      title: "Security update required",
      description: versionEval.message,
      blocking: true,
      requiredAction: "Upgrade kivro-worker before accepting new jobs.",
      detectedAt: report.reportedAt,
    });
  } else if (compareWorkerVersions(report.workerVersion, LATEST_SUPPORTED_WORKER_VERSION) < 0) {
    warnings.push({
      severity: "INFO",
      code: "WORKER_UPDATE_RECOMMENDED",
      title: "Worker update recommended",
      description: `Latest supported version is ${LATEST_SUPPORTED_WORKER_VERSION}.`,
      blocking: false,
      requiredAction: "Update when convenient.",
      detectedAt: report.reportedAt,
    });
  }

  if (!report.openClawCompatible && report.openClawInstalled) {
    warnings.push({
      severity: "CRITICAL",
      code: "OPENCLAW_UNSUPPORTED",
      title: "OpenClaw unsupported",
      description: "Detected OpenClaw is not compatible with this Worker version.",
      blocking: true,
      requiredAction: "Align OpenClaw and Worker versions.",
      detectedAt: report.reportedAt,
    });
  }

  if (!report.dockerOk) {
    warnings.push({
      severity: "CRITICAL",
      code: "DOCKER_UNAVAILABLE",
      title: "Docker unavailable",
      description: "Sandbox execution requires Docker; host fallback is forbidden.",
      blocking: true,
      requiredAction: "Start Docker and re-run kivro-worker health.",
      detectedAt: report.reportedAt,
    });
  }

  if (!report.sandboxOk && report.dockerOk) {
    warnings.push({
      severity: "CRITICAL",
      code: "SANDBOX_NOT_READY",
      title: "Sandbox not ready",
      description: "Sandbox self-test failed or image is not ready.",
      blocking: true,
      requiredAction: "Fix sandbox setup; do not run paid jobs on the host.",
      detectedAt: report.reportedAt,
    });
  }

  if (report.globalPauseActive) {
    warnings.push({
      severity: "WARNING",
      code: "LOCAL_GLOBAL_PAUSE",
      title: "Local pause active",
      description: "Worker CLI or local store has paused new marketplace jobs.",
      blocking: true,
      requiredAction: "Run kivro-worker resume --all when ready.",
      detectedAt: report.reportedAt,
    });
  }

  return warnings;
}

export function hasBlockingSecurityWarning(warnings: SecurityWarning[]): boolean {
  return warnings.some((w) => w.blocking && w.severity === "CRITICAL") || warnings.some((w) => w.blocking);
}
