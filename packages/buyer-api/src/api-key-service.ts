import type { PrismaClient } from "@kivro/database";
import { randomUUID } from "node:crypto";
import {
  extractBearerToken,
  generateBuyerApiKeyMaterial,
  hashBuyerApiKeySecret,
  verifyBuyerApiKeySecret,
} from "./api-key-crypto.js";
import { DEFAULT_BUYER_API_SCOPES, parseScopes, type BuyerApiScope } from "./scopes.js";

export type VerifiedBuyerApiKey = {
  id: string;
  userId: string;
  scopes: string[];
};

export async function createBuyerApiKey(
  prisma: PrismaClient,
  input: { userId: string; name: string; scopes?: BuyerApiScope[]; expiresAt?: Date },
): Promise<{ id: string; prefix: string; secret: string; scopes: string[] }> {
  const { secret, prefix } = generateBuyerApiKeyMaterial();
  const scopes = input.scopes ?? DEFAULT_BUYER_API_SCOPES;
  const id = randomUUID();
  await prisma.buyerApiKey.create({
    data: {
      id,
      userId: input.userId,
      name: input.name.trim(),
      prefix,
      secretHash: hashBuyerApiKeySecret(secret),
      scopes,
      expiresAt: input.expiresAt ?? null,
    },
  });
  return { id, prefix, secret, scopes };
}

export async function verifyBuyerApiKeyFromAuthHeader(
  prisma: PrismaClient,
  authorization: string | undefined,
): Promise<VerifiedBuyerApiKey | null> {
  const token = extractBearerToken(authorization);
  if (!token) {
    return null;
  }
  const prefix = token.slice(0, 16);
  const row = await prisma.buyerApiKey.findUnique({ where: { prefix } });
  if (!row || row.revokedAt) {
    return null;
  }
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return null;
  }
  if (!verifyBuyerApiKeySecret(token, row.secretHash)) {
    return null;
  }
  await prisma.buyerApiKey.update({
    where: { id: row.id },
    data: { lastUsedAt: new Date() },
  });
  const user = await prisma.user.findUnique({ where: { id: row.userId } });
  if (!user || user.status !== "ACTIVE" || !user.emailVerifiedAt) {
    return null;
  }
  return {
    id: row.id,
    userId: row.userId,
    scopes: parseScopes(row.scopes),
  };
}

export async function revokeBuyerApiKey(
  prisma: PrismaClient,
  input: { userId: string; keyId: string },
): Promise<{ ok: true } | { error: "NOT_FOUND" }> {
  const row = await prisma.buyerApiKey.findFirst({
    where: { id: input.keyId, userId: input.userId, revokedAt: null },
  });
  if (!row) {
    return { error: "NOT_FOUND" };
  }
  await prisma.buyerApiKey.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });
  return { ok: true };
}
