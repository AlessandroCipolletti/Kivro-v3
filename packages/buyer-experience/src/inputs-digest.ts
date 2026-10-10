import { createHash } from "node:crypto";

/** Stable digest for quote revalidation at purchase (BUYERUX-003). */
export function digestStructuredBuyerInputs(input: {
  structuredInput: Record<string, unknown>;
  assetManifest?: Record<string, unknown>;
}): string {
  const payload = JSON.stringify({
    inputs: input.structuredInput,
    assets: input.assetManifest ?? {},
  });
  return createHash("sha256").update(payload).digest("hex");
}
