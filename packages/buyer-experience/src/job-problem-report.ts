import type { PrismaClient } from "@kivro/database";
import { buildPurchaseSnapshotView } from "./purchase-snapshot-view.js";

export const JOB_PROBLEM_REASONS = [
  "WRONG_OUTPUT",
  "MISSING_FILES",
  "QUALITY_ISSUE",
  "UNSAFE_BEHAVIOR",
  "OTHER",
] as const;

export type JobProblemReason = (typeof JOB_PROBLEM_REASONS)[number];

/** BUYERUX-033/034 — durable problem report linked to immutable job evidence. */
export async function createJobDeliveryProblemReport(
  prisma: PrismaClient,
  input: {
    jobId: string;
    reporterUserId: string;
    reason: string;
    details?: string;
  },
): Promise<{ reportId: string } | { error: "NOT_FOUND" | "NOT_COMPLETED" | "INVALID_REASON" }> {
  if (!JOB_PROBLEM_REASONS.includes(input.reason as JobProblemReason)) {
    return { error: "INVALID_REASON" };
  }
  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
    include: { result: true, input: true },
  });
  if (!job || job.buyerId !== input.reporterUserId) {
    return { error: "NOT_FOUND" };
  }
  if (job.status !== "COMPLETED") {
    return { error: "NOT_COMPLETED" };
  }
  const existing = await prisma.jobDeliveryProblemReport.findFirst({
    where: { jobId: job.id, reporterUserId: input.reporterUserId, status: "OPEN" },
    select: { id: true },
  });
  if (existing) {
    return { reportId: existing.id };
  }
  const evidenceSnapshot = {
    jobId: job.id,
    buyerId: job.buyerId,
    capabilityId: job.capabilityId,
    capabilityVersionId: job.capabilityVersionId,
    purchase: buildPurchaseSnapshotView(job),
    inputDigest: {
      structuredInput: job.input?.structuredInput ?? null,
      assetManifest: job.input?.assetManifest ?? null,
    },
    resultDigest: {
      structuredOutput: job.result?.structuredOutput ?? null,
      outputAssetManifest: job.result?.outputAssetManifest ?? null,
    },
    completedAt: job.completedAt?.toISOString() ?? null,
    settlementNote: "Report does not alter settlement automatically.",
  };
  const report = await prisma.jobDeliveryProblemReport.create({
    data: {
      jobId: job.id,
      reporterUserId: input.reporterUserId,
      reason: input.reason,
      details: input.details?.slice(0, 2000),
      evidenceSnapshot,
    },
  });
  await prisma.auditEvent.create({
    data: {
      jobId: job.id,
      type: "BUYER_JOB_PROBLEM_REPORT",
      actor: "BUYER",
      sanitizedPayload: { reportId: report.id, reason: input.reason },
    },
  });
  return { reportId: report.id };
}

export async function acknowledgeJobResultLooksGood(
  prisma: PrismaClient,
  input: { jobId: string; buyerId: string },
): Promise<{ ok: true } | { error: "NOT_FOUND" | "NOT_COMPLETED" }> {
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });
  if (!job || job.buyerId !== input.buyerId) {
    return { error: "NOT_FOUND" };
  }
  if (job.status !== "COMPLETED") {
    return { error: "NOT_COMPLETED" };
  }
  await prisma.jobResultAcknowledgement.upsert({
    where: { jobId: job.id },
    create: { jobId: job.id, buyerId: job.buyerId, kind: "LOOKS_GOOD" },
    update: {},
  });
  await prisma.auditEvent.create({
    data: {
      jobId: job.id,
      type: "BUYER_RESULT_ACKNOWLEDGED",
      actor: "BUYER",
      sanitizedPayload: { kind: "LOOKS_GOOD" },
    },
  });
  return { ok: true };
}
