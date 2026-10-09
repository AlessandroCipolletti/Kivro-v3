import type { Prisma, PrismaClient } from "@kivro/database";
import { assertJobTransition, type JobStatus } from "@kivro/domain";
import { sellerEarningSettlementAllowed } from "@kivro/job-control";
import {
  appendLedgerEntry,
  getBuyerCreditBalanceCents,
  jobCaptureIdempotencyKey,
  jobReleaseIdempotencyKey,
} from "./ledger-service.js";
import { buildLedgerIdempotencyKey } from "./ledger.js";
import { requireEnabledPriceTier } from "./tier-validation.js";
import { cancelCardAuthorization, captureCardAuthorization } from "./job-card-payment.js";
import { createStripeClient } from "./stripe-provider.js";
import { executeSellerStripeTransfer } from "./stripe-seller-transfer.js";
import {
  assertImmediateSubmissionBeforePayment,
  queueJobAfterPayment,
} from "@kivro/job-scheduling";

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function releaseJobPayment(
  prisma: PrismaClient,
  jobId: string,
): Promise<{ released: boolean } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return { error: "JOB_NOT_FOUND" };
  }
  if (job.reservedAmountCents == null || job.reservedAmountCents <= 0) {
    return { released: false };
  }
  const releasable: JobStatus[] = [
    "CREATED",
    "PAYMENT_RESERVED",
    "SCHEDULED",
    "QUEUED",
    "DISPATCHED",
    "ACCEPTED",
    "STARTING",
    "RUNNING",
    "PAUSE_REQUESTED",
    "PAUSED",
    "RESUME_REQUESTED",
    "SECURITY_PAUSED",
    "WORKER_OFFLINE",
    "CANCELLED",
    "EXPIRED",
    "FAILED_STARTUP",
    "FAILED_POLICY",
    "FAILED_EXECUTION",
    "TIMED_OUT",
    "RESULT_REJECTED",
    "REJECTED",
  ];
  if (!releasable.includes(job.status)) {
    return { error: "NOT_RELEASABLE" };
  }
  const key = jobReleaseIdempotencyKey(jobId);
  const existing = await prisma.ledgerEntry.findUnique({ where: { idempotencyKey: key } });
  if (existing) {
    return { released: true };
  }
  if (job.paymentFunding === "CARD_AUTHORIZATION" && job.stripePaymentIntentId) {
    const stripe = createStripeClient();
    if (stripe) {
      await cancelCardAuthorization(stripe, job.stripePaymentIntentId);
    }
  } else {
    await appendLedgerEntry(prisma, {
    userId: job.buyerId,
    jobId,
    type: "JOB_RELEASE",
    amountCents: job.reservedAmountCents,
    idempotencyKey: key,
    });
  }
  await prisma.job.update({
    where: { id: jobId },
    data: { reservedAmountCents: null },
  });
  return { released: true };
}

export async function captureAndSettleJobPayment(
  prisma: PrismaClient,
  jobId: string,
): Promise<{ settled: boolean } | { error: string }> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      capabilityVersion: { include: { capability: { include: { sellerProfile: true } } } },
    },
  });
  if (!job) {
    return { error: "JOB_NOT_FOUND" };
  }
  if (job.status !== "COMPLETED") {
    return { error: "JOB_NOT_COMPLETED" };
  }
  if (!sellerEarningSettlementAllowed(job.status)) {
    return { error: "SETTLEMENT_BLOCKED" };
  }
  const amount = job.reservedAmountCents ?? job.priceSnapshotCents;
  const platformFee = job.platformFeeSnapshotCents ?? 0;
  const sellerNet = job.sellerNetSnapshotCents ?? amount - platformFee;
  const sellerUserId = job.capabilityVersion.capability.sellerProfile.userId;

  const captureKey = jobCaptureIdempotencyKey(jobId);
  const existingCapture = await prisma.ledgerEntry.findUnique({
    where: { idempotencyKey: buildLedgerIdempotencyKey(["job", jobId, "seller-earning"]) },
  });
  if (existingCapture) {
    return { settled: true };
  }
  if (job.paymentFunding === "CARD_AUTHORIZATION" && job.stripePaymentIntentId) {
    const stripe = createStripeClient();
    if (!stripe) {
      return { error: "STRIPE_NOT_CONFIGURED" };
    }
    await captureCardAuthorization(stripe, job.stripePaymentIntentId);
  } else {
    await appendLedgerEntry(prisma, {
      userId: job.buyerId,
      jobId,
      type: "JOB_CAPTURE",
      amountCents: amount,
      idempotencyKey: captureKey,
    });
  }

  await appendLedgerEntry(prisma, {
    userId: sellerUserId,
    jobId,
    type: "SELLER_EARNING",
    amountCents: sellerNet,
    idempotencyKey: buildLedgerIdempotencyKey(["job", jobId, "seller-earning"]),
  });

  const platformUserId = process.env.KIVRO_PLATFORM_LEDGER_USER_ID;
  if (platformUserId && platformFee > 0) {
    await appendLedgerEntry(prisma, {
      userId: platformUserId,
      jobId,
      type: "PLATFORM_FEE",
      amountCents: platformFee,
      idempotencyKey: buildLedgerIdempotencyKey(["job", jobId, "platform-fee"]),
    });
  }

  await prisma.job.update({ where: { id: jobId }, data: { reservedAmountCents: null } });

  const transferKey = buildLedgerIdempotencyKey(["job", jobId, "seller-transfer"]);
  await prisma.sellerTransferRecord.upsert({
    where: { jobId },
    create: {
      jobId,
      sellerProfileId: job.capabilityVersion.capability.sellerProfileId,
      amountCents: sellerNet,
      idempotencyKey: transferKey,
      status: "RECORDED",
    },
    update: {},
  });

  await executeSellerStripeTransfer(prisma, jobId);

  return { settled: true };
}

