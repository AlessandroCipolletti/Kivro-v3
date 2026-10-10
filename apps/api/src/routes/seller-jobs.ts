import { ensureSellerProfile } from "@kivro/capability-publish";
import { getPrismaClient } from "@kivro/database";
import {
  buyerVisibleJobStatus,
  enforcePauseDurationTimeout,
  listJobCheckpoints,
  rejectBuyerJobControl,
  sellerRequestJobCancel,
  sellerRequestJobPause,
  sellerRequestJobResume,
} from "@kivro/job-control";
import { isPausableExecutionStatus, type JobStatus } from "@kivro/domain";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";
import { reconcileJobPaymentAfterTerminal } from "@kivro/billing";
import {
  buyerCancelScheduledOrQueuedJob,
  resolveBuyerSchedulingPhase,
} from "@kivro/job-scheduling";
import { randomUUID } from "node:crypto";
import { parseWorkerManifest } from "@kivro/contracts";
import { buildSellerJobExecutionView } from "@kivro/seller-experience";

export function sellerJobRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/jobs/:jobId/execution", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const job = await getPrismaClient().job.findFirst({
      where: {
        id: c.req.param("jobId"),
        capabilityVersion: { capability: { sellerProfileId: profile.id } },
      },
      include: {
        input: true,
        capabilityVersion: { include: { capability: true } },
      },
    });
    if (!job) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const structuredInput =
      job.input?.structuredInput && typeof job.input.structuredInput === "object"
        ? (job.input.structuredInput as Record<string, unknown>)
        : {};
    const manifest = job.capabilityVersion.workerManifest
      ? parseWorkerManifest(job.capabilityVersion.workerManifest)
      : null;
    return c.json(
      buildSellerJobExecutionView({
        jobId: job.id,
        buyerId: job.buyerId,
        sellerProfileId: profile.id,
        structuredInput,
        workerManifest: manifest,
        status: job.status,
        capabilitySlug: job.capabilityVersion.capability.slug,
      }),
    );
  });

  app.get("/jobs/running", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const prisma = getPrismaClient();
    const jobs = await prisma.job.findMany({
      where: {
        status: {
          in: [
            "STARTING",
            "RUNNING",
            "PAUSE_REQUESTED",
            "PAUSED",
            "RESUME_REQUESTED",
            "SECURITY_PAUSED",
            "UPLOADING_RESULT",
          ],
        },
        capabilityVersion: { capability: { sellerProfileId: profile.id } },
      },
      orderBy: { startedAt: "desc" },
      include: {
        capabilityVersion: { include: { capability: true } },
        checkpoints: { orderBy: { recordedAt: "desc" }, take: 1 },
      },
    });
    const now = Date.now();
    return c.json({
      jobs: jobs.map((job) => {
        const elapsedMs = job.startedAt ? now - job.startedAt.getTime() : null;
        const latest = job.checkpoints[0];
        return {
          id: job.id,
          status: job.status,
          capabilitySlug: job.capabilityVersion.capability.slug,
          startedAt: job.startedAt?.toISOString() ?? null,
          elapsedMinutes: elapsedMs != null ? Math.floor(elapsedMs / 60_000) : null,
          pauseSupportMode: job.pauseSupportMode,
          currentStage: latest?.stageLabel ?? null,
          uiStatus:
            job.status === "PAUSE_REQUESTED"
              ? "Pause requested…"
              : job.status === "PAUSED"
                ? "Paused"
                : job.status,
        };
      }),
    });
  });

  app.post("/jobs/:jobId/pause", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const jobId = c.req.param("jobId");
    let body: { reason?: string; commandId?: string } = {};
    try {
      body = await c.req.json<{ reason?: string; commandId?: string }>();
    } catch {
      body = {};
    }
    const commandId = body.commandId ?? randomUUID();
    const result = await sellerRequestJobPause(getPrismaClient(), {
      jobId,
      sellerProfileId: profile.id,
      commandId,
      source: "WEB",
      reason: body.reason,
    });
    if ("error" in result) {
      const status = result.error === "FORBIDDEN" ? 403 : 409;
      return c.json({ error: result.error }, status);
    }
    return c.json(result);
  });

  app.post("/jobs/:jobId/resume", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const jobId = c.req.param("jobId");
    let body: { commandId?: string; confirmGlobalPauseOverride?: boolean } = {};
    try {
      body = await c.req.json<{ commandId?: string; confirmGlobalPauseOverride?: boolean }>();
    } catch {
      body = {};
    }
    const commandId = body.commandId ?? randomUUID();
    const globalPauseActive = process.env.KIVRO_SELLER_GLOBAL_PAUSE === "true";
    const result = await sellerRequestJobResume(getPrismaClient(), {
      jobId,
      sellerProfileId: profile.id,
      commandId,
      source: "WEB",
      globalPauseActive,
      confirmGlobalPauseOverride: body.confirmGlobalPauseOverride,
    });
    if ("error" in result) {
      const status =
        result.error === "FORBIDDEN"
          ? 403
          : result.error === "GLOBAL_PAUSE_CONFIRMATION_REQUIRED"
            ? 409
            : 409;
      return c.json({ error: result.error }, status);
    }
    return c.json(result);
  });

  app.post("/jobs/:jobId/cancel", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const jobId = c.req.param("jobId");
    let body: { reason?: string; commandId?: string } = {};
    try {
      body = await c.req.json<{ reason?: string; commandId?: string }>();
    } catch {
      body = {};
    }
    const result = await sellerRequestJobCancel(getPrismaClient(), {
      jobId,
      sellerProfileId: profile.id,
      commandId: body.commandId ?? randomUUID(),
      source: "WEB",
      reason: body.reason,
    });
    if ("error" in result) {
      return c.json({ error: result.error }, result.error === "FORBIDDEN" ? 403 : 409);
    }
    await reconcileJobPaymentAfterTerminal(getPrismaClient(), jobId);
    const { emitBuyerJobWebhookForCurrentStatus } = await import(
      "../services/buyer-webhook-emitter.js"
    );
    await emitBuyerJobWebhookForCurrentStatus(getPrismaClient(), jobId);
    return c.json(result);
  });

  app.get("/jobs/:jobId/checkpoints", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const result = await listJobCheckpoints(getPrismaClient(), c.req.param("jobId"), profile.id);
    if ("error" in result) {
      return c.json({ error: result.error }, 403);
    }
    return c.json(result);
  });

  app.get("/jobs/:jobId", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const job = await getPrismaClient().job.findUnique({
      where: { id: c.req.param("jobId") },
      include: { capabilityVersion: { include: { capability: true } } },
    });
    if (!job || job.capabilityVersion.capability.sellerProfileId !== profile.id) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    await enforcePauseDurationTimeout(getPrismaClient(), job.id);
    const refreshed = await getPrismaClient().job.findUnique({ where: { id: job.id } });
    return c.json({ job: refreshed });
  });

  return app;
}

