import { describe, expect, it } from "vitest";
import { OUTPUT_QUALITY_EVIDENCE, OUTPUT_QUALITY_NOTE, qualityEvidenceIncludesTechnicalValidity, technicalValidationProvesQuality } from "./output-quality.js";

describe("output quality", () => {
  it("keeps technical validity separate from quality", () => {
    expect(technicalValidationProvesQuality()).toBe(false);
    expect(qualityEvidenceIncludesTechnicalValidity()).toBe(false);
    expect(OUTPUT_QUALITY_NOTE).toContain("does not prove");
    expect(OUTPUT_QUALITY_EVIDENCE).toEqual(["seller_tests", "buyer_review", "rating", "refund"]);
  });
});
