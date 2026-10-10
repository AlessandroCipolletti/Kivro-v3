/** §158 — platform-owned transforms only. No silent file conversion. */
export type IoKind = "text" | "markdown" | "json" | "pdf" | "file";

const DIRECT: Array<[IoKind, IoKind]> = [
  ["text", "markdown"],
  ["text", "text"],
  ["markdown", "text"],
  ["markdown", "markdown"],
  ["json", "text"],
  ["json", "json"],
];

export function canFeedOutputToInput(output: IoKind, input: IoKind): boolean {
  if (output === input && output !== "file" && output !== "pdf") {
    return true;
  }
  return DIRECT.some(([from, to]) => from === output && to === input);
}

/** Several text-like outputs may be combined into one text or markdown input. */
export function canFeedOutputsToInput(outputs: IoKind[], input: IoKind): boolean {
  if (outputs.length === 0) {
    return false;
  }
  if (outputs.length > 1 && (input === "text" || input === "markdown")) {
    return outputs.every((output) => canFeedOutputToInput(output, "text"));
  }
  return outputs.every((output) => canFeedOutputToInput(output, input));
}

export type PlanIoStep = {
  clientStepKey: string;
  outputKind: IoKind;
  inputKind?: IoKind;
  dependsOnStepIds: string[];
};

export function validatePlanCompatibility(steps: PlanIoStep[]): string[] {
  const byKey = new Map(steps.map((step) => [step.clientStepKey, step]));
  const issues: string[] = [];
  for (const step of steps) {
    if (!step.inputKind || step.dependsOnStepIds.length === 0) {
      continue;
    }
    const outputs: IoKind[] = [];
    for (const dep of step.dependsOnStepIds) {
      const upstream = byKey.get(dep);
      if (!upstream) {
        issues.push(`${step.clientStepKey}: missing upstream ${dep}`);
        continue;
      }
      outputs.push(upstream.outputKind);
    }
    if (outputs.length === 0) {
      continue;
    }
    if (!canFeedOutputsToInput(outputs, step.inputKind)) {
      issues.push(
        `${step.clientStepKey}: ${outputs.join(",")} cannot feed ${step.inputKind} without an unsupported conversion`,
      );
    }
  }
  return issues;
}
