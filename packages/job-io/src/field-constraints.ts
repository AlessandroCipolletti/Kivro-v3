import type { CapabilityInputField } from "@kivro/contracts";
import { normalizeInputFieldType } from "./normalize-field-type.js";

export interface ResolvedFileConstraints {
  minFiles: number;
  maxFiles: number;
  maxFileSizeBytes: number;
  maxTotalSizeBytes: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export function resolvedFileConstraints(field: CapabilityInputField): ResolvedFileConstraints {
  const legacy = field.file;
  const modern = field.constraints?.file;
  const type = normalizeInputFieldType(field.type);
  const isMulti = type === "FILES";
  return {
    minFiles: modern?.minFiles ?? (field.required ? 1 : 0),
    maxFiles: modern?.maxFiles ?? legacy?.maxCount ?? (isMulti ? 10 : 1),
    maxFileSizeBytes: modern?.maxFileSizeBytes ?? legacy?.maxBytes ?? 52_428_800,
    maxTotalSizeBytes: modern?.maxTotalSizeBytes ?? 104_857_600,
    allowedMimeTypes: modern?.allowedMimeTypes ?? legacy?.mimeAllowList ?? [],
    allowedExtensions: modern?.allowedExtensions ?? [],
  };
}

export function resolvedTextMaxLength(field: CapabilityInputField): number | undefined {
  return field.constraints?.text?.maxLength ?? field.maxLength;
}
