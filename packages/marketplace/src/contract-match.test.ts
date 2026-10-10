import { describe, expect, it } from "vitest";
import {
  contractAcceptsBuyerFiles,
  descriptionCannotOverrideContract,
  isSemanticType,
  semanticTypeReplacesFileValidation,
} from "./contract-match.js";

describe("contract match", () => {
  it("does not treat a Blender description as a .blend input", () => {
    expect(
      descriptionCannotOverrideContract({
        description: "Expert Blender prompt writer",
        buyerExtensions: [".blend", ".png"],
        acceptedExtensions: [],
      }),
    ).toBe(false);
    expect(
      contractAcceptsBuyerFiles({
        buyerExtensions: [".blend", ".png"],
        acceptedExtensions: ["blend", "png"],
      }),
    ).toBe(true);
  });

  it("keeps semantic tags from replacing file validation", () => {
    expect(isSemanticType("blender_scene")).toBe(true);
    expect(isSemanticType("free_text")).toBe(false);
    expect(semanticTypeReplacesFileValidation()).toBe(false);
  });
});
