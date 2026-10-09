import { describe, expect, it } from "vitest";
import { deriveMarketplaceControlState } from "./marketplace-control.js";

describe("marketplace control §386", () => {
  it("requires local sync when cloud paused but worker has not reported pause", () => {
    const state = deriveMarketplaceControlState({
      cloudEmergencyPause: true,
      localPauseReported: false,
    });
    expect(state.requiresLocalPauseSync).toBe(true);
    expect(state.dispatchBlocked).toBe(true);
  });
});
