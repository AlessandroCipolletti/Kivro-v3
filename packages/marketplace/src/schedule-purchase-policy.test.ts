import { describe, expect, it } from "vitest";
import {
  buyerPurchaseAction,
  buyerPurchaseActionLabel,
  humanSearchKeepsScheduledListing,
  publicScheduleSummary,
  SCHEDULED_RESERVATION_COPY,
} from "./schedule-purchase-policy.js";

describe("schedule purchase policy", () => {
  it("names an immediate run and a future reservation differently", () => {
    expect(buyerPurchaseActionLabel(buyerPurchaseAction({ accepting: true, availabilityStatus: "ONLINE" }))).toBe(
      "Run now",
    );
    const scheduled = buyerPurchaseAction({
      accepting: false,
      availabilityStatus: "SCHEDULED_OFFLINE",
      nextAvailableAt: "2026-10-11T18:00:00.000Z",
    });
    expect(buyerPurchaseActionLabel(scheduled)).toBe("Schedule for earliest availability");
    expect(buyerPurchaseActionLabel(scheduled)).not.toBe("Run");
    expect(SCHEDULED_RESERVATION_COPY).toContain("reserving this job now");
  });

  it("keeps a schedule-closed listing visible without publishing weekly windows", () => {
    expect(humanSearchKeepsScheduledListing("SCHEDULED_OFFLINE")).toBe(true);
    const summary = publicScheduleSummary({
      availabilityStatus: "SCHEDULED_OFFLINE",
      nextAvailableAt: "2026-10-11T18:00:00.000Z",
      scheduleWindows: [{ day: "tuesday", start: "09:00" }],
    });
    expect(summary.nextAvailableAt).toBe("2026-10-11T18:00:00.000Z");
    expect(JSON.stringify(summary)).not.toContain("tuesday");
  });

  it("keeps paused, blocked, and unexpectedly offline capabilities unavailable", () => {
    expect(buyerPurchaseAction({ accepting: false, availabilityStatus: "PAUSED", nextAvailableAt: "2026-10-11T18:00:00.000Z" })).toBe(
      "UNAVAILABLE",
    );
    expect(buyerPurchaseAction({ accepting: false, availabilityStatus: "SECURITY_BLOCKED" })).toBe("UNAVAILABLE");
    expect(buyerPurchaseAction({ accepting: false, availabilityStatus: "OFFLINE", nextAvailableAt: "2026-10-11T18:00:00.000Z" })).toBe(
      "UNAVAILABLE",
    );
    expect(buyerPurchaseAction({ accepting: true, availabilityStatus: "BUSY" })).toBe("JOIN_QUEUE");
    expect(buyerPurchaseAction({ accepting: false, availabilityStatus: "BUSY" })).toBe("UNAVAILABLE");
  });
});
