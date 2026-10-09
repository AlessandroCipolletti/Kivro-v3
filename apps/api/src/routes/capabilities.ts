import { buildBuyerTrustSummary } from "@kivro/capability-publish";
import { parseCapabilityContract, parseWorkerManifest } from "@kivro/contracts";
import { getPrismaClient } from "@kivro/database";
import {
  buildBuyerFormSchema,
  buildJobInputManifest,
  prepareAgentJobSubmission,
  validateBuyerInput,
  type JobAssetRef,
} from "@kivro/job-io";
import { buildInternetPermissionSummary } from "@kivro/research-broker";
import {
  evaluateCapabilityAvailability,
  summarizeMarketplaceAvailability,
} from "@kivro/job-scheduling";
import { Hono } from "hono";

export function marketplaceCapabilityRoutes(): Hono {
  const app = new Hono();

  app.get("/capabilities", async (c) => {
    const rows = await getPrismaClient().capability.findMany({
      where: { status: "PUBLISHED", currentVersionId: { not: null } },
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
    const row = await getPrismaClient().capability.findFirst({
      where: { slug, status: "PUBLISHED", currentVersionId: { not: null } },
      include: {
        currentVersion: true,
        sellerProfile: { select: { id: true, displayName: true, verificationStatus: true } },
      },
    });
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
    const privacyDisclosure = {
      executionModel:
        "Jobs execute on seller-controlled hardware in an isolated marketplace worker sandbox; the seller's worker processes your inputs for this capability.",
      dataHandling:
        internetDisclosure?.buyerDetail?.join(" ") ??
        "See trust summary for network and tool permissions for this published version.",
      retention:
        "Kivro temporarily stores uploaded inputs and completed deliverables so you can download results; see Legal for retention details.",
      thirdPartyServices:
        externalProcessors.length > 0
          ? externalProcessors
          : ["Seller has not declared external processors for this version; LLM or API use may still apply per permissions."],
      llmDisclosure:
        "When inference permissions are enabled, configured LLM providers may receive job content per the published permission manifest.",
    };
    return c.json({
      capability: row,
      seller: row.sellerProfile,
      buyerTrust,
      buyerForm,
      internetDisclosure,
      privacyDisclosure,
      examples: contract?.examples ?? [],
      outputSummary: contract?.output,
      availability: scheduleAwareness,
      reviews: {
        average: row.rating,
        count: row.reviewCount,
      },
    });
  });

  app.post("/capabilities/:slug/prepare-agent-input", async (c) => {
    const slug = c.req.param("slug");
    const row = await getPrismaClient().capability.findFirst({
      where: { slug, status: "PUBLISHED", currentVersionId: { not: null } },
      include: { currentVersion: true },
    });
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
    const row = await getPrismaClient().capability.findFirst({
      where: { slug, status: "PUBLISHED", currentVersionId: { not: null } },
      include: { currentVersion: true },
    });
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
