import { assessHardDeliveryDeadline, type HardDeadlineAssessment } from "./deadline-feasibility.js";

/** BUYERUX-006 — orchestration plan must fit buyer hard deadline (deterministic). */
export function assessOrchestrationPlanHardDeadline(input: {
  hardDeliveryDeadlineAt: Date;
  stepEstimatedDurationMinutes: number[];
  now?: Date;
}): HardDeadlineAssessment {
  const totalMinutes = input.stepEstimatedDurationMinutes.reduce(
    (sum, n) => sum + (Number.isFinite(n) && n > 0 ? n : 0),
    0,
  );
  return assessHardDeliveryDeadline({
    now: input.now,
    hardDeliveryDeadlineAt: input.hardDeliveryDeadlineAt,
    estimatedDurationMinutes: totalMinutes > 0 ? totalMinutes : null,
  });
}
