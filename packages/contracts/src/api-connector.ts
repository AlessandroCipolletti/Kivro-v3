import { z } from "zod";
import { parseWithSchema } from "./validate.js";

/** §263 — typed API connector (no generic POST primitive for capabilities). */
export const ApiConnectorSchema = z.object({
  id: z.string().min(1),
  host: z.string().min(1),
  method: z.enum(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]),
  pathTemplate: z.string().min(1),
  sideEffect: z.enum(["READ_ONLY", "SIDE_EFFECTING", "UNKNOWN"]),
  requestSchemaId: z.string().optional(),
  responseSchemaId: z.string().optional(),
  rateLimitPerMinute: z.number().int().positive().optional(),
  credentialScope: z.enum(["PLATFORM", "SELLER"]),
});

export type ApiConnector = z.infer<typeof ApiConnectorSchema>;

export const ApiConnectorRegistrySchema = z.object({
  connectors: z.array(ApiConnectorSchema),
});

export type ApiConnectorRegistry = z.infer<typeof ApiConnectorRegistrySchema>;

export function parseApiConnectorRegistry(data: unknown): ApiConnectorRegistry {
  return parseWithSchema(ApiConnectorRegistrySchema, data);
}
