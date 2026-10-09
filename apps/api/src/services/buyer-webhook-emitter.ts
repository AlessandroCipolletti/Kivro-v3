import type { PrismaClient } from "@kivro/database";
import {
  deliverBuyerWebhookEvent,
  webhookEventForJobStatus,
  type WebhookEventType,
} from "@kivro/buyer-webhooks";

export { webhookEventForJobStatus } from "@kivro/buyer-webhooks";

export async function emitBuyerJobWebhook(
  prisma: PrismaClient,
  jobId: string,
  eventType: WebhookEventType,
): Promise<void> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { capabilityVersion: { include: { capability: true } } },
  });
  if (!job) {
    return;
  }
  await deliverBuyerWebhookEvent(prisma, {
    userId: job.buyerId,
    eventType,
    data: {
      jobId: job.id,
      capabilityId: job.capabilityId,
      capabilityVersion: job.versionNumber,
      status: job.status,
    },
  });
}

/** Emit webhook matching current job status (§328). */
export async function emitBuyerJobWebhookForCurrentStatus(
  prisma: PrismaClient,
  jobId: string,
): Promise<void> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return;
  }
  const eventType = webhookEventForJobStatus(job.status);
  if (!eventType) {
    return;
  }
  await emitBuyerJobWebhook(prisma, jobId, eventType);
}
