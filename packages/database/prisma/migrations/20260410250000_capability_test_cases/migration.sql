-- Seller-authored capability test cases (§230). Expand-only.
CREATE TABLE "CapabilityTestCase" (
    "id" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inputValues" JSONB NOT NULL,
    "expectedOutput" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapabilityTestCase_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CapabilityTestCase_capabilityId_idx" ON "CapabilityTestCase"("capabilityId");

ALTER TABLE "CapabilityTestCase" ADD CONSTRAINT "CapabilityTestCase_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
