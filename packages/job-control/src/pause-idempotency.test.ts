import { describe, expect, it } from "vitest";
import { planSellerPauseTransition } from "./pause-idempotency.js";

describe("pause idempotency §446", () => {
  it("is noop when already paused", () => {
    expect(planSellerPauseTransition("PAUSED", "pause")).toEqual({
      kind: "noop",
      status: "PAUSED",
    });
  });

  it("requests pause from running", () => {
    expect(planSellerPauseTransition("RUNNING", "pause")).toEqual({
      kind: "request_pause",
      next: "PAUSE_REQUESTED",
    });
  });

  it("is noop when already running on resume", () => {
    expect(planSellerPauseTransition("RUNNING", "resume")).toEqual({
      kind: "noop",
      status: "RUNNING",
    });
  });
});
