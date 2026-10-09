import { describe, expect, it } from "vitest";
import { isValidIanaTimezone, normalizeWeeklyWindows } from "./schedule-validation.js";

describe("schedule validation §399", () => {
  it("accepts IANA timezone", () => {
    expect(isValidIanaTimezone("Europe/Zurich")).toBe(true);
    expect(isValidIanaTimezone("Not/AZone")).toBe(false);
  });

  it("normalizes local time strings", () => {
    const result = normalizeWeeklyWindows([
      { dayOfWeek: 1, startLocalTime: "20:00", endLocalTime: "07:00" },
    ]);
    expect("ok" in result).toBe(true);
    if ("ok" in result) {
      expect(result.windows[0]?.startMinutes).toBe(20 * 60);
      expect(result.windows[0]?.endMinutes).toBe(7 * 60);
    }
  });
});
