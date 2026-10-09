-- M13: buyer API keys, idempotency, webhooks

CREATE TABLE "BuyerApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "scopes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "BuyerApiKey_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BuyerApiKey_prefix_key" ON "BuyerApiKey"("prefix");
CREATE INDEX "BuyerApiKey_userId_idx" ON "BuyerApiKey"("userId");

ALTER TABLE "BuyerApiKey" ADD CONSTRAINT "BuyerApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ApiIdempotencyRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apiKeyId" TEXT,
    "endpoint" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "responseJson" JSONB NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiIdempotencyRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ApiIdempotencyRecord_userId_endpoint_idempotencyKey_key" ON "ApiIdempotencyRecord"("userId", "endpoint", "idempotencyKey");
CREATE INDEX "ApiIdempotencyRecord_expiresAt_idx" ON "ApiIdempotencyRecord"("expiresAt");

ALTER TABLE "ApiIdempotencyRecord" ADD CONSTRAINT "ApiIdempotencyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "BuyerWebhookEndpoint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secretEncrypted" TEXT NOT NULL,
    "events" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSuccessAt" TIMESTAMP(3),
    "lastFailureAt" TIMESTAMP(3),
    "failureCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BuyerWebhookEndpoint_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BuyerWebhookEndpoint_userId_idx" ON "BuyerWebhookEndpoint"("userId");

ALTER TABLE "BuyerWebhookEndpoint" ADD CONSTRAINT "BuyerWebhookEndpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "WebhookDeliveryAttempt" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "statusCode" INTEGER,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDeliveryAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WebhookDeliveryAttempt_endpointId_eventId_key" ON "WebhookDeliveryAttempt"("endpointId", "eventId");
CREATE INDEX "WebhookDeliveryAttempt_endpointId_createdAt_idx" ON "WebhookDeliveryAttempt"("endpointId", "createdAt" DESC);

ALTER TABLE "WebhookDeliveryAttempt" ADD CONSTRAINT "WebhookDeliveryAttempt_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "BuyerWebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "buyerApiKeyId" TEXT;

ALTER TABLE "Job" ADD CONSTRAINT "Job_buyerApiKeyId_fkey" FOREIGN KEY ("buyerApiKeyId") REFERENCES "BuyerApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
