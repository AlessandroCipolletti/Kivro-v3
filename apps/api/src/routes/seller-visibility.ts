import { ensureSellerProfile } from "@kivro/capability-publish";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import {
  addCapabilityExample,
  addSellerTestCase,
  grantCapabilityAccess,
  revokeCapabilityAccess,
  setSellerCapabilityVisibility,
} from "../services/capability-visibility.js";
import type { AppEnv } from "../types.js";

export function sellerVisibilityRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.post("/capabilities/:id/visibility", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const body = await c.req.json<{ visibility?: string }>().catch(() => ({ visibility: undefined }));
    if (!body.visibility) {
      return c.json({ error: "INVALID_VISIBILITY" }, 400);
    }
    try {
      const capability = await setSellerCapabilityVisibility(getPrismaClient(), {
        sellerProfileId: profile.id,
        capabilityId: c.req.param("id"),
        visibility: body.visibility,
      });
      return c.json({ capabilityId: capability.id, visibility: capability.visibility });
    } catch (err) {
      const code = err instanceof Error ? err.message : "INVALID_VISIBILITY";
      const status = code === "NOT_FOUND" ? 404 : 409;
      return c.json({ error: code }, status);
    }
  });

  app.post("/capabilities/:id/access-grants", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const body = await c.req.json<{ email?: string }>().catch(() => ({ email: undefined }));
    if (!body.email?.trim()) {
      return c.json({ error: "EMAIL_REQUIRED" }, 400);
    }
    try {
      const grant = await grantCapabilityAccess(getPrismaClient(), {
        sellerProfileId: profile.id,
        capabilityId: c.req.param("id"),
        email: body.email,
      });
      return c.json({ grantId: grant.id, granteeUserId: grant.granteeUserId }, 201);
    } catch (err) {
      const code = err instanceof Error ? err.message : "NOT_FOUND";
      return c.json({ error: code }, code === "NOT_FOUND" || code === "USER_NOT_FOUND" ? 404 : 409);
    }
  });

  app.delete("/capabilities/:id/access-grants/:userId", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    try {
      await revokeCapabilityAccess(getPrismaClient(), {
        sellerProfileId: profile.id,
        capabilityId: c.req.param("id"),
        granteeUserId: c.req.param("userId"),
      });
      return c.json({ ok: true });
    } catch (err) {
      const code = err instanceof Error ? err.message : "NOT_FOUND";
      return c.json({ error: code }, 404);
    }
  });

  app.post("/capabilities/:id/examples", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const body = await c.req
      .json<{
        title?: string;
        description?: string;
        inputValues?: Record<string, unknown>;
        outputValues?: Record<string, unknown>;
        source?: "REAL_EXECUTION" | "SELLER_CURATED";
        published?: boolean;
      }>()
      .catch(() => null);
    if (!body?.title || !body.inputValues || !body.outputValues) {
      return c.json({ error: "INVALID_EXAMPLE" }, 400);
    }
    try {
      const example = await addCapabilityExample(getPrismaClient(), {
        sellerProfileId: profile.id,
        capabilityId: c.req.param("id"),
        title: body.title,
        description: body.description,
        inputValues: body.inputValues,
        outputValues: body.outputValues,
        source: body.source === "REAL_EXECUTION" ? "REAL_EXECUTION" : "SELLER_CURATED",
        published: body.published !== false,
      });
      return c.json({ example }, 201);
    } catch (err) {
      const code = err instanceof Error ? err.message : "INVALID_EXAMPLE";
      const status = code === "NOT_FOUND" ? 404 : code === "EXAMPLE_LIMIT" ? 409 : 400;
      return c.json({ error: code }, status);
    }
  });

  app.post("/capabilities/:id/test-cases", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capabilityId = c.req.param("id");
    const body = await c.req
      .json<{
        name?: string;
        inputValues?: Record<string, unknown>;
        expectedOutput?: Record<string, unknown>;
      }>()
      .catch(() => null);
    if (!capabilityId || !body?.name || !body.inputValues) {
      return c.json({ error: "INVALID_TEST_CASE" }, 400);
    }
    try {
      const testCase = await addSellerTestCase(getPrismaClient(), {
        sellerProfileId: profile.id,
        capabilityId,
        name: body.name,
        inputValues: body.inputValues,
        expectedOutput: body.expectedOutput,
      });
      return c.json({ testCase }, 201);
    } catch (err) {
      const code = err instanceof Error ? err.message : "INVALID_TEST_CASE";
      const status = code === "NOT_FOUND" ? 404 : code === "TEST_CASE_LIMIT" ? 409 : 400;
      return c.json({ error: code }, status);
    }
  });

  return app;
}
