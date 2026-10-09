import {
  confirmBuyerStoredAssetUpload,
  createBuyerUploadSlot,
} from "@kivro/capability-publish";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export function buyerAssetRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.post("/assets/upload-slot", async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{ contentHash?: string; mimeType?: string; maxBytes?: number }>();
    if (!body.contentHash?.startsWith("sha256:")) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    try {
      const result = await createBuyerUploadSlot(getPrismaClient(), {
        buyerId: user.id,
        contentHash: body.contentHash,
        mimeType: body.mimeType,
        maxBytes: body.maxBytes,
      });
      return c.json({
        assetId: result.asset.id,
        uploadUrl: result.uploadUrl,
        expiresInSeconds: result.expiresInSeconds,
      });
    } catch (err) {
      if (err instanceof Error && err.message === "OBJECT_STORAGE_NOT_CONFIGURED") {
        return c.json({ error: "OBJECT_STORAGE_NOT_CONFIGURED" }, 503);
      }
      throw err;
    }
  });

  app.post("/assets/:id/confirm", async (c) => {
    const user = c.get("user");
    try {
      const result = await confirmBuyerStoredAssetUpload(
        getPrismaClient(),
        user.id,
        c.req.param("id"),
      );
      return c.json(result);
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        return c.json({ error: "NOT_FOUND" }, 404);
      }
      throw err;
    }
  });

  return app;
}