export async function abortJobAfterQueueFailure(
  prisma: PrismaClient,
  jobId: string,
): Promise<void> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "PAYMENT_RESERVED") {
    return;
  }
  assertJobTransition("PAYMENT_RESERVED", "CANCELLED");
  await prisma.job.update({
    where: { id: jobId },
    data: { status: "CANCELLED", failureCode: "QUEUE_COMMIT_FAILED" },
  });
  await prisma.jobStateTransition.create({
    data: {
      jobId,
      fromStatus: "PAYMENT_RESERVED",
      toStatus: "CANCELLED",
      actor: "SYSTEM",
      reason: "QUEUE_COMMIT_FAILED",
    },
  });
  await releaseJobPayment(prisma, jobId);
  try {
    assertJobTransition("CANCELLED", "REFUNDED");
    await prisma.job.update({ where: { id: jobId }, data: { status: "REFUNDED" } });
    await prisma.jobStateTransition.create({
      data: {
        jobId,
        fromStatus: "CANCELLED",
        toStatus: "REFUNDED",
        actor: "SYSTEM",
        reason: "QUEUE_COMMIT_FAILED",
      },
    });
  } catch {
    // release only
  }
}

export interface SubmitPaidJobInput {
  buyerId: string;
  capabilityId: string;
  structuredInput: Record<string, unknown>;
  assetManifest?: Record<string, unknown>;
  /** When set, job stays SCHEDULED until promotion sweep (§462). */
  scheduledRunAt?: Date;
}

/** Reserve prepaid credits and queue job for dispatch (§24.4). */
export async function submitPaidJob(
  prisma: PrismaClient,
  input: SubmitPaidJobInput,
): Promise<
  | { jobId: string; status: JobStatus }
  | { error: string; reasons?: string[]; nextAvailableAt?: string }
> {
  const immediate = !input.scheduledRunAt;
  if (immediate) {
    const pre = await assertImmediateSubmissionBeforePayment(prisma, input.capabilityId);
    if (!("ok" in pre)) {
      return pre;
    }
  }
  const capability = await prisma.capability.findUnique({
    where: { id: input.capabilityId },
    include: {
      currentVersion: true,
      sellerProfile: true,
    },
  });
  if (!capability?.currentVersion || capability.status !== "PUBLISHED") {
    return { error: "CAPABILITY_NOT_AVAILABLE" };
  }
  const version = capability.currentVersion;
  const tier = requireEnabledPriceTier({
    priceTierId: version.priceTierId ?? undefined,
    buyerPriceMinor: version.priceSnapshotCents,
  });

  const balance = await getBuyerCreditBalanceCents(prisma, input.buyerId);
  if (balance.availableCents < tier.buyerPriceMinor) {
    return { error: "INSUFFICIENT_CREDITS" };
  }

  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.job.create({
      data: {
        buyerId: input.buyerId,
        capabilityId: capability.id,
        capabilityVersionId: version.id,
        versionNumber: version.versionNumber,
        permissionManifestSnapshot: toJsonValue(version.permissionManifest),
        inputContractSnapshot: toJsonValue(version.inputSchema),
        outputContractSnapshot: toJsonValue(version.outputSchema),
        priceSnapshotCents: tier.buyerPriceMinor,
        priceTierId: tier.id,
        platformFeeSnapshotCents: tier.platformFeeMinor,
        sellerNetSnapshotCents: tier.sellerNetMinor,
        currency: tier.currency,
        status: "CREATED",
        paymentFunding: "PREPAID_CREDITS",
      },
    });
    await tx.jobInput.create({
      data: {
        jobId: created.id,
        structuredInput: toJsonValue(input.structuredInput),
        assetManifest: input.assetManifest ? toJsonValue(input.assetManifest) : undefined,
      },
    });
    await tx.jobStateTransition.create({
      data: {
        jobId: created.id,
        fromStatus: null,
        toStatus: "CREATED",
        actor: "BUYER",
      },
    });
    assertJobTransition("CREATED", "PAYMENT_RESERVED");
    await tx.job.update({
      where: { id: created.id },
      data: {
        status: "PAYMENT_RESERVED",
        reservedAmountCents: tier.buyerPriceMinor,
      },
    });
    await tx.jobStateTransition.create({
      data: {
        jobId: created.id,
        fromStatus: "CREATED",
        toStatus: "PAYMENT_RESERVED",
        actor: "SYSTEM",
      },
    });
    if (input.scheduledRunAt) {
      await tx.job.update({
        where: { id: created.id },
        data: { scheduledRunAt: input.scheduledRunAt },
      });
    }
    return created;
  });

  const queued = await queueJobAfterPayment(prisma, job.id, {
    immediate,
    scheduledRunAt: input.scheduledRunAt,
  });
  if ("error" in queued) {
    await abortJobAfterQueueFailure(prisma, job.id);
    return queued;
  }
  return { jobId: job.id, status: queued.status };
}

export async function grantBuyerCredits(
  prisma: PrismaClient,
  input: { buyerId: string; amountCents: number; externalId: string },
): Promise<{ granted: boolean; entryId: string }> {
  const { created, entryId } = await appendLedgerEntry(prisma, {
    userId: input.buyerId,
    type: "CREDIT_PURCHASE",
    amountCents: input.amountCents,
    idempotencyKey: buildLedgerIdempotencyKey(["credit", input.externalId]),
  });
  return { granted: created, entryId };
}
