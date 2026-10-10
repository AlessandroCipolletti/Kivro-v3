import { describe, expect, it } from "vitest";
import { canFeedOutputToInput, fileOutputCanFeedInput, validatePlanCompatibility } from "./plan-compatibility.js";

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

  it("maps markdown into text and compares file MIME, extension, size, and role", () => {
    expect(canFeedOutputToInput("markdown", "text")).toBe(true);
    expect(canFeedOutputToInput("markdown", "pdf")).toBe(false);
    expect(
      fileOutputCanFeedInput(
        { mime: "text/markdown", extension: ".md", maxFiles: 1, maxBytes: 1000 },
        { mime: "application/pdf", extension: ".pdf", maxFiles: 1, maxBytes: 1000 },
      ),
    ).toBe(false);
    expect(
      fileOutputCanFeedInput(
        {
          mime: "application/pdf",
          extension: ".pdf",
          maxFiles: 1,
          maxBytes: 1000,
          semanticType: "research_report",
        },
        {
          mime: "application/pdf",
          extension: ".pdf",
          maxFiles: 1,
          maxBytes: 2000,
          semanticType: "research_report",
        },
      ),
    ).toBe(true);
  });
});
