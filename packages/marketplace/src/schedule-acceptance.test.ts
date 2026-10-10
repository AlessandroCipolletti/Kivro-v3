import { describe, expect, it } from "vitest";
import {
  buyerInputAttemptsScheduleControl,
  computeNextAvailableAt,
  evaluateAcceptingNewJobs,
  isScheduleOpen,
  mapWorkerDeviceToBuyerAvailability,
  queuedJobMayStart,
  resolveExecutionPreference,
  scheduleAuditRecord,
  windowOverflowDecision,
} from "@kivro/job-scheduling";
import { capabilityFitsAgentTiming } from "./agent-timing.js";

const weekday = {
  mode: "CUSTOM_SCHEDULE" as const,
  timezone: "UTC",
  windows: [{ dayOfWeek: 1, startMinutes: 9 * 60, endMinutes: 17 * 60 }],
};
const weekend = {
  mode: "CUSTOM_SCHEDULE" as const,
  timezone: "UTC",
  windows: [{ dayOfWeek: 6, startMinutes: 10 * 60, endMinutes: 12 * 60 }],
};

describe("schedule acceptance", () => {
  it("covers weekly windows, weekend, overnight, timezone, and daylight saving", () => {
    expect(isScheduleOpen({ mode: "ALWAYS_AVAILABLE", timezone: "Europe/Rome", windows: [] })).toBe(true);
    expect(isScheduleOpen(weekday, new Date("2026-03-09T12:00:00.000Z"))).toBe(true);
    expect(isScheduleOpen(weekend, new Date("2026-03-14T11:00:00.000Z"))).toBe(true);
    expect(isScheduleOpen(weekend, new Date("2026-03-09T11:00:00.000Z"))).toBe(false);
    expect(
      isScheduleOpen(
        {
          mode: "CUSTOM_SCHEDULE",
          timezone: "UTC",
          windows: [{ dayOfWeek: 1, startMinutes: 20 * 60, endMinutes: 7 * 60 }],
        },
        new Date("2026-03-10T06:00:00.000Z"),
      ),
    ).toBe(true);
    expect(
      isScheduleOpen(
        {
          mode: "CUSTOM_SCHEDULE",
          timezone: "America/New_York",
          windows: [{ dayOfWeek: 3, startMinutes: 20 * 60, endMinutes: 21 * 60 }],
        },
        new Date("2026-07-16T00:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("keeps purchase, pause, queue, audit, and the agent on the seller schedule", () => {
    const closed = mapWorkerDeviceToBuyerAvailability({
      deviceStatus: "ONLINE",
      sellerGlobalPause: false,
      scheduleAccepting: false,
      hasActiveJob: false,
    });
    expect(closed).toBe("SCHEDULED_OFFLINE");
    const healthy = evaluateAcceptingNewJobs({
      capabilityPublished: true,
      schedule: { mode: "ALWAYS_AVAILABLE", timezone: "UTC", windows: [] },
      workerDeviceStatus: "ONLINE",
      hasActiveJobOnWorker: false,
      globalDispatchEnabled: true,
    });
    expect(healthy.accepting).toBe(true);
    expect(healthy.buyerAvailability).toBe("ONLINE");
    const sleeping = mapWorkerDeviceToBuyerAvailability({
      deviceStatus: "OFFLINE",
      sellerGlobalPause: false,
      scheduleAccepting: true,
      hasActiveJob: false,
    });
    expect(sleeping).toBe("OFFLINE");
    expect(
      resolveExecutionPreference({ mode: "IMMEDIATE_ONLY", accepting: false }).ok,
    ).toBe(false);
    expect(
      capabilityFitsAgentTiming(
        { availabilityStatus: "SCHEDULED_OFFLINE", accepting: false, nextAvailableAt: null },
        "IMMEDIATE",
        Date.now(),
      ),
    ).toBe(false);
    const next = computeNextAvailableAt(weekday, new Date("2026-03-09T20:00:00.000Z"));
    expect(next).not.toBeNull();
    expect(windowOverflowDecision({
      jobStatus: "RUNNING",
      windowOpen: false,
      now: new Date("2026-03-09T20:00:00.000Z"),
    })).toBe("CONTINUE");
    expect(queuedJobMayStart({ paused: false, windowOpen: false })).toBe(false);
    expect(
      isScheduleOpen(
        {
          mode: "MANUALLY_PAUSED",
          timezone: "UTC",
          windows: [{ dayOfWeek: 1, startMinutes: 0, endMinutes: 24 * 60 }],
        },
        new Date("2026-03-09T12:00:00.000Z"),
      ),
    ).toBe(false);
    const secured = evaluateAcceptingNewJobs({
      capabilityPublished: true,
      schedule: { mode: "ALWAYS_AVAILABLE", timezone: "UTC", windows: [] },
      workerDeviceStatus: "ONLINE",
      hasActiveJobOnWorker: false,
      globalDispatchEnabled: true,
      platformSecurityPause: true,
    });
    expect(secured.accepting).toBe(false);
    expect(secured.buyerAvailability).toBe("PAUSED");
    const edited = { ...weekday, windows: [{ dayOfWeek: 1, startMinutes: 18 * 60, endMinutes: 19 * 60 }] };
    expect(isScheduleOpen(edited, new Date("2026-03-09T12:00:00.000Z"))).toBe(false);
    expect(isScheduleOpen(edited, new Date("2026-03-09T18:30:00.000Z"))).toBe(true);
    const audit = scheduleAuditRecord({
      sellerId: "seller",
      capabilityId: "cap",
      oldSchedule: weekday,
      newSchedule: edited,
      timezone: "UTC",
      changedAt: new Date("2026-03-09T12:00:00.000Z"),
      source: "WEB",
    });
    expect(audit.timezone).toBe("UTC");
    expect(buyerInputAttemptsScheduleControl({ scheduleMode: "ALWAYS_AVAILABLE" })).toBe(true);
  });
});
