import type { PrismaClient } from "@kivro/database";
import {
  buildPurchaseSnapshotView,
  buildSanitizedInputSnapshotView,
  buildSemanticResultView,
  describeMissedWindow,
  describeResultRetentionUx,
  estimateBuyerJobTiming,
  resolveBuyerLegalActions,
  sanitizeBuyerProgressCheckpoints,
} from "@kivro/buyer-experience";
import { buyerVisibleJobStatus } from "@kivro/job-control";
import { resolveBuyerSchedulingPhase } from "@kivro/job-scheduling";
import { buildBuyerJobTimeline } from "./buyer-audit-timeline.js";
import { buildJobAuditSummary } from "./job-audit-summary.js";
import { parseJobOutputAssetManifest } from "./output-assets.js";

function isResultRetentionExpired(expiresAt: Date | null | undefined): boolean {
  return Boolean(expiresAt && expiresAt.getTime() <= Date.now());
}

/** §127 / §29 — buyer job detail with sanitized timeline (no secrets). */
export async function getBuyerJobDetail(
  prisma: PrismaClient,
  input: { jobId: string; buyerId: string },
): Promise<
  | {
      job: Record<string, unknown>;
      timeline: Array<{ at: string; label: string; detail?: string }>;
      auditSummary: ReturnType<typeof buildJobAuditSummary>;
    }
  | { error: string }
> {
  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
    include: {
      capabilityVersion: { include: { capability: { include: { sellerProfile: true } } } },
      input: true,
      result: true,
      transitions: { orderBy: { createdAt: "asc" } },
      review: true,
      resultAcknowledgement: true,
      auditEvents: { orderBy: { createdAt: "asc" } },
      checkpoints: { orderBy: { recordedAt: "asc" } },
    },
  });
  if (!job || job.buyerId !== input.buyerId) {
    return { error: "NOT_FOUND" };
  }
  const cap = job.capabilityVersion.capability;
  const visible = buyerVisibleJobStatus(job.status, {
    scheduledRunAt: job.scheduledRunAt,
    scheduleWaitDeadlineAt: job.scheduleWaitDeadlineAt,
    scheduleAdjustedAt: job.scheduleAdjustedAt,
  });
  const timeline = buildBuyerJobTimeline({
    transitions: job.transitions,
    auditEvents: job.auditEvents,
  });
  const auditSummary = buildJobAuditSummary({
    jobId: job.id,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    priceSnapshotCents: job.priceSnapshotCents,
    currency: job.currency,
    sellerNetSnapshotCents: job.sellerNetSnapshotCents,
    platformFeeSnapshotCents: job.platformFeeSnapshotCents,
    timeline,
  });
  const outputAssets = job.result
    ? parseJobOutputAssetManifest(job.result.outputAssetManifest)
    : [];
  const schedulingPhase = resolveBuyerSchedulingPhase({
    status: job.status,
    scheduledRunAt: job.scheduledRunAt,
  });
  const completedSample = await prisma.job.count({
    where: { capabilityId: cap.id, status: "COMPLETED" },
  });
  const timing = estimateBuyerJobTiming({
    status: job.status,
    scheduledRunAt: job.scheduledRunAt,
    scheduleWaitDeadlineAt: job.scheduleWaitDeadlineAt,
    startedAt: job.startedAt,
    estimatedDurationMinutes: cap.estimatedDuration,
    sampleCompletedCount: completedSample,
  });
  const missedWindow = describeMissedWindow({
    status: job.status,
    failureCode: job.failureCode,
    scheduleWaitDeadlineAt: job.scheduleWaitDeadlineAt,
  });
  const legalActions = resolveBuyerLegalActions({
    status: job.status,
    failureCode: job.failureCode,
    schedulingPhase,
    resultAvailable: Boolean(job.result && !isResultRetentionExpired(job.resultRetentionExpiresAt)),
  });
  const progress = sanitizeBuyerProgressCheckpoints(job.checkpoints);
  const inputSnapshot = buildSanitizedInputSnapshotView({
    inputContractSnapshot: job.inputContractSnapshot,
    structuredInput: job.input?.structuredInput,
    assetManifest: job.input?.assetManifest,
  });
  const purchaseSnapshot = buildPurchaseSnapshotView(job);
  const retentionUx = describeResultRetentionUx({
    resultRetentionExpiresAt: job.resultRetentionExpiresAt,
  });
  const semanticResult =
    job.result && job.status === "COMPLETED"
      ? buildSemanticResultView({
          outputContract: job.outputContractSnapshot,
          structuredOutput: job.result.structuredOutput,
          assets: outputAssets,
        })
      : null;
  return {
    job: {
      id: job.id,
      status: job.status,
      buyerVisible: visible,
      schedulingPhase,
      buyerHardDeadlineAt: job.buyerHardDeadlineAt?.toISOString() ?? null,
      scheduleWaitDeadlineAt: job.scheduleWaitDeadlineAt?.toISOString() ?? null,
      timingEstimate: timing,
      missedWindow,
      legalActions,
      progress,
      capabilityId: cap.id,
      capabilitySlug: cap.slug,
      capabilityName: cap.name,
      sellerDisplayName: cap.sellerProfile.displayName,
      sellerProfileId: cap.sellerProfileId,
      versionNumber: job.versionNumber,
      priceSnapshotCents: job.priceSnapshotCents,
      currency: job.currency,
      createdAt: job.createdAt.toISOString(),
      completedAt: job.completedAt?.toISOString() ?? null,
      resultRetentionExpiresAt: job.resultRetentionExpiresAt?.toISOString() ?? null,
      resultRetentionExpired: isResultRetentionExpired(job.resultRetentionExpiresAt),
      inputSummary: inputSnapshot.summary,
      inputSnapshot,
      purchaseSnapshot,
      retentionUx,
      semanticResult,
      resultAcknowledged: Boolean(job.resultAcknowledgement),
      canAcknowledgeResult: job.status === "COMPLETED" && !job.resultAcknowledgement,
      canReportResultProblem: job.status === "COMPLETED",
      canReuse: ["COMPLETED", "CANCELLED", "REFUNDED", "FAILED_EXECUTION", "TIMED_OUT", "EXPIRED"].includes(
        job.status,
      ),
      result: job.result
        ? {
            structuredOutput: job.result.structuredOutput,
            hasAssets: outputAssets.length > 0,
            assets: outputAssets,
            retentionExpired: isResultRetentionExpired(job.resultRetentionExpiresAt),
            downloadAllowed: retentionUx.downloadAllowed && outputAssets.length > 0,
            downloadAllAllowed:
              retentionUx.downloadAllowed && outputAssets.length > 1 && job.status === "COMPLETED",
          }
        : null,
      review: job.review
        ? { stars: job.review.stars, body: job.review.body }
        : null,
      canReview: job.status === "COMPLETED" && !job.review,
    },
    timeline,
    auditSummary,
  };
}

