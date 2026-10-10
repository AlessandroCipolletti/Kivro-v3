import { describe, expect, it } from "vitest";
import { purchaseDecisionForStaleStep, repairParallelBranches } from "./plan-repair.js";

describe("plan repair", () => {
  it("replaces only the branch that cannot run", () => {
    const result = repairParallelBranches([
      {
        id: "B",
        fits: true,
        alternativeFits: false,
        alternativeWithinBudget: false,
        permissionsPreserved: true,
      },
      {
        id: "C",
        fits: false,
        alternativeFits: true,
        alternativeWithinBudget: true,
        permissionsPreserved: true,
      },
    ]);
    expect(result).toEqual({ ok: true, replacements: ["C"] });
  });

  it("does not buy a step that is no longer available", () => {
    expect(
      purchaseDecisionForStaleStep({
        stillAvailable: false,
        alternativeFound: false,
        priceUnchanged: true,
        permissionsUnchanged: true,
      }),
    ).toBe("REPAIR");
    expect(
      purchaseDecisionForStaleStep({
        stillAvailable: false,
        alternativeFound: true,
        priceUnchanged: false,
        permissionsUnchanged: true,
      }),
    ).toBe("ASK_APPROVAL");
  });
});
