-- AlterTable OrchestrationPlan
ALTER TABLE "OrchestrationPlan" ADD COLUMN "budgetReservedCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OrchestrationPlan" ADD COLUMN "approvedEstimatedCostCents" INTEGER;
ALTER TABLE "OrchestrationPlan" ADD COLUMN "synthesisSummary" TEXT;

-- AlterTable OrchestrationStep
ALTER TABLE "OrchestrationStep" ADD COLUMN "quotedPriceCents" INTEGER;
ALTER TABLE "OrchestrationStep" ADD COLUMN "outputAssetRefsJson" JSONB;
ALTER TABLE "OrchestrationStep" ADD COLUMN "completedAt" TIMESTAMP(3);

-- AlterTable Job
ALTER TABLE "Job" ADD COLUMN "orchestrationStepId" TEXT;
CREATE INDEX "Job_orchestrationStepId_idx" ON "Job"("orchestrationStepId");
