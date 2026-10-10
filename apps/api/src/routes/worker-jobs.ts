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
  gateWorkerJobOnControlPlane,
  markJobRunning,
  recoverWorkerOfflineJob,
  rejectJobOffer,
} from "@kivro/job-dispatch";
import {
  sellerRequestJobPause,
  workerAcknowledgeJobPaused,
  workerAcknowledgeJobResumed,
} from "@kivro/job-control";
import { executeWorkerPoll } from "../services/worker-poll-service.js";
import { resolveWorkerRequestControlPlane } from "../services/worker-control-plane-context.js";
import { dispatchJobToWorkerWithProfileSignal } from "../services/cloud-dispatch-hook.js";
import { sanitizeAuditPayload } from "@kivro/observability";
import { gateWorkerCloudHandshake } from "../services/worker-compatibility-gate.js";
import type { Prisma } from "@kivro/database";
import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import { randomUUID } from "node:crypto";

function resolveWorkerDeviceId(c: { req: { header: (name: string) => string | undefined } }): string | null {
  return c.req.header("x-worker-device-id") ?? null;
}

async function authorizeWorkerJobOnRequestControlPlane(
  jobId: string,
  workerDeviceId: string,
  controlPlaneHeader: string | undefined,
): Promise<
  | { job: { id: string; executionControlPlaneId: string | null } }
  | { error: string; httpStatus: 403 | 409 }
> {
  const job = await getPrismaClient().job.findUnique({ where: { id: jobId } });
  if (!job || job.workerDeviceId !== workerDeviceId) {
    return { error: "FORBIDDEN", httpStatus: 403 };
  }
  const cp = resolveWorkerRequestControlPlane(controlPlaneHeader);
  const cpBlock = gateWorkerJobOnControlPlane(job, cp);
  if (cpBlock) {
    return { error: cpBlock.error, httpStatus: 409 };
  }
  return { job };
}

export function workerJobRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.post("/poll", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    const protocolHeader = c.req.header("x-kivro-protocol-version");
    const protocolVersion = protocolHeader ? Number.parseInt(protocolHeader, 10) : undefined;
    const handshake = gateWorkerCloudHandshake({
      protocolVersion: Number.isFinite(protocolVersion) ? protocolVersion : undefined,
      env: process.env,
    });
    if (!handshake.ok) {
      return c.json(handshake.body, handshake.httpStatus);
    }
    const cp = resolveWorkerRequestControlPlane(c.req.header("x-kivro-control-plane-id"));
    const poll = await executeWorkerPoll(getPrismaClient(), workerDeviceId, cp);
    if ("error" in poll) {
      return c.json({ error: poll.error }, 403);
    }
    return c.json(poll);
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
    const cp = resolveWorkerRequestControlPlane(c.req.header("x-kivro-control-plane-id"));
    const result = await rejectJobOffer(getPrismaClient(), {
      jobId: body.jobId,
      workerDeviceId,
      reason: body.reason,
      controlPlane: cp,
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
    const cp = resolveWorkerRequestControlPlane(c.req.header("x-kivro-control-plane-id"));
    const result = await acceptJobOffer(getPrismaClient(), {
      jobId: accepted.jobId,
      workerDeviceId,
      controlPlane: cp,
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
    const cp = resolveWorkerRequestControlPlane(c.req.header("x-kivro-control-plane-id"));
    const result = await markJobRunning(getPrismaClient(), {
      jobId: c.req.param("jobId"),
      workerDeviceId,
      controlPlane: cp,
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
    const auth = await authorizeWorkerJobOnRequestControlPlane(
      jobId,
      workerDeviceId,
      c.req.header("x-kivro-control-plane-id"),
    );
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.httpStatus);
    }
    const job = await getPrismaClient().job.findUnique({
      where: { id: jobId },
      include: {
        input: true,
        capabilityVersion: { include: { capability: true } },
      },
    });
    if (!job || !job.input || !job.capabilityVersion.workerManifest) {
      return c.json({ error: job ? "BUNDLE_INCOMPLETE" : "FORBIDDEN" }, job ? 409 : 403);
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
    const result = await dispatchJobToWorkerWithProfileSignal(getPrismaClient(), {
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
    const jobId = c.req.param("jobId");
    const auth = await authorizeWorkerJobOnRequestControlPlane(
      jobId,
      workerDeviceId,
      c.req.header("x-kivro-control-plane-id"),
    );
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.httpStatus);
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
      jobId,
      workerDeviceId,
      deliverables,
    });
    if ("error" in result) {
      if (result.error === "RESULT_REJECTED") {
        await reconcileJobPaymentAfterTerminal(getPrismaClient(), jobId);
        try {
          const { emitBuyerJobWebhookForCurrentStatus } = await import(
            "../services/buyer-webhook-emitter.js"
          );
          await emitBuyerJobWebhookForCurrentStatus(getPrismaClient(), jobId);
        } catch {
          /* ASYNC-021 */
        }
      }
      return c.json(result, 409);
    }
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
    await onOrchestrationJobCompleted(getPrismaClient(), jobId);
    if (result.status === "COMPLETED") {
      const { enqueueJobTerminalEmailNotification } = await import("@kivro/job-delivery");
      await enqueueJobTerminalEmailNotification(getPrismaClient(), jobId);
    }
    try {
      const { emitBuyerJobWebhook } = await import("../services/buyer-webhook-emitter.js");
      await emitBuyerJobWebhook(getPrismaClient(), jobId, "job.completed");
    } catch {
      // ASYNC-021 — notification failure must not roll back completion.
    }
    return c.json(result);
  });

  app.post("/jobs/:jobId/checkpoints", async (c) => {
    const workerDeviceId = resolveWorkerDeviceId(c);
    if (!workerDeviceId) {
      return c.json({ error: "WORKER_DEVICE_REQUIRED" }, 401);
    }
    const jobId = c.req.param("jobId");
    const auth = await authorizeWorkerJobOnRequestControlPlane(
      jobId,
      workerDeviceId,
      c.req.header("x-kivro-control-plane-id"),
    );
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.httpStatus);
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
