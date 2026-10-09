-- M12: seller emergency pause, worker health telemetry, health event timeline

ALTER TABLE "SellerProfile" ADD COLUMN "marketplaceEmergencyPause" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SellerProfile" ADD COLUMN "marketplaceEmergencyPausedAt" TIMESTAMP(3);
ALTER TABLE "SellerProfile" ADD COLUMN "marketplaceEmergencyPauseSource" TEXT;

ALTER TABLE "WorkerDevice" ADD COLUMN "lastHealthReport" JSONB;

CREATE TABLE "WorkerHealthEvent" (
    "id" TEXT NOT NULL,
    "workerDeviceId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerHealthEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkerHealthEvent_workerDeviceId_createdAt_idx" ON "WorkerHealthEvent"("workerDeviceId", "createdAt" DESC);

ALTER TABLE "WorkerHealthEvent" ADD CONSTRAINT "WorkerHealthEvent_workerDeviceId_fkey" FOREIGN KEY ("workerDeviceId") REFERENCES "WorkerDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
