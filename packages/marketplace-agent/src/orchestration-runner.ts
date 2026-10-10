import type { JobOutputAssetRef } from "@kivro/marketplace";
import { parseJobOutputAssetManifest } from "@kivro/marketplace";
import { buildCrossJobAgentDraft, type CompletedStepOutput } from "./cross-job-input.js";

export function toStepRecord(step: {
  id: string;
  label: string;
  capabilityId: string;
  capabilityVersionId: string;
  dependsOnStepIds: unknown;
  inputMappingJson: unknown;
  status: string;
  jobId: string | null;
  outputAssetRefsJson: unknown;
}): OrchestrationStepRecord {
  return {
    id: step.id,
    label: step.label,
    capabilityId: step.capabilityId,
    capabilityVersionId: step.capabilityVersionId,
    dependsOnStepIds: (step.dependsOnStepIds as string[]) ?? [],
    inputMappingJson: (step.inputMappingJson as Record<string, unknown>) ?? null,
    clientStepKey: clientStepKeyFromMapping(step.inputMappingJson),
    status: step.status,
    jobId: step.jobId,
    outputAssetRefsJson: step.outputAssetRefsJson,
  };
}

export type OrchestrationStepRecord = {
  id: string;
  label: string;
  capabilityId: string;
  capabilityVersionId: string;
  dependsOnStepIds: string[];
  inputMappingJson: Record<string, unknown> | null;
  clientStepKey: string;
  status: string;
  jobId: string | null;
  outputAssetRefsJson: unknown;
};

export function clientStepKeyFromMapping(inputMappingJson: unknown): string {
  if (!inputMappingJson || typeof inputMappingJson !== "object") {
    return "";
  }
  const key = (inputMappingJson as { _clientStepKey?: string })._clientStepKey;
  return typeof key === "string" ? key : "";
}

export function dependenciesMet(
  step: OrchestrationStepRecord,
  stepsByClientKey: Map<string, OrchestrationStepRecord>,
): boolean {
  const deps = step.dependsOnStepIds;
  if (deps.length === 0) {
    return true;
  }
  return deps.every((depKey) => {
    const dep = stepsByClientKey.get(depKey);
    return dep?.status === "COMPLETED";
  });
}

export function findRunnableSteps(steps: OrchestrationStepRecord[]): OrchestrationStepRecord[] {
  const byKey = new Map<string, OrchestrationStepRecord>();
  for (const s of steps) {
    const k = clientStepKeyFromMapping(s.inputMappingJson);
    if (k) {
      byKey.set(k, s);
    }
  }
  return steps.filter(
    (s) =>
      !s.jobId &&
      s.status !== "COMPLETED" &&
      s.status !== "FAILED" &&
      s.status !== "SKIPPED" &&
      s.status !== "NEEDS_APPROVAL" &&
      dependenciesMet(s, byKey),
  );
}

export function stepCompletedOutputs(steps: OrchestrationStepRecord[]): CompletedStepOutput[] {
  const out: CompletedStepOutput[] = [];
  for (const s of steps) {
    if (s.status !== "COMPLETED" || !s.jobId) {
      continue;
    }
    const key = clientStepKeyFromMapping(s.inputMappingJson);
    const assets = parseJobOutputAssetManifest(s.outputAssetRefsJson);
    out.push({
      clientStepKey: key,
      stepId: s.id,
      jobId: s.jobId,
      structuredOutput: s.outputAssetRefsJson,
      assets,
    });
  }
  return out;
}

export function buildStepAgentDraft(
  planGoal: string,
  step: OrchestrationStepRecord,
  completedSteps: CompletedStepOutput[],
): ReturnType<typeof buildCrossJobAgentDraft> {
  return buildCrossJobAgentDraft({
    planGoal,
    stepLabel: step.label,
    inputMapping: step.inputMappingJson,
    completedSteps,
  });
}

export function synthesizePlanSummary(steps: OrchestrationStepRecord[], planGoal: string): string {
  const done = steps.filter((s) => s.status === "COMPLETED").length;
  const total = steps.length;
  if (done === total) {
    return `Completed orchestration for: ${planGoal}. All ${total} steps finished. Review deliverables in My jobs.`;
  }
  const failed = steps.filter((s) => s.status === "FAILED" || s.status === "NEEDS_APPROVAL").length;
  if (done > 0 && failed > 0) {
    return `Workflow incomplete for: ${planGoal}. ${done} step(s) completed and stay charged. ${failed} step(s) did not finish. Remaining budget is released. Completed artifacts stay available.`;
  }
  return `Orchestration in progress (${done}/${total} steps complete).`;
}

/** §143 — Approve-plan mode pauses instead of swapping a paid provider. */
export function decideUnavailableStep(approvalMode: "APPROVE_PLAN" | "RECOMMEND_ONLY"): {
  action: "PAUSE_FOR_APPROVAL";
  substitute: false;
} {
  void approvalMode;
  return { action: "PAUSE_FOR_APPROVAL", substitute: false };
}

export function parseStoredAssetRefs(raw: unknown): JobOutputAssetRef[] {
  return parseJobOutputAssetManifest(raw);
}
