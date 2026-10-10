import type { CapabilityContract } from "@kivro/contracts";
import {
  suggestInputContractFromDiscovery,
  type DiscoverySnapshot,
} from "@kivro/capability-publish";

/** SELLERUX-004 — platform draft is advisory; never authorization to publish. */
export type AiAssistedDraftProposal = {
  source: "deterministic_discovery_draft";
  suggestedInputs: CapabilityContract["inputs"];
  rationale: string[];
  sellerMustReview: true;
  canAutoPublish: false;
  canExpandPermissions: false;
};

export function buildAiAssistedDraftProposal(discovery: DiscoverySnapshot): AiAssistedDraftProposal {
  const { suggested, rationale } = suggestInputContractFromDiscovery(discovery);
  return {
    source: "deterministic_discovery_draft",
    suggestedInputs: suggested,
    rationale,
    sellerMustReview: true,
    canAutoPublish: false,
    canExpandPermissions: false,
  };
}
