import { describe, expect, it } from "vitest";
import { inferenceFailureMayCreatePurchase, inferenceOwnership } from "./inference-ownership.js";

describe("inference ownership", () => {
  it("does not turn a provider failure into a purchase", () => {
    expect(inferenceFailureMayCreatePurchase()).toBe(false);
  });

  it("keeps platform discovery off the seller's paid job", () => {
    expect(inferenceOwnership("PLATFORM").performsPaidJob).toBe(false);
    expect(inferenceOwnership("PLATFORM").paidBy).toBe("marketplace");
    expect(inferenceOwnership("SELLER").runsOn).toBe("seller_computer");
    expect(inferenceOwnership("BUYER").buyerNeedsOwnProvider).toBe(false);
  });
});
