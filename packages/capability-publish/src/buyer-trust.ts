import type { WorkerManifest } from "@kivro/contracts";
import { normalizeNetworkAllowList } from "@kivro/policy-engine";

export interface BuyerTrustSummary {
  execution: string[];
  network: string[];
  data: string[];
  permissions: string[];
}

/** §76 — buyer-visible trust metadata (precise, no "100% secure" claims). */
export function buildBuyerTrustSummary(manifest: WorkerManifest): BuyerTrustSummary {
  const networkRules = normalizeNetworkAllowList(manifest.network.allow);
  return {
    execution: [
      "Isolated marketplace worker environment (not seller personal OpenClaw)",
      "Temporary per-job workspace",
    ],
    network:
      networkRules.length === 0
        ? ["No outbound network declared for this version"]
        : [
            "Restricted egress only to declared destinations",
            ...networkRules.map((r) => `${r.host}:${r.ports.join(",")}`),
          ],
    data: [
      "Buyer files processed on seller-controlled hardware during execution",
      "Platform retains deliverables per published retention policy",
    ],
    permissions: [
      ...manifest.tools.allow.map((t) => `Tool allowed: ${t}`),
      ...manifest.resources.map((r) => `Resource: ${r.id} (${r.permissions.join(", ")})`),
      "Seller personal files: not in scope for buyer jobs",
      "Personal browser: not supported in MVP",
    ],
  };
}
