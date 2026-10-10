-- M34 explicit multi-Worker routing policy (default: any assigned eligible Worker)
CREATE TYPE "WorkerRoutingPolicy" AS ENUM ('ANY_ASSIGNED_ELIGIBLE');
ALTER TABLE "Capability" ADD COLUMN "workerRoutingPolicy" "WorkerRoutingPolicy" NOT NULL DEFAULT 'ANY_ASSIGNED_ELIGIBLE';
