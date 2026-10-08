-- CreateEnum
CREATE TYPE "StoredAssetPurpose" AS ENUM ('CAPABILITY_PACKAGE', 'SKILL_BUNDLE', 'EXAMPLE_INPUT');

-- AlterTable
ALTER TABLE "CapabilityVersion" ADD COLUMN "workerManifest" JSONB,
ADD COLUMN "workerManifestHash" TEXT,
ADD COLUMN "inferenceDependency" JSONB;

-- CreateTable
CREATE TABLE "StoredAsset" (
    "id" TEXT NOT NULL,
    "sellerProfileId" TEXT NOT NULL,
    "purpose" "StoredAssetPurpose" NOT NULL,
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "mimeType" TEXT,
    "uploadConfirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoredAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapabilityVersionAsset" (
    "id" TEXT NOT NULL,
    "capabilityVersionId" TEXT NOT NULL,
    "storedAssetId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "CapabilityVersionAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionConsentRecord" (
    "id" TEXT NOT NULL,
    "sellerProfileId" TEXT NOT NULL,
    "workerDeviceId" TEXT,
    "capabilityVersionId" TEXT NOT NULL,
    "permissionType" TEXT NOT NULL,
    "permissionValue" TEXT NOT NULL,
    "manifestHash" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermissionConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoredAsset_bucket_objectKey_key" ON "StoredAsset"("bucket", "objectKey");

-- CreateIndex
CREATE INDEX "StoredAsset_sellerProfileId_idx" ON "StoredAsset"("sellerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "CapabilityVersionAsset_capabilityVersionId_storedAssetId_key" ON "CapabilityVersionAsset"("capabilityVersionId", "storedAssetId");

-- CreateIndex
CREATE INDEX "PermissionConsentRecord_capabilityVersionId_idx" ON "PermissionConsentRecord"("capabilityVersionId");

-- CreateIndex
CREATE INDEX "PermissionConsentRecord_sellerProfileId_idx" ON "PermissionConsentRecord"("sellerProfileId");

-- AddForeignKey
ALTER TABLE "StoredAsset" ADD CONSTRAINT "StoredAsset_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapabilityVersionAsset" ADD CONSTRAINT "CapabilityVersionAsset_capabilityVersionId_fkey" FOREIGN KEY ("capabilityVersionId") REFERENCES "CapabilityVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapabilityVersionAsset" ADD CONSTRAINT "CapabilityVersionAsset_storedAssetId_fkey" FOREIGN KEY ("storedAssetId") REFERENCES "StoredAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionConsentRecord" ADD CONSTRAINT "PermissionConsentRecord_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionConsentRecord" ADD CONSTRAINT "PermissionConsentRecord_capabilityVersionId_fkey" FOREIGN KEY ("capabilityVersionId") REFERENCES "CapabilityVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionConsentRecord" ADD CONSTRAINT "PermissionConsentRecord_workerDeviceId_fkey" FOREIGN KEY ("workerDeviceId") REFERENCES "WorkerDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
