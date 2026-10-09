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

/** Minimum Worker semver prefix allowed to accept paid jobs (§371). */
export const MIN_SECURITY_WORKER_VERSION =
  process.env.KIVRO_MIN_SECURITY_WORKER_VERSION ?? "0.0.0-m07";

export const LATEST_SUPPORTED_WORKER_VERSION =
  process.env.KIVRO_LATEST_SUPPORTED_WORKER_VERSION ?? "0.0.0-m07";

function versionTuple(v: string): number[] {
  const core = v.replace(/^v/i, "").split("-")[0] ?? "0";
  return core.split(".").map((p) => Number.parseInt(p, 10) || 0);
}

/** Lexicographic compare on numeric semver segments; suffix ignored for MVP. */
export function compareWorkerVersions(a: string, b: string): number {
  const ta = versionTuple(a);
  const tb = versionTuple(b);
  const len = Math.max(ta.length, tb.length);
  for (let i = 0; i < len; i += 1) {
    const da = ta[i] ?? 0;
    const db = tb[i] ?? 0;
    if (da !== db) {
      return da < db ? -1 : 1;
    }
  }
  return 0;
}

export function isWorkerBelowSecurityMinimum(workerVersion: string): boolean {
  return compareWorkerVersions(workerVersion, MIN_SECURITY_WORKER_VERSION) < 0;
}

export function buildSecurityWarnings(input: {
  report: WorkerHealthReport | null;
  deviceStatus: string;
  sellerEmergencyPause: boolean;
  now?: Date;
}): SecurityWarning[] {
  const now = (input.now ?? new Date()).toISOString();
  const warnings: SecurityWarning[] = [];
  const report = input.report;

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

  if (isWorkerBelowSecurityMinimum(report.workerVersion)) {
    warnings.push({
      severity: "CRITICAL",
      code: "WORKER_VERSION_BELOW_MINIMUM",
      title: "Security update required",
      description: `Worker ${report.workerVersion} is below minimum ${MIN_SECURITY_WORKER_VERSION}.`,
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
