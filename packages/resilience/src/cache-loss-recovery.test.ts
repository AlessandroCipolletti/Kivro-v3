import { describe, expect, it } from "vitest";
import { assertCacheLossRecoveryPlan, buildCacheLossRecoveryPlan } from "./cache-loss-recovery.js";

describe("cache loss recovery (M26-FAULT-005)", () => {
  it("M26-GOLD-009 rebuild plan uses PostgreSQL authoritative stores", () => {
    const plan = buildCacheLossRecoveryPlan();
    expect(assertCacheLossRecoveryPlan(plan).ok).toBe(true);
  });
});
