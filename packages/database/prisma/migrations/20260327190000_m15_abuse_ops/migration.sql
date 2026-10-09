-- M15: abuse reports, denylist patterns, buyer submission rate buckets, external processors on versions

CREATE TABLE "AbuseDenylistPattern" (
    "id" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERIC',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbuseDenylistPattern_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AbuseDenylistPattern_pattern_key" ON "AbuseDenylistPattern"("pattern");

CREATE TABLE "AbuseReport" (
    "id" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "capabilityId" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbuseReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AbuseReport_status_createdAt_idx" ON "AbuseReport"("status", "createdAt" DESC);
CREATE INDEX "AbuseReport_reporterUserId_idx" ON "AbuseReport"("reporterUserId");

CREATE TABLE "BuyerSubmissionRateBucket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "jobCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BuyerSubmissionRateBucket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BuyerSubmissionRateBucket_userId_windowStart_key" ON "BuyerSubmissionRateBucket"("userId", "windowStart");
CREATE INDEX "BuyerSubmissionRateBucket_windowStart_idx" ON "BuyerSubmissionRateBucket"("windowStart");

ALTER TABLE "CapabilityVersion" ADD COLUMN "externalProcessorsSnapshot" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "AbuseReport" ADD CONSTRAINT "AbuseReport_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
