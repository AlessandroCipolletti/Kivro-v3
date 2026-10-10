import { describe, expect, it } from "vitest";
import {
  approximateStartLabel,
  DELIVERY_PROMISE_COPY,
  CHECKOUT_FUTURE_INTRO,
  RESERVATION_FUNDS_COPY,
  securityPauseClearableBy,
} from "./buyer-timing-copy.js";

describe("buyer timing copy", () => {
  it("explains a multi-hour wait without second-level precision", () => {
    const now = new Date("2026-10-10T12:00:00.000Z");
    const next = new Date("2026-10-10T18:14:00.000Z");
    expect(approximateStartLabel(now, next)).toBe("Starts in approximately 6h 14m");
    expect(approximateStartLabel(now, next)).not.toMatch(/sec/);
    expect(DELIVERY_PROMISE_COPY).toContain("estimate");
    expect(RESERVATION_FUNDS_COPY).toContain("not settled");
    expect(CHECKOUT_FUTURE_INTRO).toContain("reserve it");
  });

  it("blocks a seller from clearing a security pause", () => {
    expect(securityPauseClearableBy("SELLER")).toBe(false);
    expect(securityPauseClearableBy("BUYER")).toBe(false);
    expect(securityPauseClearableBy("ADMIN")).toBe(true);
  });
});
