import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createCorrelationId, logInfo } from "@kivro/observability";
import { getActiveCloudComposition, resolveCloudComposition } from "./cloud-composition.js";
import { getPrismaClient } from "@kivro/database";
import { authRoutes, googleOAuthRoutes } from "./routes/auth.js";
import { marketplaceCapabilityRoutes } from "./routes/capabilities.js";
import { sellerAssetRoutes } from "./routes/seller-assets.js";
import { sellerCapabilityRoutes } from "./routes/seller-capabilities.js";
import { sellerOnboardingRoutes } from "./routes/seller-onboarding.js";
import { buyerAssetRoutes } from "./routes/buyer-assets.js";
import { platformAdminRoutes } from "./routes/platform-admin.js";
import { platformCronRoutes } from "./routes/platform-cron.js";
import { workerDeviceRoutes } from "./routes/worker-devices.js";
import { buyerJobRoutes, sellerJobRoutes } from "./routes/seller-jobs.js";
import { sellerControlUiRoutes } from "./routes/seller-control-ui.js";
import { workerJobRoutes } from "./routes/worker-jobs.js";
import { buyerBillingRoutes } from "./routes/buyer-billing.js";
import { buyerExperienceRoutes } from "./routes/buyer-experience.js";
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
import { buyerJobHistoryRoutes } from "./routes/buyer-job-history.js";
import { sellerDashboardRoutes } from "./routes/seller-dashboard.js";
import { sellerOperationsRoutes } from "./routes/seller-operations.js";
import { sellerWorkerRoutes } from "./routes/seller-workers.js";
import { sellerVisibilityRoutes } from "./routes/seller-visibility.js";
import { workerHealthRoutes } from "./routes/worker-health.js";
import { workerWssShimRoutes } from "./routes/worker-wss-shim.js";
import { workerDiscoveryRoutes } from "./routes/worker-discovery.js";
import { attachWorkerWssServer } from "./worker-wss-server.js";
import { buyerApiKeyRoutes } from "./routes/buyer-api-keys.js";
import { buyerWebhookManageRoutes } from "./routes/buyer-webhooks-manage.js";
import { v1BuyerApiRoutes } from "./routes/v1-buyer-api.js";
import { abuseReportRoutes } from "./routes/abuse-reports.js";
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
        "Content-Type, x-correlation-id, x-worker-device-id, Authorization, Idempotency-Key",
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
    const { probeObjectStorageHealth } = await import("@kivro/storage");
    const objectStorageProbe = await probeObjectStorageHealth();
    const objectStorage =
      objectStorageProbe === null ? null : objectStorageProbe;
    let redis = false;
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        const { hostname, port } = new URL(redisUrl);
        const net = await import("node:net");
        redis = await new Promise((resolve) => {
          const s = net.createConnection(
            { host: hostname === "localhost" ? "127.0.0.1" : hostname, port: Number(port || 6379) },
            () => {
              s.end();
              resolve(true);
            },
          );
          s.on("error", () => resolve(false));
        });
      } catch {
        redis = false;
      }
    }
    const storageOk = objectStorage === null || objectStorage === true;
    const ready = db && storageOk;
    const composition = getActiveCloudComposition();
    const sqsConfigured = Boolean(process.env.AWS_SQS_DURABLE_WORK_QUEUE_URL?.trim());
    return c.json(
      {
        status: ready ? "ready" : "degraded",
        checks: {
          database: db,
          objectStorage,
          redis: redisUrl ? redis : null,
          sqsFanOut: composition.profile === "aws" ? sqsConfigured : null,
        },
        cloudProfile: composition.profile,
        workerTransport: composition.workerTransport.kind,
        durableWorkProfile: composition.durableWorkProfile,
        apiContractVersion: composition.apiContractVersion,
      },
      ready ? 200 : 503,
    );
  });

  app.get("/", (c) => {
    const correlationId = c.req.header("x-correlation-id") ?? createCorrelationId();
    logInfo({
      correlationId,
      message: "Kivro API",
    });
    const composition = getActiveCloudComposition();
    return c.json({
      name: "kivro-api",
      cloudProfile: composition.profile,
      apiContractVersion: composition.apiContractVersion,
      workerTransport: composition.workerTransport.kind,
    });
  });

  app.route("/auth", authRoutes());
  app.route("/api/users/auth", googleOAuthRoutes());
  app.route("/", marketplaceRoutes());
  app.route("/", marketplaceSellerRoutes());
  app.route("/", marketplaceCapabilityRoutes());
  app.route("/", capabilityReviewRoutes());
  app.route("/", capabilityAvailabilityRoutes());
  app.route("/seller", sellerCapabilityRoutes());
  app.route("/seller", sellerOnboardingRoutes());
  app.route("/seller", sellerScheduleRoutes());
  app.route("/seller", sellerAssetRoutes());
  app.route("/worker-devices", workerDeviceRoutes());
  app.route("/platform/admin", platformAdminRoutes());
  app.route("/platform/cron", platformCronRoutes());
  app.route("/buyer", buyerAssetRoutes());
  app.route("/buyer", buyerBillingRoutes());
  app.route("/buyer/experience", buyerExperienceRoutes());
  app.route("/buyer", buyerJobSubmitRoutes());
  app.route("/buyer", buyerJobsListRoutes());
  app.route("/buyer", buyerJobAssetRoutes());
  app.route("/buyer", buyerJobHistoryRoutes());
  app.route("/buyer", buyerFavoritesRoutes());
  app.route("/buyer", buyerApiKeyRoutes());
  app.route("/buyer", buyerWebhookManageRoutes());
  app.route("/buyer", abuseReportRoutes());
  app.route("/v1", v1BuyerApiRoutes());
  app.route("/", marketplaceAgentRoutes());
  app.route("/", marketplaceAgentToolRoutes());
  app.route("/buyer", buyerJobRoutes());
  app.route("/seller", sellerBillingRoutes());
  app.route("/seller", sellerJobRoutes());
  app.route("/seller", sellerControlUiRoutes());
  app.route("/seller", sellerDashboardRoutes());
  app.route("/seller", sellerOperationsRoutes());
  app.route("/seller", sellerWorkerRoutes());
  app.route("/seller", sellerVisibilityRoutes());
  app.route("/worker", workerJobRoutes());
  app.route("/worker", workerHealthRoutes());
  app.route("/worker", workerDiscoveryRoutes());
  app.route("/worker/wss", workerWssShimRoutes());
  app.route("/webhooks", stripeWebhookRoutes());

  return app;
}

export function startServer(port = Number(process.env.PORT ?? 3001)): void {
  const composition = resolveCloudComposition(process.env.KIVRO_CLOUD_PROFILE);
  const server = serve({ fetch: createApp().fetch, port });
  attachWorkerWssServer(server as import("node:http").Server);
  logInfo({
    correlationId: createCorrelationId(),
    message: "API listening",
    port,
    cloudProfile: composition.profile,
    workerTransport: composition.workerTransport.kind,
    durableWorkProfile: composition.durableWorkProfile,
    objectStorageProfile: composition.objectStorageProfile,
  });
}
