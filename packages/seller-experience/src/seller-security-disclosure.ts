import type { PublicPermissionManifest, WorkerManifest } from "@kivro/contracts";

/** SELLERUX-033 — accurate seller-facing security disclosure for buyers. */
export function buildSellerSecurityDisclosure(input: {
  permissionManifest: PublicPermissionManifest;
  workerManifest?: WorkerManifest | null;
  selectedSkills: string[];
  selectedTools: string[];
  readOnlyCredentials?: string[];
}): {
  isolation: string;
  buyerDataHandling: string;
  localResourcesDisclosed: string[];
  notAccessibleToBuyers: string[];
  can: string[];
  cannot: string[];
} {
  const localResourcesDisclosed = [
    ...input.selectedSkills.map((s) => `Skill: ${s}`),
    ...input.selectedTools.map((t) => `Tool: ${t}`),
  ];
  const activeCategories = input.permissionManifest.categories
    .filter((c) => c.state !== "NOT_USED")
    .map((c) => c.buyerLabel);

  return {
    isolation:
      "Jobs run in an isolated Docker sandbox on your Worker. Buyer inputs and declared outputs pass through Kivro — not your personal OpenClaw workspace.",
    buyerDataHandling:
      "Buyers receive only declared deliverables. Your personal files, credentials, and unselected discovery candidates are never exposed.",
    localResourcesDisclosed: [...localResourcesDisclosed, ...activeCategories.map((l) => `Permission: ${l}`)],
    notAccessibleToBuyers: [
      "Personal OpenClaw workspace",
      "Home documents",
      "Unselected discovery candidates",
      "Local credential secret values",
      "Seller legal/KYC identity (private)",
    ],
    can: [
      ...input.selectedSkills.map((skill) => `use skill "${skill}"`),
      ...(input.readOnlyCredentials ?? []).map((name) => `query ${name} through a read-only credential`),
    ],
    cannot: [
      "access your personal OpenClaw workspace",
      "access ~/Documents",
    ],
  };
}
