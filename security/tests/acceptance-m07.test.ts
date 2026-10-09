import { describe, expect, it } from "vitest";
import {
  buyerVisibleJobStatus,
  planSellerPauseTransition,
  rejectBuyerJobControl,
  sellerEarningSettlementAllowed,
} from "@kivro/job-control";
import { assertJobTransition } from "@kivro/domain";

/** Master Spec §449 checklist — automated subset for M07 MVP. */
describe("M07 per-job pause acceptance", () => {
  it("web/API path distinguishes pause requested vs paused", () => {
    assertJobTransition("RUNNING", "PAUSE_REQUESTED");
    assertJobTransition("PAUSE_REQUESTED", "PAUSED");
    const buyer = buyerVisibleJobStatus("PAUSED");
    expect(buyer.label).toContain("Paused");
    expect(buyer.detail).toBeTruthy();
  });

  it("duplicate pause commands are idempotent", () => {
    expect(planSellerPauseTransition("PAUSE_REQUESTED", "pause").kind).toBe("noop");
    expect(planSellerPauseTransition("PAUSED", "pause").kind).toBe("noop");
  });

  it("buyer cannot use seller pause control semantics", () => {
    expect(planSellerPauseTransition("CREATED", "pause").kind).toBe("reject");
    expect(rejectBuyerJobControl().error).toBe("BUYER_JOB_CONTROL_FORBIDDEN");
  });

  it("seller payment does not settle while paused", () => {
    expect(sellerEarningSettlementAllowed("PAUSED")).toBe(false);
  });
});
