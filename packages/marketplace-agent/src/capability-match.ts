import type { CapabilityListingRow } from "@kivro/marketplace";
import { rankAgentCandidates } from "@kivro/marketplace";
import type { BuyerConstraints } from "@kivro/marketplace";
import type { OrchestrationListingRow } from "./orchestration-planner.js";

export type CapabilityRole = "research" | "compare" | "pdf" | "general";

const ROLE_KEYWORDS: Record<CapabilityRole, string[]> = {
  research: ["research", "intelligence", "company", "competitor", "startup"],
  compare: ["compare", "comparison", "analysis", "synthesis", "strategy"],
  pdf: ["pdf", "report builder", "document", "export"],
  general: [],
};

export function pickCapabilityForRole<T extends CapabilityListingRow>(
  listings: T[],
  role: CapabilityRole,
  constraints: BuyerConstraints,
  query: string,
): T | null {
  const keywords = ROLE_KEYWORDS[role];
  const queryBoost = keywords.join(" ");
  const ranked = rankAgentCandidates(listings, {
    query: `${query} ${queryBoost}`.trim(),
    constraints,
    limit: 3,
  });
  const top = ranked[0];
  if (!top) {
    return null;
  }
  return listings.find((l) => l.slug === top.slug) ?? null;
}

export function pickOrchestrationCapability(
  listings: OrchestrationListingRow[],
  role: CapabilityRole,
  constraints: BuyerConstraints,
  query: string,
): OrchestrationListingRow | null {
  return pickCapabilityForRole(listings, role, constraints, query);
}
