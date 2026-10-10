import type { PrismaClient } from "@kivro/database";
import { randomUUID } from "node:crypto";
import { decryptWebhookSecret } from "./secret-crypto.js";
import { buildWebhookSignatureHeader } from "./signing.js";
import type { WebhookEventType } from "./events.js";

const INLINE_RETRIES = 3;
/** M27 — must stay ≤ docs/audits/M27-performance-envelope.json maxWebhookDeliveryAttempts. */
export const BUYER_WEBHOOK_MAX_TOTAL_ATTEMPTS = 8;
const MAX_TOTAL_ATTEMPTS = BUYER_WEBHOOK_MAX_TOTAL_ATTEMPTS;

/** M27 — bounded retry sweep batch (non-unbounded queue drain). */
export const BUYER_WEBHOOK_RETRY_BATCH_LIMIT = 25;

export type WebhookJobPayload = {
  jobId: string;
  capabilityId: string;
  capabilityVersion: number;
  status: string;
};

async function postWebhook(input: {
  url: string;
  secret: string;
  eventId: string;
  body: string;
  timestamp: string;
}): Promise<{ success: boolean; statusCode: number | null; error: string | null }> {
  const signature = buildWebhookSignatureHeader({
    secret: input.secret,
    timestamp: input.timestamp,
    body: input.body,
  });
  try {
    const res = await fetch(input.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Marketplace-Event-Id": input.eventId,
        "Marketplace-Timestamp": input.timestamp,
        "Marketplace-Signature": signature,
      },
      body: input.body,
      signal: AbortSignal.timeout(10_000),
    });
    return {
      success: res.ok,
      statusCode: res.status,
      error: res.ok ? null : `HTTP_${res.status}`,
    };
  } catch (err) {
    return {
      success: false,
      statusCode: null,
      error: err instanceof Error ? err.message : "DELIVERY_FAILED",
    };
  }
}

function backoffMs(attemptCount: number): number {
  return Math.min(60_000, 5_000 * 2 ** Math.max(0, attemptCount - 1));
}

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
    if (existing?.success) {
      continue;
    }

    const secret = decryptWebhookSecret(endpoint.secretEncrypted);
    let success = false;
    let statusCode: number | null = null;
    let error: string | null = null;
    let attemptCount = existing?.attemptCount ?? 0;

    for (let attempt = 0; attempt < INLINE_RETRIES; attempt += 1) {
      attemptCount += 1;
      const result = await postWebhook({
        url: endpoint.url,
        secret,
        eventId,
        body,
        timestamp,
      });
      statusCode = result.statusCode;
      error = result.error;
      success = result.success;
      if (success) {
        break;
      }
    }

    const nextRetryAt =
      success || attemptCount >= MAX_TOTAL_ATTEMPTS
        ? null
        : new Date(Date.now() + backoffMs(attemptCount));

    await prisma.webhookDeliveryAttempt.upsert({
      where: { endpointId_eventId: { endpointId: endpoint.id, eventId } },
      create: {
        id: randomUUID(),
        endpointId: endpoint.id,
        eventId,
        eventType: input.eventType,
        statusCode,
        success,
        error,
        payloadJson: envelope,
        attemptCount,
        nextRetryAt,
        lastAttemptAt: new Date(),
      },
      update: {
        statusCode,
        success,
        error,
        payloadJson: envelope,
        attemptCount,
        nextRetryAt,
        lastAttemptAt: new Date(),
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

export async function retryDueWebhookDeliveries(
  prisma: PrismaClient,
  limit = BUYER_WEBHOOK_RETRY_BATCH_LIMIT,
): Promise<{ retried: number; delivered: number }> {
  const due = await prisma.webhookDeliveryAttempt.findMany({
    where: {
      success: false,
      nextRetryAt: { lte: new Date() },
      attemptCount: { lt: MAX_TOTAL_ATTEMPTS },
    },
    take: limit,
    include: { endpoint: true },
  });
  let delivered = 0;
  for (const row of due) {
    if (!row.endpoint.enabled || !row.payloadJson) {
      continue;
    }
    const envelope = row.payloadJson as { id: string; type: string; createdAt: string; data: unknown };
    const body = JSON.stringify(envelope);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const secret = decryptWebhookSecret(row.endpoint.secretEncrypted);
    const attemptCount = row.attemptCount + 1;
    const result = await postWebhook({
      url: row.endpoint.url,
      secret,
      eventId: row.eventId,
      body,
      timestamp,
    });
    const success = result.success;
    const nextRetryAt =
      success || attemptCount >= MAX_TOTAL_ATTEMPTS
        ? null
        : new Date(Date.now() + backoffMs(attemptCount));
    await prisma.webhookDeliveryAttempt.update({
      where: { id: row.id },
      data: {
        success,
        statusCode: result.statusCode,
        error: result.error,
        attemptCount,
        nextRetryAt,
        lastAttemptAt: new Date(),
      },
    });
    await prisma.buyerWebhookEndpoint.update({
      where: { id: row.endpoint.id },
      data: success
        ? { lastSuccessAt: new Date(), failureCount: 0 }
        : { lastFailureAt: new Date(), failureCount: { increment: 1 } },
    });
    if (success) {
      delivered += 1;
    }
  }
  return { retried: due.length, delivered };
}

export async function listWebhookDeliveries(
  prisma: PrismaClient,
  input: { userId: string; endpointId: string; limit?: number },
): Promise<
  | {
      deliveries: Array<{
        id: string;
        eventId: string;
        eventType: string;
        success: boolean;
        statusCode: number | null;
        error: string | null;
        attemptCount: number;
        nextRetryAt: string | null;
        createdAt: string;
      }>;
    }
  | { error: "NOT_FOUND" }
> {
  const endpoint = await prisma.buyerWebhookEndpoint.findFirst({
    where: { id: input.endpointId, userId: input.userId },
  });
  if (!endpoint) {
    return { error: "NOT_FOUND" };
  }
  const rows = await prisma.webhookDeliveryAttempt.findMany({
    where: { endpointId: endpoint.id },
    orderBy: { createdAt: "desc" },
    take: input.limit ?? 50,
  });
  return {
    deliveries: rows.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      eventType: r.eventType,
      success: r.success,
      statusCode: r.statusCode,
      error: r.error,
      attemptCount: r.attemptCount,
      nextRetryAt: r.nextRetryAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
