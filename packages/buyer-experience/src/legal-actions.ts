import type { JobStatus } from "@kivro/domain";

export type BuyerLegalAction = "cancel" | "wait" | "request_refund_review" | "download_results" | "none";

/** BUYERUX-007/026/039/043 — server-derived legal actions (not UI-only). */
export function resolveBuyerLegalActions(input: {
  status: JobStatus;
  failureCode?: string | null;
  schedulingPhase: string;
  resultAvailable?: boolean;
}): BuyerLegalAction[] {
  const actions: BuyerLegalAction[] = [];
  const cancellable = new Set<JobStatus>([
    "SCHEDULED",
    "PAYMENT_RESERVED",
    "QUEUED",
    "DISPATCHED",
    "ACCEPTED",
  ]);
  if (cancellable.has(input.status)) {
    actions.push("cancel");
  }
  if (
    input.status === "SCHEDULED" ||
    input.status === "QUEUED" ||
    input.status === "WORKER_OFFLINE"
  ) {
    actions.push("wait");
  }
  if (input.status === "WORKER_OFFLINE" && input.schedulingPhase !== "EXECUTING") {
    actions.push("request_refund_review");
  }
  if (
    input.status === "EXPIRED" ||
    input.failureCode === "SCHEDULE_WAIT_EXCEEDED" ||
    input.failureCode === "HARD_DEADLINE_EXCEEDED" ||
    input.failureCode === "MISSED_EXECUTION_WINDOW"
  ) {
    actions.push("request_refund_review");
  }
  if (input.status === "COMPLETED" && input.resultAvailable) {
    actions.push("download_results");
  }
  if (input.schedulingPhase === "WAITING_FOR_AVAILABILITY" && input.status === "SCHEDULED") {
    actions.push("wait");
  }
  return actions.length > 0 ? actions : ["none"];
}
