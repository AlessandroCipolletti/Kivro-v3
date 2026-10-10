import { getPrismaClient } from "@kivro/database";
import { parseJobOutputAssetManifest } from "@kivro/marketplace";
import { createBuyerJobAssetDownload } from "../services/buyer-job-download.js";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export function buyerJobAssetRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/jobs/:jobId/assets/:assetRef/download", async (c) => {
    const user = c.get("user");
    const jobId = c.req.param("jobId");
    const assetRef = c.req.param("assetRef");
    const signed = await createBuyerJobAssetDownload(getPrismaClient(), {
      jobId,
      buyerId: user.id,
      assetRef,
    });
    if ("error" in signed) {
      return c.json({ error: signed.error }, signed.httpStatus);
    }
    return c.json(signed);
  });

  app.get("/jobs/:jobId/assets", async (c) => {
    const user = c.get("user");
    const job = await getPrismaClient().job.findUnique({
      where: { id: c.req.param("jobId") },
      include: { result: true },
    });
    if (!job || job.buyerId !== user.id) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const assets = parseJobOutputAssetManifest(job.result?.outputAssetManifest);
    return c.json({ assets });
  });

  return app;
}
