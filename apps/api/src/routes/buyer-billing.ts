import {
  assertDevPaymentShortcutsAllowed,
  createCreditCheckoutSession,
  createCustomerSetupIntent,
  createStripeClient,
  ensureStripeCustomer,
  getBuyerBillingSummary,
  getBuyerCreditBalanceCents,
  grantBuyerCredits,
  listPublicPriceTiers,
  pricingProductPrincipleCopy,
  getPriceTierById,
} from "@kivro/billing";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";
import { randomUUID } from "node:crypto";

export function buyerBillingRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.get("/price-tiers", (c) => c.json({ tiers: listPublicPriceTiers() }));

  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/billing/balance", async (c) => {
    const user = c.get("user");
    const balance = await getBuyerCreditBalanceCents(getPrismaClient(), user.id);
    return c.json({ currency: "USD", ...balance });
  });

  app.get("/billing/summary", async (c) => {
    const user = c.get("user");
    const summary = await getBuyerBillingSummary(getPrismaClient(), user.id);
    return c.json(summary);
  });

  app.get("/billing/pricing-principle/:tierId", (c) => {
    const tier = getPriceTierById(c.req.param("tierId"));
    if (!tier) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json(pricingProductPrincipleCopy(tier));
  });

  app.post("/billing/credits/dev-grant", async (c) => {
    try {
      assertDevPaymentShortcutsAllowed();
    } catch {
      return c.json({ error: "FORBIDDEN" }, 403);
    }
    const user = c.get("user");
    let body: { amountCents?: number } = {};
    try {
      body = await c.req.json<{ amountCents?: number }>();
    } catch {
      body = {};
    }
    const amountCents = body.amountCents ?? 5000;
    if (amountCents <= 0 || amountCents > 1_000_000) {
      return c.json({ error: "INVALID_AMOUNT" }, 400);
    }
    const result = await grantBuyerCredits(getPrismaClient(), {
      buyerId: user.id,
      amountCents,
      externalId: `dev-${randomUUID()}`,
    });
    const balance = await getBuyerCreditBalanceCents(getPrismaClient(), user.id);
    return c.json({ ...result, balance });
  });

  app.post("/billing/payment-method/setup-intent", async (c) => {
    const stripe = createStripeClient();
    if (!stripe) {
      return c.json({ error: "STRIPE_NOT_CONFIGURED" }, 503);
    }
    const user = c.get("user");
    const customerId = await ensureStripeCustomer(stripe, getPrismaClient(), user.id, user.email);
    const setup = await createCustomerSetupIntent(stripe, customerId);
    return c.json(setup);
  });

  app.post("/billing/credits/checkout", async (c) => {
    const stripe = createStripeClient();
    if (!stripe) {
      return c.json({ error: "STRIPE_NOT_CONFIGURED" }, 503);
    }
    const user = c.get("user");
    let body: { amountCents?: number; successUrl?: string; cancelUrl?: string } = {};
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
    const amountCents = body.amountCents ?? 2000;
    if (amountCents < 100) {
      return c.json({ error: "INVALID_AMOUNT" }, 400);
    }
    const webBase = process.env.WEB_APP_URL ?? "http://localhost:3008";
    const customerId = await ensureStripeCustomer(stripe, getPrismaClient(), user.id, user.email);
    const session = await createCreditCheckoutSession(stripe, {
      customerId,
      userId: user.id,
      amountCents,
      successUrl: body.successUrl ?? `${webBase}/billing/success`,
      cancelUrl: body.cancelUrl ?? `${webBase}/billing/cancel`,
    });
    return c.json(session);
  });

  return app;
}
