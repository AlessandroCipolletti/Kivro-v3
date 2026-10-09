-- M13 hardening: API rate buckets, key audit, webhook retry payload

CREATE TABLE "BuyerApiRateBucket" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BuyerApiRateBucket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BuyerApiRateBucket_apiKeyId_windowStart_key" ON "BuyerApiRateBucket"("apiKeyId", "windowStart");
CREATE INDEX "BuyerApiRateBucket_windowStart_idx" ON "BuyerApiRateBucket"("windowStart");

ALTER TABLE "BuyerApiRateBucket" ADD CONSTRAINT "BuyerApiRateBucket_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "BuyerApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "BuyerApiKeyAuditEvent" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyerApiKeyAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BuyerApiKeyAuditEvent_apiKeyId_createdAt_idx" ON "BuyerApiKeyAuditEvent"("apiKeyId", "createdAt" DESC);
CREATE INDEX "BuyerApiKeyAuditEvent_userId_idx" ON "BuyerApiKeyAuditEvent"("userId");

ALTER TABLE "BuyerApiKeyAuditEvent" ADD CONSTRAINT "BuyerApiKeyAuditEvent_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "BuyerApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BuyerApiKeyAuditEvent" ADD CONSTRAINT "BuyerApiKeyAuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WebhookDeliveryAttempt" ADD COLUMN "payloadJson" JSONB;
ALTER TABLE "WebhookDeliveryAttempt" ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "WebhookDeliveryAttempt" ADD COLUMN "nextRetryAt" TIMESTAMP(3);
ALTER TABLE "WebhookDeliveryAttempt" ADD COLUMN "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "WebhookDeliveryAttempt_nextRetryAt_idx" ON "WebhookDeliveryAttempt"("nextRetryAt");
