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

export function assertPublicSellerPayloadSafe(payload: Record<string, unknown>): void {
  const forbidden = ["legalNameForKyc", "stripeConnectedAccountId", "privateLegalName"];
  for (const key of forbidden) {
    if (key in payload) {
      throw new Error(`PUBLIC_SELLER_LEAK:${key}`);
    }
  }
}
