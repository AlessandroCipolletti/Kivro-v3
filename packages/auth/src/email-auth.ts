import type { PrismaClient, User } from "@kivro/database";
import { generateSecureToken, hashPassword, hashToken, normalizeEmail, verifyPassword } from "./crypto.js";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_MIN_INTERVAL_MS = 2 * 60 * 1000;

export type RegisterResult =
  | { ok: true; user: User; verificationToken: string }
  | { ok: false; code: "EMAIL_TAKEN" | "INVALID_INPUT" };

export async function issueEmailVerificationToken(
  db: PrismaClient,
  userId: string,
): Promise<string> {
  const rawToken = generateSecureToken(32);
  await db.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
    },
  });
  return rawToken;
}

export async function registerWithEmail(
  db: PrismaClient,
  input: { email: string; password: string },
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
  const verificationToken = await issueEmailVerificationToken(db, user.id);
  return {
    ok: true,
    user,
    verificationToken,
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

export type VerifyEmailResult =
  | { ok: true; user: User; alreadyVerified: boolean }
  | { ok: false; code: "INVALID_OR_EXPIRED_TOKEN" };

export async function verifyEmailToken(
  db: PrismaClient,
  rawToken: string,
): Promise<VerifyEmailResult> {
  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  });
  if (!record) {
    return { ok: false, code: "INVALID_OR_EXPIRED_TOKEN" };
  }
  if (record.user.emailVerifiedAt) {
    return { ok: true, user: record.user, alreadyVerified: true };
  }
  if (record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, code: "INVALID_OR_EXPIRED_TOKEN" };
  }
  const user = await db.$transaction(async (tx) => {
    await tx.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
    return tx.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    });
  });
  return { ok: true, user, alreadyVerified: false };
}

export type ResendVerificationResult =
  | { status: "SENT"; verificationToken: string; email: string }
  | { status: "RATE_LIMITED" }
  | { status: "ALREADY_VERIFIED" }
  | { status: "ACCEPTED" };

export async function resendEmailVerification(
  db: PrismaClient,
  emailInput: string,
): Promise<ResendVerificationResult> {
  const email = normalizeEmail(emailInput);
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { status: "ACCEPTED" };
  }
  if (user.emailVerifiedAt) {
    return { status: "ALREADY_VERIFIED" };
  }
  const latest = await db.emailVerificationToken.findFirst({
    where: { userId: user.id, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (latest && Date.now() - latest.createdAt.getTime() < RESEND_MIN_INTERVAL_MS) {
    return { status: "RATE_LIMITED" };
  }
  const verificationToken = await issueEmailVerificationToken(db, user.id);
  return { status: "SENT", verificationToken, email: user.email };
}

export function isEmailVerified(user: User): boolean {
  return user.emailVerifiedAt !== null;
}
