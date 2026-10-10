import type { DependencyGraph } from "@kivro/contracts";
import { findPublishBlockers } from "@kivro/capability-publish";
import { isPrimaryMarketplaceSupply } from "@kivro/platform-policy";
import type { WorkerHealthLabel } from "@kivro/seller-health";

export type ReadinessItem = {
  id: string;
  severity: "blocking" | "recommended";
  title: string;
  detail: string;
};

/** SELLERUX-008 — deterministic blocking vs recommended checklist. */
export function buildPublishReadinessReport(input: {
  dependencyGraph: DependencyGraph | null;
  workerPaired: boolean;
  workerHealthLabel: WorkerHealthLabel | "NONE";
  executionModelAcknowledged: boolean;
  contractValid: boolean;
  payoutReady: boolean;
  permissionExpansionAcknowledged?: boolean;
  permissionExpansionPending?: boolean;
  staleCredentialRefs?: number;
  supplyAdvantages?: string[];
}): { ready: boolean; items: ReadinessItem[] } {
  const items: ReadinessItem[] = [];

  if (!input.workerPaired) {
    items.push({
      id: "worker_pairing",
      severity: "blocking",
      title: "Pair a Worker",
      detail: "Install kivro-worker and pair it to this account before publishing.",
    });
  }

  if (
    input.workerHealthLabel === "OFFLINE" ||
    input.workerHealthLabel === "NOT_READY" ||
    input.workerHealthLabel === "SECURITY_WARNING"
  ) {
    items.push({
      id: "worker_health",
      severity: "blocking",
      title: "Worker health",
      detail: "Worker must pass sandbox/OpenClaw checks before new jobs can run safely.",
    });
  } else if (input.workerHealthLabel === "DEGRADED" || input.workerHealthLabel === "NONE") {
    items.push({
      id: "worker_health_stale",
      severity: "recommended",
      title: "Refresh Worker health",
      detail: "Run kivro-worker health to refresh heartbeat and diagnostics.",
    });
  }

  if (!input.contractValid) {
    items.push({
      id: "contract_valid",
      severity: "blocking",
      title: "Fix buyer input contract",
      detail: "Resolve contract validation errors before publish.",
    });
  }

  if (!input.executionModelAcknowledged) {
    items.push({
      id: "execution_model_ack",
      severity: "blocking",
      title: "Acknowledge execution model",
      detail: "Confirm isolated sandbox execution and buyer-data handling.",
    });
  }

  if (input.dependencyGraph) {
    for (const blocker of findPublishBlockers(input.dependencyGraph)) {
      items.push({
        id: `dependency:${blocker}`,
        severity: "blocking",
        title: "Dependency blocker",
        detail: blocker,
      });
    }
  } else {
    items.push({
      id: "dependency_graph",
      severity: "blocking",
      title: "Review dependencies",
      detail: "Complete discovery consent and dependency review.",
    });
  }

  if (input.permissionExpansionPending && !input.permissionExpansionAcknowledged) {
    items.push({
      id: "permission_expansion_ack",
      severity: "blocking",
      title: "Acknowledge permission expansion",
      detail: "This version expands permissions vs the live version — confirm explicitly.",
    });
  }

  if (!input.payoutReady) {
    items.push({
      id: "payout_connect",
      severity: "recommended",
      title: "Connect payouts",
      detail: "Stripe Connect is required before you can receive earnings from paid jobs.",
    });
  }

  if ((input.staleCredentialRefs ?? 0) > 0) {
    items.push({
      id: "credential_freshness",
      severity: "recommended",
      title: "Refresh local credentials",
      detail: `${input.staleCredentialRefs} credential reference(s) look stale — re-verify on the Worker.`,
    });
  }

  if (input.supplyAdvantages && !isPrimaryMarketplaceSupply(input.supplyAdvantages)) {
    items.push({
      id: "weak_supply",
      severity: "recommended",
      title: "Add a reason to pay",
      detail: "A better prompt alone is weak supply. Private data, a tool, or a proven record is the reason a buyer pays.",
    });
  }

  const ready = !items.some((i) => i.severity === "blocking");
  return { ready, items };
}
