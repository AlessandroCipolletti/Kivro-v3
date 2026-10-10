import {
  reconcileJobPaymentAfterTerminal,
  sweepPendingSellerTransfers,
  sweepStaleJobPaymentReservations,
} from "@kivro/billing";
import { getPrismaClient } from "@kivro/database";
import { sweepExpiredJobPauses } from "@kivro/job-control";
import { retryDueWebhookDeliveries } from "@kivro/buyer-webhooks";
import { runSchedulingSweeps } from "@kivro/job-scheduling";
import { aggregateInferenceUsage, buildInferenceUsageRecord, readPlatformInferenceHealth, routingChangeAudit } from "@kivro/marketplace-agent";
import {
  assertAdminToken,
  isGlobalDispatchEnabled,
  setGlobalDispatchEnabled,
} from "@kivro/platform-policy";
import { collectCloudMetricsSnapshot, collectWorkerFleetMetrics } from "@kivro/observability";
import { runJobFailureOperationsSweeps } from "@kivro/job-failure";
import { suspendBuyerAccount } from "@kivro/abuse-controls";
import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { readControlPlaneRegistry, resolveActiveControlPlaneIdForNewExecutions } from "@kivro/cloud-core";
import { getActiveCloudComposition } from "../cloud-composition.js";

export function platformAdminRoutes(): Hono {
  const app = new Hono();

  app.get("/control-planes", (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const composition = getActiveCloudComposition();
    let activeForNewExecutions: string | null = null;
    try {
      activeForNewExecutions = resolveActiveControlPlaneIdForNewExecutions(process.env);
    } catch {
      activeForNewExecutions = null;
    }
    return c.json({
      cloudProfile: composition.profile,
      controlPlanes: readControlPlaneRegistry(process.env),
      activeForNewExecutions,
    });
  });

  app.get("/dispatch", (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    return c.json({ dispatchEnabled: isGlobalDispatchEnabled() });
  });

  app.post("/dispatch", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const body = await c.req.json<{ enabled?: boolean }>();
    if (typeof body.enabled !== "boolean") {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    try {
      setGlobalDispatchEnabled(body.enabled);
    } catch (err) {
      const message = err instanceof Error ? err.message : "DISPATCH_TOGGLE_FAILED";
      return c.json({ error: message }, 403);
    }
    return c.json({ dispatchEnabled: isGlobalDispatchEnabled() });
  });

  app.post("/payments/sweep-stale-reservations", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const result = await sweepStaleJobPaymentReservations(getPrismaClient());
    return c.json(result);
  });

  app.post("/payments/sweep-pending-transfers", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const result = await sweepPendingSellerTransfers(getPrismaClient());
    return c.json(result);
  });

  app.post("/jobs/promote-scheduled", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const prisma = getPrismaClient();
    const result = await runSchedulingSweeps(prisma);
    const expiredJobs = await prisma.job.findMany({
      where: { status: "EXPIRED", reservedAmountCents: { gt: 0 } },
      take: 50,
    });
    let paymentsReleased = 0;
    for (const job of expiredJobs) {
      const reconciled = await reconcileJobPaymentAfterTerminal(prisma, job.id);
      if (reconciled.released) {
        paymentsReleased += 1;
      }
    }
    for (const jobId of result.queueCancelledJobIds) {
      const reconciled = await reconcileJobPaymentAfterTerminal(prisma, jobId);
      if (reconciled.released) {
        paymentsReleased += 1;
      }
    }
    const failureOps = await runJobFailureOperationsSweeps(prisma);
    for (const jobId of failureOps.lostWorker.jobIds) {
      const reconciled = await reconcileJobPaymentAfterTerminal(prisma, jobId);
      if (reconciled.released) {
        paymentsReleased += 1;
      }
    }
    return c.json({ ...result, paymentsReleased, failureOps });
  });

  app.post("/jobs/sweep-pause-timeouts", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const result = await sweepExpiredJobPauses(getPrismaClient());
    return c.json(result);
  });

  app.post("/webhooks/retry-failed", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const result = await retryDueWebhookDeliveries(getPrismaClient());
    return c.json(result);
  });

  app.get("/metrics/workers", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const metrics = await collectWorkerFleetMetrics(getPrismaClient());
    return c.json(metrics);
  });

  app.get("/metrics/cloud", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const metrics = await collectCloudMetricsSnapshot(getPrismaClient());
    const composition = getActiveCloudComposition();
    return c.json({
      ...metrics,
      cloudProfile: composition.profile,
      durableWorkProfile: composition.durableWorkProfile,
      workerTransport: composition.workerTransport.kind,
    });
  });

  app.get("/abuse/denylist", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const rows = await getPrismaClient().abuseDenylistPattern.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return c.json({ patterns: rows });
  });

  app.post("/abuse/denylist", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const body = await c.req.json<{ pattern?: string; category?: string }>();
    if (!body.pattern || body.pattern.length > 256) {
      return c.json({ error: "INVALID_PATTERN" }, 400);
    }
    try {
      new RegExp(body.pattern);
    } catch {
      return c.json({ error: "INVALID_REGEX" }, 400);
    }
    const row = await getPrismaClient().abuseDenylistPattern.create({
      data: {
        id: randomUUID(),
        pattern: body.pattern,
        category: body.category?.slice(0, 64) ?? "GENERIC",
      },
    });
    return c.json({ pattern: row }, 201);
  });

  app.get("/abuse/reports", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const reports = await getPrismaClient().abuseReport.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return c.json({ reports });
  });

  app.post("/abuse/reports/:id/resolve", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const id = c.req.param("id");
    const updated = await getPrismaClient().abuseReport.updateMany({
      where: { id, status: "OPEN" },
      data: { status: "RESOLVED" },
    });
    if (updated.count === 0) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({ resolved: true, reportId: id });
  });

  app.post("/users/:id/suspend", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const result = await suspendBuyerAccount(getPrismaClient(), c.req.param("id"));
    if (!result.suspended) {
      return c.json({ error: "NOT_FOUND_OR_ALREADY_SUSPENDED" }, 404);
    }
    return c.json({ suspended: true, userId: c.req.param("id") });
  });

  app.post("/capabilities/:id/suspend", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const id = c.req.param("id");
    let body: { reason?: string } = {};
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
    const updated = await getPrismaClient().capability.updateMany({
      where: { id, status: "PUBLISHED" },
      data: { status: "PAUSED" },
    });
    if (updated.count === 0) {
      return c.json({ error: "NOT_FOUND_OR_NOT_PUBLISHED" }, 404);
    }
    return c.json({ suspended: true, capabilityId: id, reason: body.reason ?? "ABUSE" });
  });

  app.post("/jobs/sweep-lost-workers", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const prisma = getPrismaClient();
    const sweep = (await runJobFailureOperationsSweeps(prisma)).lostWorker;
    let paymentsReleased = 0;
    for (const jobId of sweep.jobIds) {
      const reconciled = await reconcileJobPaymentAfterTerminal(prisma, jobId);
      if ("released" in reconciled && reconciled.released) {
        paymentsReleased += 1;
      }
    }
    return c.json({ ...sweep, paymentsReleased });
  });

  app.post("/worker-devices/:id/revoke", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const id = c.req.param("id");
    const updated = await getPrismaClient().workerDevice.updateMany({
      where: { id },
      data: { status: "REVOKED", revokedAt: new Date() },
    });
    if (updated.count === 0) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({ revoked: true, workerDeviceId: id });
  });

  app.get("/inference", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const events = await getPrismaClient().auditEvent.findMany({
      where: { type: "PLATFORM_INFERENCE", createdAt: { gte: since } },
      select: { sanitizedPayload: true },
      take: 500,
    });
    const usage = events.flatMap((event) => {
      const payload = event.sanitizedPayload;
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return [];
      }
      const row = payload as Record<string, unknown>;
      if (
        (row.task !== "INTENT" && row.task !== "RECOMMENDATION" && row.task !== "ORCHESTRATION") ||
        typeof row.provider !== "string"
      ) {
        return [];
      }
      return [
        buildInferenceUsageRecord({
          task: row.task,
          provider: row.provider,
          model: typeof row.model === "string" ? row.model : null,
          inputTokens: typeof row.inputTokens === "number" ? row.inputTokens : null,
          outputTokens: typeof row.outputTokens === "number" ? row.outputTokens : null,
          cachedInputTokens: typeof row.cachedInputTokens === "number" ? row.cachedInputTokens : null,
          latencyMs: typeof row.latencyMs === "number" ? row.latencyMs : null,
        }),
      ];
    });
    return c.json({
      inference: readPlatformInferenceHealth(),
      lastDay: aggregateInferenceUsage(usage),
    });
  });

  app.post("/inference/routing", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const body = await c.req
      .json<{ task?: "INTENT" | "RECOMMENDATION" | "ORCHESTRATION"; previousModel?: string; nextModel?: string }>()
      .catch(() => null);
    if (!body?.task || !body.nextModel?.trim()) {
      return c.json({ error: "INVALID_ROUTING" }, 400);
    }
    const audit = routingChangeAudit({
      task: body.task,
      previousModel: body.previousModel ?? null,
      nextModel: body.nextModel.trim(),
    });
    await getPrismaClient().auditEvent.create({
      data: {
        type: "PLATFORM_INFERENCE_ROUTING_CHANGE",
        actor: "ADMIN",
        sanitizedPayload: JSON.parse(JSON.stringify(audit)),
      },
    });
    return c.json({ recorded: true, audit });
  });

  return app;
}
