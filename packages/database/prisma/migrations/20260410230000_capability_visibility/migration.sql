-- Capability visibility is separate from runtime status (Master Spec §§312–318).
-- Default PUBLIC keeps already-published rows listed. Drafts are set back to DRAFT.
CREATE TYPE "CapabilityVisibility" AS ENUM ('DRAFT', 'PRIVATE', 'UNLISTED', 'PUBLIC');
CREATE TYPE "CapabilityExampleSource" AS ENUM ('REAL_EXECUTION', 'SELLER_CURATED');

ALTER TABLE "Capability" ADD COLUMN "visibility" "CapabilityVisibility" NOT NULL DEFAULT 'PUBLIC';
UPDATE "Capability" SET "visibility" = 'DRAFT' WHERE "status" = 'DRAFT';

CREATE TABLE "CapabilityAccessGrant" (
    "id" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "granteeUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CapabilityAccessGrant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CapabilityExample" (
    "id" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "capabilityVersionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "inputValues" JSONB NOT NULL,
    "outputValues" JSONB NOT NULL,
    "source" "CapabilityExampleSource" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CapabilityExample_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CapabilityAccessGrant_capabilityId_granteeUserId_key" ON "CapabilityAccessGrant"("capabilityId", "granteeUserId");
CREATE INDEX "CapabilityAccessGrant_granteeUserId_idx" ON "CapabilityAccessGrant"("granteeUserId");
CREATE INDEX "CapabilityExample_capabilityId_idx" ON "CapabilityExample"("capabilityId");

ALTER TABLE "CapabilityAccessGrant" ADD CONSTRAINT "CapabilityAccessGrant_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CapabilityExample" ADD CONSTRAINT "CapabilityExample_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
