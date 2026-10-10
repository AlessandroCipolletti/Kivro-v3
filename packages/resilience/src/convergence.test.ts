import { describe, expect, it } from "vitest";
import {
  assertDuplicateDeliveryHarmless,
  assertExactlyOnceFinancialEffect,
  assertJobTerminalConverged,
} from "./convergence.js";

describe("fault convergence assertions (HARD-006)", () => {
  it("detects duplicate ledger keys", () => {
    const r = assertExactlyOnceFinancialEffect({
      settlementAttempts: 2,
      distinctLedgerKeys: ["job:a:capture", "job:a:capture"],
      expectedMinKeys: 1,
    });
    expect(r.ok).toBe(false);
  });

  it("accepts idempotent duplicate delivery", () => {
    expect(
      assertDuplicateDeliveryHarmless({ deliveryCount: 3, sideEffectCount: 1 }).ok,
    ).toBe(true);
  });

  it("validates terminal job status", () => {
    expect(assertJobTerminalConverged({ finalStatus: "COMPLETED", allowed: ["COMPLETED"] }).ok).toBe(
      true,
    );
  });
});
