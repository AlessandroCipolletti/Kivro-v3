import { evaluateResourceAccess } from "@kivro/policy-engine";
import type { ResourceBroker, ResourceBrokerRequest } from "./types.js";

/** §71 — broker decisions are derived from the published manifest snapshot. */
export class ManifestResourceBroker implements ResourceBroker {
  authorize(request: ResourceBrokerRequest) {
    return evaluateResourceAccess(request.manifest, request.resourceId, request.operation);
  }
}
