import type { PrismaClient } from "@kivro/database";
import { enforcePauseDurationTimeout } from "./job-pause-service.js";

/** Bounded cron entry — enforce max pause duration across paused jobs (§438). */
export async function sweepExpiredJobPauses(
  prisma: PrismaClient,
  limit = 50,
): Promise<{ timedOutJobIds: string[] }> {
  const paused = await prisma.job.findMany({
    where: { status: "PAUSED" },
    select: { id: true },
    take: limit,
  });
  const timedOutJobIds: string[] = [];
  for (const row of paused) {
    const result = await enforcePauseDurationTimeout(prisma, row.id);
    if ("status" in result && result.status === "TIMED_OUT") {
      timedOutJobIds.push(row.id);
    }
  }
  return { timedOutJobIds };
}
