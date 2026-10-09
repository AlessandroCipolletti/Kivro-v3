import { describe, expect, it } from "vitest";
import {
  assertSellerSettlementAllowed,
  fundsReservedWhilePaused,
  sellerEarningSettlementAllowed,
  SettlementWhilePausedError,
} from "./payment-while-paused.js";

describe("payment while paused §439", () => {
  it("blocks settlement unless completed", () => {
    expect(sellerEarningSettlementAllowed("PAUSED")).toBe(false);
    expect(sellerEarningSettlementAllowed("COMPLETED")).toBe(true);
    expect(fundsReservedWhilePaused("PAUSED")).toBe(true);
  });

  it("throws on capture while paused", () => {
    expect(() => assertSellerSettlementAllowed("RUNNING")).toThrow(SettlementWhilePausedError);
  });
});
