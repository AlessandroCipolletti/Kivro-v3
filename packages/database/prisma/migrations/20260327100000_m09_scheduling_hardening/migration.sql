ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "scheduleWaitDeadlineAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "CapabilityScheduleChange" (
  "id" TEXT NOT NULL,
  "capabilityId" TEXT NOT NULL,
  "sellerProfileId" TEXT NOT NULL,
  "previousSchedule" JSONB NOT NULL,
  "newSchedule" JSONB NOT NULL,
  "changedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CapabilityScheduleChange_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CapabilityScheduleChange_capabilityId_idx" ON "CapabilityScheduleChange"("capabilityId");
CREATE INDEX IF NOT EXISTS "CapabilityScheduleChange_sellerProfileId_idx" ON "CapabilityScheduleChange"("sellerProfileId");

ALTER TABLE "CapabilityScheduleChange"
  ADD CONSTRAINT "CapabilityScheduleChange_capabilityId_fkey"
  FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
