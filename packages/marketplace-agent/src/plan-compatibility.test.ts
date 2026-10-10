import { describe, expect, it } from "vitest";
import { canFeedOutputToInput, validatePlanCompatibility } from "./plan-compatibility.js";

describe("plan compatibility", () => {
  it("allows JSON to become text and rejects a silent PDF conversion", () => {
    expect(canFeedOutputToInput("json", "text")).toBe(true);
    expect(canFeedOutputToInput("json", "pdf")).toBe(false);
    expect(canFeedOutputToInput("pdf", "markdown")).toBe(false);
  });

  it("flags an incompatible chain and accepts a supported one", () => {
    expect(
      validatePlanCompatibility([
        { clientStepKey: "research", outputKind: "json", dependsOnStepIds: [] },
        {
          clientStepKey: "pdf",
          outputKind: "pdf",
          inputKind: "pdf",
          dependsOnStepIds: ["research"],
        },
      ]),
    ).toHaveLength(1);
    expect(
      validatePlanCompatibility([
        { clientStepKey: "research-1", outputKind: "json", dependsOnStepIds: [] },
        { clientStepKey: "research-2", outputKind: "json", dependsOnStepIds: [] },
        {
          clientStepKey: "compare",
          outputKind: "markdown",
          inputKind: "text",
          dependsOnStepIds: ["research-1", "research-2"],
        },
      ]),
    ).toEqual([]);
  });
});
