import type { PrismaClient } from "@kivro/database";
import { deliverBuyerWebhookEvent, type WebhookEventType } from "@kivro/buyer-webhooks";

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
