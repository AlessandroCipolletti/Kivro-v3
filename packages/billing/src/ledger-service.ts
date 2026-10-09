import type { PrismaClient } from "@kivro/database";
import type { LedgerEntryType } from "./ledger.js";
import { buildLedgerIdempotencyKey } from "./ledger.js";

const ACTIVE_RESERVE_STATUSES = [
  "PAYMENT_RESERVED",
  "QUEUED",
  "DISPATCHED",
  "ACCEPTED",
  "STARTING",
  "RUNNING",
  "PAUSE_REQUESTED",
  "PAUSED",
  "RESUME_REQUESTED",
  "SECURITY_PAUSED",
  "UPLOADING_RESULT",
] as const;

export async function appendLedgerEntry(
  prisma: PrismaClient,
  input: {
    userId: string;
    jobId?: string;
    type: LedgerEntryType;
    amountCents: number;
    idempotencyKey: string;
    currency?: string;
  },
): Promise<{ created: boolean; entryId: string }> {
  const existing = await prisma.ledgerEntry.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existing) {
    return { created: false, entryId: existing.id };
  }
  const entry = await prisma.ledgerEntry.create({
    data: {
      userId: input.userId,
      jobId: input.jobId,
      type: input.type,
      amountCents: input.amountCents,
      currency: input.currency ?? "USD",
      idempotencyKey: input.idempotencyKey,
    },
  });
  return { created: true, entryId: entry.id };
}

/** Buyer available credits (§24.4 prepaid model). */
export async function getBuyerCreditBalanceCents(
  prisma: PrismaClient,
  buyerId: string,
): Promise<{ availableCents: number; reservedCents: number }> {
  const entries = await prisma.ledgerEntry.findMany({ where: { userId: buyerId } });
  let credits = 0;
  for (const e of entries) {
    switch (e.type) {
      case "CREDIT_PURCHASE":
      case "JOB_RELEASE":
      case "REFUND":
        credits += e.amountCents;
        break;
      case "JOB_CAPTURE":
        credits -= e.amountCents;
        break;
      default:
        break;
    }
  }
  const activeJobs = await prisma.job.findMany({
    where: {
      buyerId,
      status: { in: [...ACTIVE_RESERVE_STATUSES] },
      reservedAmountCents: { not: null },
    },
    select: { reservedAmountCents: true },
  });
  const jobReservedCents = activeJobs.reduce((sum, j) => sum + (j.reservedAmountCents ?? 0), 0);
  const orchestrationHolds = await prisma.orchestrationPlan.findMany({
    where: { userId: buyerId, status: "RUNNING", budgetReservedCents: { gt: 0 } },
    select: { budgetReservedCents: true },
  });
  const orchestrationReservedCents = orchestrationHolds.reduce(
    (sum, p) => sum + p.budgetReservedCents,
    0,
  );
  const reservedCents = jobReservedCents + orchestrationReservedCents;
  return { availableCents: credits - reservedCents, reservedCents };
}

export function jobReserveIdempotencyKey(jobId: string): string {
  return buildLedgerIdempotencyKey(["job", jobId, "reserve"]);
}

export function jobCaptureIdempotencyKey(jobId: string): string {
  return buildLedgerIdempotencyKey(["job", jobId, "capture"]);
}

export function jobReleaseIdempotencyKey(jobId: string): string {
  return buildLedgerIdempotencyKey(["job", jobId, "release"]);
}

export function creditPurchaseIdempotencyKey(externalId: string): string {
  return buildLedgerIdempotencyKey(["credit", externalId]);
}
