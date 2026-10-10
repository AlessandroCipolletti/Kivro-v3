import type { StagedWorkerUpdateState } from "./staged-worker-update.js";

export function parseStagedWorkerUpdateState(raw: unknown): StagedWorkerUpdateState | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const o = raw as { phase?: string };
  if (o.phase === "idle") {
    return { phase: "idle" };
  }
  if (o.phase === "active" && typeof (o as { version?: string }).version === "string") {
    return { phase: "active", version: (o as { version: string }).version };
  }
  if (
    o.phase === "downloaded" &&
    typeof (o as { version?: string }).version === "string" &&
    typeof (o as { signatureVerified?: boolean }).signatureVerified === "boolean"
  ) {
    return {
      phase: "downloaded",
      version: (o as { version: string }).version,
      signatureVerified: (o as { signatureVerified: boolean }).signatureVerified,
    };
  }
  if (o.phase === "staging") {
    const s = o as {
      version: string;
      healthChecksPassed: number;
      requiredHealthChecks: number;
    };
    if (
      typeof s.version === "string" &&
      typeof s.healthChecksPassed === "number" &&
      typeof s.requiredHealthChecks === "number"
    ) {
      return {
        phase: "staging",
        version: s.version,
        healthChecksPassed: s.healthChecksPassed,
        requiredHealthChecks: s.requiredHealthChecks,
      };
    }
  }
  if (o.phase === "rollback") {
    const r = o as { targetVersion: string; reason: string };
    if (typeof r.targetVersion === "string" && typeof r.reason === "string") {
      return { phase: "rollback", targetVersion: r.targetVersion, reason: r.reason };
    }
  }
  return null;
}
