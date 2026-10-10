import { describe, expect, it } from "vitest";
import { PRIMARY_NAV } from "./primary-nav.js";

describe("primary navigation", () => {
  it("includes discover, AI request, jobs, favorites, and selling", () => {
    expect(PRIMARY_NAV.map((item) => item.label)).toEqual([
      "Discover",
      "AI Request",
      "My Jobs",
      "Favorites",
      "Selling",
    ]);
  });
});
