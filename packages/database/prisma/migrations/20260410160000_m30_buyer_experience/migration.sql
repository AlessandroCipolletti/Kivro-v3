-- M30 buyer predictability: quotes, deadlines, notification preferences
ALTER TABLE "User" ADD COLUMN "buyerNotifyTerminalEmail" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "buyerNotifyScheduledReminder" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Job" ADD COLUMN "buyerHardDeadlineAt" TIMESTAMP(3);
ALTER TABLE "Job" ADD COLUMN "executionQuoteId" TEXT;
CREATE UNIQUE INDEX "Job_executionQuoteId_key" ON "Job"("executionQuoteId");

CREATE TABLE "BuyerExecutionQuote" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "capabilityVersionId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "priceSnapshotCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "inputsDigest" TEXT NOT NULL,
    "hardDeliveryDeadlineAt" TIMESTAMP(3),
    "scheduledRunAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyerExecutionQuote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BuyerExecutionQuote_buyerId_idx" ON "BuyerExecutionQuote"("buyerId");
CREATE INDEX "BuyerExecutionQuote_capabilityId_idx" ON "BuyerExecutionQuote"("capabilityId");
CREATE INDEX "BuyerExecutionQuote_expiresAt_idx" ON "BuyerExecutionQuote"("expiresAt");

ALTER TABLE "BuyerExecutionQuote" ADD CONSTRAINT "BuyerExecutionQuote_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_executionQuoteId_fkey" FOREIGN KEY ("executionQuoteId") REFERENCES "BuyerExecutionQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
