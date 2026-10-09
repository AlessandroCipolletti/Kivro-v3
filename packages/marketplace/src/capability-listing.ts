/** Master Spec §123–§125 — marketplace listing DTOs and transparent search/sort. */

export type MarketplaceSort =
  | "relevance"
  | "rating"
  | "most_used"
  | "price_asc"
  | "price_desc"
  | "fastest";

export type MarketplaceSearchFilters = {
  q?: string;
  category?: string;
  minRating?: number;
  minPriceCents?: number;
  maxPriceCents?: number;
  onlineOnly?: boolean;
  sort?: MarketplaceSort;
};

export type CapabilityListingRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  priceTierCents: number | null;
  currency: string;
  rating: number | null;
  jobCount: number;
  estimatedDuration: number | null;
  sellerDisplayName: string;
  sellerProfileId?: string;
  availabilityStatus?: string;
  accepting?: boolean;
  nextAvailableAt?: string | null;
};

export function filterCapabilityListings(
  rows: CapabilityListingRow[],
  filters: MarketplaceSearchFilters,
): CapabilityListingRow[] {
  let out = rows;
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.sellerDisplayName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    );
  }
  if (filters.category) {
    const cat = filters.category.toLowerCase();
    out = out.filter((r) => r.category.toLowerCase() === cat);
  }
  if (filters.minRating != null) {
    out = out.filter((r) => (r.rating ?? 0) >= filters.minRating!);
  }
  if (filters.minPriceCents != null) {
    out = out.filter((r) => (r.priceTierCents ?? 0) >= filters.minPriceCents!);
  }
  if (filters.maxPriceCents != null) {
    out = out.filter((r) => (r.priceTierCents ?? Infinity) <= filters.maxPriceCents!);
  }
  if (filters.onlineOnly) {
    out = out.filter((r) => r.availabilityStatus === "ONLINE" && r.accepting === true);
  }
  return out;
}

export function sortCapabilityListings(
  rows: CapabilityListingRow[],
  sort: MarketplaceSort = "relevance",
  query?: string,
): CapabilityListingRow[] {
  const copy = [...rows];
  switch (sort) {
    case "rating":
      copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case "most_used":
      copy.sort((a, b) => b.jobCount - a.jobCount);
      break;
    case "price_asc":
      copy.sort((a, b) => (a.priceTierCents ?? 0) - (b.priceTierCents ?? 0));
      break;
    case "price_desc":
      copy.sort((a, b) => (b.priceTierCents ?? 0) - (a.priceTierCents ?? 0));
      break;
    case "fastest":
      copy.sort(
        (a, b) => (a.estimatedDuration ?? 999999) - (b.estimatedDuration ?? 999999),
      );
      break;
    case "relevance":
    default:
      if (query?.trim()) {
        const q = query.trim().toLowerCase();
        copy.sort((a, b) => scoreRelevance(b, q) - scoreRelevance(a, q));
      } else {
        copy.sort((a, b) => b.jobCount - a.jobCount);
      }
      break;
  }
  return copy;
}

function scoreRelevance(row: CapabilityListingRow, q: string): number {
  let score = 0;
  if (row.name.toLowerCase().includes(q)) {
    score += 10;
  }
  if (row.description.toLowerCase().includes(q)) {
    score += 4;
  }
  if (row.sellerDisplayName.toLowerCase().includes(q)) {
    score += 2;
  }
  return score + (row.rating ?? 0);
}

export function formatPrice(cents: number | null, currency: string): string {
  if (cents == null) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(cents / 100);
}

export function formatAvailabilityLabel(status?: string): string {
  switch (status) {
    case "ONLINE":
      return "Online";
    case "BUSY":
      return "Busy";
    case "SCHEDULED_OFFLINE":
      return "Scheduled offline";
    case "OFFLINE":
      return "Offline";
    case "PAUSED":
      return "Paused";
    default:
      return "Unknown";
  }
}
