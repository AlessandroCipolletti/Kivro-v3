import { describe, expect, it } from "vitest";
import {
  filterCapabilityListings,
  formatPrice,
  sortCapabilityListings,
  type CapabilityListingRow,
} from "./capability-listing.js";

const sample: CapabilityListingRow[] = [
  {
    id: "1",
    slug: "alpha",
    name: "Alpha Research",
    description: "Company intel",
    category: "research",
    priceTierCents: 150,
    currency: "USD",
    rating: 4.9,
    jobCount: 100,
    estimatedDuration: 45,
    sellerDisplayName: "Acme",
    availabilityStatus: "ONLINE",
    accepting: true,
  },
  {
    id: "2",
    slug: "beta",
    name: "Beta Video",
    description: "Video ads",
    category: "creative",
    priceTierCents: 2999,
    currency: "USD",
    rating: 4.2,
    jobCount: 10,
    estimatedDuration: 1200,
    sellerDisplayName: "Studio",
    availabilityStatus: "SCHEDULED_OFFLINE",
    accepting: false,
  },
];

describe("marketplace search §125", () => {
  it("filters by query and onlineOnly", () => {
    const filtered = filterCapabilityListings(sample, { q: "alpha", onlineOnly: true });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.slug).toBe("alpha");
  });

  it("sorts by price ascending", () => {
    const sorted = sortCapabilityListings(sample, "price_asc");
    expect(sorted[0]?.slug).toBe("alpha");
  });

  it("formats USD price", () => {
    expect(formatPrice(150, "USD")).toBe("$1.50");
  });
});
