export type PlanTimingStep = {
  label: string;
  priceCents: number;
  availableNow: boolean;
  nextAvailableAt?: string | null;
  durationMinutes: number | null;
};

/** §513 — timing is visible on the plan before the buyer approves it. */
export function formatPlanTiming(
  steps: PlanTimingStep[],
  completion: { minMinutes: number; maxMinutes: number },
): { lines: string[]; totalCents: number; completionLabel: string } {
  const lines = steps.map((step, index) => {
    const price = `$${(step.priceCents / 100).toFixed(2)}`;
    const when = step.availableNow
      ? "Available now"
      : step.nextAvailableAt
        ? `Available at ${step.nextAvailableAt}`
        : "Availability unknown";
    const runtime =
      step.durationMinutes != null && step.durationMinutes > 0
        ? step.availableNow
          ? `~${step.durationMinutes} min`
          : `~${step.durationMinutes} min after start`
        : "runtime not published";
    return `${index + 1}. ${step.label} — ${price} — ${when} — ${runtime}`;
  });
  return {
    lines,
    totalCents: steps.reduce((sum, step) => sum + step.priceCents, 0),
    completionLabel: `Estimated completion ~${completion.minMinutes}–${completion.maxMinutes} min`,
  };
}
