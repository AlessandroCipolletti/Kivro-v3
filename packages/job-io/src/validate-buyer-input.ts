import type { CapabilityContract, CapabilityInputField } from "@kivro/contracts";
import { applyScalarDefaults } from "./apply-defaults.js";
import { activeInputFields } from "./conditionals.js";
import { extensionOfFilename } from "./file-signature.js";
import { isFileInputField, normalizeInputFieldType } from "./normalize-field-type.js";
import { isArchiveExtension, isArchiveMime } from "./archive-inputs.js";
import { resolvedFileConstraints, resolvedTextMaxLength } from "./field-constraints.js";

export interface JobAssetRef {
  assetId: string;
  filename: string;
  sizeBytes: number;
  declaredMimeType?: string;
  sniffedMimeType?: string;
}

export interface ValidateBuyerInputRequest {
  contract: CapabilityContract;
  inputs: Record<string, unknown>;
  assets: Record<string, JobAssetRef[]>;
}

export interface ValidationIssue {
  fieldKey: string;
  code: string;
  message: string;
}

export interface ValidateBuyerInputResult {
  ok: boolean;
  issues: ValidationIssue[];
}

/** §207 — validate programmatic job submission against immutable contract. */
export function validateBuyerInput(request: ValidateBuyerInputRequest): ValidateBuyerInputResult {
  const issues: ValidationIssue[] = [];
  const inputs = applyScalarDefaults(request.contract, request.inputs);
  const fields = activeInputFields(request.contract.inputs.fields, inputs);
  for (const field of fields) {
    validateField(field, { ...request, inputs }, issues);
  }
  for (const field of request.contract.inputs.fields) {
    if (!isFieldActiveSimple(field, inputs) && inputs[field.key] !== undefined) {
      issues.push({
        fieldKey: field.key,
        code: "INACTIVE_FIELD_PROVIDED",
        message: "Input provided for conditionally hidden field",
      });
    }
  }
  return { ok: issues.length === 0, issues };
}

function isFieldActiveSimple(field: CapabilityInputField, inputs: Record<string, unknown>): boolean {
  return activeInputFields([field], inputs).length === 1;
}

