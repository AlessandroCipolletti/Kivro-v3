import { describe, expect, it, vi } from "vitest";
import {
  enqueueJobTerminalEmailNotification,
  processPendingJobTerminalEmailNotifications,
} from "./terminal-notifications.js";

describe("terminal email notifications (ASYNC-019/020/021)", () => {
  it("enqueues durable EMAIL row idempotently", async () => {
    const prisma = {
      jobTerminalNotification: {
        upsert: vi.fn(async () => ({})),
      },
    };
    await enqueueJobTerminalEmailNotification(prisma as never, "j1");
    expect(prisma.jobTerminalNotification.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { jobId: "j1" },
        create: expect.objectContaining({ channel: "EMAIL", status: "PENDING" }),
      }),
    );
  });

  it("processes pending notifications without throwing", async () => {
    const prisma = {
      jobTerminalNotification: {
        findMany: vi.fn(async () => [
          { id: "n1", jobId: "j1", channel: "EMAIL", status: "PENDING", attempts: 0 },
        ]),
        update: vi.fn(async () => ({})),
      },
    };
    const result = await processPendingJobTerminalEmailNotifications(prisma as never);
    expect(result.processed).toBe(1);
    expect(result.sent).toBe(1);
  });
});
