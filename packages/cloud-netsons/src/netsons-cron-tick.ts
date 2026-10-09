import type { PrismaClient } from "@kivro/database";
import { retryDueWebhookDeliveries } from "@kivro/buyer-webhooks";
import { runSchedulingSweeps } from "@kivro/job-scheduling";
import { processNetsonsDurableWorkBatch } from "./durable-work-db-port.js";

export type NetsonsCronTickResult = {
  durableWork: Awaited<ReturnType<typeof processNetsonsDurableWorkBatch>>;
  webhooks: Awaited<ReturnType<typeof retryDueWebhookDeliveries>>;
  scheduling: Awaited<ReturnType<typeof runSchedulingSweeps>>;
};

/** HOST-NET-015/018 — single bounded cron entry for managed Netsons hosting. */
export async function runNetsonsCronTick(
  prisma: PrismaClient,
  input?: { durableWorkLimit?: number; webhookLimit?: number },
): Promise<NetsonsCronTickResult> {
  const durableWork = await processNetsonsDurableWorkBatch(
    prisma,
    input?.durableWorkLimit ?? 25,
  );
  const webhooks = await retryDueWebhookDeliveries(prisma, input?.webhookLimit ?? 25);
  const scheduling = await runSchedulingSweeps(prisma);
  return { durableWork, webhooks, scheduling };
}
