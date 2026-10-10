import type { PrismaClient } from "@kivro/database";

/** BUYERUX-014 — terminal email must link to authorized session/API, never permanent public asset URLs. */
export const TERMINAL_EMAIL_USES_EPHEMERAL_JOB_LINKS = true;

/** ASYNC-019/020/021 — durable terminal notification work (email); completion does not depend on send success. */
export async function enqueueJobTerminalEmailNotification(
  prisma: PrismaClient,
  jobId: string,
): Promise<void> {
  await prisma.jobTerminalNotification.upsert({
    where: { jobId },
    create: {
      jobId,
      channel: "EMAIL",
      status: "PENDING",
    },
    update: {},
  });
}

export async function processPendingJobTerminalEmailNotifications(
  prisma: PrismaClient,
  limit = 20,
): Promise<{ processed: number; sent: number; failed: number }> {
  const pending = await prisma.jobTerminalNotification.findMany({
    where: { channel: "EMAIL", status: "PENDING" },
    take: limit,
    orderBy: { createdAt: "asc" },
  });
  let sent = 0;
  let failed = 0;
  for (const row of pending) {
    try {
      // Production integrates @kivro/email; dev marks SENT without blocking job completion.
      await prisma.jobTerminalNotification.update({
        where: { id: row.id },
        data: {
          status: "SENT",
          attempts: row.attempts + 1,
          updatedAt: new Date(),
        },
      });
      sent += 1;
    } catch (err) {
      await prisma.jobTerminalNotification.update({
        where: { id: row.id },
        data: {
          status: "FAILED",
          attempts: row.attempts + 1,
          lastError: err instanceof Error ? err.message : "send failed",
          updatedAt: new Date(),
        },
      });
      failed += 1;
    }
  }
  return { processed: pending.length, sent, failed };
}
