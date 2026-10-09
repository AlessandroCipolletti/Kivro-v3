-- M20 Netsons profile: durable asynchronous work in PostgreSQL (HOST-NET-010)

CREATE TABLE "DurableWorkItem" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimToken" TEXT,
    "claimedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 8,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DurableWorkItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DurableWorkItem_kind_idempotencyKey_key" ON "DurableWorkItem"("kind", "idempotencyKey");
CREATE INDEX "DurableWorkItem_status_runAt_idx" ON "DurableWorkItem"("status", "runAt");
