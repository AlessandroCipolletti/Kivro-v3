import type { PrismaClient } from "@kivro/database";
import type { CapabilityScheduleConfig } from "./weekly-schedule.js";
import { computeNextAvailableAt } from "./next-available.js";
import { buyerScheduleNotice, scheduleChangeIsMaterial } from "./scheduled-timing-record.js";
import { isScheduleOpen } from "./weekly-schedule.js";

/** §467 — recalculate eligibility when seller changes schedule (no silent strand). */
export async function recheckScheduledJobsAfterScheduleChange(
  prisma: PrismaClient,
  capabilityId: string,
  schedule: CapabilityScheduleConfig,
): Promise<{ adjusted: number; scanned: number }> {
  const jobs = await prisma.job.findMany({
    where: { capabilityId, status: "SCHEDULED" },
    take: 100,
  });
  let adjusted = 0;
  for (const job of jobs) {
    if (!job.scheduledRunAt) {
      continue;
    }
    if (isScheduleOpen(schedule, job.scheduledRunAt)) {
      continue;
    }
    const next = computeNextAvailableAt(schedule, job.scheduledRunAt);
    if (!next) {
      continue;
    }
    const previous = job.scheduledRunAt;
    await prisma.job.update({
      where: { id: job.id },
      data: {
        scheduledRunAt: next,
        scheduleAdjustedAt: new Date(),
      },
    });
    await prisma.jobStateTransition.create({
      data: {
        jobId: job.id,
        fromStatus: "SCHEDULED",
        toStatus: "SCHEDULED",
        actor: "SYSTEM",
        reason: "SCHEDULE_REVISION_RECALCULATED",
      },
    });
    if (scheduleChangeIsMaterial(previous, next)) {
      const notice = buyerScheduleNotice("MATERIAL_CHANGE");
      if (notice) {
        await prisma.auditEvent.create({
          data: {
            jobId: job.id,
            type: "JOB_SCHEDULE_CHANGED",
            actor: "SYSTEM",
            sanitizedPayload: {
              message: notice.message,
              previousEligibleAt: previous.toISOString(),
              nextEligibleAt: next.toISOString(),
            },
          },
        });
      }
    }
    adjusted += 1;
  }
  return { adjusted, scanned: jobs.length };
}
