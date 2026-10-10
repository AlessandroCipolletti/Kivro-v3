/** §231 — passing schema and file checks does not mean the work is good. */
export function technicalValidationProvesQuality(): false {
  return false;
}

export const OUTPUT_QUALITY_NOTE =
  "A valid file or schema does not prove the work is good.";

/** Quality evidence is review, rating, seller tests, and refunds. */
export const OUTPUT_QUALITY_EVIDENCE = ["seller_tests", "buyer_review", "rating", "refund"] as const;

export function qualityEvidenceIncludesTechnicalValidity(): false {
  return false;
}
