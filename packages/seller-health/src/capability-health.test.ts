import { describe, expect, it } from "vitest";
import { describeCapabilityHealth } from "./capability-health.js";

describe("capability health §376", () => {
  it("maps emergency pause reason to seller-facing detail", () => {
    const result = describeCapabilityHealth({
      buyerAvailability: "PAUSED",
      accepting: false,
      reasons: ["EMERGENCY_PAUSE"],
    });
    expect(result.healthLabel).toBe("PAUSED");
    expect(result.detail).toContain("Emergency pause");
  });
});
