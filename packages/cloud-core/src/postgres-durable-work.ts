import type { Prisma, PrismaClient } from "@kivro/database";
import type { DurableWorkPort } from "./durable-work-port.js";
import { randomUUID } from "node:crypto";

export const DURABLE_WORK_KIND = {
  JOB_PROMOTION: "JOB_PROMOTION",
  WORKER_SIGNAL: "WORKER_SIGNAL",
} as const;

const DEFAULT_MAX_ATTEMPTS = 8;

export type DurableWorkProfileId = DurableWorkPort["profile"];

export function createPostgresDurableWorkPort(
  prisma: PrismaClient,
  profile: DurableWorkProfileId,
): DurableWorkPort {
  return {
    profile,
    async scheduleJobPromotion(input) {
      await enqueueDurableWorkItem(prisma, {
        kind: DURABLE_WORK_KIND.JOB_PROMOTION,
        idempotencyKey: `job-promotion:${input.jobId}`,
        payload: { jobId: input.jobId, runAt: input.runAt },
        runAt: new Date(input.runAt),
      });
      return { scheduled: true };
    },
    async enqueueWorkerSignal(input) {
      await enqueueDurableWorkItem(prisma, {
        kind: DURABLE_WORK_KIND.WORKER_SIGNAL,
        idempotencyKey: `worker-signal:${input.workerDeviceId}:${input.signal}`,
        payload: {
          workerDeviceId: input.workerDeviceId,
          signal: input.signal,
        },
      });
      return { queued: true };
    },
  };
}

export async function enqueueDurableWorkItem(
  prisma: PrismaClient,
  input: {
    kind: string;
    idempotencyKey: string;
    payload: Record<string, unknown>;
    runAt?: Date;
  },
): Promise<void> {
  const payloadJson = input.payload as Prisma.InputJsonValue;
  await prisma.durableWorkItem.upsert({
    where: {
      kind_idempotencyKey: {
        kind: input.kind,
        idempotencyKey: input.idempotencyKey,
      },
    },
    create: {
      kind: input.kind,
      idempotencyKey: input.idempotencyKey,
      payloadJson,
      runAt: input.runAt ?? new Date(),
      maxAttempts: DEFAULT_MAX_ATTEMPTS,
    },
    update: {
      payloadJson,
      runAt: input.runAt ?? new Date(),
      status: "PENDING",
      lastError: null,
    },
  });
}

export type ProcessDurableWorkResult = {
  claimed: number;
  completed: number;
  failed: number;
  requeued: number;
};

function backoffMs(attempt: number): number {
  return Math.min(60_000 * 15, 1000 * 2 ** Math.min(attempt, 8));
}

export async function processPostgresDurableWorkBatch(
  prisma: PrismaClient,
  limit = 25,
): Promise<ProcessDurableWorkResult> {
  const now = new Date();
  const due = await prisma.durableWorkItem.findMany({
    where: {
      status: "PENDING",
      runAt: { lte: now },
    },
    orderBy: { runAt: "asc" },
    take: limit,
  });

  let claimed = 0;
  let completed = 0;
  let failed = 0;
  let requeued = 0;

  for (const item of due) {
    const claimToken = randomUUID();
    const updated = await prisma.durableWorkItem.updateMany({
      where: { id: item.id, status: "PENDING" },
      data: {
        status: "CLAIMED",
        claimToken,
        claimedAt: now,
        attemptCount: { increment: 1 },
      },
    });
    if (updated.count !== 1) {
      continue;
    }
    claimed += 1;

    try {
      await executeDurableWorkItem(item.kind, item.payloadJson as Record<string, unknown>);
      await prisma.durableWorkItem.update({
        where: { id: item.id },
        data: { status: "COMPLETED", lastError: null, claimToken: null },
      });
      completed += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const attemptCount = item.attemptCount + 1;
      const terminal = attemptCount >= item.maxAttempts;
      if (terminal) {
        await prisma.durableWorkItem.update({
          where: { id: item.id },
          data: { status: "FAILED", lastError: message, claimToken: null },
        });
        failed += 1;
      } else {
        await prisma.durableWorkItem.update({
          where: { id: item.id },
          data: {
            status: "PENDING",
            lastError: message,
            claimToken: null,
            runAt: new Date(Date.now() + backoffMs(attemptCount)),
          },
        });
        requeued += 1;
      }
    }
  }

  return { claimed, completed, failed, requeued };
}

async function executeDurableWorkItem(
  kind: string,
  payload: Record<string, unknown>,
): Promise<void> {
  if (kind === DURABLE_WORK_KIND.WORKER_SIGNAL) {
    if (!payload.workerDeviceId || !payload.signal) {
      throw new Error("WORKER_SIGNAL_PAYLOAD_INVALID");
    }
    return;
  }
  if (kind === DURABLE_WORK_KIND.JOB_PROMOTION) {
    if (!payload.jobId) {
      throw new Error("JOB_PROMOTION_PAYLOAD_INVALID");
    }
    return;
  }
  throw new Error(`UNKNOWN_DURABLE_WORK_KIND:${kind}`);
}
