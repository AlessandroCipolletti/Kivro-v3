import type { JobStatus } from "@kivro/domain";

export type BuyerSchedulingPhase =
  | "IMMEDIATE_QUEUE"
  | "SCHEDULED_FUTURE"
  | "WAITING_FOR_AVAILABILITY"
  | "EXECUTING"
  | "TERMINAL";

/** §464 — distinguish schedule wait from execution queue wait (buyer-visible). */
export function resolveBuyerSchedulingPhase(input: {
  status: JobStatus;
  scheduledRunAt: Date | null;
  now?: Date;
}): BuyerSchedulingPhase {
  const now = input.now ?? new Date();
  if (
    input.status === "COMPLETED" ||
    input.status === "CANCELLED" ||
    input.status === "EXPIRED" ||
    input.status === "REFUNDED" ||
    input.status === "REJECTED" ||
    input.status.startsWith("FAILED_")
  ) {
    return "TERMINAL";
  }
  if (
    input.status === "STARTING" ||
    input.status === "RUNNING" ||
    input.status === "DISPATCHED" ||
    input.status === "ACCEPTED" ||
    input.status === "UPLOADING_RESULT" ||
    input.status.includes("PAUSE")
  ) {
    return "EXECUTING";
  }
  if (input.status === "SCHEDULED") {
    if (input.scheduledRunAt && input.scheduledRunAt.getTime() > now.getTime()) {
      return "SCHEDULED_FUTURE";
    }
    return "WAITING_FOR_AVAILABILITY";
  }
  if (input.status === "QUEUED") {
    return "IMMEDIATE_QUEUE";
  }
  return "IMMEDIATE_QUEUE";
}
