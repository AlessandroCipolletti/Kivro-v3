import type { CapabilityContract, CapabilityInputField } from "@kivro/contracts";
import { isFileInputField, normalizeInputFieldType } from "@kivro/job-io";

export interface CompatibilityWarning {
  code: string;
  message: string;
}

function fieldAcceptsExtension(field: CapabilityInputField, ext: string): boolean {
  const fromModern = field.constraints?.file?.allowedExtensions ?? [];
  const fromLegacy = field.file?.mimeAllowList?.some((m) => m.includes("blend")) ? [".blend"] : [];
  const allowed = [...fromModern, ...fromLegacy];
  return allowed.length === 0 || allowed.includes(ext);
}

/** §215 — obvious contract vs dependency contradictions (warn, not silent). */
export function checkContractDependencyCompatibility(
  contract: CapabilityContract,
  selectedSkillNames: string[],
): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];
  const fileFields = contract.inputs.fields.filter((f) => isFileInputField(f));
  if (fileFields.some((f) => fieldAcceptsExtension(f, ".blend"))) {
    const hasBlenderTool = selectedSkillNames.some((s) => /blender/i.test(s));
    if (!hasBlenderTool) {
      warnings.push({
        code: "FILE_TYPE_WITHOUT_TOOL",
        message:
          "Input accepts Blender files but no declared skill/tool appears able to process .blend files.",
      });
    }
  }
  const outputFiles =
    contract.output.contractVersion === 2
      ? contract.output.fields.some((f) => f.type === "FILES" || f.type === "FILE")
      : contract.output.type === "FILES" || contract.output.type === "TEXT_AND_FILES";
  if (outputFiles && selectedSkillNames.length === 0) {
    warnings.push({
      code: "OUTPUT_FILES_NO_SKILLS",
      message: "Output promises files but no skills were selected in the dependency graph.",
    });
  }
  for (const field of contract.inputs.fields) {
    const type = normalizeInputFieldType(field.type);
    if (type === "FILE" || type === "FILES") {
      const constraints = field.constraints?.file;
      if (field.required && !constraints?.allowedExtensions?.length && !field.file?.mimeAllowList?.length) {
        warnings.push({
          code: "FILE_INPUT_UNRESTRICTED",
          message: `File field ${field.key} has no extension/MIME allowlist configured.`,
        });
      }
    }
  }
  return warnings;
}
