import { createHash } from "node:crypto";
import { z } from "zod";
import { ApiConnectorSchema } from "./api-connector.js";
import { InternetResearchPolicySchema } from "./research-policy.js";
import { parseWithSchema } from "./validate.js";

export const NetworkAllowEntrySchema = z.union([
  z.string().min(1),
  z.object({
    host: z.string().min(1),
    ports: z.array(z.number().int().min(1).max(65535)).min(1),
    purpose: z.string().min(1),
  }),
]);

export type NetworkAllowEntry = z.infer<typeof NetworkAllowEntrySchema>;

export const WorkerManifestSchema = z.object({
  manifestVersion: z.literal(1),
  workerId: z.string().uuid(),
  capabilityVersionId: z.string().uuid(),
  runtime: z.object({
    type: z.literal("openclaw"),
    supportedVersionRange: z.string().min(1),
  }),
  skills: z.array(
    z.object({
      name: z.string().min(1),
      contentHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    }),
  ),
  tools: z.object({
    allow: z.array(z.string()),
    deny: z.array(z.string()),
  }),
  resources: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      permissions: z.array(z.string()),
    }),
  ),
  network: z.object({
    default: z.enum(["deny", "allow"]),
    allow: z.array(NetworkAllowEntrySchema),
  }),
  limits: z.object({
    timeoutSeconds: z.number().int().positive(),
    memoryMb: z.number().int().positive(),
    cpu: z.number().positive(),
    maxPids: z.number().int().positive(),
    maxInputBytes: z.number().int().nonnegative(),
    maxOutputBytes: z.number().int().nonnegative(),
  }),
  internet: InternetResearchPolicySchema.optional(),
  apiConnectors: z.array(ApiConnectorSchema).optional(),
});

export type WorkerManifest = z.infer<typeof WorkerManifestSchema>;

export function parseWorkerManifest(data: unknown): WorkerManifest {
  return parseWithSchema(WorkerManifestSchema, data);
}

export function hashWorkerManifest(manifest: WorkerManifest): string {
  const canonical = JSON.stringify(manifest);
  return `sha256:${createHash("sha256").update(canonical).digest("hex")}`;
}
