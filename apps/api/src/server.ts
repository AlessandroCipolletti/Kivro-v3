import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createCorrelationId, logInfo } from "@kivro/observability";
import { getPrismaClient } from "@kivro/database";
import { authRoutes, googleOAuthRoutes } from "./routes/auth.js";
import { marketplaceCapabilityRoutes } from "./routes/capabilities.js";
import { sellerAssetRoutes } from "./routes/seller-assets.js";
import { sellerCapabilityRoutes } from "./routes/seller-capabilities.js";
import { buyerAssetRoutes } from "./routes/buyer-assets.js";
import { platformAdminRoutes } from "./routes/platform-admin.js";
import { workerDeviceRoutes } from "./routes/worker-devices.js";
import { buyerJobRoutes, sellerJobRoutes } from "./routes/seller-jobs.js";
import { sellerControlUiRoutes } from "./routes/seller-control-ui.js";
import { workerJobRoutes } from "./routes/worker-jobs.js";
import { buyerBillingRoutes } from "./routes/buyer-billing.js";
import { buyerJobSubmitRoutes } from "./routes/buyer-jobs-submit.js";
import { sellerBillingRoutes } from "./routes/seller-billing.js";
import { stripeWebhookRoutes } from "./routes/stripe-webhooks.js";
import { sellerScheduleRoutes } from "./routes/seller-schedule.js";
import { capabilityAvailabilityRoutes } from "./routes/capability-availability.js";
import { marketplaceRoutes } from "./routes/marketplace.js";
import { buyerFavoritesRoutes } from "./routes/buyer-favorites.js";
import { buyerJobsListRoutes } from "./routes/buyer-jobs-list.js";
import { marketplaceSellerRoutes } from "./routes/marketplace-sellers.js";
import { capabilityReviewRoutes } from "./routes/capability-reviews.js";
import { marketplaceAgentRoutes } from "./routes/marketplace-agent.js";
import { marketplaceAgentToolRoutes } from "./routes/marketplace-agent-tools.js";
import { buyerJobAssetRoutes } from "./routes/buyer-job-assets.js";
import { sellerDashboardRoutes } from "./routes/seller-dashboard.js";
import { workerHealthRoutes } from "./routes/worker-health.js";
import type { AppEnv } from "./types.js";

function webAppOrigin(): string {
  return process.env.WEB_APP_URL ?? "http://localhost:3000";
}

export function createApp(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.use("*", async (c, next) => {
    const origin = c.req.header("Origin");
    const allowed = webAppOrigin();
    if (origin === allowed) {
      c.header("Access-Control-Allow-Origin", allowed);
      c.header("Access-Control-Allow-Credentials", "true");
      c.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      c.header(
        "Access-Control-Allow-Headers",
        "Content-Type, x-correlation-id, x-worker-device-id",
      );
    }
    if (c.req.method === "OPTIONS") {
      return c.body(null, 204);
    }
    const correlationId =
      c.req.header("x-correlation-id") ?? createCorrelationId();
    await next();
    c.header("x-correlation-id", correlationId);
  });

  app.get("/health/live", (c) => c.json({ status: "live" }));

  app.get("/health/ready", async (c) => {
    let db = false;
    try {
      await getPrismaClient().$queryRaw`SELECT 1`;
      db = true;
    } catch {
      db = false;
    }
    const ready = db;
    return c.json(
      { status: ready ? "ready" : "degraded", checks: { database: db } },
      ready ? 200 : 503,
    );
  });

  app.get("/", (c) => {
    const correlationId = c.req.header("x-correlation-id") ?? createCorrelationId();
    logInfo({
      correlationId,
      message: "Kivro API",
    });
    return c.json({ name: "kivro-api", phase: "M12" });
  });

  app.route("/auth", authRoutes());
  app.route("/api/users/auth", googleOAuthRoutes());
  app.route("/", marketplaceRoutes());
  app.route("/", marketplaceSellerRoutes());
  app.route("/", marketplaceCapabilityRoutes());
  app.route("/", capabilityReviewRoutes());
  app.route("/", capabilityAvailabilityRoutes());
  app.route("/seller", sellerCapabilityRoutes());
  app.route("/seller", sellerScheduleRoutes());
  app.route("/seller", sellerAssetRoutes());
  app.route("/worker-devices", workerDeviceRoutes());
  app.route("/platform/admin", platformAdminRoutes());
  app.route("/buyer", buyerAssetRoutes());
  app.route("/buyer", buyerBillingRoutes());
  app.route("/buyer", buyerJobSubmitRoutes());
  app.route("/buyer", buyerJobsListRoutes());
  app.route("/buyer", buyerJobAssetRoutes());
  app.route("/buyer", buyerFavoritesRoutes());
  app.route("/", marketplaceAgentRoutes());
  app.route("/", marketplaceAgentToolRoutes());
  app.route("/buyer", buyerJobRoutes());
  app.route("/seller", sellerBillingRoutes());
  app.route("/seller", sellerJobRoutes());
  app.route("/seller", sellerControlUiRoutes());
  app.route("/seller", sellerDashboardRoutes());
  app.route("/worker", workerJobRoutes());
  app.route("/worker", workerHealthRoutes());
  app.route("/webhooks", stripeWebhookRoutes());

  return app;
}

export function startServer(port = Number(process.env.PORT ?? 3001)): void {
  serve({ fetch: createApp().fetch, port });
  logInfo({ correlationId: createCorrelationId(), message: "API listening", port });
}
