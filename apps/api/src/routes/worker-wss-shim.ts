import { getPrismaClient } from "@kivro/database";
import { createWssWorkerTransport } from "@kivro/worker-transport";
import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import { handleWorkerTransportFrame } from "../services/worker-transport-frame-handler.js";

/**
 * AWS-profile WSS transport shim (M19): same Worker Protocol semantics over encoded frames.
 * Production WSS upgrade lands in M21; this route proves PORT-024 parity in dev/CI.
 */
export function workerWssShimRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  const decodeTransport = createWssWorkerTransport({
    controlPlaneId: "api",
    workerDeviceId: "decode",
    wssUrl: "wss://shim",
  });

  app.post("/dispatch", async (c) => {
    const workerDeviceId = c.req.header("x-worker-device-id");
    if (!workerDeviceId) {
      return c.text("WORKER_DEVICE_REQUIRED", 401);
    }
    const encoded = await c.req.text();
    const prisma = getPrismaClient();
    const result = await handleWorkerTransportFrame(
      prisma,
      workerDeviceId,
      encoded,
      decodeTransport,
    );
    if ("json" in result) {
      return c.json(result.json, result.status as 200 | 403);
    }
    return c.text(result.text, result.status as 400 | 403);
  });

  return app;
}
