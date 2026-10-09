import { describe, expect, it } from "vitest";
import { buildJobAuditSummary } from "./job-audit-summary.js";

describe("job audit summary §29", () => {
  it("includes runtime and earnings lines", () => {
    const started = new Date("2026-01-01T00:00:00Z");
    const completed = new Date("2026-01-01T00:00:35Z");
    const summary = buildJobAuditSummary({
      jobId: "12345678-abcd",
      startedAt: started,
      completedAt: completed,
      priceSnapshotCents: 150,
      currency: "USD",
      sellerNetSnapshotCents: 120,
      platformFeeSnapshotCents: 30,
      providerCostEstimateCents: 17,
      timeline: [{ at: started.toISOString(), label: "running" }],
    });
    expect(summary.runtimeSeconds).toBe(35);
    expect(summary.lines.some((l) => l.includes("Seller earning"))).toBe(true);
  });
});
