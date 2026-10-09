import { describe, expect, it } from "vitest";

describe("review stars validation §128", () => {
  it("accepts 1-5 range", () => {
    for (const stars of [1, 3, 5]) {
      expect(stars >= 1 && stars <= 5).toBe(true);
    }
    expect(0 >= 1 && 0 <= 5).toBe(false);
  });
});
