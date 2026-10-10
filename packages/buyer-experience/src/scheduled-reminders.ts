import type { PrismaClient } from "@kivro/database";
import { getBuyerNotificationPreferences, type BuyerNotificationPreferences } from "./notification-preferences.js";

const REMINDER_LEAD_MS = 24 * 60 * 60 * 1000;

/** BUYERUX-013 — durable scheduled reminders (respects buyer prefs; no permanent asset URLs). */
export async function processDueScheduledJobReminders(
  prisma: PrismaClient,
  limit = 20,
): Promise<{ scanned: number; sent: number; skipped: number }> {
  const now = new Date();
  const horizon = new Date(now.getTime() + REMINDER_LEAD_MS);
  const jobs = await prisma.job.findMany({
    where: {
      status: "SCHEDULED",
      scheduledRunAt: { gte: now, lte: horizon },
      scheduledReminderSentAt: null,
    },
    take: limit,
    select: { id: true, buyerId: true, scheduledRunAt: true },
  });
  const prefsCache = new Map<string, BuyerNotificationPreferences>();
  let sent = 0;
  let skipped = 0;
  for (const job of jobs) {
    let prefs = prefsCache.get(job.buyerId);
    if (!prefs) {
      prefs = await getBuyerNotificationPreferences(prisma, job.buyerId);
      prefsCache.set(job.buyerId, prefs);
    }
    if (!prefs.emailScheduledReminder) {
      skipped += 1;
      await prisma.job.update({
        where: { id: job.id },
        data: { scheduledReminderSentAt: now },
      });
      continue;
    }
    await prisma.auditEvent.create({
      data: {
        jobId: job.id,
        type: "BUYER_SCHEDULED_REMINDER",
        actor: "SYSTEM",
        sanitizedPayload: {
          scheduledRunAt: job.scheduledRunAt?.toISOString() ?? null,
          channel: "EMAIL",
          note: "Reminder queued; email adapter sends job link only (no permanent asset URLs).",
        },
      },
    });
    await prisma.job.update({
      where: { id: job.id },
      data: { scheduledReminderSentAt: now },
    });
    sent += 1;
  }
  return { scanned: jobs.length, sent, skipped };
}
