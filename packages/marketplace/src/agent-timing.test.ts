import { describe, expect, it } from "vitest";
import { capabilityFitsAgentTiming } from "./agent-timing.js";

const now = Date.parse("2026-10-10T12:00:00.000Z");

describe("capabilityFitsAgentTiming", () => {
  it("rejects a future-only capability in immediate mode", () => {
    expect(
      capabilityFitsAgentTiming(
        {
          availabilityStatus: "SCHEDULED_OFFLINE",
          accepting: false,
          nextAvailableAt: "2026-10-11T12:00:00.000Z",
          estimatedDuration: 60,
        },
        "IMMEDIATE",
        now,
      ),
    ).toBe(false);
  });

  it("accepts a scheduled capability only when completion fits the deadline", () => {
    const row = {
      availabilityStatus: "SCHEDULED_OFFLINE",
      accepting: false,
      nextAvailableAt: "2026-10-10T18:00:00.000Z",
      estimatedDuration: 3600,
    };
    expect(
      capabilityFitsAgentTiming(row, "DEADLINE", now, Date.parse("2026-10-10T20:00:00.000Z")),
    ).toBe(true);
    expect(
      capabilityFitsAgentTiming(row, "DEADLINE", now, Date.parse("2026-10-10T18:30:00.000Z")),
    ).toBe(false);
  });

  it("allows a future window only after the buyer explicitly permits waiting", () => {
    const row = {
      availabilityStatus: "SCHEDULED_OFFLINE" as const,
      accepting: false,
      nextAvailableAt: "2026-10-10T18:00:00.000Z",
      estimatedDuration: 60,
    };
    expect(capabilityFitsAgentTiming(row, "EARLIEST_AVAILABLE_ALLOWED", now)).toBe(true);
    expect(capabilityFitsAgentTiming(row, "IMMEDIATE", now)).toBe(false);
  });

  it("treats a five-minute queue as immediate and an eight-hour queue as not", () => {
    expect(
      capabilityFitsAgentTiming(
        {
          availabilityStatus: "BUSY",
          accepting: true,
          nextAvailableAt: null,
          estimatedDuration: 60,
          estimatedQueueWaitSeconds: 5 * 60,
        },
        "IMMEDIATE",
        now,
      ),
    ).toBe(true);
    expect(
      capabilityFitsAgentTiming(
        {
          availabilityStatus: "BUSY",
          accepting: true,
          nextAvailableAt: null,
          estimatedDuration: 60,
          estimatedQueueWaitSeconds: 8 * 60 * 60,
        },
        "IMMEDIATE",
        now,
      ),
    ).toBe(false);
  });

  it("keeps an offline capability out of deadline mode when no window exists", () => {
    expect(
      capabilityFitsAgentTiming(
        { availabilityStatus: "OFFLINE", accepting: false, nextAvailableAt: null, estimatedDuration: 60 },
        "DEADLINE",
        now,
        now + 86_400_000,
      ),
    ).toBe(false);
  });
});
