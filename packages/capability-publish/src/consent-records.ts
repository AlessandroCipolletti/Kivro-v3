import type { PublicPermissionManifest } from "@kivro/contracts";
import type { Prisma } from "@kivro/database";

export function permissionConsentRows(
  sellerProfileId: string,
  capabilityVersionId: string,
  workerDeviceId: string | undefined,
  manifestHash: string,
  manifest: PublicPermissionManifest,
): Prisma.PermissionConsentRecordCreateManyInput[] {
  return manifest.categories
    .filter((c) => c.state !== "NOT_USED")
    .map((c) => ({
      sellerProfileId,
      capabilityVersionId,
      workerDeviceId,
      permissionType: c.key,
      permissionValue: c.state,
      manifestHash,
    }));
}
