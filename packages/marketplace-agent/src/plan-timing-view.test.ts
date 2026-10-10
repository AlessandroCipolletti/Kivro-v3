import { describe, expect, it } from "vitest";
import { formatPlanTiming } from "./plan-timing-view.js";

describe("plan timing view", () => {
  it("shows price, availability, and runtime before approval", () => {
    const view = formatPlanTiming(
      [
        { label: "Company Research", priceCents: 999, availableNow: true, durationMinutes: 8 },
        {
          label: "Video Ad",
          priceCents: 2999,
          availableNow: false,
          nextAvailableAt: "20:00",
          durationMinutes: 20,
        },
      ],
      { minMinutes: 28, maxMinutes: 40 },
    );
    expect(view.lines[0]).toContain("Available now");
    expect(view.lines[1]).toContain("after start");
    expect(view.totalCents).toBe(3998);
    expect(view.completionLabel).toBe("Estimated completion ~28–40 min");
  });
});
