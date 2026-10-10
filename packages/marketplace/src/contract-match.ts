/** §233 — file compatibility is decided from the contract, not the description. */
export function contractAcceptsBuyerFiles(input: {
  buyerExtensions: string[];
  acceptedExtensions: string[];
}): boolean {
  const accepted = new Set(input.acceptedExtensions.map((ext) => normalizeExt(ext)));
  return input.buyerExtensions.every((ext) => accepted.has(normalizeExt(ext)));
}

export function descriptionCannotOverrideContract(input: {
  description: string;
  buyerExtensions: string[];
  acceptedExtensions: string[];
}): boolean {
  return contractAcceptsBuyerFiles({
    buyerExtensions: input.buyerExtensions,
    acceptedExtensions: input.acceptedExtensions,
  });
}

export const SEMANTIC_TYPES = [
  "company_identifier",
  "research_report",
  "product_image",
  "reference_image",
  "source_video",
  "transcript",
  "blender_scene",
  "three_d_model",
  "dataset",
  "final_report",
] as const;

export type SemanticType = (typeof SEMANTIC_TYPES)[number];

export function isSemanticType(value: string): value is SemanticType {
  return (SEMANTIC_TYPES as readonly string[]).includes(value);
}

/** Semantic tags help matching. They do not replace MIME or extension checks. */
export function semanticTypeReplacesFileValidation(): false {
  return false;
}

function normalizeExt(ext: string): string {
  return ext.trim().toLowerCase().replace(/^\./, "");
}
