import { describe, expect, it } from "vitest";
import { scheduledPauseWarning, summarizeScheduledDemand } from "./scheduled-demand.js";

describe("scheduled demand", () => {
  it("groups reservations by hour and never calls them settled revenue", () => {
    const summary = summarizeScheduledDemand([
      {
        scheduledRunAt: new Date("2026-10-10T20:15:00.000Z"),
        reservedAmountCents: 999,
        sellerNetSnapshotCents: 800,
        estimatedDurationMinutes: 25,
      },
      {
        scheduledRunAt: new Date("2026-10-10T20:40:00.000Z"),
        reservedAmountCents: 500,
        sellerNetSnapshotCents: 400,
        estimatedDurationMinutes: 10,
      },
    ]);
    expect(summary.jobCount).toBe(2);
    expect(summary.windows[0]?.reservedBuyerValueCents).toBe(1499);
    expect(summary.windows[0]?.estimatedSellerEarningsCents).toBe(1200);
    expect(summary.windows[0]?.workloadMinutes).toBe(35);
    expect(summary.settledRevenueCents).toBe(0);
  });

  it("warns before a pause when jobs are already waiting", () => {
    expect(scheduledPauseWarning(0)).toBeNull();
    expect(scheduledPauseWarning(5)).toContain("5 scheduled jobs");
    expect(scheduledPauseWarning(5)).toContain("refunded");
  });
});
