import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_PREFIX = "mk_live_";

export function generateBuyerApiKeyMaterial(): { secret: string; prefix: string } {
  const secret = `${KEY_PREFIX}${randomBytes(24).toString("base64url")}`;
  const prefix = secret.slice(0, 16);
  return { secret, prefix };
}

export function hashBuyerApiKeySecret(secret: string): string {
  const salt = createHash("sha256").update("kivro-buyer-api-key-v1").digest();
  return scryptSync(secret, salt, 32).toString("hex");
}

export function verifyBuyerApiKeySecret(secret: string, secretHash: string): boolean {
  const computed = hashBuyerApiKeySecret(secret);
  try {
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(secretHash, "hex"));
  } catch {
    return false;
  }
}

export function extractBearerToken(authorization: string | undefined): string | null {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }
  const token = authorization.slice("Bearer ".length).trim();
  if (!token.startsWith(KEY_PREFIX) || token.length < 24) {
    return null;
  }
  return token;
}
