import {
  DiscoverySnapshotSchema,
  ensureSellerProfile,
  ImportConsentSchema,
} from "@kivro/capability-publish";
import {
  parseCapabilityContract,
  parsePublicPermissionManifest,
  type DependencyGraph,
} from "@kivro/contracts";
import { getPrismaClient } from "@kivro/database";
import { validateAndNormalizeCapabilityContract } from "@kivro/job-io";
import {
  assertNoUnconsentedDiscoveryExposure,
  buildAiAssistedDraftProposal,
  buildCloudCredentialRefs,
  buildDraftBuyerPreviewView,
  buildDraftManifestDiff,
  buildEffectivePermissionSummary,
  buildFirstPublicationGuide,
  buildPrivateSellerIdentity,
  buildPublishReadinessReport,
  buildSemanticVersionDiff,
  buildSellerOnboardingStatus,
  buildSellerSecurityDisclosure,
  detectPermissionExpansion,
  sanitizeDoctorReport,
} from "@kivro/seller-experience";
import { parseWorkerManifest } from "@kivro/contracts";
import {
  buildSecurityWarnings,
  deriveWorkerHealthLabel,
  parseWorkerHealthReport,
} from "@kivro/seller-health";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

async function requireOwnedCapability(sellerProfileId: string, capabilityId: string) {
  return getPrismaClient().capability.findFirst({
    where: { id: capabilityId, sellerProfileId },
    include: { currentVersion: true },
  });
}

