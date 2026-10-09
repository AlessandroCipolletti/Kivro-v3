import { getPrismaClient } from "@kivro/database";
import { getBuyerJobDetail, parseJobOutputAssetManifest } from "@kivro/marketplace";
import { createPresignedDownload } from "@kivro/storage";
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
    const detail = await getBuyerJobDetail(getPrismaClient(), { jobId, buyerId: user.id });
    if ("error" in detail) {
      return c.json({ error: detail.error }, 404);
    }
    const job = detail.job as {
      status: string;
      result?: { assets?: Array<{ id: string; filename: string; bucket?: string; objectKey?: string }> };
    };
    if (job.status !== "COMPLETED" || !job.result?.assets?.length) {
      return c.json({ error: "NO_DELIVERABLES" }, 404);
    }
    const asset = job.result.assets.find((a) => a.id === assetRef);
    if (!asset) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }

    let bucket = asset.bucket;
    let objectKey = asset.objectKey;
    if (!bucket || !objectKey) {
      const stored = await getPrismaClient().storedAsset.findUnique({
        where: { id: assetRef },
      });
      if (!stored) {
        return c.json({ error: "STORAGE_REF_MISSING" }, 404);
      }
      bucket = stored.bucket;
      objectKey = stored.objectKey;
    }

    try {
      const signed = await createPresignedDownload({
        bucket,
        objectKey,
        filename: asset.filename,
      });
      return c.json(signed);
    } catch (err) {
      if (err instanceof Error && err.message === "OBJECT_STORAGE_NOT_CONFIGURED") {
        return c.json({ error: "OBJECT_STORAGE_NOT_CONFIGURED" }, 503);
      }
      throw err;
    }
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
