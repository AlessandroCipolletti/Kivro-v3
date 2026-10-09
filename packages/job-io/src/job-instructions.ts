import type { CapabilityContract } from "@kivro/contracts";
import { normalizeInputFieldType, isFileInputField } from "./normalize-field-type.js";

/** §213 — platform-controlled internal instructions (buyer text is data, not policy). */
export function buildInternalJobInstructions(contract: CapabilityContract): string {
  const lines: string[] = [
    "Kivro marketplace job execution envelope.",
    "Input files are mounted under /job/input/<fieldKey>/",
    "Write generated artifacts only under /job/output/.",
    "When complete, write /job/output/result.json matching the output schema.",
    "Do not read or write paths outside /job/input and /job/output.",
    "",
    "Input schema:",
  ];
  for (const field of contract.inputs.fields) {
    const type = normalizeInputFieldType(field.type);
    const fileHint = isFileInputField(field) ? " (files under /job/input/)" : "";
    lines.push(`- ${field.key}: ${type}${field.required ? " required" : " optional"}${fileHint}`);
  }
  lines.push("", "Output schema:");
  if (contract.output.contractVersion === 2) {
    for (const field of contract.output.fields) {
      lines.push(`- ${field.key}: ${field.type}${field.required ? " required" : " optional"}`);
    }
  } else {
    lines.push(`- legacy output type: ${contract.output.type}`);
  }
  return lines.join("\n");
}
