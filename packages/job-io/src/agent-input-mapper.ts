import type { CapabilityContract } from "@kivro/contracts";
import { extensionOfFilename } from "./file-signature.js";
import { isFileInputField } from "./normalize-field-type.js";
import { applyScalarDefaults } from "./apply-defaults.js";
import { validateBuyerInput, type JobAssetRef } from "./validate-buyer-input.js";

export interface AgentInputDraft {
  instructions?: string;
  attachments?: Array<{ filename: string; assetId: string; sizeBytes: number; sniffedMimeType?: string }>;
}

export interface AgentPrepareResult {
  inputs: Record<string, unknown>;
  assets: Record<string, JobAssetRef[]>;
  missingRequired: string[];
  validation: ReturnType<typeof validateBuyerInput>;
}

/** §208 — deterministic mapping helper (no fabricated files). */
export function prepareAgentJobSubmission(
  contract: CapabilityContract,
  draft: AgentInputDraft,
): AgentPrepareResult {
  const inputs: Record<string, unknown> = {};
  const assets: Record<string, JobAssetRef[]> = {};

  const instructionsField = contract.inputs.fields.find(
    (f) => f.key === "instructions" || f.key === "prompt" || f.key === "request",
  );
  if (instructionsField && draft.instructions) {
    inputs[instructionsField.key] = draft.instructions;
  } else if (draft.instructions) {
    inputs.instructions = draft.instructions;
  }

  const fileFields = contract.inputs.fields.filter((f) => isFileInputField(f));
  for (const attachment of draft.attachments ?? []) {
    const ext = extensionOfFilename(attachment.filename);
    const target = fileFields.find((f) => {
      const exts =
        f.constraints?.file?.allowedExtensions ??
        (f.file?.mimeAllowList?.some((m) => m.includes("blend")) ? [".blend"] : []);
      return exts.length === 0 || exts.some((e) => e === ext);
    });
    if (!target) {
      continue;
    }
    const ref: JobAssetRef = {
      assetId: attachment.assetId,
      filename: attachment.filename,
      sizeBytes: attachment.sizeBytes,
      sniffedMimeType: attachment.sniffedMimeType,
    };
    assets[target.key] = [...(assets[target.key] ?? []), ref];
  }

  const withDefaults = applyScalarDefaults(contract, inputs);
  const validation = validateBuyerInput({ contract, inputs: withDefaults, assets });
  const missingRequired = validation.issues
    .filter((i) => i.code === "REQUIRED" || i.code === "FILE_REQUIRED")
    .map((i) => i.fieldKey);

  return {
    inputs: withDefaults,
    assets,
    missingRequired,
    validation,
  };
}
