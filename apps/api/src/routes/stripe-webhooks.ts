import { createStripeClient, handleStripeWebhookEvent, verifyStripeWebhook } from "@kivro/billing";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";

export function stripeWebhookRoutes(): Hono {
  const app = new Hono();

  app.post("/stripe", async (c) => {
    const stripe = createStripeClient();
    if (!stripe) {
      return c.json({ error: "STRIPE_NOT_CONFIGURED" }, 503);
    }
    const signature = c.req.header("stripe-signature");
    if (!signature) {
      return c.json({ error: "SIGNATURE_REQUIRED" }, 400);
    }
    const payload = await c.req.text();
    let event;
    try {
      event = verifyStripeWebhook(stripe, payload, signature);
    } catch {
      return c.json({ error: "INVALID_SIGNATURE" }, 400);
    }
    const result = await handleStripeWebhookEvent(getPrismaClient(), event);
    return c.json(result);
  });

  return app;
}
