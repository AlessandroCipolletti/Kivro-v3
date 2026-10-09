-- M09 availability & scheduling
CREATE TYPE "CapabilityScheduleMode" AS ENUM ('ALWAYS_AVAILABLE', 'CUSTOM_SCHEDULE', 'MANUALLY_PAUSED');

ALTER TABLE "Capability"
  ADD COLUMN "scheduleMode" "CapabilityScheduleMode" NOT NULL DEFAULT 'ALWAYS_AVAILABLE',
  ADD COLUMN "scheduleTimezone" TEXT NOT NULL DEFAULT 'UTC',
  ADD COLUMN "scheduleWindows" JSONB NOT NULL DEFAULT '[]';

ALTER TYPE "JobStatus" ADD VALUE IF NOT EXISTS 'SCHEDULED';

ALTER TABLE "Job" ADD COLUMN "scheduledRunAt" TIMESTAMP(3);

CREATE INDEX "Job_status_scheduledRunAt_idx" ON "Job"("status", "scheduledRunAt");
