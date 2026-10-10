import { getPrismaClient } from "@kivro/database";
import { buildWorkerHealthReport, type WorkerHealthReport } from "@kivro/seller-health";
import { applyWorkerHeartbeat } from "../services/worker-heartbeat-service.js";
import { gateWorkerCloudHandshake } from "../services/worker-compatibility-gate.js";
import { Hono } from "hono";
import type { AppEnv } from "../types.js";

function resolveWorkerDeviceId(c: { req: { header: (name: string) => string | undefined } }): string | null {
  return c.req.header("x-worker-device-id") ?? null;
}

export function workerHealthRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.post("/heartbeat", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    const body = await c.req.json<Partial<WorkerHealthReport> & { protocolVersion?: number }>();
    const handshake = gateWorkerCloudHandshake({
      protocolVersion: body.protocolVersion,
      workerVersion: body.workerVersion,
    });
    if (!handshake.ok) {
      return c.json(handshake.body, handshake.httpStatus);
    }
    const report = buildWorkerHealthReport({
      workerVersion: body.workerVersion ?? "unknown",
      openClawVersion: body.openClawVersion ?? null,
      dockerOk: body.dockerOk === true,
      sandboxOk: body.sandboxOk === true,
      openClawInstalled: body.openClawInstalled === true,
      openClawCompatible: body.openClawCompatible === true,
      globalPauseActive: body.globalPauseActive === true,
      cloudConnectionOk: true,
    });
    const result = await applyWorkerHeartbeat(getPrismaClient(), { workerDeviceId, report });
    if ("error" in result) {
      return c.json({ error: result.error }, 403);
    }
    return c.json({
      ok: true,
      healthLabel: result.healthLabel,
      blocking: result.blocking,
      warnings: result.warnings,
      marketplaceControl: result.marketplaceControl,
      platformSecurityPause: result.platformSecurityPause,
    });
  });

  return app;
}
