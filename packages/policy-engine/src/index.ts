import type { WorkerManifest } from "@kivro/contracts";

export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
}

/** Deny-by-default placeholder — expanded in M04. */
export function evaluateNetworkAccess(
  manifest: WorkerManifest,
  host: string,
): PolicyDecision {
  if (manifest.network.default === "deny") {
    if (manifest.network.allow.includes(host)) {
      return { allowed: true };
    }
    return { allowed: false, reason: "host not in manifest allow list" };
  }
  return { allowed: false, reason: "non-deny default not supported in MVP bootstrap" };
}
