-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "WorkerDeviceStatus" AS ENUM ('PAIRED', 'ONLINE', 'OFFLINE', 'REVOKED');

-- CreateEnum
CREATE TYPE "CapabilityStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LocalWorkerBindingStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('CREATED', 'PAYMENT_RESERVED', 'QUEUED', 'DISPATCHED', 'ACCEPTED', 'STARTING', 'RUNNING', 'UPLOADING_RESULT', 'COMPLETED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'FAILED_STARTUP', 'FAILED_POLICY', 'FAILED_EXECUTION', 'TIMED_OUT', 'WORKER_OFFLINE', 'RESULT_REJECTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('CREDIT_PURCHASE', 'JOB_RESERVE', 'JOB_RELEASE', 'JOB_CAPTURE', 'SELLER_EARNING', 'PLATFORM_FEE', 'REFUND', 'PAYOUT');

-- CreateEnum
CREATE TYPE "AuditEventActor" AS ENUM ('BUYER', 'SELLER', 'WORKER', 'SYSTEM', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "marketplaceTermsAcceptedAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "defaultPaymentMethodId" TEXT,
    "billingCountry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "payoutStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "ratingSummary" JSONB,
    "stripeConnectedAccountId" TEXT,
    "connectOnboardingStatus" TEXT,
    "transfersCapabilityStatus" TEXT,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerDevice" (
    "id" TEXT NOT NULL,
    "sellerProfileId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "workerVersion" TEXT NOT NULL,
    "openClawVersion" TEXT,
    "status" "WorkerDeviceStatus" NOT NULL DEFAULT 'PAIRED',
    "lastSeenAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capability" (
    "id" TEXT NOT NULL,
    "sellerProfileId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "CapabilityStatus" NOT NULL DEFAULT 'DRAFT',
    "currentVersionId" TEXT,
    "priceTierCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "estimatedDuration" INTEGER,
    "rating" DOUBLE PRECISION,
    "jobCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapabilityVersion" (
    "id" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "inputSchema" JSONB NOT NULL,
    "outputSchema" JSONB NOT NULL,
    "publicDescription" TEXT,
    "internalManifestHash" TEXT NOT NULL,
    "permissionManifest" JSONB NOT NULL,
    "permissionSummary" JSONB,
    "priceSnapshotCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapabilityVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalWorkerBinding" (
    "id" TEXT NOT NULL,
    "capabilityVersionId" TEXT NOT NULL,
    "workerDeviceId" TEXT NOT NULL,
    "localWorkerId" TEXT NOT NULL,
    "status" "LocalWorkerBindingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalWorkerBinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "capabilityVersionId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "permissionManifestSnapshot" JSONB NOT NULL,
    "inputContractSnapshot" JSONB NOT NULL,
    "outputContractSnapshot" JSONB NOT NULL,
    "priceSnapshotCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "JobStatus" NOT NULL DEFAULT 'CREATED',
    "reservedAmountCents" INTEGER,
    "workerDeviceId" TEXT,
    "correlationId" TEXT,
    "failureCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAttempt" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "status" "JobStatus" NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "failureCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobInput" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "structuredInput" JSONB NOT NULL,
    "assetManifest" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobResult" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "structuredOutput" JSONB,
    "outputAssetManifest" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobStateTransition" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "fromStatus" "JobStatus",
    "toStatus" "JobStatus" NOT NULL,
    "actor" "AuditEventActor" NOT NULL,
    "reason" TEXT,
    "attemptNumber" INTEGER,
    "correlationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobStateTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "workerDeviceId" TEXT,
    "type" TEXT NOT NULL,
    "actor" "AuditEventActor" NOT NULL,
    "correlationId" TEXT,
    "sanitizedPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_userId_key" ON "SellerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_stripeConnectedAccountId_key" ON "SellerProfile"("stripeConnectedAccountId");

-- CreateIndex
CREATE INDEX "WorkerDevice_sellerProfileId_idx" ON "WorkerDevice"("sellerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_currentVersionId_key" ON "Capability"("currentVersionId");

-- CreateIndex
CREATE INDEX "Capability_sellerProfileId_idx" ON "Capability"("sellerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_sellerProfileId_slug_key" ON "Capability"("sellerProfileId", "slug");

-- CreateIndex
CREATE INDEX "CapabilityVersion_capabilityId_idx" ON "CapabilityVersion"("capabilityId");

-- CreateIndex
CREATE UNIQUE INDEX "CapabilityVersion_capabilityId_versionNumber_key" ON "CapabilityVersion"("capabilityId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LocalWorkerBinding_capabilityVersionId_workerDeviceId_key" ON "LocalWorkerBinding"("capabilityVersionId", "workerDeviceId");

-- CreateIndex
CREATE INDEX "Job_buyerId_idx" ON "Job"("buyerId");

-- CreateIndex
CREATE INDEX "Job_capabilityVersionId_idx" ON "Job"("capabilityVersionId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JobAttempt_jobId_attemptNumber_key" ON "JobAttempt"("jobId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "JobInput_jobId_key" ON "JobInput"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "JobResult_jobId_key" ON "JobResult"("jobId");

-- CreateIndex
CREATE INDEX "JobStateTransition_jobId_idx" ON "JobStateTransition"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_idempotencyKey_key" ON "LedgerEntry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "LedgerEntry_userId_idx" ON "LedgerEntry"("userId");

-- CreateIndex
CREATE INDEX "LedgerEntry_jobId_idx" ON "LedgerEntry"("jobId");

-- CreateIndex
CREATE INDEX "AuditEvent_jobId_idx" ON "AuditEvent"("jobId");

-- AddForeignKey
ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerDevice" ADD CONSTRAINT "WorkerDevice_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capability" ADD CONSTRAINT "Capability_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capability" ADD CONSTRAINT "Capability_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "CapabilityVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapabilityVersion" ADD CONSTRAINT "CapabilityVersion_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalWorkerBinding" ADD CONSTRAINT "LocalWorkerBinding_capabilityVersionId_fkey" FOREIGN KEY ("capabilityVersionId") REFERENCES "CapabilityVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalWorkerBinding" ADD CONSTRAINT "LocalWorkerBinding_workerDeviceId_fkey" FOREIGN KEY ("workerDeviceId") REFERENCES "WorkerDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_capabilityVersionId_fkey" FOREIGN KEY ("capabilityVersionId") REFERENCES "CapabilityVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_workerDeviceId_fkey" FOREIGN KEY ("workerDeviceId") REFERENCES "WorkerDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAttempt" ADD CONSTRAINT "JobAttempt_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobInput" ADD CONSTRAINT "JobInput_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobResult" ADD CONSTRAINT "JobResult_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobStateTransition" ADD CONSTRAINT "JobStateTransition_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_workerDeviceId_fkey" FOREIGN KEY ("workerDeviceId") REFERENCES "WorkerDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
