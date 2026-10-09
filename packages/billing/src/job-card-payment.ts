import type Stripe from "stripe";
import type { Prisma, PrismaClient } from "@kivro/database";
import { assertJobTransition, type JobStatus } from "@kivro/domain";
import { createStripeClient, ensureStripeCustomer } from "./stripe-provider.js";
import { requireEnabledPriceTier } from "./tier-validation.js";

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function createCardAuthorizedJob(
  prisma: PrismaClient,
  stripe: Stripe,
  input: {
    buyerId: string;
    buyerEmail: string;
    capabilityId: string;
    structuredInput: Record<string, unknown>;
    assetManifest?: Record<string, unknown>;
  },
): Promise<
  | { jobId: string; clientSecret: string; paymentIntentId: string; status: JobStatus }
  | { error: string }
> {
  const capability = await prisma.capability.findUnique({
    where: { id: input.capabilityId },
    include: { currentVersion: true },
  });
  if (!capability?.currentVersion || capability.status !== "PUBLISHED") {
    return { error: "CAPABILITY_NOT_AVAILABLE" };
  }
  const version = capability.currentVersion;
  const tier = requireEnabledPriceTier({
    priceTierId: version.priceTierId ?? undefined,
    buyerPriceMinor: version.priceSnapshotCents,
  });

  const customerId = await ensureStripeCustomer(stripe, prisma, input.buyerId, input.buyerEmail);
  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.job.create({
      data: {
        buyerId: input.buyerId,
        capabilityId: capability.id,
        capabilityVersionId: version.id,
        versionNumber: version.versionNumber,
        permissionManifestSnapshot: toJsonValue(version.permissionManifest),
        inputContractSnapshot: toJsonValue(version.inputSchema),
        outputContractSnapshot: toJsonValue(version.outputSchema),
        priceSnapshotCents: tier.buyerPriceMinor,
        priceTierId: tier.id,
        platformFeeSnapshotCents: tier.platformFeeMinor,
        sellerNetSnapshotCents: tier.sellerNetMinor,
        currency: tier.currency,
        status: "CREATED",
        paymentFunding: "CARD_AUTHORIZATION",
      },
    });
    await tx.jobInput.create({
      data: {
        jobId: created.id,
        structuredInput: toJsonValue(input.structuredInput),
        assetManifest: input.assetManifest ? toJsonValue(input.assetManifest) : undefined,
      },
    });
    await tx.jobStateTransition.create({
      data: { jobId: created.id, fromStatus: null, toStatus: "CREATED", actor: "BUYER" },
    });
    return created;
  });

  const intent = await stripe.paymentIntents.create({
    amount: tier.buyerPriceMinor,
    currency: tier.currency.toLowerCase(),
    customer: customerId,
    capture_method: "manual",
    metadata: {
      kivroJobId: job.id,
      kivroBuyerId: input.buyerId,
      purpose: "JOB_CARD_AUTHORIZATION",
    },
  });
  if (!intent.client_secret) {
    return { error: "PAYMENT_INTENT_INCOMPLETE" };
  }
  await prisma.job.update({
    where: { id: job.id },
    data: { stripePaymentIntentId: intent.id },
  });
  return {
    jobId: job.id,
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    status: "CREATED",
  };
}

/** §24.5 — queue only after authorization is capturable (requires_capture). */
export async function secureCardAuthorizedJob(
  prisma: PrismaClient,
  jobId: string,
  stripe: Stripe | null = createStripeClient(),
): Promise<{ status: JobStatus } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return { error: "JOB_NOT_FOUND" };
  }
  if (job.paymentFunding !== "CARD_AUTHORIZATION") {
    return { error: "NOT_CARD_FUNDED" };
  }
  if (job.status === "QUEUED") {
    return { status: "QUEUED" };
  }
  if (job.status !== "CREATED") {
    return { error: "INVALID_STATE" };
  }
  if (!stripe || !job.stripePaymentIntentId) {
    return { error: "STRIPE_NOT_CONFIGURED" };
  }
  const intent = await stripe.paymentIntents.retrieve(job.stripePaymentIntentId);
  if (intent.status !== "requires_capture") {
    return { error: "PAYMENT_NOT_AUTHORIZED" };
  }

  await prisma.$transaction(async (tx) => {
    assertJobTransition("CREATED", "PAYMENT_RESERVED");
    await tx.job.update({
      where: { id: jobId },
      data: {
        status: "PAYMENT_RESERVED",
        reservedAmountCents: job.priceSnapshotCents,
      },
    });
    await tx.jobStateTransition.create({
      data: {
        jobId,
        fromStatus: "CREATED",
        toStatus: "PAYMENT_RESERVED",
        actor: "SYSTEM",
      },
    });
    assertJobTransition("PAYMENT_RESERVED", "QUEUED");
    await tx.job.update({ where: { id: jobId }, data: { status: "QUEUED" } });
    await tx.jobStateTransition.create({
      data: {
        jobId,
        fromStatus: "PAYMENT_RESERVED",
        toStatus: "QUEUED",
        actor: "SYSTEM",
      },
    });
  });
  return { status: "QUEUED" };
}

export async function captureCardAuthorization(
  stripe: Stripe,
  paymentIntentId: string,
): Promise<void> {
  await stripe.paymentIntents.capture(paymentIntentId);
}

export async function cancelCardAuthorization(
  stripe: Stripe,
  paymentIntentId: string,
): Promise<void> {
  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
  } catch {
    // already canceled or captured
  }
}
