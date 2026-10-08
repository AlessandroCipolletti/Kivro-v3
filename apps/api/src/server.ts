import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createCorrelationId, logInfo } from "@kivro/observability";

export function createApp(): Hono {
  const app = new Hono();

  app.use("*", async (c, next) => {
    const correlationId =
      c.req.header("x-correlation-id") ?? createCorrelationId();
    await next();
    c.header("x-correlation-id", correlationId);
  });

  app.get("/health/live", (c) => c.json({ status: "live" }));

  app.get("/health/ready", (c) =>
    c.json({ status: "ready", checks: { bootstrap: true } }),
  );

  app.get("/", (c) => {
    const correlationId = c.req.header("x-correlation-id") ?? createCorrelationId();
    logInfo({
      correlationId,
      message: "Kivro API bootstrap",
    });
    return c.json({ name: "kivro-api", phase: "M00" });
  });

  return app;
}

export function startServer(port = Number(process.env.PORT ?? 3001)): void {
  serve({ fetch: createApp().fetch, port });
  logInfo({ correlationId: createCorrelationId(), message: "API listening", port });
}
