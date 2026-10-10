import { buildBuyerTrustSummary } from "@kivro/capability-publish";
import { parseCapabilityContract, parseWorkerManifest } from "@kivro/contracts";
import { getPrismaClient } from "@kivro/database";
import { resolveSessionUser } from "@kivro/auth";
import {
  buildBuyerFormSchema,
  buildJobInputManifest,
  prepareAgentJobSubmission,
  validateBuyerInput,
  type JobAssetRef,
} from "@kivro/job-io";
import { buildInternetPermissionSummary } from "@kivro/research-broker";
import { buildPrivacyDisclosureFromManifest, computeSellerReliabilityForCapability } from "@kivro/buyer-experience";
import {
  evaluateCapabilityAvailability,
  summarizeMarketplaceAvailability,
} from "@kivro/job-scheduling";
import { getCookie } from "hono/cookie";
import { Hono } from "hono";
import type { Context } from "hono";
import { sessionCookieName } from "../env.js";
import { findVisibleCapability, publicMarketplaceWhere } from "../services/capability-visibility.js";

async function optionalViewerId(c: Context): Promise<string | null> {
  const user = await resolveSessionUser(getPrismaClient(), getCookie(c, sessionCookieName()));
  return user?.status === "ACTIVE" ? user.id : null;
}

export function marketplaceCapabilityRoutes(): Hono {
  const app = new Hono();

  app.get("/capabilities", async (c) => {
    const rows = await getPrismaClient().capability.findMany({
      where: publicMarketplaceWhere,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        priceTierCents: true,
        currency: true,
        rating: true,
        jobCount: true,
        currentVersion: {
          select: {
            id: true,
            versionLabel: true,
            inputSchema: true,
            outputSchema: true,
            permissionSummary: true,
            publishedAt: true,
          },
        },
      },
    });
    const includeAvailability = c.req.query("includeAvailability") === "true";
    if (!includeAvailability) {
      return c.json({ capabilities: rows });
    }
    const summaries = await summarizeMarketplaceAvailability(
      getPrismaClient(),
      rows.map((r) => r.id),
    );
    const byId = new Map(summaries.map((s) => [s.capabilityId, s]));
    return c.json({
      capabilities: rows.map((row) => ({
        ...row,
        availability: byId.get(row.id) ?? null,
      })),
    });
  });

  app.get("/capabilities/:slug", async (c) => {
    const slug = c.req.param("slug");
    const row = await findVisibleCapability(getPrismaClient(), { slug }, await optionalViewerId(c));
    if (!row) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const version = row.currentVersion;
    let buyerTrust = null;
    let internetDisclosure = null;
    if (version?.workerManifest) {
      try {
        const manifest = parseWorkerManifest(version.workerManifest);
        buyerTrust = buildBuyerTrustSummary(manifest);
        internetDisclosure = buildInternetPermissionSummary(manifest);
      } catch {
        buyerTrust = null;
        internetDisclosure = null;
      }
    }
    const contract =
      row.currentVersion &&
      parseCapabilityContract({
        name: row.name,
        description: row.description,
        currency: row.currentVersion.currency,
        priceTierCents: row.currentVersion.priceSnapshotCents,
        inputs: row.currentVersion.inputSchema,
        output: row.currentVersion.outputSchema,
      });
    const buyerForm = contract ? buildBuyerFormSchema(contract) : null;
    const availability = await evaluateCapabilityAvailability(getPrismaClient(), row.id);
    const scheduleAwareness =
      "error" in availability
        ? null
        : {
            status: availability.buyerAvailability,
            accepting: availability.accepting,
            nextAvailableAt: availability.nextAvailableAt ?? null,
          };
    const externalProcessors =
      version && Array.isArray(version.externalProcessorsSnapshot)
        ? (version.externalProcessorsSnapshot as string[])
        : [];
    const privacyDisclosure = buildPrivacyDisclosureFromManifest({
      permissionManifest: version?.permissionManifest,
      externalProcessors,
      internetSummary: internetDisclosure?.buyerDetail,
    });
    const reliability = await computeSellerReliabilityForCapability(getPrismaClient(), row.id);
    return c.json({
      capability: row,
      seller: {
        id: row.sellerProfile.id,
        displayName: row.sellerProfile.displayName,
        verificationStatus: row.sellerProfile.verificationStatus,
      },
      buyerTrust,
      buyerForm,
      internetDisclosure,
      privacyDisclosure,
      examples: contract?.examples ?? [],
      publishedExamples: row.publishedExamples.map((example) => ({
        id: example.id,
        title: example.title,
        description: example.description,
        inputValues: example.inputValues,
        outputValues: example.outputValues,
        source: example.source,
      })),
      outputSummary: contract?.output,
      availability: scheduleAwareness,
      reviews: {
        average: row.rating,
        count: row.reviewCount,
      },
      sellerReliability: reliability,
    });
  });

  app.post("/capabilities/:slug/prepare-agent-input", async (c) => {
    const slug = c.req.param("slug");
    const row = await findVisibleCapability(getPrismaClient(), { slug }, await optionalViewerId(c));
    if (!row?.currentVersion) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const body = await c.req.json<{
      instructions?: string;
      attachments?: Array<{
        filename: string;
        assetId: string;
        sizeBytes: number;
        sniffedMimeType?: string;
      }>;
    }>();
    const contract = parseCapabilityContract({
      name: row.name,
      description: row.description,
      currency: row.currentVersion.currency,
      priceTierCents: row.currentVersion.priceSnapshotCents,
      inputs: row.currentVersion.inputSchema,
      output: row.currentVersion.outputSchema,
    });
    const prepared = prepareAgentJobSubmission(contract, body);
    const availability = await evaluateCapabilityAvailability(getPrismaClient(), row.id);
    return c.json({
      ...prepared,
      capabilityAvailability:
        "error" in availability
          ? null
          : {
              status: availability.buyerAvailability,
              nextAvailableAt: availability.nextAvailableAt ?? null,
            },
    });
  });

  app.post("/capabilities/:slug/validate-input", async (c) => {
    const slug = c.req.param("slug");
    const row = await findVisibleCapability(getPrismaClient(), { slug }, await optionalViewerId(c));
    if (!row?.currentVersion) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const body = await c.req.json<{
      inputs?: Record<string, unknown>;
      assets?: Record<string, JobAssetRef[]>;
    }>();
    const contract = parseCapabilityContract({
      name: row.name,
      description: row.description,
      currency: row.currentVersion.currency,
      priceTierCents: row.currentVersion.priceSnapshotCents,
      inputs: row.currentVersion.inputSchema,
      output: row.currentVersion.outputSchema,
    });
    const validation = validateBuyerInput({
      contract,
      inputs: body.inputs ?? {},
      assets: body.assets ?? {},
    });
    const manifest = validation.ok
      ? buildJobInputManifest(contract, {
          inputs: body.inputs ?? {},
          assets: Object.fromEntries(
            Object.entries(body.assets ?? {}).map(([key, refs]) => [
              key,
              refs.map((r) => ({ assetId: r.assetId, filename: r.filename })),
            ]),
          ),
        })
      : undefined;
    return c.json({ validation, manifest });
  });

  return app;
}
