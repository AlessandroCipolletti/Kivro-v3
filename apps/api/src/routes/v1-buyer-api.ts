import {
  confirmBuyerStoredAssetUpload,
  createBuyerUploadSlot,
} from "@kivro/capability-publish";
import { getPrismaClient } from "@kivro/database";
import {
  hashRequestBody,
  mapV1PaymentError,
  readIdempotentResponse,
  storeIdempotentResponse,
} from "@kivro/buyer-api";
import {
  acknowledgeJobResultLooksGood,
  buildJobReuseSeed,
  createBuyerExecutionQuote,
  createJobDeliveryProblemReport,
  runBuyerExecutionPreflight,
  validateBuyerSubmissionAssets,
} from "@kivro/buyer-experience";
import { buyerCancelScheduledOrQueuedJob, summarizeMarketplaceAvailability } from "@kivro/job-scheduling";
import { getBuyerJobDetail } from "@kivro/marketplace";
import { Hono } from "hono";
import { v1BuyerOpenApiSpec } from "../openapi/v1-buyer-api.spec.js";
import { requireBuyerApiKey } from "../middleware/buyer-api-auth.js";
import { emitBuyerJobWebhookForCurrentStatus } from "../services/buyer-webhook-emitter.js";
import { createBuyerJobFromApi } from "../services/create-buyer-job.js";
import { formatV1JobCreateSuccess } from "../services/v1-buyer-response.js";
import { createBuyerJobAssetDownload } from "../services/buyer-job-download.js";
import { createBuyerJobBundleDownload } from "../services/buyer-job-bundle-download.js";
import type { AppEnv } from "../types.js";

