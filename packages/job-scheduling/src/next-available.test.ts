import { describe, expect, it } from "vitest";
import { computeNextAvailableAt } from "./next-available.js";

describe("nextAvailableAt §405", () => {
  it("returns now for ALWAYS_AVAILABLE", () => {
    const from = new Date("2026-03-09T12:00:00.000Z");
    const next = computeNextAvailableAt(
      { mode: "ALWAYS_AVAILABLE", timezone: "UTC", windows: [] },
      from,
    );
    expect(next?.getTime()).toBe(from.getTime());
  });

  it("finds next window start", () => {
    const config = {
      mode: "CUSTOM_SCHEDULE" as const,
      timezone: "UTC",
      windows: [{ dayOfWeek: 1, startMinutes: 9 * 60, endMinutes: 17 * 60 }],
    };
    const sunday = new Date("2026-03-08T12:00:00.000Z");
    const next = computeNextAvailableAt(config, sunday);
    expect(next).not.toBeNull();
    expect(next!.getUTCDay()).toBe(1);
  });
});
