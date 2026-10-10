import { validatePublishSecurity } from "@kivro/capability-publish";
import type { WorkerManifest } from "@kivro/contracts";

/** SELLERUX-024..025 — rollback blocked when target violates current security policy. */
export function assessRollbackReadiness(input: {
  targetWorkerManifest: WorkerManifest | null;
  inFlightJobsOnCurrentVersion: number;
}): { allowed: boolean; blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];
  if (!input.targetWorkerManifest) {
    blockers.push("TARGET_MANIFEST_MISSING");
    return { allowed: false, blockers, warnings };
  }
  const security = validatePublishSecurity(input.targetWorkerManifest);
  if (!security.ok) {
    blockers.push(...security.issues.map((i) => `SECURITY:${i}`));
  }
  if (input.inFlightJobsOnCurrentVersion > 0) {
    warnings.push(
      `${input.inFlightJobsOnCurrentVersion} in-flight job(s) remain pinned to the current version.`,
    );
  }
  return { allowed: blockers.length === 0, blockers, warnings };
}
