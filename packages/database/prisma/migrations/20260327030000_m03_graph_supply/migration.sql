-- AlterTable
ALTER TABLE "CapabilityVersion" ADD COLUMN "dependencyGraphSnapshot" JSONB,
ADD COLUMN "supplyChainSnapshot" JSONB;
