import type { ProviderBroker, ProviderBrokerDecision, ProviderBrokerRequest } from "./types.js";

/** §73 — provider/cost broker (credentials injected outside sandbox). */
export class ManifestProviderBroker implements ProviderBroker {
  authorize(request: ProviderBrokerRequest): ProviderBrokerDecision {
    const declared = request.inference.provider.toLowerCase();
    const requested = request.provider.toLowerCase();
    if (declared !== requested) {
      return { allowed: false, reason: "provider not declared in inference dependency" };
    }
    if (request.inference.model.toLowerCase() !== request.model.toLowerCase()) {
      return { allowed: false, reason: "model not allowed for declared provider" };
    }
    return { allowed: true };
  }
}
