-- M33 seller operations, economics & reliability
ALTER TABLE "SellerProfile" ADD COLUMN "maxConcurrentJobs" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "SellerProfile" ADD COLUMN "maintenanceMode" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SellerProfile" ADD COLUMN "maintenanceMessage" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN "maintenanceExpectedReturnAt" TIMESTAMP(3);
ALTER TABLE "SellerProfile" ADD COLUMN "sellerNotifyJobCompleted" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SellerProfile" ADD COLUMN "sellerNotifyHealthAlert" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SellerProfile" ADD COLUMN "sellerNotifyPayout" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SellerProfile" ADD COLUMN "firstSaleExplainedAt" TIMESTAMP(3);
ALTER TABLE "Capability" ADD COLUMN "maxConcurrentJobs" INTEGER;
ALTER TABLE "Job" ADD COLUMN "estimatedProviderCostCents" INTEGER;
