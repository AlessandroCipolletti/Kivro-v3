import type { CapabilityListingRow } from "@kivro/marketplace";
import {
  filterCapabilityListings,
  rankAgentCandidates,
  type BuyerConstraints,
  type MarketplaceSearchFilters,
} from "@kivro/marketplace";

/** §132 typed marketplace tools (no raw DB). */
export function toolSearchCapabilities(
  listings: CapabilityListingRow[],
  input: MarketplaceSearchFilters & { constraints?: BuyerConstraints; limit?: number },
): ReturnType<typeof rankAgentCandidates> {
  const filtered = filterCapabilityListings(listings, {
    q: input.q,
    category: input.category,
    minRating: input.minRating ?? input.constraints?.minRating,
    maxPriceCents: input.maxPriceCents ?? input.constraints?.maxPerJobSpendCents,
    onlineOnly: input.onlineOnly ?? input.constraints?.onlineOnly,
  });
  return rankAgentCandidates(filtered, {
    query: input.q ?? "",
    constraints: input.constraints ?? {},
    limit: input.limit ?? 10,
  });
}

export function toolGetCapability(
  listings: CapabilityListingRow[],
  slug: string,
): CapabilityListingRow | null {
  return listings.find((l) => l.slug === slug) ?? null;
}
