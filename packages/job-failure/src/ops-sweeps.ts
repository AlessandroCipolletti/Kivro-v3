import type { PrismaClient } from "@kivro/database";
import { sweepJobsWithLostWorkers } from "./lost-worker-sweep.js";

/** §36 / §35 — bundled operational sweeps for cron/admin promote. */
export async function runJobFailureOperationsSweeps(
  prisma: PrismaClient,
): Promise<{ lostWorker: { failed: number; jobIds: string[] } }> {
  const lostWorker = await sweepJobsWithLostWorkers(prisma);
  return { lostWorker };
}
