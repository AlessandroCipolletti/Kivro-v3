import { describe, expect, it } from "vitest";
import { validateScheduledRunAt } from "./scheduled-run-validation.js";

describe("scheduled run validation", () => {
  it("rejects run-at outside custom window", () => {
    const config = {
      mode: "CUSTOM_SCHEDULE" as const,
      timezone: "UTC",
      windows: [{ dayOfWeek: 1, startMinutes: 540, endMinutes: 1020 }],
    };
    const mondayMorning = new Date("2026-03-09T08:00:00.000Z");
    const result = validateScheduledRunAt(config, mondayMorning, new Date("2026-03-08T12:00:00.000Z"));
    expect("ok" in result).toBe(false);
  });

  it("accepts run-at inside window", () => {
    const config = {
      mode: "CUSTOM_SCHEDULE" as const,
      timezone: "UTC",
      windows: [{ dayOfWeek: 1, startMinutes: 540, endMinutes: 1020 }],
    };
    const mondayNoon = new Date("2026-03-09T12:00:00.000Z");
    const result = validateScheduledRunAt(config, mondayNoon, new Date("2026-03-08T12:00:00.000Z"));
    expect("ok" in result).toBe(true);
  });
});
