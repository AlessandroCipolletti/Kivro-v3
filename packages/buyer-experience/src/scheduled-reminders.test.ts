import { describe, expect, it, vi } from "vitest";
import { processDueScheduledJobReminders } from "./scheduled-reminders.js";

describe("processDueScheduledJobReminders (BUYERUX-013)", () => {
  it("records reminder audit when prefs allow", async () => {
    const prisma = {
      job: {
        findMany: vi.fn(async () => [
          { id: "j1", buyerId: "b1", scheduledRunAt: new Date(Date.now() + 3600_000) },
        ]),
        update: vi.fn(async () => ({})),
      },
      user: {
        findUnique: vi.fn(async () => ({
          buyerNotifyTerminalEmail: true,
          buyerNotifyScheduledReminder: true,
        })),
      },
      auditEvent: { create: vi.fn(async () => ({})) },
    };
    const result = await processDueScheduledJobReminders(prisma as never, 5);
    expect(result.sent).toBe(1);
    expect(prisma.auditEvent.create).toHaveBeenCalled();
  });
});
