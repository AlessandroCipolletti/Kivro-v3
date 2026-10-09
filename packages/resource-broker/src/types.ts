import type { WorkerManifest } from "@kivro/contracts";
import type { PolicyDecision } from "@kivro/policy-engine";

export interface ResourceBrokerRequest {
  manifest: WorkerManifest;
  resourceId: string;
  operation: string;
}

export interface ResourceBroker {
  authorize(request: ResourceBrokerRequest): PolicyDecision;
}
