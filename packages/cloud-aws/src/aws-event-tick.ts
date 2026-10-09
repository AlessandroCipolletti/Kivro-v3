import type { PrismaClient } from "@kivro/database";
import { retryDueWebhookDeliveries } from "@kivro/buyer-webhooks";
import { runSchedulingSweeps } from "@kivro/job-scheduling";
import { AWS_DEFAULT_BATCH_LIMITS } from "./aws-bounds.js";
import { processAwsDurableWorkBatch } from "./durable-work-port.js";
import { runAwsMaintenanceSweeps } from "./aws-maintenance-sweeps.js";
import {
  createSqsClient,
  drainSqsDurableWorkMessages,
  resolveSqsDurableWorkConfig,
} from "./sqs-durable-work.js";

export type AwsEventTickResult = {
  durableWork: Awaited<ReturnType<typeof processAwsDurableWorkBatch>>;
  sqs: { received: number; deleted: number } | null;
  webhooks: Awaited<ReturnType<typeof retryDueWebhookDeliveries>>;
  scheduling: Awaited<ReturnType<typeof runSchedulingSweeps>>;
  maintenance: Awaited<ReturnType<typeof runAwsMaintenanceSweeps>>;
};

/** M21 — EventBridge/Lambda HTTP entry (bounded, idempotent). */
export async function runAwsEventTick(
  prisma: PrismaClient,
  input?: { durableWorkLimit?: number; webhookLimit?: number; sqsLimit?: number },
): Promise<AwsEventTickResult> {
  const durableWork = await processAwsDurableWorkBatch(
    prisma,
    input?.durableWorkLimit ?? AWS_DEFAULT_BATCH_LIMITS.durableWork,
  );
  const sqsConfig = resolveSqsDurableWorkConfig();
  let sqs: AwsEventTickResult["sqs"] = null;
  if (sqsConfig) {
    const client = createSqsClient(sqsConfig.region);
    sqs = await drainSqsDurableWorkMessages(
      client,
      sqsConfig,
      input?.sqsLimit ?? AWS_DEFAULT_BATCH_LIMITS.sqsDrain,
    );
  }
  const webhooks = await retryDueWebhookDeliveries(
    prisma,
    input?.webhookLimit ?? AWS_DEFAULT_BATCH_LIMITS.webhooks,
  );
  const scheduling = await runSchedulingSweeps(prisma);
  const maintenance = await runAwsMaintenanceSweeps(prisma);
  return { durableWork, sqs, webhooks, scheduling, maintenance };
}
