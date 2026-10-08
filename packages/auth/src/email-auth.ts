import type { PrismaClient, User } from "@kivro/database";
import { generateSecureToken, hashPassword, hashToken, normalizeEmail, verifyPassword } from "./crypto.js";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export type RegisterResult =
  | { ok: true; user: User; verificationToken?: string }
  | { ok: false; code: "EMAIL_TAKEN" | "INVALID_INPUT" };

export async function registerWithEmail(
  db: PrismaClient,
  input: { email: string; password: string },
  options: { exposeDevVerificationToken: boolean },
): Promise<RegisterResult> {
  const email = normalizeEmail(input.email);
  if (!email.includes("@") || input.password.length < 8) {
    return { ok: false, code: "INVALID_INPUT" };
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, code: "EMAIL_TAKEN" };
  }
  const passwordHash = await hashPassword(input.password);
  const user = await db.user.create({
    data: { email, passwordHash, emailVerifiedAt: null },
  });
  const rawToken = generateSecureToken(32);
  await db.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
    },
  });
  return {
    ok: true,
    user,
    verificationToken: options.exposeDevVerificationToken ? rawToken : undefined,
  };
}

export type LoginResult =
  | { ok: true; user: User }
  | { ok: false; code: "INVALID_CREDENTIALS" };

export async function loginWithEmail(
  db: PrismaClient,
  input: { email: string; password: string },
): Promise<LoginResult> {
  const email = normalizeEmail(input.email);
  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return { ok: false, code: "INVALID_CREDENTIALS" };
  }
  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    return { ok: false, code: "INVALID_CREDENTIALS" };
  }
  return { ok: true, user };
}

export async function verifyEmailToken(db: PrismaClient, rawToken: string): Promise<boolean> {
  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return false;
  }
  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    db.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
  return true;
}

export function isEmailVerified(user: User): boolean {
  return user.emailVerifiedAt !== null;
}
