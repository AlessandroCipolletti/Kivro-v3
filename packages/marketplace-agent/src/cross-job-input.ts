import type { JobOutputAssetRef } from "@kivro/marketplace";

export type CompletedStepOutput = {
  clientStepKey: string;
  stepId: string;
  jobId: string;
  structuredOutput: unknown;
  assets: JobOutputAssetRef[];
};

/** §139 — map prior step outputs into next job draft (typed refs, not LLM copy-paste). */
export function buildCrossJobAgentDraft(input: {
  planGoal: string;
  stepLabel: string;
  inputMapping: Record<string, unknown> | null;
  completedSteps: CompletedStepOutput[];
}): { instructions: string; attachments: Array<{ filename: string; assetId: string; sizeBytes: number; sniffedMimeType?: string }> } {
  const lines = [`Orchestration goal: ${input.planGoal}`, `Step: ${input.stepLabel}`];
  const attachments: Array<{ filename: string; assetId: string; sizeBytes: number; sniffedMimeType?: string }> = [];

  const sourceSteps = input.inputMapping?.sourceSteps;
  if (Array.isArray(sourceSteps)) {
    for (const ref of sourceSteps) {
      if (!ref || typeof ref !== "object") {
        continue;
      }
      const r = ref as { sourceStepId?: string; sourceOutput?: string };
      const key = r.sourceStepId;
      if (!key) {
        continue;
      }
      const completed = input.completedSteps.find((s) => s.clientStepKey === key);
      if (!completed) {
        continue;
      }
      lines.push(`Use output from "${key}" (${r.sourceOutput ?? "result"}).`);
      for (const asset of completed.assets) {
        attachments.push({
          filename: asset.filename,
          assetId: asset.id,
          sizeBytes: asset.sizeBytes ?? 0,
          sniffedMimeType: asset.mimeType,
        });
      }
    }
  }

  if (typeof input.inputMapping?.agentGoalFragment === "string") {
    lines.push(input.inputMapping.agentGoalFragment);
  }

  return {
    instructions: lines.join("\n"),
    attachments,
  };
}
