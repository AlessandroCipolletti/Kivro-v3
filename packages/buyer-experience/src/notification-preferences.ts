import type { PrismaClient } from "@kivro/database";

export type BuyerNotificationPreferences = {
  emailTerminalJobComplete: boolean;
  emailScheduledReminder: boolean;
};

/** BUYERUX-013 — durable notification preferences. */
export async function getBuyerNotificationPreferences(
  prisma: PrismaClient,
  userId: string,
): Promise<BuyerNotificationPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { buyerNotifyTerminalEmail: true, buyerNotifyScheduledReminder: true },
  });
  if (!user) {
    return { emailTerminalJobComplete: true, emailScheduledReminder: true };
  }
  return {
    emailTerminalJobComplete: user.buyerNotifyTerminalEmail,
    emailScheduledReminder: user.buyerNotifyScheduledReminder,
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
      buyerNotifyTerminalEmail: prefs.emailTerminalJobComplete,
      buyerNotifyScheduledReminder: prefs.emailScheduledReminder,
    },
    select: { buyerNotifyTerminalEmail: true, buyerNotifyScheduledReminder: true },
  });
  return {
    emailTerminalJobComplete: updated.buyerNotifyTerminalEmail,
    emailScheduledReminder: updated.buyerNotifyScheduledReminder,
  };
}

/** BUYERUX-014 — gate terminal email enqueue on preferences. */
export function terminalEmailAllowed(prefs: BuyerNotificationPreferences): boolean {
  return prefs.emailTerminalJobComplete;
}
