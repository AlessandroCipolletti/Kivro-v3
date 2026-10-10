import { describe, expect, it } from "vitest";
import { quoteChargeAllowed, scheduleQuoteNeedsConfirmation } from "./quote-freshness.js";

describe("quote freshness", () => {
  it("refuses a charge after the quote expires", () => {
    const now = new Date("2026-10-10T12:00:00.000Z");
    expect(quoteChargeAllowed(new Date("2026-10-10T12:05:00.000Z"), now)).toBe(true);
    expect(quoteChargeAllowed(new Date("2026-10-10T11:59:00.000Z"), now)).toBe(false);
  });

  it("asks for confirmation when the eligible window moves", () => {
    expect(
      scheduleQuoteNeedsConfirmation({
        quotedRunAt: new Date("2026-10-10T20:00:00.000Z"),
        currentEligibleAt: new Date("2026-10-11T20:00:00.000Z"),
      }),
    ).toBe(true);
    expect(
      scheduleQuoteNeedsConfirmation({
        quotedRunAt: new Date("2026-10-10T20:00:00.000Z"),
        currentEligibleAt: new Date("2026-10-10T20:10:00.000Z"),
      }),
    ).toBe(false);
    expect(scheduleQuoteNeedsConfirmation({ quotedRunAt: null, currentEligibleAt: new Date() })).toBe(false);
  });
});
