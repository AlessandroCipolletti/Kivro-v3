import Stripe from "stripe";
import type { PrismaClient } from "@kivro/database";
import { secureCardAuthorizedJob } from "./job-card-payment.js";
import { grantBuyerCredits } from "./job-payment.js";
import { buildLedgerIdempotencyKey } from "./ledger.js";

export function createStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export function verifyStripeWebhook(
  stripe: Stripe,
  payload: string | Buffer,
  signature: string,
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET_MISSING");
  }
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

export async function ensureStripeCustomer(
  stripe: Stripe,
  prisma: PrismaClient,
  userId: string,
  email: string,
): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }
  const customer = await stripe.customers.create({ email, metadata: { kivroUserId: userId } });
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

export async function handleStripeWebhookEvent(
  prisma: PrismaClient,
  event: Stripe.Event,
): Promise<{ handled: boolean }> {
  const claim = await prisma.stripeWebhookEvent.createMany({
    data: [{ stripeEventId: event.id, type: event.type }],
    skipDuplicates: true,
  });
  if (claim.count === 0) {
    return { handled: true };
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.kivroUserId;
      const amountCents = session.amount_total;
      if (userId && amountCents != null && amountCents > 0) {
        await grantBuyerCredits(prisma, {
          buyerId: userId,
          amountCents,
          externalId: session.id,
        });
      }
    }

    if (event.type === "account.updated") {
      await syncSellerProfileFromStripeAccount(prisma, event.data.object);
    }

    if (
      event.type === "payment_intent.amount_capturable_updated" ||
      event.type === "payment_intent.succeeded"
    ) {
      const intent = event.data.object;
      const jobId = intent.metadata?.kivroJobId;
      if (jobId && intent.status === "requires_capture") {
        await secureCardAuthorizedJob(prisma, jobId, createStripeClient());
      }
    }
  } catch (error) {
    await prisma.stripeWebhookEvent.delete({
      where: { stripeEventId: event.id },
    });
    throw error;
  }

  return { handled: true };
}

export async function createCreditCheckoutSession(
  stripe: Stripe,
  input: {
    customerId: string;
    userId: string;
    amountCents: number;
    successUrl: string;
    cancelUrl: string;
  },
): Promise<{ url: string }> {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: input.customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: input.amountCents,
          product_data: { name: "Kivro marketplace credits" },
        },
        quantity: 1,
      },
    ],
    metadata: {
      kivroUserId: input.userId,
      purpose: "CREDIT_PURCHASE",
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });
  if (!session.url) {
    throw new Error("CHECKOUT_URL_MISSING");
  }
  return { url: session.url };
}

export async function createConnectOnboardingLink(
  stripe: Stripe,
  prisma: PrismaClient,
  sellerProfileId: string,
  refreshUrl: string,
  returnUrl: string,
): Promise<{ url: string; accountId: string }> {
  const profile = await prisma.sellerProfile.findUnique({ where: { id: sellerProfileId } });
  if (!profile) {
    throw new Error("SELLER_NOT_FOUND");
  }
  let accountId = profile.stripeConnectedAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: { transfers: { requested: true } },
      metadata: { kivroSellerProfileId: sellerProfileId },
    });
    accountId = account.id;
    await prisma.sellerProfile.update({
      where: { id: sellerProfileId },
      data: {
        stripeConnectedAccountId: accountId,
        connectOnboardingStatus: "IN_PROGRESS",
      },
    });
  }
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
  return { url: link.url, accountId };
}

export function sellerTransferIdempotencyKey(jobId: string): string {
  return buildLedgerIdempotencyKey(["stripe-transfer", jobId]);
}

export async function syncSellerProfileFromStripeAccount(
  prisma: PrismaClient,
  account: Stripe.Account,
): Promise<void> {
  const profile = await prisma.sellerProfile.findFirst({
    where: { stripeConnectedAccountId: account.id },
  });
  if (!profile) {
    return;
  }
  const transfersStatus = account.capabilities?.transfers;
  const payoutsEnabled = account.payouts_enabled === true;
  let connectOnboardingStatus = profile.connectOnboardingStatus;
  if (account.details_submitted) {
    if (payoutsEnabled && transfersStatus === "active") {
      connectOnboardingStatus = "READY";
    } else if (account.requirements?.disabled_reason) {
      connectOnboardingStatus = "RESTRICTED";
    } else if ((account.requirements?.currently_due?.length ?? 0) > 0) {
      connectOnboardingStatus = "ACTION_REQUIRED";
    } else {
      connectOnboardingStatus = "IN_PROGRESS";
    }
  }
  await prisma.sellerProfile.update({
    where: { id: profile.id },
    data: {
      payoutsEnabled,
      transfersCapabilityStatus: transfersStatus ?? profile.transfersCapabilityStatus,
      connectOnboardingStatus,
      payoutStatus: payoutsEnabled ? "ENABLED" : profile.payoutStatus,
    },
  });
}

export async function createCustomerSetupIntent(
  stripe: Stripe,
  customerId: string,
): Promise<{ clientSecret: string }> {
  const intent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
    usage: "off_session",
  });
  if (!intent.client_secret) {
    throw new Error("SETUP_INTENT_SECRET_MISSING");
  }
  return { clientSecret: intent.client_secret };
}
