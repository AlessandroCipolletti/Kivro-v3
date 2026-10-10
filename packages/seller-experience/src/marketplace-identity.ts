import type { SellerProfile } from "@kivro/database";

export type PublicSellerIdentity = {
  sellerProfileId: string;
  marketplaceDisplayName: string;
  verificationStatus: string;
};

export type PrivateSellerIdentity = {
  sellerProfileId: string;
  marketplaceDisplayName: string;
  legalNameForKyc: string | null;
  payoutStatus: string;
  connectOnboardingStatus: string | null;
};

/** SELLERUX-034..035 — public brand vs private KYC separation. */
export function buildPublicSellerIdentity(profile: SellerProfile): PublicSellerIdentity {
  return {
    sellerProfileId: profile.id,
    marketplaceDisplayName: profile.displayName,
    verificationStatus: profile.verificationStatus,
  };
}

export function buildPrivateSellerIdentity(profile: SellerProfile): PrivateSellerIdentity {
  return {
    sellerProfileId: profile.id,
    marketplaceDisplayName: profile.displayName,
    legalNameForKyc: profile.legalNameForKyc ?? null,
    payoutStatus: profile.payoutStatus,
    connectOnboardingStatus: profile.connectOnboardingStatus,
  };
}

export type PublicSellerPage = {
  displayName: string;
  memberSince: string | null;
  aggregateRating: number | null;
  completedJobs: number;
  publishedCapabilityCount: number;
  verificationStatus: string;
};

/** §153 — public page uses marketplace activity and omits the seller's machine. */
export function publicSellerPage(input: {
  displayName: string;
  memberSince: Date | null;
  aggregateRating: number | null;
  completedJobs: number;
  publishedCapabilityCount: number;
  verificationStatus: string;
}): PublicSellerPage {
  const rating =
    input.aggregateRating == null || !Number.isFinite(input.aggregateRating)
      ? null
      : Math.round(Math.min(5, Math.max(0, input.aggregateRating)) * 10) / 10;
  return {
    displayName: input.displayName,
    memberSince: input.memberSince?.toISOString() ?? null,
    aggregateRating: rating,
    completedJobs: Math.max(0, Math.floor(input.completedJobs)),
    publishedCapabilityCount: Math.max(0, Math.floor(input.publishedCapabilityCount)),
    verificationStatus: input.verificationStatus,
  };
}

export function aggregateCapabilityRating(
  capabilities: Array<{ rating: number | null; reviewCount: number }>,
): number | null {
  let weight = 0;
  let sum = 0;
  for (const capability of capabilities) {
    if (capability.rating == null || capability.reviewCount <= 0) {
      continue;
    }
    weight += capability.reviewCount;
    sum += capability.rating * capability.reviewCount;
  }
  if (weight === 0) {
    return null;
  }
  return Math.round((sum / weight) * 10) / 10;
}

export function assertPublicSellerPayloadSafe(payload: Record<string, unknown>): void {
  const forbidden = [
    "legalNameForKyc",
    "stripeConnectedAccountId",
    "privateLegalName",
    "localIp",
    "openClawPath",
    "providerApiKey",
  ];
  for (const key of forbidden) {
    if (key in payload) {
      throw new Error(`PUBLIC_SELLER_LEAK:${key}`);
    }
  }
  const serialized = JSON.stringify(payload).toLowerCase();
  if (serialized.includes("192.168.") || serialized.includes("/users/")) {
    throw new Error("PUBLIC_SELLER_LEAK:machine");
  }
}
