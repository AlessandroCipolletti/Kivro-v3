import type { CapabilityInputField } from "@kivro/contracts";
import { normalizeInputFieldType } from "./normalize-field-type.js";

/** M27 / HARD-019 — default per-file cap when capability schema omits explicit limits. */
export const DEFAULT_MAX_FILE_SIZE_BYTES_PER_JOB = 52_428_800;

/** §219 — platform ceiling. Sellers can only tighten it. */
export function platformMaxFileBytes(env: Record<string, string | undefined> = process.env): number {
  const raw = Number(env.KIVRO_PLATFORM_MAX_FILE_BYTES);
  if (Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  return 2_147_483_648;
}

export function effectiveFileByteLimit(
  sellerLimit: number | undefined,
  platform = platformMaxFileBytes(),
): number {
  if (sellerLimit == null || !Number.isFinite(sellerLimit) || sellerLimit <= 0) {
    return platform;
  }
  return Math.min(platform, sellerLimit);
}

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
    maxFileSizeBytes: effectiveFileByteLimit(
      modern?.maxFileSizeBytes ?? legacy?.maxBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES_PER_JOB,
    ),
    maxTotalSizeBytes: effectiveFileByteLimit(modern?.maxTotalSizeBytes ?? 104_857_600),
    allowedMimeTypes: modern?.allowedMimeTypes ?? legacy?.mimeAllowList ?? [],
    allowedExtensions: modern?.allowedExtensions ?? [],
  };
}

export function resolvedTextMaxLength(field: CapabilityInputField): number | undefined {
  return field.constraints?.text?.maxLength ?? field.maxLength;
}
