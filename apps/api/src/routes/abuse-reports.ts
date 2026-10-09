import { createAbuseReport, isValidAbuseReason } from "@kivro/abuse-controls";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";

/** §30 — buyer/seller abuse reporting (session auth). */
export function abuseReportRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.post("/abuse/report", requireAuth, requireVerifiedEmail, async (c) => {
    const user = c.get("user");
    let body: {
      targetType?: string;
      targetId?: string;
      capabilityId?: string;
      reason?: string;
      details?: string;
    };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "INVALID_JSON" }, 400);
    }
    const targetType = body.targetType;
    if (targetType !== "CAPABILITY" && targetType !== "BUYER" && targetType !== "SELLER") {
      return c.json({ error: "INVALID_TARGET_TYPE" }, 400);
    }
    if (!body.targetId || typeof body.targetId !== "string") {
      return c.json({ error: "TARGET_ID_REQUIRED" }, 400);
    }
    if (!body.reason || !isValidAbuseReason(body.reason)) {
      return c.json({ error: "INVALID_REASON" }, 400);
    }
    const result = await createAbuseReport(getPrismaClient(), {
      reporterUserId: user.id,
      targetType,
      targetId: body.targetId,
      capabilityId: body.capabilityId,
      reason: body.reason,
      details: body.details,
    });
    if ("error" in result) {
      return c.json({ error: result.error }, 400);
    }
    return c.json({ reportId: result.id }, 201);
  });

  return app;
}
