import {
  createCardAuthorizedJob,
  createStripeClient,
  secureCardAuthorizedJob,
  submitPaidJob,
} from "@kivro/billing";
import { getPrismaClient } from "@kivro/database";
import { validateBuyerInput } from "@kivro/job-io";
import type { CapabilityContract } from "@kivro/contracts";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export function buyerJobSubmitRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.post("/jobs", async (c) => {
    const user = c.get("user");
    let body: {
      capabilityId?: string;
      inputs?: Record<string, unknown>;
      assets?: Record<string, unknown>;
      paymentMode?: "credits" | "card";
    };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "INVALID_JSON" }, 400);
    }
    if (!body.capabilityId) {
      return c.json({ error: "CAPABILITY_ID_REQUIRED" }, 400);
    }
    const capability = await getPrismaClient().capability.findUnique({
      where: { id: body.capabilityId },
      include: { currentVersion: true },
    });
    if (!capability?.currentVersion) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const version = capability.currentVersion;
    const contract = {
      name: capability.name,
      description: capability.description,
      currency: version.currency,
      priceTierCents: version.priceSnapshotCents,
      inputs: version.inputSchema,
      output: version.outputSchema,
    } as CapabilityContract;
    const validation = validateBuyerInput({
      contract,
      inputs: body.inputs ?? {},
      assets: (body.assets as Record<string, never>) ?? {},
    });
    if (!validation.ok) {
      return c.json({ error: "VALIDATION_FAILED", issues: validation.issues }, 400);
    }
    const paymentMode = body.paymentMode ?? "credits";
    const prisma = getPrismaClient();
    const result =
      paymentMode === "card"
        ? await (async () => {
            const stripe = createStripeClient();
            if (!stripe) {
              return { error: "STRIPE_NOT_CONFIGURED" as const };
            }
            return createCardAuthorizedJob(prisma, stripe, {
              buyerId: user.id,
              buyerEmail: user.email,
              capabilityId: body.capabilityId!,
              structuredInput: body.inputs ?? {},
              assetManifest: body.assets,
            });
          })()
        : await submitPaidJob(prisma, {
            buyerId: user.id,
            capabilityId: body.capabilityId,
            structuredInput: body.inputs ?? {},
            assetManifest: body.assets,
          });
    if ("error" in result) {
      const status =
        result.error === "INSUFFICIENT_CREDITS"
          ? 402
          : result.error === "CAPABILITY_NOT_AVAILABLE"
            ? 404
            : 409;
      return c.json(result, status);
    }
    return c.json(result, paymentMode === "card" ? 201 : 201);
  });

  app.post("/jobs/:jobId/confirm-payment", async (c) => {
    const user = c.get("user");
    const job = await getPrismaClient().job.findUnique({ where: { id: c.req.param("jobId") } });
    if (!job || job.buyerId !== user.id) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const result = await secureCardAuthorizedJob(getPrismaClient(), job.id);
    if ("error" in result) {
      return c.json(result, 409);
    }
    return c.json(result);
  });

  return app;
}
