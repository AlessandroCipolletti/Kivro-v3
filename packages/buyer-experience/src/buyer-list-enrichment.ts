import type { JobStatus } from "@kivro/domain";
import { resolveBuyerLegalActions, type BuyerLegalAction } from "./legal-actions.js";
import { resolveBuyerSchedulingPhase } from "@kivro/job-scheduling";

/** BUYERUX-042/043 — list row semantics derived from authoritative job state. */
export function enrichBuyerJobListRow(input: {
  status: JobStatus;
  failureCode?: string | null;
  scheduledRunAt?: Date | null;
}): {
  schedulingPhase: ReturnType<typeof resolveBuyerSchedulingPhase>;
  legalActions: BuyerLegalAction[];
  needsAttention: boolean;
} {
  const schedulingPhase = resolveBuyerSchedulingPhase({
    status: input.status,
    scheduledRunAt: input.scheduledRunAt ?? null,
  });
  const legalActions = resolveBuyerLegalActions({
    status: input.status,
    failureCode: input.failureCode,
    schedulingPhase,
    resultAvailable: input.status === "COMPLETED",
  });
  const needsAttention =
    input.status === "EXPIRED" ||
    input.status === "WORKER_OFFLINE" ||
    input.failureCode === "SCHEDULE_WAIT_EXCEEDED" ||
    input.failureCode === "HARD_DEADLINE_EXCEEDED";
  return { schedulingPhase, legalActions, needsAttention };
}
