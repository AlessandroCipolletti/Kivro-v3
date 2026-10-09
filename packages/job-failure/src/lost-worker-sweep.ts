import type { PrismaClient } from "@kivro/database";
import { assertJobTransition } from "@kivro/domain";

const EXECUTING_STATUSES = [
  "ACCEPTED",
  "STARTING",
  "RUNNING",
  "UPLOADING_RESULT",
  "PAUSE_REQUESTED",
  "PAUSED",
  "RESUME_REQUESTED",
  "SECURITY_PAUSED",
] as const;

export function workerLostGraceMs(): number {
  const raw = process.env.KIVRO_WORKER_LOST_GRACE_MS;
  const n = raw ? Number.parseInt(raw, 10) : 120_000;
  return Number.isFinite(n) && n >= 30_000 ? n : 120_000;
}

/**
 * §36 — worker disappears mid-job: fail execution (no resume), release payment per billing hooks.
 */
export async function sweepJobsWithLostWorkers(
  prisma: PrismaClient,
  limit = 25,
): Promise<{ failed: number; jobIds: string[] }> {
  const cutoff = new Date(Date.now() - workerLostGraceMs());
  const jobs = await prisma.job.findMany({
    where: {
      status: { in: [...EXECUTING_STATUSES] },
      workerDeviceId: { not: null },
    },
    include: {
      workerDevice: { select: { lastSeenAt: true, status: true } },
    },
    take: limit,
  });
  const jobIds: string[] = [];
  for (const job of jobs) {
    const device = job.workerDevice;
    const stale =
      !device ||
      device.status === "OFFLINE" ||
      device.status === "REVOKED" ||
      (device.lastSeenAt != null && device.lastSeenAt < cutoff);
    if (!stale) {
      continue;
    }
    const from = job.status;
    if (from === "RUNNING" || from === "UPLOADING_RESULT" || from === "PAUSED") {
      assertJobTransition(from, "FAILED_EXECUTION");
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "FAILED_EXECUTION",
          failureCode: "WORKER_HEARTBEAT_LOST",
          workerDeviceId: null,
        },
      });
      await prisma.jobStateTransition.create({
        data: {
          jobId: job.id,
          fromStatus: from,
          toStatus: "FAILED_EXECUTION",
          actor: "SYSTEM",
          reason: "WORKER_HEARTBEAT_LOST",
        },
      });
      jobIds.push(job.id);
      continue;
    }
    if (from === "ACCEPTED" || from === "STARTING") {
      assertJobTransition(from, "FAILED_STARTUP");
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "FAILED_STARTUP",
          failureCode: "WORKER_HEARTBEAT_LOST",
          workerDeviceId: null,
        },
      });
      await prisma.jobStateTransition.create({
        data: {
          jobId: job.id,
          fromStatus: from,
          toStatus: "FAILED_STARTUP",
          actor: "SYSTEM",
          reason: "WORKER_HEARTBEAT_LOST",
        },
      });
      jobIds.push(job.id);
      continue;
    }
    if (from === "PAUSE_REQUESTED" || from === "RESUME_REQUESTED") {
      assertJobTransition(from, "FAILED_EXECUTION");
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "FAILED_EXECUTION",
          failureCode: "WORKER_HEARTBEAT_LOST",
          workerDeviceId: null,
        },
      });
      await prisma.jobStateTransition.create({
        data: {
          jobId: job.id,
          fromStatus: from,
          toStatus: "FAILED_EXECUTION",
          actor: "SYSTEM",
          reason: "WORKER_HEARTBEAT_LOST",
        },
      });
      jobIds.push(job.id);
      continue;
    }
    if (from === "SECURITY_PAUSED") {
      assertJobTransition(from, "FAILED_POLICY");
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "FAILED_POLICY",
          failureCode: "WORKER_HEARTBEAT_LOST",
          workerDeviceId: null,
        },
      });
      await prisma.jobStateTransition.create({
        data: {
          jobId: job.id,
          fromStatus: from,
          toStatus: "FAILED_POLICY",
          actor: "SYSTEM",
          reason: "WORKER_HEARTBEAT_LOST",
        },
      });
      jobIds.push(job.id);
    }
  }
  return { failed: jobIds.length, jobIds };
}
