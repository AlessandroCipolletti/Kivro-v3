-- M30 scheduled job reminder tracking (BUYERUX-013)
ALTER TABLE "Job" ADD COLUMN "scheduledReminderSentAt" TIMESTAMP(3);
