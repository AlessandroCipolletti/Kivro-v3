import {
  confirmStoredAssetUpload,
  createUploadSlot,
  ensureSellerProfile,
} from "@kivro/capability-publish";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export function sellerAssetRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.use("*", requireAuth, requireVerifiedEmail);

  app.post("/assets/upload-slot", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const body = await c.req.json<{
      purpose?: string;
      contentHash?: string;
      mimeType?: string;
      maxBytes?: number;
    }>();
    if (!body.purpose || !body.contentHash?.startsWith("sha256:")) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const purpose = body.purpose as "CAPABILITY_PACKAGE" | "SKILL_BUNDLE" | "EXAMPLE_INPUT";
    if (!["CAPABILITY_PACKAGE", "SKILL_BUNDLE", "EXAMPLE_INPUT"].includes(purpose)) {
      return c.json({ error: "INVALID_PURPOSE" }, 400);
    }
    try {
      const result = await createUploadSlot(getPrismaClient(), {
        sellerProfileId: profile.id,
        purpose,
        contentHash: body.contentHash,
        mimeType: body.mimeType,
        maxBytes: body.maxBytes,
      });
      return c.json({
        assetId: result.asset.id,
        uploadUrl: result.uploadUrl,
        expiresInSeconds: result.expiresInSeconds,
        bucket: result.asset.bucket,
        objectKey: result.asset.objectKey,
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
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    try {
      const asset = await confirmStoredAssetUpload(
        getPrismaClient(),
        profile.id,
        c.req.param("id"),
      );
      return c.json({ asset });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "NOT_FOUND") {
          return c.json({ error: "NOT_FOUND" }, 404);
        }
        if (
          err.message === "OBJECT_STORAGE_NOT_CONFIGURED" ||
          err.message === "UPLOAD_HASH_MISMATCH" ||
          err.message === "UPLOAD_SIZE_INVALID"
        ) {
          return c.json({ error: err.message }, 400);
        }
      }
      throw err;
    }
  });

  return app;
}
