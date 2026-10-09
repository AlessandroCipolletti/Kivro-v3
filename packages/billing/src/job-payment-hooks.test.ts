import { describe, expect, it } from "vitest";
import { assertJobTransition } from "@kivro/domain";

describe("terminal payment reconciliation rules", () => {
  it("allows REFUNDED after cancellable failure terminals", () => {
    for (const from of [
      "CANCELLED",
      "REJECTED",
      "FAILED_EXECUTION",
      "TIMED_OUT",
    ] as const) {
      expect(() => assertJobTransition(from, "REFUNDED")).not.toThrow();
    }
  });

  it("does not allow REFUNDED from completed delivery", () => {
    expect(() => assertJobTransition("COMPLETED", "REFUNDED")).toThrow();
  });
});
