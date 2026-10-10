import { describe, expect, it } from "vitest";
import { extractConstraintsFromText } from "./buyer-constraints.js";

describe("extractConstraintsFromText deadline (BUYERUX-004/006)", () => {
  it("parses ISO hard deadline from goal text", () => {
    const c = extractConstraintsFromText("Research competitors by 2026-12-01T18:00:00Z");
    expect(c.hardDeliveryDeadlineAt).toBe("2026-12-01T18:00:00.000Z");
  });

  it("permits a future service only from an explicit wait, not from a better rating", () => {
    expect(extractConstraintsFromText("You can schedule services if necessary").timingMode).toBe(
      "EARLIEST_AVAILABLE_ALLOWED",
    );
    expect(extractConstraintsFromText("Use the best rated renderer tonight").timingMode).toBeUndefined();
  });
});
