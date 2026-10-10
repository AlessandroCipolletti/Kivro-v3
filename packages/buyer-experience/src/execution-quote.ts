import type { PrismaClient } from "@kivro/database";
import { digestStructuredBuyerInputs } from "./inputs-digest.js";
import { quoteChargeAllowed } from "./quote-freshness.js";
import { runBuyerExecutionPreflight } from "./execution-preflight.js";

const QUOTE_TTL_MS = 15 * 60_000;

export type ExecutionQuoteResult =
  | {
      quoteId: string;
      expiresAt: string;
      priceSnapshotCents: number;
      currency: string;
      capabilityVersionId: string;
      versionNumber: number;
      preflight: Awaited<ReturnType<typeof runBuyerExecutionPreflight>>;
    }
  | { error: string };

/** BUYERUX-002 — immutable price authorization quote. */
export async function createBuyerExecutionQuote(
  prisma: PrismaClient,
  input: {
    buyerId: string;
    capabilityId: string;
    structuredInput: Record<string, unknown>;
    assetManifest?: Record<string, unknown>;
    hardDeliveryDeadlineAt?: Date | null;
    scheduledRunAt?: Date | null;
  },
): Promise<ExecutionQuoteResult> {
  const capability = await prisma.capability.findUnique({
    where: { id: input.capabilityId },
    include: { currentVersion: true },
  });
  if (!capability?.currentVersion || capability.status !== "PUBLISHED") {
    return { error: "CAPABILITY_NOT_AVAILABLE" };
  }
  const version = capability.currentVersion;
  const priceSnapshotCents = version.priceSnapshotCents;
  const currency = version.currency;
  const estMinutes =
    typeof capability.estimatedDuration === "number" ? capability.estimatedDuration : null;
  const immediate = !input.scheduledRunAt;
  const preflight = await runBuyerExecutionPreflight(prisma, {
    capabilityId: input.capabilityId,
    immediate,
    hardDeliveryDeadlineAt: input.hardDeliveryDeadlineAt,
    scheduledRunAt: input.scheduledRunAt,
    estimatedDurationMinutes: estMinutes,
  });
  if (!preflight.ok) {
    return { error: preflight.error };
  }
  const expiresAt = new Date(Date.now() + QUOTE_TTL_MS);
  const digest = digestStructuredBuyerInputs({
    structuredInput: input.structuredInput,
    assetManifest: input.assetManifest,
  });
  const quote = await prisma.buyerExecutionQuote.create({
    data: {
      buyerId: input.buyerId,
      capabilityId: capability.id,
      capabilityVersionId: version.id,
      versionNumber: version.versionNumber,
      priceSnapshotCents,
      currency,
      inputsDigest: digest,
      hardDeliveryDeadlineAt: input.hardDeliveryDeadlineAt ?? undefined,
      scheduledRunAt: input.scheduledRunAt ?? undefined,
      expiresAt,
    },
  });
  return {
    quoteId: quote.id,
    expiresAt: expiresAt.toISOString(),
    priceSnapshotCents,
    currency,
    capabilityVersionId: version.id,
    versionNumber: version.versionNumber,
    preflight,
  };
}

export type QuoteValidationResult =
  | {
      ok: true;
      hardDeliveryDeadlineAt: Date | null;
      scheduledRunAt: Date | null;
    }
  | { ok: false; error: string };

/** BUYERUX-003 — atomic revalidation at purchase. */
export async function validateExecutionQuoteAtPurchase(
  prisma: PrismaClient,
  input: {
    quoteId: string;
    buyerId: string;
    capabilityId: string;
    structuredInput: Record<string, unknown>;
    assetManifest?: Record<string, unknown>;
  },
): Promise<QuoteValidationResult> {
  const quote = await prisma.buyerExecutionQuote.findUnique({ where: { id: input.quoteId } });
  if (!quote || quote.buyerId !== input.buyerId) {
    return { ok: false, error: "QUOTE_NOT_FOUND" };
  }
  if (quote.consumedAt) {
    return { ok: false, error: "QUOTE_ALREADY_USED" };
  }
  if (!quoteChargeAllowed(quote.expiresAt, new Date())) {
    return { ok: false, error: "QUOTE_EXPIRED" };
  }
  if (quote.capabilityId !== input.capabilityId) {
    return { ok: false, error: "QUOTE_CAPABILITY_MISMATCH" };
  }
  const digest = digestStructuredBuyerInputs({
    structuredInput: input.structuredInput,
    assetManifest: input.assetManifest,
  });
  if (digest !== quote.inputsDigest) {
    return { ok: false, error: "QUOTE_INPUTS_MISMATCH" };
  }
  const capability = await prisma.capability.findUnique({
    where: { id: input.capabilityId },
    include: { currentVersion: true },
  });
  if (!capability?.currentVersion || capability.currentVersion.id !== quote.capabilityVersionId) {
    return { ok: false, error: "QUOTE_VERSION_STALE" };
  }
  if (capability.currentVersion.priceSnapshotCents !== quote.priceSnapshotCents) {
    return { ok: false, error: "QUOTE_PRICE_STALE" };
  }
  await prisma.buyerExecutionQuote.update({
    where: { id: quote.id },
    data: { consumedAt: new Date() },
  });
  return {
    ok: true,
    hardDeliveryDeadlineAt: quote.hardDeliveryDeadlineAt,
    scheduledRunAt: quote.scheduledRunAt,
  };
}
