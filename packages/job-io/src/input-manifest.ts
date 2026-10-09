import type { CapabilityContract } from "@kivro/contracts";
import { isFileInputField } from "./normalize-field-type.js";

export interface JobInputManifest {
  schemaVersion: 1;
  capabilityVersionId?: string;
  structuredInput: Record<string, unknown>;
  files: Record<string, Array<{ assetId: string; relativePath: string }>>;
}

/** Materialize API submission into Worker-facing manifest (§207). */
export function buildJobInputManifest(
  contract: CapabilityContract,
  submission: {
    inputs: Record<string, unknown>;
    assets: Record<string, Array<{ assetId: string; filename: string }>>;
  },
): JobInputManifest {
  const files: JobInputManifest["files"] = {};
  for (const field of contract.inputs.fields) {
    if (!isFileInputField(field)) {
      continue;
    }
    const refs = submission.assets[field.key] ?? [];
    files[field.key] = refs.map((r, index) => ({
      assetId: r.assetId,
      relativePath: `${field.key}/${index}-${sanitizeFilename(r.filename)}`,
    }));
  }
  return {
    schemaVersion: 1,
    structuredInput: submission.inputs,
    files,
  };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}
