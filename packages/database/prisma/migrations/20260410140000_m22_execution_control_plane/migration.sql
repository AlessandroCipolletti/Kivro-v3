-- M22 / PORT-005 — immutable execution control-plane ownership on jobs
ALTER TABLE "Job" ADD COLUMN "executionControlPlaneId" TEXT;

CREATE INDEX "Job_executionControlPlaneId_idx" ON "Job"("executionControlPlaneId");
