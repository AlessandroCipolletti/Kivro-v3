-- CreateEnum
CREATE TYPE "MarketplaceMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "OrchestrationPlanStatus" AS ENUM ('DRAFT', 'AWAITING_APPROVAL', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrchestrationStepStatus" AS ENUM ('PLANNED', 'READY', 'PAYMENT_RESERVED', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "AgentApprovalMode" AS ENUM ('RECOMMEND_ONLY', 'APPROVE_PLAN');

-- CreateTable
CREATE TABLE "MarketplaceConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MarketplaceMessageRole" NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrchestrationPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT,
    "goal" TEXT NOT NULL,
    "constraintsJson" JSONB NOT NULL,
    "maxBudgetCents" INTEGER,
    "estimatedCostCents" INTEGER NOT NULL,
    "status" "OrchestrationPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "approvalMode" "AgentApprovalMode" NOT NULL DEFAULT 'APPROVE_PLAN',
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrchestrationPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrchestrationStep" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "capabilityVersionId" TEXT NOT NULL,
    "dependsOnStepIds" JSONB NOT NULL DEFAULT '[]',
    "inputMappingJson" JSONB,
    "estimatedPriceCents" INTEGER NOT NULL,
    "status" "OrchestrationStepStatus" NOT NULL DEFAULT 'PLANNED',
    "jobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrchestrationStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketplaceConversation_userId_idx" ON "MarketplaceConversation"("userId");

-- CreateIndex
CREATE INDEX "MarketplaceMessage_conversationId_idx" ON "MarketplaceMessage"("conversationId");

-- CreateIndex
CREATE INDEX "OrchestrationPlan_userId_idx" ON "OrchestrationPlan"("userId");

-- CreateIndex
CREATE INDEX "OrchestrationPlan_conversationId_idx" ON "OrchestrationPlan"("conversationId");

-- CreateIndex
CREATE INDEX "OrchestrationStep_planId_idx" ON "OrchestrationStep"("planId");

-- AddForeignKey
ALTER TABLE "MarketplaceConversation" ADD CONSTRAINT "MarketplaceConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceMessage" ADD CONSTRAINT "MarketplaceMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "MarketplaceConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrchestrationPlan" ADD CONSTRAINT "OrchestrationPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrchestrationPlan" ADD CONSTRAINT "OrchestrationPlan_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "MarketplaceConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrchestrationStep" ADD CONSTRAINT "OrchestrationStep_planId_fkey" FOREIGN KEY ("planId") REFERENCES "OrchestrationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
