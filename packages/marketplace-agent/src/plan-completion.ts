export type PlanCompletionStep = {
  durationMinutes: number;
  waitUntilEligibleMinutes?: number;
  parallelGroup?: string;
};

/** §515 — completion includes queue and schedule wait, and parallel steps overlap. */
export function estimatePlanCompletionMinutes(steps: PlanCompletionStep[]): {
  minMinutes: number;
  maxMinutes: number;
} {
  const groups = new Map<string, number>();
  steps.forEach((step, index) => {
    const key = step.parallelGroup ?? `serial-${index}`;
    const span = Math.max(0, step.durationMinutes) + Math.max(0, step.waitUntilEligibleMinutes ?? 0);
    groups.set(key, Math.max(groups.get(key) ?? 0, span));
  });
  const raw = [...groups.values()].reduce((sum, minutes) => sum + minutes, 0);
  const minMinutes = Math.ceil(raw / 5) * 5;
  const maxMinutes = minMinutes + Math.max(10, Math.ceil(minMinutes * 0.25 / 5) * 5);
  return { minMinutes, maxMinutes };
}
