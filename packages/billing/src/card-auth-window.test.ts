import { describe, expect, it } from "vitest";
import { paymentMethodForSchedule } from "./card-auth-window.js";

describe("card authorization window", () => {
  it("requires prepaid credits when execution is beyond seven days", () => {
    const now = new Date("2026-10-10T00:00:00.000Z");
    expect(paymentMethodForSchedule({ now })).toBe("CARD_OR_CREDITS");
    expect(
      paymentMethodForSchedule({
        now,
        scheduledRunAt: new Date("2026-10-16T00:00:00.000Z"),
      }),
    ).toBe("CARD_OR_CREDITS");
    expect(
      paymentMethodForSchedule({
        now,
        scheduledRunAt: new Date("2026-10-18T00:00:00.000Z"),
      }),
    ).toBe("PREPAID_CREDITS_ONLY");
  });
});
