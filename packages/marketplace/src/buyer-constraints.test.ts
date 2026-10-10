import { describe, expect, it } from "vitest";
import { extractConstraintsFromText } from "./buyer-constraints.js";

describe("extractConstraintsFromText deadline (BUYERUX-004/006)", () => {
  it("parses ISO hard deadline from goal text", () => {
    const c = extractConstraintsFromText("Research competitors by 2026-12-01T18:00:00Z");
    expect(c.hardDeliveryDeadlineAt).toBe("2026-12-01T18:00:00.000Z");
  });
});
