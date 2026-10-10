import { describe, expect, it } from "vitest";
import { verifiedReputation } from "./verified-reputation.js";

describe("verified reputation", () => {
  it("ignores reviews that are not from a completed job", () => {
    expect(
      verifiedReputation([
        { stars: 5, fromCompletedJob: false },
        { stars: 4, fromCompletedJob: true },
        { stars: 2, fromCompletedJob: true },
      ]),
    ).toEqual({ average: 3, count: 2 });
  });
});
