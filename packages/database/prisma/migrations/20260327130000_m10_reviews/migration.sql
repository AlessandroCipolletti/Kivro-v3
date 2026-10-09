ALTER TABLE "Capability" ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "CapabilityReview" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "capabilityId" TEXT NOT NULL,
  "capabilityVersionId" TEXT NOT NULL,
  "sellerProfileId" TEXT NOT NULL,
  "stars" INTEGER NOT NULL,
  "body" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CapabilityReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CapabilityReview_jobId_key" ON "CapabilityReview"("jobId");
CREATE INDEX IF NOT EXISTS "CapabilityReview_capabilityId_idx" ON "CapabilityReview"("capabilityId");
CREATE INDEX IF NOT EXISTS "CapabilityReview_sellerProfileId_idx" ON "CapabilityReview"("sellerProfileId");

ALTER TABLE "CapabilityReview"
  ADD CONSTRAINT "CapabilityReview_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CapabilityReview"
  ADD CONSTRAINT "CapabilityReview_buyerId_fkey"
  FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CapabilityReview"
  ADD CONSTRAINT "CapabilityReview_capabilityId_fkey"
  FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
