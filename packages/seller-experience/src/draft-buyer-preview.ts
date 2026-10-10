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
  presentation: {
    title: string;
    priceLabel: string;
    fields: Array<{ label: string; required: boolean; hint: string | null }>;
    outputNote: string;
    ctaLabel: string;
    purchasable: false;
  };
} {
  const buyerForm = buildBuyerFormSchema(input.contract);
  const priceLabel = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: input.currency || "USD",
  }).format(input.priceCents / 100);
  return {
    previewMode: "draft_non_purchasable",
    listing: {
      name: input.capabilityName,
      slug: input.capabilitySlug,
      priceCents: input.priceCents,
      currency: input.currency,
    },
    buyerForm,
    notice: "Preview only — buyers cannot purchase until you publish.",
    presentation: {
      title: input.capabilityName,
      priceLabel,
      fields: buyerForm.fields.map((field) => ({
        label: field.label,
        required: field.required,
        hint: field.description ?? null,
      })),
      outputNote:
        "Expected output follows the published contract. A valid file does not prove the work is good.",
      ctaLabel: `Run for ${priceLabel}`,
      purchasable: false,
    },
  };
}
