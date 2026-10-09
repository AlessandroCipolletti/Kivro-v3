import { getPrismaClient } from "@kivro/database";
import {
  hashRequestBody,
  readIdempotentResponse,
  storeIdempotentResponse,
} from "@kivro/buyer-api";
import { summarizeMarketplaceAvailability } from "@kivro/job-scheduling";
import { getBuyerJobDetail } from "@kivro/marketplace";
import { Hono } from "hono";
import { requireBuyerApiKey } from "../middleware/buyer-api-auth.js";
import { createBuyerJobFromApi } from "../services/create-buyer-job.js";
import type { AppEnv } from "../types.js";

/** §322–§325 — buyer REST API v1 (Bearer API key). */
export function v1BuyerApiRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.get("/capabilities", requireBuyerApiKey("capabilities:read"), async (c) => {
    const rows = await getPrismaClient().capability.findMany({
      where: { status: "PUBLISHED", currentVersionId: { not: null } },
      include: {
        sellerProfile: { select: { displayName: true } },
        currentVersion: { select: { priceSnapshotCents: true } },
      },
      take: 100,
    });
    const availability = await summarizeMarketplaceAvailability(
      getPrismaClient(),
      rows.map((r) => r.id),
    );
    const availById = new Map(availability.map((a) => [a.capabilityId, a]));
    return c.json({
      capabilities: rows.map((row) => {
        const avail = availById.get(row.id);
        return {
          id: row.id,
          slug: row.slug,
          name: row.name,
          description: row.description,
          priceTierCents: row.priceTierCents ?? row.currentVersion?.priceSnapshotCents ?? null,
          currency: row.currency,
          availability: avail
            ? {
                status: avail.status,
                accepting: avail.accepting,
                nextAvailableAt: avail.nextAvailableAt,
              }
            : null,
        };
      }),
    });
  });

  app.get("/capabilities/:id", requireBuyerApiKey("capabilities:read"), async (c) => {
    const row = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("id"), status: "PUBLISHED" },
      include: { currentVersion: true },
    });
    if (!row?.currentVersion) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const [avail] = await summarizeMarketplaceAvailability(getPrismaClient(), [row.id]);
    return c.json({
      capability: {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        versionNumber: row.currentVersion.versionNumber,
        priceTierCents: row.currentVersion.priceSnapshotCents,
        currency: row.currency,
        availability: avail ?? null,
      },
    });
  });

  app.post("/capabilities/:id/jobs", requireBuyerApiKey("jobs:create"), async (c) => {
    const user = c.get("user");
    const apiKey = c.get("buyerApiKey");
    const capabilityId = c.req.param("id") ?? "";
    if (!capabilityId) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const endpoint = `POST /v1/capabilities/${capabilityId}/jobs`;
    const idempotencyKey = c.req.header("Idempotency-Key")?.trim();
    let body: {
      inputs?: Record<string, unknown>;
      assets?: Record<string, unknown>;
      scheduledRunAt?: string;
    };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "INVALID_JSON" }, 400);
    }

    const requestHash = hashRequestBody(body);
    if (idempotencyKey) {
      const cached = await readIdempotentResponse(getPrismaClient(), {
        userId: user.id,
        endpoint,
        idempotencyKey,
        requestHash,
      });
      if (cached && "conflict" in cached) {
        return c.json({ error: "IDEMPOTENCY_KEY_REUSE" }, 409);
      }
      if (cached && "statusCode" in cached) {
        return c.json(cached.body, cached.statusCode as 201);
      }
    }

    let scheduledRunAt: Date | undefined;
    if (body.scheduledRunAt) {
      scheduledRunAt = new Date(body.scheduledRunAt);
      if (Number.isNaN(scheduledRunAt.getTime())) {
        return c.json({ error: "INVALID_SCHEDULE_TIME" }, 400);
      }
    }

    const result = await createBuyerJobFromApi(getPrismaClient(), {
      buyerId: user.id,
      buyerEmail: user.email ?? "",
      capabilityId,
      inputs: body.inputs,
      assets: body.assets,
      scheduledRunAt,
      buyerApiKeyId: apiKey?.id,
    });

    const statusCode =
      "error" in result
        ? result.error === "INSUFFICIENT_CREDITS"
          ? 402
          : result.error === "VALIDATION_FAILED"
            ? 400
            : result.error === "NOT_FOUND"
              ? 404
              : 409
        : 201;

    if (idempotencyKey) {
      const stored = await storeIdempotentResponse(getPrismaClient(), {
        userId: user.id,
        apiKeyId: apiKey?.id,
        endpoint,
        idempotencyKey,
        requestHash,
        statusCode,
        responseJson: result,
      });
      if ("conflict" in stored) {
        return c.json({ error: "IDEMPOTENCY_KEY_REUSE" }, 409);
      }
    }

    return c.json(result, statusCode);
  });

  app.get("/jobs/:id", requireBuyerApiKey("jobs:read"), async (c) => {
    const user = c.get("user");
    const jobId = c.req.param("id") ?? "";
    if (!jobId) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const result = await getBuyerJobDetail(getPrismaClient(), {
      jobId,
      buyerId: user.id,
    });
    if ("error" in result) {
      return c.json({ error: result.error }, 404);
    }
    return c.json(result);
  });

  app.get("/jobs", requireBuyerApiKey("jobs:read"), async (c) => {
    const user = c.get("user");
    const jobs = await getPrismaClient().job.findMany({
      where: { buyerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        capabilityVersion: { include: { capability: { select: { slug: true, name: true } } } },
      },
    });
    return c.json({
      jobs: jobs.map((job) => ({
        id: job.id,
        status: job.status,
        capabilityId: job.capabilityId,
        slug: job.capabilityVersion.capability.slug,
        createdAt: job.createdAt.toISOString(),
        completedAt: job.completedAt?.toISOString() ?? null,
      })),
    });
  });

  return app;
}
