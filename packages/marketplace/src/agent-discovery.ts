import type { CapabilityListingRow } from "./capability-listing.js";
import {
  extractConstraintsFromText,
  normalizeBuyerConstraints,
  searchQueryFromIntent,
  type BuyerConstraints,
} from "./buyer-constraints.js";
import { rankAgentCandidates, type RankedCapability } from "./agent-ranking.js";
import { agentInteractionMode } from "./human-availability.js";

export type AgentDiscoveryRequest = {
  goal: string;
  constraints?: Partial<BuyerConstraints>;
  limit?: number;
};

export type AgentDiscoveryResult = {
  mode: "ASSISTED_DISCOVERY";
  interaction: "RECOMMENDATION" | "EXECUTION";
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
  const interaction = agentInteractionMode(request.goal);
  const rankConstraints = { ...parsedConstraints };
  if (!rankConstraints.timingMode) {
    rankConstraints.timingMode = interaction === "RECOMMENDATION" ? "EARLIEST_AVAILABLE_ALLOWED" : "IMMEDIATE";
  }
  const recommendations = rankAgentCandidates(listings, {
    query: searchQuery,
    constraints: rankConstraints,
    limit: request.limit ?? 5,
  });
  return {
    mode: "ASSISTED_DISCOVERY",
    interaction,
    parsedConstraints,
    searchQuery,
    recommendations,
  };
}
