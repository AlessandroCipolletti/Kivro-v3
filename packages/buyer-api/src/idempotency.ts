import type { PrismaClient } from "@kivro/database";
import { createHash, randomUUID } from "node:crypto";

export function hashRequestBody(body: unknown): string {
  return createHash("sha256").update(JSON.stringify(body ?? {})).digest("hex");
}

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

export async function readIdempotentResponse(
  prisma: PrismaClient,
  input: { userId: string; endpoint: string; idempotencyKey: string; requestHash?: string },
): Promise<{ statusCode: number; body: unknown } | { conflict: true } | null> {
  const row = await prisma.apiIdempotencyRecord.findUnique({
    where: {
      userId_endpoint_idempotencyKey: {
        userId: input.userId,
        endpoint: input.endpoint,
        idempotencyKey: input.idempotencyKey,
      },
    },
  });
  if (!row) {
    return null;
  }
  if (row.expiresAt.getTime() < Date.now()) {
    return null;
  }
  if (input.requestHash && row.requestHash !== input.requestHash) {
    return { conflict: true };
  }
  return { statusCode: row.statusCode, body: row.responseJson };
}

export async function storeIdempotentResponse(
  prisma: PrismaClient,
  input: {
    userId: string;
    apiKeyId?: string;
    endpoint: string;
    idempotencyKey: string;
    requestHash: string;
    statusCode: number;
    responseJson: unknown;
  },
): Promise<{ ok: true } | { conflict: true }> {
  const existing = await prisma.apiIdempotencyRecord.findUnique({
    where: {
      userId_endpoint_idempotencyKey: {
        userId: input.userId,
        endpoint: input.endpoint,
        idempotencyKey: input.idempotencyKey,
      },
    },
  });
  if (existing) {
    if (existing.requestHash !== input.requestHash) {
      return { conflict: true };
    }
    return { ok: true };
  }
  await prisma.apiIdempotencyRecord.create({
    data: {
      id: randomUUID(),
      userId: input.userId,
      apiKeyId: input.apiKeyId ?? null,
      endpoint: input.endpoint,
      idempotencyKey: input.idempotencyKey,
      requestHash: input.requestHash,
      responseJson: input.responseJson as object,
      statusCode: input.statusCode,
      expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
    },
  });
  return { ok: true };
}
