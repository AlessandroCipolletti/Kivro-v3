import type { PrismaClient } from "@kivro/database";
import { getBuyerNotificationPreferences } from "./notification-preferences.js";

const REMINDER_LEAD_MS = 7 * 86_400_000;

/** BUYERUX-032 — reminder before result asset expiry (audit trail; no permanent asset URLs). */
export async function processDueResultRetentionReminders(
  prisma: PrismaClient,
  limit = 20,
): Promise<{ scanned: number; sent: number; skipped: number }> {
  const now = new Date();
  const horizon = new Date(now.getTime() + REMINDER_LEAD_MS);
  const jobs = await prisma.job.findMany({
    where: {
      status: "COMPLETED",
      resultRetentionExpiresAt: { gte: now, lte: horizon },
      resultRetentionReminderSentAt: null,
    },
    take: limit,
    select: { id: true, buyerId: true, resultRetentionExpiresAt: true },
  });
  let sent = 0;
  let skipped = 0;
  for (const job of jobs) {
    const prefs = await getBuyerNotificationPreferences(prisma, job.buyerId);
    if (!prefs.emailResultRetentionReminder) {
      skipped += 1;
      await prisma.job.update({
        where: { id: job.id },
        data: { resultRetentionReminderSentAt: now },
      });
      continue;
    }
    await prisma.auditEvent.create({
      data: {
        jobId: job.id,
        type: "BUYER_RESULT_RETENTION_REMINDER",
        actor: "SYSTEM",
        sanitizedPayload: {
          resultRetentionExpiresAt: job.resultRetentionExpiresAt?.toISOString() ?? null,
          channel: "EMAIL",
          note: "Reminder queued; email links to authorized job page only.",
        },
      },
    });
    await prisma.job.update({
      where: { id: job.id },
      data: { resultRetentionReminderSentAt: now },
    });
    sent += 1;
  }
  return { scanned: jobs.length, sent, skipped };
}
