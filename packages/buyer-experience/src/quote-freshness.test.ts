import { describe, expect, it } from "vitest";
import { quoteChargeAllowed } from "./quote-freshness.js";

describe("quote freshness", () => {
  it("refuses a charge after the quote expires", () => {
    const now = new Date("2026-10-10T12:00:00.000Z");
    expect(quoteChargeAllowed(new Date("2026-10-10T12:05:00.000Z"), now)).toBe(true);
    expect(quoteChargeAllowed(new Date("2026-10-10T11:59:00.000Z"), now)).toBe(false);
  });
});
