import type { PrismaClient } from "@kivro/database";

export type BuyerNotificationPreferences = {
  emailTerminalJobComplete: boolean;
  emailScheduledReminder: boolean;
  emailResultRetentionReminder: boolean;
};

/** BUYERUX-013 — durable notification preferences. */
export async function getBuyerNotificationPreferences(
  prisma: PrismaClient,
  userId: string,
): Promise<BuyerNotificationPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      buyerNotifyTerminalEmail: true,
      buyerNotifyScheduledReminder: true,
      buyerNotifyRetentionReminder: true,
    },
  });
  if (!user) {
    return {
      emailTerminalJobComplete: true,
      emailScheduledReminder: true,
      emailResultRetentionReminder: true,
    };
  }
  return {
    emailTerminalJobComplete: user.buyerNotifyTerminalEmail,
    emailScheduledReminder: user.buyerNotifyScheduledReminder,
    emailResultRetentionReminder: user.buyerNotifyRetentionReminder,
  };
}

export async function updateBuyerNotificationPreferences(
  prisma: PrismaClient,
  userId: string,
  prefs: Partial<BuyerNotificationPreferences>,
): Promise<BuyerNotificationPreferences> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(prefs.emailTerminalJobComplete !== undefined && {
        buyerNotifyTerminalEmail: prefs.emailTerminalJobComplete,
      }),
      ...(prefs.emailScheduledReminder !== undefined && {
        buyerNotifyScheduledReminder: prefs.emailScheduledReminder,
      }),
      ...(prefs.emailResultRetentionReminder !== undefined && {
        buyerNotifyRetentionReminder: prefs.emailResultRetentionReminder,
      }),
    },
    select: {
      buyerNotifyTerminalEmail: true,
      buyerNotifyScheduledReminder: true,
      buyerNotifyRetentionReminder: true,
    },
  });
  return {
    emailTerminalJobComplete: updated.buyerNotifyTerminalEmail,
    emailScheduledReminder: updated.buyerNotifyScheduledReminder,
    emailResultRetentionReminder: updated.buyerNotifyRetentionReminder,
  };
}

/** BUYERUX-014 — gate terminal email enqueue on preferences. */
export function terminalEmailAllowed(prefs: BuyerNotificationPreferences): boolean {
  return prefs.emailTerminalJobComplete;
}
