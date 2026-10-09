import type { PrismaClient } from "@kivro/database";
import { buyerVisibleJobStatus } from "@kivro/job-control";
import { resolveBuyerSchedulingPhase } from "@kivro/job-scheduling";
import { buildBuyerJobTimeline } from "./buyer-audit-timeline.js";
import { parseJobOutputAssetManifest } from "./output-assets.js";

/** §127 / §29 — buyer job detail with sanitized timeline (no secrets). */
export async function getBuyerJobDetail(
  prisma: PrismaClient,
  input: { jobId: string; buyerId: string },
): Promise<
  | {
      job: Record<string, unknown>;
      timeline: Array<{ at: string; label: string; detail?: string }>;
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
      auditEvents: { orderBy: { createdAt: "asc" } },
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
  const outputAssets = job.result
    ? parseJobOutputAssetManifest(job.result.outputAssetManifest)
    : [];
  return {
    job: {
      id: job.id,
      status: job.status,
      buyerVisible: visible,
      schedulingPhase: resolveBuyerSchedulingPhase({
        status: job.status,
        scheduledRunAt: job.scheduledRunAt,
      }),
      capabilitySlug: cap.slug,
      capabilityName: cap.name,
      sellerDisplayName: cap.sellerProfile.displayName,
      sellerProfileId: cap.sellerProfileId,
      versionNumber: job.versionNumber,
      priceSnapshotCents: job.priceSnapshotCents,
      currency: job.currency,
      createdAt: job.createdAt.toISOString(),
      completedAt: job.completedAt?.toISOString() ?? null,
      inputSummary: summarizeInput(job.input?.structuredInput),
      result: job.result
        ? {
            structuredOutput: job.result.structuredOutput,
            hasAssets: outputAssets.length > 0,
            assets: outputAssets,
          }
        : null,
      review: job.review
        ? { stars: job.review.stars, body: job.review.body }
        : null,
      canReview: job.status === "COMPLETED" && !job.review,
    },
    timeline,
  };
}

function summarizeInput(raw: unknown): string {
  if (!raw || typeof raw !== "object") {
    return "";
  }
  const entries = Object.entries(raw as Record<string, unknown>).slice(0, 6);
  return entries.map(([k, v]) => `${k}: ${String(v).slice(0, 80)}`).join("; ");
}
