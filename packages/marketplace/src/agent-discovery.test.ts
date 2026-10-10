import { describe, expect, it } from "vitest";
import type { CapabilityListingRow } from "./capability-listing.js";
import { runAssistedDiscovery } from "./agent-discovery.js";
import { extractConstraintsFromText } from "./buyer-constraints.js";

const sample: CapabilityListingRow[] = [
  {
    id: "1",
    slug: "company-intel",
    name: "Company Intelligence",
    description: "Research competitors and funding",
    category: "research",
    priceTierCents: 240,
    currency: "USD",
    rating: 4.9,
    jobCount: 100,
    estimatedDuration: 60,
    sellerDisplayName: "Acme",
    availabilityStatus: "ONLINE",
    accepting: true,
  },
  {
    id: "2",
    slug: "cheap-scan",
    name: "Quick Scan",
    description: "Basic web scan",
    category: "research",
    priceTierCents: 600,
    currency: "USD",
    rating: 4.2,
    jobCount: 10,
    estimatedDuration: 30,
    sellerDisplayName: "Beta",
    availabilityStatus: "ONLINE",
    accepting: true,
  },
];

describe("assisted discovery §131", () => {
  it("extracts max spend and min rating from text", () => {
    const c = extractConstraintsFromText("Spend less than $5, rated at least 4.5, online now");
    expect(c.maxPerJobSpendCents).toBe(500);
    expect(c.minRating).toBe(4.5);
    expect(c.onlineOnly).toBe(true);
  });

  it("never recommends over budget", () => {
    const result = runAssistedDiscovery(sample, {
      goal: "company research under $3",
      constraints: { maxPerJobSpendCents: 300 },
    });
    expect(result.recommendations.every((r) => (r.priceTierCents ?? 0) <= 300)).toBe(true);
  });

  it("ranks intent match first", () => {
    const result = runAssistedDiscovery(sample, {
      goal: "company intelligence competitors",
    });
    expect(result.recommendations[0]?.slug).toBe("company-intel");
  });

  it("shows a later service when the buyer asks for advice, and hides it when they ask to buy", () => {
    const listings = [
      ...sample,
      {
        ...sample[0]!,
        id: "3",
        slug: "later-research",
        name: "Later Research",
        description: "company intelligence competitors overnight",
        availabilityStatus: "SCHEDULED_OFFLINE" as const,
        accepting: false,
        nextAvailableAt: "2026-10-10T20:00:00.000Z",
      },
    ];
    const advice = runAssistedDiscovery(listings, { goal: "Which service is best for company intelligence?" });
    const execution = runAssistedDiscovery(listings, { goal: "Do this company intelligence for me" });
    expect(advice.interaction).toBe("RECOMMENDATION");
    expect(advice.recommendations.some((row) => row.slug === "later-research")).toBe(true);
    expect(execution.interaction).toBe("EXECUTION");
    expect(execution.recommendations.some((row) => row.slug === "later-research")).toBe(false);
  });
});
