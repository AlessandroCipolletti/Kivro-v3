import {
  acknowledgeJobResultLooksGood,
  buildJobReuseSeed,
  createJobDeliveryProblemReport,
} from "@kivro/buyer-experience";
import { getPrismaClient } from "@kivro/database";
import { createBuyerJobBundleDownload } from "../services/buyer-job-bundle-download.js";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

/** M31 — reuse, acknowledgement, problem reports, download-all. */
export function buyerJobHistoryRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/jobs/:jobId/reuse", async (c) => {
    const user = c.get("user");
    const mode = c.req.query("mode") === "duplicate_edit" ? "duplicate_edit" : "run_again";
    const seed = await buildJobReuseSeed(getPrismaClient(), {
      jobId: c.req.param("jobId"),
      buyerId: user.id,
      mode,
    });
    if ("error" in seed) {
      return c.json({ error: seed.error }, seed.error === "NOT_FOUND" ? 404 : 409);
    }
    return c.json({ reuse: seed });
  });

  app.post("/jobs/:jobId/acknowledge", async (c) => {
    const user = c.get("user");
    const result = await acknowledgeJobResultLooksGood(getPrismaClient(), {
      jobId: c.req.param("jobId"),
      buyerId: user.id,
    });
    if ("error" in result) {
      return c.json({ error: result.error }, result.error === "NOT_FOUND" ? 404 : 409);
    }
    return c.json({ ok: true });
  });

  app.post("/jobs/:jobId/problem-report", async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{ reason?: string; details?: string }>();
    if (!body.reason) {
      return c.json({ error: "REASON_REQUIRED" }, 400);
    }
    const result = await createJobDeliveryProblemReport(getPrismaClient(), {
      jobId: c.req.param("jobId"),
      reporterUserId: user.id,
      reason: body.reason,
      details: body.details,
    });
    if ("error" in result) {
      const status =
        result.error === "NOT_FOUND" ? 404 : result.error === "INVALID_REASON" ? 400 : 409;
      return c.json({ error: result.error }, status);
    }
    return c.json(result, 201);
  });

  app.get("/jobs/:jobId/assets/download-all", async (c) => {
    const user = c.get("user");
    const bundle = await createBuyerJobBundleDownload(getPrismaClient(), {
      jobId: c.req.param("jobId"),
      buyerId: user.id,
    });
    if ("error" in bundle) {
      return c.json({ error: bundle.error }, bundle.httpStatus);
    }
    return new Response(bundle.buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${bundle.filename.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  });

  return app;
}
