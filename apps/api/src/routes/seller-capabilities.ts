import {
  createDraftCapability,
  ensureSellerProfile,
  ImportConsentSchema,
  DiscoverySnapshotSchema,
  publishCapability,
  validateImportConsent,
} from "@kivro/capability-publish";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export function sellerCapabilityRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/capabilities", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capabilities = await getPrismaClient().capability.findMany({
      where: { sellerProfileId: profile.id },
      orderBy: { updatedAt: "desc" },
      include: { currentVersion: true },
    });
    return c.json({ capabilities });
  });

  app.post("/capabilities", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const body = await c.req.json<{
      slug?: string;
      contract?: unknown;
      permissionManifest?: unknown;
    }>();
    if (!body.slug || body.contract === undefined || body.permissionManifest === undefined) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    try {
      const capability = await createDraftCapability(getPrismaClient(), profile.id, {
        slug: body.slug,
        contract: body.contract,
        permissionManifest: body.permissionManifest,
      });
      return c.json({ capability }, 201);
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_SLUG") {
        return c.json({ error: "INVALID_SLUG" }, 400);
      }
      throw err;
    }
  });

  app.post("/capabilities/:id/publish", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capabilityId = c.req.param("id");
    const body = await c.req.json<{
      workerDeviceId?: string;
      localWorkerId?: string;
      contract?: unknown;
      permissionManifest?: unknown;
    }>();
    if (
      !body.workerDeviceId ||
      !body.localWorkerId ||
      body.contract === undefined ||
      body.permissionManifest === undefined
    ) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    try {
      const result = await publishCapability(getPrismaClient(), profile.id, capabilityId, {
        workerDeviceId: body.workerDeviceId,
        localWorkerId: body.localWorkerId,
        contract: body.contract,
        permissionManifest: body.permissionManifest,
      });
      return c.json(result);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "NOT_FOUND") {
          return c.json({ error: "NOT_FOUND" }, 404);
        }
        if (err.message === "WORKER_DEVICE_NOT_FOUND") {
          return c.json({ error: "WORKER_DEVICE_NOT_FOUND" }, 400);
        }
        if (err.message === "ALREADY_PUBLISHED") {
          return c.json({ error: "ALREADY_PUBLISHED" }, 409);
        }
      }
      throw err;
    }
  });

  app.post("/import/validate-consent", async (c) => {
    const body = await c.req.json<{ discovery?: unknown; consent?: unknown }>();
    const discovery = DiscoverySnapshotSchema.safeParse(body.discovery);
    const consent = ImportConsentSchema.safeParse(body.consent);
    if (!discovery.success || !consent.success) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const result = validateImportConsent(discovery.data, consent.data);
    if (!result.ok) {
      return c.json({ error: result.code }, 400);
    }
    return c.json({ ok: true });
  });

  return app;
}
