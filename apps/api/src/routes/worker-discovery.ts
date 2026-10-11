import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import { buildApiWorkerDiscoveryDocument } from "../services/worker-discovery-document.js";

/** PORT-021 — advertise transport types and connection parameters per control plane. */
export function workerDiscoveryRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.get("/discovery", (c) => {
    const host = c.req.header("x-forwarded-host") ?? c.req.header("host");
    const proto = c.req.header("x-forwarded-proto") ?? "http";
    const configured = process.env.KIVRO_CLOUD_URL;
    const base =
      configured ??
      (host ? `${proto}://${host}` : `http://localhost:${process.env.PORT ?? 3007}`);
    return c.json(buildApiWorkerDiscoveryDocument(base));
  });

  return app;
}
