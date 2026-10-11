import {
  canSellerReceivePaidJobs,
  createConnectOnboardingLink,
  createStripeClient,
  getPriceTierById,
  mapSellerConnectStatus,
  sellerPricingBreakdown,
} from "@kivro/billing";
import { ensureSellerProfile } from "@kivro/capability-publish";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export function sellerBillingRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/billing/connect-status", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    return c.json({
      connectStatus: mapSellerConnectStatus(profile),
      payoutsEnabled: profile.payoutsEnabled,
      canReceivePaidJobs: canSellerReceivePaidJobs(profile),
    });
  });

  app.post("/billing/connect/onboard", async (c) => {
    const stripe = createStripeClient();
    if (!stripe) {
      return c.json({ error: "STRIPE_NOT_CONFIGURED" }, 503);
    }
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const webBase = process.env.WEB_APP_URL ?? "http://localhost:3008";
    let body: { returnUrl?: string; refreshUrl?: string } = {};
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
    const link = await createConnectOnboardingLink(
      stripe,
      getPrismaClient(),
      profile.id,
      body.refreshUrl ?? `${webBase}/seller/payouts/refresh`,
      body.returnUrl ?? `${webBase}/seller/payouts/return`,
    );
    return c.json(link);
  });

  app.get("/billing/pricing-preview/:tierId", (c) => {
    const tier = getPriceTierById(c.req.param("tierId"));
    if (!tier) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({ tier: sellerPricingBreakdown(tier) });
  });

  return app;
}
