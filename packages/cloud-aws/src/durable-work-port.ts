import type { PrismaClient } from "@kivro/database";
import type { DurableWorkPort } from "@kivro/cloud-core";
import { createPostgresDurableWorkPort, DURABLE_WORK_KIND } from "@kivro/cloud-core";
import {
  createSqsClient,
  publishSqsDurableWorkMessage,
  resolveSqsDurableWorkConfig,
} from "./sqs-durable-work.js";

/** M21 — RDS-authoritative ledger + optional SQS fan-out for AWS-native async. */
export function createAwsDurableWorkPort(prisma: PrismaClient): DurableWorkPort {
  const pg = createPostgresDurableWorkPort(prisma, "aws-managed-queue");
  const sqsConfig = resolveSqsDurableWorkConfig();
  const sqsClient = sqsConfig ? createSqsClient(sqsConfig.region) : null;

  async function mirrorToSqs(payload: Record<string, unknown>): Promise<void> {
    if (!sqsClient || !sqsConfig) {
      return;
    }
    await publishSqsDurableWorkMessage(sqsClient, sqsConfig, payload);
  }

  return {
    profile: "aws-managed-queue",
    async scheduleJobPromotion(input) {
      const result = await pg.scheduleJobPromotion(input);
      await mirrorToSqs({
        kind: DURABLE_WORK_KIND.JOB_PROMOTION,
        jobId: input.jobId,
        runAt: input.runAt,
      });
      return result;
    },
    async enqueueWorkerSignal(input) {
      const result = await pg.enqueueWorkerSignal(input);
      await mirrorToSqs({
        kind: DURABLE_WORK_KIND.WORKER_SIGNAL,
        ...input,
      });
      return result;
    },
  };
}

export { enqueueDurableWorkItem, processPostgresDurableWorkBatch as processAwsDurableWorkBatch } from "@kivro/cloud-core";
