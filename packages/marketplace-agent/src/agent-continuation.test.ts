import { describe, expect, it } from "vitest";
import { continueImmediateSearch, maySwapForImmediacy, planStepsFitTiming } from "./agent-continuation.js";

const now = Date.parse("2026-10-10T12:00:00.000Z");

describe("agent continuation", () => {
  it("skips a future service and keeps searching", () => {
    const result = continueImmediateSearch(
      [
        { priceTierCents: 999, availabilityStatus: "SCHEDULED_OFFLINE", accepting: false, nextAvailableAt: "2026-10-11T18:00:00.000Z" },
        { priceTierCents: 1499, availabilityStatus: "ONLINE", accepting: true },
      ],
      now,
    );
    expect(result.exhausted).toBe(false);
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]?.priceTierCents).toBe(1499);
  });

  it("refuses an immediate alternative that breaks budget or permissions", () => {
    expect(
      maySwapForImmediacy({ alternativePriceCents: 1499, budgetCents: 1000, permissionsPreserved: true, ioCompatible: true }),
    ).toBe(false);
    expect(
      maySwapForImmediacy({ alternativePriceCents: 1499, budgetCents: 2000, permissionsPreserved: false, ioCompatible: true }),
    ).toBe(false);
    expect(
      maySwapForImmediacy({ alternativePriceCents: 1499, budgetCents: 2000, permissionsPreserved: true, ioCompatible: true }),
    ).toBe(true);
  });

  it("requires every orchestration step to fit the timing policy", () => {
    const later = { priceTierCents: 100, availabilityStatus: "SCHEDULED_OFFLINE", accepting: false, nextAvailableAt: "2026-10-10T18:00:00.000Z", estimatedDuration: 60 };
    const nowRow = { priceTierCents: 100, availabilityStatus: "ONLINE", accepting: true, estimatedDuration: 60 };
    expect(planStepsFitTiming([nowRow, later], "IMMEDIATE", now)).toBe(false);
    expect(planStepsFitTiming([nowRow, later], "DEADLINE", now, Date.parse("2026-10-10T20:00:00.000Z"))).toBe(true);
  });
});
