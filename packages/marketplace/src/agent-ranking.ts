import { agentTimingSnapshot, capabilityFitsAgentTiming } from "./agent-timing.js";
import type { AgentTimingSnapshot } from "./agent-timing.js";
import type { CapabilityListingRow } from "./capability-listing.js";
import type { BuyerConstraints } from "./buyer-constraints.js";

export type RankedCapability = CapabilityListingRow & {
  score: number;
  whySelected: string[];
  limitation?: string;
  timing: AgentTimingSnapshot;
};

/** §133 — deterministic candidate score; LLM may explain but not override hard constraints. */
export function rankAgentCandidates(
  rows: CapabilityListingRow[],
  input: { query: string; constraints: BuyerConstraints; limit?: number },
): RankedCapability[] {
  const q = input.query.trim().toLowerCase();
  const limit = input.limit ?? 5;
  const blocked = new Set(input.constraints.blockedSellerProfileIds ?? []);
  const preferred = new Set(input.constraints.preferredCapabilitySlugs ?? []);

  const filtered = rows.filter((row) => {
    if (blocked.size && row.sellerProfileId && blocked.has(row.sellerProfileId)) {
      return false;
    }
    if (input.constraints.minRating != null && (row.rating ?? 0) < input.constraints.minRating) {
      return false;
    }
    const price = row.priceTierCents ?? Infinity;
    if (input.constraints.maxPerJobSpendCents != null && price > input.constraints.maxPerJobSpendCents) {
      return false;
    }
    if (input.constraints.maxRuntimeSeconds != null && row.estimatedDuration != null) {
      if (row.estimatedDuration > input.constraints.maxRuntimeSeconds) {
        return false;
      }
    }
    if (input.constraints.onlineOnly && (row.availabilityStatus !== "ONLINE" || !row.accepting)) {
      return false;
    }
    const mode =
      input.constraints.timingMode ??
      (input.constraints.hardDeliveryDeadlineAt ? "DEADLINE" : "IMMEDIATE");
    const deadlineMs = input.constraints.hardDeliveryDeadlineAt
      ? Date.parse(input.constraints.hardDeliveryDeadlineAt)
      : undefined;
    const hasTiming = row.availabilityStatus != null || row.accepting != null;
    if (
      hasTiming &&
      !capabilityFitsAgentTiming(
        row,
        mode,
        Date.now(),
        Number.isFinite(deadlineMs) ? deadlineMs : undefined,
      )
    ) {
      return false;
    }
    return true;
  });

  const ranked = filtered
    .map((row) => scoreRow(row, q, preferred))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked;
}

function scoreRow(
  row: CapabilityListingRow,
  q: string,
  preferred: Set<string>,
): RankedCapability {
  let score = 0;
  const why: string[] = [];
  if (q) {
    if (row.name.toLowerCase().includes(q)) {
      score += 12;
      why.push("Name matches your request");
    }
    if (row.description.toLowerCase().includes(q)) {
      score += 6;
      why.push("Description matches your goal");
    }
  }
  if (row.rating != null) {
    score += row.rating * 3;
    why.push(`Rating ${row.rating.toFixed(1)} from marketplace records`);
  }
  if (row.jobCount > 0) {
    score += Math.min(8, Math.log10(row.jobCount + 1) * 4);
  }
  if (row.availabilityStatus === "ONLINE" && row.accepting) {
    score += 5;
    why.push("Currently accepting jobs");
  }
  if (preferred.has(row.slug)) {
    score += 15;
    why.push("Matches your preferred capability");
  }
  const price = row.priceTierCents;
  if (price != null) {
    why.push(`Listed at ${(price / 100).toFixed(2)} USD`);
  }
  let limitation: string | undefined;
  if (row.availabilityStatus === "PAUSED" || !row.accepting) {
    limitation = "Seller paused or blocked new marketplace jobs";
  } else if (row.availabilityStatus !== "ONLINE") {
    limitation = "Not accepting immediate runs; schedule or try later";
  }
  if (why.length === 0) {
    why.push("Published capability matching marketplace filters");
  }
  return {
    ...row,
    score,
    whySelected: why.slice(0, 4),
    limitation,
    timing: agentTimingSnapshot(row),
  };
}