function validateField(
  field: CapabilityInputField,
  request: ValidateBuyerInputRequest,
  issues: ValidationIssue[],
): void {
  const type = normalizeInputFieldType(field.type);
  const value = request.inputs[field.key];
  const assetList = request.assets[field.key] ?? [];

  if (isFileInputField(field)) {
    const constraints = resolvedFileConstraints(field);
    if (field.required && assetList.length < constraints.minFiles) {
      issues.push({
        fieldKey: field.key,
        code: "FILE_REQUIRED",
        message: "Required file input missing",
      });
      return;
    }
    if (assetList.length > constraints.maxFiles) {
      issues.push({
        fieldKey: field.key,
        code: "FILE_COUNT",
        message: "Too many files",
      });
    }
    let total = 0;
    for (const asset of assetList) {
      total += asset.sizeBytes;
      if (asset.sizeBytes > constraints.maxFileSizeBytes) {
        issues.push({
          fieldKey: field.key,
          code: "FILE_TOO_LARGE",
          message: `File ${asset.filename} exceeds size limit`,
        });
      }
      validateFileAllowlist(field.key, asset, constraints, issues);
    }
    if (total > constraints.maxTotalSizeBytes) {
      issues.push({
        fieldKey: field.key,
        code: "FILE_TOTAL_SIZE",
        message: "Combined file size exceeds limit",
      });
    }
    return;
  }

  if (field.required && (value === undefined || value === null || value === "")) {
    issues.push({
      fieldKey: field.key,
      code: "REQUIRED",
      message: "Required scalar input missing",
    });
    return;
  }
  if (value === undefined || value === null) {
    return;
  }

  switch (type) {
    case "SHORT_TEXT":
    case "LONG_TEXT":
    case "URL": {
      if (typeof value !== "string") {
        issues.push({ fieldKey: field.key, code: "TYPE", message: "Expected string" });
        return;
      }
      const max = resolvedTextMaxLength(field);
      if (max && value.length > max) {
        issues.push({ fieldKey: field.key, code: "MAX_LENGTH", message: "Text too long" });
      }
      const min = field.constraints?.text?.minLength;
      if (min !== undefined && value.length < min) {
        issues.push({ fieldKey: field.key, code: "MIN_LENGTH", message: "Text too short" });
      }
      break;
    }
    case "INTEGER":
    case "NUMBER": {
      if (typeof value !== "number" || Number.isNaN(value)) {
        issues.push({ fieldKey: field.key, code: "TYPE", message: "Expected number" });
        return;
      }
      const min = field.constraints?.text?.minimum;
      const max = field.constraints?.text?.maximum;
      if (min !== undefined && value < min) {
        issues.push({ fieldKey: field.key, code: "MIN", message: "Below minimum" });
      }
      if (max !== undefined && value > max) {
        issues.push({ fieldKey: field.key, code: "MAX", message: "Above maximum" });
      }
      break;
    }
    case "BOOLEAN": {
      if (typeof value !== "boolean") {
        issues.push({ fieldKey: field.key, code: "TYPE", message: "Expected boolean" });
      }
      break;
    }
    case "SELECT": {
      if (typeof value !== "string") {
        issues.push({ fieldKey: field.key, code: "TYPE", message: "Expected choice string" });
        return;
      }
      const allowed = field.constraints?.text?.allowedValues ?? field.choices ?? [];
      if (allowed.length > 0 && !allowed.includes(value)) {
        issues.push({ fieldKey: field.key, code: "CHOICE", message: "Invalid choice" });
      }
      break;
    }
    case "MULTI_SELECT": {
      if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
        issues.push({ fieldKey: field.key, code: "TYPE", message: "Expected string array" });
        return;
      }
      const allowed = field.constraints?.text?.allowedValues ?? field.choices ?? [];
      if (allowed.length > 0) {
        for (const v of value) {
          if (!allowed.includes(v)) {
            issues.push({ fieldKey: field.key, code: "CHOICE", message: "Invalid multi choice" });
          }
        }
      }
      break;
    }
    case "JSON": {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        issues.push({ fieldKey: field.key, code: "TYPE", message: "Expected JSON object" });
      }
      break;
    }
    default:
      break;
  }
}

function validateFileAllowlist(
  fieldKey: string,
  asset: JobAssetRef,
  constraints: ReturnType<typeof resolvedFileConstraints>,
  issues: ValidationIssue[],
): void {
  const ext = extensionOfFilename(asset.filename);
  if (constraints.allowedExtensions.length > 0 && !constraints.allowedExtensions.includes(ext)) {
    issues.push({
      fieldKey,
      code: "EXTENSION",
      message: `Extension ${ext} not allowed`,
    });
  }
  if (
    asset.declaredMimeType &&
    asset.sniffedMimeType &&
    asset.declaredMimeType !== asset.sniffedMimeType
  ) {
    issues.push({
      fieldKey,
      code: "MIME_MISMATCH",
      message: "Declared MIME type does not match file signature",
    });
  }
  const mime = asset.sniffedMimeType ?? asset.declaredMimeType;
  if ((mime && isArchiveMime(mime)) || isArchiveExtension(ext)) {
    issues.push({
      fieldKey,
      code: "ARCHIVE",
      message: "Archive formats are not accepted",
    });
  }
  if (constraints.allowedMimeTypes.length > 0 && mime && !constraints.allowedMimeTypes.includes(mime)) {
    issues.push({
      fieldKey,
      code: "MIME",
      message: `MIME ${mime} not allowed`,
    });
  }
  if (
    asset.sniffedMimeType === "application/x-msdownload" &&
    [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)
  ) {
    issues.push({
      fieldKey,
      code: "SUSPICIOUS_FILE",
      message: "File signature does not match declared image extension",
    });
  }
}
