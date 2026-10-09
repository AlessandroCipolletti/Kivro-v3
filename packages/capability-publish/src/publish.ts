import {
  parseCapabilityContract,
  parseDependencyGraph,
  parseInferenceDependency,
  parsePublicPermissionManifest,
  hashWorkerManifest,
  type WorkerManifest,
} from "@kivro/contracts";
import { permissionConsentRows } from "./consent-records.js";
import { checkContractDependencyCompatibility } from "./contract-compatibility.js";
import { findPublishBlockers } from "./dependency-analyze.js";
import { verifyWorkerManifestSkillHashes } from "./skill-hash-verify.js";
import type {
  Capability,
  CapabilityVersion,
  Prisma,
  PrismaClient,
  SellerProfile,
} from "@kivro/database";
import { hashPermissionManifest } from "./manifest-hash.js";
import { diffWorkerManifestPermissions, hasPermissionExpansion } from "./permission-diff.js";
import { validatePublishSecurity } from "./security-publish-gate.js";
import { finalizeWorkerManifest, verifyWorkerManifestPayload } from "./worker-manifest-verify.js";
import { validateAndNormalizeCapabilityContract } from "@kivro/job-io";
import { validateInternetPolicyForPublish } from "./internet-publish-gate.js";
import { randomUUID } from "node:crypto";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function ensureSellerProfile(
  db: PrismaClient,
  userId: string,
  displayName?: string,
): Promise<SellerProfile> {
  const existing = await db.sellerProfile.findUnique({ where: { userId } });
  if (existing) {
    return existing;
  }
  return db.sellerProfile.create({
    data: {
      userId,
      displayName: displayName ?? "Seller",
    },
  });
}

export interface CreateDraftInput {
  slug: string;
  contract: unknown;
  permissionManifest: unknown;
}

export async function createDraftCapability(
  db: PrismaClient,
  sellerProfileId: string,
  input: CreateDraftInput,
): Promise<Capability> {
  if (!SLUG_RE.test(input.slug)) {
    throw new Error("INVALID_SLUG");
  }
  const contract = parseCapabilityContract(input.contract);
  parsePublicPermissionManifest(input.permissionManifest);

  return db.capability.create({
    data: {
      sellerProfileId,
      slug: input.slug,
      name: contract.name,
      description: contract.description,
      status: "DRAFT",
      priceTierCents: contract.priceTierCents,
      currency: contract.currency,
    },
  });
}

export interface PublishInput {
  workerDeviceId: string;
  localWorkerId: string;
  contract: unknown;
  permissionManifest: unknown;
  workerManifest: unknown;
  inferenceDependency: unknown;
  executionModelAcknowledged: boolean;
  permissionExpansionAcknowledged?: boolean;
  packageAssetIds?: string[];
  dependencyGraph: unknown;
}

