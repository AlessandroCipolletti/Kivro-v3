import type { CapabilityInputField } from "@kivro/contracts";

const LEGACY_TO_SPEC: Record<string, CapabilityInputField["type"]> = {
  string: "SHORT_TEXT",
  text: "LONG_TEXT",
  number: "NUMBER",
  boolean: "BOOLEAN",
  url: "URL",
  choice: "SELECT",
  json: "JSON",
  file: "FILE",
};

export function normalizeInputFieldType(type: CapabilityInputField["type"]): string {
  if (type in LEGACY_TO_SPEC) {
    return LEGACY_TO_SPEC[type as keyof typeof LEGACY_TO_SPEC];
  }
  return type;
}

export function isFileInputField(field: CapabilityInputField): boolean {
  const t = normalizeInputFieldType(field.type);
  return t === "FILE" || t === "FILES";
}
