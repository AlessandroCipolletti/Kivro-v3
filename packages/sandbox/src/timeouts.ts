import type { WorkerManifest } from "@kivro/contracts";

/** Master Spec §70 — job timeout envelope derived from manifest limits. */
export interface JobTimeoutPolicy {
  startupTimeoutMs: number;
  executionTimeoutMs: number;
  uploadTimeoutMs: number;
  absoluteDeadlineMs: number;
}

export function jobTimeoutPolicyFromManifest(manifest: WorkerManifest): JobTimeoutPolicy {
  const executionMs = manifest.limits.timeoutSeconds * 1000;
  return {
    startupTimeoutMs: Math.min(60_000, Math.floor(executionMs * 0.25)),
    executionTimeoutMs: executionMs,
    uploadTimeoutMs: Math.min(300_000, Math.floor(executionMs * 0.5)),
    absoluteDeadlineMs: executionMs + 120_000,
  };
}
