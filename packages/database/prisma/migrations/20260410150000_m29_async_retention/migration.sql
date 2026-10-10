-- M29 durable async buyer delivery — retention + terminal notification queue

ALTER TABLE "Job" ADD COLUMN "resultRetentionExpiresAt" TIMESTAMP(3);

ALTER TABLE "StoredAsset" ADD COLUMN "retentionExpiresAt" TIMESTAMP(3);

CREATE TABLE "JobTerminalNotification" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobTerminalNotification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobTerminalNotification_jobId_key" ON "JobTerminalNotification"("jobId");
CREATE INDEX "JobTerminalNotification_status_idx" ON "JobTerminalNotification"("status");

ALTER TABLE "JobTerminalNotification" ADD CONSTRAINT "JobTerminalNotification_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
