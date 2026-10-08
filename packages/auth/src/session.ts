import type { PrismaClient, User } from "@kivro/database";
import { generateSecureToken, hashToken } from "./crypto.js";

const SESSION_DAYS = 14;

export async function createSession(
  db: PrismaClient,
  userId: string,
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSecureToken(32);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });
  return { token, expiresAt };
}

export async function resolveSessionUser(
  db: PrismaClient,
  sessionToken: string | undefined,
): Promise<User | null> {
  if (!sessionToken) {
    return null;
  }
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(sessionToken) },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  return session.user;
}

export async function revokeSession(db: PrismaClient, sessionToken: string): Promise<void> {
  await db.session.deleteMany({ where: { tokenHash: hashToken(sessionToken) } });
}
