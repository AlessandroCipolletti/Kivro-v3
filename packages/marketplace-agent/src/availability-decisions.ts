/** §488–§516 — availability decisions the model cannot override. */
export function defaultExecutionMode(): "IMMEDIATE_ONLY" {
  return "IMMEDIATE_ONLY";
}

export function autonomousMayScheduleFuture(input: {
  userApprovedWait: boolean;
  completionFitsDeadline: boolean;
}): boolean {
  return input.userApprovedWait && input.completionFitsDeadline;
}

export function recommendationMayShowFutureOption(): true {
  return true;
}

/** Descriptive text is never an availability signal. */
export function availabilityInferredFromDescription(_description: string): null {
  return null;
}

export function busyWaitFitsPolicy(input: { waitMs: number; maxWaitMs: number }): boolean {
  return input.waitMs >= 0 && input.waitMs <= input.maxWaitMs;
}

export function configurableBusyWaitMs(env: Record<string, string | undefined> = process.env): number {
  const raw = Number(env.KIVRO_AGENT_BUSY_WAIT_MINUTES);
  const minutes = Number.isFinite(raw) && raw > 0 ? raw : 30;
  return minutes * 60_000;
}

export function repairUnavailableStep(input: {
  stepFits: boolean;
  alternativeFits: boolean;
  alternativeWithinBudget: boolean;
  permissionsPreserved: boolean;
}): "KEEP" | "REPLACE" | "PAUSE" {
  if (input.stepFits) {
    return "KEEP";
  }
  if (input.alternativeFits && input.alternativeWithinBudget && input.permissionsPreserved) {
    return "REPLACE";
  }
  return "PAUSE";
}

export function estimateReadyAt(input: { startAt: Date; durationMs: number }): Date {
  return new Date(input.startAt.getTime() + Math.max(0, input.durationMs));
}

export function releaseIfNeverStarts(input: { started: boolean; waitDeadlinePassed: boolean }): "RELEASE" | "HOLD" {
  if (input.started) {
    return "HOLD";
  }
  return input.waitDeadlinePassed ? "RELEASE" : "HOLD";
}
