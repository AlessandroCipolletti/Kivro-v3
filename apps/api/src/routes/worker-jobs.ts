import {
  parseJobAccepted,
  parseJobCheckpointRecord,
  parseJobPauseAck,
  parseJobResumeAck,
} from "@kivro/contracts";
import { recordJobCheckpoint } from "@kivro/job-control";
import { getPrismaClient } from "@kivro/database";
import { markJobDeliveredAndSettle, reconcileJobPaymentAfterTerminal } from "@kivro/billing";
import {
  acceptJobOffer,
  dispatchJobToWorker,
  markJobRunning,
  recoverWorkerOfflineJob,
  rejectJobOffer,
} from "@kivro/job-dispatch";
import {
  sellerRequestJobPause,
  workerAcknowledgeJobPaused,
  workerAcknowledgeJobResumed,
} from "@kivro/job-control";
import { deriveMarketplaceControlState, parseWorkerHealthReport } from "@kivro/seller-health";
import { sanitizeAuditPayload } from "@kivro/observability";
import type { Prisma } from "@kivro/database";
import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import { randomUUID } from "node:crypto";

function resolveWorkerDeviceId(c: { req: { header: (name: string) => string | undefined } }): string | null {
  return c.req.header("x-worker-device-id") ?? null;
}

export function workerJobRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.post("/poll", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    const prisma = getPrismaClient();
    const device = await prisma.workerDevice.findUnique({
      where: { id: workerDeviceId },
      include: {
        sellerProfile: {
          select: { marketplaceEmergencyPause: true, platformSecurityPause: true },
        },
      },
    });
    if (!device || device.status === "REVOKED") {
      return c.json({ error: "FORBIDDEN" }, 403);
    }
    const report = parseWorkerHealthReport(device.lastHealthReport);
    const marketplaceControl = deriveMarketplaceControlState({
      cloudEmergencyPause: device.sellerProfile.marketplaceEmergencyPause,
      localPauseReported: report?.globalPauseActive === true,
      platformSecurityPause: device.sellerProfile.platformSecurityPause,
    });
    await prisma.workerDevice.update({
      where: { id: device.id },
      data: {
        status: marketplaceControl.dispatchBlocked ? "OFFLINE" : "ONLINE",
        lastSeenAt: new Date(),
      },
    });
    const offers = marketplaceControl.dispatchBlocked
      ? []
      : await prisma.job.findMany({
          where: { workerDeviceId, status: "DISPATCHED" },
          take: 5,
        });
    const controlJobs = await prisma.job.findMany({
      where: {
        workerDeviceId,
        status: { in: ["PAUSE_REQUESTED", "RESUME_REQUESTED"] },
      },
      take: 10,
    });
    const commands: unknown[] = [];
    if (marketplaceControl.requiresLocalPauseSync) {
      commands.push({
        type: "GLOBAL_MARKETPLACE_PAUSE",
        protocolVersion: 1,
        source: "WEB",
        cloudEmergencyPause: marketplaceControl.cloudEmergencyPause,
        requestedAt: new Date().toISOString(),
      });
    }
    for (const job of controlJobs) {
      if (job.status === "PAUSE_REQUESTED" && job.activeControlCommandId) {
        commands.push({
          type: "JOB_PAUSE_REQUEST",
          protocolVersion: 1,
          jobId: job.id,
          commandId: job.activeControlCommandId,
          requestedAt: job.pauseRequestedAt?.toISOString() ?? new Date().toISOString(),
          source: "WEB",
        });
      }
      if (job.status === "RESUME_REQUESTED" && job.activeControlCommandId) {
        commands.push({
          type: "JOB_RESUME_REQUEST",
          protocolVersion: 1,
          jobId: job.id,
          commandId: job.activeControlCommandId,
          requestedAt: new Date().toISOString(),
          source: "WEB",
        });
      }
    }
    return c.json({
      type: "WORKER_POLL",
      protocolVersion: 1,
      offers: offers.map((job) => ({
        protocolVersion: 1,
        jobId: job.id,
        workerId: workerDeviceId,
        capabilityVersionId: job.capabilityVersionId,
        inputManifestId: job.id,
        expiresAt: job.dispatchExpiresAt?.toISOString() ?? new Date(Date.now() + 60_000).toISOString(),
        paymentSecured: true as const,
      })),
      commands,
      marketplaceControl,
    });
  });

  app.post("/jobs/reject", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    let body: { jobId?: string; reason?: string } = {};
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
    if (!body.jobId) {
      return c.json({ error: "JOB_ID_REQUIRED" }, 400);
    }
    const result = await rejectJobOffer(getPrismaClient(), {
      jobId: body.jobId,
      workerDeviceId,
      reason: body.reason,
    });
    if ("error" in result) {
      return c.json(result, 409);
    }
    await reconcileJobPaymentAfterTerminal(getPrismaClient(), body.jobId);
    const { emitBuyerJobWebhookForCurrentStatus } = await import(
      "../services/buyer-webhook-emitter.js"
    );
    await emitBuyerJobWebhookForCurrentStatus(getPrismaClient(), body.jobId);
    return c.json(result);
  });

  app.post("/jobs/accept", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    const body: unknown = await c.req.json();
    const accepted = parseJobAccepted(body);
    if (accepted.workerDeviceId !== workerDeviceId) {
      return c.json({ error: "FORBIDDEN" }, 403);
    }
    const result = await acceptJobOffer(getPrismaClient(), {
      jobId: accepted.jobId,
      workerDeviceId,
    });
    if ("error" in result) {
      return c.json(result, 409);
    }
    return c.json(result);
  });

  app.post("/jobs/:jobId/running", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    const result = await markJobRunning(getPrismaClient(), {
      jobId: c.req.param("jobId"),
      workerDeviceId,
    });
    if ("error" in result) {
      return c.json(result, 409);
    }
    const jobId = c.req.param("jobId") ?? "";
    const { emitBuyerJobWebhook } = await import("../services/buyer-webhook-emitter.js");
    await emitBuyerJobWebhook(getPrismaClient(), jobId, "job.started");
    return c.json(result);
  });

  app.post("/jobs/:jobId/pause-ack", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    const ack = parseJobPauseAck(await c.req.json());
    const result = await workerAcknowledgeJobPaused(getPrismaClient(), {
      jobId: ack.jobId,
      workerDeviceId,
      commandId: ack.commandId,
      localState: ack.localState,
    });
    if ("error" in result) {
      return c.json(result, 409);
    }
    return c.json(result);
  });

  app.post("/jobs/:jobId/resume-ack", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    const ack = parseJobResumeAck(await c.req.json());
    const result = await workerAcknowledgeJobResumed(getPrismaClient(), {
      jobId: ack.jobId,
      workerDeviceId,
      commandId: ack.commandId,
      outcome: ack.resumeOutcome,
    });
    if ("error" in result) {
      return c.json(result, 409);
    }
    return c.json(result);
  });

  app.post("/jobs/:jobId/recover-offline", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    const jobId = c.req.param("jobId");
    const result = await recoverWorkerOfflineJob(getPrismaClient(), jobId);
    if ("error" in result) {
      return c.json(result, 409);
    }
    return c.json(result);
  });

  app.get("/jobs/:jobId/execution-bundle", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    const jobId = c.req.param("jobId");
    const job = await getPrismaClient().job.findUnique({
      where: { id: jobId },
      include: {
        input: true,
        capabilityVersion: { include: { capability: true } },
      },
    });
    if (!job || job.workerDeviceId !== workerDeviceId) {
      return c.json({ error: "FORBIDDEN" }, 403);
    }
    if (!job.input || !job.capabilityVersion.workerManifest) {
      return c.json({ error: "BUNDLE_INCOMPLETE" }, 409);
    }
    return c.json({
      jobId: job.id,
      structuredInput: job.input.structuredInput as Record<string, unknown>,
      workerManifest: job.capabilityVersion.workerManifest,
      sellerProfileId: job.capabilityVersion.capability.sellerProfileId,
    });
  });

  app.post("/jobs/:jobId/dispatch", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    const result = await dispatchJobToWorker(getPrismaClient(), {
      jobId: c.req.param("jobId"),
      workerDeviceId,
      offerExpiresAt: new Date(Date.now() + 5 * 60_000),
    });
    if ("error" in result) {
      return c.json(result, 409);
    }
    return c.json(result);
  });

  app.post("/jobs/:jobId/complete", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    let body: {
      structuredOutput?: unknown;
      outputAssetManifest?: unknown;
      correlationId?: string;
    } = {};
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
    const correlationId = c.req.header("x-correlation-id") ?? body.correlationId;
    if (correlationId) {
      c.header("x-correlation-id", correlationId);
    }
    const deliverables =
      body.structuredOutput !== undefined || body.outputAssetManifest !== undefined
        ? {
            structuredOutput: body.structuredOutput,
            outputAssetManifest: body.outputAssetManifest,
          }
        : undefined;
    if (
      deliverables?.structuredOutput !== undefined &&
      (typeof deliverables.structuredOutput !== "object" ||
        deliverables.structuredOutput === null ||
        Array.isArray(deliverables.structuredOutput))
    ) {
      return c.json({ error: "INVALID_DELIVERABLE_OUTPUT" }, 400);
    }
    const result = await markJobDeliveredAndSettle(getPrismaClient(), {
      jobId: c.req.param("jobId"),
      workerDeviceId,
      deliverables,
    });
    if ("error" in result) {
      return c.json(result, 409);
    }
    const jobId = c.req.param("jobId");
    await getPrismaClient().auditEvent.create({
      data: {
        jobId,
        workerDeviceId,
        type: "JOB_COMPLETED",
        actor: "WORKER",
        correlationId: correlationId ?? undefined,
        sanitizedPayload: sanitizeAuditPayload({
          status: result.status,
          hasDeliverables: Boolean(deliverables),
        }) as Prisma.InputJsonValue,
      },
    });
    const { onOrchestrationJobCompleted } = await import("../services/orchestration-execution.js");
    await onOrchestrationJobCompleted(getPrismaClient(), c.req.param("jobId"));
    const { emitBuyerJobWebhook } = await import("../services/buyer-webhook-emitter.js");
    await emitBuyerJobWebhook(getPrismaClient(), c.req.param("jobId"), "job.completed");
    return c.json(result);
  });

  app.post("/jobs/:jobId/checkpoints", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    const body: unknown = await c.req.json();
    const checkpoint = parseJobCheckpointRecord(body);
    const result = await recordJobCheckpoint(getPrismaClient(), {
      workerDeviceId,
      checkpoint,
    });
    if ("error" in result) {
      return c.json(result, 403);
    }
    return c.json(result);
  });

  app.post("/jobs/:jobId/local-pause", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    const jobId = c.req.param("jobId");
    const commandId = randomUUID();
    const job = await getPrismaClient().job.findUnique({
      where: { id: jobId },
      include: { capabilityVersion: { include: { capability: true } } },
    });
    if (!job || job.workerDeviceId !== workerDeviceId) {
      return c.json({ error: "FORBIDDEN" }, 403);
    }
    const result = await sellerRequestJobPause(getPrismaClient(), {
      jobId,
      sellerProfileId: job.capabilityVersion.capability.sellerProfileId,
      commandId,
      source: "LOCAL_UI",
    });
    if ("error" in result) {
      return c.json(result, 409);
    }
    return c.json({ ...result, cloudSyncPending: false });
  });

  return app;
}
