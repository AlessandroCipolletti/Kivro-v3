import { describe, expect, it } from "vitest";
import { estimateBuyerJobTiming } from "./buyer-eta.js";

describe("estimateBuyerJobTiming (BUYERUX-012)", () => {
  it("returns unknown confidence without history", () => {
    const est = estimateBuyerJobTiming({ status: "QUEUED", sampleCompletedCount: 0 });
    expect(est.confidence).toBe("unknown");
    expect(est.completeEarliestAt).toBeNull();
  });
});
