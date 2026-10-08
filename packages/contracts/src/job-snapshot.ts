import { z } from "zod";
import { CapabilityInputContractSchema, CapabilityOutputContractSchema } from "./capability-io.js";
import { PublicPermissionManifestSchema } from "./permission-manifest.js";
import { parseWithSchema } from "./validate.js";

/** Master Spec §308 — immutable job purchase/execution snapshots. */
export const JobPurchaseSnapshotSchema = z.object({
  snapshotVersion: z.literal(1),
  capabilityId: z.string().uuid(),
  capabilityVersionId: z.string().uuid(),
  versionNumber: z.number().int().positive(),
  versionLabel: z.string().min(1),
  priceSnapshotCents: z.number().int().nonnegative(),
  currency: z.literal("USD"),
  permissionManifestSnapshot: PublicPermissionManifestSchema,
  inputContractSnapshot: CapabilityInputContractSchema,
  outputContractSnapshot: CapabilityOutputContractSchema,
});

export type JobPurchaseSnapshot = z.infer<typeof JobPurchaseSnapshotSchema>;

export function parseJobPurchaseSnapshot(data: unknown): JobPurchaseSnapshot {
  return parseWithSchema(JobPurchaseSnapshotSchema, data);
}
