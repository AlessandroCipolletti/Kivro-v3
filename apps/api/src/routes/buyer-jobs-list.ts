import { getPrismaClient } from "@kivro/database";
import { buyerVisibleJobStatus } from "@kivro/job-control";
import { resolveBuyerSchedulingPhase } from "@kivro/job-scheduling";
import { getBuyerJobDetail, submitJobReview } from "@kivro/marketplace";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";
import type { JobStatus } from "@kivro/domain";

/** §127 — buyer job history list (recent jobs). */
export function buyerJobsListRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/recent-capabilities", async (c) => {
    const user = c.get("user");
    const jobs = await getPrismaClient().job.findMany({
      where: { buyerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      distinct: ["capabilityId"],
      include: {
        capabilityVersion: {
          include: {
            capability: {
              select: { id: true, slug: true, name: true, priceTierCents: true, currency: true },
            },
          },
        },
      },
    });
    return c.json({
      recent: jobs.map((job) => ({
        capabilityId: job.capabilityVersion.capability.id,
        slug: job.capabilityVersion.capability.slug,
        name: job.capabilityVersion.capability.name,
        lastUsedAt: job.createdAt.toISOString(),
        priceTierCents: job.capabilityVersion.capability.priceTierCents,
        currency: job.capabilityVersion.capability.currency,
      })),
    });
  });

  app.get("/jobs", async (c) => {
    const user = c.get("user");
    const bucket = c.req.query("bucket");
    const statusFilter = bucketToStatuses(bucket);
    const jobs = await getPrismaClient().job.findMany({
      where: {
        buyerId: user.id,
        ...(statusFilter ? { status: { in: statusFilter } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        capabilityVersion: {
          include: { capability: { select: { slug: true, name: true } } },
        },
      },
    });
    return c.json({
      jobs: jobs.map((job) => ({
        id: job.id,
        slug: job.capabilityVersion.capability.slug,
        capabilityName: job.capabilityVersion.capability.name,
        status: job.status,
        buyerVisible: buyerVisibleJobStatus(job.status, {
          scheduledRunAt: job.scheduledRunAt,
          scheduleWaitDeadlineAt: job.scheduleWaitDeadlineAt,
          scheduleAdjustedAt: job.scheduleAdjustedAt,
        }),
        schedulingPhase: resolveBuyerSchedulingPhase({
          status: job.status,
          scheduledRunAt: job.scheduledRunAt,
        }),
        createdAt: job.createdAt.toISOString(),
        completedAt: job.completedAt?.toISOString() ?? null,
        priceSnapshotCents: job.priceSnapshotCents,
        currency: job.currency,
      })),
    });
  });

  app.get("/jobs/:jobId", async (c) => {
    const user = c.get("user");
    const result = await getBuyerJobDetail(getPrismaClient(), {
      jobId: c.req.param("jobId"),
      buyerId: user.id,
    });
    if ("error" in result) {
      return c.json({ error: result.error }, 404);
    }
    return c.json(result);
  });

  app.post("/jobs/:jobId/review", async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{ stars?: number; body?: string }>();
    if (body.stars == null) {
      return c.json({ error: "STARS_REQUIRED" }, 400);
    }
    const result = await submitJobReview(getPrismaClient(), {
      jobId: c.req.param("jobId"),
      buyerId: user.id,
      stars: body.stars,
      body: body.body,
    });
    if ("error" in result) {
      const status =
        result.error === "NOT_FOUND"
          ? 404
          : result.error === "SELF_REVIEW_FORBIDDEN"
            ? 403
            : 409;
      return c.json({ error: result.error }, status);
    }
    return c.json(result, 201);
  });

  return app;
}

function bucketToStatuses(bucket: string | undefined): JobStatus[] | null {
  switch (bucket) {
    case "completed":
      return ["COMPLETED"];
    case "running":
      return [
        "DISPATCHED",
        "ACCEPTED",
        "STARTING",
        "RUNNING",
        "UPLOADING_RESULT",
        "PAUSE_REQUESTED",
        "PAUSED",
        "RESUME_REQUESTED",
        "SECURITY_PAUSED",
      ];
    case "queued":
      return ["QUEUED", "SCHEDULED", "PAYMENT_RESERVED"];
    case "failed":
      return [
        "FAILED_STARTUP",
        "FAILED_POLICY",
        "FAILED_EXECUTION",
        "TIMED_OUT",
        "RESULT_REJECTED",
        "REJECTED",
        "EXPIRED",
      ];
    case "cancelled":
      return ["CANCELLED", "REFUNDED"];
    default:
      return null;
  }
}
