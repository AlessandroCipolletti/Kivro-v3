import {
  parseCapabilityContract,
  parsePublicPermissionManifest,
} from "@kivro/contracts";
import type {
  Capability,
  CapabilityVersion,
  Prisma,
  PrismaClient,
  SellerProfile,
} from "@kivro/database";
import { hashPermissionManifest } from "./manifest-hash.js";

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
  if (capability.status === "PUBLISHED" && capability.currentVersionId) {
    throw new Error("ALREADY_PUBLISHED");
  }

  const contract = parseCapabilityContract(input.contract);
  const permissionManifest = parsePublicPermissionManifest(input.permissionManifest);

  const device = await db.workerDevice.findFirst({
    where: { id: input.workerDeviceId, sellerProfileId },
  });
  if (!device) {
    throw new Error("WORKER_DEVICE_NOT_FOUND");
  }

  const manifestHash = hashPermissionManifest(permissionManifest);
  const versionNumber = 1;

  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const version = await tx.capabilityVersion.create({
      data: {
        capabilityId: capability.id,
        versionNumber,
        versionLabel: `${versionNumber}.0.0`,
        inputSchema: toJsonValue(contract.inputs),
        outputSchema: toJsonValue(contract.output),
        publicDescription: contract.description,
        internalManifestHash: manifestHash,
        permissionManifest: toJsonValue(permissionManifest),
        permissionSummary: toJsonValue({
          selectedSkills: [],
          manifestVersion: permissionManifest.manifestVersion,
        }),
        priceSnapshotCents: contract.priceTierCents,
        currency: contract.currency,
        publishedAt: new Date(),
      },
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
