import { z } from "zod";
import { parseWithSchema } from "./validate.js";

/** Master Spec §98 — inference must be declared before publish. */
export const InferenceDependencySchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("REMOTE_PROVIDER"),
    provider: z.string().min(1),
    model: z.string().min(1),
    credentialRef: z.string().min(1),
    billingOwner: z.literal("SELLER"),
  }),
  z.object({
    mode: z.literal("LOCAL"),
    provider: z.string().min(1),
    model: z.string().min(1),
    endpointRef: z.string().optional(),
    billingOwner: z.literal("SELLER"),
  }),
]);

export type InferenceDependency = z.infer<typeof InferenceDependencySchema>;

export function parseInferenceDependency(data: unknown): InferenceDependency {
  return parseWithSchema(InferenceDependencySchema, data);
}
