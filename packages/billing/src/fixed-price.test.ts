import { describe, expect, it } from "vitest";
import { mvpJobPriceCents } from "./fixed-price.js";

describe("fixed job price", () => {
  it("ignores image count and file size", () => {
    expect(mvpJobPriceCents(800, { imageCount: 4, fileBytes: 50_000_000 })).toBe(800);
  });
});
