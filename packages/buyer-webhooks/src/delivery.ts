import type { PrismaClient } from "@kivro/database";
import { randomUUID } from "node:crypto";
import { decryptWebhookSecret } from "./secret-crypto.js";
import { buildWebhookSignatureHeader } from "./signing.js";
import type { WebhookEventType } from "./events.js";

const MAX_RETRIES = 3;

export type WebhookJobPayload = {
  jobId: string;
  capabilityId: string;
  capabilityVersion: number;
  status: string;
};

export async function deliverBuyerWebhookEvent(
  prisma: PrismaClient,
  input: {
    userId: string;
    eventType: WebhookEventType;
    data: WebhookJobPayload;
  },
): Promise<{ delivered: number; failed: number }> {
  const endpoints = await prisma.buyerWebhookEndpoint.findMany({
    where: { userId: input.userId, enabled: true },
  });
  let delivered = 0;
  let failed = 0;
  const eventId = `evt_${randomUUID()}`;
  const envelope = {
    id: eventId,
    type: input.eventType,
    createdAt: new Date().toISOString(),
    data: input.data,
  };
  const body = JSON.stringify(envelope);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  for (const endpoint of endpoints) {
    const events = endpoint.events as string[];
    if (!events.includes(input.eventType)) {
      continue;
    }
    const existing = await prisma.webhookDeliveryAttempt.findUnique({
      where: { endpointId_eventId: { endpointId: endpoint.id, eventId } },
    });
    if (existing) {
      continue;
    }

    let success = false;
    let statusCode: number | null = null;
    let error: string | null = null;
    const secret = decryptWebhookSecret(endpoint.secretEncrypted);
    const signature = buildWebhookSignatureHeader({ secret, timestamp, body });

    for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
      try {
        const res = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Marketplace-Event-Id": eventId,
            "Marketplace-Timestamp": timestamp,
            "Marketplace-Signature": signature,
          },
          body,
          signal: AbortSignal.timeout(10_000),
        });
        statusCode = res.status;
        success = res.ok;
        if (success) {
          break;
        }
        error = `HTTP_${res.status}`;
      } catch (err) {
        error = err instanceof Error ? err.message : "DELIVERY_FAILED";
      }
    }

    await prisma.webhookDeliveryAttempt.create({
      data: {
        id: randomUUID(),
        endpointId: endpoint.id,
        eventId,
        eventType: input.eventType,
        statusCode,
        success,
        error,
      },
    });

    await prisma.buyerWebhookEndpoint.update({
      where: { id: endpoint.id },
      data: success
        ? { lastSuccessAt: new Date(), failureCount: 0 }
        : { lastFailureAt: new Date(), failureCount: { increment: 1 } },
    });

    if (success) {
      delivered += 1;
    } else {
      failed += 1;
    }
  }

  return { delivered, failed };
}
