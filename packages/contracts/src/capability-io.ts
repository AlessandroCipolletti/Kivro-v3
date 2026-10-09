import { z } from "zod";
import { parseWithSchema } from "./validate.js";

/** Legacy bootstrap types (M01) — normalized to spec types in job-io. */
const LegacyInputFieldTypeSchema = z.enum([
  "string",
  "text",
  "number",
  "boolean",
  "url",
  "choice",
  "json",
  "file",
]);

/** Master Spec §194 — canonical input field types. */
export const SpecInputFieldTypeSchema = z.enum([
  "SHORT_TEXT",
  "LONG_TEXT",
  "INTEGER",
  "NUMBER",
  "BOOLEAN",
  "SELECT",
  "MULTI_SELECT",
  "URL",
  "JSON",
  "FILE",
  "FILES",
]);

export const InputFieldTypeSchema = z.union([LegacyInputFieldTypeSchema, SpecInputFieldTypeSchema]);

export const FileConstraintsSchema = z.object({
  minFiles: z.number().int().nonnegative().optional(),
  maxFiles: z.number().int().positive().optional(),
  maxFileSizeBytes: z.number().int().positive().optional(),
  maxTotalSizeBytes: z.number().int().positive().optional(),
  allowedMimeTypes: z.array(z.string()).optional(),
  allowedExtensions: z.array(z.string()).optional(),
});

export const TextConstraintsSchema = z.object({
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  pattern: z.string().optional(),
  allowedValues: z.array(z.string()).optional(),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
});

export const InputWhenSchema = z.object({
  fieldKey: z.string().min(1),
  equals: z.union([z.string(), z.number(), z.boolean()]),
});

export const CapabilityInputFieldSchema = z.object({
  id: z.string().uuid().optional(),
  key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  label: z.string().min(1).optional(),
  description: z.string().optional(),
  type: InputFieldTypeSchema,
  required: z.boolean(),
  order: z.number().int().nonnegative().optional(),
  defaultValue: z.unknown().optional(),
  group: z.string().optional(),
  when: InputWhenSchema.optional(),
  constraints: z
    .object({
      text: TextConstraintsSchema.optional(),
      file: FileConstraintsSchema.optional(),
    })
    .optional(),
  /** @deprecated use constraints.file */
  maxLength: z.number().int().positive().optional(),
  choices: z.array(z.string()).optional(),
  /** @deprecated use constraints.file */
  file: z
    .object({
      mimeAllowList: z.array(z.string()).optional(),
      maxBytes: z.number().int().positive().optional(),
      maxCount: z.number().int().positive().optional(),
    })
    .optional(),
});

export const CapabilityInputContractSchema = z.object({
  contractVersion: z.union([z.literal(1), z.literal(2)]),
  fields: z.array(CapabilityInputFieldSchema).min(1),
  groups: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        order: z.number().int().nonnegative().optional(),
      }),
    )
    .optional(),
});

export const SpecOutputFieldTypeSchema = z.enum([
  "SHORT_TEXT",
  "LONG_TEXT",
  "MARKDOWN",
  "JSON",
  "NUMBER",
  "BOOLEAN",
  "URL",
  "FILE",
  "FILES",
]);

export const CapabilityOutputFieldSchema = z.object({
  key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  label: z.string().min(1).optional(),
  type: SpecOutputFieldTypeSchema,
  required: z.boolean(),
  constraints: z
    .object({
      file: FileConstraintsSchema.optional(),
    })
    .optional(),
});

export const CapabilityOutputContractSchema = z.discriminatedUnion("contractVersion", [
  z.object({
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
  }),
  z.object({
    contractVersion: z.literal(2),
    fields: z.array(CapabilityOutputFieldSchema).min(1),
  }),
]);

export const CapabilityContractSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  currency: z.literal("USD"),
  priceTierCents: z.number().int().positive(),
  inputs: CapabilityInputContractSchema,
  output: CapabilityOutputContractSchema,
  examples: z
    .array(
      z.object({
        label: z.string().optional(),
        values: z.record(z.unknown()),
      }),
    )
    .optional(),
});

export type CapabilityContract = z.infer<typeof CapabilityContractSchema>;
export type CapabilityInputField = z.infer<typeof CapabilityInputFieldSchema>;
export type CapabilityOutputField = z.infer<typeof CapabilityOutputFieldSchema>;
export type CapabilityOutputContract = z.infer<typeof CapabilityOutputContractSchema>;

export function parseCapabilityContract(data: unknown): CapabilityContract {
  return parseWithSchema(CapabilityContractSchema, data);
}
