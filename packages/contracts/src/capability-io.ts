import { z } from "zod";
import { parseWithSchema } from "./validate.js";

/** Master Spec §194 — typed buyer input fields (subset bootstrap; extended in M05). */
export const InputFieldTypeSchema = z.enum([
  "string",
  "text",
  "number",
  "boolean",
  "url",
  "choice",
  "json",
  "file",
]);

export const CapabilityInputFieldSchema = z.object({
  key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  type: InputFieldTypeSchema,
  required: z.boolean(),
  maxLength: z.number().int().positive().optional(),
  choices: z.array(z.string()).optional(),
  file: z
    .object({
      mimeAllowList: z.array(z.string()).optional(),
      maxBytes: z.number().int().positive().optional(),
      maxCount: z.number().int().positive().optional(),
    })
    .optional(),
});

export const CapabilityInputContractSchema = z.object({
  contractVersion: z.literal(1),
  fields: z.array(CapabilityInputFieldSchema).min(1),
});

export const CapabilityOutputContractSchema = z.object({
  contractVersion: z.literal(1),
  type: z.enum([
    "TEXT",
    "JSON",
    "MARKDOWN",
    "FILES",
    "TEXT_AND_FILES",
    "structured_report",
  ]),
  jsonSchema: z.record(z.unknown()).optional(),
});

export const CapabilityContractSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  currency: z.literal("USD"),
  priceTierCents: z.number().int().positive(),
  inputs: CapabilityInputContractSchema,
  output: CapabilityOutputContractSchema,
});

export type CapabilityContract = z.infer<typeof CapabilityContractSchema>;

export function parseCapabilityContract(data: unknown): CapabilityContract {
  return parseWithSchema(CapabilityContractSchema, data);
}
