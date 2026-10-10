import { normalizeEmail } from "@kivro/auth";
import type { Prisma, PrismaClient } from "@kivro/database";
import {
  canPurchaseCapability,
  canViewCapability,
  isCapabilityVisibility,
  MAX_PUBLISHED_EXAMPLES,
  MAX_SELLER_TEST_CASES,
  validateSellerTestCase,
  visibilityTransitionError,
  type CapabilityVisibility,
} from "@kivro/marketplace";

export const publicMarketplaceWhere = {
  status: "PUBLISHED" as const,
  visibility: "PUBLIC" as const,
  currentVersionId: { not: null },
};

const visibleInclude = {
  currentVersion: true,
  sellerProfile: {
    select: {
      id: true,
      userId: true,
      displayName: true,
      verificationStatus: true,
      maintenanceMode: true,
      maintenanceMessage: true,
      maintenanceExpectedReturnAt: true,
    },
  },
  publishedExamples: {
    where: { published: true },
    orderBy: { sortOrder: "asc" as const },
    take: MAX_PUBLISHED_EXAMPLES,
  },
} satisfies Prisma.CapabilityInclude;

export async function findVisibleCapability(
  db: PrismaClient,
  where: { slug: string } | { id: string },
  viewerUserId: string | null,
) {
  const row = await db.capability.findFirst({
    where,
    include: visibleInclude,
  });
  if (!row) {
    return null;
  }
  const isSeller = viewerUserId != null && row.sellerProfile.userId === viewerUserId;
  const grant =
    viewerUserId == null
      ? null
      : await db.capabilityAccessGrant.findUnique({
          where: {
            capabilityId_granteeUserId: {
              capabilityId: row.id,
              granteeUserId: viewerUserId,
            },
          },
        });
  if (
    !canViewCapability({
      status: row.status,
      visibility: row.visibility,
      isSeller,
      hasGrant: Boolean(grant),
    })
  ) {
    return null;
  }
  return row;
}

export async function buyerMayPurchase(
  db: PrismaClient,
  capability: { id: string; status: string; visibility: CapabilityVisibility },
  buyerUserId: string,
): Promise<boolean> {
  const grant = await db.capabilityAccessGrant.findUnique({
    where: {
      capabilityId_granteeUserId: {
        capabilityId: capability.id,
        granteeUserId: buyerUserId,
      },
    },
  });
  return canPurchaseCapability({
    status: capability.status,
    visibility: capability.visibility,
    hasGrant: Boolean(grant),
  });
}

export async function setSellerCapabilityVisibility(
  db: PrismaClient,
  input: { sellerProfileId: string; capabilityId: string; visibility: string },
) {
  if (!isCapabilityVisibility(input.visibility)) {
    throw new Error("INVALID_VISIBILITY");
  }
  const visibility = input.visibility;
  const capability = await db.capability.findFirst({
    where: { id: input.capabilityId, sellerProfileId: input.sellerProfileId },
  });
  if (!capability) {
    throw new Error("NOT_FOUND");
  }
  const blocked = visibilityTransitionError({
    to: visibility,
    status: capability.status,
    hasCurrentVersion: Boolean(capability.currentVersionId),
    hasPrice: capability.priceTierCents != null,
  });
  if (blocked) {
    throw new Error(blocked);
  }
  return db.capability.update({
    where: { id: capability.id },
    data: { visibility },
  });
}

export async function grantCapabilityAccess(
  db: PrismaClient,
  input: { sellerProfileId: string; capabilityId: string; email: string },
) {
  const capability = await db.capability.findFirst({
    where: { id: input.capabilityId, sellerProfileId: input.sellerProfileId },
  });
  if (!capability) {
    throw new Error("NOT_FOUND");
  }
  const grantee = await db.user.findUnique({ where: { email: normalizeEmail(input.email) } });
  if (!grantee) {
    throw new Error("USER_NOT_FOUND");
  }
  return db.capabilityAccessGrant.upsert({
    where: {
      capabilityId_granteeUserId: {
        capabilityId: capability.id,
        granteeUserId: grantee.id,
      },
    },
    update: {},
    create: { capabilityId: capability.id, granteeUserId: grantee.id },
  });
}

export async function revokeCapabilityAccess(
  db: PrismaClient,
  input: { sellerProfileId: string; capabilityId: string; granteeUserId: string },
) {
  const capability = await db.capability.findFirst({
    where: { id: input.capabilityId, sellerProfileId: input.sellerProfileId },
  });
  if (!capability) {
    throw new Error("NOT_FOUND");
  }
  await db.capabilityAccessGrant.deleteMany({
    where: { capabilityId: capability.id, granteeUserId: input.granteeUserId },
  });
}

export async function addCapabilityExample(
  db: PrismaClient,
  input: {
    sellerProfileId: string;
    capabilityId: string;
    title: string;
    description?: string;
    inputValues: Record<string, unknown>;
    outputValues: Record<string, unknown>;
    source: "REAL_EXECUTION" | "SELLER_CURATED";
    published: boolean;
  },
) {
  const capability = await db.capability.findFirst({
    where: { id: input.capabilityId, sellerProfileId: input.sellerProfileId },
  });
  if (!capability) {
    throw new Error("NOT_FOUND");
  }
  if (!input.title.trim()) {
    throw new Error("INVALID_EXAMPLE");
  }
  if (input.published) {
    const publishedCount = await db.capabilityExample.count({
      where: { capabilityId: capability.id, published: true },
    });
    if (publishedCount >= MAX_PUBLISHED_EXAMPLES) {
      throw new Error("EXAMPLE_LIMIT");
    }
  }
  const last = await db.capabilityExample.findFirst({
    where: { capabilityId: capability.id },
    orderBy: { sortOrder: "desc" },
  });
  return db.capabilityExample.create({
    data: {
      capabilityId: capability.id,
      capabilityVersionId: capability.currentVersionId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      inputValues: input.inputValues as Prisma.InputJsonValue,
      outputValues: input.outputValues as Prisma.InputJsonValue,
      source: input.source,
      published: input.published,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });
}

export async function addSellerTestCase(
  db: PrismaClient,
  input: {
    sellerProfileId: string;
    capabilityId: string;
    name: string;
    inputValues: Record<string, unknown>;
    expectedOutput?: Record<string, unknown>;
  },
) {
  if (validateSellerTestCase(input) !== "ok") {
    throw new Error("INVALID_TEST_CASE");
  }
  const capability = await db.capability.findFirst({
    where: { id: input.capabilityId, sellerProfileId: input.sellerProfileId },
  });
  if (!capability) {
    throw new Error("NOT_FOUND");
  }
  const count = await db.capabilityTestCase.count({ where: { capabilityId: capability.id } });
  if (count >= MAX_SELLER_TEST_CASES) {
    throw new Error("TEST_CASE_LIMIT");
  }
  return db.capabilityTestCase.create({
    data: {
      capabilityId: capability.id,
      name: input.name.trim(),
      inputValues: input.inputValues as Prisma.InputJsonValue,
      expectedOutput: input.expectedOutput
        ? (input.expectedOutput as Prisma.InputJsonValue)
        : undefined,
    },
  });
}
