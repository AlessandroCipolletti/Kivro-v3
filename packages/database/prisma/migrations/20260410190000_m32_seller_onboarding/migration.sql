-- M32 seller onboarding & identity separation
ALTER TABLE "SellerProfile" ADD COLUMN "legalNameForKyc" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN "firstPublishedAt" TIMESTAMP(3);
ALTER TABLE "SellerProfile" ADD COLUMN "sellerOnboarding" JSONB;