export function sellerOnboardingRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/onboarding", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const status = await buildSellerOnboardingStatus(getPrismaClient(), profile.id);
    const device = await getPrismaClient().workerDevice.findFirst({
      where: { sellerProfileId: profile.id, status: { not: "REVOKED" } },
    });
    const report = device ? parseWorkerHealthReport(device.lastHealthReport) : null;
    const credentialRefs = buildCloudCredentialRefs({ refs: report?.credentialRefs ?? [] });
    return c.json({
      profileId: profile.id,
      firstPublishedAt: profile.firstPublishedAt?.toISOString() ?? null,
      credentialRefs,
      ...status,
    });
  });

  app.patch("/profile/identity", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const body = await c.req.json<{ displayName?: string; legalNameForKyc?: string | null }>();
    const updated = await getPrismaClient().sellerProfile.update({
      where: { id: profile.id },
      data: {
        ...(body.displayName ? { displayName: body.displayName.slice(0, 80) } : {}),
        ...(body.legalNameForKyc !== undefined
          ? { legalNameForKyc: body.legalNameForKyc?.slice(0, 200) ?? null }
          : {}),
      },
    });
    return c.json({ private: buildPrivateSellerIdentity(updated) });
  });

  app.get("/profile/identity", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    return c.json({ private: buildPrivateSellerIdentity(profile) });
  });

  app.post("/import/validate-discovery-exposure", async (c) => {
    const body = await c.req.json<{
      discovery?: unknown;
      consent?: unknown;
      effectiveSkills?: string[];
      effectiveTools?: string[];
    }>();
    const discovery = DiscoverySnapshotSchema.safeParse(body.discovery);
    const consent = ImportConsentSchema.safeParse(body.consent);
    if (!discovery.success || !consent.success) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const result = assertNoUnconsentedDiscoveryExposure({
      discovery: discovery.data,
      consent: consent.data,
      effectiveSkills: body.effectiveSkills ?? consent.data.selectedSkills,
      effectiveTools: body.effectiveTools ?? consent.data.selectedTools,
    });
    if (!result.ok) {
      return c.json({ error: result.code }, 400);
    }
    return c.json({ ok: true });
  });

  app.post("/import/ai-draft", async (c) => {
    const body = await c.req.json<{ discovery?: unknown }>();
    const discovery = DiscoverySnapshotSchema.safeParse(body.discovery);
    if (!discovery.success) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    return c.json(buildAiAssistedDraftProposal(discovery.data));
  });

  app.post("/capabilities/:id/publish-readiness", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capability = await requireOwnedCapability(profile.id, c.req.param("id"));
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const body = await c.req.json<{
      dependencyGraph?: DependencyGraph;
      contract?: unknown;
      executionModelAcknowledged?: boolean;
      permissionExpansionAcknowledged?: boolean;
      workerManifest?: unknown;
    }>();

    const device = await getPrismaClient().workerDevice.findFirst({
      where: { sellerProfileId: profile.id, status: { not: "REVOKED" } },
    });
    const report = device ? parseWorkerHealthReport(device.lastHealthReport) : null;
    const warnings = device
      ? buildSecurityWarnings({
          report,
          deviceStatus: device.status,
          sellerEmergencyPause: profile.marketplaceEmergencyPause,
          platformSecurityPause: profile.platformSecurityPause,
          platformSecurityReason: profile.platformSecurityPauseReason,
        })
      : [];
    const healthLabel = device
      ? deriveWorkerHealthLabel({
          deviceStatus: device.status,
          lastSeenAt: device.lastSeenAt,
          report,
          sellerEmergencyPause: profile.marketplaceEmergencyPause,
          warnings,
        })
      : "NONE";

    let contractValid = false;
    if (body.contract !== undefined) {
      try {
        const parsed = parseCapabilityContract(body.contract);
        contractValid = validateAndNormalizeCapabilityContract(parsed).ok;
      } catch {
        contractValid = false;
      }
    }

    const payoutReady = profile.payoutsEnabled || profile.connectOnboardingStatus === "COMPLETE";

    let permissionExpansionPending = false;
    if (body.workerManifest && capability.currentVersion?.workerManifest) {
      try {
        const draftManifest = parseWorkerManifest(body.workerManifest);
        const liveManifest = parseWorkerManifest(capability.currentVersion.workerManifest);
        permissionExpansionPending = detectPermissionExpansion(liveManifest, draftManifest);
      } catch {
        permissionExpansionPending = false;
      }
    } else if (body.workerManifest && !capability.currentVersion) {
      try {
        permissionExpansionPending = detectPermissionExpansion(
          null,
          parseWorkerManifest(body.workerManifest),
        );
      } catch {
        permissionExpansionPending = false;
      }
    }

    const cloudRefs = buildCloudCredentialRefs({ refs: report?.credentialRefs ?? [] });
    const staleCredentialRefs = cloudRefs.filter((r) => r.status === "STALE").length;

    const readiness = buildPublishReadinessReport({
      dependencyGraph: body.dependencyGraph ?? null,
      workerPaired: Boolean(device),
      workerHealthLabel: healthLabel,
      executionModelAcknowledged: body.executionModelAcknowledged === true,
      contractValid,
      payoutReady,
      permissionExpansionAcknowledged: body.permissionExpansionAcknowledged,
      permissionExpansionPending,
      staleCredentialRefs,
    });

    return c.json(readiness);
  });

  app.post("/capabilities/:id/draft-preview", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capability = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("id"), sellerProfileId: profile.id },
    });
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const body = await c.req.json<{ contract?: unknown }>();
    if (body.contract === undefined) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const contract = parseCapabilityContract(body.contract);
    const normalized = validateAndNormalizeCapabilityContract(contract);
    if (!normalized.ok || !normalized.normalized) {
      return c.json({ error: "CONTRACT_INVALID", issues: normalized.issues }, 400);
    }
    return c.json(
      buildDraftBuyerPreviewView({
        capabilityName: capability.name,
        capabilitySlug: capability.slug,
        contract: normalized.normalized,
        priceCents: capability.priceTierCents ?? 0,
        currency: capability.currency,
      }),
    );
  });

  app.post("/capabilities/:id/effective-permissions", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capability = await requireOwnedCapability(profile.id, c.req.param("id"));
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const body = await c.req.json<{
      permissionManifest?: unknown;
      dependencyGraph?: DependencyGraph | null;
    }>();
    if (body.permissionManifest === undefined) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const permissionManifest = parsePublicPermissionManifest(body.permissionManifest);
    return c.json(
      buildEffectivePermissionSummary({
        permissionManifest,
        dependencyGraph: body.dependencyGraph ?? null,
      }),
    );
  });

  app.post("/capabilities/:id/draft-manifest-diff", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capability = await requireOwnedCapability(profile.id, c.req.param("id"));
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const body = await c.req.json<{ workerManifest?: unknown }>();
    if (body.workerManifest === undefined) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const draftManifest = parseWorkerManifest(body.workerManifest);
    const liveManifest = capability.currentVersion?.workerManifest
      ? parseWorkerManifest(capability.currentVersion.workerManifest)
      : null;
    return c.json(buildDraftManifestDiff(liveManifest, draftManifest));
  });

  app.get("/capabilities/:id/semantic-version-diff", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const draftVersionId = c.req.query("draftVersionId");
    const capability = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("id"), sellerProfileId: profile.id },
      include: { currentVersion: true },
    });
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const draft = draftVersionId
      ? await getPrismaClient().capabilityVersion.findFirst({
          where: { id: draftVersionId, capabilityId: capability.id },
        })
      : capability.currentVersion;
    if (!draft) {
      return c.json({ error: "NO_DRAFT_VERSION" }, 404);
    }
    const live =
      capability.currentVersionId && capability.currentVersionId !== draft.id
        ? capability.currentVersion
        : null;
    return c.json(buildSemanticVersionDiff(live, draft));
  });

  app.post("/capabilities/:id/security-disclosure", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capability = await requireOwnedCapability(profile.id, c.req.param("id"));
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const body = await c.req.json<{
      permissionManifest?: unknown;
      selectedSkills?: string[];
      selectedTools?: string[];
    }>();
    if (body.permissionManifest === undefined) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const permissionManifest = parsePublicPermissionManifest(body.permissionManifest);
    return c.json(
      buildSellerSecurityDisclosure({
        permissionManifest,
        selectedSkills: body.selectedSkills ?? [],
        selectedTools: body.selectedTools ?? [],
      }),
    );
  });

  app.get("/capabilities/:id/first-publication-guide", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capability = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("id"), sellerProfileId: profile.id },
    });
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json(
      buildFirstPublicationGuide({
        capabilitySlug: capability.slug,
        marketplaceSellerId: profile.id,
        payoutReady: profile.payoutsEnabled,
      }),
    );
  });

  app.post("/doctor/sanitize", async (c) => {
    const body = await c.req.json<{ report?: Record<string, unknown> }>();
    if (!body.report) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    return c.json({ report: sanitizeDoctorReport(body.report) });
  });

  app.get("/credential-refs", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const device = await getPrismaClient().workerDevice.findFirst({
      where: { sellerProfileId: profile.id, status: { not: "REVOKED" } },
    });
    const report = device ? parseWorkerHealthReport(device.lastHealthReport) : null;
    return c.json({ refs: buildCloudCredentialRefs({ refs: report?.credentialRefs ?? [] }) });
  });

  return app;
}
