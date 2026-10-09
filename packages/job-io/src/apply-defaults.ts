import type { CapabilityContract } from "@kivro/contracts";
import { isFileInputField, normalizeInputFieldType } from "./normalize-field-type.js";

/** §209 — apply published scalar defaults; never default file inputs. */
export function applyScalarDefaults(
  contract: CapabilityContract,
  inputs: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...inputs };
  for (const field of contract.inputs.fields) {
    if (isFileInputField(field)) {
      continue;
    }
    if (out[field.key] !== undefined && out[field.key] !== null && out[field.key] !== "") {
      continue;
    }
    if (field.defaultValue !== undefined) {
      out[field.key] = field.defaultValue;
    }
  }
  return out;
}

export function assertNoFileDefaults(contract: CapabilityContract): string[] {
  const issues: string[] = [];
  for (const field of contract.inputs.fields) {
    if (isFileInputField(field) && field.defaultValue !== undefined) {
      issues.push(`field ${field.key}: file inputs cannot have defaults`);
    }
  }
  return issues;
}

export function assertScalarDefaultsSafe(contract: CapabilityContract): string[] {
  const issues: string[] = [];
  for (const field of contract.inputs.fields) {
    if (field.defaultValue === undefined || isFileInputField(field)) {
      continue;
    }
    const type = normalizeInputFieldType(field.type);
    if (type === "BOOLEAN" && typeof field.defaultValue !== "boolean") {
      issues.push(`field ${field.key}: boolean default must be boolean`);
    }
  }
  return issues;
}
