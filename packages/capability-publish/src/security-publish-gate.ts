import type { WorkerManifest } from "@kivro/contracts";
import { validateExecutionPreflight } from "@kivro/policy-engine";
import { validateSandboxForManifest } from "@kivro/sandbox";

export interface PublishSecurityResult {
  ok: boolean;
  issues: string[];
}

/** §74 — security tests before publish transaction. */
export function validatePublishSecurity(manifest: WorkerManifest): PublishSecurityResult {
  const issues: string[] = [];
  const sandbox = validateSandboxForManifest(manifest);
  if (!sandbox.ok) {
    issues.push(...sandbox.issues);
  }
  const preflight = validateExecutionPreflight(manifest);
  if (!preflight.ok) {
    issues.push(...preflight.issues);
  }
  return { ok: issues.length === 0, issues };
}
