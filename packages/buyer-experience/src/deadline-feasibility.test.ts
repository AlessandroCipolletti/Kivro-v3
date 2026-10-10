import { describe, expect, it } from "vitest";
import { assessHardDeliveryDeadline } from "./deadline-feasibility.js";

describe("assessHardDeliveryDeadline (BUYERUX-004/005)", () => {
  it("rejects past deadlines", () => {
    const result = assessHardDeliveryDeadline({
      now: new Date("2026-01-02T12:00:00Z"),
      hardDeliveryDeadlineAt: new Date("2026-01-01T12:00:00Z"),
    });
    expect(result.feasible).toBe(false);
  });

  it("warns when duration unknown", () => {
    const result = assessHardDeliveryDeadline({
      now: new Date("2026-01-01T12:00:00Z"),
      hardDeliveryDeadlineAt: new Date("2026-01-03T12:00:00Z"),
    });
    expect(result.feasible).toBe(true);
    if (result.feasible) {
      expect(result.warning).toContain("unknown");
    }
  });
});
