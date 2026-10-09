CREATE TABLE IF NOT EXISTS "JobCheckpoint" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "attemptNumber" INTEGER NOT NULL,
  "stageLabel" TEXT NOT NULL,
  "checkpointKey" TEXT NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JobCheckpoint_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "JobCheckpoint_jobId_idx" ON "JobCheckpoint"("jobId");
CREATE UNIQUE INDEX IF NOT EXISTS "JobCheckpoint_jobId_checkpointKey_attemptNumber_key"
  ON "JobCheckpoint"("jobId", "checkpointKey", "attemptNumber");

ALTER TABLE "JobCheckpoint"
  ADD CONSTRAINT "JobCheckpoint_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
