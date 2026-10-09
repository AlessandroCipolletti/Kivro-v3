import { describe, expect, it } from "vitest";
import { runAssistedDiscovery } from "@kivro/marketplace";
import { buildBuyerJobTimeline } from "@kivro/marketplace";

describe("M10 acceptance — agent constraints §133", () => {
  it("returns empty shortlist when budget excludes all listings", () => {
    const result = runAssistedDiscovery(
      [
        {
          id: "x",
          slug: "x",
          name: "Premium",
          description: "test",
          category: "c",
          priceTierCents: 9999,
          currency: "USD",
          rating: 5,
          jobCount: 1,
          estimatedDuration: 10,
          sellerDisplayName: "S",
          availabilityStatus: "ONLINE",
          accepting: true,
        },
      ],
      { goal: "test", constraints: { maxPerJobSpendCents: 100 } },
    );
    expect(result.recommendations).toHaveLength(0);
  });
});

describe("M10 acceptance — buyer audit timeline §29", () => {
  it("merges transitions and sanitized audit without throwing", () => {
    const timeline = buildBuyerJobTimeline({
      transitions: [
        { createdAt: new Date("2026-01-01T00:00:00Z"), toStatus: "QUEUED", reason: null },
      ],
      auditEvents: [
        {
          createdAt: new Date("2026-01-01T00:00:01Z"),
          type: "JOB_STARTED",
          sanitizedPayload: { message: "Sandbox created" },
        },
      ],
    });
    expect(timeline.length).toBeGreaterThanOrEqual(2);
    expect(timeline.some((t) => t.detail?.includes("Sandbox"))).toBe(true);
  });
});
