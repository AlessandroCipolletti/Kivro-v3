import { describe, expect, it } from "vitest";
import { isScheduleOpen } from "./weekly-schedule.js";

describe("weekly schedule §398", () => {
  it("ALWAYS_AVAILABLE is open", () => {
    expect(
      isScheduleOpen({ mode: "ALWAYS_AVAILABLE", timezone: "UTC", windows: [] }),
    ).toBe(true);
  });

  it("CUSTOM_SCHEDULE respects timezone window", () => {
    const config = {
      mode: "CUSTOM_SCHEDULE" as const,
      timezone: "UTC",
      windows: [{ dayOfWeek: 1, startMinutes: 9 * 60, endMinutes: 17 * 60 }],
    };
    const mondayNoon = new Date("2026-03-09T12:00:00.000Z");
    const mondayEvening = new Date("2026-03-09T20:00:00.000Z");
    expect(isScheduleOpen(config, mondayNoon)).toBe(true);
    expect(isScheduleOpen(config, mondayEvening)).toBe(false);
  });

  it("MANUALLY_PAUSED is closed", () => {
    expect(
      isScheduleOpen({ mode: "MANUALLY_PAUSED", timezone: "UTC", windows: [] }),
    ).toBe(false);
  });
});
