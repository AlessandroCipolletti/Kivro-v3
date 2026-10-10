import { type PublicPermissionManifest, parsePublicPermissionManifest } from "@kivro/contracts";

export type BuyerPrivacyDisclosure = {
  executionModel: string;
  dataHandling: string;
  retention: string;
  paymentAndProfile: string;
  networkPermissions: string[];
  llmDisclosure: string;
  thirdPartyServices: string[];
};

function categoryDetail(manifest: PublicPermissionManifest, key: string): string | undefined {
  return manifest.categories.find((c) => c.key === key)?.buyerDetail;
}

function categoryUsed(manifest: PublicPermissionManifest, key: string): boolean {
  const row = manifest.categories.find((c) => c.key === key);
  return row != null && row.state !== "NOT_USED";
}

/** BUYERUX-035..036 — manifest-derived disclosure before purchase. */
export function buildPrivacyDisclosureFromManifest(input: {
  permissionManifest: unknown;
  externalProcessors?: string[];
  internetSummary?: string[];
}): BuyerPrivacyDisclosure {
  let manifest: PublicPermissionManifest | null = null;
  try {
    manifest = parsePublicPermissionManifest(input.permissionManifest);
  } catch {
    manifest = null;
  }
  const network: string[] = [];
  if (manifest) {
    for (const cat of manifest.categories) {
      if (cat.state !== "NOT_USED") {
        network.push(cat.buyerDetail ?? cat.buyerLabel);
      }
    }
  }
  const processors =
    input.externalProcessors && input.externalProcessors.length > 0
      ? input.externalProcessors
      : ["Seller has not declared external processors for this version."];

  return {
    executionModel:
      "Jobs run on seller-controlled worker hardware inside Kivro's isolated marketplace sandbox.",
    dataHandling:
      input.internetSummary?.join(" ") ??
      (manifest ? categoryDetail(manifest, "PUBLIC_INTERNET") : undefined) ??
      "Only inputs you submit and files you attach are sent to the seller worker for this job.",
    retention:
      "Kivro stores inputs and deliverables for authorized re-download until the published retention window expires.",
    paymentAndProfile:
      "Payment credentials, email address, and unrelated account profile fields are not sent to the seller worker.",
    networkPermissions:
      network.length > 0 ? network.slice(0, 12) : ["Network permissions follow the published permission manifest."],
    llmDisclosure: manifest
      ? categoryUsed(manifest, "AI_INFERENCE")
        ? "LLM inference is declared for this version; job content may reach configured model providers."
        : "LLM inference is not declared for this published version."
      : "Permission manifest unavailable; treat network and inference use as unknown until published.",
    thirdPartyServices: processors,
  };
}
