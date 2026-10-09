import type { PrismaClient } from "@kivro/database";
import { assertJobTransition, type JobStatus } from "@kivro/domain";
import { assertImmediateJobSubmissionAllowed } from "./availability-service.js";
import { maxScheduledReservationsPerWindow, computeScheduleWaitDeadline } from "./wait-policy.js";
import { parseScheduleConfig } from "./capability-schedule.js";
import { validateScheduledRunAt } from "./scheduled-run-validation.js";

export async function queueJobAfterPayment(
  prisma: PrismaClient,
  jobId: string,
  input: { immediate: boolean; scheduledRunAt?: Date },
): Promise<{ status: JobStatus } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "PAYMENT_RESERVED") {
    return { error: "INVALID_STATE" };
  }
  if (!input.immediate) {
    if (!input.scheduledRunAt) {
      return { error: "INVALID_SCHEDULE_TIME" };
    }
    const capability = await prisma.capability.findUnique({ where: { id: job.capabilityId } });
    if (!capability) {
      return { error: "NOT_FOUND" };
    }
    const schedule = parseScheduleConfig(capability);
    const runValidation = validateScheduledRunAt(schedule, input.scheduledRunAt);
    if (!("ok" in runValidation)) {
      return runValidation;
    }
    const existing = await prisma.job.count({
      where: {
        capabilityId: job.capabilityId,
        status: "SCHEDULED",
        scheduledRunAt: input.scheduledRunAt,
      },
    });
    if (existing >= maxScheduledReservationsPerWindow()) {
      return { error: "SCHEDULED_WINDOW_CAPACITY_EXCEEDED" };
    }
    const waitDeadline = computeScheduleWaitDeadline(input.scheduledRunAt);
    assertJobTransition("PAYMENT_RESERVED", "SCHEDULED");
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "SCHEDULED",
        scheduledRunAt: input.scheduledRunAt,
        scheduleWaitDeadlineAt: waitDeadline,
      },
    });
    await prisma.jobStateTransition.create({
      data: {
        jobId,
        fromStatus: "PAYMENT_RESERVED",
        toStatus: "SCHEDULED",
        actor: "SYSTEM",
      },
    });
    return { status: "SCHEDULED" };
  }
  return prisma.$transaction(async (tx) => {
    const fresh = await tx.job.findUnique({ where: { id: jobId } });
    if (!fresh || fresh.status !== "PAYMENT_RESERVED") {
      return { error: "INVALID_STATE" };
    }
    const gate = await assertImmediateJobSubmissionAllowed(tx, fresh.capabilityId);
    if ("error" in gate) {
      return gate;
    }
    assertJobTransition("PAYMENT_RESERVED", "QUEUED");
    await tx.job.update({ where: { id: jobId }, data: { status: "QUEUED" } });
    await tx.jobStateTransition.create({
      data: {
        jobId,
        fromStatus: "PAYMENT_RESERVED",
        toStatus: "QUEUED",
        actor: "SYSTEM",
      },
    });
    return { status: "QUEUED" as const };
  });
}

export async function promoteDueScheduledJobs(
  prisma: PrismaClient,
  limit = 25,
): Promise<{ promoted: number; scanned: number }> {
  const now = new Date();
  const jobs = await prisma.job.findMany({
    where: {
      status: "SCHEDULED",
      scheduledRunAt: { lte: now },
    },
    orderBy: { scheduledRunAt: "asc" },
    take: limit,
  });
  let promoted = 0;
  for (const job of jobs) {
    const gate = await assertImmediateJobSubmissionAllowed(prisma, job.capabilityId);
    if ("error" in gate) {
      if (!job.scheduleWaitDeadlineAt) {
        await prisma.job.update({
          where: { id: job.id },
          data: { scheduleWaitDeadlineAt: computeScheduleWaitDeadline(now) },
        });
      }
      continue;
    }
    assertJobTransition("SCHEDULED", "QUEUED");
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "QUEUED", scheduleWaitDeadlineAt: null },
    });
    await prisma.jobStateTransition.create({
      data: {
        jobId: job.id,
        fromStatus: "SCHEDULED",
        toStatus: "QUEUED",
        actor: "SYSTEM",
        reason: "SCHEDULED_RUN_AT",
      },
    });
    promoted += 1;
  }
  return { promoted, scanned: jobs.length };
}
