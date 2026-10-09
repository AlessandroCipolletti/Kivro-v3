import type { PrismaClient } from "@kivro/database";
import { randomUUID } from "node:crypto";

export async function recordBuyerApiKeyAudit(
  prisma: PrismaClient,
  input: {
    apiKeyId: string;
    userId: string;
    action: "CREATED" | "REVOKED" | "ROTATED";
    meta?: Record<string, unknown>;
  },
): Promise<void> {
  await prisma.buyerApiKeyAuditEvent.create({
    data: {
      id: randomUUID(),
      apiKeyId: input.apiKeyId,
      userId: input.userId,
      action: input.action,
      meta: (input.meta ?? undefined) as object | undefined,
    },
  });
}
