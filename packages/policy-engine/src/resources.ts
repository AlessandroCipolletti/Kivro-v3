import type { WorkerManifest } from "@kivro/contracts";
import type { PolicyDecision } from "./types.js";

export function evaluateResourceAccess(
  manifest: WorkerManifest,
  resourceId: string,
  permission: string,
): PolicyDecision {
  const resource = manifest.resources.find((r) => r.id === resourceId);
  if (!resource) {
    return { allowed: false, reason: "resource not declared in manifest" };
  }
  if (!resource.permissions.includes(permission)) {
    return { allowed: false, reason: "permission not granted for resource" };
  }
  return { allowed: true };
}
