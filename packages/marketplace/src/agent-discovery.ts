import type { CapabilityListingRow } from "./capability-listing.js";
import {
  extractConstraintsFromText,
  normalizeBuyerConstraints,
  searchQueryFromIntent,
  type BuyerConstraints,
} from "./buyer-constraints.js";
import { rankAgentCandidates, type RankedCapability } from "./agent-ranking.js";

export type AgentDiscoveryRequest = {
  goal: string;
  constraints?: Partial<BuyerConstraints>;
  limit?: number;
};

export type AgentDiscoveryResult = {
  mode: "ASSISTED_DISCOVERY";
  parsedConstraints: BuyerConstraints;
  searchQuery: string;
  recommendations: RankedCapability[];
};

/** §131 assisted discovery — recommendations from current marketplace records only. */
export function runAssistedDiscovery(
  listings: CapabilityListingRow[],
  request: AgentDiscoveryRequest,
): AgentDiscoveryResult {
  const fromText = extractConstraintsFromText(request.goal);
  const parsedConstraints = normalizeBuyerConstraints({
    ...fromText,
    ...request.constraints,
  });
  const searchQuery = searchQueryFromIntent(request.goal) || request.goal.trim();
  const recommendations = rankAgentCandidates(listings, {
    query: searchQuery,
    constraints: parsedConstraints,
    limit: request.limit ?? 5,
  });
  return {
    mode: "ASSISTED_DISCOVERY",
    parsedConstraints,
    searchQuery,
    recommendations,
  };
}
