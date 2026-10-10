import { describe, expect, it } from "vitest";
import {
  applyEligibleTimeChange,
  buyerScheduleNotice,
  scheduleChangeIsMaterial,
  scheduledJobTimingRecord,
} from "./scheduled-timing-record.js";

describe("scheduled timing record", () => {
  it("keeps the original window when eligibility moves", () => {
    const created = new Date("2026-10-10T13:45:00.000Z");
    const first = new Date("2026-10-10T20:00:00.000Z");
    const record = scheduledJobTimingRecord({
      createdAt: created,
      scheduledForEarliestAt: first,
      nextEligibleAt: first,
      startedAt: null,
      completedAt: null,
      transitions: [],
    });
    const moved = applyEligibleTimeChange(record, "2026-10-11T20:00:00.000Z");
    expect(moved.scheduledForEarliestAt).toBe(first.toISOString());
    expect(moved.nextEligibleAt).toBe("2026-10-11T20:00:00.000Z");
    expect(scheduleChangeIsMaterial(first, new Date("2026-10-11T20:00:00.000Z"))).toBe(true);
    expect(scheduleChangeIsMaterial(first, new Date("2026-10-10T20:05:00.000Z"))).toBe(false);
  });

  it("notifies on real schedule events and stays quiet on a minute tick", () => {
    expect(buyerScheduleNotice("MINUTE_TICK")).toBeNull();
    expect(buyerScheduleNotice("MATERIAL_CHANGE")?.channel).toBe("IN_APP");
    expect(buyerScheduleNotice("SCHEDULED")?.message).toContain("reserved");
  });
});
