import { describe, expect, it } from "vitest";
import {
  buildJobScheduleQuote,
  earliestExecutionWording,
  formatBuyerLocalTime,
  marketplaceCardCopy,
} from "./schedule-quote.js";

const now = new Date("2026-10-10T16:00:00.000Z");

describe("schedule quote", () => {
  it("quotes earliest eligibility without promising an exact start", () => {
    const quote = buildJobScheduleQuote({
      capabilityId: "cap",
      capabilityVersionId: "ver",
      amountMinor: 1999,
      accepting: false,
      nextEligibleAt: "2026-10-10T20:00:00.000Z",
      estimatedDurationSeconds: 20 * 60,
      queueDelaySeconds: 10 * 60,
      timeZone: "UTC",
      now,
    });
    expect(quote?.executionMode).toBe("EARLIEST_AVAILABLE");
    expect(quote?.guaranteedStart).toBe(false);
    expect(quote?.earliestExecutionLabel).toContain("Eligible to start from");
    expect(earliestExecutionWording(quote?.earliestExecutionLabel ?? "")).toBe(true);
    expect(quote?.earliestExecutionLabel).not.toMatch(/:\d{2}:\d{2}/);
    expect(quote?.estimatedDeliveryLabel).toContain("–");
    expect(quote?.paymentNotice).toContain("secured now");
    expect(Date.parse(quote!.quoteExpiresAt) - now.getTime()).toBe(3 * 60_000);
  });

  it("shows the next window in the buyer's timezone", () => {
    const local = formatBuyerLocalTime("2026-10-13T00:00:00.000Z", "America/New_York");
    expect(local?.note).toBe("Your local time");
    expect(local?.timeLabel).toContain("Monday");
    expect(local?.timeLabel).toContain("8:00");
    expect(local?.timeLabel).not.toMatch(/:\d{2}:\d{2}/);
  });

  it("labels marketplace cards by operational state", () => {
    expect(marketplaceCardCopy({ status: "ONLINE" })).toBe("Available now");
    expect(marketplaceCardCopy({ status: "PAUSED" })).toBe("Temporarily paused");
    expect(marketplaceCardCopy({ status: "OFFLINE" })).toContain("Next availability unknown");
    expect(
      marketplaceCardCopy({
        status: "SCHEDULED_OFFLINE",
        nextAvailableAt: "2026-10-10T20:00:00.000Z",
        timeZone: "UTC",
        now,
      }),
    ).toBe("Available tonight at 8:00 PM");
  });
});
