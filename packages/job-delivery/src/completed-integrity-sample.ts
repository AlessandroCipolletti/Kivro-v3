import type { PrismaClient } from "@kivro/database";
import { reconcileJobResultIntegrity } from "./reconcile-result-integrity.js";

/** ASYNC-028 — bounded sample of COMPLETED jobs for integrity drift detection (observability). */
export async function sampleCompletedJobIntegrity(
  prisma: PrismaClient,
  limit = 10,
): Promise<{ sampled: number; unhealthy: number; jobIds: string[] }> {
  const jobs = await prisma.job.findMany({
    where: { status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    take: limit,
    select: { id: true },
  });
  const unhealthyIds: string[] = [];
  for (const job of jobs) {
    const report = await reconcileJobResultIntegrity(prisma, job.id);
    if (!report.healthy) {
      unhealthyIds.push(job.id);
    }
  }
  return { sampled: jobs.length, unhealthy: unhealthyIds.length, jobIds: unhealthyIds };
}
