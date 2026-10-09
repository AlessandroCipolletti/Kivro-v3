import type { WorkerManifest } from "@kivro/contracts";
import { isBlockedEgressHost } from "./blocked-hosts.js";
import { findNetworkAllowRule } from "./network-allow.js";
import { normalizeNetworkHost } from "./network-host.js";
import type { PolicyDecision } from "./types.js";

export { normalizeNetworkHost } from "./network-host.js";

export function evaluateNetworkAccess(manifest: WorkerManifest, host: string): PolicyDecision {
  const normalized = normalizeNetworkHost(host);
  if (isBlockedEgressHost(normalized)) {
    return { allowed: false, reason: "blocked host (SSRF/metadata/private)" };
  }
  if (manifest.network.default !== "deny") {
    return { allowed: false, reason: "non-deny network default forbidden for marketplace" };
  }
  const rule = findNetworkAllowRule(manifest.network.allow, normalized);
  if (rule) {
    return { allowed: true };
  }
  return { allowed: false, reason: "host not in manifest allow list" };
}

export function evaluateEgressRequest(
  manifest: WorkerManifest,
  host: string,
  port: number,
): PolicyDecision {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { allowed: false, reason: "invalid port" };
  }
  const normalized = normalizeNetworkHost(host);
  if (isBlockedEgressHost(normalized)) {
    return { allowed: false, reason: "blocked host (SSRF/metadata/private)" };
  }
  if (manifest.network.default !== "deny") {
    return { allowed: false, reason: "non-deny network default forbidden for marketplace" };
  }
  const rule = findNetworkAllowRule(manifest.network.allow, normalized);
  if (!rule) {
    return { allowed: false, reason: "host not in manifest allow list" };
  }
  if (!rule.ports.includes(port)) {
    return { allowed: false, reason: "port not allowed for declared host" };
  }
  return { allowed: true };
}
