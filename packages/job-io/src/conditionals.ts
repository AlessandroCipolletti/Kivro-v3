import type { CapabilityInputField } from "@kivro/contracts";

/** §202 — simple show-when-equals rules evaluated server-side. */
export function isFieldActive(
  field: CapabilityInputField,
  inputs: Record<string, unknown>,
): boolean {
  if (!field.when) {
    return true;
  }
  const current = inputs[field.when.fieldKey];
  return current === field.when.equals;
}

export function activeInputFields(
  fields: CapabilityInputField[],
  inputs: Record<string, unknown>,
): CapabilityInputField[] {
  return fields.filter((f) => isFieldActive(f, inputs));
}
