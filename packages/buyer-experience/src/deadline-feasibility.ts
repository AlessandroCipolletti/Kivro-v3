/** BUYERUX-004..006 — hard delivery deadline feasibility (deterministic policy). */
export type HardDeadlineAssessment =
  | { feasible: true; warning?: string }
  | { feasible: false; reason: string; code: "DEADLINE_INFEASIBLE" | "DEADLINE_PAST" };

export function assessHardDeliveryDeadline(input: {
  now?: Date;
  hardDeliveryDeadlineAt?: Date | null;
  scheduledRunAt?: Date | null;
  estimatedDurationMinutes?: number | null;
}): HardDeadlineAssessment {
  const now = input.now ?? new Date();
  if (!input.hardDeliveryDeadlineAt) {
    return { feasible: true };
  }
  const deadline = input.hardDeliveryDeadlineAt;
  if (deadline.getTime() <= now.getTime()) {
    return { feasible: false, reason: "Delivery deadline is already in the past.", code: "DEADLINE_PAST" };
  }
  const estMinutes = input.estimatedDurationMinutes ?? null;
  const earliestStart = input.scheduledRunAt && input.scheduledRunAt.getTime() > now.getTime()
    ? input.scheduledRunAt
    : now;
  if (estMinutes != null && Number.isFinite(estMinutes) && estMinutes > 0) {
    const projectedEnd = new Date(earliestStart.getTime() + estMinutes * 60_000);
    if (projectedEnd.getTime() > deadline.getTime()) {
      return {
        feasible: false,
        reason:
          "Current schedule and published duration estimate cannot meet your delivery deadline.",
        code: "DEADLINE_INFEASIBLE",
      };
    }
  }
  if (input.scheduledRunAt && input.scheduledRunAt.getTime() > deadline.getTime()) {
    return {
      feasible: false,
      reason: "Scheduled earliest run is after your delivery deadline.",
      code: "DEADLINE_INFEASIBLE",
    };
  }
  if (estMinutes == null) {
    return {
      feasible: true,
      warning: "Duration estimate is unknown; deadline compatibility cannot be guaranteed.",
    };
  }
  return { feasible: true };
}
