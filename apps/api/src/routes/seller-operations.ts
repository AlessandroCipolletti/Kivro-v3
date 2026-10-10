import { ensureSellerProfile } from "@kivro/capability-publish";
import { getPriceTierById } from "@kivro/billing";
import { parseWorkerManifest } from "@kivro/contracts";
import { getPrismaClient } from "@kivro/database";
import { evaluateCapabilityAvailability } from "@kivro/job-scheduling";
import {
  assessRollbackReadiness,
  buildAutoPauseExplanation,
  buildCapabilityAnalytics,
  assertProviderCostWithinGuardrail,
  buildExplainableUnavailability,
  buildFirstSaleExplanation,
  buildMaintenanceState,
  buildProviderCostEstimateView,
  buildSellerEarningsDashboard,
  buildSellerOperationsSummary,
  buildSellerProfitAnalytics,
  buildSellerReputationExplainability,
  mergeSellerNotificationPreferences,
  readSellerNotificationPreferences,
} from "@kivro/seller-experience";
import { buildSecurityWarnings, parseWorkerHealthReport } from "@kivro/seller-health";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export function sellerOperationsRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/operations/summary", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const summary = await buildSellerOperationsSummary(getPrismaClient(), profile.id);
    return c.json(summary);
  });

  app.get("/operations/blockers", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const caps = await getPrismaClient().capability.findMany({
      where: { sellerProfileId: profile.id, status: "PUBLISHED" },
      select: { id: true, slug: true, name: true },
      take: 20,
    });
    const blockers = [];
    for (const cap of caps) {
      const availability = await evaluateCapabilityAvailability(getPrismaClient(), cap.id);
      if ("error" in availability || availability.accepting) {
        continue;
      }
      blockers.push({
        capabilityId: cap.id,
        slug: cap.slug,
        name: cap.name,
        reasons: buildExplainableUnavailability({
          reasons: availability.reasons,
          maintenanceMessage: profile.maintenanceMessage,
          maintenanceExpectedReturnAt: profile.maintenanceExpectedReturnAt?.toISOString() ?? null,
        }),
      });
    }
    return c.json({ blockers });
  });

  app.get("/capabilities/:id/unavailability", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const cap = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("id"), sellerProfileId: profile.id },
    });
    if (!cap) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const availability = await evaluateCapabilityAvailability(getPrismaClient(), cap.id);
    if ("error" in availability) {
      return c.json(availability, 404);
    }
    return c.json({
      accepting: availability.accepting,
      reasons: buildExplainableUnavailability({
        reasons: availability.reasons,
        maintenanceMessage: profile.maintenanceMessage,
        maintenanceExpectedReturnAt: profile.maintenanceExpectedReturnAt?.toISOString() ?? null,
      }),
      nextAvailableAt: availability.nextAvailableAt,
    });
  });

  app.get("/economics/earnings", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    return c.json(await buildSellerEarningsDashboard(getPrismaClient(), profile.id));
  });

  app.get("/economics/profit", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    return c.json(await buildSellerProfitAnalytics(getPrismaClient(), profile.id));
  });

  app.get("/analytics/capabilities/:id", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const result = await buildCapabilityAnalytics(getPrismaClient(), profile.id, c.req.param("id"));
    if ("error" in result) {
      return c.json(result, 404);
    }
    return c.json(result);
  });

  app.get("/capabilities/:id/rollback-readiness", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const targetVersionId = c.req.query("targetVersionId");
    if (!targetVersionId) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const cap = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("id"), sellerProfileId: profile.id },
    });
    if (!cap) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const target = await getPrismaClient().capabilityVersion.findFirst({
      where: { id: targetVersionId, capabilityId: cap.id },
    });
    if (!target) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const inFlight = cap.currentVersionId
      ? await getPrismaClient().job.count({
          where: {
            capabilityVersionId: cap.currentVersionId,
            status: { in: ["RUNNING", "STARTING", "DISPATCHED", "ACCEPTED"] },
          },
        })
      : 0;
    const manifest = target.workerManifest
      ? parseWorkerManifest(target.workerManifest)
      : null;
    return c.json(
      assessRollbackReadiness({
        targetWorkerManifest: manifest,
        inFlightJobsOnCurrentVersion: inFlight,
      }),
    );
  });

  app.get("/auto-pause", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const devices = await getPrismaClient().workerDevice.findMany({
      where: { sellerProfileId: profile.id, status: { not: "REVOKED" } },
    });
    const warnings = devices.flatMap((device) =>
      buildSecurityWarnings({
        report: parseWorkerHealthReport(device.lastHealthReport),
        deviceStatus: device.status,
        sellerEmergencyPause: profile.marketplaceEmergencyPause,
        platformSecurityPause: profile.platformSecurityPause,
        platformSecurityReason: profile.platformSecurityPauseReason,
      }).map((warning) => ({ ...warning, title: `${device.name}: ${warning.title}` })),
    );
    return c.json(
      buildAutoPauseExplanation({
        platformSecurityPause: profile.platformSecurityPause,
        platformSecurityPauseReason: profile.platformSecurityPauseReason,
        emergencyPause: profile.marketplaceEmergencyPause,
        warnings,
      }),
    );
  });

  app.get("/notifications", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    return c.json({ preferences: readSellerNotificationPreferences(profile) });
  });

  app.patch("/notifications", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const body = await c.req.json<{
      jobCompleted?: boolean;
      healthAlert?: boolean;
      failure?: boolean;
      missedWindow?: boolean;
      problemReport?: boolean;
      payout?: boolean;
    }>();
    const merged = mergeSellerNotificationPreferences(
      readSellerNotificationPreferences(profile),
      {
        jobCompleted: body.jobCompleted,
        healthAlert: body.healthAlert,
        failure: body.failure,
        missedWindow: body.missedWindow,
        problemReport: body.problemReport,
        payout: body.payout,
      },
    );
    const updated = await getPrismaClient().sellerProfile.update({
      where: { id: profile.id },
      data: {
        sellerNotifyJobCompleted: merged.jobCompleted,
        sellerNotifyHealthAlert: merged.healthAlert,
        sellerNotifyFailure: merged.failure,
        sellerNotifyMissedWindow: merged.missedWindow,
        sellerNotifyProblemReport: merged.problemReport,
        sellerNotifyPayout: merged.payout,
      },
    });
    return c.json({ preferences: readSellerNotificationPreferences(updated) });
  });

  app.get("/maintenance", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    return c.json(
      buildMaintenanceState({
        maintenanceMode: profile.maintenanceMode,
        maintenanceMessage: profile.maintenanceMessage,
        maintenanceExpectedReturnAt: profile.maintenanceExpectedReturnAt,
      }),
    );
  });

  app.put("/maintenance", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const body = await c.req.json<{
      active?: boolean;
      message?: string | null;
      expectedReturnAt?: string | null;
    }>();
    const updated = await getPrismaClient().sellerProfile.update({
      where: { id: profile.id },
      data: {
        maintenanceMode: body.active === true,
        maintenanceMessage: body.message ?? null,
        maintenanceExpectedReturnAt: body.expectedReturnAt
          ? new Date(body.expectedReturnAt)
          : null,
      },
    });
    return c.json(
      buildMaintenanceState({
        maintenanceMode: updated.maintenanceMode,
        maintenanceMessage: updated.maintenanceMessage,
        maintenanceExpectedReturnAt: updated.maintenanceExpectedReturnAt,
      }),
    );
  });

  app.patch("/settings/capacity", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const body = await c.req.json<{ maxConcurrentJobs?: number; capabilityId?: string }>();
    const max = body.maxConcurrentJobs;
    if (max == null || max < 1 || max > 10) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    if (body.capabilityId) {
      const cap = await getPrismaClient().capability.updateMany({
        where: { id: body.capabilityId, sellerProfileId: profile.id },
        data: { maxConcurrentJobs: max },
      });
      if (cap.count === 0) {
        return c.json({ error: "NOT_FOUND" }, 404);
      }
      return c.json({ capabilityId: body.capabilityId, maxConcurrentJobs: max });
    }
    const updated = await getPrismaClient().sellerProfile.update({
      where: { id: profile.id },
      data: { maxConcurrentJobs: max },
    });
    return c.json({ maxConcurrentJobs: updated.maxConcurrentJobs });
  });

  app.get("/reputation/capabilities/:id", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const cap = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("id"), sellerProfileId: profile.id },
    });
    if (!cap) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json(await buildSellerReputationExplainability(getPrismaClient(), cap.id));
  });

  app.get("/jobs/:jobId/first-sale-explanation", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const job = await getPrismaClient().job.findFirst({
      where: {
        id: c.req.param("jobId"),
        capabilityVersion: { capability: { sellerProfileId: profile.id } },
      },
      include: { sellerTransfer: true },
    });
    if (!job) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    if (job.status === "COMPLETED" && !profile.firstSaleExplainedAt) {
      await getPrismaClient().sellerProfile.update({
        where: { id: profile.id },
        data: { firstSaleExplainedAt: new Date() },
      });
    }
    return c.json(
      buildFirstSaleExplanation({
        jobId: job.id,
        buyerPaidCents: job.priceSnapshotCents,
        platformFeeCents: job.platformFeeSnapshotCents ?? 0,
        sellerNetCents: job.sellerNetSnapshotCents ?? 0,
        estimatedProviderCostCents: job.estimatedProviderCostCents,
        settlementStatus: job.sellerTransfer?.status ?? "PENDING",
      }),
    );
  });

  app.get("/pricing/provider-cost-preview", async (c) => {
    const tierId = c.req.query("tierId");
    const estimated = Number(c.req.query("estimatedProviderCostCents") ?? "50");
    if (!tierId) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const tier = getPriceTierById(tierId);
    if (!tier || !Number.isFinite(estimated)) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const view = buildProviderCostEstimateView({ tier, estimatedProviderCostCents: estimated });
    if (!assertProviderCostWithinGuardrail(estimated)) {
      return c.json({ error: "PROVIDER_COST_GUARDRAIL", ...view }, 409);
    }
    return c.json(view);
  });

  return app;
}
