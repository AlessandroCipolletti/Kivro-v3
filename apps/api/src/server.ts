import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createCorrelationId, logInfo } from "@kivro/observability";
import { getPrismaClient } from "@kivro/database";
import { authRoutes } from "./routes/auth.js";
import { marketplaceCapabilityRoutes } from "./routes/capabilities.js";
import { sellerAssetRoutes } from "./routes/seller-assets.js";
import { sellerCapabilityRoutes } from "./routes/seller-capabilities.js";
import { buyerAssetRoutes } from "./routes/buyer-assets.js";
import { platformAdminRoutes } from "./routes/platform-admin.js";
import { workerDeviceRoutes } from "./routes/worker-devices.js";
import { buyerJobRoutes, sellerJobRoutes } from "./routes/seller-jobs.js";
import { sellerControlUiRoutes } from "./routes/seller-control-ui.js";
import { workerJobRoutes } from "./routes/worker-jobs.js";
import type { AppEnv } from "./types.js";

export function createApp(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.use("*", async (c, next) => {
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
    return c.json({ name: "kivro-api", phase: "M07" });
  });

  app.route("/auth", authRoutes());
  app.route("/", marketplaceCapabilityRoutes());
  app.route("/seller", sellerCapabilityRoutes());
  app.route("/seller", sellerAssetRoutes());
  app.route("/worker-devices", workerDeviceRoutes());
  app.route("/platform/admin", platformAdminRoutes());
  app.route("/buyer", buyerAssetRoutes());
  app.route("/buyer", buyerJobRoutes());
  app.route("/seller", sellerJobRoutes());
  app.route("/seller", sellerControlUiRoutes());
  app.route("/worker", workerJobRoutes());

  return app;
}

export function startServer(port = Number(process.env.PORT ?? 3001)): void {
  serve({ fetch: createApp().fetch, port });
  logInfo({ correlationId: createCorrelationId(), message: "API listening", port });
}
