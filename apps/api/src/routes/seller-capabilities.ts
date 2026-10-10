import {
  buildCapabilityPackageFromVersion,
  buildDependencyGraph,
  checkContractDependencyCompatibility,
  createDraftCapability,
  ensureSellerProfile,
  DiscoverySnapshotSchema,
  findPublishBlockers,
  ImportConsentSchema,
  pauseCapability,
  resumeCapability,
  publishCapability,
  rollbackCapabilityVersion,
  suggestInputContractFromDiscovery,
  validateImportConsent,
} from "@kivro/capability-publish";
import { buildSemanticVersionDiff } from "@kivro/seller-experience";
import { parseCapabilityContract, parseInternetResearchPolicy } from "@kivro/contracts";
import { getPrismaClient } from "@kivro/database";
import {
  buildBuyerFormSchema,
  validateAndNormalizeCapabilityContract,
} from "@kivro/job-io";
import {
  buildInternetPermissionSummary,
  clampInternetResearchPolicy,
  validateInternetResearchPolicy,
} from "@kivro/research-broker";
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

  app.post("/capabilities/:id/resume", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    try {
      const capability = await resumeCapability(
        getPrismaClient(),
        profile.id,
        c.req.param("id"),
      );
      return c.json({ capability });
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        return c.json({ error: "NOT_FOUND" }, 404);
      }
      throw err;
    }
  });

  app.post("/capabilities/:id/pause", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    try {
      const capability = await pauseCapability(
        getPrismaClient(),
        profile.id,
        c.req.param("id"),
      );
      return c.json({ capability });
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        return c.json({ error: "NOT_FOUND" }, 404);
      }
      throw err;
    }
  });

  app.post("/capabilities/:id/rollback", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const body = await c.req.json<{ targetVersionId?: string }>();
    if (!body.targetVersionId) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    try {
      const result = await rollbackCapabilityVersion(
        getPrismaClient(),
        profile.id,
        c.req.param("id"),
        body.targetVersionId,
      );
      return c.json(result);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "NOT_FOUND") {
          return c.json({ error: "NOT_FOUND" }, 404);
        }
        if (err.message === "ROLLBACK_NOT_READY") {
          return c.json({ error: err.message }, 409);
        }
      }
      throw err;
    }
  });

  app.get("/capabilities/:id/versions", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capability = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("id"), sellerProfileId: profile.id },
    });
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const versions = await getPrismaClient().capabilityVersion.findMany({
      where: { capabilityId: capability.id },
      orderBy: { versionNumber: "desc" },
    });
    return c.json({ versions, currentVersionId: capability.currentVersionId });
  });

  app.get("/capabilities/:id/version-diff", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const fromId = c.req.query("fromVersionId");
    const toId = c.req.query("toVersionId");
    if (!fromId || !toId) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const capability = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("id"), sellerProfileId: profile.id },
    });
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const [from, to] = await Promise.all([
      getPrismaClient().capabilityVersion.findFirst({
        where: { id: fromId, capabilityId: capability.id },
      }),
      getPrismaClient().capabilityVersion.findFirst({
        where: { id: toId, capabilityId: capability.id },
      }),
    ]);
    if (!from || !to) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({ diff: buildSemanticVersionDiff(from, to) });
  });

  app.get("/capabilities/:id/package", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capability = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("id"), sellerProfileId: profile.id },
      include: { currentVersion: true },
    });
    if (!capability?.currentVersion) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const pkg = buildCapabilityPackageFromVersion(
      capability.currentVersion,
      {
        name: capability.name,
        description: capability.description,
        currency: "USD",
        priceTierCents: capability.priceTierCents ?? capability.currentVersion.priceSnapshotCents,
        inputs: capability.currentVersion.inputSchema,
        output: capability.currentVersion.outputSchema,
      },
    );
    return c.json({ package: pkg });
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
      workerManifest?: unknown;
      inferenceDependency?: unknown;
      executionModelAcknowledged?: boolean;
      permissionExpansionAcknowledged?: boolean;
      packageAssetIds?: string[];
      dependencyGraph?: unknown;
      discovery?: unknown;
      consent?: unknown;
      rootName?: string;
      externalProcessors?: string[];
    }>();
    if (
      !body.workerDeviceId ||
      !body.localWorkerId ||
      body.contract === undefined ||
      body.permissionManifest === undefined ||
      body.workerManifest === undefined ||
      body.inferenceDependency === undefined ||
      body.executionModelAcknowledged !== true
    ) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }

    let dependencyGraph = body.dependencyGraph;
    if (!dependencyGraph && body.discovery && body.consent) {
      const discovery = DiscoverySnapshotSchema.safeParse(body.discovery);
      const consent = ImportConsentSchema.safeParse(body.consent);
      if (!discovery.success || !consent.success) {
        return c.json({ error: "INVALID_INPUT" }, 400);
      }
      const consentOk = validateImportConsent(discovery.data, consent.data);
      if (!consentOk.ok) {
        return c.json({ error: consentOk.code }, 400);
      }
      dependencyGraph = buildDependencyGraph(
        discovery.data,
        consent.data,
        body.rootName ?? "capability",
      );
    }
    if (!dependencyGraph) {
      return c.json({ error: "DEPENDENCY_GRAPH_REQUIRED" }, 400);
    }

    try {
      const result = await publishCapability(getPrismaClient(), profile.id, capabilityId, {
        workerDeviceId: body.workerDeviceId,
        localWorkerId: body.localWorkerId,
        contract: body.contract,
        permissionManifest: body.permissionManifest,
        workerManifest: body.workerManifest,
        inferenceDependency: body.inferenceDependency,
        executionModelAcknowledged: true,
        permissionExpansionAcknowledged: body.permissionExpansionAcknowledged === true,
        packageAssetIds: body.packageAssetIds,
        dependencyGraph,
        externalProcessors: Array.isArray(body.externalProcessors)
          ? body.externalProcessors.filter((s: unknown) => typeof s === "string")
          : undefined,
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
        if (err.message === "EXECUTION_MODEL_NOT_ACKNOWLEDGED") {
          return c.json({ error: err.message }, 400);
        }
        if (err.message === "PACKAGE_ASSET_INVALID") {
          return c.json({ error: err.message }, 400);
        }
        if (err.message === "SKILL_HASH_MISMATCH") {
          return c.json({ error: err.message }, 400);
        }
        if (err.message.startsWith("PUBLISH_BLOCKED:")) {
          return c.json({ error: err.message.replace("PUBLISH_BLOCKED:", "") }, 409);
        }
        if (err.message.startsWith("SECURITY_PREFLIGHT_FAILED:")) {
          return c.json(
            { error: err.message.replace("SECURITY_PREFLIGHT_FAILED:", "") },
            400,
          );
        }
        if (err.message === "PERMISSION_EXPANSION_REQUIRES_ACK") {
          return c.json({ error: err.message }, 400);
        }
        if (err.message.startsWith("CONTRACT_INVALID:")) {
          return c.json(
            { error: err.message.replace("CONTRACT_INVALID:", "") },
            400,
          );
        }
        if (err.message.startsWith("INTERNET_POLICY_INVALID:")) {
          return c.json(
            { error: err.message.replace("INTERNET_POLICY_INVALID:", "") },
            400,
          );
        }
      }
      throw err;
    }
  });

  app.post("/internet/validate", async (c) => {
    const body = await c.req.json<{ policy?: unknown }>();
    if (body.policy === undefined) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    try {
      const parsed = parseInternetResearchPolicy(body.policy);
      const validation = validateInternetResearchPolicy(parsed);
      const clamped = clampInternetResearchPolicy(parsed);
      const disclosure = buildInternetPermissionSummary({
        manifestVersion: 1,
        workerId: "00000000-0000-0000-0000-000000000000",
        capabilityVersionId: "00000000-0000-0000-0000-000000000000",
        runtime: { type: "openclaw", supportedVersionRange: "1.x" },
        skills: [],
        tools: { allow: [], deny: ["browser"] },
        resources: [],
        network: { default: "deny", allow: [] },
        limits: {
          timeoutSeconds: 120,
          memoryMb: 1024,
          cpu: 1,
          maxPids: 128,
          maxInputBytes: 0,
          maxOutputBytes: 0,
        },
        internet: clamped,
      });
      return c.json({ ...validation, policy: clamped, sellerSummary: disclosure.sellerSummary });
    } catch {
      return c.json({ error: "INVALID_POLICY" }, 400);
    }
  });

  app.post("/contract/validate", async (c) => {
    const body = await c.req.json<{ contract?: unknown }>();
    if (body.contract === undefined) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    try {
      const contract = parseCapabilityContract(body.contract);
      const result = validateAndNormalizeCapabilityContract(contract);
      const buyerForm = result.normalized
        ? buildBuyerFormSchema(result.normalized)
        : undefined;
      return c.json({ ...result, buyerForm });
    } catch {
      return c.json({ error: "INVALID_CONTRACT" }, 400);
    }
  });

  app.post("/import/suggest-input-contract", async (c) => {
    const body = await c.req.json<{ discovery?: unknown }>();
    const discovery = DiscoverySnapshotSchema.safeParse(body.discovery);
    if (!discovery.success) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    return c.json(suggestInputContractFromDiscovery(discovery.data));
  });

  app.post("/import/analyze-dependencies", async (c) => {
    const body = await c.req.json<{
      discovery?: unknown;
      consent?: unknown;
      rootName?: string;
      contract?: unknown;
    }>();
    const discovery = DiscoverySnapshotSchema.safeParse(body.discovery);
    const consent = ImportConsentSchema.safeParse(body.consent);
    if (!discovery.success || !consent.success) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const consentOk = validateImportConsent(discovery.data, consent.data);
    if (!consentOk.ok) {
      return c.json({ error: consentOk.code }, 400);
    }
    const graph = buildDependencyGraph(
      discovery.data,
      consent.data,
      body.rootName ?? "capability",
    );
    const blockers = findPublishBlockers(graph);
    const warnings =
      body.contract !== undefined
        ? checkContractDependencyCompatibility(
            parseCapabilityContract(body.contract),
            consent.data.selectedSkills,
          )
        : [];
    return c.json({ graph, blockers, warnings });
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
