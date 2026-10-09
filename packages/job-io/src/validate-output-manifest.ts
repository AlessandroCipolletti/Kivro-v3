import type { CapabilityOutputContract, CapabilityOutputField } from "@kivro/contracts";
import { assertPathWithinJobRoot } from "@kivro/sandbox";
import path from "node:path";
import { extensionOfFilename } from "./file-signature.js";

export interface WorkerResultManifest {
  schemaVersion: 1;
  fields: Record<
    string,
    | { type: "MARKDOWN" | "SHORT_TEXT" | "LONG_TEXT" | "JSON" | "NUMBER" | "BOOLEAN" | "URL"; value: unknown }
    | { type: "FILE"; path: string }
    | { type: "FILES"; paths: string[] }
  >;
}

export interface ValidateOutputResult {
  ok: boolean;
  issues: string[];
}

function outputFileConstraints(field: CapabilityOutputField) {
  const file = field.constraints?.file;
  return {
    minFiles: file?.minFiles ?? (field.required ? 1 : 0),
    allowedExtensions: file?.allowedExtensions ?? [],
  };
}

/** §212 — validate Worker result.json against output contract and output root. */
export function validateWorkerResultManifest(
  outputContract: CapabilityOutputContract,
  manifest: WorkerResultManifest,
  outputRoot: string,
): ValidateOutputResult {
  const issues: string[] = [];
  if (manifest.schemaVersion !== 1) {
    return { ok: false, issues: ["unsupported result schemaVersion"] };
  }
  if (outputContract.contractVersion === 1) {
    for (const entry of Object.values(manifest.fields)) {
      if (entry.type === "FILE") {
        assertSafeOutputPath(outputRoot, entry.path, issues, "output");
      }
      if (entry.type === "FILES") {
        for (const p of entry.paths) {
          assertSafeOutputPath(outputRoot, p, issues, "output");
        }
      }
    }
    return { ok: issues.length === 0, issues };
  }
  for (const field of outputContract.fields) {
    const entry = manifest.fields[field.key];
    if (!entry) {
      if (field.required) {
        issues.push(`missing required output field ${field.key}`);
      }
      continue;
    }
    if (entry.type !== field.type) {
      issues.push(`output type mismatch for ${field.key}`);
      continue;
    }
    const constraints = outputFileConstraints(field);
    if (entry.type === "FILE") {
      assertSafeOutputPath(outputRoot, entry.path, issues, field.key);
      validateExtension(entry.path, constraints.allowedExtensions, field.key, issues);
    }
    if (entry.type === "FILES") {
      if (entry.paths.length < constraints.minFiles) {
        issues.push(`output ${field.key} below minFiles`);
      }
      for (const p of entry.paths) {
        assertSafeOutputPath(outputRoot, p, issues, field.key);
        validateExtension(p, constraints.allowedExtensions, field.key, issues);
      }
    }
  }
  return { ok: issues.length === 0, issues };
}

function assertSafeOutputPath(
  outputRoot: string,
  relativePath: string,
  issues: string[],
  fieldKey: string,
): void {
  try {
    const absolute = path.resolve(outputRoot, relativePath);
    assertPathWithinJobRoot(outputRoot, absolute);
  } catch {
    issues.push(`output path escape for ${fieldKey}`);
  }
}

function validateExtension(
  relativePath: string,
  allowedExtensions: string[],
  fieldKey: string,
  issues: string[],
): void {
  const ext = extensionOfFilename(relativePath);
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
    issues.push(`output extension not allowed for ${fieldKey}`);
  }
}
