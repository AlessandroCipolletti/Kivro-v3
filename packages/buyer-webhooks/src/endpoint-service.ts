import type { PrismaClient } from "@kivro/database";
import { randomUUID } from "node:crypto";
import { parseWebhookEvents, type WebhookEventType } from "./events.js";
import { encryptWebhookSecret, generateWebhookSecret } from "./secret-crypto.js";
import { validateWebhookUrl } from "./url-validation.js";

export async function createBuyerWebhookEndpoint(
  prisma: PrismaClient,
  input: { userId: string; url: string; events?: WebhookEventType[] },
): Promise<{ id: string; secret: string; url: string; events: string[] } | { error: string }> {
  const valid = validateWebhookUrl(input.url);
  if ("error" in valid) {
    return { error: valid.error };
  }
  const secret = generateWebhookSecret();
  const events = input.events ?? (["job.completed", "job.failed"] as WebhookEventType[]);
  const id = randomUUID();
  await prisma.buyerWebhookEndpoint.create({
    data: {
      id,
      userId: input.userId,
      url: valid.url.toString(),
      secretEncrypted: encryptWebhookSecret(secret),
      events,
    },
  });
  return { id, secret, url: valid.url.toString(), events };
}

export async function rotateBuyerWebhookSecret(
  prisma: PrismaClient,
  input: { userId: string; endpointId: string },
): Promise<{ secret: string } | { error: "NOT_FOUND" }> {
  const row = await prisma.buyerWebhookEndpoint.findFirst({
    where: { id: input.endpointId, userId: input.userId, enabled: true },
  });
  if (!row) {
    return { error: "NOT_FOUND" };
  }
  const secret = generateWebhookSecret();
  await prisma.buyerWebhookEndpoint.update({
    where: { id: row.id },
    data: { secretEncrypted: encryptWebhookSecret(secret) },
  });
  return { secret };
}

export async function listBuyerWebhookEndpoints(prisma: PrismaClient, userId: string) {
  const rows = await prisma.buyerWebhookEndpoint.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    url: row.url,
    events: parseWebhookEvents(row.events),
    enabled: row.enabled,
    lastSuccessAt: row.lastSuccessAt?.toISOString() ?? null,
    lastFailureAt: row.lastFailureAt?.toISOString() ?? null,
    failureCount: row.failureCount,
    createdAt: row.createdAt.toISOString(),
  }));
}
