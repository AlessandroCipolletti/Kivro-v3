/** Master Spec §123–§125 — marketplace listing DTOs and transparent search/sort. */

export type MarketplaceSort =
  | "relevance"
  | "rating"
  | "most_used"
  | "price_asc"
  | "price_desc"
  | "fastest";

export type AvailabilityFilter = "any" | "now" | "today" | "schedulable";

export type MarketplaceSearchFilters = {
  q?: string;
  category?: string;
  minRating?: number;
  minPriceCents?: number;
  maxPriceCents?: number;
  onlineOnly?: boolean;
  availability?: AvailabilityFilter;
  sort?: MarketplaceSort;
  nowMs?: number;
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
  /** When false, a file request must not rank this capability on description text alone. */
  acceptsFileInput?: boolean;
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
  const availability = filters.onlineOnly ? "now" : filters.availability;
  if (availability && availability !== "any") {
    const now = filters.nowMs ?? Date.now();
    out = out.filter((r) => matchesAvailability(r, availability, now));
  }
  return out;
}

function matchesAvailability(
  row: CapabilityListingRow,
  filter: Exclude<AvailabilityFilter, "any">,
  nowMs: number,
): boolean {
  const availableNow = row.availabilityStatus === "ONLINE" && row.accepting === true;
  if (filter === "now") {
    return availableNow;
  }
  const next = row.nextAvailableAt ? Date.parse(row.nextAvailableAt) : Number.NaN;
  const withinDay = Number.isFinite(next) && next <= nowMs + 24 * 60 * 60 * 1000;
  if (filter === "today") {
    return availableNow || withinDay;
  }
  return (
    availableNow ||
    Number.isFinite(next) ||
    row.availabilityStatus === "BUSY" ||
    row.availabilityStatus === "SCHEDULED_OFFLINE"
  );
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
        copy.sort((a, b) => {
          const avail = Number(isAvailableNow(b)) - Number(isAvailableNow(a));
          if (avail !== 0) {
            return avail;
          }
          return b.jobCount - a.jobCount;
        });
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
  if (isAvailableNow(row)) {
    score += 0.2;
  }
  return score + (row.rating ?? 0);
}

function isAvailableNow(row: CapabilityListingRow): boolean {
  return row.availabilityStatus === "ONLINE" && row.accepting === true;
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

export function formatAvailabilityLabel(status?: string, nextAvailableAt?: string | null): string {
  switch (status) {
    case "ONLINE":
      return "Available now";
    case "BUSY":
      return "Busy";
    case "SCHEDULED_OFFLINE":
      return nextAvailableAt ? `Available from ${nextAvailableAt}` : "Schedulable";
    case "OFFLINE":
      return "Provider offline";
    case "PAUSED":
      return "Temporarily paused";
    default:
      return "Unknown";
  }
}
