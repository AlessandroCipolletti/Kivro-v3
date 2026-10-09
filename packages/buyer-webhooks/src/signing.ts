import { createHmac, timingSafeEqual } from "node:crypto";

export function signWebhookPayload(input: {
  secret: string;
  timestamp: string;
  body: string;
}): string {
  const signed = `${input.timestamp}.${input.body}`;
  return createHmac("sha256", input.secret).update(signed, "utf8").digest("hex");
}

export function buildWebhookSignatureHeader(input: {
  secret: string;
  timestamp: string;
  body: string;
}): string {
  const sig = signWebhookPayload(input);
  return `v1=${sig}`;
}

export function verifyWebhookSignature(input: {
  secret: string;
  timestamp: string;
  body: string;
  signatureHeader: string;
  maxSkewSeconds?: number;
  now?: Date;
}): boolean {
  const now = (input.now ?? new Date()).getTime();
  const ts = Number.parseInt(input.timestamp, 10);
  if (!Number.isFinite(ts)) {
    return false;
  }
  const skew = input.maxSkewSeconds ?? 300;
  if (Math.abs(now - ts * 1000) > skew * 1000) {
    return false;
  }
  const expected = buildWebhookSignatureHeader({
    secret: input.secret,
    timestamp: input.timestamp,
    body: input.body,
  });
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(input.signatureHeader.trim()));
  } catch {
    return false;
  }
}
