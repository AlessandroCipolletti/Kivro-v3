import type { BuyerConstraints } from "@kivro/marketplace";
import { extractConstraintsFromText } from "@kivro/marketplace";

/** §146 — platform-owned inference; deterministic path is always available. */
export type PlatformIntent = {
  intentLabel: string;
  constraints: BuyerConstraints;
};

export interface PlatformInferencePort {
  parseGoal(goal: string, uiConstraints?: Partial<BuyerConstraints>): Promise<PlatformIntent>;
}

export class DeterministicPlatformInference implements PlatformInferencePort {
  async parseGoal(goal: string, uiConstraints?: Partial<BuyerConstraints>): Promise<PlatformIntent> {
    const fromText = extractConstraintsFromText(goal);
    const constraints = { ...fromText, ...uiConstraints };
    const intentLabel = inferIntentLabel(goal);
    return { intentLabel, constraints };
  }
}

function inferIntentLabel(goal: string): string {
  const lower = goal.toLowerCase();
  if (/\bcompetitor|\bresearch|\banaly/.test(lower)) {
    return "research_and_report";
  }
  if (/\bpdf|\breport/.test(lower)) {
    return "document_generation";
  }
  return "general_marketplace_search";
}

let cached: PlatformInferencePort | undefined;

export function getPlatformInference(): PlatformInferencePort {
  if (!cached) {
    cached = new DeterministicPlatformInference();
  }
  return cached;
}
