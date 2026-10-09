-- M05 buyer/job asset purposes
ALTER TYPE "StoredAssetPurpose" ADD VALUE 'BUYER_JOB_INPUT';
ALTER TYPE "StoredAssetPurpose" ADD VALUE 'JOB_DELIVERABLE';

ALTER TABLE "StoredAsset" ALTER COLUMN "sellerProfileId" DROP NOT NULL;
ALTER TABLE "StoredAsset" ADD COLUMN IF NOT EXISTS "buyerId" TEXT;
CREATE INDEX IF NOT EXISTS "StoredAsset_buyerId_idx" ON "StoredAsset"("buyerId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'StoredAsset_buyerId_fkey'
  ) THEN
    ALTER TABLE "StoredAsset"
      ADD CONSTRAINT "StoredAsset_buyerId_fkey"
      FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
