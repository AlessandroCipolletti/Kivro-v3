-- Per-job card authorization (Master Spec §24.5)

CREATE TYPE "JobPaymentFunding" AS ENUM ('PREPAID_CREDITS', 'CARD_AUTHORIZATION');

ALTER TABLE "Job" ADD COLUMN "paymentFunding" "JobPaymentFunding" NOT NULL DEFAULT 'PREPAID_CREDITS';
ALTER TABLE "Job" ADD COLUMN "stripePaymentIntentId" TEXT;

CREATE UNIQUE INDEX "Job_stripePaymentIntentId_key" ON "Job"("stripePaymentIntentId");
