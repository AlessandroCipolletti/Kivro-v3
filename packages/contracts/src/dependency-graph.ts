import { z } from "zod";
import { parseWithSchema } from "./validate.js";

export const DependencyTypeSchema = z.enum([
  "SKILL",
  "TOOL",
  "MCP_SERVER",
  "PLUGIN",
  "DATABASE",
  "LOCAL_FILE",
  "LOCAL_DIRECTORY",
  "LOCAL_SERVICE",
  "PRIVATE_API",
  "NETWORK_DESTINATION",
  "AI_PROVIDER",
  "AI_MODEL",
  "CREDENTIAL",
  "EXECUTABLE",
  "ENVIRONMENT_VARIABLE",
  "SYSTEM_BINARY",
  "MODEL_FILE",
  "INFERENCE",
]);

export const DependencyNodeSchema = z.object({
  id: z.string(),
  type: DependencyTypeSchema,
  name: z.string(),
  requirement: z.enum(["REQUIRED", "OPTIONAL", "CONDITIONAL"]),
  sensitivity: z.enum(["LOW", "MEDIUM", "HIGH", "BLOCKED"]),
  discoveredFrom: z.array(z.string()),
  dependsOn: z.array(z.string()),
  marketplaceSupport: z.enum(["SUPPORTED", "SUPPORTED_WITH_RESTRICTIONS", "UNSUPPORTED"]),
  selected: z.boolean(),
  health: z.enum(["UNKNOWN", "READY", "FAILED"]),
  confidence: z.enum(["CONFIRMED", "LIKELY", "POSSIBLE", "UNKNOWN"]).optional(),
});

export const DependencyGraphSchema = z.object({
  graphVersion: z.literal(1),
  rootCapabilityName: z.string(),
  nodes: z.array(DependencyNodeSchema),
});

export type DependencyGraph = z.infer<typeof DependencyGraphSchema>;

export function parseDependencyGraph(data: unknown): DependencyGraph {
  return parseWithSchema(DependencyGraphSchema, data);
}
