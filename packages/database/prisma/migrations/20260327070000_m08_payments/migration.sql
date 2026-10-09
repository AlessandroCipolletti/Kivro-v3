-- M08 financial snapshots and Stripe webhook idempotency

ALTER TABLE "Job" ADD COLUMN "priceTierId" TEXT;
ALTER TABLE "Job" ADD COLUMN "platformFeeSnapshotCents" INTEGER;
ALTER TABLE "Job" ADD COLUMN "sellerNetSnapshotCents" INTEGER;

ALTER TABLE "Capability" ADD COLUMN "priceTierId" TEXT;
ALTER TABLE "CapabilityVersion" ADD COLUMN "priceTierId" TEXT;
ALTER TABLE "CapabilityVersion" ADD COLUMN "platformFeeSnapshotCents" INTEGER;
ALTER TABLE "CapabilityVersion" ADD COLUMN "sellerNetSnapshotCents" INTEGER;

CREATE TABLE "StripeWebhookEvent" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StripeWebhookEvent_stripeEventId_key" ON "StripeWebhookEvent"("stripeEventId");

CREATE TABLE "SellerTransferRecord" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "sellerProfileId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripeTransferId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerTransferRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SellerTransferRecord_jobId_key" ON "SellerTransferRecord"("jobId");
CREATE UNIQUE INDEX "SellerTransferRecord_idempotencyKey_key" ON "SellerTransferRecord"("idempotencyKey");

ALTER TABLE "SellerTransferRecord" ADD CONSTRAINT "SellerTransferRecord_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SellerTransferRecord" ADD CONSTRAINT "SellerTransferRecord_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
