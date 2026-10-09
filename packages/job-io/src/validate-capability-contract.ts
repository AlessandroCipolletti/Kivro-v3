import type { CapabilityContract } from "@kivro/contracts";
import {
  assertNoFileDefaults,
  assertScalarDefaultsSafe,
} from "./apply-defaults.js";
import { isFileInputField } from "./normalize-field-type.js";

export interface ContractValidationResult {
  ok: boolean;
  issues: string[];
  normalized?: CapabilityContract;
}

/** §203 / §204 — normalize and validate seller-authored contracts at publish time. */
export function validateAndNormalizeCapabilityContract(
  contract: CapabilityContract,
): ContractValidationResult {
  const issues: string[] = [];
  issues.push(...assertNoFileDefaults(contract));
  issues.push(...assertScalarDefaultsSafe(contract));

  const keys = new Set<string>();
  for (const field of contract.inputs.fields) {
    if (keys.has(field.key)) {
      issues.push(`duplicate input key ${field.key}`);
    }
    keys.add(field.key);
    if (contract.inputs.contractVersion === 2 && !field.label) {
      issues.push(`field ${field.key}: label required for v2 contracts`);
    }
    if (isFileInputField(field)) {
      const hasAllow =
        (field.constraints?.file?.allowedExtensions?.length ?? 0) > 0 ||
        (field.constraints?.file?.allowedMimeTypes?.length ?? 0) > 0 ||
        (field.file?.mimeAllowList?.length ?? 0) > 0;
      if (field.required && !hasAllow) {
        issues.push(`field ${field.key}: file field must declare allowed types`);
      }
    }
  }

  if (contract.output.contractVersion === 2) {
    const outKeys = new Set<string>();
    for (const field of contract.output.fields) {
      if (outKeys.has(field.key)) {
        issues.push(`duplicate output key ${field.key}`);
      }
      outKeys.add(field.key);
    }
  }

  const normalized: CapabilityContract = {
    ...contract,
    inputs: {
      ...contract.inputs,
      fields: contract.inputs.fields.map((field, index) => ({
        ...field,
        label: field.label ?? titleCase(field.key),
        order: field.order ?? index,
      })),
    },
  };

  return {
    ok: issues.length === 0,
    issues,
    normalized: issues.length === 0 ? normalized : undefined,
  };
}

function titleCase(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}
