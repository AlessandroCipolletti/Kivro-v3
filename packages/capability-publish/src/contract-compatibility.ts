import type { CapabilityContract } from "@kivro/contracts";

export interface CompatibilityWarning {
  code: string;
  message: string;
}

/** §215 — obvious contract vs dependency contradictions (warn, not silent). */
export function checkContractDependencyCompatibility(
  contract: CapabilityContract,
  selectedSkillNames: string[],
): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];
  const fileFields = contract.inputs.fields.filter((f) => f.type === "file");
  if (fileFields.some((f) => f.file?.mimeAllowList?.some((m) => m.includes("blend")))) {
    const hasBlenderTool = selectedSkillNames.some((s) => /blender/i.test(s));
    if (!hasBlenderTool) {
      warnings.push({
        code: "FILE_TYPE_WITHOUT_TOOL",
        message:
          "Input accepts Blender files but no declared skill/tool appears able to process .blend files.",
      });
    }
  }
  if (contract.output.type === "FILES" && selectedSkillNames.length === 0) {
    warnings.push({
      code: "OUTPUT_FILES_NO_SKILLS",
      message: "Output promises files but no skills were selected in the dependency graph.",
    });
  }
  return warnings;
}
