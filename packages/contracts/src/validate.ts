import type { ZodSchema, ZodError } from "zod";

export class SchemaValidationError extends Error {
  readonly zodError: ZodError;

  constructor(message: string, zodError: ZodError) {
    super(message);
    this.name = "SchemaValidationError";
    this.zodError = zodError;
  }
}

export function parseWithSchema<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new SchemaValidationError("Schema validation failed", result.error);
  }
  return result.data;
}
