import type { CapabilityContract } from "@kivro/contracts";
import { buildBuyerFormSchema } from "@kivro/job-io";

/** SELLERUX-007 — preview draft buyer contract without purchasable listing. */
export function buildDraftBuyerPreviewView(input: {
  capabilityName: string;
  capabilitySlug: string;
  contract: CapabilityContract;
  priceCents: number;
  currency: string;
}): {
  previewMode: "draft_non_purchasable";
  listing: { name: string; slug: string; priceCents: number; currency: string };
  buyerForm: ReturnType<typeof buildBuyerFormSchema>;
  notice: string;
} {
  return {
    previewMode: "draft_non_purchasable",
    listing: {
      name: input.capabilityName,
      slug: input.capabilitySlug,
      priceCents: input.priceCents,
      currency: input.currency,
    },
    buyerForm: buildBuyerFormSchema(input.contract),
    notice: "Preview only — buyers cannot purchase until you publish.",
  };
}
