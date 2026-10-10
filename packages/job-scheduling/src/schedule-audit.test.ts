import { describe, expect, it } from "vitest";
import { scheduleAuditRecord } from "./schedule-audit.js";

describe("schedule audit", () => {
  it("records seller, capability, both schedules, timezone, and source", () => {
    const record = scheduleAuditRecord({
      sellerId: "seller-1",
      capabilityId: "cap-1",
      workerId: "worker-1",
      oldSchedule: { mode: "ALWAYS_AVAILABLE" },
      newSchedule: { mode: "CUSTOM_SCHEDULE", windows: [{ dayOfWeek: 1, startMinutes: 1200, endMinutes: 420 }] },
      timezone: "America/New_York",
      changedAt: new Date("2026-10-10T18:00:00.000Z"),
      source: "WEB",
    });
    expect(record.sellerId).toBe("seller-1");
    expect(record.workerId).toBe("worker-1");
    expect(record.timezone).toBe("America/New_York");
    expect(record.source).toBe("WEB");
    expect(record.changedAt).toBe("2026-10-10T18:00:00.000Z");
    expect(record.oldSchedule).not.toEqual(record.newSchedule);
  });
});