export function buyerJobRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.post("/jobs/:jobId/pause", (c) => c.json(rejectBuyerJobControl(), 403));

  app.post("/jobs/:jobId/resume", (c) => c.json(rejectBuyerJobControl(), 403));

  app.get("/jobs/:jobId/status", async (c) => {
    const user = c.get("user");
    const job = await getPrismaClient().job.findUnique({ where: { id: c.req.param("jobId") } });
    if (!job || job.buyerId !== user.id) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const status: JobStatus = job.status;
    const visible = buyerVisibleJobStatus(status, {
      scheduledRunAt: job.scheduledRunAt,
      scheduleWaitDeadlineAt: job.scheduleWaitDeadlineAt,
      scheduleAdjustedAt: job.scheduleAdjustedAt,
    });
    const schedulingPhase = resolveBuyerSchedulingPhase({
      status: job.status,
      scheduledRunAt: job.scheduledRunAt,
    });
    return c.json({
      jobId: job.id,
      status: job.status,
      buyerVisible: visible,
      schedulingPhase,
      scheduledRunAt: job.scheduledRunAt?.toISOString() ?? null,
      scheduleWaitDeadlineAt: job.scheduleWaitDeadlineAt?.toISOString() ?? null,
      scheduleAdjustedAt: job.scheduleAdjustedAt?.toISOString() ?? null,
      pausable: isPausableExecutionStatus(status),
    });
  });

  app.post("/jobs/:jobId/cancel", async (c) => {
    const user = c.get("user");
    let body: { reason?: string } = {};
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
    const result = await buyerCancelScheduledOrQueuedJob(getPrismaClient(), {
      jobId: c.req.param("jobId"),
      buyerId: user.id,
      reason: body.reason,
    });
    if ("error" in result) {
      const status = result.error === "NOT_FOUND" ? 404 : 409;
      return c.json({ error: result.error }, status);
    }
    const jobId = c.req.param("jobId");
    await reconcileJobPaymentAfterTerminal(getPrismaClient(), jobId);
    const { emitBuyerJobWebhookForCurrentStatus } = await import(
      "../services/buyer-webhook-emitter.js"
    );
    await emitBuyerJobWebhookForCurrentStatus(getPrismaClient(), jobId);
    return c.json(result);
  });

  return app;
}