export async function publishCapability(
  db: PrismaClient,
  sellerProfileId: string,
  capabilityId: string,
  input: PublishInput,
): Promise<{ capability: Capability; version: CapabilityVersion }> {
  const capability = await db.capability.findFirst({
    where: { id: capabilityId, sellerProfileId },
  });
  if (!capability) {
    throw new Error("NOT_FOUND");
  }
  if (!input.executionModelAcknowledged) {
    throw new Error("EXECUTION_MODEL_NOT_ACKNOWLEDGED");
  }

  let contract = parseCapabilityContract(input.contract);
  const contractGate = validateAndNormalizeCapabilityContract(contract);
  if (!contractGate.ok) {
    throw new Error(`CONTRACT_INVALID:${contractGate.issues[0] ?? "unknown"}`);
  }
  if (contractGate.normalized) {
    contract = contractGate.normalized;
  }
  const permissionManifest = parsePublicPermissionManifest(input.permissionManifest);
  const inferenceDependency = parseInferenceDependency(input.inferenceDependency);
  const { manifest: workerManifestTemplate } = verifyWorkerManifestPayload(input.workerManifest);
  const versionId = randomUUID();
  let { manifest: workerManifest, hash: workerManifestHash } = finalizeWorkerManifest(
    workerManifestTemplate,
    { capabilityVersionId: versionId, workerDeviceId: input.workerDeviceId },
  );

  const internetGate = validateInternetPolicyForPublish(workerManifest);
  if (!internetGate.ok) {
    throw new Error(`INTERNET_POLICY_INVALID:${internetGate.issues[0] ?? "unknown"}`);
  }
  workerManifest = internetGate.manifest;
  workerManifestHash = hashWorkerManifest(workerManifest);

  const device = await db.workerDevice.findFirst({
    where: { id: input.workerDeviceId, sellerProfileId },
  });
  if (!device) {
    throw new Error("WORKER_DEVICE_NOT_FOUND");
  }

  const hashCheck = verifyWorkerManifestSkillHashes(workerManifest);
  if (!hashCheck.ok) {
    throw new Error("SKILL_HASH_MISMATCH");
  }

  const security = validatePublishSecurity(workerManifest);
  if (!security.ok) {
    throw new Error(`SECURITY_PREFLIGHT_FAILED:${security.issues[0] ?? "unknown"}`);
  }

  const latest = await db.capabilityVersion.findFirst({
    where: { capabilityId: capability.id },
    orderBy: { versionNumber: "desc" },
  });
  const previousManifest = latest?.workerManifest as WorkerManifest | undefined;
  const permissionDiff = diffWorkerManifestPermissions(previousManifest ?? null, workerManifest);
  if (
    previousManifest &&
    hasPermissionExpansion(permissionDiff) &&
    !input.permissionExpansionAcknowledged
  ) {
    throw new Error("PERMISSION_EXPANSION_REQUIRES_ACK");
  }

  const dependencyGraph = parseDependencyGraph(input.dependencyGraph);
  const blockers = findPublishBlockers(dependencyGraph);
  if (blockers.length > 0) {
    throw new Error(`PUBLISH_BLOCKED:${blockers[0]}`);
  }
  checkContractDependencyCompatibility(
    contract,
    workerManifest.skills.map((s) => s.name),
  );

  const manifestHash = hashPermissionManifest(permissionManifest);
  const versionNumber = (latest?.versionNumber ?? 0) + 1;

  const supplyChainSnapshot = {
    supplyChainVersion: 1,
    openClawVersion: device.openClawVersion,
    workerVersion: device.workerVersion,
    policyVersion: "1",
    recordedAt: new Date().toISOString(),
  };

  const packageAssetIds = input.packageAssetIds ?? [];
  if (packageAssetIds.length > 0) {
    const assets = await db.storedAsset.findMany({
      where: {
        id: { in: packageAssetIds },
        sellerProfileId,
        uploadConfirmedAt: { not: null },
      },
    });
    if (assets.length !== packageAssetIds.length) {
      throw new Error("PACKAGE_ASSET_INVALID");
    }
  }

  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const version = await tx.capabilityVersion.create({
      data: {
        id: versionId,
        capabilityId: capability.id,
        versionNumber,
        versionLabel: `${versionNumber}.0.0`,
        dependencyGraphSnapshot: toJsonValue(dependencyGraph),
        supplyChainSnapshot: toJsonValue(supplyChainSnapshot),
        inputSchema: toJsonValue(contract.inputs),
        outputSchema: toJsonValue(contract.output),
        publicDescription: contract.description,
        internalManifestHash: manifestHash,
        permissionManifest: toJsonValue(permissionManifest),
        permissionSummary: toJsonValue({
          selectedSkills: workerManifest.skills.map((s) => s.name),
          manifestVersion: permissionManifest.manifestVersion,
        }),
        workerManifest: toJsonValue(workerManifest),
        workerManifestHash,
        inferenceDependency: toJsonValue(inferenceDependency),
        priceSnapshotCents: contract.priceTierCents,
        currency: contract.currency,
        publishedAt: new Date(),
      },
    });

    if (packageAssetIds.length > 0) {
      await tx.capabilityVersionAsset.createMany({
        data: packageAssetIds.map((storedAssetId) => ({
          capabilityVersionId: version.id,
          storedAssetId,
          role: "package",
        })),
      });
    }

    await tx.permissionConsentRecord.createMany({
      data: permissionConsentRows(
        sellerProfileId,
        version.id,
        device.id,
        manifestHash,
        permissionManifest,
      ),
    });

    await tx.localWorkerBinding.create({
      data: {
        capabilityVersionId: version.id,
        workerDeviceId: device.id,
        localWorkerId: input.localWorkerId,
      },
    });

    const updated = await tx.capability.update({
      where: { id: capability.id },
      data: {
        status: "PUBLISHED",
        name: contract.name,
        description: contract.description,
        priceTierCents: contract.priceTierCents,
        currentVersionId: version.id,
      },
    });

    return { capability: updated, version };
  });
}
