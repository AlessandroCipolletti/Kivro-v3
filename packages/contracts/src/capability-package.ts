import { z } from "zod";
import { DependencyGraphSchema } from "./dependency-graph.js";
import { CapabilityContractSchema } from "./capability-io.js";
import { InferenceDependencySchema } from "./inference-dependency.js";
import { PublicPermissionManifestSchema } from "./permission-manifest.js";
import { WorkerManifestSchema } from "./worker-manifest.js";
import { parseWithSchema } from "./validate.js";

/** §114 — portable capability package (no secrets). */
export const CapabilityPackageSchema = z.object({
  packageVersion: z.literal(1),
  manifest: WorkerManifestSchema,
  dependencyGraph: DependencyGraphSchema,
  permissions: PublicPermissionManifestSchema,
  contract: CapabilityContractSchema,
  runtime: z.object({
    inference: InferenceDependencySchema,
  }),
  pricing: z.object({
    priceTierCents: z.number().int().positive(),
    currency: z.literal("USD"),
  }),
});

export type CapabilityPackage = z.infer<typeof CapabilityPackageSchema>;

export function parseCapabilityPackage(data: unknown): CapabilityPackage {
  return parseWithSchema(CapabilityPackageSchema, data);
}
