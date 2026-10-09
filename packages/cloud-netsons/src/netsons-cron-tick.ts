import type { PrismaClient } from "@kivro/database";
import { retryDueWebhookDeliveries } from "@kivro/buyer-webhooks";
import { runSchedulingSweeps } from "@kivro/job-scheduling";
import { NETSONS_DEFAULT_BATCH_LIMITS } from "./netsons-bounds.js";
import { processNetsonsDurableWorkBatch } from "./durable-work-db-port.js";
import { runNetsonsMaintenanceSweeps } from "./netsons-maintenance-sweeps.js";

export type NetsonsCronTickResult = {
  durableWork: Awaited<ReturnType<typeof processNetsonsDurableWorkBatch>>;
  webhooks: Awaited<ReturnType<typeof retryDueWebhookDeliveries>>;
  scheduling: Awaited<ReturnType<typeof runSchedulingSweeps>>;
  maintenance: Awaited<ReturnType<typeof runNetsonsMaintenanceSweeps>>;
};

/** HOST-NET-015/018/019 — single bounded cron entry for managed Netsons hosting. */
export async function runNetsonsCronTick(
  prisma: PrismaClient,
  input?: { durableWorkLimit?: number; webhookLimit?: number },
): Promise<NetsonsCronTickResult> {
  const durableWork = await processNetsonsDurableWorkBatch(
    prisma,
    input?.durableWorkLimit ?? NETSONS_DEFAULT_BATCH_LIMITS.durableWork,
  );
  const webhooks = await retryDueWebhookDeliveries(
    prisma,
    input?.webhookLimit ?? NETSONS_DEFAULT_BATCH_LIMITS.webhooks,
  );
  const scheduling = await runSchedulingSweeps(prisma);
  const maintenance = await runNetsonsMaintenanceSweeps(prisma);
  return { durableWork, webhooks, scheduling, maintenance };
}
