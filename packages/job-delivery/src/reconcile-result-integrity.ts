import type { PrismaClient } from "@kivro/database";
import { parseJobOutputAssetManifest } from "./output-asset-manifest.js";
import { isResultRetentionExpired } from "./retention.js";

export type JobResultIntegrity = {
  jobId: string;
  healthy: boolean;
  issues: string[];
  retentionExpired: boolean;
};

/** ASYNC-028/009 — detect missing/corrupt deliverable references before presenting as healthy. */
export async function reconcileJobResultIntegrity(
  prisma: PrismaClient,
  jobId: string,
): Promise<JobResultIntegrity> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { result: true },
  });
  const issues: string[] = [];
  if (!job) {
    return { jobId, healthy: false, issues: ["job not found"], retentionExpired: false };
  }
  const retentionExpired = isResultRetentionExpired(job.resultRetentionExpiresAt);
  if (job.status === "COMPLETED" && !job.result) {
    issues.push("completed job missing JobResult row");
  }
  if (job.result) {
    const refs = parseJobOutputAssetManifest(job.result.outputAssetManifest);
    for (const ref of refs) {
      const stored = await prisma.storedAsset.findUnique({ where: { id: ref.id } });
      if (!stored) {
        issues.push(`missing object for asset ${ref.id}`);
        continue;
      }
      if (stored.purpose !== "JOB_DELIVERABLE") {
        issues.push(`asset ${ref.id} invalid purpose`);
      }
      if (isResultRetentionExpired(stored.retentionExpiresAt ?? job.resultRetentionExpiresAt)) {
        issues.push(`asset ${ref.id} retention expired`);
      }
    }
  }
  return {
    jobId,
    healthy: issues.length === 0 && !retentionExpired,
    issues,
    retentionExpired,
  };
}
