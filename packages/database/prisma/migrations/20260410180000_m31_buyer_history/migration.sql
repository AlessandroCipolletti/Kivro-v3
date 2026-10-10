-- M31 buyer history, reuse, acknowledgement, and problem reports

ALTER TABLE "User" ADD COLUMN "buyerNotifyRetentionReminder" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Job" ADD COLUMN "resultRetentionReminderSentAt" TIMESTAMP(3);

CREATE TABLE "JobResultAcknowledgement" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'LOOKS_GOOD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobResultAcknowledgement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobDeliveryProblemReport" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "evidenceSnapshot" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobDeliveryProblemReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobResultAcknowledgement_jobId_key" ON "JobResultAcknowledgement"("jobId");
CREATE INDEX "JobResultAcknowledgement_buyerId_idx" ON "JobResultAcknowledgement"("buyerId");
CREATE INDEX "JobDeliveryProblemReport_jobId_idx" ON "JobDeliveryProblemReport"("jobId");
CREATE INDEX "JobDeliveryProblemReport_status_createdAt_idx" ON "JobDeliveryProblemReport"("status", "createdAt" DESC);

ALTER TABLE "JobResultAcknowledgement" ADD CONSTRAINT "JobResultAcknowledgement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobResultAcknowledgement" ADD CONSTRAINT "JobResultAcknowledgement_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobDeliveryProblemReport" ADD CONSTRAINT "JobDeliveryProblemReport_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobDeliveryProblemReport" ADD CONSTRAINT "JobDeliveryProblemReport_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
