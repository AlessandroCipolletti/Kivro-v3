import type { PrismaClient, User, WorkerDevice } from "@kivro/database";
import { generateSecureToken, hashToken } from "./crypto.js";
import { isEmailVerified } from "./email-auth.js";

const PAIRING_TTL_MS = 15 * 60 * 1000;

export async function createWorkerPairingCode(
  db: PrismaClient,
  user: User,
): Promise<{ code: string; expiresAt: Date } | { error: "EMAIL_NOT_VERIFIED" }> {
  if (!isEmailVerified(user)) {
    return { error: "EMAIL_NOT_VERIFIED" };
  }
  const code = generateSecureToken(9).slice(0, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + PAIRING_TTL_MS);
  await db.workerPairingCode.create({
    data: {
      userId: user.id,
      codeHash: hashToken(code),
      expiresAt,
    },
  });
  return { code, expiresAt };
}

export async function consumePairingCode(
  db: PrismaClient,
  input: {
    code: string;
    publicKey: string;
    name: string;
    platform: string;
    workerVersion: string;
    openClawVersion?: string;
  },
): Promise<WorkerDevice | null> {
  const record = await db.workerPairingCode.findFirst({
    where: {
      codeHash: hashToken(input.code.toUpperCase()),
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: { include: { sellerProfile: true } } },
  });
  if (!record) {
    return null;
  }

  let sellerProfileId = record.user.sellerProfile?.id;
  if (!sellerProfileId) {
    const profile = await db.sellerProfile.create({
      data: {
        userId: record.user.id,
        displayName: record.user.email.split("@")[0] ?? "Seller",
      },
    });
    sellerProfileId = profile.id;
  }

  const device = await db.$transaction(async (tx) => {
    await tx.workerPairingCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
    return tx.workerDevice.create({
      data: {
        sellerProfileId,
        publicKey: input.publicKey,
        name: input.name,
        platform: input.platform,
        workerVersion: input.workerVersion,
        openClawVersion: input.openClawVersion,
      },
    });
  });

  return device;
}