/** §322–§325 — buyer REST API v1 (Bearer API key). */
export function v1BuyerApiRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.get("/openapi.json", (c) => c.json(v1BuyerOpenApiSpec));

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

  app.post("/capabilities/:id/preflight", requireBuyerApiKey("capabilities:read"), async (c) => {
    const capabilityId = c.req.param("id") ?? "";
    if (!capabilityId) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    let body: { scheduledRunAt?: string; hardDeliveryDeadlineAt?: string } = {};
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
    const capability = await getPrismaClient().capability.findUnique({ where: { id: capabilityId } });
    const result = await runBuyerExecutionPreflight(getPrismaClient(), {
      capabilityId,
      immediate: !body.scheduledRunAt,
      scheduledRunAt: body.scheduledRunAt ? new Date(body.scheduledRunAt) : undefined,
      hardDeliveryDeadlineAt: body.hardDeliveryDeadlineAt
        ? new Date(body.hardDeliveryDeadlineAt)
        : undefined,
      estimatedDurationMinutes: capability?.estimatedDuration ?? null,
    });
    if (!result.ok) {
      return c.json(result, 404);
    }
    return c.json(result);
  });

  app.post("/capabilities/:id/quote", requireBuyerApiKey("jobs:create"), async (c) => {
    const user = c.get("user");
    const capabilityId = c.req.param("id") ?? "";
    if (!capabilityId) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    let body: {
      inputs?: Record<string, unknown>;
      assets?: Record<string, unknown>;
      scheduledRunAt?: string;
      hardDeliveryDeadlineAt?: string;
    };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "INVALID_JSON" }, 400);
    }
    const assetCheck = await validateBuyerSubmissionAssets(getPrismaClient(), {
      buyerId: user.id,
      assets: body.assets,
    });
    if (!assetCheck.ok) {
      return c.json(
        { error: assetCheck.error, fieldKey: assetCheck.fieldKey, assetId: assetCheck.assetId },
        400,
      );
    }
    const quote = await createBuyerExecutionQuote(getPrismaClient(), {
      buyerId: user.id,
      capabilityId,
      structuredInput: body.inputs ?? {},
      assetManifest: assetCheck.normalized,
      scheduledRunAt: body.scheduledRunAt ? new Date(body.scheduledRunAt) : undefined,
      hardDeliveryDeadlineAt: body.hardDeliveryDeadlineAt
        ? new Date(body.hardDeliveryDeadlineAt)
        : undefined,
    });
    if ("error" in quote) {
      return c.json(quote, 409);
    }
    return c.json(quote);
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
      executionQuoteId?: string;
      hardDeliveryDeadlineAt?: string;
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
    let buyerHardDeadlineAt: Date | undefined;
    if (body.hardDeliveryDeadlineAt) {
      buyerHardDeadlineAt = new Date(body.hardDeliveryDeadlineAt);
      if (Number.isNaN(buyerHardDeadlineAt.getTime())) {
        return c.json({ error: "INVALID_DEADLINE" }, 400);
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
      executionQuoteId: body.executionQuoteId,
      buyerHardDeadlineAt,
    });

    const responseBody =
      "error" in result
        ? { error: mapV1PaymentError(result.error), reasons: result.reasons }
        : formatV1JobCreateSuccess(result);

    const statusCode =
      "error" in result
        ? result.error === "INSUFFICIENT_CREDITS"
          ? 402
          : result.error === "VALIDATION_FAILED" ||
              result.error === "INPUT_ASSET_EXPIRED" ||
              result.error === "INPUT_ASSET_INVALID"
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
        responseJson: responseBody,
      });
      if ("conflict" in stored) {
        return c.json({ error: "IDEMPOTENCY_KEY_REUSE" }, 409);
      }
    }

    return c.json(responseBody, statusCode);
  });

  app.get("/jobs/:jobId/reuse", requireBuyerApiKey("jobs:read"), async (c) => {
    const user = c.get("user");
    const mode = c.req.query("mode") === "duplicate_edit" ? "duplicate_edit" : "run_again";
    const seed = await buildJobReuseSeed(getPrismaClient(), {
      jobId: c.req.param("jobId") ?? "",
      buyerId: user.id,
      mode,
    });
    if ("error" in seed) {
      return c.json({ error: seed.error }, seed.error === "NOT_FOUND" ? 404 : 409);
    }
    return c.json({ reuse: seed });
  });

  app.post("/jobs/:jobId/acknowledge", requireBuyerApiKey("jobs:read"), async (c) => {
    const user = c.get("user");
    const result = await acknowledgeJobResultLooksGood(getPrismaClient(), {
      jobId: c.req.param("jobId") ?? "",
      buyerId: user.id,
    });
    if ("error" in result) {
      return c.json({ error: result.error }, result.error === "NOT_FOUND" ? 404 : 409);
    }
    return c.json({ ok: true });
  });

  app.post("/jobs/:jobId/problem-report", requireBuyerApiKey("jobs:read"), async (c) => {
    const user = c.get("user");
    let body: { reason?: string; details?: string } = {};
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "INVALID_JSON" }, 400);
    }
    if (!body.reason) {
      return c.json({ error: "REASON_REQUIRED" }, 400);
    }
    const result = await createJobDeliveryProblemReport(getPrismaClient(), {
      jobId: c.req.param("jobId") ?? "",
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

  app.get("/jobs/:jobId/assets/download-all", requireBuyerApiKey("jobs:read"), async (c) => {
    const user = c.get("user");
    const bundle = await createBuyerJobBundleDownload(getPrismaClient(), {
      jobId: c.req.param("jobId") ?? "",
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

  app.get("/jobs/:jobId/assets/:assetRef/download", requireBuyerApiKey("jobs:read"), async (c) => {
    const user = c.get("user");
    const jobId = c.req.param("jobId") ?? "";
    const assetRef = c.req.param("assetRef") ?? "";
    if (!jobId || !assetRef) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
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
    const limitRaw = Number.parseInt(c.req.query("limit") ?? "50", 10);
    const limit = Math.min(100, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 50));
    const cursor = c.req.query("cursor");
    const jobs = await getPrismaClient().job.findMany({
      where: {
        buyerId: user.id,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      include: {
        capabilityVersion: { include: { capability: { select: { slug: true, name: true } } } },
      },
    });
    const page = jobs.slice(0, limit);
    const nextCursor =
      jobs.length > limit ? page[page.length - 1]?.createdAt.toISOString() ?? null : null;
    return c.json({
      jobs: page.map((job) => ({
        id: job.id,
        status: job.status,
        capabilityId: job.capabilityId,
        slug: job.capabilityVersion.capability.slug,
        createdAt: job.createdAt.toISOString(),
        completedAt: job.completedAt?.toISOString() ?? null,
        scheduledRunAt: job.scheduledRunAt?.toISOString() ?? null,
        resultRetentionExpiresAt: job.resultRetentionExpiresAt?.toISOString() ?? null,
      })),
      nextCursor,
    });
  });

  app.post("/jobs/:id/cancel", requireBuyerApiKey("jobs:create"), async (c) => {
    const user = c.get("user");
    const jobId = c.req.param("id") ?? "";
    if (!jobId) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    let body: { reason?: string } = {};
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
    const result = await buyerCancelScheduledOrQueuedJob(getPrismaClient(), {
      jobId,
      buyerId: user.id,
      reason: body.reason,
    });
    if ("error" in result) {
      return c.json({ error: result.error }, result.error === "NOT_FOUND" ? 404 : 409);
    }
    const { reconcileJobPaymentAfterTerminal } = await import("@kivro/billing");
    await reconcileJobPaymentAfterTerminal(getPrismaClient(), jobId);
    await emitBuyerJobWebhookForCurrentStatus(getPrismaClient(), jobId);
    return c.json(result);
  });

  app.post("/assets/upload-intents", requireBuyerApiKey("assets:create"), async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{ contentHash?: string; mimeType?: string; maxBytes?: number }>();
    if (!body.contentHash?.startsWith("sha256:")) {
      return c.json({ error: "INVALID_INPUT", message: "contentHash must be sha256:…" }, 400);
    }
    try {
      const result = await createBuyerUploadSlot(getPrismaClient(), {
        buyerId: user.id,
        contentHash: body.contentHash,
        mimeType: body.mimeType,
        maxBytes: body.maxBytes,
      });
      return c.json(
        {
          assetId: result.asset.id,
          uploadUrl: result.uploadUrl,
          expiresInSeconds: result.expiresInSeconds,
        },
        201,
      );
    } catch (err) {
      if (err instanceof Error && err.message === "OBJECT_STORAGE_NOT_CONFIGURED") {
        return c.json({ error: "OBJECT_STORAGE_NOT_CONFIGURED" }, 503);
      }
      throw err;
    }
  });

  app.post("/assets/:id/finalize", requireBuyerApiKey("assets:create"), async (c) => {
    const user = c.get("user");
    try {
      const result = await confirmBuyerStoredAssetUpload(
        getPrismaClient(),
        user.id,
        c.req.param("id") ?? "",
      );
      return c.json(result);
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        return c.json({ error: "NOT_FOUND" }, 404);
      }
      throw err;
    }
  });

  app.get("/assets/:id", requireBuyerApiKey("assets:read"), async (c) => {
    const user = c.get("user");
    const asset = await getPrismaClient().storedAsset.findFirst({
      where: { id: c.req.param("id") ?? "", buyerId: user.id },
    });
    if (!asset) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({
      asset: {
        id: asset.id,
        purpose: asset.purpose,
        contentHash: asset.contentHash,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes.toString(),
        uploadConfirmedAt: asset.uploadConfirmedAt?.toISOString() ?? null,
      },
    });
  });

  return app;
}
