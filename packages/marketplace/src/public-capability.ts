/** §236 — buyers see the contract, not the seller's OpenClaw setup. */
export type PublicCapabilityVersion = {
  id: string;
  versionNumber: number;
  priceSnapshotCents: number;
  currency: string;
  inputSchema: unknown;
  outputSchema: unknown;
};

export type PublicCapability = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: string;
  visibility: string | null;
  category: string | null;
  priceTierCents: number | null;
  currency: string;
  rating: number | null;
  reviewCount: number;
  estimatedDuration: number | null;
  currentVersion: PublicCapabilityVersion | null;
};

export function publicCapabilityForBuyer(row: {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: string;
  visibility?: string | null;
  marketplaceCategory?: string | null;
  priceTierCents: number | null;
  currency: string;
  rating: number | null;
  reviewCount?: number | null;
  estimatedDuration: number | null;
  currentVersion?: {
    id: string;
    versionNumber: number;
    priceSnapshotCents: number;
    currency: string;
    inputSchema: unknown;
    outputSchema: unknown;
    workerManifest?: unknown;
  } | null;
  sellerProfile?: { userId?: string | null };
}): PublicCapability {
  const version = row.currentVersion;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    status: row.status,
    visibility: row.visibility ?? null,
    category: row.marketplaceCategory ?? null,
    priceTierCents: row.priceTierCents,
    currency: row.currency,
    rating: row.rating,
    reviewCount: row.reviewCount ?? 0,
    estimatedDuration: row.estimatedDuration,
    currentVersion: version
      ? {
          id: version.id,
          versionNumber: version.versionNumber,
          priceSnapshotCents: version.priceSnapshotCents,
          currency: version.currency,
          inputSchema: version.inputSchema,
          outputSchema: version.outputSchema,
        }
      : null,
  };
}
